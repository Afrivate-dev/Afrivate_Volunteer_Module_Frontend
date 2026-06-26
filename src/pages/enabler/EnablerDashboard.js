import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import { useUser } from "../../context/UserContext";
import { opportunities, applications } from "../../services/api";

const statusConfig = (status = "") => {
  const s = status.toLowerCase();
  if (s === "open" || s === "active" || s === "published")
    return { label: "Currently open", cls: "bg-green-100 text-green-700" };
  if (s === "pending" || s === "draft")
    return { label: "Application pending", cls: "bg-orange-100 text-orange-600" };
  return { label: "Position closed", cls: "bg-gray-100 text-gray-500" };
};

const applicantStatusConfig = (status = "") => {
  const s = status.toLowerCase();
  if (s === "shortlisted")
    return { label: "Shortlisted candidates", cls: "bg-purple-100 text-purple-700" };
  if (s === "accepted")
    return { label: "Accepted", cls: "bg-green-100 text-green-700" };
  if (s === "rejected")
    return { label: "Rejected", cls: "bg-red-100 text-red-600" };
  if (s === "under_review" || s === "review")
    return { label: "Under review", cls: "bg-gray-100 text-gray-600" };
  return { label: "New applicant", cls: "bg-blue-100 text-blue-700" };
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  return `${Math.floor(weeks / 4)} month(s) ago`;
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-lg">
        {icon}
      </div>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <p className="text-4xl font-bold text-gray-900">{value}</p>
  </div>
);

const EnablerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading, error, logout, clearError } = useUser();
  const [opportunitiesList, setOpportunitiesList] = useState([]);
  const [welcomeName, setWelcomeName] = useState("");
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [appCountByOpp, setAppCountByOpp] = useState({});

  useEffect(() => {
    document.title = "Enabler Dashboard - AfriVate";
  }, []);

  useEffect(() => {
    if (user?.name) setWelcomeName(user.name);
    else if (user?.first_name) setWelcomeName(user.first_name);
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setOpportunitiesLoading(true);
      try {
        const data = await opportunities.mine();
        setOpportunitiesList(Array.isArray(data) ? data : []);
      } catch {
        setOpportunitiesList([]);
      } finally {
        setOpportunitiesLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await applications.list();
        if (!Array.isArray(data)) return;
        setTotalApplications(data.length);

        // count per opportunity
        const counts = {};
        data.forEach((a) => {
          const oid = String(a.opportunity || "");
          if (oid) counts[oid] = (counts[oid] || 0) + 1;
        });
        setAppCountByOpp(counts);

        // recent applicants — latest 4
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        setRecentApplicants(sorted.slice(0, 4));
      } catch {
        setRecentApplicants([]);
      }
    };
    load();
  }, []);

  const openCount = opportunitiesList.filter((o) => {
    const s = (o.status || "").toLowerCase();
    return s === "open" || s === "active" || s === "published";
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <EnablerNavbar />
        <div className="pt-14 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8D4087] border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-24 px-4 max-w-md mx-auto text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => { clearError(); logout(); navigate("/login"); }}
            className="bg-[#8D4087] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#651F5F]"
          >
            Log out and sign in again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />

      <div className="pt-16">
        {/* Hero Banner */}
        <div
          className="mx-4 sm:mx-6 mt-6 sm:mt-8 rounded-2xl px-5 sm:px-12 py-7 sm:py-10"
          style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                Welcome back{welcomeName ? `, ${welcomeName}` : ""}!
              </h1>
              <p className="text-purple-200 text-base">
                Manage your opportunities and connect with the right Pathfinders.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => navigate("/create-opportunity")}
                className="flex items-center gap-2 border border-white text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-white hover:text-[#651F5F] transition-colors"
              >
                + Add opportunity
              </button>
              <button
                onClick={() => navigate("/enabler/profile")}
                className="border border-white text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-white hover:text-[#651F5F] transition-colors"
              >
                View your profile
              </button>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mx-4 sm:mx-6 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={null} label="Open opportunities" value={openCount} />
          <StatCard icon={null} label="Total applications" value={totalApplications} />
          <StatCard icon={null} label="Opportunities posted" value={opportunitiesList.length} />
        </div>

        {/* Main Grid */}
        <div className="mx-4 sm:mx-6 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* Current Opportunities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your current opportunities</h2>
              <button
                onClick={() => navigate("/enabler/opportunities-posted")}
                className="text-sm font-semibold text-[#8D4087] hover:underline"
              >
                See more
              </button>
            </div>

            {opportunitiesLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#8D4087] border-t-transparent" />
              </div>
            ) : opportunitiesList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <p className="text-gray-500 mb-4">No opportunities posted yet.</p>
                <button
                  onClick={() => navigate("/create-opportunity")}
                  className="bg-[#8D4087] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#651F5F] transition-colors"
                >
                  Post Your First Opportunity
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {opportunitiesList.slice(0, 3).map((opp) => {
                  const { label, cls } = statusConfig(opp.status);
                  const appCount = appCountByOpp[String(opp.id)] || 0;
                  return (
                    <div
                      key={opp.id}
                      onClick={() => navigate(`/enabler/opportunity/${opp.id}`)}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-base truncate">{opp.title}</p>
                          <p className="text-gray-500 text-sm mt-0.5">
                            {opp.organization_name || opp.company || "Your organization"} •{" "}
                            {opp.location || "Remote"}
                          </p>
                        </div>
                        <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{appCount} applicant{appCount !== 1 ? "s" : ""} applied</span>
                          {opp.created_at && (
                            <span>{timeAgo(opp.created_at)}</span>
                          )}
                        </div>
                        <span className="text-[#8D4087] text-lg">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Applicants + Tip */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent applicants</h2>
              <button
                onClick={() => navigate("/enabler/applicants")}
                className="text-sm font-semibold text-[#8D4087] hover:underline"
              >
                See more
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              {recentApplicants.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-10">No applicants yet.</p>
              ) : (
                recentApplicants.map((applicant, i) => {
                  const name =
                    applicant.applicant_name ||
                    applicant.pathfinder_name ||
                    (applicant.pathfinder?.first_name
                      ? `${applicant.pathfinder.first_name} ${applicant.pathfinder.last_name || ""}`.trim()
                      : `Applicant ${i + 1}`);
                  const role =
                    applicant.opportunity_title ||
                    applicant.role ||
                    "Opportunity applicant";
                  const avatar =
                    applicant.applicant_photo ||
                    applicant.pathfinder?.profile_photo ||
                    null;
                  const { label, cls } = applicantStatusConfig(applicant.status);
                  return (
                    <div key={i} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{name}</p>
                          <p className="text-gray-500 text-xs">{role}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
                        {label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Enabler Tip */}
            <div
              className="mt-4 rounded-2xl p-6"
              style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                
                <span className="text-purple-200 text-sm font-semibold">Enabler Tip</span>
              </div>
              <p className="text-white text-sm leading-relaxed mb-4">
                You have {totalApplications} application{totalApplications !== 1 ? "s" : ""} across
                your opportunities. Review them to find the best Pathfinder matches and shortlist
                top candidates to speed up your process.
              </p>
              <button
                onClick={() => navigate("/enabler/applicants")}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                View matches
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnablerDashboard;
