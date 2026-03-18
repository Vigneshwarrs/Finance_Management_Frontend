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

type Borrower = {
  id: string;
  name: string;
  identificationNumber: string;
  contact?: {
    email?: string;
  };
};

export function BorrowerList() {
  const { data: borrowers = [], isLoading } = useQuery({
    queryKey: ["borrowers"],
    queryFn: () => apiClient.get("/borrowers").then((r) => r.data),
  });

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
    cell: ({ row }) => {
      const email = row.original.contact?.email || "-";
      return <span>{email}</span>;
    },
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

  const table = useReactTable({
    data: borrowers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Borrowers</h1>
        <Link
          to="/borrowers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Add Borrower
        </Link>
      </div>

      {/* Table */}
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
                        cell.column.columnDef.cell ??
                          cell.column.columnDef.accessorKey,
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