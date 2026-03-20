import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Borrower = {
  id: string;
  name: string;
  identificationNumber: string;
  contact?: {
    email?: string;
  };
};

const columns: ColumnDef<Borrower>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "identificationNumber",
    header: "ID Number",
  },
  {
    id: "email",
    header: "Email",
    cell: ({ row }) => <span>{row.original.contact?.email ?? "-"}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="space-x-2">
        <Link
          to={`/borrowers/${row.original.id}`}
          className="text-blue-600 hover:underline"
        >
          View
        </Link>
        <Link
          to={`/borrowers/${row.original.id}/edit`}
          className="text-green-600 hover:underline"
        >
          Edit
        </Link>
      </div>
    ),
  },
];

export function BorrowerList() {
  const { data: borrowers = [], isLoading } = useQuery({
    queryKey: ["borrowers"],
    queryFn: () => apiClient.get("/borrowers").then((r) => r.data),
  });

  const table = useReactTable({
    data: borrowers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="border rounded-md">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Borrowers</h1>
        <Button asChild>
          <Link to="/borrowers/new">Add Borrower</Link>
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
