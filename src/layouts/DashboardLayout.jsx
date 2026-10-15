import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Bookmark, MessageSquare, Bell, Settings, Building2, Users, BarChart3, Flag, Tag, ClipboardList } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../hooks/useAuth';

const seekerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/applications', icon: FileText, label: 'Applications' },
  { to: '/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
  { to: '/profile', icon: Briefcase, label: 'My Profile' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const employerNav = [
  { to: '/employer/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/employer/jobs', icon: Briefcase, label: 'My Jobs' },
  { to: '/employer/company', icon: Building2, label: 'Company Profile' },
  { to: '/employer/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/employer/settings', icon: Settings, label: 'Settings' },
];

const adminNav = [
  { to: '/admin', icon: BarChart3, label: 'Overview', exact: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/admin/applications', icon: FileText, label: 'Applications' },
  { to: '/admin/reports', icon: Flag, label: 'Reports' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
];

export default function DashboardLayout() {
  const { isSeeker, isEmployer, isAdmin } = useAuth();
  const navItems = isAdmin ? adminNav : isEmployer ? employerNav : seekerNav;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 hidden md:flex flex-col py-4">
          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                }>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-container py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
