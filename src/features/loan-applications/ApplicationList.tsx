import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoanApplications, LoanApplication } from './hooks/useLoanApplications';
import { useAuthStore } from '../../store/authStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';

type ApplicationStatus = LoanApplication['status'];

const STATUS_BADGE_VARIANT: Record<
  ApplicationStatus,
  'secondary' | 'default' | 'outline' | 'destructive'
> = {
  draft: 'secondary',
  submitted: 'default',
  under_review: 'outline',
  approved: 'default',
  rejected: 'destructive',
  disbursed: 'default',
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  disbursed: 'Disbursed',
};

const ALL_STATUSES: ApplicationStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'disbursed',
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ApplicationList() {
  const { data: applications, isLoading } = useLoanApplications();
  const user = useAuthStore((s) => s.user);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');

  const isOfficerOrAdmin = user?.role === 'Loan_Officer' || user?.role === 'Admin';
  const isBorrower = user?.role === 'Borrower';

  const filtered =
    isOfficerOrAdmin && statusFilter !== 'all'
      ? (applications ?? []).filter((a) => a.status === statusFilter)
      : (applications ?? []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Loan Applications</h1>

        {isOfficerOrAdmin && (
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ApplicationStatus | 'all')}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {isBorrower && (
          <Button asChild>
            <Link to="/applications/new">New Application</Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Borrower ID</TableHead>
                <TableHead>Requested Amount</TableHead>
                <TableHead>Term (months)</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Badge
                        variant={STATUS_BADGE_VARIANT[app.status]}
                        className={
                          app.status === 'approved'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : undefined
                        }
                      >
                        {STATUS_LABEL[app.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{app.borrowerId}</TableCell>
                    <TableCell>{formatCurrency(app.requestedPrincipal)}</TableCell>
                    <TableCell>{app.requestedTermMonths}</TableCell>
                    <TableCell className="max-w-xs truncate">{app.purpose}</TableCell>
                    <TableCell>{formatDate(app.submittedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/applications/${app.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
