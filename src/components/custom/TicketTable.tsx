import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

type Ticket = {
  id: number;
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  assignedTo: string;
};

const tickets: Ticket[] = [
  {
    id: 1001,
    title: "Internet connection not working",
    category: "Internet",
    priority: "High",
    assignedTo: "Ram Shrestha",
  },
  {
    id: 1002,
    title: "IPTV channels unavailable",
    category: "IPTV",
    priority: "Critical",
    assignedTo: "Unassigned",
  },
  {
    id: 1003,
    title: "Slow internet connection",
    category: "Internet",
    priority: "Medium",
    assignedTo: "Sita Thapa",
  },
  {
    id: 1004,
    title: "Router configuration issue",
    category: "Internet",
    priority: "Low",
    assignedTo: "Unassigned",
  },
  {
    id: 1005,
    title: "IPTV signal problem",
    category: "IPTV",
    priority: "High",
    assignedTo: "Hari Gurung",
  },
  {
    id: 1006,
    title: "Internet speed issue",
    category: "Internet",
    priority: "Critical",
    assignedTo: "Unassigned",
  },
  {
    id: 1007,
    title: "IPTV remote not working",
    category: "IPTV",
    priority: "Medium",
    assignedTo: "Sita Thapa",
  },
  {
    id: 1008,
    title: "Router replacement request",
    category: "Internet",
    priority: "Low",
    assignedTo: "Unassigned",
  },
];

const ITEMS_PER_PAGE = 4;

const priorityOrder: Record<Ticket["priority"], number> = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

const TicketTable = () => {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesPriority =
      priorityFilter === "all" ||
      ticket.priority.toLowerCase() === priorityFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      ticket.category.toLowerCase() === categoryFilter;

    return matchesPriority && matchesCategory;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const priorityDifference =
      priorityOrder[a.priority] - priorityOrder[b.priority];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return a.category.localeCompare(b.category);
  });

  const totalPages = Math.ceil(
    sortedTickets.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedTickets = sortedTickets.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [priorityFilter, categoryFilter]);

  const handleForward = (
    event: React.MouseEvent<HTMLButtonElement>,
    ticketId: number
  ) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Forward ticket:", ticketId);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={priorityFilter}
          onValueChange={(value) =>
            setPriorityFilter(value ?? "all")
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(value) =>
            setCategoryFilter(value ?? "all")
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Category" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="internet">Internet</SelectItem>
            <SelectItem value="iptv">IPTV</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead className="text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTickets.length > 0 ? (
              paginatedTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="block font-medium"
                    >
                      #{ticket.id}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="block"
                    >
                      {ticket.title}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="block"
                    >
                      {ticket.category}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="block"
                    >
                      <span
                        className={
                          ticket.priority === "Critical"
                            ? "font-semibold text-destructive"
                            : ticket.priority === "High"
                              ? "font-semibold"
                              : ""
                        }
                      >
                        {ticket.priority}
                      </span>
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="block"
                    >
                      {ticket.assignedTo}
                    </Link>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) =>
                        handleForward(event, ticket.id)
                      }
                    >
                      Forward
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center"
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–
            {Math.min(
              startIndex + ITEMS_PER_PAGE,
              sortedTickets.length
            )}{" "}
            of {sortedTickets.length}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => page - 1)
              }
            >
              Previous
            </Button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={
                  currentPage === page
                    ? "default"
                    : "outline"
                }
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => page + 1)
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTable;
