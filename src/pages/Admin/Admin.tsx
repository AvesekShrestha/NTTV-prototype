import DashboardCard from "@/components/custom/DashboardCard";
import TicketTable from "@/components/custom/TicketTable";

const Admin = () => {
  return (
    <>
      <div className="flex p-10 flex-col">
        <div className="flex flex-row flex-wrap justify-between gap-3 mb-8">
          <DashboardCard title="Something" count={0} />
          <DashboardCard title="Something" count={0} />
          <DashboardCard title="Something" count={0} />

        </div>

        <TicketTable />


      </div>
    </>
  )
}

export default Admin;
