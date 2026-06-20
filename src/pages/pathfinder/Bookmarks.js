import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import { bookmarks } from "../../services/api";
import { getOrgName, navigateToVolunteerDetails } from "../../utils/opportunityUtils";

function mapSavedToJob(s) {
  const opp = s.opportunity && typeof s.opportunity === "object" ? s.opportunity : {};
  const opportunityId =
    s.opportunity_id ??
    (typeof s.opportunity === "number" || typeof s.opportunity === "string" ? s.opportunity : null) ??
    opp.id ?? s.id;
  return {
    id: opportunityId,
    bookmarkId: s.id,
    title: opp.title || s.title || "Opportunity",
    company: getOrgName(opp),
    type: opp.opportunity_type || s.opportunity_type || "Volunteering",
    location: opp.location || s.location || "",
    workMode: opp.work_mode || "",
    description: (opp.description || "").replace(/\s+/g, " ").slice(0, 200).trim(),
    _raw: Object.keys(opp).length ? opp : s,
  };
}

const typeChip = (t = "") => {
  const lower = t.toLowerCase();
  if (lower.includes("mentor")) return "bg-blue-100 text-blue-700";
  if (lower.includes("intern")) return "bg-purple-100 text-purple-700";
  if (lower.includes("volunteer")) return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-600";
};

const typeIcon = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("mentor")) return "💼";
  if (t.includes("intern")) return "💻";
  if (t.includes("volunteer")) return "🤝";
  return "🏢";
};

const Bookmarks = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Opportunities");
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [bookmarkedOrgs, setBookmarkedOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookmarks.opportunitiesSavedList();
      const raw = Array.isArray(data) ? data : data?.results || [];
      setBookmarkedJobs(raw.map(mapSavedToJob).filter((j) => j.id != null));
    } catch (err) {
      console.error("Error loading bookmarks:", err);
      setBookmarkedJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrgBookmarks = useCallback(async () => {
    setOrgsLoading(true);
    try {
      const data = await bookmarks.enablersSavedList();
      const raw = Array.isArray(data) ? data : data?.results || [];
      setBookmarkedOrgs(raw.map((row) => {
        const details = row.enabler_details || {};
        const baseDetails = details.base_details || {};
        const name = details.name || details.organization_name || "Organisation";
        const location = [baseDetails.state, baseDetails.country].filter(Boolean).join(", ");
        const enablerUserId = row.enabler_user_id ?? row.enabler_id ?? row.enabler ?? null;
        return { enablerUserId, bookmarkId: row.id, name, location };
      }).filter((o) => o.enablerUserId != null));
    } catch (err) {
      console.error("Error loading org bookmarks:", err);
      setBookmarkedOrgs([]);
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Saved - AfriVate";
    loadBookmarks();
    loadOrgBookmarks();
  }, [loadBookmarks, loadOrgBookmarks]);

  const handleRemoveOpportunity = async (job) => {
    setRemovingId(job.id);
    try {
      await bookmarks.opportunitiesSavedDelete(Number(job.id));
      setBookmarkedJobs((prev) => prev.filter((j) => j.id !== job.id));
    } catch (err) {
      console.error("Error removing bookmark:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveOrg = async (org) => {
    setRemovingId(org.enablerUserId);
    try {
      await bookmarks.enablersSavedDelete(org.enablerUserId);
      setBookmarkedOrgs((prev) => prev.filter((o) => o.enablerUserId !== org.enablerUserId));
    } catch (err) {
      console.error("Error removing org bookmark:", err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <NavBar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-1">Saved</h1>
            <p className="text-purple-200 text-sm mb-5">Manage your bookmarked opportunities and organizations.</p>
            {/* Tabs */}
            <div className="flex items-center gap-0">
              {["Opportunities", "Organisations"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    activeTab === tab ? "bg-white text-[#651F5F]" : "text-purple-200 hover:text-white"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-6">
          {/* Opportunities Tab */}
          {activeTab === "Opportunities" && (
            loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
              </div>
            ) : bookmarkedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <p className="text-3xl mb-3">🔖</p>
                <p className="font-bold text-gray-800 mb-1">No saved opportunities yet</p>
                <p className="text-sm text-gray-400 mb-4">Save opportunities to find them easily later.</p>
                <button onClick={() => navigate("/available-opportunities")}
                  className="bg-[#8D4087] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#651F5F] transition-colors">
                  Browse opportunities
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarkedJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                        {typeIcon(job.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-0.5 cursor-pointer hover:text-[#8D4087]"
                          onClick={() => navigateToVolunteerDetails(navigate, job.id, { job, _raw: job._raw })}>
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {job.company}{job.location && ` • ${job.location}`}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {job.type && (
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeChip(job.type)}`}>
                              {job.type}
                            </span>
                          )}
                          {job.workMode && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{job.workMode}</span>
                          )}
                        </div>
                        {job.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{job.description}</p>
                        )}
                      </div>
                      <button onClick={() => handleRemoveOpportunity(job)}
                        disabled={removingId === job.id}
                        className="text-gray-300 hover:text-red-500 transition-colors text-xl shrink-0 disabled:opacity-50">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Organisations Tab */}
          {activeTab === "Organisations" && (
            orgsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
              </div>
            ) : bookmarkedOrgs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <p className="text-3xl mb-3">🏢</p>
                <p className="font-bold text-gray-800 mb-1">No saved organisations yet</p>
                <p className="text-sm text-gray-400">Follow organisations to stay updated on their opportunities.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarkedOrgs.map((org) => (
                  <div key={org.enablerUserId}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-xl shrink-0">
                      🏢
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 cursor-pointer hover:text-[#8D4087]"
                        onClick={() => navigate(`/enabler-profile/${org.enablerUserId}`)}>
                        {org.name}
                      </h3>
                      {org.location && <p className="text-xs text-gray-400">{org.location}</p>}
                    </div>
                    <button onClick={() => handleRemoveOrg(org)}
                      disabled={removingId === org.enablerUserId}
                      className="text-gray-300 hover:text-red-500 transition-colors text-xl shrink-0 disabled:opacity-50">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;
