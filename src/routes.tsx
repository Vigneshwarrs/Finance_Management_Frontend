import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
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
          <Route path="/users" element={<UserManagementTable />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
