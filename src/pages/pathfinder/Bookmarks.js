import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import * as api from "../../services/api";

function mapSavedToJob(s) {
  const opp = s.opportunity || {};
  return {
    id: opp.id ?? s.opportunity_id ?? s.id,
    bookmarkId: s.id,
    title: opp.title || 'Opportunity',
    company: opp.link || opp.description || 'Remote',
  };
}

const Bookmarks = () => {
  const navigate = useNavigate();
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useApi, setUseApi] = useState(true);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.bookmark.opportunitiesSavedList();
      const arr = Array.isArray(data) ? data.map(mapSavedToJob) : [];
      setBookmarkedJobs(arr);
      setUseApi(true);
    } catch (_) {
      try {
        const fallback = JSON.parse(localStorage.getItem('bookmarkedJobsData') || '[]');
        setBookmarkedJobs(Array.isArray(fallback) ? fallback : []);
      } catch (e) {
        setBookmarkedJobs([]);
      }
      setUseApi(false);
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
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', loadBookmarks);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', loadBookmarks);
    };
  }, [loadBookmarks]);

  const handleRemoveBookmark = async (job) => {
    const bookmarkId = job.bookmarkId;
    if (useApi && bookmarkId != null) {
      try {
        await api.bookmark.delete(bookmarkId);
        setBookmarkedJobs((prev) => prev.filter((j) => j.bookmarkId !== bookmarkId));
        return;
      } catch (_) {}
    }
    const updatedJobs = bookmarkedJobs.filter((j) => j.id !== job.id && j.bookmarkId !== bookmarkId);
    setBookmarkedJobs(updatedJobs);
    localStorage.setItem('bookmarkedJobsData', JSON.stringify(updatedJobs));
    const ids = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
    localStorage.setItem('bookmarkedJobs', JSON.stringify(ids.filter((id) => id !== String(job.id))));
  };

  const handleViewDetails = (job) => {
    navigate('/volunteer-details', { state: { job } });
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
                  key={job.bookmarkId ?? job.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-sm transition-all"
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
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;
