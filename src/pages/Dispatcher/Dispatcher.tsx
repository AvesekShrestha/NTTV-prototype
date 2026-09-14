import DashboardCard from "@/components/custom/DashboardCard";
import TicketTable from "@/components/custom/TicketTable";
import { User } from "lucide-react";

const Dispatcher = () => {
  return (
    <>
      <div className="flex p-10 flex-col">
        <div className="flex flex-row justify-between mb-8">

          <DashboardCard title="New Ticket" value={0} icon={User} />
          <DashboardCard title="Forwarded" value={0} />
          <DashboardCard title="Unassigned" value={0} />
        </div>

        <TicketTable />

      </div>
    </>

  )
}

export default Dispatcher;
