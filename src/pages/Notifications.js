import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { notifications } from "../services/api";
import Navbar from "../components/auth/Navbar";
import EnablerNavbar from "../components/auth/EnablerNavbar";

const Notifications = () => {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const canMarkRead = Boolean(user);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notifications.list();
      const raw = Array.isArray(response) ? response : response?.results || [];
      setItems(raw);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError(err?.message || "Unable to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Notifications - AfriVate";
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    if (!id || busy) return;
    setBusy(true);
    try {
      await notifications.markRead(id);
      setItems((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? { ...item, current_user_read: true }
            : item
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(err?.message || "Could not mark notification as read.");
    } finally {
      setBusy(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await notifications.markAllRead();
      setItems((prev) => prev.map((item) => ({ ...item, current_user_read: true })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(err?.message || "Could not mark all notifications as read.");
    } finally {
      setBusy(false);
    }
  };

  const unreadCount = items.filter((item) => item.current_user_read === false).length;

  const NavbarComponent = user?.role === "Enabler" ? EnablerNavbar : Navbar;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <NavbarComponent />
      <div className="pt-16">
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-8 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-0.5">Notifications</h1>
              <p className="text-purple-200 text-sm">
                {canMarkRead ? "Keep track of your updates." : "Sign in to mark notifications as read."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{unreadCount} unread</span>
              )}
              <button onClick={handleMarkAllRead} disabled={!canMarkRead || busy || items.length === 0}
                className="bg-white text-[#651F5F] px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors">
                Mark all read
              </button>
              {!canMarkRead && (
                <Link to="/login" className="text-white text-sm font-semibold hover:underline">Sign in</Link>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-8 py-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">🔔</p>
              <p className="font-bold text-gray-800 mb-1">No notifications yet</p>
              <p className="text-gray-400 text-sm">Notifications from AfriVate and system updates will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const isUnread = item.current_user_read === false;
                return (
                  <div key={item.id}
                    className={`rounded-2xl border p-5 ${isUnread ? 'border-[#8D4087] bg-purple-50' : 'border-gray-100 bg-white shadow-sm'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-900 truncate">{item.title || 'Notification'}</span>
                          {item.priority && (
                            <span className="text-xs uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 bg-gray-100 text-gray-500">
                              {item.priority}
                            </span>
                          )}
                          {isUnread && (
                            <span className="text-xs font-semibold text-white bg-[#8D4087] rounded-full px-2 py-0.5">New</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{item.message || 'No message content.'}</p>
                        {item.link && (
                          item.link.startsWith('/') ? (
                            <Link to={item.link} className="inline-flex mt-2 items-center gap-1 text-[#8D4087] text-sm font-semibold hover:underline">
                              View details →
                            </Link>
                          ) : (
                            <a href={item.link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex mt-2 items-center gap-1 text-[#8D4087] text-sm font-semibold hover:underline">
                              View details →
                            </a>
                          )
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-start sm:items-end shrink-0">
                        {item.created_at && (
                          <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
                        )}
                        <button onClick={() => handleMarkRead(item.id)} disabled={!canMarkRead || busy || !isUnread}
                          className="border border-[#8D4087] text-[#8D4087] px-4 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors">
                          {isUnread ? 'Mark read' : 'Read'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
