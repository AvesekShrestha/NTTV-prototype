import { useState, useMemo } from "react";
import { getTickets } from "@/lib/storage";
import { getUsers } from "@/lib/storage";
import { getTeams } from "@/lib/storage";
import { getCategories } from "@/lib/storage";
import { Download, FileText, ClipboardList } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms <= 0) return "—";
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function downloadCSV(filename: string, rows: string[][]): void {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── component ────────────────────────────────────────────────────────────────

const Reports = () => {
  const [activeTab, setActiveTab] = useState<"summary" | "detailed">("summary");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const tickets = useMemo(() => getTickets(), []);
  const users = useMemo(() => getUsers(), []);
  const teams = useMemo(() => getTeams(), []);
  const categories = useMemo(() => getCategories(), []);

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id || c.name === id)?.name ?? id ?? "—";

  const getUsername = (id?: string) =>
    id ? (users.find((u) => u.id === id)?.username ?? id) : "—";

  const getTeamName = (id?: string) =>
    id ? (teams.find((t) => t.id === id)?.name ?? id) : "—";

  // ── filtered tickets for detailed tab ──────────────────────────────────────
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && getCategoryName(t.category) !== categoryFilter) return false;
      if (fromDate && new Date(t.createdAt) < new Date(fromDate)) return false;
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (new Date(t.createdAt) > to) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, categoryFilter, fromDate, toDate]);

  // ── summary metrics ────────────────────────────────────────────────────────
  const resolved = tickets.filter((t) => t.status === "RESOLVED");
  const resolvedDurations = resolved
    .filter((t) => t.resolvedAt)
    .map((t) => new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime());
  const avgResolutionMs =
    resolvedDurations.length > 0
      ? resolvedDurations.reduce((a, b) => a + b, 0) / resolvedDurations.length
      : 0;

  const teamSummary = teams.map((team) => {
    const tt = tickets.filter((t) => t.assignedTeamId === team.id);
    const res = tt.filter((t) => t.status === "RESOLVED");
    const durations = res
      .filter((t) => t.resolvedAt)
      .map((t) => new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime());
    const avg = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
    return { name: team.name, received: tt.length, resolved: res.length, avgTime: avg };
  });

  const categorySummary = categories.map((cat) => {
    const ct = tickets.filter(
      (t) => t.category === cat.id || t.category === cat.name
    );
    const res = ct.filter((t) => t.status === "RESOLVED");
    return { name: cat.name, total: ct.length, resolved: res.length };
  });

  const agentSummary = users
    .filter((u) => u.role === "agent")
    .map((agent) => {
      const at = tickets.filter((t) => t.assignedTo === agent.id);
      const res = at.filter((t) => t.status === "RESOLVED");
      return { name: agent.username, assigned: at.length, resolved: res.length };
    });

  // ── unique filter values ───────────────────────────────────────────────────
  const uniqueStatuses = Array.from(new Set(tickets.map((t) => t.status)));
  const uniqueCategories = Array.from(
    new Set(tickets.map((t) => getCategoryName(t.category)))
  );

  // ── CSV downloads ──────────────────────────────────────────────────────────
  const handleDownloadSummaryCSV = () => {
    const rows: string[][] = [
      ["=== OVERALL ==="],
      ["Total Tickets", String(tickets.length)],
      ["Resolved", String(resolved.length)],
      ["Open", String(tickets.length - resolved.length)],
      ["Avg. Resolution Time", formatDuration(avgResolutionMs)],
      [],
      ["=== TEAMS ==="],
      ["Team", "Received", "Resolved", "Avg. Resolution Time"],
      ...teamSummary.map((r) => [r.name, String(r.received), String(r.resolved), formatDuration(r.avgTime)]),
      [],
      ["=== CATEGORIES ==="],
      ["Category", "Total", "Resolved"],
      ...categorySummary.map((r) => [r.name, String(r.total), String(r.resolved)]),
      [],
      ["=== AGENTS ==="],
      ["Agent", "Assigned", "Resolved"],
      ...agentSummary.map((r) => [r.name, String(r.assigned), String(r.resolved)]),
    ];
    downloadCSV("summary_report.csv", rows);
  };

  const handleDownloadDetailedCSV = () => {
    const headers = [
      "ID", "Title", "Status", "Priority", "Category",
      "Created By", "Assigned To", "Team", "Level",
      "Created At", "Updated At", "Resolved At",
    ];
    const rows = filteredTickets.map((t) => [
      t.id,
      t.title,
      t.status,
      t.priority,
      getCategoryName(t.category),
      getUsername(t.createdBy),
      getUsername(t.assignedTo),
      getTeamName(t.assignedTeamId),
      t.level ?? "—",
      new Date(t.createdAt).toLocaleString(),
      new Date(t.updatedAt).toLocaleString(),
      t.resolvedAt ? new Date(t.resolvedAt).toLocaleString() : "—",
    ]);
    downloadCSV("detailed_report.csv", [headers, ...rows]);
  };

  // ── PDF downloads ──────────────────────────────────────────────────────────
  const handleDownloadSummaryPDF = () => {
    const doc = new jsPDF();
    const generated = new Date().toLocaleString();
    const brandColor: [number, number, number] = [0, 59, 122];

    // Header
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, 210, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Nepal Telecom — Summary Report", 14, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${generated}`, 196, 12, { align: "right" });

    doc.setTextColor(30, 30, 30);
    let y = 26;

    // Overall stats
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Overall", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Total Tickets", String(tickets.length)],
        ["Resolved", String(resolved.length)],
        ["Open", String(tickets.length - resolved.length)],
        ["Avg. Resolution Time", formatDuration(avgResolutionMs)],
      ],
      theme: "striped",
      headStyles: { fillColor: brandColor, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    // Teams
    doc.setFont("helvetica", "bold");
    doc.text("By Team", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Team", "Received", "Resolved", "Avg. Time"]],
      body: teamSummary.map((r) => [r.name, r.received, r.resolved, formatDuration(r.avgTime)]),
      theme: "striped",
      headStyles: { fillColor: brandColor, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    // Categories
    doc.setFont("helvetica", "bold");
    doc.text("By Category", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Category", "Total", "Resolved", "Unresolved"]],
      body: categorySummary.map((r) => [r.name, r.total, r.resolved, r.total - r.resolved]),
      theme: "striped",
      headStyles: { fillColor: brandColor, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    // Agents
    doc.setFont("helvetica", "bold");
    doc.text("By Agent", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Agent", "Assigned", "Resolved", "Resolution Rate"]],
      body: agentSummary.map((r) => [
        r.name, r.assigned, r.resolved,
        r.assigned > 0 ? `${Math.round((r.resolved / r.assigned) * 100)}%` : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: brandColor, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    doc.save("summary_report.pdf");
  };

  const handleDownloadDetailedPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const generated = new Date().toLocaleString();
    const brandColor: [number, number, number] = [0, 59, 122];

    doc.setFillColor(...brandColor);
    doc.rect(0, 0, 297, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Nepal Telecom — Detailed Ticket Report", 14, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${generated}  |  ${filteredTickets.length} tickets`, 283, 12, { align: "right" });

    autoTable(doc, {
      startY: 24,
      head: [["Title", "Status", "Priority", "Category", "Created By", "Assigned To", "Team", "Created At", "Resolved At"]],
      body: filteredTickets.map((t) => [
        t.title,
        t.status,
        t.priority,
        getCategoryName(t.category),
        getUsername(t.createdBy),
        getUsername(t.assignedTo),
        getTeamName(t.assignedTeamId),
        new Date(t.createdAt).toLocaleDateString(),
        t.resolvedAt ? new Date(t.resolvedAt).toLocaleDateString() : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: brandColor, fontSize: 7.5 },
      bodyStyles: { fontSize: 7.5 },
      columnStyles: { 0: { cellWidth: 50 } },
      margin: { left: 14, right: 14 },
    });

    doc.save("detailed_report.pdf");
  };

  // ── render ─────────────────────────────────────────────────────────────────
  const statusBadge: Record<string, string> = {
    RESOLVED: "bg-emerald-50 text-emerald-700",
    NEW: "bg-sky-50 text-sky-700",
    ASSIGNED: "bg-blue-50 text-blue-700",
    INPROCESS: "bg-amber-50 text-amber-700",
    FORWARDED: "bg-purple-50 text-purple-700",
    ESCALATED: "bg-red-50 text-red-700",
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Reports
        </h1>
        <p className="text-sm font-medium text-slate-500">
          View, filter, and download summary or detailed ticket reports.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          id="tab-summary"
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "summary"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Summary
        </button>
        <button
          id="tab-detailed"
          onClick={() => setActiveTab("detailed")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "detailed"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          Detailed
        </button>
      </div>

      {/* ── SUMMARY TAB ── */}
      {activeTab === "summary" && (
        <div className="flex flex-col gap-6">
          {/* Overall stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Tickets", value: tickets.length },
              { label: "Resolved", value: resolved.length },
              { label: "Open", value: tickets.length - resolved.length },
              { label: "Avg. Resolution", value: formatDuration(avgResolutionMs) },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Team summary table */}
          <Section title="By Team">
            <Table
              headers={["Team", "Received", "Resolved", "Avg. Resolution Time"]}
              rows={teamSummary.map((r) => [
                r.name,
                String(r.received),
                String(r.resolved),
                formatDuration(r.avgTime),
              ])}
            />
          </Section>

          {/* Category summary */}
          <Section title="By Category">
            <Table
              headers={["Category", "Total", "Resolved", "Unresolved"]}
              rows={categorySummary.map((r) => [
                r.name,
                String(r.total),
                String(r.resolved),
                String(r.total - r.resolved),
              ])}
            />
          </Section>

          {/* Agent summary */}
          <Section title="By Agent">
            <Table
              headers={["Agent", "Assigned", "Resolved", "Resolution Rate"]}
              rows={agentSummary.map((r) => [
                r.name,
                String(r.assigned),
                String(r.resolved),
                r.assigned > 0
                  ? `${Math.round((r.resolved / r.assigned) * 100)}%`
                  : "—",
              ])}
            />
          </Section>

          <div className="flex justify-end gap-2">
            <button
              id="download-summary-pdf"
              onClick={handleDownloadSummaryPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              id="download-summary-csv"
              onClick={handleDownloadSummaryCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#003b7a] text-white text-sm font-medium rounded-lg hover:bg-[#002d60] transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      )}

      {/* ── DETAILED TAB ── */}
      {activeTab === "detailed" && (
        <div className="flex flex-col gap-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">From</label>
              <input
                id="filter-from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#003b7a]/20 focus:border-[#003b7a]/40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">To</label>
              <input
                id="filter-to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#003b7a]/20 focus:border-[#003b7a]/40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Status</label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#003b7a]/20 focus:border-[#003b7a]/40 bg-white"
              >
                <option value="ALL">All Statuses</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Category</label>
              <select
                id="filter-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#003b7a]/20 focus:border-[#003b7a]/40 bg-white"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => { setFromDate(""); setToDate(""); setStatusFilter("ALL"); setCategoryFilter("ALL"); }}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 transition-colors"
            >
              Reset
            </button>
          </div>

          <p className="text-xs text-slate-400">{filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""} found</p>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Title", "Status", "Priority", "Category", "Created By", "Assigned To", "Team", "Created At", "Resolved At"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-400 py-12 text-sm">
                      No tickets match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 max-w-48 truncate">{t.title}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[t.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{t.priority}</td>
                      <td className="px-4 py-3 text-slate-600">{getCategoryName(t.category)}</td>
                      <td className="px-4 py-3 text-slate-600">{getUsername(t.createdBy)}</td>
                      <td className="px-4 py-3 text-slate-600">{getUsername(t.assignedTo)}</td>
                      <td className="px-4 py-3 text-slate-600">{getTeamName(t.assignedTeamId)}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {t.resolvedAt ? new Date(t.resolvedAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <button
              id="download-detailed-pdf"
              onClick={handleDownloadDetailedPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              id="download-detailed-csv"
              onClick={handleDownloadDetailedCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#003b7a] text-white text-sm font-medium rounded-lg hover:bg-[#002d60] transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── sub-components ────────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3">
    <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
    {children}
  </div>
);

const Table = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          {headers.map((h) => (
            <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} className="text-center text-slate-400 py-8 text-sm">
              No data available.
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? "font-medium text-slate-800" : "text-slate-600"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default Reports;
