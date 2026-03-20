import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLoanApplication, useSubmitApplication, useDisburseApplication } from './hooks/useLoanApplications';
import { useAuthStore } from '../../store/authStore';
import { ReviewDialog } from './ReviewDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import type { LoanApplication } from './hooks/useLoanApplications';

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface TimelineItemProps {
  label: string;
  date?: string;
  active?: boolean;
}

function TimelineItem({ label, date, active }: TimelineItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-1 h-3 w-3 rounded-full border-2 flex-shrink-0 ${
          active ? 'border-primary bg-primary' : date ? 'border-primary bg-primary/30' : 'border-muted-foreground bg-muted'
        }`}
      />
      <div>
        <p className={`text-sm font-medium ${!date ? 'text-muted-foreground' : ''}`}>{label}</p>
        <p className="text-xs text-muted-foreground">{date ? formatDate(date) : 'Pending'}</p>
      </div>
    </div>
  );
}

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: application, isLoading, isError } = useLoanApplication(id ?? '');
  const user = useAuthStore((s) => s.user);
  const submitApplication = useSubmitApplication();
  const disburseApplication = useDisburseApplication();

  // Placeholder state for ReviewDialog (implemented in task 8.5)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');

  const isOfficerOrAdmin = user?.role === 'Loan_Officer' || user?.role === 'Admin';
  const isBorrower = user?.role === 'Borrower';

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load application. Please try again.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/applications')}>
          Back to Applications
        </Button>
      </div>
    );
  }

  const canReview =
    isOfficerOrAdmin &&
    (application.status === 'submitted' || application.status === 'under_review');

  const canDisburse = isOfficerOrAdmin && application.status === 'approved';

  const canSubmit = isBorrower && application.status === 'draft';

  const showReviewSection =
    application.status === 'approved' || application.status === 'rejected';

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 text-muted-foreground"
            onClick={() => navigate('/applications')}
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-semibold">Loan Application</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{application.id}</p>
        </div>
        <Badge
          variant={STATUS_BADGE_VARIANT[application.status]}
          className={
            application.status === 'approved'
              ? 'bg-green-600 text-white hover:bg-green-700 text-sm px-3 py-1'
              : 'text-sm px-3 py-1'
          }
        >
          {STATUS_LABEL[application.status]}
        </Badge>
      </div>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Borrower ID</p>
              <p className="font-mono font-medium">{application.borrowerId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Requested Principal</p>
              <p className="font-medium">{formatCurrency(application.requestedPrincipal)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Term</p>
              <p className="font-medium">{application.requestedTermMonths} months</p>
            </div>
            <div>
              <p className="text-muted-foreground">Documents</p>
              <p className="font-medium">{application.documents.length} attached</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-muted-foreground text-sm">Purpose</p>
            <p className="mt-1 text-sm">{application.purpose}</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-border">
            <TimelineItem label="Created" date={application.createdAt} active />
            <TimelineItem
              label="Submitted"
              date={application.submittedAt}
              active={!!application.submittedAt}
            />
            <TimelineItem
              label="Reviewed"
              date={application.reviewedAt}
              active={!!application.reviewedAt}
            />
            {application.status === 'disbursed' && (
              <TimelineItem label="Disbursed" date={application.updatedAt} active />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Section */}
      {showReviewSection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Reviewed By</p>
                <p className="font-mono font-medium">{application.reviewedBy ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reviewed At</p>
                <p className="font-medium">{formatDate(application.reviewedAt)}</p>
              </div>
            </div>
            {application.reviewNotes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground">Review Notes</p>
                  <p className="mt-1">{application.reviewNotes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {canSubmit && (
          <Button
            onClick={() => submitApplication.mutate(application.id)}
            disabled={submitApplication.isPending}
          >
            {submitApplication.isPending ? 'Submitting…' : 'Submit Application'}
          </Button>
        )}

        {canReview && (
          <>
            <Button
              onClick={() => {
                setReviewAction('approved');
                setReviewDialogOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setReviewAction('rejected');
                setReviewDialogOpen(true);
              }}
            >
              Reject
            </Button>
          </>
        )}

        {canDisburse && (
          <Button
            onClick={() =>
              disburseApplication.mutate({ id: application.id, loanId: application.disbursedLoanId ?? '' })
            }
            disabled={disburseApplication.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {disburseApplication.isPending ? 'Disbursing…' : 'Disburse'}
          </Button>
        )}
      </div>

      <ReviewDialog
        open={reviewDialogOpen}
        action={reviewAction}
        applicationId={application.id}
        onClose={() => setReviewDialogOpen(false)}
      />
    </div>
  );
}
