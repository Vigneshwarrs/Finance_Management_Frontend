import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  userId: string;
  username: string;
  role: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  notificationPreferences?: {
    channels: ('email' | 'sms')[];
  };
  borrowerId?: string;
}

interface Loan {
  id: string;
  principal: number;
  outstandingBalance?: number;
  status: string;
}

interface ScheduledPayment {
  id: string;
  loanId: string;
  amount: number;
  scheduledDate: string;
  status: 'pending' | 'processed' | 'cancelled' | 'failed';
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }),
  notificationPreferences: z.object({
    emailEnabled: z.boolean(),
    smsEnabled: z.boolean(),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Borrower Summary ─────────────────────────────────────────────────────────

function BorrowerLoanSummary() {
  const { data: loans = [], isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: ['loans'],
    queryFn: () => apiClient.get('/loans').then((r) => r.data),
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<ScheduledPayment[]>({
    queryKey: ['payments', 'history'],
    queryFn: () => apiClient.get('/payments/history').then((r) => r.data),
  });

  const activeLoans = loans.filter((l) => l.status === 'active');
  const totalOutstanding = activeLoans.reduce(
    (sum, l) => sum + (l.outstandingBalance ?? l.principal ?? 0),
    0
  );

  const nextPayment = payments
    .filter((p) => p.status === 'pending')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Loan Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loansLoading ? (
            <p className="text-sm text-muted-foreground">Loading loans…</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-semibold">{activeLoans.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                <p className="text-2xl font-semibold">₹{totalOutstanding.toFixed(2)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <p className="text-sm text-muted-foreground">Loading payments…</p>
          ) : nextPayment ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl font-semibold">₹{nextPayment.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="text-xl font-semibold">
                  {new Date(nextPayment.scheduledDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming payments.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/profile').then((r) => r.data),
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          phone: profile.phone ?? '',
          email: profile.email ?? '',
          address: {
            street: profile.address?.street ?? '',
            city: profile.address?.city ?? '',
            state: profile.address?.state ?? '',
            postalCode: profile.address?.postalCode ?? '',
            country: profile.address?.country ?? '',
          },
          notificationPreferences: {
            emailEnabled: profile.notificationPreferences?.channels.includes('email') ?? false,
            smsEnabled: profile.notificationPreferences?.channels.includes('sms') ?? false,
          },
        }
      : undefined,
  });

  const updateProfile = useMutation({
    mutationFn: (data: Partial<ProfileData>) =>
      apiClient.put('/profile', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccessMsg('Profile updated successfully.');
      setErrorMsg(null);
    },
    onError: () => {
      setErrorMsg('Failed to update profile. Please try again.');
      setSuccessMsg(null);
    },
  });

  function onSubmit(values: ProfileFormValues) {
    const channels: ('email' | 'sms')[] = [];
    if (values.notificationPreferences.emailEnabled) channels.push('email');
    if (values.notificationPreferences.smsEnabled) channels.push('sms');

    updateProfile.mutate({
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: {
        street: values.address.street || undefined,
        city: values.address.city || undefined,
        state: values.address.state || undefined,
        postalCode: values.address.postalCode || undefined,
        country: values.address.country || undefined,
      },
      notificationPreferences: { channels },
    });
  }

  const displayName = profile?.username ?? user?.userId ?? '—';
  const role = profile?.role ?? user?.role ?? '—';

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">@{displayName}</span>
                <Badge variant="secondary">{role}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading profile…</p>
          ) : (
            <>
              {successMsg && (
                <div className="mb-4 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-200">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                  {errorMsg}
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 555 000 0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Street</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Mumbai" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Maharashtra" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="400001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="India" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Notification Preferences */}
                  <div className="space-y-3 pt-2">
                    <p className="text-sm font-medium">Notification Preferences</p>

                    <FormField
                      control={form.control}
                      name="notificationPreferences.emailEnabled"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="email-notifications"
                              />
                            </FormControl>
                            <Label htmlFor="email-notifications">Email notifications</Label>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notificationPreferences.smsEnabled"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="sms-notifications"
                              />
                            </FormControl>
                            <Label htmlFor="sms-notifications">SMS notifications</Label>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>

      {/* Borrower-only loan summary */}
      {role === 'Borrower' && <BorrowerLoanSummary />}
    </div>
  );
}
