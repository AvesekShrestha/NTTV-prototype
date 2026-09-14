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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  // If ticket.assignedTo is set use that; otherwise collect all unique agents
  // from the latest dispatch's recipients (team dispatch case).
  const getAssignedAgentsLabel = (t: (typeof tickets)[0]): string => {
    if (t.assignedTo) return getUsername(t.assignedTo);
    const lastDispatch = t.dispatches?.at(-1);
    if (!lastDispatch?.recipients?.length) return "—";
    const names = [...new Set(lastDispatch.recipients.map((r) => getUsername(r.agentId)))];
    return names.join(", ");
  };

  // If ticket.assignedTeamId is set use that; otherwise derive from assignedTo's team.
  const getResolvedTeamName = (t: (typeof tickets)[0]): string => {
    if (t.assignedTeamId) return getTeamName(t.assignedTeamId);
    if (t.assignedTo) {
      const team = teams.find((tm) => tm.members?.includes(t.assignedTo!));
      return team ? team.name : "—";
    }
    return "—";
  };

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
      const at = tickets.filter(
        (t) =>
          t.assignedTo === agent.id ||
          t.dispatches?.some((d) =>
            d.recipients?.some((r) => r.agentId === agent.id)
          )
      );
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
      getAssignedAgentsLabel(t),
      getResolvedTeamName(t),
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
    const doc = new jsPDF({ orientation: "portrait" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentW = pageW - margin * 2;
    const brandColor: [number, number, number] = [0, 59, 122];
    const generated = new Date().toLocaleString();

    // ── cover header ──────────────────────────────────────────────────────────
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Nepal Telecom — Detailed Ticket Report", margin, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${generated}  |  ${filteredTickets.length} ticket(s)`,
      pageW - margin,
      12,
      { align: "right" }
    );

    // helper: add footer with page number
    const addFooter = () => {
      const pages = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 6, { align: "right" });
        doc.text("Nepal Telecom — Confidential", margin, pageH - 6);
      }
    };

    // helper: ensure there's enough space, add new page if needed
    const ensureSpace = (needed: number, currentY: number): number => {
      if (currentY + needed > pageH - 18) {
        doc.addPage();
        return 26;
      }
      return currentY;
    };

    let y = 26;

    // ── per-ticket sections ───────────────────────────────────────────────────
    filteredTickets.forEach((t, tIdx) => {
      const resolutionMs = t.resolvedAt
        ? new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()
        : 0;

      // section separator / page break
      if (tIdx > 0) {
        y = ensureSpace(40, y);
        // light divider
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y - 4, pageW - margin, y - 4);
      }

      // ── ticket title bar ──────────────────────────────────────────────────
      y = ensureSpace(14, y);
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(margin, y, contentW, 12, 2, 2, "F");
      doc.setTextColor(...brandColor);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`#${tIdx + 1}  ${t.title}`, margin + 3, y + 8);

      // status + priority tags on right
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`${t.status}  •  ${t.priority}`, pageW - margin - 3, y + 8, { align: "right" });
      y += 16;

      // ── info table (left half) + description (right half) ─────────────────
      y = ensureSpace(32, y);
      const halfW = contentW / 2 - 3;

      // left: key-value info
      autoTable(doc, {
        startY: y,
        tableWidth: halfW,
        margin: { left: margin },
        head: [["Field", "Value"]],
        body: [
          ["ID", t.id],
          ["Category", getCategoryName(t.category)],
          ["Created By", getUsername(t.createdBy)],
          ["Assigned To", getAssignedAgentsLabel(t)],
          ["Team", getResolvedTeamName(t)],
          ["Level", t.level ?? "—"],
          ["Created At", new Date(t.createdAt).toLocaleString()],
          ["Updated At", new Date(t.updatedAt).toLocaleString()],
          ["Resolved At", t.resolvedAt ? new Date(t.resolvedAt).toLocaleString() : "—"],
          ["Resolution Time", formatDuration(resolutionMs)],
        ],
        theme: "grid",
        headStyles: { fillColor: brandColor, fontSize: 7, cellPadding: 2 },
        bodyStyles: { fontSize: 7, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 28, fillColor: [248, 250, 252] } },
      });
      const leftTableBottom = (doc as any).lastAutoTable.finalY;

      // right: description
      const descX = margin + halfW + 6;
      const descY = y;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("DESCRIPTION", descX, descY + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      if (t.description) {
        const lines = doc.splitTextToSize(t.description, halfW - 4);
        doc.text(lines, descX, descY + 11);
      } else {
        doc.setTextColor(160, 160, 160);
        doc.text("No description provided.", descX, descY + 11);
      }

      y = Math.max(leftTableBottom, descY + 32) + 6;

      // ── activity timeline ─────────────────────────────────────────────────
      if (t.activities && t.activities.length > 0) {
        y = ensureSpace(20, y);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text("ACTIVITY TIMELINE", margin, y);
        y += 3;

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [["#", "Event", "Performed By", "Timestamp", "From → To"]],
          body: t.activities.map((act, i) => {
            const fromTo = [
              act.fromTeamId ? `${getTeamName(act.fromTeamId)} → ${getTeamName(act.toTeamId)}` : "",
              act.fromUserId ? `${getUsername(act.fromUserId)} → ${getUsername(act.toUserId)}` : "",
            ].filter(Boolean).join("  ");
            return [
              String(i + 1),
              act.type.replace("_", " "),
              getUsername(act.performedBy),
              new Date(act.timestamp).toLocaleString(),
              fromTo || "—",
            ];
          }),
          theme: "striped",
          headStyles: { fillColor: [71, 85, 105], fontSize: 7, cellPadding: 2 },
          bodyStyles: { fontSize: 7, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 28, fontStyle: "bold" },
            3: { cellWidth: 42 },
          },
        });
        y = (doc as any).lastAutoTable.finalY + 6;
      }

      // ── dispatch history ──────────────────────────────────────────────────
      if (t.dispatches && t.dispatches.length > 0) {
        y = ensureSpace(20, y);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text("DISPATCH HISTORY", margin, y);
        y += 3;

        const dispatchRows: (string | number)[][] = [];
        t.dispatches.forEach((d, di) => {
          // dispatch header row
          dispatchRows.push([
            `Dispatch #${di + 1}`,
            `By: ${getUsername(d.dispatchedBy)}`,
            new Date(d.dispatchedAt).toLocaleString(),
            "",
          ]);
          // recipient rows
          (d.recipients ?? []).forEach((r) => {
            const status = r.acceptedAt ? "Accepted" : r.rejectedAt ? "Rejected" : "Pending";
            dispatchRows.push(["", `  • ${getUsername(r.agentId)}`, "", status]);
          });
        });

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [["Dispatch", "Agent / Detail", "Dispatched At", "Status"]],
          body: dispatchRows,
          theme: "striped",
          headStyles: { fillColor: [71, 85, 105], fontSize: 7, cellPadding: 2 },
          bodyStyles: { fontSize: 7, cellPadding: 2 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 24 },
            2: { cellWidth: 42 },
            3: { cellWidth: 20 },
          },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      } else {
        y += 4;
      }
    });

    addFooter();
    doc.save("detailed_report.pdf");
  };

  // ── render ─────────────────────────────────────────────────────────────────
  const statusBadge: Record<string, string> = {
    RESOLVED: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    NEW: "bg-sky-50 text-sky-700 border border-sky-200/60",
    ASSIGNED: "bg-blue-50 text-blue-700 border border-blue-200/60",
    INPROCESS: "bg-amber-50 text-amber-700 border border-amber-200/60",
    FORWARDED: "bg-purple-50 text-purple-700 border border-purple-200/60",
    ESCALATED: "bg-red-50 text-red-700 border border-red-200/60",
  };

  const priorityBadge: Record<string, string> = {
    CRITICAL: "bg-rose-50 text-rose-700 border border-rose-200/60",
    HIGH: "bg-amber-50 text-amber-700 border border-amber-200/60",
    MEDIUM: "bg-blue-50 text-blue-700 border border-blue-200/60",
    LOW: "bg-slate-100 text-slate-600 border border-slate-200/60",
  };

  const activityLabel: Record<string, string> = {
    CREATED: "Created",
    DISPATCHED: "Dispatched",
    FORWARDED: "Forwarded",
    ESCALATED: "Escalated",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    REOPENED: "Reopened",
  };

  const activityColor: Record<string, string> = {
    CREATED: "bg-slate-400",
    DISPATCHED: "bg-blue-500",
    FORWARDED: "bg-purple-500",
    ESCALATED: "bg-red-500",
    IN_PROGRESS: "bg-amber-500",
    RESOLVED: "bg-emerald-500",
    REOPENED: "bg-slate-500",
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
          {/* Overall stats + download buttons on same row */}
          <div className="flex items-start justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
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
            <div className="flex gap-2 shrink-0 pt-1">
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

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">{filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""} found</p>
            <div className="flex gap-2">
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

          {/* Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="w-8 px-3 py-3" />
                  {["Title", "Status", "Priority", "Category", "Assigned To", "Team", "Created At", "Resolved At"].map((h) => (
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
                  filteredTickets.map((t) => {
                    const isOpen = expandedId === t.id;
                    const resolutionMs = t.resolvedAt
                      ? new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()
                      : 0;
                    return (
                      <>
                        {/* ── summary row ── */}
                        <tr
                          key={t.id}
                          onClick={() => setExpandedId(isOpen ? null : t.id)}
                          className={`border-b border-slate-100 cursor-pointer transition-colors ${
                            isOpen ? "bg-slate-50" : "hover:bg-slate-50"
                          }`}
                        >
                          {/* chevron */}
                          <td className="px-3 py-3 text-slate-400">
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isOpen ? "rotate-90" : ""
                              }`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 max-w-52 truncate">{t.title}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[t.status] ?? "bg-slate-100 text-slate-600"}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge[t.priority] ?? "bg-slate-100 text-slate-600"}`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{getCategoryName(t.category)}</td>
                          <td className="px-4 py-3 text-slate-600">{getAssignedAgentsLabel(t)}</td>
                          <td className="px-4 py-3 text-slate-600">{getResolvedTeamName(t)}</td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {t.resolvedAt ? new Date(t.resolvedAt).toLocaleDateString() : "—"}
                          </td>
                        </tr>

                        {/* ── expanded detail panel ── */}
                        {isOpen && (
                          <tr key={`${t.id}-detail`} className="bg-slate-50 border-b border-slate-200">
                            <td colSpan={9} className="px-6 py-5">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* LEFT: ticket metadata */}
                                <div className="flex flex-col gap-4">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ticket Info</p>
                                    <div className="flex flex-col gap-2">
                                      {[
                                        ["ID", t.id],
                                        ["Created By", getUsername(t.createdBy)],
                                        ["Level", t.level ?? "—"],
                                        ["Category", getCategoryName(t.category)],
                                        ["Created At", new Date(t.createdAt).toLocaleString()],
                                        ["Updated At", new Date(t.updatedAt).toLocaleString()],
                                        ["Resolved At", t.resolvedAt ? new Date(t.resolvedAt).toLocaleString() : "—"],
                                        ["Resolution Time", formatDuration(resolutionMs)],
                                      ].map(([label, val]) => (
                                        <div key={label} className="flex gap-2 text-xs">
                                          <span className="text-slate-400 w-28 shrink-0">{label}</span>
                                          <span className="text-slate-700 font-medium break-all">{val}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {t.description && (
                                    <div>
                                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{t.description}</p>
                                    </div>
                                  )}
                                </div>

                                {/* MIDDLE: activity timeline */}
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Activity Timeline</p>
                                  {(!t.activities || t.activities.length === 0) ? (
                                    <p className="text-xs text-slate-400">No activity recorded.</p>
                                  ) : (
                                    <div className="relative flex flex-col gap-0">
                                      {t.activities.map((act, idx) => (
                                        <div key={act.id} className="flex gap-3">
                                          {/* timeline line + dot */}
                                          <div className="flex flex-col items-center">
                                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${activityColor[act.type] ?? "bg-slate-400"}`} />
                                            {idx < t.activities.length - 1 && (
                                              <div className="w-px flex-1 bg-slate-200 mt-1" />
                                            )}
                                          </div>
                                          {/* content */}
                                          <div className="pb-4">
                                            <p className="text-xs font-semibold text-slate-700">{activityLabel[act.type] ?? act.type}</p>
                                            <p className="text-[11px] text-slate-400">{new Date(act.timestamp).toLocaleString()}</p>
                                            <p className="text-[11px] text-slate-500">By: {getUsername(act.performedBy)}</p>
                                            {act.fromTeamId && (
                                              <p className="text-[11px] text-slate-400">
                                                {getTeamName(act.fromTeamId)} → {getTeamName(act.toTeamId)}
                                              </p>
                                            )}
                                            {act.fromUserId && (
                                              <p className="text-[11px] text-slate-400">
                                                {getUsername(act.fromUserId)} → {getUsername(act.toUserId)}
                                              </p>
                                            )}
                                            {act.note && (
                                              <p className="text-[11px] text-slate-500 italic mt-0.5">{act.note}</p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* RIGHT: dispatch history */}
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Dispatch History</p>
                                  {(!t.dispatches || t.dispatches.length === 0) ? (
                                    <p className="text-xs text-slate-400">No dispatches recorded.</p>
                                  ) : (
                                    <div className="flex flex-col gap-4">
                                      {t.dispatches.map((d, di) => (
                                        <div key={d.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-600">Dispatch #{di + 1}</span>
                                            <span className="text-slate-400">{new Date(d.dispatchedAt).toLocaleString()}</span>
                                          </div>
                                          <p className="text-slate-500 mb-2">By: <span className="font-medium text-slate-700">{getUsername(d.dispatchedBy)}</span></p>
                                          <div className="flex flex-col gap-1">
                                            {d.recipients?.map((r) => (
                                              <div key={r.id} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#003b7a]/50" />
                                                <span className="text-slate-600">{getUsername(r.agentId)}</span>
                                                {r.acceptedAt && <span className="text-emerald-600 text-[10px] ml-auto">Accepted</span>}
                                                {r.rejectedAt && <span className="text-red-500 text-[10px] ml-auto">Rejected</span>}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
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
