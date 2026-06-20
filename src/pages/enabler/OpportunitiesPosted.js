import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import { opportunities, profile } from "../../services/api";
import { getOrgName } from "../../utils/opportunityUtils";

const PAGE_SIZE = 10;

function mapApiOpportunity(item) {
  return {
    id: String(item.id),
    title: item.title || "",
    company: getOrgName(item),
    type: item.opportunity_type || "Volunteering",
    description: item.description || "",
    responsibilities: [],
    qualifications: [],
    aboutCompany: "",
    applicationInstructions: "",
    jobType: item.opportunity_type || "Volunteer",
    location: item.location || "",
    workModel: item.work_model || "",
    timeCommitment: "",
    link: item.link,
    posted_at: item.posted_at,
    is_open: item.is_open,
  };
}

const typeIcon = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("mentor")) return "💼";
  if (t.includes("intern")) return "💻";
  if (t.includes("volunteer")) return "🤝";
  return "📋";
};

const OpportunitiesPosted = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [opportunitiesList, setOpportunitiesList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { document.title = "Opportunities Posted - AfriVate"; }, []);

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await opportunities.mine();
      let rawList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : Array.isArray(data?.data) ? data.data : [];
      if (!rawList.length) {
        try {
          const enabler = await profile.enablerGet();
          const enablerName = enabler?.name || enabler?.base_details?.organization_name || null;
          const all = await opportunities.list();
          const allRaw = Array.isArray(all) ? all : Array.isArray(all?.results) ? all.results : Array.isArray(all?.data) ? all.data : [];
          rawList = enablerName ? allRaw.filter((o) => o.created_by_name === enablerName) : allRaw;
        } catch (fallbackErr) { console.error("Fallback loading opportunities failed:", fallbackErr); }
      }
      setOpportunitiesList(rawList.map(mapApiOpportunity));
    } catch (err) {
      console.error("Error loading opportunities:", err);
      setError(err.message || "Failed to load opportunities");
      setOpportunitiesList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOpportunities(); }, [loadOpportunities]);

  useEffect(() => {
    if (location.state?.refreshList) {
      loadOpportunities();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.refreshList, loadOpportunities, navigate, location.pathname]);

  const handleDelete = (id) => setDeleteModal({ isOpen: true, id });

  const confirmDelete = async () => {
    try {
      await opportunities.delete(deleteModal.id);
      setOpportunitiesList((prev) => prev.filter((opp) => opp.id !== deleteModal.id));
    } catch (err) {
      console.error("Error deleting opportunity:", err);
      setError(err.message || "Failed to delete opportunity");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleToggleOpen = async (opp) => {
    if (togglingId) return;
    setTogglingId(opp.id);
    try {
      await opportunities.patch(opp.id, { is_open: !opp.is_open });
      setOpportunitiesList((prev) => prev.map((o) => o.id === opp.id ? { ...o, is_open: !opp.is_open } : o));
    } catch (err) {
      console.error("Error toggling opportunity:", err);
      setError(err.message || "Failed to update opportunity");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-8 py-8">
          <div className="max-w-4xl mx-auto flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Opportunities Posted</h1>
              <p className="text-purple-200 text-sm">View and manage all your posted volunteering opportunities</p>
            </div>
            <button onClick={() => navigate("/create-opportunity")}
              className="flex items-center gap-2 bg-white text-[#651F5F] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors shrink-0">
              + New Opportunity
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
            </div>
          ) : opportunitiesList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-4">📋</p>
              <p className="font-bold text-gray-800 mb-1">No opportunities posted yet</p>
              <p className="text-sm text-gray-400 mb-5">Create your first opportunity to start receiving applications.</p>
              <button onClick={() => navigate("/create-opportunity")}
                className="bg-[#651F5F] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#4a1647] transition-colors">
                Create Your First Opportunity
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunitiesList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((opp) => (
                <div key={opp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-xl shrink-0">
                    {typeIcon(opp.type)}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/enabler/opportunity/${opp.id}`)}>
                    <h2 className="font-bold text-gray-900 mb-0.5">{opp.title}</h2>
                    <p className="text-xs text-gray-500">
                      {opp.type}{opp.location && ` • ${opp.location}`}
                    </p>
                    <div className="mt-1">
                      {opp.is_open ? (
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">Open</span>
                      ) : (
                        <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">Closed</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/enabler/opportunity/${opp.id}`); }}
                      className="border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                      View
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleToggleOpen(opp); }} disabled={togglingId === opp.id}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        opp.is_open ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                      } disabled:opacity-50`}>
                      {togglingId === opp.id ? "…" : opp.is_open ? "Close" : "Reopen"}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(opp.id); }}
                      className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <Pagination
                page={page}
                totalPages={Math.ceil(opportunitiesList.length / PAGE_SIZE)}
                onPrev={() => setPage((p) => p - 1)}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Opportunity"
        message="Deleting this opportunity will also remove all applications. This cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default OpportunitiesPosted;
