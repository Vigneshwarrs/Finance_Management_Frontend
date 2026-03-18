import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export type Borrower = {
  id: string;
  name: string;
  identificationNumber: string;
  contact?: {
    email?: string;
  };
};

export const borrowerColumns: ColumnDef<Borrower>[] = [
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
    cell: ({ row }) => (
      <span className="text-gray-700 dark:text-gray-200">
        {row.original.contact?.email || "-"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="space-x-2">
        <Button asChild variant="link" size="sm">
          <Link to={`/borrowers/${row.original.id}`}>View</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={`/borrowers/${row.original.id}/edit`}>Edit</Link>
        </Button>
      </div>
    ),
  },
];