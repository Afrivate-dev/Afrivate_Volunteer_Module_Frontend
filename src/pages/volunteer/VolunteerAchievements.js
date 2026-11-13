import React, { useState, useEffect } from "react";
import {
  Crown,
  Plus,
  Check,
  Shield,
  X,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import VolunteerLayout from "../../components/layout/VolunteerLayout";
import { engagements as engagementsApi } from "../../services/api";

const BRAND_PURPLE = "#843A7F";

export default function VolunteerAchievements() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Goal Form State
  const [goalType, setGoalType] = useState("Complete verified engagements");
  const [targetValue, setTargetValue] = useState("2 engagements");
  const [targetDate, setTargetDate] = useState("31 December 2025");
  const [showPublic, setShowPublic] = useState(false);

  // Active Goal State
  const [activeGoal, setActiveGoal] = useState({
    title: "Complete two verified engagements",
    period: "Continuous tracking",
    progress: 0,
    progressText: "0 of 2 complete · Only organization-attested engagements count",
  });

  const [achievementsList, setAchievementsList] = useState([]);

  const handleSaveGoal = (e) => {
    e.preventDefault();
    setActiveGoal({
      title: `${goalType}: ${targetValue}`,
      period: `Goal period until ${targetDate}`,
      progress: 0,
      progressText: `In progress · Target: ${targetValue}`,
    });
    setIsModalOpen(false);
    setToastMessage("Personal volunteering goal saved!");
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    document.title = "Achievements & Goals - Volunteer - AfriVate";

    const loadData = async () => {
      setLoading(true);
      try {
        const engs = await engagementsApi.list();
        const list = Array.isArray(engs) ? engs : [];

        const verified = list.filter(
          (e) =>
            e.status?.toLowerCase() === "attested" ||
            e.status?.toLowerCase() === "certified" ||
            e.certificate_id
        );

        const totalHours = verified.reduce(
          (sum, e) => sum + (Number(e.hours_contributed) || 0),
          0
        );

        const verifiedCount = verified.length;

        // Sort verified to find earliest engagement
        const sorted = [...verified].sort((a, b) => {
          const da = new Date(a.end_date || a.created_at || 0);
          const db = new Date(b.end_date || b.created_at || 0);
          return da - db;
        });
        const firstEng = sorted[0];
        const firstDate = firstEng
          ? new Date(firstEng.end_date || firstEng.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : null;

        const dynamicAchievements = [
          {
            id: "ach-1",
            status: verifiedCount >= 1 ? "earned" : "locked",
            title: "First Verified Engagement",
            description: "Completed your first organization-attested volunteer engagement.",
            dateEarned: firstDate || "Pending completion",
            project: firstEng
              ? `${firstEng.title || firstEng.role || "Volunteer Engagement"} · ${firstEng.organization_name || "Verified Organization"}`
              : "Complete your first volunteer engagement to unlock",
            requirement: "1 Verified Engagement",
          },
          {
            id: "ach-2",
            status: verifiedCount >= 5 ? "earned" : "locked",
            title: "Dedicated Contributor",
            description: "Complete 5 organization-attested volunteer engagements.",
            requirement: `${verifiedCount} / 5 Verified Engagements`,
          },
          {
            id: "ach-3",
            status: totalHours >= 50 ? "earned" : "locked",
            title: "50 Verified Hours Milestone",
            description: "Document 50 hours across verified volunteer engagements.",
            requirement: `${totalHours} / 50 Verified Hours`,
          },
          {
            id: "ach-4",
            status: totalHours >= 100 ? "earned" : "locked",
            title: "100 Verified Hours Milestone",
            description: "Document 100 hours across verified volunteer engagements.",
            requirement: `${totalHours} / 100 Verified Hours`,
          },
          {
            id: "ach-5",
            status: totalHours >= 250 ? "earned" : "locked",
            title: "Community Champion Milestone",
            description: "Document 250 hours across verified volunteer engagements.",
            requirement: `${totalHours} / 250 Verified Hours`,
          },
        ];

        setAchievementsList(dynamicAchievements);

        setActiveGoal({
          title: "Complete two verified engagements",
          period: "Continuous tracking",
          progress: Math.min(100, Math.round((verifiedCount / 2) * 100)),
          progressText: `${Math.min(2, verifiedCount)} of 2 complete · Only organization-attested engagements count`,
        });
      } catch (err) {
        console.warn("Could not load engagements for achievements", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredAchievements = achievementsList.filter((item) => {
    if (activeFilter === "earned" && item.status !== "earned") return false;
    if (activeFilter === "inprogress" && item.status !== "locked") return false;
    return true;
  });

  return (
    <VolunteerLayout activeItem="Achievements">
      {/* ══════════════════════════════════════════════════════
          SET A PERSONAL VOLUNTEERING GOAL MODAL (Image 5)
      ══════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Set a personal volunteering goal
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              Goals are private by default and do not affect your credentials, profile standing, or access to AfriVate.
            </p>

            <form onSubmit={handleSaveGoal} className="space-y-5">
              {/* Goal type dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Goal type
                </label>
                <div className="relative">
                  <select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition appearance-none cursor-pointer pr-10"
                  >
                    <option value="Complete verified engagements">
                      Complete verified engagements
                    </option>
                    <option value="Document a supported skill">
                      Document a supported skill
                    </option>
                    <option value="Reach a verified hour milestone">
                      Reach a verified hour milestone
                    </option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Target & Target Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Target
                  </label>
                  <input
                    type="text"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g. 2 engagements"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Target date
                  </label>
                  <input
                    type="text"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    placeholder="31 December 2025"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
                  />
                </div>
              </div>

              {/* Public Checkbox */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="showPublicCheckbox"
                  checked={showPublic}
                  onChange={(e) => setShowPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#843A7F] focus:ring-[#843A7F]/20"
                />
                <label
                  htmlFor="showPublicCheckbox"
                  className="text-xs text-gray-600 cursor-pointer select-none"
                >
                  Show this goal on my public experience portfolio
                </label>
              </div>

              {/* Footer buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#843A7F] hover:bg-[#6e2e6a] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
                >
                  Save private goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Banner */}
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
            Achievements
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Achievements & Goals
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Recognition for verified contributions and meaningful portfolio progress.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-[#0B7B69] hover:bg-[#096657] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Set Personal Goal</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          PROFESSIONAL MILESTONES BANNER (Image 4)
      ══════════════════════════════════════════════════════ */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-sm relative overflow-hidden"
        style={{ backgroundColor: BRAND_PURPLE }}
      >
        <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest block mb-4">
          PROFESSIONAL MILESTONES
        </span>

        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <Crown size={26} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black">3</span>
              <h2 className="text-xl sm:text-2xl font-bold">
                Achievements Earned
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl leading-relaxed">
              Achievements reflect completed criteria. They are separate from official credentials.
            </p>
          </div>
        </div>

        {/* Next Milestone Box */}
        <div className="pt-4 border-t border-white/15">
          <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block mb-1">
            NEXT MILESTONE
          </span>
          <p className="text-sm font-bold text-white">
            Three Verified Engagements
          </p>
          <p className="text-xs text-purple-200 mt-0.5">
            2 of 3 Qualifying Engagements Complete
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          YOUR ACHIEVEMENT COLLECTION (Image 4)
      ══════════════════════════════════════════════════════ */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Your achievement collection
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Only attested engagements count toward contribution achievements.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === "all"
                ? "bg-gray-900 text-white shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("earned")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === "earned"
                ? "bg-gray-900 text-white shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Earned
          </button>
          <button
            onClick={() => setActiveFilter("inprogress")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === "inprogress"
                ? "bg-gray-900 text-white shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            In progress
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ACHIEVEMENT CARDS GRID (Matches Image 4)
      ══════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#843A7F] border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAchievements.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Top Row: Icon & Status Badge */}
              <div className="flex items-center justify-between mb-4">
                {item.status === "earned" ? (
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Check size={16} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
                    <Shield size={16} />
                  </div>
                )}

                {item.status === "earned" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Earned
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-900 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Locked
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 leading-tight">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                {item.description}
              </p>
            </div>

            {/* Bottom Info block */}
            <div className="pt-4 border-t border-gray-100">
              {item.status === "earned" ? (
                <div>
                  <div className="flex justify-between items-center text-[10px] font-medium text-gray-400">
                    <span className="uppercase font-bold tracking-wider">
                      DATE EARNED
                    </span>
                    <span className="font-semibold text-gray-700">
                      {item.dateEarned}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate mt-1">
                    {item.project}
                  </p>
                </div>
              ) : (
                <div className="flex justify-between items-center text-[10px] font-medium text-gray-400">
                  <span className="uppercase font-bold tracking-wider">
                    REQUIREMENT
                  </span>
                  <span className="font-semibold text-gray-700">
                    {item.requirement}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Card 6: Active Personal Goal (Matches Image 4 bottom-right) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-900">
                Active personal goal
              </h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-lg transition"
              >
                Edit goal
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mb-4">
              Private by default · No inactivity penalties
            </p>

            {/* Inner box */}
            <div className="bg-gray-50/60 rounded-xl p-3.5 border border-gray-100">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {activeGoal.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {activeGoal.period}
                  </p>

                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-3 mb-1.5">
                    <div
                      className="bg-[#0B7B69] h-full rounded-full"
                      style={{ width: `${activeGoal.progress}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400">
                    {activeGoal.progressText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </VolunteerLayout>
  );
}

