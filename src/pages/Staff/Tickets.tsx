import Searchbar from "@/components/custom/Searchbar";
import TicketTable from "@/components/custom/TicketTable";
import { getMyTickets } from "@/lib/storage";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Tickets = () => {
  const [tickets] = useState(() => getMyTickets())
  const [searchQuery, setSearchQuery] = useState("")
  const [priority, setPriority] = useState("");
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Tickets
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Organize and manage tickets.
            </p>
          </div>
          <div
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            onClick={() => navigate("/newTicket")}
          >
            <Plus className="w-4 h-4" />
            Create Ticket
          </div>

        </div>

        <section className="flex flex-col gap-4">
          <Searchbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search tickets..."
            filters={[
              {
                key: 'priority',
                value: priority,
                onChange: setPriority,
                options: [
                  { label: 'Priority', value: 'all' },
                  { label: 'Critical', value: 'critical' },
                  { label: 'High', value: 'high' },
                  { label: 'Low', value: 'low' }
                ],
              },
            ]}
          />
        </section>

        <TicketTable tickets={tickets} />
      </div>
    </>
  )

}

export default Tickets;
