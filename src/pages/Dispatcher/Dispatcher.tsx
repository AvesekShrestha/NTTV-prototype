import DashboardCard from "@/components/custom/DashboardCard";
import TicketTable from "@/components/custom/TicketTable";

const Dispatcher = () => {
  return (
    <>
      <div className="flex p-10 flex-col">
        <div className="flex flex-row justify-between mb-8">

          <DashboardCard title="New Ticket" count={0} />
          <DashboardCard title="Forwarded" count={0} />
          <DashboardCard title="Unassigned" count={0} />
        </div>

        <TicketTable />

      </div>
    </>

  )
}

export default Dispatcher;
