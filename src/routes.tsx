import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { PermissionGuard } from './components/PermissionGuard';
import { AppShell } from './components/layout/AppShell';
import { LoginForm } from './features/auth/LoginForm';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { BorrowerList } from './features/borrowers/BorrowerList';
import { BorrowerForm } from './features/borrowers/BorrowerForm';
import { BorrowerDetail } from './features/borrowers/BorrowerDetail';
import { LoanList } from './features/loans/LoanList';
import { LoanForm } from './features/loans/LoanForm';
import { LoanDetail } from './features/loans/LoanDetail';
import { RepaymentForm } from './features/repayments/RepaymentForm';
import { NotificationLog } from './features/notifications/NotificationLog';
import { PortfolioSummary } from './features/reporting/PortfolioSummary';
import { UserManagementTable } from './features/users/UserManagementTable';
import { RoleManagementPage } from './features/rbac/components/RoleManagementPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { ApplicationList } from './features/loan-applications/ApplicationList';
import { ApplicationForm } from './features/loan-applications/ApplicationForm';
import { ApplicationDetail } from './features/loan-applications/ApplicationDetail';
import { PaymentPortal } from './features/payments/PaymentPortal';
import { PaymentHistory } from './features/payments/PaymentHistory';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route element={<AuthGuard />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/borrowers" element={<BorrowerList />} />
          <Route path="/borrowers/new" element={<BorrowerForm />} />
          <Route path="/borrowers/:id" element={<BorrowerDetail />} />
          <Route path="/borrowers/:id/edit" element={<BorrowerForm />} />
          <Route path="/loans" element={<LoanList />} />
          <Route path="/loans/new" element={<LoanForm />} />
          <Route path="/loans/:id" element={<LoanDetail />} />
          <Route path="/loans/:id/edit" element={<LoanForm />} />
          <Route path="/repayments" element={<RepaymentForm />} />
          <Route path="/notifications" element={<NotificationLog />} />
          <Route path="/reports" element={<PortfolioSummary />} />
          <Route path="/users" element={<PermissionGuard permission="users:read" fallback={<ForbiddenPage />}><UserManagementTable /></PermissionGuard>} />
          <Route path="/roles" element={<PermissionGuard permission="roles:read" fallback={<ForbiddenPage />}><RoleManagementPage /></PermissionGuard>} />
          <Route path="/audit" element={<PermissionGuard permission="audit:read" fallback={<ForbiddenPage />}><AuditLogPage /></PermissionGuard>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/applications" element={<ApplicationList />} />
          <Route path="/applications/new" element={<PermissionGuard permission="loans:apply" fallback={<ForbiddenPage />}><ApplicationForm /></PermissionGuard>} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/payments" element={<PermissionGuard permission="payments:initiate" fallback={<ForbiddenPage />}><PaymentPortal /></PermissionGuard>} />
          <Route path="/payments/history" element={<PermissionGuard permission="payments:initiate" fallback={<ForbiddenPage />}><PaymentHistory /></PermissionGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
