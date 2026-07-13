import React from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../services/api";

const NotFound = () => {
  const navigate = useNavigate();
  // Logged-in users go back to their dashboard (RoleRedirect picks the right
  // one); visitors go to the landing page.
  const isLoggedIn = Boolean(getAccessToken());
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-sans">
      <h1 className="text-6xl font-bold text-[#8D4087] mb-4">404</h1>
      <p className="text-xl font-semibold text-black mb-2">Page not found</p>
      <p className="text-gray-500 mb-8 text-center">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
        className="bg-[#8D4087] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors"
      >
        {isLoggedIn ? "Back to dashboard" : "Go home"}
      </button>
    </div>
  );
};

export default NotFound;
