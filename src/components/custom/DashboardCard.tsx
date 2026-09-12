import { Card, CardContent } from "../ui/card";

const DashboardCard = ({ title, count }: { title: string, count: number }) => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col justify-center items-center w-125 h-18">
          <span className=" font-bold">{title}</span>
          <span className="font-bold text-3xl">{count}</span>

        </div>

      </CardContent>
    </Card>
  )
}

export default DashboardCard;
