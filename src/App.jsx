import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMeThunk } from './features/auth/authSlice';
import { useAuth } from './hooks/useAuth';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

import HomePage from './pages/public/HomePage';
import JobsPage from './pages/public/JobsPage';
import JobDetailPage from './pages/public/JobDetailPage';

import LoginPage from './pages/auth/LoginPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import SeekerDashboardPage from './pages/seeker/DashboardPage';
import ApplicationsPage from './pages/seeker/ApplicationsPage';
import ProfilePage from './pages/seeker/ProfilePage';
import SavedJobsPage from './pages/seeker/SavedJobsPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';

import EmployerDashboardPage from './pages/employer/EmployerDashboardPage';
import CreateJobPage from './pages/employer/CreateJobPage';
import MyJobsPage from './pages/employer/MyJobsPage';
import ApplicantsPage from './pages/employer/ApplicantsPage';
import CompanyProfilePage from './pages/employer/CompanyProfilePage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import { isAllowedAdminEmail } from './utils/adminAccess';

import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  if (roles?.includes('ADMIN') && !isAllowedAdminEmail(user?.email)) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    const redirect = user?.role === 'ADMIN' ? '/admin' : user?.role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }
  return children;
}

function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500 text-sm max-w-xs">This section is currently being built and will be available soon.</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-8xl font-bold text-slate-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
      <p className="text-slate-500 mb-6 max-w-sm text-sm">Sorry, the page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="btn-primary">Go Home</a>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) dispatch(getMeThunk());
  }, [isAuthenticated]);

  return (
    <Routes>
      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/admin/login" element={<GuestRoute><AdminLoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Public */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/companies" element={<div className="page-container py-12"><ComingSoon title="Companies Directory" /></div>} />
        <Route path="/companies/:id" element={<div className="page-container py-12"><ComingSoon title="Company Profile" /></div>} />
        <Route path="/about" element={<div className="page-container py-12"><ComingSoon title="About Us" /></div>} />
        <Route path="/contact" element={<div className="page-container py-12"><ComingSoon title="Contact Us" /></div>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Job Seeker */}
      <Route element={<ProtectedRoute roles={['JOB_SEEKER']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<SeekerDashboardPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/saved-jobs" element={<SavedJobsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Employer */}
      <Route element={<ProtectedRoute roles={['EMPLOYER']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
        <Route path="/employer/jobs" element={<MyJobsPage />} />
        <Route path="/employer/jobs/create" element={<CreateJobPage />} />
        <Route path="/employer/jobs/:jobId/applicants" element={<ApplicantsPage />} />
        <Route path="/employer/company" element={<CompanyProfilePage />} />
        <Route path="/employer/messages" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/employer/settings" element={<SettingsPage />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/jobs" element={<AdminJobsPage />} />
        <Route path="/admin/applications" element={<AdminApplicationsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
      </Route>
    </Routes>
  );
}
