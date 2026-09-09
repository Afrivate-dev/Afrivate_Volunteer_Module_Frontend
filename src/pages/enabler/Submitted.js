import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EnablerNavbar from '../../components/auth/EnablerNavbar';
import { Clock } from 'lucide-react';

export default function Submitted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <EnablerNavbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 pt-24">
        <div className="bg-white rounded-[28px] border border-gray-100/90 shadow-sm max-w-[420px] w-full px-8 py-10 sm:px-10 sm:py-12 text-center animate-in fade-in zoom-in-95 duration-200">

          {/* Title */}
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#8D4087] tracking-tight mb-3">
            Submitted
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-[300px] mx-auto mb-7">
            Your concerns has been submitted Successfully.{' '}
            It will be reviewed by our{' '}
            <span className="text-[#8D4087] font-semibold">Support Team.</span>
          </p>

          {/* Verification Time card */}
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

          {/* Go to Home button */}
          <button
            type="button"
            onClick={() => navigate('/enabler/dashboard')}
            className="w-full bg-white hover:bg-[#FAF5FB] text-[#70236A] border border-[#70236A] font-semibold text-xs sm:text-sm py-3.5 px-4 rounded-xl transition duration-150 cursor-pointer mb-6"
          >
            Go to Home
          </button>

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
