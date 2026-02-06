import React, { useEffect } from "react";

const Toast = ({ message, type = "success", isOpen, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in transform transition-all duration-300 ease-out">
      <div className={`bg-white rounded-lg shadow-lg border-l-4 p-4 min-w-[300px] ${
        type === "success" 
          ? "border-green-500" 
          : type === "error"
          ? "border-red-500"
          : "border-blue-500"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 ${
            type === "success" 
              ? "text-green-500" 
              : type === "error"
              ? "text-red-500"
              : "text-blue-500"
          }`}>
            {type === "success" && <i className="fa fa-check-circle text-xl"></i>}
            {type === "error" && <i className="fa fa-exclamation-circle text-xl"></i>}
            {type === "info" && <i className="fa fa-info-circle text-xl"></i>}
          </div>
          <p className="text-gray-700 flex-1">{message}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
