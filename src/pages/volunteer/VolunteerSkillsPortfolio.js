import React, { useState, useEffect } from "react";
import {
  Shield,
  PlusCircle,
  FileText,
  ChevronRight,
  X,
  CheckCircle2,
  Globe,
  Lock,
} from "lucide-react";
import VolunteerLayout from "../../components/layout/VolunteerLayout";
import { engagements as engagementsApi, profile as profileApi } from "../../services/api";

export default function VolunteerSkillsPortfolio() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [skillsList, setSkillsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // New Skill Form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDesc, setNewSkillDesc] = useState("");
  const [isPublicPortfolio, setIsPublicPortfolio] = useState(true);

  // Summary Metrics
  const [summaryStats, setSummaryStats] = useState({
    supportedSkills: 0,
    verifiedEngagements: 0,
    organizations: 0,
    lastUpdated: "Today",
  });

  useEffect(() => {
    document.title = "Skills Portfolio - Volunteer - AfriVate";

    const loadData = async () => {
      setLoading(true);
      try {
        const [engsRes, pfRes] = await Promise.allSettled([
          engagementsApi.list(),
          profileApi.pathfinderGet(),
        ]);

        const engs = engsRes.status === "fulfilled" && Array.isArray(engsRes.value) ? engsRes.value : [];
        const pf = pfRes.status === "fulfilled" && pfRes.value ? pfRes.value : null;

        const verified = engs.filter(
          (e) =>
            e.status?.toLowerCase() === "attested" ||
            e.status?.toLowerCase() === "certified" ||
            e.certificate_id
        );
        const orgSet = new Set(
          engs.map((e) => e.organization_name || e.organization).filter(Boolean)
        );

        // Group skills from verified engagements
        const skillMap = {};
        verified.forEach((e) => {
          const list = Array.isArray(e.skills) ? e.skills : [];
          list.forEach((s) => {
            const name = typeof s === "string" ? s : s?.name;
            if (name) {
              if (!skillMap[name]) {
                skillMap[name] = {
                  id: `skill-${name}`,
                  initials: name.slice(0, 2).toUpperCase(),
                  name,
                  status: "Supported",
                  type: "supported",
                  description: `Verified skill documented through your contributions with ${e.organization_name || "partner organization"}.`,
                  engagementsCount: 0,
                  primaryEngagement: e.title || e.role || "Volunteer Engagement",
                };
              }
              skillMap[name].engagementsCount += 1;
            }
          });
        });

        // Add self-selected skills from pathfinder profile
        if (pf && Array.isArray(pf.skills)) {
          pf.skills.forEach((s, idx) => {
            const name = typeof s === "string" ? s : s?.name;
            if (name && !skillMap[name]) {
              skillMap[name] = {
                id: `pf-skill-${idx}`,
                initials: name.slice(0, 2).toUpperCase(),
                name,
                status: "Self-selected",
                type: "self-selected",
                description: "Skill interest identified by volunteer.",
                engagementsCount: 0,
                primaryEngagement: "Personal skill interest",
              };
            }
          });
        }

        const list = Object.values(skillMap);
        setSkillsList(list);

        const supportedCount = list.filter((s) => s.type === "supported").length;
        setSummaryStats({
          supportedSkills: supportedCount,
          verifiedEngagements: verified.length,
          organizations: orgSet.size,
          lastUpdated: "Today",
        });
      } catch (e) {
        console.warn("Could not load backend engagements", e);
        setSkillsList([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const initials = newSkillName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "SK";

    const newSkill = {
      id: `skill-${Date.now()}`,
      initials,
      name: newSkillName.trim(),
      status: "Self-selected",
      type: "self-selected",
      description: newSkillDesc.trim() || "Documented interest by volunteer.",
      engagementsCount: 0,
      primaryEngagement: "Personal skill interest",
    };

    setSkillsList([newSkill, ...skillsList]);
    setIsAddModalOpen(false);
    setNewSkillName("");
    setNewSkillDesc("");
    setToastMessage("Skill interest added to your portfolio!");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredSkills = skillsList.filter((item) => {
    if (activeFilter === "supported" && item.type !== "supported") return false;
    if (activeFilter === "self-selected" && item.type !== "self-selected") return false;
    return true;
  });

  const supportedCount = skillsList.filter((s) => s.type === "supported").length;

  return (
    <VolunteerLayout activeItem="Skills Portfolio">
      {/* ══════════════════════════════════════════════════════
          ADD SKILL MODAL
      ══════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Add skill interest
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Document a new skill interest to signal your capabilities and learning interests to volunteer coordinators.
            </p>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Skill title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Analysis, Graphic Design"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0B7B69]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Context / Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your background or practical interest in this skill area..."
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0B7B69]"
                />
              </div>

              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-[11px] text-teal-800 leading-relaxed">
                Self-selected skills remain distinct from organization-supported skills until attested through an active engagement.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0B7B69] hover:bg-[#096657] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                >
                  Add skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MANAGE PUBLIC VISIBILITY MODAL
      ══════════════════════════════════════════════════════ */}
      {isVisibilityModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsVisibilityModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Manage public visibility
              </h3>
              <button
                type="button"
                onClick={() => setIsVisibilityModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Choose how your verified skills and portfolio appear to organizations and recruiters.
            </p>

            <div className="space-y-4 mb-6">
              <div
                onClick={() => setIsPublicPortfolio(true)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                  isPublicPortfolio
                    ? "border-[#0B7B69] bg-teal-50/30"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    Public portfolio
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Anyone with your profile link can view your attested skills and verified hours.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setIsPublicPortfolio(false)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                  !isPublicPortfolio
                    ? "border-[#0B7B69] bg-teal-50/30"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    Private portfolio
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Only organizations you actively apply to can see your skills portfolio.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsVisibilityModalOpen(false);
                setToastMessage("Portfolio visibility updated.");
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="w-full bg-[#0B7B69] hover:bg-[#096657] text-white text-xs sm:text-sm font-semibold py-2.5 rounded-xl transition shadow-sm cursor-pointer"
            >
              Save visibility setting
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SKILL DETAIL MODAL
      ══════════════════════════════════════════════════════ */}
      {selectedSkill && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSkill(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 font-bold text-sm flex items-center justify-center">
                  {selectedSkill.initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {selectedSkill.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
                      selectedSkill.type === "supported"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-blue-50 text-blue-700 border border-blue-200/60"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedSkill.type === "supported"
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                      }`}
                    />
                    {selectedSkill.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              {selectedSkill.description}
            </p>

            <div className="space-y-3 bg-gray-50 rounded-2xl p-4 text-xs text-gray-700 border border-gray-100 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Verified engagements:</span>
                <span className="font-bold text-gray-900">
                  {selectedSkill.engagementsCount} engagements
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Primary engagement:</span>
                <span className="font-semibold text-gray-800">
                  {selectedSkill.primaryEngagement}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSkill(null)}
              className="w-full bg-gray-900 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow-sm cursor-pointer"
            >
              Close details
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-gray-500 block mb-1">
            Skills Portfolio
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Skills Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Skills documented through your volunteer experience, with clear evidence context.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto bg-[#0B7B69] hover:bg-[#096657] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>Add skill interest</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          BLUE NOTICE BANNER (Matches Image)
      ══════════════════════════════════════════════════════ */}
      <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 mb-7">
        <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
          <Shield size={16} />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#1E3A8A]">
            Supported does not mean independently certified
          </h3>
          <p className="text-xs text-[#3B82F6] mt-0.5 leading-relaxed">
            Supported skills were included in an engagement attested by an organization. AfriVate does not independently certify professional proficiency.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN 2-COLUMN SECTION: (Skills List 8 cols, Summary 4 cols)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Documented Skills List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header & Filter Tabs */}
          <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Documented skills
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {skillsList.length} skills · {supportedCount} supported by attested experience
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === "all"
                    ? "bg-white text-gray-900 shadow-2xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("supported")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === "supported"
                    ? "bg-white text-gray-900 shadow-2xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Supported
              </button>
              <button
                onClick={() => setActiveFilter("self-selected")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === "self-selected"
                    ? "bg-white text-gray-900 shadow-2xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Self-selected
              </button>
            </div>
          </div>

          {/* List of skills */}
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0B7B69] border-t-transparent" />
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center mx-auto mb-3">
                <FileText size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                No skills documented yet
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {activeFilter !== "all"
                  ? `No skills found in the "${activeFilter}" filter.`
                  : "Skills documented through completed volunteer engagements or added by you will appear here."}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 bg-[#0B7B69] hover:bg-[#096657] text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>Add skill interest</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSkills.map((skill, idx) => (
                <div
                  key={`${skill.id}-${idx}`}
                  onClick={() => setSelectedSkill(skill)}
                  className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition cursor-pointer group"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Initials badge */}
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {skill.initials}
                    </div>

                    {/* Skill Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">
                          {skill.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            skill.type === "supported"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-blue-50 text-blue-700 border border-blue-200/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              skill.type === "supported"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                          />
                          {skill.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {skill.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2.5 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>{skill.engagementsCount} verified engagements</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FileText size={13} />
                          <span>{skill.primaryEngagement}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-gray-600 transition-colors shrink-0"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Portfolio Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
            <h2 className="text-base font-bold text-gray-900 mb-6">
              Portfolio summary
            </h2>

            {/* Circular Donut Meter */}
            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#D1FAE5"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#0B7B69"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset={summaryStats.supportedSkills > 0 ? "66" : "264"}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none">
                    {loading ? "—" : summaryStats.supportedSkills}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium mt-1">
                    supported skills
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Rows */}
            <div className="border-t border-gray-100 pt-5 mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  Verified engagements
                </span>
                <span className="font-bold text-gray-900">
                  {loading ? "—" : summaryStats.verifiedEngagements}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  Organizations
                </span>
                <span className="font-bold text-gray-900">
                  {loading ? "—" : summaryStats.organizations}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  Last updated
                </span>
                <span className="font-bold text-gray-900">
                  {summaryStats.lastUpdated}
                </span>
              </div>
            </div>

            {/* Bottom Button */}
            <button
              onClick={() => setIsVisibilityModalOpen(true)}
              className="w-full mt-6 border border-gray-200 hover:bg-gray-50 active:scale-[0.98] text-gray-700 text-xs sm:text-sm font-semibold py-2.5 rounded-xl transition shadow-2xs text-center cursor-pointer"
            >
              Manage public visibility
            </button>
          </div>
        </div>
      </div>
    </VolunteerLayout>
  );
}
