import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import FormattedText from "../../components/common/FormattedText";
import Toast from "../../components/common/Toast";
import { bookmarks, opportunities, profile, applications } from "../../services/api";
import { getOrgName, navigateToVolunteerDetails } from "../../utils/opportunityUtils";
import { parseDescription } from "../../utils/descriptionUtils";

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
        // Try to fetch from API using URL param
        const jobId = new URLSearchParams(window.location.search).get('id');
        if (jobId) {
          try {
            const data = await opportunities.get(jobId);
            if (data) {
              const job = {
                id: String(data.id),
                title: data.title,
                company: getOrgName(data),
                type: data.opportunity_type || "Volunteering",
                location: data.location || "",
                description: data.description,
                created_by: data.created_by,
                link: data.link,
                _raw: data,
              };
              setJobData(job);
              checkBookmarkStatus(data.id);
              checkApplicationStatus(data.id);
              loadSimilarOpportunities(data.id, data.opportunity_type);
              if (data.created_by) loadOrgProfile(data.created_by);
            }
          } catch (err) {
            console.error("Error loading opportunity:", err);
            setToast({ isOpen: true, message: "Unable to load opportunity details. Please try again.", type: "error" });
            navigate("/available-opportunities");
          }
        } else {
          navigate("/opportunity");
        }
      }
      setLoading(false);
    };
    
    loadJobData();
  }, [location.state, navigate]);

  const loadOrgProfile = async (createdById) => {
    if (!createdById) return;
    try {
      const data = await profile.enablerGetById(createdById);
      setOrgProfile(data);
    } catch (err) {
      console.error("Error loading org profile:", err);
      setToast({ isOpen: true, message: "Could not load organization details.", type: "error" });
      setOrgProfile(null);
    }
  };

  const loadSimilarOpportunities = async (currentId, opportunityType) => {
    try {
      const params = { is_open: true };
      if (opportunityType) params.opportunity_type = opportunityType;
      
      const data = await opportunities.list(params);
      const rawList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      
      // Filter out current opportunity and take first 3
      const similar = rawList
        .filter(item => item.id !== parseInt(currentId))
        .slice(0, 3)
        .map(item => ({
          id: String(item.id),
          title: item.title,
          company: getOrgName(item),
          type: item.opportunity_type || "Volunteering",
          location: item.location || "",
          _raw: item,
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
        const oid =
          row.opportunity_id ??
          (typeof row.opportunity === "number" || typeof row.opportunity === "string"
            ? row.opportunity
            : row.opportunity?.id);
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
        await bookmarks.opportunitiesSavedCreate({
          opportunity_id: oppId,
        });
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

  // Parse the description into separate sections (must be before early return)
  const parsedDescription = useMemo(() => {
    if (!jobData?.description) return parseDescription("");
    return parseDescription(jobData.description);
  }, [jobData?.description]);

  // Get display values - prefer parsed values, fallback to raw jobData
  const displayLocation = parsedDescription.location || jobData?.location || "";
  const displayWorkModel = parsedDescription.workModel || "";
  const displayTimeCommitment = parsedDescription.timeCommitment || "";

  if (loading || !jobData) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <NavBar />
        <div className="pt-14 px-4 py-12 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  const jobId = jobData.id;

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar />
      
      {/* Main Content */}
      <div className="pt-14 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Job Header Section */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <i className="fa fa-arrow-left text-xl"></i>
            </button>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                  {jobData.title}
                </h1>
                <p className="text-gray-600 text-base md:text-lg">
                  {jobData.company} {jobData.type ? `- ${jobData.type}` : '- Volunteering'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    navigate("/apply/" + jobId, {
                      state: {
                        job: jobData,
                        existingApplication: existingApplication || undefined,
                        isEdit: !!existingApplication,
                      },
                    })
                  }
                  className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#5A0091] transition-colors whitespace-nowrap"
                >
                  {existingApplication ? "View application" : "Apply"}
                </button>
                <button
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                  className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-colors ${
                    isBookmarked 
                      ? 'bg-purple-50 border-purple-300 hover:bg-purple-100' 
                      : 'border-gray-300 hover:bg-gray-50'
                  } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
                  aria-label={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
                >
                  {bookmarkLoading ? (
                    <div className="w-4 h-4 border-2 border-[#6A00B1] border-t-transparent rounded-full animate-spin"></div>
                  ) : isBookmarked ? (
                    <i className="fa fa-bookmark text-[#6A00B1] text-lg"></i>
                  ) : (
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                      style={{ color: '#6A00B1' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={async () => {
                    const shareData = {
                      title: jobData.title,
                      text: `Check out this volunteering opportunity: ${jobData.title}`,
                      url: window.location.href,
                    };
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
                  title="Share this opportunity"
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fa fa-share-alt text-gray-600"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Main Content */}
            <div className="flex-1 space-y-6">
              {/* Volunteering Description */}
              <section className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Description
                </h2>
                <div className="text-sm">
                  {parsedDescription.description ? (
                    <FormattedText text={parsedDescription.description} />
                  ) : (
                    <p className="text-gray-500 italic">No description was provided for this opportunity.</p>
                  )}
                </div>
              </section>

              {/* Key Responsibilities */}
              {parsedDescription.keyResponsibilities && (
                <section className="bg-white border border-gray-200 rounded-lg p-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Key Responsibilities
                  </h2>
                  <div className="text-sm">
                    <FormattedText text={parsedDescription.keyResponsibilities} />
                  </div>
                </section>
              )}

              {/* Requirements & Benefits */}
              {parsedDescription.requirementsBenefits && (
                <section className="bg-white border border-gray-200 rounded-lg p-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Requirements & Benefits
                  </h2>
                  <div className="text-sm">
                    <FormattedText text={parsedDescription.requirementsBenefits} />
                  </div>
                </section>
              )}

              {/* About the Organization */}
              {parsedDescription.aboutCompany && (
                <section className="bg-white border border-gray-200 rounded-lg p-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    About the Organization
                  </h2>
                  <div className="text-sm">
                    <FormattedText text={parsedDescription.aboutCompany} />
                  </div>
                </section>
              )}

              {/* Application Instructions */}
              {parsedDescription.applicationInstructions && (
                <section className="bg-white border border-gray-200 rounded-lg p-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Application Instructions
                  </h2>
                  <div className="text-sm">
                    <FormattedText text={parsedDescription.applicationInstructions} />
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Job Summary Card */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-24">
                {/* Organization profile image */}
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden bg-gray-100">
                  {orgProfile?.base_details?.profile_pic ? (
                    <img
                      src={orgProfile.base_details.profile_pic}
                      alt={jobData.company}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(jobData.company || "Org")}&background=e9d5ff&color=6A00B1&size=64`}
                      alt={jobData.company}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {/* Company Name */}
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  {jobData.company || 'Organization'}
                </h3>
                {(jobData._raw?.created_by ?? jobData.created_by) ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/organization/${jobData._raw?.created_by ?? jobData.created_by}`,
                        { state: { name: jobData.company } }
                      )
                    }
                    className="text-[#6A00B1] text-sm text-center block mb-5 hover:underline w-full"
                  >
                    View organization profile
                  </button>
                ) : jobData.link && !jobData.link.includes("afrivate.com") ? (
                  <a
                    href={jobData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6A00B1] text-sm text-center block mb-5 hover:underline"
                  >
                    Visit organization website
                  </a>
                ) : null}

                {/* Job Summary */}
                <div className="border-t border-gray-200 pt-5 space-y-4">
                  <h4 className="font-bold text-gray-900 text-base mb-3">
                    Job Summary
                  </h4>
                  
                  <div className="flex items-start gap-3">
                    <i className="fa fa-briefcase text-[#6A00B1] mt-1"></i>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Job Type:</p>
                      <p className="text-sm font-medium text-gray-900">{jobData.type || 'Volunteering'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <i className="fa fa-map-marker text-[#6A00B1] mt-1"></i>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location:</p>
                      <p className="text-sm font-medium text-gray-900">{displayLocation || 'Not specified'}</p>
                    </div>
                  </div>

                  {displayWorkModel && (
                    <div className="flex items-start gap-3">
                      <i className="fa fa-building text-[#6A00B1] mt-1"></i>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Work Model:</p>
                        <p className="text-sm font-medium text-gray-900">{displayWorkModel}</p>
                      </div>
                    </div>
                  )}

                  {displayTimeCommitment && (
                    <div className="flex items-start gap-3">
                      <i className="fa fa-clock-o text-[#6A00B1] mt-1"></i>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Time Commitment:</p>
                        <p className="text-sm font-medium text-gray-900">{displayTimeCommitment}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Volunteering Opportunities */}
          {similarOpportunities.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Similar Volunteering Opportunities
              </h2>
              
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {similarOpportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 min-w-[280px] flex-shrink-0 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {opportunity.company}
                    </h3>
                    <h4 className="font-bold text-lg mb-2">
                      {opportunity.title}
                    </h4>
                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      <span className="text-orange-600 font-medium text-xs">
                        {opportunity.type}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {opportunity.location}
                      </span>
                    </div>
                    <button
                      onClick={() => navigateToVolunteerDetails(navigate, opportunity.id, { fallbackJob: opportunity })}
                      className="w-full bg-[#6A00B1] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5A0091] transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default VolunteerDetails;
