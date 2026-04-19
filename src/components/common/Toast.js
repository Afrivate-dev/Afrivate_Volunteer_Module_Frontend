import React, { useEffect } from "react";
import { createPortal } from "react-dom";

/** Icons + optional titles: success uses `message` alone to avoid repeating “All set!” + user text */
const TYPE_COPY = {
  success: { title: null, icon: "fa-circle-check" },
  error: { title: "Something went wrong", icon: "fa-circle-exclamation" },
  info: { title: "Heads up", icon: "fa-circle-info" },
};

const TYPE_STYLES = {
  success: {
    shell: "bg-emerald-50/95 border-emerald-200/90 shadow-emerald-900/10",
    iconWrap: "bg-emerald-100 text-emerald-700",
    title: "text-emerald-950",
    body: "text-emerald-900/90",
    bar: "bg-emerald-400/80",
  },
  error: {
    shell: "bg-red-50/95 border-red-200/90 shadow-red-900/10",
    iconWrap: "bg-red-100 text-red-700",
    title: "text-red-950",
    body: "text-red-900/90",
    bar: "bg-red-400/80",
  },
  info: {
    shell: "bg-sky-50/95 border-sky-200/90 shadow-sky-900/10",
    iconWrap: "bg-sky-100 text-sky-700",
    title: "text-sky-950",
    body: "text-sky-900/90",
    bar: "bg-sky-400/80",
  },
};

/**
 * App-wide toast: clear, calm copy, large dismiss target, mobile-first placement.
 * Renders in a portal so it stays above nav/modals and respects safe areas.
 */
const Toast = ({
  message,
  type = "success",
  isOpen,
  onClose,
  duration,
}) => {
  const resolvedType = TYPE_STYLES[type] ? type : "info";
  const dismissMs =
    duration !== undefined && duration !== null
      ? duration
      : resolvedType === "error"
        ? 6500
        : resolvedType === "info"
          ? 5200
          : 4200;

  const copy = TYPE_COPY[resolvedType] || TYPE_COPY.info;
  const styles = TYPE_STYLES[resolvedType];

  useEffect(() => {
    if (!isOpen || dismissMs <= 0) return;
    const timer = setTimeout(() => onClose(), dismissMs);
    return () => clearTimeout(timer);
  }, [isOpen, dismissMs, onClose]);

  if (!isOpen) return null;

  const role = resolvedType === "error" ? "alert" : "status";
  const live = resolvedType === "error" ? "assertive" : "polite";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] pointer-events-none flex items-end justify-center p-4 sm:p-5 md:items-start md:justify-end md:p-6 md:pt-24"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div
        role={role}
        aria-live={live}
        aria-atomic="true"
        className={`
          pointer-events-auto w-full max-w-md animate-toast-pop
          rounded-2xl border shadow-xl backdrop-blur-sm
          ${styles.shell}
        `}
      >
        <div className="flex gap-3 p-4 sm:p-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconWrap}`}
            aria-hidden
          >
            <i className={`fa-solid ${copy.icon} text-lg`} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            {copy.title ? (
              <>
                <p className={`text-sm font-semibold leading-tight ${styles.title}`}>
                  {copy.title}
                </p>
                <p className={`mt-1 text-sm leading-relaxed ${styles.body}`}>{message}</p>
              </>
            ) : (
              <p className={`text-sm font-semibold leading-relaxed ${styles.body}`}>{message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            aria-label="Dismiss notification"
          >
            <i className="fa-solid fa-xmark text-lg" aria-hidden />
          </button>
        </div>
        {dismissMs > 0 && (
          <div
            className="h-0.5 overflow-hidden rounded-b-2xl bg-black/[0.06]"
            aria-hidden
          >
            <div
              className={`h-full w-full origin-left animate-toast-progress ${styles.bar}`}
              style={{ animationDuration: `${dismissMs}ms` }}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Toast;
