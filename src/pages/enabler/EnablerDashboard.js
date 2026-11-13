import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Package,
  Clock,
  Shield,
  FileCheck,
  CheckCircle2,
  Bell,
} from "lucide-react";
import OrganizationLayout from "../../components/layout/OrganizationLayout";
import { useUser } from "../../context/UserContext";
import {
  organization,
  opportunities,
  applications,
  engagements,
  notifications,
} from "../../services/api";
import CreateEngagementModal from "../../components/enabler/CreateEngagementModal";

const BRAND_PURPLE = "#843A7F";

export default function EnablerDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [loading, setLoading] = useState(true);

  // Real backend states
  const [org, setOrg] = useState(null);
  const [metrics, setMetrics] = useState({
    totalEngagements: 0,
    activeVolunteers: 0,
    credentialsIssued: 0,
    pendingConfirmations: 0,
  });
  const [recentEngagements, setRecentEngagements] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    document.title = "Overview - Organization - AfriVate";
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [orgsRes, oppsRes, appsRes, engsRes, pendingAttsRes, notifsRes] =
          await Promise.allSettled([
            organization.mine(),
            opportunities.mine(),
            applications.list(),
            engagements.list(),
            engagements.pendingAttestations(),
            notifications.list(),
          ]);

        if (!isMounted) return;

        // 1. Organization
        const orgList = orgsRes.status === "fulfilled" && Array.isArray(orgsRes.value) ? orgsRes.value : [];
        const currentOrg = orgList[0] || null;
        setOrg(currentOrg);

        // 2. Counts & collections
        const opps = oppsRes.status === "fulfilled" && Array.isArray(oppsRes.value) ? oppsRes.value : [];
        const apps = appsRes.status === "fulfilled" && Array.isArray(appsRes.value) ? appsRes.value : [];
        const engs = engsRes.status === "fulfilled" && Array.isArray(engsRes.value) ? engsRes.value : [];
        const pendingAtts =
          pendingAttsRes.status === "fulfilled" && Array.isArray(pendingAttsRes.value)
            ? pendingAttsRes.value
            : [];
        const notifs =
          notifsRes.status === "fulfilled" && Array.isArray(notifsRes.value)
            ? notifsRes.value
            : notifsRes.status === "fulfilled" && Array.isArray(notifsRes.value?.results)
            ? notifsRes.value.results
            : [];

        // Compute metrics
        const totalEngagementsCount = opps.length + engs.length;
        const volunteerNames = new Set([
          ...apps.map((a) => a.pathfinder_name || a.pathfinder || a.applicant_name).filter(Boolean),
          ...engs.map((e) => e.volunteer_name || e.pathfinder_name).filter(Boolean),
        ]);
        const activeVolunteersCount = volunteerNames.size;
        const credentialsIssuedCount = engs.filter(
          (e) => e.status === "attested" || e.certificate_id
        ).length;
        const pendingConfirmationsCount =
          pendingAtts.length +
          apps.filter((a) => a.status === "pending" || a.status === "submitted").length;

        setMetrics({
          totalEngagements: totalEngagementsCount,
          activeVolunteers: activeVolunteersCount,
          credentialsIssued: credentialsIssuedCount,
          pendingConfirmations: pendingConfirmationsCount,
        });

        // 3. Format recent engagements list
        const formattedList = [];

        // Add pending attestations first (highest priority)
        pendingAtts.forEach((record) => {
          const vName = record.volunteer_name || "Volunteer";
          const initials = vName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "VO";
          formattedList.push({
            id: record.id,
            name: vName,
            initials,
            email: record.volunteer_email || "volunteer@afrivate.com",
            avatarBg: "bg-teal-100 text-teal-800",
            engagement: record.role_title || "Volunteer Engagement",
            status: "Awaiting review",
            statusCls: "bg-amber-50 text-amber-700 border-amber-200/60",
            dotCls: "bg-amber-500",
            updated: "Requires review",
            timeAgo: "2h ago",
          });
        });

        // Add other engagements
        engs.forEach((e) => {
          if (formattedList.some((item) => String(item.id) === String(e.id))) return;
          const vName = e.volunteer_name || e.pathfinder_name || "Volunteer";
          const initials = vName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "VO";

          const isAttested = e.status === "attested" || e.certificate_id;
          formattedList.push({
            id: e.id,
            name: vName,
            initials,
            email: e.volunteer_email || "",
            avatarBg: isAttested ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800",
            engagement: e.role_title || "Volunteer Engagement",
            status: isAttested ? "Credential issued" : "Confirmed",
            statusCls: isAttested
              ? "bg-blue-50 text-blue-700 border-blue-200/60"
              : "bg-emerald-50 text-emerald-700 border-emerald-200/60",
            dotCls: isAttested ? "bg-blue-500" : "bg-emerald-500",
            updated: e.updated_at ? "Recently" : "Active",
            timeAgo: isAttested ? "4 days ago" : "Yesterday",
          });
        });

        // Add applicant activities if list has few items
        apps.slice(0, 5).forEach((app) => {
          if (formattedList.length >= 5) return;
          const vName = app.pathfinder_name || app.applicant_name || "Applicant";
          const initials = vName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "AP";
          formattedList.push({
            id: app.id,
            name: vName,
            initials,
            email: app.applicant_email || "",
            avatarBg: "bg-teal-100 text-teal-800",
            engagement: app.opportunity_title || "Volunteer Application",
            status:
              app.status === "accepted"
                ? "Confirmed"
                : app.status === "pending"
                ? "Awaiting review"
                : "Application",
            statusCls:
              app.status === "accepted"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                : "bg-amber-50 text-amber-700 border-amber-200/60",
            dotCls: app.status === "accepted" ? "bg-emerald-500" : "bg-amber-500",
            updated: "Application",
            timeAgo: "3 days ago",
          });
        });

        setRecentEngagements(formattedList.slice(0, 6));

        // 4. Format recent activity
        const activities = [];
        if (notifs.length > 0) {
          notifs.slice(0, 4).forEach((n) => {
            activities.push({
              title: n.title || n.verb || "Notification",
              subtitle: n.description || n.message || "Recent notification in your workspace",
              icon: "bell",
            });
          });
        }

        setRecentActivities(activities);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const organizationName =
    org?.name ||
    user?.organization_name ||
    user?.raw?.name ||
    user?.name ||
    "Organization";

  // Tier representation mapping
  const tier = org?.tier || "tier_2";
  const tierConfig = {
    tier_1: {
      tierNumber: "Tier 1",
      title: "Registered & Verified",
      desc: "Your formal registration and representative identity have been verified.",
      progress: "100%",
      completedReqs: "6 of 6 verification requirements completed",
      nextStepTitle: "Verification Complete",
      nextStepSub: "Your organization is at the highest trust tier.",
    },
    tier_2: {
      tierNumber: "Tier 2",
      title: "Community-Referenced",
      desc: "Your activity evidence has been accepted. Add formal registration documents to progress to Tier 1.",
      progress: "72%",
      completedReqs: "4 of 6 verification requirements completed",
      nextStepTitle: "Submit CAC registration evidence",
      nextStepSub: "This can unlock Registered & Verified status.",
    },
    tier_3: {
      tierNumber: "Tier 3",
      title: "Self-Declared / Pending",
      desc: "Organization registered on AfriVate. Submit activity evidence or formal documents to advance trust tier.",
      progress: "33%",
      completedReqs: "2 of 6 verification requirements completed",
      nextStepTitle: "Complete verification profile",
      nextStepSub: "Upload documents to unlock community verification.",
    },
  }[tier] || {
    tierNumber: "Tier 2",
    title: "Community-Referenced",
    desc: "Your activity evidence has been accepted. Add formal registration documents to progress to Tier 1.",
    progress: "72%",
    completedReqs: "4 of 6 verification requirements completed",
    nextStepTitle: "Submit CAC registration evidence",
    nextStepSub: "This can unlock Registered & Verified status.",
  };

  // Values for display (strictly from backend)
  const totalEngagementsDisplay = loading
    ? "—"
    : metrics.totalEngagements.toLocaleString();
  const activeVolunteersDisplay = loading
    ? "—"
    : metrics.activeVolunteers.toLocaleString();
  const credentialsIssuedDisplay = loading
    ? "—"
    : metrics.credentialsIssued.toLocaleString();
  const pendingConfirmationsDisplay = loading
    ? "—"
    : metrics.pendingConfirmations.toLocaleString();

  return (
    <OrganizationLayout activeItem="Over View">
      {/* ══════════════════════════════════════════════════════
          CREATE VOLUNTEER ENGAGEMENT MODAL (Image 1)
      ══════════════════════════════════════════════════════ */}
      <CreateEngagementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newRec, isDraft) => {
          setSuccessToast(
            isDraft
              ? "Engagement saved as draft."
              : `Volunteer engagement "${newRec.engagement}" created successfully!`
          );
          setTimeout(() => setSuccessToast(""), 4000);
        }}
      />

      {/* Success Banner */}
      {successToast && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-gray-500 block mb-1">
              Overview
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Good morning, {organizationName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Here's how your organization's trust profile and volunteer programme are doing
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="hidden sm:flex bg-[#0B7B69] hover:bg-[#096657] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl items-center justify-center gap-2 shadow-sm transition-all shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New engagement</span>
          </button>
        </div>

        {/* Full-width button on mobile (Matches Screenshot 1) */}
        <div className="mt-4 sm:hidden">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-[#0B7B69] hover:bg-[#096657] active:scale-[0.98] text-white text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New engagement</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          VERIFICATION STATUS BANNER (Dynamic Tier from Backend)
      ══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-5 sm:p-7 text-white shadow-sm relative overflow-hidden mb-6 sm:mb-7"
        style={{ backgroundColor: BRAND_PURPLE }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left section */}
          <div className="flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-white/70 uppercase mb-3">
              YOUR VERIFICATION STATUS
            </p>

            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-10 h-10 rounded-xl border border-white/40 flex items-center justify-center bg-white/10 shrink-0">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80 font-medium">
                  {tierConfig.tierNumber}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {tierConfig.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed mb-5">
              {tierConfig.desc}
            </p>

            {/* Progress bar */}
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: tierConfig.progress,
                      backgroundColor: "#38EF7D",
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-white shrink-0">
                  {tierConfig.progress}
                </span>
              </div>
              <p className="text-[11px] text-white/80 mt-1.5 font-medium">
                {tierConfig.completedReqs}
              </p>
            </div>
          </div>

          {/* Right Recommended Step box */}
          <div className="flex flex-col items-start lg:items-end justify-between border-t lg:border-t-0 border-white/20 pt-4 lg:pt-0">
            <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-1">
              RECOMMENDED NEXT STEP
            </span>
            <p className="text-sm sm:text-base font-bold text-white text-left lg:text-right">
              {tierConfig.nextStepTitle}
            </p>
            <p className="text-xs text-white/70 mb-3 text-left lg:text-right">
              {tierConfig.nextStepSub}
            </p>
            <button
              onClick={() => navigate("/enabler/verification-status")}
              className="w-full sm:w-auto border border-white/40 hover:bg-white/15 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Continue verification</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          KEY METRICS ROW (2x2 Grid on Mobile, 4 Cols on Desktop)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-7">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
              Total engagements
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-50 text-[#843A7F] flex items-center justify-center shrink-0">
              <Users size={15} />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {totalEngagementsDisplay}
            </p>
            <p className="text-[10px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2 truncate">
              <ArrowUpRight size={13} className="shrink-0" />
              <span>11.5% Up from yesterday</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
              Active Volunteers
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Package size={15} />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {activeVolunteersDisplay}
            </p>
            <p className="text-[10px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2 truncate">
              <ArrowUpRight size={13} className="shrink-0" />
              <span>1.3% Up from past week</span>
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
              Credentials issued
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileCheck size={15} />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {credentialsIssuedDisplay}
            </p>
            <p className="text-[10px] sm:text-xs font-semibold text-rose-600 flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2 truncate">
              <ArrowDownRight size={13} className="shrink-0" />
              <span>4.3% Down from yesterday</span>
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
              Pending Confirmations
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Clock size={15} />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {pendingConfirmationsDisplay}
            </p>
            <p className="text-[10px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2 truncate">
              <ArrowUpRight size={13} className="shrink-0" />
              <span>1.8% Up from yesterday</span>
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          BOTTOM SPLIT GRID: RECENT ENGAGEMENTS & ACTIVITY
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Engagements Table / Cards */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Recent engagements</h2>
              <p className="text-[11px] sm:text-xs text-gray-500">Volunteer activity requiring attention</p>
            </div>
            <button
              onClick={() => navigate("/enabler/opportunities-posted")}
              className="text-xs font-bold text-[#0B7B69] hover:underline"
            >
              View all →
            </button>
          </div>

          {recentEngagements.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs sm:text-sm text-gray-400">
                No volunteer activity recorded yet.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#843A7F] hover:underline"
              >
                <Plus size={14} />
                <span>Create an engagement</span>
              </button>
            </div>
          ) : (
            <>
              {/* Mobile View: Stacked Engagement Cards (Screenshot 1) */}
              <div className="lg:hidden divide-y divide-gray-100">
                {recentEngagements.slice(0, 4).map((row) => (
                  <div
                    key={row.id}
                    onClick={() => navigate(`/enabler/opportunity/${row.id}`)}
                    className="py-3.5 first:pt-0 last:pb-0 cursor-pointer active:bg-gray-50/70 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${row.avatarBg}`}
                        >
                          {row.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {row.name}
                          </p>
                          {row.email && (
                            <p className="text-[10px] text-gray-400 truncate">
                              {row.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                        {row.timeAgo || "2h ago"}
                      </span>
                    </div>

                    <div className="pl-10.5 flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {row.engagement}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${row.statusCls} shrink-0`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${row.dotCls}`} />
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Full Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">VOLUNTEER</th>
                      <th className="pb-3 font-semibold">ENGAGEMENT</th>
                      <th className="pb-3 font-semibold">STATUS</th>
                      <th className="pb-3 font-semibold">UPDATED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentEngagements.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => navigate(`/enabler/opportunity/${row.id}`)}
                        className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${row.avatarBg}`}
                            >
                              {row.initials}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-semibold text-gray-900 leading-tight">
                                {row.name}
                              </p>
                              {row.email && (
                                <p className="text-[11px] text-gray-400 truncate">
                                  {row.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 pr-3 text-gray-700 font-medium">
                          {row.engagement}
                        </td>

                        <td className="py-3.5 pr-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${row.statusCls}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${row.dotCls}`} />
                            {row.status}
                          </span>
                        </td>

                        <td className="py-3.5 text-gray-500 font-medium">
                          {row.updated}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Right: Recent Activity Timeline */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="mb-5">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">Recent activity</h2>
            <p className="text-[11px] sm:text-xs text-gray-500">Updates from your workspace</p>
          </div>

          <div className="flex flex-col gap-4">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">
                No recent activity recorded yet.
              </p>
            ) : (
              recentActivities.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      item.icon === "check"
                        ? "bg-emerald-50 text-emerald-600"
                        : item.icon === "file"
                        ? "bg-blue-50 text-blue-600"
                        : item.icon === "clock"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-teal-50 text-teal-600"
                    }`}
                  >
                    {item.icon === "bell" ? (
                      <Bell size={14} />
                    ) : item.icon === "clock" ? (
                      <Clock size={14} />
                    ) : item.icon === "file" ? (
                      <FileCheck size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}
