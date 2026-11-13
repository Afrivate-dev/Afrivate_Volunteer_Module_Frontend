import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { useUser } from "../context/UserContext";
import { notifications } from "../services/api";
import purpleLogo from "../Assets/newLogo.svg";

const BRAND_PURPLE = "#843A7F";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const canMarkRead = Boolean(user);
  const isEnabler =
    user?.role === "Enabler" ||
    user?.role === "organization" ||
    user?.user_type === "enabler";

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
    if (busy || items.length === 0) return;
    setBusy(true);
    try {
      await notifications.markAllRead();
      setItems((prev) =>
        prev.map((item) => ({ ...item, current_user_read: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(err?.message || "Could not mark all notifications as read.");
    } finally {
      setBusy(false);
    }
  };

  const unreadCount = items.filter(
    (item) => item.current_user_read === false
  ).length;

  const handleBackOrMenu = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isEnabler ? "/enabler/dashboard" : "/volunteer/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] font-sans antialiased text-gray-900 flex flex-col">
      {/* ══════════════════════════════════════════════════════
          TOP HEADER BAR (Matching Image 3)
      ══════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-gray-100 h-14 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Left: Menu / Back Icon */}
        <button
          onClick={handleBackOrMenu}
          aria-label="Back / Menu"
          className="w-9 h-9 rounded-xl text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        {/* Center: Official Brand Logo with Africa Circuit Map */}
        <Link
          to={isEnabler ? "/enabler/dashboard" : "/volunteer/home"}
          className="flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <img
            src={purpleLogo}
            alt="AfriVate"
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </Link>

        {/* Right: Notification Bell */}
        <div className="relative">
          <button
            onClick={() => fetchNotifications()}
            aria-label="Refresh Notifications"
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
          >
            <Bell size={19} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 border-2 border-white" />
            )}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          FULL-WIDTH PURPLE HERO BANNER (Matching Image 3)
      ══════════════════════════════════════════════════════ */}
      <div
        className="w-full text-white pt-8 sm:pt-10 pb-20 sm:pb-24 px-4 sm:px-8 md:px-12 relative"
        style={{ backgroundColor: BRAND_PURPLE }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1">
              Keep track of your updates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {unreadCount > 0 && (
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
            <button
              onClick={handleMarkAllRead}
              disabled={!canMarkRead || busy || items.length === 0}
              className="bg-white/20 hover:bg-white/30 active:scale-95 text-white px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Mark all read
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT CARD (Overlaps the Purple Banner)
      ══════════════════════════════════════════════════════ */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16 z-10 relative pb-16 flex-1">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl mb-4 text-xs sm:text-sm shadow-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#843A7F] border-t-transparent mx-auto" />
            <p className="text-xs text-gray-400 mt-3 font-medium">
              Loading updates...
            </p>
          </div>
        ) : items.length === 0 ? (
          /* Empty State Matching Image 3 */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-10 sm:p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-purple-50 text-[#843A7F] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Bell size={24} strokeWidth={2.2} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
              No notifications yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Notifications from AfriVate and system updates will appear here.
            </p>
          </div>
        ) : (
          /* List of Notifications inside clean card */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 divide-y divide-gray-100 overflow-hidden">
            {items.map((item) => {
              const isUnread = item.current_user_read === false;
              return (
                <div
                  key={item.id}
                  className={`p-5 sm:p-6 transition-colors ${
                    isUnread ? "bg-purple-50/40" : "hover:bg-gray-50/60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-sm font-bold text-gray-900 truncate">
                          {item.title || "Notification"}
                        </span>
                        {item.priority && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 bg-gray-100 text-gray-500">
                            {item.priority}
                          </span>
                        )}
                        {isUnread && (
                          <span className="text-[10px] font-bold text-white bg-[#843A7F] rounded-full px-2 py-0.5 shadow-2xs">
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                        {item.message || "No message content."}
                      </p>

                      {item.link && (
                        <div className="mt-2.5">
                          {item.link.startsWith("/") ? (
                            <Link
                              to={item.link}
                              className="inline-flex items-center gap-1 text-[#0B7B69] text-xs font-semibold hover:underline"
                            >
                              <span>View details</span>
                              <span>→</span>
                            </Link>
                          ) : (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#0B7B69] text-xs font-semibold hover:underline"
                            >
                              <span>View details</span>
                              <span>→</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      {item.created_at && (
                        <span className="text-[11px] text-gray-400">
                          {new Date(item.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      )}

                      {isUnread && (
                        <button
                          onClick={() => handleMarkRead(item.id)}
                          disabled={!canMarkRead || busy}
                          className="border border-[#843A7F] text-[#843A7F] hover:bg-[#843A7F] hover:text-white px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
