import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { useReviewApplication } from './hooks/useLoanApplications';

interface ReviewDialogProps {
  open: boolean;
  action: 'approved' | 'rejected';
  applicationId: string;
  onClose: () => void;
}

export function ReviewDialog({ open, action, applicationId, onClose }: ReviewDialogProps) {
  const [notes, setNotes] = useState('');
  const reviewApplication = useReviewApplication();

  const title = action === 'approved' ? 'Approve Application' : 'Reject Application';

  function handleSubmit() {
    if (!notes.trim()) return;
    reviewApplication.mutate(
      { id: applicationId, status: action, notes },
      {
        onSuccess: () => {
          setNotes('');
          onClose();
        },
      }
    );
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setNotes('');
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="review-notes">Review Notes</Label>
          <Textarea
            id="review-notes"
            placeholder="Enter your review notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={reviewApplication.isPending}>
            Cancel
          </Button>
          {action === 'approved' ? (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmit}
              disabled={!notes.trim() || reviewApplication.isPending}
            >
              {reviewApplication.isPending ? 'Approving…' : 'Approve'}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!notes.trim() || reviewApplication.isPending}
            >
              {reviewApplication.isPending ? 'Rejecting…' : 'Reject'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
