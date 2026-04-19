import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import { applications } from "../../services/api";
import { navigateToVolunteerDetails } from "../../utils/opportunityUtils";

/**
 * Pathfinder's own applications only. Linked from "View active volunteering applications" on dashboard.
 */
const MyApplications = () => {
  const navigate = useNavigate();
  const [applicationsList, setApplicationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applications.list();
      const raw = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setApplicationsList(raw);
    } catch (err) {
      console.error("Error loading applications:", err);
      setError(err.message || "Failed to load applications");
      setApplicationsList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "My Applications - AfriVate";
    loadApplications();
  }, [loadApplications]);

  const handleViewApplication = (app) => {
    const oppId = app.opportunity ?? app.opportunity_id ?? app.id;
    const job = {
      id: oppId,
      title: app.opportunity_title || "Opportunity",
      company: "Organization",
      location: "",
      _raw: { created_by: oppId },
    };
    navigate(`/apply/${oppId}`, {
      state: {
        job,
        existingApplication: app,
        isEdit: true,
      },
    });
  };

  const handleViewOpportunity = async (app) => {
    const oppId = app.opportunity ?? app.opportunity_id ?? app.id;
    if (!oppId) return;

    await navigateToVolunteerDetails(navigate, oppId, {
      existingApplication: app,
      fallbackJob: {
        id: oppId,
        title: app.opportunity_title || "Opportunity",
        company: "Organization",
        location: "",
        _raw: {},
      },
    });
  };

  const statusLabel = (status) => {
    if (status === "pending") return "Pending";
    if (status === "accepted") return "Accepted";
    if (status === "rejected") return "Rejected";
    return status || "—";
  };

  const statusColor = (status) => {
    if (status === "pending") return "text-amber-600 bg-amber-50";
    if (status === "accepted") return "text-green-600 bg-green-50";
    if (status === "rejected") return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar />
      <div className="pt-16 sm:pt-20 px-3 sm:px-4 md:px-8 pb-6 sm:pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="mb-3 sm:mb-4 text-gray-600 hover:text-gray-900 touch-manipulation"
              aria-label="Go back"
            >
              <i className="fa fa-arrow-left text-lg sm:text-xl"></i>
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-1">
              My Applications
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              View and manage your volunteering applications
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 sm:py-12 text-gray-500 text-sm sm:text-base">Loading...</div>
          ) : applicationsList.length === 0 ? (
            <div className="text-center py-10 sm:py-12 px-2">
              <i className="fa fa-file-text-o text-3xl sm:text-4xl text-gray-300 mb-3 sm:mb-4"></i>
              <p className="text-gray-500 mb-2 text-sm sm:text-base">No applications yet</p>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 max-w-sm mx-auto">
                Apply for volunteering opportunities to see them here
              </p>
              <button
                onClick={() => navigate("/opportunity")}
                className="bg-[#6A00B1] text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium hover:bg-[#5A0091] transition-colors touch-manipulation"
              >
                Browse Opportunities
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              {applicationsList.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-md transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 mb-0.5 text-sm sm:text-base break-words">
                      {app.opportunity_title || `Opportunity #${app.opportunity}`}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2 truncate sm:max-w-md">
                      {app.cover_letter
                        ? `${app.cover_letter.substring(0, 80)}${app.cover_letter.length > 80 ? "…" : ""}`
                        : "No cover letter"}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColor(
                        app.status
                      )}`}
                    >
                      {statusLabel(app.status)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewOpportunity(app)}
                      className="border border-[#6A00B1] text-[#6A00B1] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-50 transition-colors whitespace-nowrap touch-manipulation"
                    >
                      View opportunity
                    </button>
                    <button
                      onClick={() => handleViewApplication(app)}
                      className="bg-[#6A00B1] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#5A0091] transition-colors whitespace-nowrap touch-manipulation"
                    >
                      View application
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

export default MyApplications;
