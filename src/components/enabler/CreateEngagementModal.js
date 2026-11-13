import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { organization } from "../../services/api";

export default function CreateEngagementModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    volunteerName: "",
    engagementTitle: "",
    volunteerRole: "",
    projectName: "",
    startDate: "",
    endDate: "",
    hours: "",
    attestor: "Authorized Attestor",
    responsibilities: "",
  });

  const [attestorOptions, setAttestorOptions] = useState([
    "Authorized Attestor",
  ]);

  useEffect(() => {
    if (isOpen) {
      // Load real representatives for the dropdown
      const loadReps = async () => {
        try {
          const orgs = await organization.mine();
          if (Array.isArray(orgs) && orgs.length > 0) {
            const orgId = orgs[0].id;
            const reps = await organization.representatives.list(orgId);
            if (Array.isArray(reps) && reps.length > 0) {
              const names = reps
                .map((r) => r.name || (r.user ? `${r.user.first_name || ""} ${r.user.last_name || ""}`.trim() : "") || r.work_email)
                .filter(Boolean);
              if (names.length > 0) {
                setAttestorOptions(names);
                setFormData((prev) => ({ ...prev, attestor: names[0] }));
              }
            }
          }
        } catch (e) {
          console.warn("Could not load organization representatives for dropdown", e);
        }
      };
      loadReps();
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (isDraft = false) => {
    if (!isDraft && (!formData.volunteerName.trim() || !formData.engagementTitle.trim())) {
      alert("Please enter the volunteer name and engagement title.");
      return;
    }

    const name = formData.volunteerName.trim() || "New Volunteer";
    const initials =
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "NV";

    const newRecord = {
      id: String(Date.now()),
      initials,
      avatarBg: "bg-purple-100 text-purple-800",
      volunteer: name,
      role: formData.volunteerRole.trim() || "Field Support Volunteer",
      engagement: formData.engagementTitle.trim() || "Community Health Outreach",
      hours: formData.hours ? `${formData.hours} hrs` : "—",
      status: isDraft ? "Draft" : "Awaiting review",
      statusCls: isDraft
        ? "bg-gray-100 text-gray-600 border-gray-200/60"
        : "bg-amber-50 text-amber-700 border-amber-200/60",
      dotCls: isDraft ? "bg-gray-400" : "bg-amber-500",
      endDate: formData.endDate || "14 Jun 2025",
      filterGroup: isDraft ? "all" : "attention",
      project: formData.projectName || "Healthy Lagos 2025",
      responsibilities: formData.responsibilities,
    };

    if (onSuccess) {
      onSuccess(newRecord, isDraft);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Create volunteer engagement
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Volunteer name or account ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Volunteer name or account ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.volunteerName}
                onChange={(e) =>
                  setFormData({ ...formData, volunteerName: e.target.value })
                }
                placeholder="Search by name or email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
              />
            </div>

            {/* Engagement title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Engagement title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.engagementTitle}
                onChange={(e) =>
                  setFormData({ ...formData, engagementTitle: e.target.value })
                }
                placeholder="e.g. Community Health Outreach"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
              />
            </div>

            {/* Volunteer role */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Volunteer role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.volunteerRole}
                onChange={(e) =>
                  setFormData({ ...formData, volunteerRole: e.target.value })
                }
                placeholder="e.g. Field Support Volunteer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
              />
            </div>

            {/* Project name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Project name
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                placeholder="Healthy Lagos 2025"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
              />
            </div>

            {/* Start date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Start date
              </label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                placeholder="DD / MM / YYYY"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
              />
            </div>

            {/* End date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                End date
              </label>
              <input
                type="text"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                placeholder="DD / MM / YYYY"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
              />
            </div>

            {/* Hours contributed */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Hours contributed
              </label>
              <input
                type="text"
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: e.target.value })
                }
                placeholder="e.g. 40"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
              />
            </div>

            {/* Authorized attestor */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Authorized attestor
              </label>
              <div className="relative">
                <select
                  value={formData.attestor}
                  onChange={(e) =>
                    setFormData({ ...formData, attestor: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition appearance-none cursor-pointer pr-10"
                >
                  {attestorOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Responsibilities and contribution */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Responsibilities and contribution <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.responsibilities}
              onChange={(e) =>
                setFormData({ ...formData, responsibilities: e.target.value })
              }
              placeholder="Describe the volunteer's responsibilities and contribution..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition resize-none"
            />
          </div>
        </div>

        {/* Footer actions (Stacked on mobile as in Screenshot 1, flex row on desktop) */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto order-1 sm:order-3 bg-[#843A7F] hover:bg-[#6e2e6a] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-6 py-3 sm:py-2.5 rounded-xl transition shadow-sm text-center"
          >
            Create engagement
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto order-2 sm:order-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold px-5 py-3 sm:py-2.5 rounded-xl transition text-center"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto order-3 sm:order-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold px-5 py-3 sm:py-2.5 rounded-xl transition text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
