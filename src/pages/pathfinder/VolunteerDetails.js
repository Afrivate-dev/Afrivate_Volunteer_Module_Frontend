import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import FormattedText from "../../components/common/FormattedText";
import Toast from "../../components/common/Toast";
import { bookmarks, opportunities, profile, applications } from "../../services/api";
import { getOrgName, navigateToVolunteerDetails } from "../../utils/opportunityUtils";
import { parseDescription } from "../../utils/descriptionUtils";

const typeIcon = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("mentor")) return "B";
  if (t.includes("intern")) return "I";
  if (t.includes("volunteer")) return "V";
  return "O";
};

const VolunteerDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [similarOpportunities, setSimilarOpportunities] = useState([]);
  const [orgProfile, setOrgProfile] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    document.title = "Volunteer Details - AfriVate";
  }, []);

  useEffect(() => {
    const loadJobData = async () => {
      const stateJob = location.state?.job;

      if (stateJob && stateJob.id != null) {
        const job = {
          ...stateJob,
          company: stateJob.company && !String(stateJob.company).startsWith("http")
            ? stateJob.company
            : getOrgName(stateJob._raw || stateJob),
        };
        setJobData(job);
        if (location.state?.existingApplication) {
          setExistingApplication(location.state.existingApplication);
        } else {
          checkApplicationStatus(stateJob.id);
        }
        checkBookmarkStatus(stateJob.id);
        loadSimilarOpportunities(stateJob.id, stateJob.type);
        if (stateJob._raw?.created_by) loadOrgProfile(stateJob._raw.created_by);
        else if (job.created_by) loadOrgProfile(job.created_by);
      } else {
        const jobId = new URLSearchParams(window.location.search).get("id");
        if (jobId) {
          try {
            const data = await opportunities.get(jobId);
            if (data) {
              const job = {
                id: String(data.id), title: data.title, company: getOrgName(data),
                type: data.opportunity_type || "Volunteering", location: data.location || "",
                description: data.description, is_open: data.is_open, created_by: data.created_by,
                link: data.link, _raw: data,
              };
              setJobData(job);
              checkBookmarkStatus(data.id);
              checkApplicationStatus(data.id);
              loadSimilarOpportunities(data.id, data.opportunity_type);
              if (data.created_by) loadOrgProfile(data.created_by);
            }
          } catch (err) {
            console.error("Error loading opportunity:", err);
            if (err.status === 404) setNotFound(true);
            else {
              setToast({ isOpen: true, message: "Unable to load opportunity details. Please try again.", type: "error" });
              navigate("/available-opportunities");
            }
          }
        } else {
          navigate("/opportunity");
        }
      }
      setLoading(false);
    };

    loadJobData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, navigate]);

  const loadOrgProfile = async (createdById) => {
    if (!createdById) return;
    try {
      const data = await profile.enablerGetById(createdById);
      setOrgProfile(data);
    } catch (err) {
      console.error("Error loading org profile:", err);
      setOrgProfile(null);
    }
  };

  const loadSimilarOpportunities = async (currentId, opportunityType) => {
    try {
      const params = { is_open: true };
      if (opportunityType) params.opportunity_type = opportunityType;
      const data = await opportunities.list(params);
      const rawList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      const similar = rawList
        .filter((item) => item.id !== parseInt(currentId))
        .slice(0, 3)
        .map((item) => ({
          id: String(item.id), title: item.title, company: getOrgName(item),
          type: item.opportunity_type || "Volunteering", location: item.location || "", _raw: item,
        }));
      setSimilarOpportunities(similar);
    } catch (err) {
      console.error("Error loading similar opportunities:", err);
      setSimilarOpportunities([]);
    }
  };

  const checkApplicationStatus = async (oppId) => {
    try {
      const data = await applications.list();
      const raw = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      const found = raw.find(
        (a) =>
          (a.opportunity ?? a.opportunity_id) === parseInt(oppId) ||
          String(a.opportunity ?? a.opportunity_id) === String(oppId)
      );
      setExistingApplication(found || null);
    } catch (err) {
      console.error("Error checking application status:", err);
      setExistingApplication(null);
    }
  };

  const checkBookmarkStatus = async (id) => {
    try {
      const response = await bookmarks.opportunitiesSavedList();
      const arr = Array.isArray(response) ? response : response?.results || [];
      const idStr = String(id);
      const found = arr.some((row) => {
        const oid = row.opportunity_id ??
          (typeof row.opportunity === "number" || typeof row.opportunity === "string"
            ? row.opportunity : row.opportunity?.id);
        return oid != null && String(oid) === idStr;
      });
      setIsBookmarked(!!found);
    } catch (error) {
      console.log("Error checking bookmark status:", error);
    }
  };

  const handleBookmarkToggle = async () => {
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      const oppId = parseInt(jobData.id, 10);
      if (isBookmarked) {
        await bookmarks.opportunitiesSavedDelete(oppId);
        setIsBookmarked(false);
        setToast({ isOpen: true, message: "Bookmark removed.", type: "success" });
      } else {
        await bookmarks.opportunitiesSavedCreate({ opportunity_id: oppId });
        setIsBookmarked(true);
        setToast({ isOpen: true, message: "Bookmark added.", type: "success" });
      }
    } catch (error) {
      console.error("Bookmark toggle error:", error);
      setToast({ isOpen: true, message: "Failed to update bookmark. Please try again.", type: "error" });
    } finally {
      setBookmarkLoading(false);
    }
  };

  const parsedDescription = useMemo(() => {
    if (!jobData?.description) return parseDescription("");
    return parseDescription(jobData.description);
  }, [jobData?.description]);

  const displayLocation = parsedDescription.location || jobData?.location || "";
  const displayWorkModel = parsedDescription.workModel || jobData?._raw?.work_mode || "";
  const displayTimeCommitment = parsedDescription.timeCommitment || jobData?._raw?.time_commitment || "";
  const displayDeadline = jobData?._raw?.deadline || jobData?._raw?.application_deadline || "";
  const isOpen = jobData?.is_open ?? jobData?._raw?.is_open ?? true;
  const jobId = jobData?.id;

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans">
        <NavBar />
        <div className="pt-20 px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
          <p className="text-xl font-bold text-gray-800 mb-2">This opportunity has been removed</p>
          <p className="text-gray-500 mb-6">The opportunity you're looking for no longer exists.</p>
          <button onClick={() => navigate("/available-opportunities")}
            className="bg-[#651F5F] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#4a1647] transition-colors">
            Browse Available Opportunities
          </button>
        </div>
      </div>
    );
  }

  if (loading || !jobData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <NavBar />
        <div className="pt-20 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <NavBar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-4 hover:bg-white/30 transition-colors">
              ← Back
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">{jobData.type || "Volunteering"}</span>
              {isOpen ? (
                <span className="text-xs font-semibold bg-green-400/30 text-green-100 px-3 py-1 rounded-full">Open</span>
              ) : (
                <span className="text-xs font-semibold bg-red-400/30 text-red-100 px-3 py-1 rounded-full">Closed</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{jobData.title}</h1>
            <div className="flex items-center gap-4 text-purple-200 text-sm flex-wrap">
              {displayLocation && <span className="flex items-center gap-1">{displayLocation}</span>}
              {jobData._raw?.created_at && (
                <span className="flex items-center gap-1">
                  Posted {new Date(jobData._raw.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Main Content */}
          <div className="flex-1 min-w-0 space-y-4 w-full">
            {/* About this role */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">About this role</h2>
              <div className="text-sm text-gray-700 leading-relaxed">
                {parsedDescription.description ? (
                  <FormattedText text={parsedDescription.description} />
                ) : (
                  <p className="text-gray-400 italic">No description provided for this opportunity.</p>
                )}
              </div>
            </div>

            {/* Key Responsibilities */}
            {parsedDescription.keyResponsibilities && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">Key Responsibilities</h2>
                <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                  {parsedDescription.keyResponsibilities.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0 inline-block"></span>
                      <span>{line.replace(/^[-•*]\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements & Benefits */}
            {parsedDescription.requirementsBenefits && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">Requirements</h2>
                <div className="text-sm text-gray-700 leading-relaxed">
                  <FormattedText text={parsedDescription.requirementsBenefits} />
                </div>
              </div>
            )}

            {/* About the Organization */}
            {(parsedDescription.aboutCompany || orgProfile) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">About the Organisation</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center overflow-hidden shrink-0">
                    {orgProfile?.base_details?.profile_pic ? (
                      <img src={orgProfile.base_details.profile_pic} alt={jobData.company} className="w-full h-full object-cover" />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{jobData.company || "Organization"}</h3>
                    {orgProfile?.industry && <p className="text-xs text-gray-500">{orgProfile.industry}</p>}
                  </div>
                </div>
                {parsedDescription.aboutCompany && (
                  <div className="text-sm text-gray-700 leading-relaxed mb-4">
                    <FormattedText text={parsedDescription.aboutCompany} />
                  </div>
                )}
                {(jobData._raw?.created_by ?? jobData.created_by) && (
                  <button type="button"
                    onClick={() => navigate(`/organization/${jobData._raw?.created_by ?? jobData.created_by}`, { state: { name: jobData.company } })}
                    className="text-sm text-[#8D4087] font-semibold hover:underline">
                    View organization profile →
                  </button>
                )}
              </div>
            )}

            {/* Application Instructions */}
            {parsedDescription.applicationInstructions && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">Application Instructions</h2>
                <div className="text-sm text-gray-700 leading-relaxed">
                  <FormattedText text={parsedDescription.applicationInstructions} />
                </div>
              </div>
            )}

            {/* Similar Opportunities */}
            {similarOpportunities.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 mb-4">Similar opportunities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similarOpportunities.map((opp) => (
                    <div key={opp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl mb-3">
                        {typeIcon(opp.type)}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-0.5 line-clamp-2">{opp.title}</h3>
                      <p className="text-xs text-gray-500 mb-3">{opp.company}</p>
                      <button onClick={() => navigateToVolunteerDetails(navigate, opp.id, { fallbackJob: opp })}
                        className="w-full text-xs bg-[#651F5F] text-white py-2 rounded-xl font-semibold hover:bg-[#4a1647] transition-colors">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-72 lg:shrink-0 space-y-4">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Opportunity details</h3>
              <div className="space-y-3">
                {jobData.type && (
                  <div className="flex items-start gap-3">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Type</p>
                      <p className="text-sm font-semibold text-gray-800">{jobData.type}</p>
                    </div>
                  </div>
                )}
                {displayTimeCommitment && (
                  <div className="flex items-start gap-3">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Time Commitment</p>
                      <p className="text-sm font-semibold text-gray-800">{displayTimeCommitment}</p>
                    </div>
                  </div>
                )}
                {displayWorkModel && (
                  <div className="flex items-start gap-3">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Work Mode</p>
                      <p className="text-sm font-semibold text-gray-800">{displayWorkModel}</p>
                    </div>
                  </div>
                )}
                {displayLocation && (
                  <div className="flex items-start gap-3">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Location</p>
                      <p className="text-sm font-semibold text-gray-800">{displayLocation}</p>
                    </div>
                  </div>
                )}
                {displayDeadline && (
                  <div className="flex items-start gap-3">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Deadline</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(displayDeadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button */}
            {isOpen ? (
              <button
                onClick={() =>
                  navigate("/apply/" + jobId, {
                    state: { job: jobData, existingApplication: existingApplication || undefined, isEdit: !!existingApplication },
                  })
                }
                className="w-full bg-[#651F5F] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#4a1647] transition-colors">
                {existingApplication ? "View application" : "Apply now"}
              </button>
            ) : (
              <button disabled className="w-full bg-gray-200 text-gray-400 py-4 rounded-2xl font-bold text-sm cursor-not-allowed">
                Applications Closed
              </button>
            )}

            {/* Save + Share */}
            <div className="flex gap-2">
              <button onClick={handleBookmarkToggle} disabled={bookmarkLoading}
                className={`flex-1 flex items-center justify-center gap-2 border py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isBookmarked ? "border-[#8D4087] text-[#8D4087] bg-purple-50" : "border-gray-200 text-gray-600 hover:border-[#8D4087] hover:text-[#8D4087]"
                } disabled:opacity-50`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                {isBookmarked ? "Saved" : "Save"}
              </button>
              <button onClick={async () => {
                  const shareData = { title: jobData.title, text: `Check out this opportunity: ${jobData.title}`, url: window.location.href };
                  if (navigator.share) {
                    try { await navigator.share(shareData); } catch (_) {}
                  } else {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      setToast({ isOpen: true, message: "Link copied to clipboard.", type: "success" });
                    } catch (_) {
                      setToast({ isOpen: true, message: "Could not copy link.", type: "error" });
                    }
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:border-[#8D4087] hover:text-[#8D4087] transition-colors">
                Share
              </button>
            </div>

            {/* Have questions? */}
            <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="rounded-2xl p-5">
              <p className="font-bold text-white mb-1">Have questions?</p>
              <p className="text-purple-200 text-xs mb-3">Reach out to the organisation directly for more information.</p>
              <button className="text-white text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Message recruiter →
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })} />
    </div>
  );
};

export default VolunteerDetails;
