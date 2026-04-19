import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Toast from "../../components/common/Toast";
import { opportunities, bookmarks, applications } from "../../services/api";
import { getOrgName, navigateToVolunteerDetails } from "../../utils/opportunityUtils";
import { parseDescription } from "../../utils/descriptionUtils";

function getOpportunityPreview(text) {
  const parsed = parseDescription(text);
  const pieces = [parsed.description, parsed.keyResponsibilities, parsed.requirementsBenefits].filter(Boolean);
  const combined = pieces.join("\n\n");
  const cleaned = combined.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.length > 220 ? `${cleaned.slice(0, 220).trim()}…` : cleaned;
}

function mapOpportunityFromApi(item) {
  if (!item) return null;

  return {
    id: String(item.id),
    title: item.title,
    company: getOrgName(item),
    type: item.opportunity_type || "Volunteering",
    location: item.location || "",
    description: getOpportunityPreview(item.description || ""),
    _raw: item,
  };
}

const AvailableOpportunities = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [appliedMap, setAppliedMap] = useState({});
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await opportunities.list({ is_open: true });
      const rawList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      const arr = rawList.map(mapOpportunityFromApi).filter(Boolean);
      setList(arr);
    } catch (err) {
      console.error("Error loading opportunities:", err);
      setError(err.message || "Failed to load opportunities");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSavedIds = useCallback(async () => {
    try {
      const api = await import("../../services/api");
      if (!api.getAccessToken()) return;
      const data = await bookmarks.opportunitiesSavedList();
      const raw = Array.isArray(data) ? data : data?.results || [];
      const ids = new Set(
        raw
          .map((row) => {
            const oid =
              row.opportunity_id ??
              (typeof row.opportunity === "number" || typeof row.opportunity === "string"
                ? row.opportunity
                : row.opportunity?.id);
            return oid != null ? String(oid) : null;
          })
          .filter(Boolean)
      );
      setSavedIds(ids);
    } catch (err) {
      console.error("Error loading saved IDs:", err);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    try {
      const api = await import("../../services/api");
      if (!api.getAccessToken()) return;
      const data = await applications.list();
      const raw = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      const map = {};
      raw.forEach((app) => {
        const oppId = String(app.opportunity ?? app.opportunity_id ?? app.id);
        if (oppId) map[oppId] = app;
      });
      setAppliedMap(map);
    } catch (err) {
      console.error("Error loading applications:", err);
    }
  }, []);

  useEffect(() => {
    document.title = "Available Opportunities - AfriVate";
    loadOpportunities();
    loadSavedIds();
    loadApplications();
  }, [loadOpportunities, loadSavedIds, loadApplications]);

  const filteredList = list.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filterType === "all" || item.type.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesType;
  });

  const handleSave = async (item) => {
    if (savedIds.has(item.id)) {
      // User clicked "Saved" button, navigate to bookmarks
      navigate("/bookmarks");
      return;
    }

    try {
      await bookmarks.opportunitiesSavedCreate({
        opportunity_id: Number(item.id),
      });
      setSavedIds((prev) => new Set([...prev, item.id]));
    } catch (err) {
      console.error("Error saving opportunity:", err);
      setToast({
        isOpen: true,
        message: "We couldn't save that opportunity. Check your connection and try again.",
        type: "error",
      });
    }
  };

  const handleViewOpportunity = async (item) => {
    await navigateToVolunteerDetails(navigate, item.id, {
      existingApplication: appliedMap[item.id] || null,
      fallbackJob: item,
    });
  };

  const handleApply = (item) => {
    if (appliedMap[item.id]) {
      // Already applied, go to application edit
      navigate(`/apply/${item.id}`, {
        state: {
          job: item,
          existingApplication: appliedMap[item.id],
          isEdit: true,
        },
      });
    } else {
      // New application
      navigate(`/apply/${item.id}`, {
        state: {
          job: item,
        },
      });
    }
  };

  const uniqueTypes = ["all", ...new Set(list.map((opp) => opp.type).filter(Boolean))];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar />

      <div className="pt-20 px-4 md:px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Go back"
            >
              <i className="fa fa-arrow-left text-lg"></i>
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-2" style={{ fontFamily: 'Inter' }}>
              Available Opportunities
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Discover volunteering opportunities that match your skills and interests
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="bg-[#FAFAFA] rounded-2xl p-4 md:p-6 mb-6">
            {/* Search Bar */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-black mb-2">Search Opportunities</label>
              <div className="relative">
                <i className="fa fa-search absolute left-3 top-3 text-gray-400"></i>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, organization, or location..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-sm"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">Opportunity Type</label>
              <div className="flex flex-wrap gap-2">
                {uniqueTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filterType === type
                        ? "bg-[#6A00B1] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mb-4 text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredList.length}</span> of{" "}
              <span className="font-semibold">{list.length}</span> opportunities
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6A00B1] border-t-transparent"></div>
              <p className="text-gray-600 ml-4">Loading opportunities...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 px-4">
              <i className="fa fa-briefcase text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 mb-2 text-lg">No opportunities found</p>
              <p className="text-gray-400 text-sm mb-6">
                {list.length === 0 ? "No opportunities available right now" : "Try adjusting your search filters"}
              </p>
              {list.length === 0 ? (
                <button
                  onClick={() => navigate("/pathf")}
                  className="bg-[#6A00B1] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#5A0091] transition-colors"
                >
                  Back to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearch("");
                    setFilterType("all");
                  }}
                  className="bg-[#6A00B1] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#5A0091] transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={(e) => {
                    // ignore clicks on the buttons inside
                    if (e.target.closest('button')) return;
                    handleViewOpportunity(item);
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Opportunity Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-black truncate max-w-xs md:max-w-md">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">{item.company}</p>
                          <div className="flex flex-wrap gap-2 items-center">
                            {item.location && (
                              <span className="inline-flex items-center text-xs text-gray-500">
                                <i className="fa fa-map-marker mr-1"></i>
                                {item.location}
                              </span>
                            )}
                            <span className="inline-block bg-purple-100 text-[#6A00B1] px-2.5 py-0.5 rounded-full text-xs font-medium">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mt-2">{item.description}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap md:flex-nowrap justify-start md:justify-end">
                      <button
                        onClick={() => handleSave(item)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          savedIds.has(item.id)
                            ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                            : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        <i className={`fa fa-bookmark mr-1 ${savedIds.has(item.id) ? "fas" : "far"}`}></i>
                        {savedIds.has(item.id) ? "Saved" : "Save"}
                      </button>

                      <button
                        onClick={() => handleViewOpportunity(item)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors border border-gray-300 whitespace-nowrap"
                      >
                        <i className="fa fa-eye mr-1"></i>
                        View
                      </button>

                      <button
                        onClick={() => handleApply(item)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ${
                          appliedMap[item.id]
                            ? "bg-green-600 hover:bg-green-700 border border-green-600"
                            : "bg-[#6A00B1] hover:bg-[#5A0091] border border-[#6A00B1]"
                        }`}
                      >
                        <i className="fa fa-plus mr-1"></i>
                        {appliedMap[item.id] ? "Update Application" : "Apply"}
                      </button>
                    </div>
                  </div>
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
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AvailableOpportunities;
