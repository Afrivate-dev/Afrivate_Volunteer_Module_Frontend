import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Award,
  Clock,
  TrendingUp,
  ArrowRight,
  Check,
} from "lucide-react";
import VolunteerLayout from "../../components/layout/VolunteerLayout";
import { useUser } from "../../context/UserContext";
import { engagements as engagementsApi, profile as profileApi } from "../../services/api";

export default function VolunteerOverview() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [stats, setStats] = useState({
    verifiedEngagements: 0,
    credentialsEarned: 0,
    verifiedHours: 0,
    pendingConfirmations: 0,
  });
  const [skillsList, setSkillsList] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);
  const [pendingItem, setPendingItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName =
    user?.first_name ||
    (user?.name ? user.name.split(" ")[0] : null) ||
    user?.email?.split("@")[0] ||
    "Volunteer";

  useEffect(() => {
    document.title = "Overview - Volunteer - AfriVate";

    const loadData = async () => {
      setLoading(true);
      try {
        const [engRes, credRes, pfRes] = await Promise.allSettled([
          engagementsApi.list(),
          profileApi.credentialsList(),
          profileApi.pathfinderGet(),
        ]);

        const engList =
          engRes.status === "fulfilled" && Array.isArray(engRes.value)
            ? engRes.value
            : [];
        const credList =
          credRes.status === "fulfilled" && Array.isArray(credRes.value)
            ? credRes.value
            : [];
        const pfData =
          pfRes.status === "fulfilled" && pfRes.value ? pfRes.value : null;

        const verified = engList.filter(
          (e) =>
            e.status?.toLowerCase() === "attested" ||
            e.status?.toLowerCase() === "certified" ||
            e.certificate_id
        );
        const pending = engList.filter(
          (e) =>
            e.status?.toLowerCase().includes("pending") ||
            e.status?.toLowerCase().includes("review") ||
            e.status?.toLowerCase() === "submitted"
        );
        const hours = verified.reduce(
          (sum, e) => sum + (Number(e.hours_contributed) || 0),
          0
        );

        setStats({
          verifiedEngagements: verified.length,
          credentialsEarned: credList.length || verified.length,
          verifiedHours: hours,
          pendingConfirmations: pending.length,
        });

        // Derive real skills from verified engagements and pathfinder profile
        const skillCounts = {};
        verified.forEach((e) => {
          const list = Array.isArray(e.skills) ? e.skills : [];
          list.forEach((s) => {
            const name = typeof s === "string" ? s : s?.name;
            if (name) skillCounts[name] = (skillCounts[name] || 0) + 1;
          });
        });
        if (pfData && Array.isArray(pfData.skills)) {
          pfData.skills.forEach((s) => {
            const name = typeof s === "string" ? s : s?.name;
            if (name && !skillCounts[name]) skillCounts[name] = 1;
          });
        }
        const derivedSkills = Object.entries(skillCounts).map(([name, count]) => ({
          name,
          count,
          percentage: Math.min(100, Math.max(30, count * 25)),
        }));
        setSkillsList(derivedSkills.slice(0, 5));

        // Derive chronological timeline items
        const sortedVerified = [...verified].sort((a, b) => {
          const da = new Date(a.end_date || a.created_at || 0);
          const db = new Date(b.end_date || b.created_at || 0);
          return db - da;
        });
        setTimelineItems(sortedVerified);

        // Pending item if any
        if (pending.length > 0) {
          setPendingItem(pending[0]);
        } else {
          setPendingItem(null);
        }
      } catch (e) {
        console.warn("Failed to load volunteer data", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const goalProgress = Math.min(
    100,
    Math.round((stats.verifiedEngagements / 2) * 100)
  );

  return (
    <VolunteerLayout activeItem="Over View">
      {/* ══════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-gray-500 block mb-1">
          Overview
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Good morning, {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Track your contributions and share verified records of your experience.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          4 STAT METRIC CARDS (2x2 on Mobile, 4 Cols on Desktop)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-7">
        {/* Card 1: Verified engagements */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">
              Verified engagements
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#843A7F] flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {loading ? "—" : stats.verifiedEngagements}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-2">
            <TrendingUp size={13} />
            <span>Active contributions</span>
          </div>
        </div>

        {/* Card 2: Credentials earned */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">
              Credentials earned
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {loading ? "—" : stats.credentialsEarned}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-2">
            <TrendingUp size={13} />
            <span>Verified credentials</span>
          </div>
        </div>

        {/* Card 3: Verified hours */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">
              Verified hours
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {loading ? "—" : stats.verifiedHours}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 mt-2">
            <span>Organization attested</span>
          </div>
        </div>

        {/* Card 4: Pending Confirmations */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">
              Pending Confirmations
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {loading ? "—" : stats.pendingConfirmations}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-2">
            <span>Awaiting organization review</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT GRID (2 COLUMNS: LEFT 7, RIGHT 5)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Skills Profile & Personal Goal */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Your skills profile */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Your skills profile
              </h2>
              <button
                onClick={() => navigate("/volunteer/skills-portfolio")}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Open portfolio</span>
                <ArrowRight size={13} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Supported by attested engagements
            </p>

            {loading ? (
              <div className="py-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#843A7F] border-t-transparent" />
              </div>
            ) : skillsList.length === 0 ? (
              <div className="py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs font-semibold text-gray-700">
                  No skills documented yet
                </p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                  Skills will appear here as organizations attest your contributions.
                </p>
                <button
                  onClick={() => navigate("/volunteer/home")}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#843A7F] hover:underline"
                >
                  <span>Explore opportunities</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {skillsList.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-medium text-gray-700 mb-1.5">
                      <span className="w-36 truncate">{skill.name}</span>
                      <div className="flex-1 mx-4 flex items-center">
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0B7B69] h-full rounded-full transition-all duration-300"
                            style={{ width: `${skill.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-gray-400 text-[11px] shrink-0">
                        {skill.count} {skill.count === 1 ? "engagement" : "engagements"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mobile Open Portfolio Button */}
            <button
              onClick={() => navigate("/volunteer/skills-portfolio")}
              className="w-full mt-5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Open portfolio</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Card: Personal goal */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Personal goal
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                ● {Math.min(2, stats.verifiedEngagements)} of 2
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Private · Continuous tracking
            </p>

            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Award size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                    Complete two verified engagements
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {stats.verifiedEngagements >= 2
                      ? "Milestone completed! Keep contributing to earn higher achievements."
                      : `${2 - stats.verifiedEngagements} more attested engagement will complete this goal.`}
                  </p>

                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3 mb-2">
                    <div
                      className="bg-[#0B7B69] h-full rounded-full transition-all duration-300"
                      style={{ width: `${goalProgress}%` }}
                    />
                  </div>

                  <button
                    onClick={() => navigate("/volunteer/achievements")}
                    className="w-full mt-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center transition cursor-pointer"
                  >
                    View goals and achievements
                  </button>
                </div>
              </div>
            </div>

            {/* Disclaimer yellow box */}
            <div className="bg-[#FFFBEB] rounded-xl p-3 border border-amber-200/50 text-[11px] text-amber-800 leading-relaxed font-medium">
              <span className="font-bold">Goals are private by default.</span>
              <br />
              Goals never affect credential validity or verification status.
            </div>
          </div>

          {/* Pending notification item (only rendered when there is a real pending engagement) */}
          {pendingItem && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                  {pendingItem.organization_name
                    ? pendingItem.organization_name.slice(0, 2).toUpperCase()
                    : "PE"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {pendingItem.title || pendingItem.role || "Volunteer engagement"} is awaiting confirmation
                  </p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {pendingItem.organization_name || "Organization"} · {pendingItem.hours_contributed || "0"} recorded hours
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Not verified experience
              </span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Verified experience timeline */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Verified experience timeline
              </h2>
              <button
                onClick={() => navigate("/volunteer/engagements")}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Chronological record of organization-attested contributions
            </p>

            {loading ? (
              <div className="py-10 flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#843A7F] border-t-transparent" />
              </div>
            ) : timelineItems.length === 0 ? (
              <div className="py-10 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs font-semibold text-gray-700">
                  No verified experience yet
                </p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                  Once an organization attests your completed engagement, your timeline will appear here.
                </p>
                <button
                  onClick={() => navigate("/volunteer/home")}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#843A7F] hover:underline"
                >
                  <span>Find an opportunity</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            ) : (
              /* Timeline wrapper with line */
              <div className="relative pl-7 space-y-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {timelineItems.slice(0, 3).map((item, idx) => {
                  const rawDate = item.end_date || item.created_at;
                  const formattedDate = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-GB", {
                        month: "short",
                        year: "numeric",
                      }).toUpperCase()
                    : "VERIFIED";

                  return (
                    <div key={item.id || idx} className="relative">
                      {/* Dot */}
                      <div className="absolute -left-7 top-0.5 w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shadow-xs border border-teal-100">
                        <Check size={13} strokeWidth={3} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {formattedDate}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            Verified experience
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-gray-900 leading-tight">
                          {item.title || item.role || "Volunteer Engagement"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.role || "Volunteer"} · {item.organization_name || "Verified Organization"}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {Array.isArray(item.skills) &&
                            item.skills.slice(0, 2).map((sk, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-gray-50 text-gray-600 border border-gray-200/60 font-medium"
                              >
                                {typeof sk === "string" ? sk : sk?.name}
                              </span>
                            ))}
                          {item.hours_contributed && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] bg-gray-50 text-gray-600 border border-gray-200/60 font-medium">
                              {item.hours_contributed} verified hours
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <button
                            onClick={() => navigate("/volunteer/credentials")}
                            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer"
                          >
                            View credential
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </VolunteerLayout>
  );
}
