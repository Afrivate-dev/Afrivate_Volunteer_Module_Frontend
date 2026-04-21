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
    <div className="min-h-screen bg-white font-sans">
      <NavbarComponent />
      <div className="pt-14 px-4 md:px-8 lg:px-12 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">Notifications</h1>
              <p className="text-gray-600 text-sm md:text-base">
                {canMarkRead
                  ? "Manage your notifications and keep track of what you have already read."
                  : "Public notifications are visible to everyone. Sign in to mark them as read."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="text-sm text-gray-700">
                {unreadCount > 0 ? `${unreadCount} unread` : "All notifications read"}
              </div>
              <button
                onClick={handleMarkAllRead}
                disabled={!canMarkRead || busy || items.length === 0}
                className="bg-[#6A00B1] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#5A0091] transition-colors"
              >
                Mark all read
              </button>
              {!canMarkRead && (
                <Link
                  to="/login"
                  className="text-[#6A00B1] text-sm font-semibold hover:underline"
                >
                  Sign in to mark read
                </Link>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-14 text-gray-500">
              Loading notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="bg-gray-50 rounded-[30px] p-10 border border-gray-200 text-center">
              <p className="text-gray-500 text-lg mb-3">No notifications yet.</p>
              <p className="text-gray-400 text-sm">
                Notifications from Afrivate and system updates will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const isUnread = item.current_user_read === false;
                return (
                  <div
                    key={item.id}
                    className={`rounded-[30px] border p-5 ${isUnread ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {item.title || 'Notification'}
                          </span>
                          {item.priority && (
                            <span className="text-xs uppercase tracking-wider font-semibold rounded-full px-2 py-1 bg-gray-100 text-gray-600">
                              {item.priority}
                            </span>
                          )}
                          {isUnread && (
                            <span className="text-xs font-semibold text-white bg-[#6A00B1] rounded-full px-2 py-1">
                              Unread
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-line">
                          {item.message || 'No message content.'}
                        </p>
                        {item.link && (
                          item.link.startsWith('/') ? (
                            <Link
                              to={item.link}
                              className="inline-flex mt-3 items-center gap-2 text-[#6A00B1] text-sm font-semibold hover:underline"
                            >
                              View details
                            </Link>
                          ) : (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex mt-3 items-center gap-2 text-[#6A00B1] text-sm font-semibold hover:underline"
                            >
                              View details
                            </a>
                          )
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-start sm:items-end">
                        {item.created_at && (
                          <span className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        )}
                        <button
                          onClick={() => handleMarkRead(item.id)}
                          disabled={!canMarkRead || busy || !isUnread}
                          className="bg-white border border-[#6A00B1] text-[#6A00B1] px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors"
                        >
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
