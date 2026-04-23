import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { applications, opportunities, bookmarks } from "../../services/api";

const Applicants = () => {
  const navigate = useNavigate();
  const { id: opportunityId } = useParams();
  const [opportunityTitle, setOpportunityTitle] = useState("");
  const [applicationsList, setApplicationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [savedPathfinderIds, setSavedPathfinderIds] = useState(() => new Set());
  const [bookmarkBusy, setBookmarkBusy] = useState({});

  useEffect(() => {
    document.title = "Applicants - AfriVate";
    
    const loadData = async () => {
      setLoading(true);
      let titleFromOpp = "";
      try {
        // Load opportunity details
        try {
          const oppData = await opportunities.get(opportunityId);
          if (oppData && oppData.title) {
            titleFromOpp = oppData.title;
            setOpportunityTitle(oppData.title);
          }
        } catch (oppErr) {
          console.error("Error loading opportunity:", oppErr);
        }

        // Load applicants for this opportunity (preferred: opportunity-scoped endpoint)
        let forOpp = [];
        try {
          const raw = await opportunities.applicantsList(opportunityId);
          forOpp = Array.isArray(raw) ? raw : raw?.results || [];
        } catch (scopeErr) {
          console.warn("applicantsList failed, falling back to applications.list:", scopeErr);
          const appsData = await applications.list();
          const all = Array.isArray(appsData) ? appsData : appsData?.results || [];
          forOpp = all.filter(
            (a) =>
              String(a.opportunity) === String(opportunityId) ||
              String(a.opportunity?.id) === String(opportunityId)
          );
        }
        
        // Map to the format needed by the UI - include full cover_letter text
        const mappedApps = forOpp.map((app) => {
          console.log("Raw Application Data:", app)
          const { name, email } = parseContactDetails(app.cover_letter);

          const actualUserId = app.applicant_id ?? app.user;

          const profileId = app.pathfinder_profile_id ?? app.pathfinder_profile?.id ?? actualUserId

          return {
            id: app.id,
            userId: actualUserId,
            bookmarkPathfinderId: profileId,

            pathfinderName: name !== "Applicant" ? name : (app.username || app.user_name || "Applicant"),
            pathfinderEmail: email || app.email || "",

            opportunityTitle: app.opportunity_title || titleFromOpp,
            status: app.status || "pending",
            applicationText: app.cover_letter || "",
            cvUrl: app.resume || app.profile_resume_url || null,
          };
        });

        setApplicationsList(mappedApps);

        try {
          const saved = await bookmarks.applicantsSavedList();
          const savedRows = Array.isArray(saved) ? saved : saved?.results || [];
          const ids = new Set(
            savedRows
              .map((row) => {
                const pid = row.pathfinder_details?.id ?? row.pathfinder_id;
                return pid != null ? String(pid) : null;
              })
              .filter(Boolean)
          );
          setSavedPathfinderIds(ids);
        } catch (e) {
          console.error("Error loading saved applicants:", e);
        }
        
        if (mappedApps.length > 0 && !titleFromOpp) {
          setOpportunityTitle(mappedApps[0].opportunityTitle);
        }
      } catch (err) {
        console.error("Error loading applications:", err);
        setApplicationsList([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [opportunityId]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [appId]: true }));
    try {
      await applications.updateStatus(appId, { status: newStatus });
      // Update the application in the list
      setApplicationsList((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app
        )
      );
      const statusLabel = newStatus === "accepted" ? "approved" : newStatus;
      setToast({
        isOpen: true,
        message: `Application ${statusLabel} successfully!`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      setToast({
        isOpen: true,
        message: "Failed to update application status. Please try again.",
        type: "error",
      });
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const applicantBookmarkKey = (app) =>
    app.bookmarkPathfinderId != null ? String(app.bookmarkPathfinderId) : "";

  const handleToggleApplicantBookmark = async (app) => {
    const key = applicantBookmarkKey(app);
    if (!key) {
      setToast({
        isOpen: true,
        message: "Could not bookmark this applicant (missing id).",
        type: "error",
      });
      return;
    }
    setBookmarkBusy((prev) => ({ ...prev, [app.id]: true }));
    try {
      if (savedPathfinderIds.has(key)) {
        await bookmarks.applicantsSavedDelete(app.bookmarkPathfinderId);
        setSavedPathfinderIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        await bookmarks.applicantsSavedCreate({
          pathfinder: app.bookmarkPathfinderId,
          pathfinder_id: app.bookmarkPathfinderId,
          opportunity: Number(opportunityId),
          opportunity_id: Number(opportunityId),
        });
        setSavedPathfinderIds((prev) => new Set(prev).add(key));
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      setToast({
        isOpen: true,
        message: "Could not update bookmark. Please try again.",
        type: "error",
      });
    } finally {
      setBookmarkBusy((prev) => ({ ...prev, [app.id]: false }));
    }
  };

  // Extract contact details (name and email) from cover letter
  const parseContactDetails = (coverLetter) => {
    if (!coverLetter) return { name: "Applicant", email: "" };
    
    const lines = coverLetter.split("\n");
    let name = "Applicant";
    let email = "";
    
    let inContactSection = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.toLowerCase().startsWith("contact details:")) {
        inContactSection = true;
        continue;
      }
      
      // Stop at next section header
      if (inContactSection && (line.toLowerCase().endsWith(":") && !line.includes("@"))) {
        break;
      }
      
      if (inContactSection) {
        if (line.toLowerCase().startsWith("full name:")) {
          name = line.replace(/^full name:\s*/i, "").trim() || "Applicant";
        } else if (line.toLowerCase().startsWith("email:")) {
          email = line.replace(/^email:\s*/i, "").trim() || "";
        }
      }
    }
    
    return { name, email };
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-[#6A00B1] hover:text-[#5A0091] transition-colors"
          >
            <i className="fa fa-arrow-left text-xl"></i>
          </button>

          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-black mb-1">
              Applicants for: {opportunityTitle || "Opportunity"}
            </h1>
            <p className="text-gray-600 text-xs md:text-sm">
              View applications from pathfinders who applied for this opportunity
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading applications...</p>
            </div>
          ) : applicationsList.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <i className="fa fa-inbox text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-sm md:text-base">
                No applications yet for this opportunity.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Pathfinders can apply from the opportunity details page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applicationsList.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    className="p-3 md:p-4 flex items-start gap-3 md:gap-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-[#6A00B1] font-bold text-lg">
                      {app.pathfinderName ? app.pathfinderName.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm md:text-base font-bold text-black mb-1">
                        {app.pathfinderName || "Applicant"}
                      </h2>
                      <p className="text-gray-600 text-xs md:text-sm">
                        {app.pathfinderEmail}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                        {app.applicationText}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status || 'pending'}
                      </span>
                      <i
                        className={`fa fa-chevron-${expandedId === app.id ? "up" : "down"} text-gray-400`}
                      ></i>
                    </div>
                  </div>

                  {expandedId === app.id && (
                    <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-1">Application details</h3>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">
                          {app.applicationText || "No details provided"}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2 flex-wrap">
                        {app.cvUrl && (
                          <a
                            href={app.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#E0C6FF] text-[#6A00B1] px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#D0B6FF]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Download CV
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const pid = app.userId ?? app.bookmarkPathfinderId;
                            if (!pid) return;
                            navigate(`/enabler/pathfinder/${pid}`, {
                              state: { opportunityId: parseInt(opportunityId, 10) },
                            });
                          }}
                          className="bg-[#E0C6FF] text-[#6A00B1] px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#D0B6FF]"
                        >
                          View Profile
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleApplicantBookmark(app);
                          }}
                          disabled={bookmarkBusy[app.id] || !applicantBookmarkKey(app)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-50 ${
                            savedPathfinderIds.has(applicantBookmarkKey(app))
                              ? "border-[#6A00B1] bg-purple-50 text-[#6A00B1]"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {bookmarkBusy[app.id]
                            ? "…"
                            : savedPathfinderIds.has(applicantBookmarkKey(app))
                              ? "Saved"
                              : "Bookmark"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (app.pathfinderEmail) {
                              window.location.href = `mailto:${app.pathfinderEmail}`;
                            }
                          }}
                          className="bg-[#6A00B1] text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#5A0091]"
                        >
                          Contact
                        </button>
                        {app.status === "pending" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(app.id, "accepted");
                              }}
                              disabled={updatingStatus[app.id]}
                              className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus[app.id] ? "Approving..." : "Approve"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(app.id, "rejected");
                              }}
                              disabled={updatingStatus[app.id]}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus[app.id] ? "Rejecting..." : "Reject"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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

export default Applicants;
