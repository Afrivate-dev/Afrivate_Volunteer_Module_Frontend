import React from "react";

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "confirm" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-10">
        <div className="p-6">
          <h3 className="text-xl font-bold text-black mb-4">
            {title}
          </h3>
          <p className="text-gray-700 mb-6">
            {message}
          </p>
          
          <div className="flex justify-end gap-3">
            {type === "confirm" && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                type === "danger" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-[#6A00B1] hover:bg-[#5A0091]"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
