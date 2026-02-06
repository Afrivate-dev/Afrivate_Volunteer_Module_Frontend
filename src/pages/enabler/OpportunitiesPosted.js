import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Modal from "../../components/common/Modal";
import * as api from "../../services/api";

function mapApiOpportunity(item) {
  return {
    id: String(item.id),
    title: item.title || '',
    company: "Tech Innovators",
    type: "Volunteering",
    description: item.description || '',
    responsibilities: [],
    qualifications: [],
    aboutCompany: '',
    applicationInstructions: '',
    jobType: "Volunteer",
    location: "Remote",
    workModel: "Remote",
    timeCommitment: "",
    link: item.link,
    posted_at: item.posted_at,
    is_open: item.is_open,
  };
}

const OpportunitiesPosted = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [clearAllModal, setClearAllModal] = useState({ isOpen: false });

  useEffect(() => {
    document.title = "Opportunities Posted - AfriVate";
  }, []);

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.bookmark.opportunitiesList();
      const arr = Array.isArray(data) ? data.map(mapApiOpportunity) : [];
      if (arr.length > 0) {
        setOpportunities(arr);
        setLoading(false);
        return;
      }
    } catch (_) {}
    const saved = JSON.parse(localStorage.getItem('enablerOpportunities') || '[]');
    setOpportunities(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    const updated = opportunities.filter(opp => opp.id !== deleteModal.id);
    setOpportunities(updated);
    localStorage.setItem('enablerOpportunities', JSON.stringify(updated));
    setDeleteModal({ isOpen: false, id: null });
  };

  const handleClearAll = () => {
    setClearAllModal({ isOpen: true });
  };

  const confirmClearAll = () => {
    setOpportunities([]);
    localStorage.setItem('enablerOpportunities', JSON.stringify([]));
    setClearAllModal({ isOpen: false });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-black mb-1">
                Opportunities Posted
              </h1>
              <p className="text-gray-600 text-xs md:text-sm">
                View and manage all your posted volunteering opportunities
              </p>
            </div>
            {opportunities.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-[#6A00B1] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#5A0091] transition-colors flex items-center gap-2 whitespace-nowrap w-fit md:w-auto"
              >
                <i className="fa fa-check text-xs"></i>
                Clear All
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
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
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-gray-100 rounded-lg p-3 md:p-4 flex items-start gap-3 md:gap-4"
                >
                  {/* Circular Placeholder Image */}
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                    <i className="fa fa-briefcase text-lg md:text-xl text-gray-500"></i>
                  </div>

                  {/* Opportunity Details - Clickable */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/enabler/opportunity/${opp.id}`)}
                  >
                    <h2 className="text-sm md:text-base font-bold text-black mb-1">
                      {opp.title}
                    </h2>
                    <p className="text-gray-600 text-xs md:text-sm mb-1">
                      {opp.experience ? `Experience: ${opp.experience}` : opp.qualifications ? `Requirements: ${Array.isArray(opp.qualifications) ? opp.qualifications.join(', ') : opp.qualifications}` : ''}
                    </p>
                    <p className="text-gray-600 text-xs md:text-sm">
                      {opp.skills ? `Skills: ${opp.skills}` : opp.location ? `Location: ${opp.location}` : ''}
                    </p>
                  </div>

                  {/* Action Buttons */}
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
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Opportunity"
        message="Are you sure you want to delete this opportunity?"
        confirmText="Delete"
        type="danger"
      />

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={clearAllModal.isOpen}
        onClose={() => setClearAllModal({ isOpen: false })}
        onConfirm={confirmClearAll}
        title="Clear All Opportunities"
        message="Are you sure you want to clear all opportunities? This action cannot be undone."
        confirmText="Clear All"
        type="danger"
      />
    </div>
  );
};

export default OpportunitiesPosted;
