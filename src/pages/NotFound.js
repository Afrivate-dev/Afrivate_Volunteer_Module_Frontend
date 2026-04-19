import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-sans">
      <h1 className="text-6xl font-bold text-[#6A00B1] mb-4">404</h1>
      <p className="text-xl font-semibold text-black mb-2">Page not found</p>
      <p className="text-gray-500 mb-8 text-center">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors"
      >
        Go home
      </button>
    </div>
  );
};

export default NotFound;
