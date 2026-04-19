import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import { useUser } from "../../context/UserContext";
import { opportunities, applications } from "../../services/api";

const EnablerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading, error, logout, clearError } = useUser();
  const [opportunitiesList, setOpportunitiesList] = useState([]);
  const [welcomeName, setWelcomeName] = useState("");
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    document.title = "Enabler Dashboard - AfriVate";
  }, []);

  useEffect(() => {
    if (user && user.name) {
      setWelcomeName(user.name);
    } else if (user && user.first_name) {
      setWelcomeName(user.first_name);
    }
  }, [user]);

  // Load opportunities from API
  useEffect(() => {
    const loadOpportunities = async () => {
      setOpportunitiesLoading(true);
      try {
        const data = await opportunities.mine();
        const list = Array.isArray(data) ? data : [];
        setOpportunitiesList(list);
      } catch (err) {
        console.error("Error loading opportunities:", err);
        setOpportunitiesList([]);
      } finally {
        setOpportunitiesLoading(false);
      }
    };
    loadOpportunities();
  }, []);

  // Load applications from API
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const data = await applications.list();
        if (Array.isArray(data)) {
          const byOpp = {};
          data.forEach((a) => {
            const oid = String(a.opportunity || "");
            if (!oid) return;
            if (!byOpp[oid]) {
              byOpp[oid] = { 
                opportunityId: oid, 
                jobTitle: a.opportunity_title || "Opportunity", 
                count: 0,
                status: a.status || "pending"
              };
            }
            byOpp[oid].count += 1;
          });
          
          setApplicants(
            Object.values(byOpp).map((o) => ({
              opportunityId: o.opportunityId,
              jobTitle: o.jobTitle,
              applications: o.count,
              status: o.status === "pending" ? "Pending" : o.status === "accepted" ? "Accepted" : o.status === "rejected" ? "Rejected" : "New",
              statusColor: o.status === "pending" ? "bg-yellow-100 text-yellow-800" : o.status === "accepted" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
            }))
          );
        }
      } catch (err) {
        console.error("Error loading applications:", err);
        setApplicants([]);
      }
    };
    loadApplications();
  }, []);

  const analytics = [
    { label: "Views", value: "—", change: "", trend: "up", period: "Coming soon" },
    { label: "Completed Applications", value: applicants.length, change: "", trend: "up", period: "Total applications" },
    { label: "Qualified Candidates", value: "—", change: "", trend: "up", period: "Coming soon" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans flex items-center justify-center">
        <EnablerNavbar />
        <div className="pt-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-24 px-4 max-w-md mx-auto text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => { clearError(); logout(); navigate('/login'); }}
            className="bg-[#6A00B1] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#5A0091]"
          >
            Log out and sign in again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      
      {/* Main Content */}
      <div className="pt-16 sm:pt-20 px-4 sm:px-6 pb-8">
        <div className="max-w-3xl lg:max-w-4xl mx-auto">
          
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#6A00B1]">
                Enabler Dashboard
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                {welcomeName ? `Welcome, ${welcomeName}! ` : ""}Manage your opportunities and track your impact
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/create-opportunity')}
                className="bg-[#6A00B1] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-[#5A0091] transition-colors whitespace-nowrap"
              >
                Post
              </button>
              <button
                onClick={() => navigate('/enabler/profile')}
                className="border-2 border-[#6A00B1] text-[#6A00B1] px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-purple-50 transition-colors whitespace-nowrap"
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Your opportunities from API */}
          {!opportunitiesLoading && opportunitiesList.length > 0 && (
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-black mb-3 md:mb-4">
                Your Opportunities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {opportunitiesList.slice(0, 4).map((opp) => (
                  <div
                    key={opp.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/enabler/opportunity/${opp.id}`)}
                  >
                    <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{opp.title}</p>
                    <p className="text-gray-600 text-xs md:text-sm mt-1">{opp.opportunity_type || 'Volunteering'} · {opp.location || 'Remote'}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/enabler/opportunity/${opp.id}`); }}
                      className="mt-2 text-[#6A00B1] text-xs font-semibold hover:underline"
                    >
                      View details →
                    </button>
                  </div>
                ))}
              </div>
              {opportunitiesList.length > 4 && (
                <button
                  onClick={() => navigate('/enabler/opportunities-posted')}
                  className="mt-3 text-[#6A00B1] text-sm font-semibold hover:underline"
                >
                  View all ({opportunitiesList.length}) opportunities
                </button>
              )}
            </div>
          )}

          {/* Empty State for Opportunities */}
          {!opportunitiesLoading && opportunitiesList.length === 0 && (
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-black mb-3 md:mb-4">
                Your Opportunities
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">You haven't posted any opportunities yet.</p>
                <button
                  onClick={() => navigate('/create-opportunity')}
                  className="bg-[#6A00B1] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors"
                >
                  Post Your First Opportunity
                </button>
              </div>
            </div>
          )}

          {/* Analytics Summary */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-black mb-3 md:mb-4">
              Analytics Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {analytics.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm"
                >
                  <p className="text-xs md:text-sm text-gray-600 mb-1">{item.label}</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-xl sm:text-2xl font-bold text-black">
                      {item.value}
                    </p>
                    <div className="flex items-center gap-1">
                      {item.trend === "up" ? (
                        <i className="fa fa-arrow-up text-green-500 text-xs"></i>
                      ) : (
                        <i className="fa fa-arrow-down text-red-500 text-xs"></i>
                      )}
                      <span className={`text-xs font-medium ${
                        item.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}>
                        {item.change}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{item.period}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Applicants Section */}
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-black mb-3 md:mb-4">
              Applicants
            </h2>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <p className="font-semibold text-gray-700 text-sm">Job Title</p>
                </div>
                <div className="col-span-3">
                  <p className="font-semibold text-gray-700 text-sm">Applications</p>
                </div>
                <div className="col-span-3">
                  <p className="font-semibold text-gray-700 text-sm">Status</p>
                </div>
                <div className="col-span-2"></div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-200">
                {applicants.length === 0 && (
                  <p className="px-4 py-8 text-center text-gray-500 text-sm">No applicant data yet.</p>
                )}
                {applicants.map((applicant, index) => (
                  <div
                    key={index}
                    className="px-4 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-4">
                      <p className="font-medium text-gray-900 text-sm">
                        {applicant.jobTitle}
                      </p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-gray-700 text-sm">
                        {applicant.applications} Applications
                      </p>
                    </div>
                    <div className="col-span-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${applicant.statusColor}`}>
                        {applicant.status}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => navigate(`/enabler/applicants/${applicant.opportunityId}`)}
                        className="bg-[#6A00B1] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#5A0091] transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {applicants.length === 0 && (
                <p className="py-4 text-center text-gray-500 text-sm">No applicant data yet.</p>
              )}
              {applicants.map((applicant, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {applicant.jobTitle}
                      </p>
                      <p className="text-gray-700 text-xs mb-2">
                        {applicant.applications} Applications
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${applicant.statusColor}`}>
                        {applicant.status}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/enabler/applicants/${applicant.opportunityId}`)}
                      className="bg-[#6A00B1] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#5A0091] transition-colors w-full"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnablerDashboard;
