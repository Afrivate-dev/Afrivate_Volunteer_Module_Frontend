/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import { applications } from "../../services/api";
import { navigateToVolunteerDetails } from "../../utils/opportunityUtils";

// Backend statuses are pending/accepted/rejected — "Closed" maps to rejected.
const STATUS_TABS = ["All", "Pending", "Accepted", "Closed"];

const statusStyle = (status = "") => {
  const s = status.toLowerCase();
  if (s === "pending") return { label: "Pending", cls: "bg-orange-100 text-orange-600" };
  if (s === "shortlisted") return { label: "Shortlisted", cls: "bg-purple-100 text-purple-700" };
  if (s === "accepted") return { label: "Accepted", cls: "bg-green-100 text-green-700" };
  if (s === "rejected" || s === "closed") return { label: s === "rejected" ? "Closed" : "Closed", cls: "bg-gray-100 text-gray-500" };
  return { label: status || "—", cls: "bg-gray-100 text-gray-500" };
};

const formatDate = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const initials = (title = "") =>
  title.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const MyApplications = () => {
  const navigate = useNavigate();
  const [applicationsList, setApplicationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await applications.list();
      const raw = Array.isArray(data) ? data : data?.results || [];
      setApplicationsList(raw);
    } catch (err) {
      console.error("Error loading applications:", err);
      setApplicationsList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "My Applications - AfriVate";
    loadApplications();
  }, [loadApplications]);

  const handleViewOpportunity = async (app) => {
    const oppId = app.opportunity ?? app.opportunity_id ?? app.id;
    if (!oppId) return;
    await navigateToVolunteerDetails(navigate, oppId, {
      existingApplication: app,
      fallbackJob: { id: oppId, title: app.opportunity_title || "Opportunity", company: "Organization", location: "", _raw: {} },
    });
  };

  const handleViewApplication = (app) => {
    const oppId = app.opportunity ?? app.opportunity_id ?? app.id;
    navigate(`/apply/${oppId}`, {
      state: { job: { id: oppId, title: app.opportunity_title || "Opportunity", company: "Organization", location: "", _raw: { created_by: oppId } }, existingApplication: app, isEdit: true },
    });
  };

  const countByStatus = (tab) => {
    if (tab === "All") return applicationsList.length;
    const s = tab.toLowerCase();
    return applicationsList.filter((a) => {
      const appStatus = (a.status || "").toLowerCase();
      if (s === "closed") return appStatus === "rejected" || appStatus === "closed";
      return appStatus === s;
    }).length;
  };

  const filtered = activeTab === "All"
    ? applicationsList
    : applicationsList.filter((a) => {
        const s = (a.status || "").toLowerCase();
        const tab = activeTab.toLowerCase();
        if (tab === "closed") return s === "rejected" || s === "closed";
        return s === tab;
      });

  const bgColors = ["bg-purple-100", "bg-blue-100", "bg-green-100", "bg-orange-100", "bg-pink-100"];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <NavBar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-4 hover:bg-white/30 transition-colors">
              ← Back
            </button>
            <h1 className="text-4xl font-bold text-white mb-1">My Applications</h1>
            <p className="text-purple-200 text-sm">Monitor your career path and explore new opportunities.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 px-2">
            <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden no-scrollbar">
              {STATUS_TABS.map((tab) => {
                const count = countByStatus(tab);
                const active = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                      active ? "text-[#8D4087] border-b-2 border-[#8D4087] -mb-px" : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {tab}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? "bg-[#8D4087] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-gray-400 mb-3">No {activeTab.toLowerCase()} applications yet.</p>
              <button onClick={() => navigate("/available-opportunities")}
                className="text-[#8D4087] font-semibold text-sm hover:underline">Browse opportunities →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((app, i) => {
                const oppId = app.opportunity ?? app.opportunity_id ?? app.id;
                const title = app.opportunity_title || "Opportunity";
                const company = app.organization_name || "Organisation";
                const location = app.location || "";
                const { label, cls } = statusStyle(app.status);
                const date = app.applied_at || "";
                const bgColor = bgColors[i % bgColors.length];

                return (
                  <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      {/* Initials avatar */}
                      <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center font-bold text-gray-700 text-sm shrink-0`}>
                        {initials(company) || initials(title)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-sm">{title}</h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {company}{location && ` • ${location}`}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>
                          {date && (
                            <span className="text-xs text-gray-400">Applied {formatDate(date)}</span>
                          )}
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => handleViewOpportunity(app)}
                            className="border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                            View role
                          </button>
                          <button onClick={() => handleViewApplication(app)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                              app.status === "rejected" || app.status === "closed"
                                ? "border border-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-[#651F5F] text-white hover:bg-[#4a1647]"
                            }`}
                            disabled={app.status === "rejected" || app.status === "closed"}>
                            View application
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
