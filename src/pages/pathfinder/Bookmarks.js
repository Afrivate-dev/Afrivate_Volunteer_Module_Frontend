import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import { bookmarks } from "../../services/api";

import { getOrgName, navigateToVolunteerDetails } from "../../utils/opportunityUtils";

function mapSavedToJob(s) {
  const opp =
    s.opportunity && typeof s.opportunity === "object" ? s.opportunity : {};
  const opportunityId =
    s.opportunity_id ??
    (typeof s.opportunity === "number" || typeof s.opportunity === "string"
      ? s.opportunity
      : null) ??
    opp.id ??
    s.id;
  return {
    id: opportunityId,
    title: opp.title || s.title || "Opportunity",
    company: getOrgName(opp),
    type: opp.opportunity_type || s.opportunity_type || "Volunteering",
    location: opp.location || s.location || "",
    created_by: opp.created_by,
    link: opp.link,
    _raw: Object.keys(opp).length ? opp : s,
  };
}

function mapSavedToEnabler(s) {
  const enabler = s.enabler_details || {};
  const enablerId = s.enabler_id ?? s.enabler ?? enabler.id ?? s.id;
  return {
    id: enablerId,
    name: enabler.organization_name || enabler.name || "Organization",
    about: enabler.about || enabler.bio || "No description provided.",
    location: enabler.location || "",
    _raw: s,
  }
}

const Bookmarks = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("opportunities");
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [bookmarkedEnablers, setBookmarkedEnablers] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [oppData, enablerData] = await Promise.all([
        bookmarks.opportunitiesSavedList().catch(() => []),
        bookmarks.enablersSavedList().catch(() => [])
      ]);

      const rawOpp = Array.isArray(oppData) ? oppData : oppData?.results || [];
      const arrOpp = rawOpp.map(mapSavedToJob).filter((j) => j.id != null);
      setBookmarkedJobs(arrOpp);

      const rawEnablers = Array.isArray(enablerData) ? enablerData : enablerData?.results || [];
      const arrEnablers = rawEnablers.map(mapSavedToEnabler).filter((e) => e.id != null);
      setBookmarkedEnablers(arrEnablers);

    } catch (err) {
      console.error("Error loading bookmarks:", err);
      setError(err.message || "Failed to load bookmarks");
      setBookmarkedJobs([]);
      setBookmarkedEnablers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Bookmarks - AfriVate";
  }, []);

  useEffect(() => {
    loadBookmarks();
    const handleFocus = () => loadBookmarks();
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadBookmarks]);

  const handleRemoveJobBookmark = async (job) => {
    if (job.id == null) return;
    try {
      await bookmarks.opportunitiesSavedDelete(job.id);
      setBookmarkedJobs((prev) => prev.filter((j) => j.id !== job.id));
    } catch (err) {
      console.error("Error removing job bookmark:", err);
    }
  };

  const handleRemoveEnablerBookmark = async (enabler) => {
    if (enabler.id == null) return;
    try {
      await bookmarks.enablersSavedDelete(enabler.id);
      setBookmarkedEnablers((prev) => prev.filter((e) => e.id !== enabler.id));
    } catch (err) {
      console.error("Error removing enabler bookmark:", err);
    }
  };

  const handleViewJobDetails = async (job) => {
    await navigateToVolunteerDetails(navigate, job.id, { fallbackJob: job });
  };

  const handleViewEnablerDetails = (enabler) => {
    navigate(`/organization/${enabler.id}`); 
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar />
      
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 mt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">
              Bookmarks
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              View and manage your saved volunteering opportunities
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-6 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`pb-3 font-medium text-sm md:text-base transition-colors ${
                activeTab === "opportunities"
                  ? "border-b-2 border-[#6A00B1] text-[#6A00B1]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Opportunities ({bookmarkedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab("organizations")}
              className={`pb-3 font-medium text-sm md:text-base transition-colors ${
                activeTab === "organizations"
                  ? "border-b-2 border-[#6A00B1] text-[#6A00B1]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Organizations ({bookmarkedEnablers.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading bookmarks...</div>
          ) : (
            <>
              {activeTab === "opportunities" && (
                bookmarkedJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fa fa-bookmark-o text-gray-300 text-4xl mb-4"></i>
                    <p className="text-gray-500 text-lg mb-2">No bookmarked opportunities yet</p>
                    <button
                      onClick={() => navigate('/opportunity')}
                      className="mt-6 bg-[#6A00B1] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#5A0091] transition-colors"
                    >
                      Browse Opportunities
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {bookmarkedJobs.map((job) => (
                      <div
                        key={String(job.id)}
                        className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-sm transition-all cursor-pointer"
                        onClick={(e) => {
                          if (e.target.closest('button')) return;
                          handleViewJobDetails(job);
                        }}
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-[#6A00B1] font-bold">
                          {job.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-bold text-gray-900 text-sm mb-0.5">{job.title}</h2>
                          <p className="text-xs text-gray-500">{job.company}{job.type ? ` - ${job.type}` : ''}</p>
                          {job.location && <p className="text-xs text-gray-500">{job.location}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewJobDetails(job)}
                            className="bg-[#6A00B1] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#5A0091] transition-colors whitespace-nowrap"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleRemoveJobBookmark(job)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove bookmark"
                          >
                            <i className="fa fa-times text-lg"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === "organizations" && (
                bookmarkedEnablers.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fa fa-building-o text-gray-300 text-4xl mb-4"></i>
                    <p className="text-gray-500 text-lg mb-2">No bookmarked organizations yet</p>
                    <p className="text-gray-400 text-sm">Save organizations to keep track of them here.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {bookmarkedEnablers.map((enabler) => (
                      <div
                        key={String(enabler.id)}
                        className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-sm transition-all cursor-pointer"
                        onClick={(e) => {
                          if (e.target.closest('button')) return;
                          handleViewEnablerDetails(enabler);
                        }}
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-[#6A00B1] font-bold">
                          {enabler.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-bold text-gray-900 text-sm mb-0.5">{enabler.name}</h2>
                          <p className="text-xs text-gray-500 truncate">{enabler.about}</p>
                          {enabler.location && <p className="text-xs text-gray-500 mt-1"><i className="fa fa-map-marker mr-1"></i>{enabler.location}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewEnablerDetails(enabler)}
                            className="bg-[#6A00B1] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#5A0091] transition-colors whitespace-nowrap"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleRemoveEnablerBookmark(enabler)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove bookmark"
                          >
                            <i className="fa fa-times text-lg"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Bookmarks;
