import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Bell, Menu, X, Briefcase, ChevronDown, LogOut, User, Settings, LayoutDashboard, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchNotifications, markAllNotificationsRead } from '../../features/notifications/notificationSlice';
import { useSelector } from 'react-redux';
import Avatar from '../common/Avatar';
import { timeAgo } from '../../utils/helpers';

export default function Navbar() {
  const { user, isAuthenticated, handleLogout, isSeeker, isEmployer, isAdmin } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: notifications, unreadCount } = useSelector(s => s.notifications);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchNotifications());
  }, [isAuthenticated]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dashboardPath = isAdmin ? '/admin' : isEmployer ? '/employer/dashboard' : '/dashboard';

  const navLinks = [
    { to: '/jobs', label: 'Find Jobs' },
    { to: '/companies', label: 'Companies' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg hidden sm:block">
              Job<span className="text-primary-600">Platform</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div ref={notifRef} className="relative">
                  <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-slate-200 overflow-hidden animate-slide-down">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={() => dispatch(markAllNotificationsRead())} className="text-xs text-primary-600 hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-sm text-slate-500">No notifications</div>
                        ) : notifications.map(n => (
                          <div key={n._id} onClick={() => { setNotifOpen(false); if (n.link) navigate(n.link); }}
                            className={`px-4 py-3 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-primary-50/40' : ''}`}>
                            <div className="flex gap-2">
                              {!n.isRead && <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />}
                              <div className={!n.isRead ? '' : 'pl-3.5'}>
                                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link to="/notifications" onClick={() => setNotifOpen(false)}
                        className="block text-center py-2.5 text-xs text-primary-600 hover:bg-slate-50 border-t border-slate-100 font-medium">
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative">
                  <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <Avatar src={user?.avatar} name={user?.fullName} size="sm" />
                    <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[100px] truncate">{user?.fullName?.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-dropdown border border-slate-200 overflow-hidden animate-slide-down">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-medium text-slate-900 text-sm truncate">{user?.fullName}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
                      </div>
                      <div className="py-1">
                        <Link to={dashboardPath} onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                        </Link>
                        {isSeeker && <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"><User className="w-4 h-4 text-slate-400" /> My Profile</Link>}
                        {isEmployer && <Link to="/employer/company" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"><Building2 className="w-4 h-4 text-slate-400" /> Company</Link>}
                        <Link to={isEmployer ? '/employer/settings' : '/settings'} onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <Settings className="w-4 h-4 text-slate-400" /> Settings
                        </Link>
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost btn-sm hidden sm:flex">Log in</Link>
                <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-slide-down">
          <div className="page-container py-3 space-y-1">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50' : 'text-slate-700 hover:bg-slate-100'}`}>
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Dashboard</Link>
                <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1 justify-center">Log in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 justify-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
