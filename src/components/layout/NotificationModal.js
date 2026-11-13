import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, X, Check, ExternalLink } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { notifications } from "../../services/api";

const BRAND_PURPLE = "#843A7F";

export default function NotificationModal({ isOpen, onClose }) {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const canMarkRead = Boolean(user);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    notifications
      .list()
      .then((res) => {
        if (!isMounted) return;
        const raw = Array.isArray(res) ? res : res?.results || [];
        setItems(raw);
      })
      .catch((err) => {
        console.warn("Could not load notifications:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
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
    } finally {
      setBusy(false);
    }
  };

  const unreadCount = items.filter(
    (item) => item.current_user_read === false
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 my-6">
        {/* ══════════════════════════════════════════════════════
            HEADER: PURPLE BANNER (Matching Design)
        ══════════════════════════════════════════════════════ */}
        <div
          className="p-5 sm:p-6 text-white relative shrink-0"
          style={{ backgroundColor: BRAND_PURPLE }}
        >
          {/* Top Row: Title & Close Button */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
              aria-label="Close notifications"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          <p className="text-xs text-purple-100/90 mb-3">
            Keep track of your updates.
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs">
            <span className="text-purple-200 text-[11px]">
              {items.length} total update{items.length === 1 ? "" : "s"}
            </span>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={!canMarkRead || busy || unreadCount === 0}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Mark all read
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            BODY: SCROLLABLE LIST OR EMPTY STATE
        ══════════════════════════════════════════════════════ */}
        <div className="overflow-y-auto p-4 sm:p-5 flex-1 bg-[#FBFBFC]">
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#843A7F] border-t-transparent mx-auto" />
              <p className="text-xs text-gray-400 mt-3 font-medium">
                Loading notifications...
              </p>
            </div>
          ) : items.length === 0 ? (
            /* Empty State Matching Image 3 */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center my-2">
              <div className="w-14 h-14 rounded-full bg-purple-50 text-[#843A7F] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Bell size={24} strokeWidth={2.2} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                No notifications yet
              </h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Notifications from AfriVate and system updates will appear here.
              </p>
            </div>
          ) : (
            /* Notification Cards */
            <div className="space-y-3">
              {items.map((item) => {
                const isUnread = item.current_user_read === false;
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-all shadow-2xs ${
                      isUnread
                        ? "bg-purple-50/50 border-[#843A7F]/30"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
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

                      {item.created_at && (
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(item.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line mb-3">
                      {item.message || "No message content."}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100/80 text-xs">
                      {item.link ? (
                        item.link.startsWith("/") ? (
                          <Link
                            to={item.link}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 text-[#0B7B69] hover:underline font-semibold"
                          >
                            <span>View details</span>
                            <ExternalLink size={12} />
                          </Link>
                        ) : (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#0B7B69] hover:underline font-semibold"
                          >
                            <span>View details</span>
                            <ExternalLink size={12} />
                          </a>
                        )
                      ) : (
                        <span />
                      )}

                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkRead(item.id, e)}
                          disabled={!canMarkRead || busy}
                          className="text-[#843A7F] hover:bg-[#843A7F]/10 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <Check size={12} strokeWidth={2.5} />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            FOOTER: CLOSE ACTION
        ══════════════════════════════════════════════════════ */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
