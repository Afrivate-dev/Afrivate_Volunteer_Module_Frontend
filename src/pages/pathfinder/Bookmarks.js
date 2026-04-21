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

const Bookmarks = () => {
  const navigate = useNavigate();
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedOrgs, setBookmarkedOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [orgsError, setOrgsError] = useState(null);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookmarks.opportunitiesSavedList();
      const raw = Array.isArray(data) ? data : data?.results || [];
      const arr = raw.map(mapSavedToJob).filter((j) => j.id != null);
      setBookmarkedJobs(arr);
    } catch (err) {
      console.error("Error loading bookmarks:", err);
      setError(err.message || "Failed to load bookmarks");
      setBookmarkedJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrgBookmarks = useCallback(async () => {
    setOrgsLoading(true);
    setOrgsError(null);
    try {
      const data = await bookmarks.enablersSavedList();
      const raw = Array.isArray(data) ? data : data?.results || [];
      const arr = raw.map((row) => {
        const details = row.enabler_details || {};
        const baseDetails = details.base_details || {};
        const name =
          details.organization_name ||
          details.company_name ||
          [details.first_name, details.last_name].filter(Boolean).join(" ").trim() ||
          "Organisation";
        const location = [baseDetails.state, baseDetails.country]
          .filter(Boolean)
          .join(", ");
        const enablerUserId = row.enabler_user_id ?? row.enabler_id ?? row.enabler ?? null;
        return { enablerUserId, name, location };
      }).filter((o) => o.enablerUserId != null);
      setBookmarkedOrgs(arr);
    } catch (err) {
      console.error("Error loading org bookmarks:", err);
      setOrgsError(err.message || "Failed to load organisation bookmarks");
      setBookmarkedOrgs([]);
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  const handleRemoveOrgBookmark = async (enablerUserId) => {
    try {
      await bookmarks.enablersSavedDelete(enablerUserId);
      setBookmarkedOrgs((prev) =>
        prev.filter((o) => String(o.enablerUserId) !== String(enablerUserId))
      );
    } catch (err) {
      console.error("Error removing org bookmark:", err);
    }
  };

  useEffect(() => {
    document.title = "Bookmarks - AfriVate";
  }, []);

  useEffect(() => {
    loadBookmarks();
    loadOrgBookmarks();
    const handleFocus = () => { loadBookmarks(); loadOrgBookmarks(); };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadBookmarks, loadOrgBookmarks]);

  const handleRemoveBookmark = async (job) => {
    if (job.id == null) return;
    try {
      await bookmarks.opportunitiesSavedDelete(job.id);
      setBookmarkedJobs((prev) => prev.filter((j) => j.id !== job.id));
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  const handleViewDetails = async (job) => {
    await navigateToVolunteerDetails(navigate, job.id, {
      fallbackJob: job,
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar />
      
      {/* Main Content */}
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-3xl mx-auto">
          {/* Page Title */}
          <div className="mb-6 mt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">
              Bookmarks
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              View and manage your saved volunteering opportunities
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Bookmarked Jobs List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading bookmarks...</div>
          ) : bookmarkedJobs.length === 0 ? (
            <div className="text-center py-12">
              <i className="fa fa-bookmark-o text-gray-300 text-4xl mb-4"></i>
              <p className="text-gray-500 text-lg mb-2">No bookmarked opportunities yet</p>
              <p className="text-gray-400 text-sm">
                Start bookmarking opportunities to see them here
              </p>
              <button
                onClick={() => navigate('/available-opportunities')}
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
                    handleViewDetails(job);
                  }}
                >
                  {/* Left - Circular Placeholder */}
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>

                  {/* Center - Job Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 text-sm mb-0.5">
                      {job.title}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {job.company}{job.type ? ` - ${job.type}` : ''}
                    </p>
                    {job.location && (
                      <p className="text-xs text-gray-500">
                        {job.location}
                      </p>
                    )}
                  </div>

                  {/* Right - Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(job)}
                      className="bg-[#6A00B1] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#5A0091] transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRemoveBookmark(job)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove bookmark"
                    >
                      <i className="fa fa-times text-lg"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bookmarked Organisations */}
          <div className="mt-10">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-1">
              Saved Organisations
            </h2>
            <p className="text-gray-600 text-sm md:text-base mb-4">
              Organisations you have bookmarked
            </p>

            {orgsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {orgsError}
              </div>
            )}

            {orgsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading organisations...</div>
            ) : bookmarkedOrgs.length === 0 ? (
              <div className="text-center py-8">
                <i className="fa fa-building text-gray-300 text-4xl mb-4"></i>
                <p className="text-gray-500 text-base mb-1">No saved organisations yet</p>
                <p className="text-gray-400 text-sm">
                  Bookmark organisations from their profile pages to see them here
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {bookmarkedOrgs.map((org) => (
                  <div
                    key={String(org.enablerUserId)}
                    className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                      <i className="fa fa-building text-gray-400 text-lg"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-gray-900 text-sm mb-0.5">{org.name}</h2>
                      {org.location && (
                        <p className="text-xs text-gray-500">{org.location}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/organization/${org.enablerUserId}`)}
                        className="bg-[#6A00B1] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#5A0091] transition-colors whitespace-nowrap"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleRemoveOrgBookmark(org.enablerUserId)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove bookmark"
                      >
                        <i className="fa fa-times text-lg"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Bookmarks;
