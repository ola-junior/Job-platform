import { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCheck, BriefcaseIcon, MessageSquare, Info } from 'lucide-react';
import { notificationsService } from '../services/jobs.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const typeIcon = (type) => {
  if (type === 'NEW_MESSAGE') return <MessageSquare className="w-4 h-4 text-blue-500" />;
  if (type?.includes('APPLICATION')) return <BriefcaseIcon className="w-4 h-4 text-green-500" />;
  return <Info className="w-4 h-4 text-slate-400" />;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = () => {
    notificationsService.getAll({ limit: 50 })
      .then(({ data }) => {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      })
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await notificationsService.markRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsService.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All marked as read');
  };

  const handleDelete = async (id) => {
    await notificationsService.delete(id).catch(() => {});
    setNotifications(prev => prev.filter(n => n._id !== id));
    toast.success('Notification deleted');
  };

  if (loading) return <LoadingSpinner center size="lg" text="Loading notifications..." />;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-primary-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-ghost btn-sm gap-1.5 text-primary-600">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center">
          <Bell className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No notifications</h3>
          <p className="text-sm text-slate-400">You're all caught up! Check back later.</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {notifications.map(n => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`flex items-start gap-3 p-4 transition-colors cursor-pointer hover:bg-slate-50 ${!n.isRead ? 'bg-primary-50/40' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {typeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.isRead && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(n._id); }}
                  className="text-slate-300 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
