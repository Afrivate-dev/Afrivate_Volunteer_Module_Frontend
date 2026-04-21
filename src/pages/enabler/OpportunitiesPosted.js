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
    title: item.title || '',
    company: getOrgName(item),
    type: item.opportunity_type || "Volunteering",
    description: item.description || '',
    responsibilities: [],
    qualifications: [],
    aboutCompany: '',
    applicationInstructions: '',
    jobType: item.opportunity_type || "Volunteer",
    location: item.location || "",
    workModel: item.work_model || "",
    timeCommitment: "",
    link: item.link,
    posted_at: item.posted_at,
    is_open: item.is_open,
  };
}

const OpportunitiesPosted = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [opportunitiesList, setOpportunitiesList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    document.title = "Opportunities Posted - AfriVate";
  }, []);

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await opportunities.mine();
      let rawList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : [];

      // Fallback: if mine() returns empty, load all opportunities and filter by enabler name
      if (!rawList.length) {
        try {
          const enabler = await profile.enablerGet();
          const enablerName = enabler?.name || enabler?.base_details?.organization_name || null;
          const all = await opportunities.list();
          const allRaw = Array.isArray(all)
            ? all
            : Array.isArray(all?.results)
            ? all.results
            : Array.isArray(all?.data)
            ? all.data
            : [];
          rawList = enablerName
            ? allRaw.filter((o) => o.created_by_name === enablerName)
            : allRaw;
        } catch (fallbackErr) {
          console.error("Fallback loading opportunities failed:", fallbackErr);
        }
      }

      const list = rawList.map(mapApiOpportunity);
      setOpportunitiesList(list);
    } catch (err) {
      console.error("Error loading opportunities:", err);
      setError(err.message || "Failed to load opportunities");
      setOpportunitiesList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  useEffect(() => {
    if (location.state?.refreshList) {
      loadOpportunities();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.refreshList, loadOpportunities, navigate, location.pathname]);

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await opportunities.delete(deleteModal.id);
      setOpportunitiesList(prev => prev.filter(opp => opp.id !== deleteModal.id));
    } catch (err) {
      console.error("Error deleting opportunity:", err);
      setError(err.message || "Failed to delete opportunity");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      <div className="pt-14 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-black mb-1">
                Opportunities Posted
              </h1>
              <p className="text-gray-600 text-xs md:text-sm">
                View and manage all your posted volunteering opportunities
              </p>
            </div>
            <button
              onClick={() => navigate('/create-opportunity')}
              className="bg-[#6A00B1] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#5A0091] transition-colors flex items-center gap-2 whitespace-nowrap w-fit md:w-auto"
            >
              <i className="fa fa-plus text-xs"></i>
              New Opportunity
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading opportunities...</p>
            </div>
          ) : opportunitiesList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No opportunities posted yet.</p>
              <button
                onClick={() => navigate('/create-opportunity')}
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors"
              >
                Create Your First Opportunity
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunitiesList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((opp) => (
                <div
                  key={opp.id}
                  className="bg-gray-100 rounded-lg p-3 md:p-4 flex items-start gap-3 md:gap-4"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                    <i className="fa fa-briefcase text-lg md:text-xl text-gray-500"></i>
                  </div>

                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/enabler/opportunity/${opp.id}`)}
                  >
                    <h2 className="text-sm md:text-base font-bold text-black mb-1">
                      {opp.title}
                    </h2>
                    <p className="text-gray-600 text-xs md:text-sm mb-1">
                      {opp.type} · {opp.location}
                    </p>
                    <p className="text-gray-600 text-xs md:text-sm">
                      {opp.is_open ? 'Open for applications' : 'Closed'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/enabler/opportunity/${opp.id}`);
                      }}
                      className="bg-[#6A00B1] text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-semibold hover:bg-[#5A0091] transition-colors whitespace-nowrap"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(opp.id);
                      }}
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-black hover:bg-gray-200 rounded-lg transition-colors"
                      title="Delete opportunity"
                    >
                      <i className="fa fa-times text-sm md:text-base"></i>
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
        message="Are you sure you want to delete this opportunity?"
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default OpportunitiesPosted;
