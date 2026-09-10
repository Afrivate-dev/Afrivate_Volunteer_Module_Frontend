import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import EnablerNavbar from '../../components/auth/EnablerNavbar';

export default function VerificationStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'review'; // 'review' | 'failed'

  const isFailed = status === 'failed';

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <EnablerNavbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 pt-24">
        <div className="bg-white rounded-[28px] border border-gray-100/90 shadow-sm max-w-[480px] w-full px-6 py-9 sm:px-10 sm:py-11 text-center relative animate-in fade-in zoom-in-95 duration-200">

          {/* Back arrow — only shown on failed */}
          {isFailed && (
            <button
              onClick={() => navigate(-1)}
              className="absolute top-5 left-5 w-8 h-8 flex items-center justify-center rounded-full bg-[#F3EEF4] text-[#8D4087] hover:bg-purple-100 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" />
              </svg>
            </button>
          )}

          {/* Status icon */}
          {isFailed ? (
            /* Red circle with X */
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-red-100/60" />
                <div className="absolute inset-3 rounded-full bg-red-200/60" />
                {/* Inner circle */}
                <div className="relative w-16 h-16 rounded-full bg-[#C0392B] flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            /* Golden shield with checkmark */
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-yellow-100/70" />
                <div className="absolute inset-3 rounded-full bg-yellow-200/60" />
                {/* Shield icon */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-14 h-14 text-[#F5A623] drop-shadow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" />
                  </svg>
                  <svg className="absolute w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Status text */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Status:{' '}
            <span className={isFailed ? 'text-[#C0392B]' : 'text-[#E67E22]'}>
              {isFailed ? 'Failed' : 'Under Review'}
            </span>
          </h1>

          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-[320px] mx-auto mb-7">
            {isFailed
              ? 'Unfortunately, your professional credentials did not match.'
              : 'Our Support team is currently verifying your professional credentials.'}
          </p>

          {/* Info card — only on under review */}
          {!isFailed && (
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-3 text-left mb-8 text-xs text-gray-600 shadow-xs">
              <span className="mt-0.5 text-[#8D4087] shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
              <span>
                When your verification is complete, you will receive a notification and can start creating opportunities.
              </span>
            </div>
          )}

          {/* Action button */}
          {isFailed ? (
            <button
              type="button"
              onClick={() => navigate('/enabler/registration')}
              className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white font-semibold text-sm py-3.5 px-4 rounded-xl transition duration-150 shadow-xs cursor-pointer mb-6"
            >
              Reapply
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/enabler/dashboard')}
              className="w-full bg-white hover:bg-[#FAF5FB] text-[#70236A] border border-[#70236A] font-semibold text-sm py-3.5 px-4 rounded-xl transition duration-150 cursor-pointer mb-6"
            >
              Contact Support
            </button>
          )}

          {/* Footer support link */}
          <div className="text-[11px] sm:text-xs text-gray-400 text-center">
            Need help?{' '}
            <Link
              to="/support"
              className="text-[#70236A] hover:text-[#591B54] font-medium hover:underline cursor-pointer"
            >
              Contact Afrivate Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
