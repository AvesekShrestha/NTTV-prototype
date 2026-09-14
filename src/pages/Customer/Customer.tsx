import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, Clock, Plus, Send, Timer } from "lucide-react";
import DashboardCard from "@/components/custom/DashboardCard";
import ComplaintTable from "@/components/custom/ComplaintTable";
import Searchbar from "@/components/custom/Searchbar";
import { getMyTickets } from "@/lib/storage";

const SERVICE_TYPE_OPTIONS = [
    { label: "Service", value: "all" },
    { label: "IPTV", value: "IPTV" },
    { label: "NTTV", value: "NTTV" },
    { label: "SIM", value: "SIM" },
    { label: "FTTH", value: "FTTH" },
    { label: "Broadband", value: "BROADBAND" },
    { label: "Landline", value: "LANDLINE" },
    { label: "Other", value: "OTHER" },
];

const Customer = () => {
    const [tickets] = useState(() => getMyTickets());
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [serviceType, setServiceType] = useState("all");

    const filteredTickets = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return tickets.filter((ticket) => {
            const matchesSearch =
                !query ||
                ticket.id.toLowerCase().includes(query) ||
                ticket.title.toLowerCase().includes(query) ||
                ticket.description.toLowerCase().includes(query);

            const matchesStatus = status === "all" || ticket.status === status;

            const matchesServiceType =
                serviceType === "all" || ticket.serviceType === serviceType;

            return matchesSearch && matchesStatus && matchesServiceType;
        });
    }, [tickets, searchQuery, status, serviceType]);

    return (
        <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                        My Dashboard
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                        Track your service complaints and their resolution progress.
                    </p>
                </div>

                <div
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003b7a] text-white rounded-lg text-sm font-medium hover:bg-[#002f61] transition-colors shadow-sm cursor-pointer"
                    onClick={() => navigate("/newComplaint")}
                >
                    <Plus className="w-4 h-4" />
                    New Complaint
                </div>
            </div>

            {/* Metric Cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardCard title="Total Complaints" value={tickets.length} icon={Send} />

                <DashboardCard
                    title="Open"
                    value={tickets.filter((t) => t.status === "NEW" || t.status === "ASSIGNED").length}
                    icon={Clock}
                />

                <DashboardCard
                    title="In Progress"
                    value={tickets.filter((t) => t.status === "INPROCESS").length}
                    icon={Timer}
                />

                <DashboardCard
                    title="Resolved"
                    value={tickets.filter((t) => t.status === "RESOLVED").length}
                    icon={CircleCheck}
                />
            </section>

            {/* Filters */}
            <section className="flex flex-col gap-4">
                <Searchbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search your complaints..."
                    filters={[
                        {
                            key: "status",
                            value: status,
                            onChange: setStatus,
                            options: [
                                { label: "Status", value: "all" },
                                { label: "New", value: "NEW" },
                                { label: "Assigned", value: "ASSIGNED" },
                                { label: "In Progress", value: "INPROCESS" },
                                { label: "Forwarded", value: "FORWARDED" },
                                { label: "Escalated", value: "ESCALATED" },
                                { label: "Resolved", value: "RESOLVED" },
                            ],
                        },
                        {
                            key: "serviceType",
                            value: serviceType,
                            onChange: setServiceType,
                            options: SERVICE_TYPE_OPTIONS,
                        },
                    ]}
                />
            </section>

            <ComplaintTable tickets={filteredTickets} />
        </div>
    );
};

export default Customer;