import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon } from "lucide-react";
import OrganizationLayout from "../../components/layout/OrganizationLayout";

export default function EnablerProfile() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Organizational Profile - AfriVate";
  }, []);

  return (
    <OrganizationLayout activeItem="Organizational Profile">
      {/* ══════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-gray-500 block mb-1">
          Organizational Profile
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Organizational Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your AfriVate workspace information and preferences.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN WORKSPACE CARD (Matches Image 2)
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-16 min-h-[540px] flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-purple-50 text-[#843A7F] flex items-center justify-center mb-4 shadow-sm">
          <SettingsIcon size={26} strokeWidth={2} />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
          Organization Profile workspace
        </h3>

        <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-md leading-relaxed">
          This prototype focuses on the core verification and credentialing journeys.
        </p>

        <button
          onClick={() => navigate("/enabler/settings")}
          className="border border-gray-300 hover:bg-gray-50 active:scale-95 text-gray-700 text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
        >
          Explore settings
        </button>
      </div>
    </OrganizationLayout>
  );
}
