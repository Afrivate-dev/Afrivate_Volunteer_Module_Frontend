import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EnablerNavbar from '../../components/auth/EnablerNavbar';
import { Clock } from 'lucide-react';

export default function Congratulations() {
  const navigate = useNavigate();

  const handleViewStatus = () => {
    navigate('/enabler/dashboard');
  };

  const handleUpgradeTier = () => {
    navigate('/org/show-work');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <EnablerNavbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 pt-20">
        <div className="bg-white rounded-[28px] border border-gray-100/90 shadow-sm max-w-[480px] w-full px-6 py-9 sm:px-10 sm:py-11 text-center transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header Title */}
          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight mb-3">
            Congratulations
          </h1>

          {/* Subtitle Message */}
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-[340px] mx-auto mb-7">
            Your professional information and documents have been successfully submitted.{' '}
            <span className="text-[#8D4087] font-semibold">Afrivate</span> will review your credentials.
          </p>

          {/* Verification Time Card */}
          <div className="bg-white border border-[#EBE3EE] rounded-2xl p-4 flex items-center gap-3.5 text-left mb-8 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#FAF5FB] flex items-center justify-center shrink-0 border border-purple-100/80">
              <Clock className="w-5 h-5 text-[#8D4087]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                Verification Time
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 font-normal">
                Typically reviewed within 24–48 hours
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleViewStatus}
              className="w-full bg-[#70236A] hover:bg-[#591B54] text-white font-semibold text-xs sm:text-sm py-3.5 px-4 rounded-xl transition duration-150 shadow-xs cursor-pointer"
            >
              View Application Status
            </button>

            <button
              type="button"
              onClick={handleUpgradeTier}
              className="w-full bg-white hover:bg-[#FAF5FB] text-[#70236A] border border-[#70236A] font-semibold text-xs sm:text-sm py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Upgrade to Tier 3</span>
              <svg
                className="w-3.5 h-3.5 stroke-current fill-none stroke-[2] inline ml-0.5"
                viewBox="0 0 24 24"
              >
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            </button>
          </div>

          {/* Footer Support Link */}
          <div className="text-[11px] sm:text-xs text-gray-400 text-center mt-6">
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
