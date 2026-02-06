import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";

const OpportunityDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set page title
  useEffect(() => {
    document.title = "Opportunity Details - AfriVate";
  }, []);

  // Load opportunity data from localStorage
  useEffect(() => {
    setLoading(true);
    // Try to get from localStorage first (from CreateOpportunity or OpportunitiesPosted)
    const savedOpportunities = JSON.parse(localStorage.getItem('enablerOpportunities') || '[]');
    const found = savedOpportunities.find(opp => opp.id === id || opp.id === String(id));
    
    if (found) {
      setOpportunity({
        id: found.id,
        title: found.title || "",
        company: found.company || "",
        type: found.type || "",
        description: found.description || "",
        responsibilities: Array.isArray(found.responsibilities) ? found.responsibilities : 
                         (found.responsibilities ? [found.responsibilities] : []),
        qualifications: Array.isArray(found.qualifications) ? found.qualifications : 
                       (found.qualifications ? [found.qualifications] : []),
        aboutCompany: found.aboutCompany || "",
        applicationInstructions: found.applicationInstructions || "",
        jobType: found.jobType || "",
        location: found.location || "",
        workModel: found.workModel || "",
        timeCommitment: found.timeCommitment || ""
      });
    } else {
      setOpportunity(null);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-6xl mx-auto text-center py-12">
            <p className="text-gray-500">Loading opportunity details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-6xl mx-auto text-center py-12">
            <p className="text-gray-500">No opportunity found.</p>
            <button
              onClick={() => navigate('/enabler/opportunities-posted')}
              className="mt-4 text-[#6A00B1] font-semibold hover:underline"
            >
              Back to opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      
      {/* Main Content */}
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-[#6A00B1] hover:text-[#5A0091] transition-colors"
          >
            <i className="fa fa-arrow-left text-xl"></i>
          </button>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                {opportunity.title}
              </h1>
              <p className="text-gray-700 text-sm md:text-base">
                {opportunity.company} <span className="text-[#6A00B1] font-bold">-{opportunity.type}</span>
              </p>
            </div>

            <div className="flex gap-2 self-start md:self-auto">
              <button
                onClick={() => navigate(`/enabler/applicants/${opportunity.id}`)}
                className="bg-[#E0C6FF] text-[#6A00B1] px-4 py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-[#D0B6FF] transition-colors whitespace-nowrap"
              >
                View Applicants
              </button>
              <button
                onClick={() => navigate(`/enabler/edit-opportunity/${opportunity.id}`)}
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-[#5A0091] transition-colors whitespace-nowrap"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Volunteering Description */}
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-black">
                    Volunteering Description
                  </h2>
                  <button
                    onClick={() => navigate(`/enabler/edit-opportunity/${opportunity.id}?section=description`)}
                    className="text-[#6A00B1] hover:text-[#5A0091] transition-colors"
                  >
                    <i className="fa fa-pencil text-sm"></i>
                  </button>
                </div>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {opportunity.description}
                </p>
              </div>

              {/* Key Responsibilities */}
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-black">
                    Key Responsibilities
                  </h2>
                  <button
                    onClick={() => navigate(`/enabler/edit-opportunity/${opportunity.id}?section=responsibilities`)}
                    className="text-[#6A00B1] hover:text-[#5A0091] transition-colors"
                  >
                    <i className="fa fa-pencil text-sm"></i>
                  </button>
                </div>
                <ul className="space-y-2">
                  {opportunity.responsibilities.map((responsibility, index) => (
                    <li key={index} className="text-gray-700 text-sm md:text-base flex items-start gap-2">
                      <span className="text-[#6A00B1] mt-1">•</span>
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Qualifications & Requirements */}
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-black">
                    Qualifications & Requirements
                  </h2>
                  <button
                    onClick={() => navigate(`/enabler/edit-opportunity/${opportunity.id}?section=qualifications`)}
                    className="text-[#6A00B1] hover:text-[#5A0091] transition-colors"
                  >
                    <i className="fa fa-pencil text-sm"></i>
                  </button>
                </div>
                <ul className="space-y-2">
                  {opportunity.qualifications.map((qualification, index) => (
                    <li key={index} className="text-gray-700 text-sm md:text-base flex items-start gap-2">
                      <span className="text-[#6A00B1] mt-1">•</span>
                      <span>{qualification}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* About the Company */}
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-black">
                    About the Company
                  </h2>
                  <button
                    onClick={() => navigate(`/enabler/edit-opportunity/${opportunity.id}?section=about`)}
                    className="text-[#6A00B1] hover:text-[#5A0091] transition-colors"
                  >
                    <i className="fa fa-pencil text-sm"></i>
                  </button>
                </div>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {opportunity.aboutCompany}
                </p>
              </div>

              {/* Application Instructions */}
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-black">
                    Application Instructions
                  </h2>
                  <button
                    onClick={() => navigate(`/enabler/edit-opportunity/${opportunity.id}?section=instructions`)}
                    className="text-[#6A00B1] hover:text-[#5A0091] transition-colors"
                  >
                    <i className="fa fa-pencil text-sm"></i>
                  </button>
                </div>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {opportunity.applicationInstructions}
                </p>
              </div>
            </div>

            {/* Right Column - Job Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200 sticky top-24">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
                  Job Summary
                </h2>
                
                <div className="space-y-4">
                  {/* Job Type */}
                  <div className="flex items-center gap-3">
                    <i className="fa fa-briefcase text-[#6A00B1] text-lg"></i>
                    <div>
                      <p className="text-gray-600 text-xs md:text-sm">Job Type</p>
                      <p className="text-gray-900 font-medium text-sm md:text-base">
                        {opportunity.jobType}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3">
                    <i className="fa fa-map-marker text-[#6A00B1] text-lg"></i>
                    <div>
                      <p className="text-gray-600 text-xs md:text-sm">Location</p>
                      <p className="text-gray-900 font-medium text-sm md:text-base">
                        {opportunity.location}
                      </p>
                    </div>
                  </div>

                  {/* Work Model */}
                  {opportunity.workModel && (
                    <div className="flex items-center gap-3">
                      <i className="fa fa-laptop text-[#6A00B1] text-lg"></i>
                      <div>
                        <p className="text-gray-600 text-xs md:text-sm">Work Model</p>
                        <p className="text-gray-900 font-medium text-sm md:text-base">
                          {opportunity.workModel}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Time Commitment */}
                  {opportunity.timeCommitment && (
                    <div className="flex items-center gap-3">
                      <i className="fa fa-clock text-[#6A00B1] text-lg"></i>
                      <div>
                        <p className="text-gray-600 text-xs md:text-sm">Time Commitment</p>
                        <p className="text-gray-900 font-medium text-sm md:text-base">
                          {opportunity.timeCommitment}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails;
