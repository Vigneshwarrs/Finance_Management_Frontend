import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../store/toastStore';

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
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Notifications</h1>

      <div className="flex gap-2">
        <input
          value={borrowerId}
          onChange={(e) => setBorrowerId(e.target.value)}
          placeholder="Borrower ID"
          className="border rounded px-3 py-2 text-sm flex-1"
          aria-label="Borrower ID"
        />
        <button
          onClick={() => setQueried(borrowerId)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Load
        </button>
      </div>

      {queried && (
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium">Preferences:</span>
          <button onClick={() => prefMutation.mutate(['email', 'sms'])} className="text-sm text-blue-600 hover:underline">
            Enable All
          </button>
          <button onClick={() => prefMutation.mutate([])} className="text-sm text-red-500 hover:underline">
            Disable All
          </button>
        </div>
      )}

      {isLoading && <p>Loading...</p>}

      {notifications.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Channel</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Sent At</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n: any) => (
              <tr key={n.id} className="border-b dark:border-gray-700">
                <td className="p-2">{n.type}</td>
                <td className="p-2">{n.channel}</td>
                <td className="p-2">{n.status}</td>
                <td className="p-2">{n.sentAt ? new Date(n.sentAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
