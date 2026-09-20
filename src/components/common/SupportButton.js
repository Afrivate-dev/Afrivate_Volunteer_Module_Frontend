import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Global floating support button — appears on every page except /support itself.
 * Renders a small circular help icon fixed to the bottom-right corner.
 */
const SupportButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  // Hide on the support page itself and on pure auth/landing pages
  const hiddenPaths = ['/support', '/contact-support', '/', '/landingpathfinder', '/landingenabler'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-6 right-5 z-[999] flex flex-col items-end gap-2">
      {/* Tooltip */}
      {hovered && (
        <div
          className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
          style={{ animation: 'fadeInUp 0.15s ease' }}
        >
          Contact Support
          {/* small caret */}
          <span className="absolute bottom-[-5px] right-4 w-0 h-0"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #111827',
            }}
          />
        </div>
      )}

      {/* Button */}
      <button
        type="button"
        aria-label="Contact Support"
        onClick={() => navigate('/support')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #8D4087 0%, #651F5F 100%)',
          boxShadow: '0 4px 16px rgba(141,64,135,0.40)',
        }}
      >
        {/* Question-mark / headset icon */}
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Headset shape */}
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      </button>
    </div>
  );
};

export default SupportButton;
