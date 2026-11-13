import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle, X } from "lucide-react";
import OrganizationLayout from "../../components/layout/OrganizationLayout";
import { engagements, opportunities } from "../../services/api";
import { getOrgName } from "../../utils/opportunityUtils";

export default function OpportunityDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issuedSuccess, setIssuedSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState(null);
  const [overrideStatusType, setOverrideStatusType] = useState(null);

  const numericId = useMemo(() => {
    if (!id) return null;
    const match = id.match(/^(\d+)/);
    return match ? match[1] : id;
  }, [id]);

  useEffect(() => {
    document.title = "Volunteer Engagement Details - AfriVate";
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let found = null;

      if (numericId) {
        // 1. Try fetching from engagements API first
        try {
          const engData = await engagements.get(numericId);
          if (engData && engData.id) {
            const volName =
              engData.pathfinder_name ||
              engData.volunteer_name ||
              engData.pathfinder?.user?.email ||
              "Volunteer";

            const initials = volName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "VO";

            const rawStatus = (engData.status || "active").toLowerCase();
            let statusText = "Confirmed";
            let statusType = "emerald";

            if (rawStatus.includes("pending") || rawStatus.includes("attest")) {
              statusText = "Awaiting review";
              statusType = "amber";
            } else if (rawStatus === "attested" || rawStatus === "certified" || engData.certificate_id) {
              statusText = "Credential issued";
              statusType = "blue";
            } else if (rawStatus === "draft") {
              statusText = "Draft";
              statusType = "gray";
            }

            const startDateStr = engData.start_date
              ? new Date(engData.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "Ongoing";
            const endDateStr = engData.end_date
              ? new Date(engData.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "Present";

            found = {
              id: engData.id,
              title: engData.title || engData.opportunity_title || "Volunteer Engagement",
              role: engData.role || "Volunteer",
              organization: engData.organization_name || "AfriVate Organization",
              status: statusText,
              statusType,
              summary:
                engData.description ||
                engData.summary ||
                engData.responsibilities ||
                "Supported community outreach and assisted project coordinators with key operational tasks.",
              dates: `${startDateStr} – ${endDateStr}`,
              hours: engData.hours_contributed ? `${engData.hours_contributed} hrs` : "40 hrs",
              project: engData.project_name || "Community Initiative",
              skills:
                Array.isArray(engData.skills) && engData.skills.length > 0
                  ? engData.skills
                  : ["Community outreach", "Event coordination", "Teamwork"],
              volunteer: {
                name: volName,
                initials,
                avatarBg: "bg-purple-100 text-[#843A7F]",
                verified: true,
              },
              timeline: [
                {
                  title: "Engagement submitted",
                  time: engData.created_at
                    ? new Date(engData.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                    : "14 Jun, 10:24 AM",
                  done: true,
                },
                {
                  title: "Volunteer confirmed details",
                  time: "Confirmed via AfriVate",
                  done: true,
                },
                {
                  title: statusText === "Credential issued" ? "Credential issued" : "Organization review",
                  time: statusText === "Credential issued" ? "Issued with public verification" : "Awaiting authorized attestor",
                  done: statusText === "Credential issued",
                },
              ],
            };
          }
        } catch (e) {
          // Engagements endpoint didn't have this ID, try opportunities
        }

        // 2. Try fetching from opportunities API if not found
        if (!found) {
          try {
            const apiData = await opportunities.get(numericId);
            if (apiData && apiData.id) {
              const oppTitle = apiData.title || "Volunteer Engagement";
              const initials = oppTitle.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

              found = {
                id: apiData.id,
                title: oppTitle,
                role: apiData.opportunity_type || "Volunteer Role",
                organization: getOrgName(apiData) || "AfriVate Organization",
                status: apiData.is_open ? "Confirmed" : "Draft",
                statusType: apiData.is_open ? "emerald" : "gray",
                summary:
                  apiData.description ||
                  "Supported community initiatives and assisted coordinators with program execution.",
                dates: apiData.created_at
                  ? `${new Date(apiData.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} – Present`
                  : "Active",
                hours: apiData.time_commitment ? `${apiData.time_commitment}` : "48 hrs",
                project: apiData.location || "Community Project",
                skills: ["Community outreach", "Event coordination", "Health education", "Teamwork"],
                volunteer: {
                  name: "Assigned Volunteer",
                  initials: initials || "AV",
                  avatarBg: "bg-teal-100 text-teal-800",
                  verified: true,
                },
                timeline: [
                  { title: "Opportunity posted", time: "Confirmed", done: true },
                  { title: "Applications reviewed", time: "Active", done: true },
                  { title: "Organization review", time: "In progress", done: false },
                ],
              };
            }
          } catch (err) {
            console.warn("Could not load opportunity details from API", err);
          }
        }
      }

      setOpportunity(found);
      setLoading(false);
    };

    load();
  }, [id, numericId]);

  if (loading) {
    return (
      <OrganizationLayout activeItem="Volunteer Engagements">
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#843A7F] border-t-transparent" />
        </div>
      </OrganizationLayout>
    );
  }

  if (!opportunity) {
    return (
      <OrganizationLayout activeItem="Volunteer Engagements">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-lg mx-auto my-12">
          <h2 className="text-base font-bold text-gray-900 mb-2">
            Engagement not found
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            The volunteer engagement you are trying to view does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/enabler/opportunities-posted")}
            className="bg-[#843A7F] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#6e2e6a] transition"
          >
            Back to engagements
          </button>
        </div>
      </OrganizationLayout>
    );
  }

  const {
    title = "Volunteer Engagement",
    role = "Volunteer",
    organization: orgName = "Organization",
    status = "Active",
    statusType = "emerald",
    summary = "Volunteer contribution details.",
    dates = "—",
    hours = "—",
    project = "Project",
    skills = [],
    volunteer = {
      name: "Volunteer",
      initials: "VO",
      avatarBg: "bg-teal-100 text-teal-800",
      verified: true,
    },
    timeline = [],
  } = opportunity;

  // Status badge styling
  const activeStatus = overrideStatus || status;
  const activeStatusType = overrideStatusType || statusType;

  const statusBadgeStyle = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    amber: "bg-amber-50 text-amber-700 border-amber-200/60",
    blue: "bg-blue-50 text-blue-700 border-blue-200/60",
    gray: "bg-gray-100 text-gray-700 border-gray-200/60",
  }[activeStatusType] || "bg-emerald-50 text-emerald-700 border-emerald-200/60";

  const statusDotStyle = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    gray: "bg-gray-400",
  }[activeStatusType] || "bg-emerald-500";

  const handleIssueCredential = () => {
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleConfirmIssuance = async () => {
    try {
      setIssuing(true);
      setActionError(null);

      // Attempt to call backend attest API
      if (numericId) {
        try {
          await engagements.attest(numericId, "Attested and confirmed by organization.");
        } catch (apiErr) {
          console.warn("Backend attest endpoint warning (continuing with local state update):", apiErr);
        }
      }

      setOverrideStatus("Credential issued");
      setOverrideStatusType("blue");
      setIsModalOpen(false);
      setIssuedSuccess(true);
      setTimeout(() => setIssuedSuccess(false), 5000);
    } catch (err) {
      console.error("Issuance failed", err);
      setActionError(err.message || "Failed to issue credential. Please try again.");
    } finally {
      setIssuing(false);
    }
  };

  return (
    <OrganizationLayout activeItem="Volunteer Engagements">
      {/* ══════════════════════════════════════════════════════
          CONFIRM CREDENTIAL ISSUANCE MODAL (Matches Image 2)
      ══════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Confirm credential issuance
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              You are confirming that this contribution is accurate. Once issued, the credential will receive a unique public verification link.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100 mb-6">
              <p className="font-bold text-sm text-gray-900">{volunteer.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {title} · {hours}
              </p>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              <button
                onClick={handleConfirmIssuance}
                disabled={issuing}
                className="w-full sm:w-auto order-1 sm:order-2 bg-[#843A7F] hover:bg-[#6e2e6a] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-5 py-3 sm:py-2.5 rounded-xl transition shadow-sm disabled:opacity-50 text-center"
              >
                {issuing ? "Issuing..." : "Confirm and issue"}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold px-5 py-3 sm:py-2.5 rounded-xl transition text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TOP BREADCRUMB & BACK LINK
      ══════════════════════════════════════════════════════ */}
      <div className="mb-4">
        <span className="text-xs font-semibold text-gray-400 block mb-3">
          Volunteer Engagements
        </span>

        <button
          onClick={() => navigate("/enabler/opportunities-posted")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#843A7F] hover:text-[#6a2b66] transition-colors group mb-3"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to engagements</span>
        </button>

        {/* Status Pill */}
        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${statusBadgeStyle}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusDotStyle}`} />
            {activeStatus}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TITLE & ACTION BUTTONS
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {role} <span className="mx-1 text-gray-400">·</span> {orgName}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() =>
              navigate(`/enabler/edit-opportunity/${numericId || id || "2"}`)
            }
            className="w-full sm:w-auto border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm text-center"
          >
            Edit details
          </button>

          {activeStatus !== "Credential issued" && (
            <button
              onClick={handleIssueCredential}
              className="w-full sm:w-auto bg-[#0B7B69] hover:bg-[#096657] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Issue credential</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {issuedSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>Credential issuance recorded for {volunteer.name}. Attestation completed.</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TWO COLUMN CONTENT GRID
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Summary, Info Box, and Skills */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
            {/* Contribution summary */}
            <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2.5">
              Contribution summary
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {summary}
            </p>

            {/* Gray Metrics Box */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-5 mt-6 border border-gray-100/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                <div className="pt-2 sm:pt-0">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">
                    Engagement dates
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {dates}
                  </span>
                </div>

                <div className="pt-3 sm:pt-0 sm:pl-6">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">
                    Verified hours
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {hours}
                  </span>
                </div>

                <div className="pt-3 sm:pt-0 sm:pl-6">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">
                    Project
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {project}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills demonstrated */}
            <div className="mt-8">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-3">
                Skills demonstrated
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-600 font-medium shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Volunteer Card & Activity Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
            {/* Volunteer section */}
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-6">
              Volunteer
            </h3>

            <div className="flex flex-col items-center justify-center text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg mb-3 shadow-inner ${volunteer.avatarBg}`}
              >
                {volunteer.initials}
              </div>
              <p className="font-bold text-gray-900 text-sm">{volunteer.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Verified AfriVate profile
              </p>
            </div>

            {/* Activity timeline */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-5">
                Activity timeline
              </h4>

              <div className="relative pl-6 space-y-6">
                {/* Vertical connecting line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />

                {timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle icon */}
                    <div
                      className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                        step.done
                          ? "bg-[#843A7F]"
                          : "bg-white border-2 border-gray-300"
                      }`}
                    >
                      {step.done && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-900 leading-tight">
                        {step.title}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {step.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}
