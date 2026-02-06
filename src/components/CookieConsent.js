import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { saveConsent, hasConsent } from '../utils/cookieConsent';
import { loadGtagScript } from '../utils/gtag';

const CookieConsent = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState(true);

  useEffect(() => {
    if (!hasConsent() && location.pathname === '/') {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location.pathname]);

  const handleAcceptAll = () => {
    const consent = saveConsent({ necessary: true, analytics: true, preferences: true });
    if (consent.analytics) loadGtagScript();
    setVisible(false);
  };

  const handleAcceptSelection = () => {
    const consent = saveConsent({ necessary: true, analytics: true, preferences });
    if (consent.analytics) loadGtagScript();
    setVisible(false);
  };

  const handleCustomize = () => {
    setShowDetails(true);
  };

  const handleRejectOptional = () => {
    const consent = saveConsent({ necessary: true, analytics: true, preferences: false });
    if (consent.analytics) loadGtagScript();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <h2 id="cookie-consent-title" className="text-lg font-bold text-gray-900 mb-2">
            Cookie preferences
          </h2>
          <p id="cookie-consent-desc" className="text-sm text-gray-600 mb-4">
            We use cookies to provide our services and improve your experience. Google Analytics is required to help us understand how visitors use our site.
          </p>

          {showDetails ? (
            <div className="space-y-4 mb-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="cookie-essential"
                  checked
                  disabled
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#6A00B1]"
                />
                <label htmlFor="cookie-essential" className="text-sm text-gray-700">
                  <span className="font-semibold">Essential</span> – Required for the site to work (login, profile, bookmarks).
                </label>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="cookie-analytics"
                  checked
                  disabled
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#6A00B1]"
                />
                <label htmlFor="cookie-analytics" className="text-sm text-gray-700">
                  <span className="font-semibold">Google Analytics</span> – Required to measure site usage and improve our service.
                </label>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="cookie-preferences"
                  checked={preferences}
                  onChange={(e) => setPreferences(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#6A00B1] focus:ring-[#6A00B1]"
                />
                <label htmlFor="cookie-preferences" className="text-sm text-gray-700">
                  <span className="font-semibold">Preferences</span> – Saves your search and form preferences.
                </label>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2.5 bg-[#6A00B1] text-white text-sm font-semibold rounded-xl hover:bg-[#5A0091] transition-colors"
            >
              Accept all
            </button>
            {showDetails ? (
              <>
                <button
                  type="button"
                  onClick={handleAcceptSelection}
                  className="px-4 py-2.5 bg-[#6A00B1] text-white text-sm font-semibold rounded-xl hover:bg-[#5A0091] transition-colors"
                >
                  Save preferences
                </button>
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Essential only
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCustomize}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Customize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
