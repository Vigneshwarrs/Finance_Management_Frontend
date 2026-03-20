import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

function statusVariant(status: string): 'default' | 'destructive' | 'secondary' | 'outline' {
  if (status === 'sent') return 'default';
  if (status === 'failed') return 'destructive';
  if (status === 'pending') return 'secondary';
  return 'outline';
}

export function NotificationLog() {
  const [borrowerId, setBorrowerId] = useState('');
  const [queried, setQueried] = useState('');
  const addToast = useToastStore((s) => s.addToast);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', queried],
    queryFn: () => apiClient.get(`/borrowers/${queried}/notifications`).then((r) => r.data),
    enabled: Boolean(queried),
  });

  const prefMutation = useMutation({
    mutationFn: (channels: string[]) =>
      apiClient.put(`/borrowers/${queried}/notification-preferences`, { channels }),
    onSuccess: () => addToast('Preferences updated', 'success'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            value={borrowerId}
            onChange={(e) => setBorrowerId(e.target.value)}
            placeholder="Borrower ID"
            aria-label="Borrower ID"
            className="flex-1"
          />
          <Button onClick={() => setQueried(borrowerId)}>Load</Button>
        </div>

        {queried && (
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium">Preferences:</span>
            <Button variant="link" onClick={() => prefMutation.mutate(['email', 'sms'])}>
              Enable All
            </Button>
            <Button variant="link" onClick={() => prefMutation.mutate([])}>
              Disable All
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {!isLoading && notifications.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n: any) => (
                <TableRow key={n.id}>
                  <TableCell>{n.type}</TableCell>
                  <TableCell>{n.channel}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(n.status)}>{n.status}</Badge>
                  </TableCell>
                  <TableCell>{n.sentAt ? new Date(n.sentAt).toLocaleString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
