import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { applications, opportunities, bookmarks } from "../../services/api";

const STATUS_TABS = ["All","Pending","Shortlisted","Accepted","Rejected"];

const statusBadge = (status = "") => {
  const s = status.toLowerCase();
  if (s === "accepted") return { label: "Accepted", cls: "bg-green-100 text-green-700" };
  if (s === "shortlisted") return { label: "Shortlisted", cls: "bg-purple-100 text-purple-700" };
  if (s === "rejected") return { label: "Rejected", cls: "bg-gray-100 text-gray-500" };
  return { label: "Pending", cls: "bg-orange-100 text-orange-600" };
};

const parseContactDetails = (coverLetter) => {
  if (!coverLetter) return { name: "Applicant", email: "" };
  const lines = coverLetter.split("\n");
  let name = "Applicant", email = "", inContact = false;
  for (const line of lines) {
    const t = line.trim();
    if (t.toLowerCase().startsWith("contact details:")) { inContact = true; continue; }
    if (inContact && t.toLowerCase().endsWith(":") && !t.includes("@")) break;
    if (inContact) {
      if (t.toLowerCase().startsWith("full name:")) name = t.replace(/^full name:\s*/i, "").trim() || "Applicant";
      else if (t.toLowerCase().startsWith("email:")) email = t.replace(/^email:\s*/i, "").trim() || "";
    }
  }
  return { name, email };
};

const Applicants = () => {
  const navigate = useNavigate();
  const { id: opportunityId } = useParams();
  const [opportunityTitle, setOpportunityTitle] = useState("");
  const [applicationsList, setApplicationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [savedPathfinderIds, setSavedPathfinderIds] = useState(() => new Set());
  const [bookmarkBusy, setBookmarkBusy] = useState({});
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });

  useEffect(() => {
    document.title = "Applicants - AfriVate";
    const loadData = async () => {
      setLoading(true);
      let titleFromOpp = "";
      try {
        try {
          const oppData = await opportunities.get(opportunityId);
          if (oppData?.title) { titleFromOpp = oppData.title; setOpportunityTitle(oppData.title); }
        } catch {}

        let forOpp = [];
        try {
          const raw = await opportunities.applicantsList(opportunityId);
          forOpp = Array.isArray(raw) ? raw : raw?.results || [];
        } catch {
          const appsData = await applications.list();
          const all = Array.isArray(appsData) ? appsData : appsData?.results || [];
          forOpp = all.filter((a) => String(a.opportunity) === String(opportunityId) || String(a.opportunity?.id) === String(opportunityId));
        }

        const mapped = forOpp.map((app) => {
          const { name, email } = parseContactDetails(app.cover_letter);
          return {
            id: app.id, userId: app.applicant_id, bookmarkPathfinderId: app.applicant_id,
            pathfinderName: name, pathfinderEmail: email,
            opportunityTitle: app.opportunity_title || titleFromOpp,
            status: app.status || "pending", applicationText: app.cover_letter || "",
            cvUrl: app.cv || app.cv_url || app.resume || app.document || null,
            avatar: app.applicant_photo || app.pathfinder_photo || null,
          };
        });
        setApplicationsList(mapped);

        if (mapped.length > 0 && !titleFromOpp) setOpportunityTitle(mapped[0].opportunityTitle);

        try {
          const saved = await bookmarks.applicantsSavedList();
          const savedRows = Array.isArray(saved) ? saved : saved?.results || [];
          const ids = new Set(savedRows.map((r) => {
            const pid = r.pathfinder_user_id ?? r.pathfinder_id ?? r.pathfinder ?? r.pathfinder?.id;
            return pid != null ? String(pid) : null;
          }).filter(Boolean));
          setSavedPathfinderIds(ids);
        } catch {}
      } catch (err) {
        console.error("Error loading applications:", err);
        setApplicationsList([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [opportunityId]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [appId]: true }));
    try {
      await applications.updateStatus(appId, { status: newStatus });
      setApplicationsList((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a));
      setToast({ isOpen: true, message: `Application ${newStatus} successfully!`, type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Failed to update status.", type: "error" });
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const handleToggleBookmark = async (app) => {
    const key = app.bookmarkPathfinderId != null ? String(app.bookmarkPathfinderId) : String(app.id);
    if (!key) return;
    setBookmarkBusy((prev) => ({ ...prev, [app.id]: true }));
    try {
      if (savedPathfinderIds.has(key)) {
        await bookmarks.applicantsSavedDelete(app.bookmarkPathfinderId);
        setSavedPathfinderIds((prev) => { const n = new Set(prev); n.delete(key); return n; });
      } else {
        await bookmarks.applicantsSavedCreate({ pathfinder_id: app.bookmarkPathfinderId, opportunity_id: Number(opportunityId) });
        setSavedPathfinderIds((prev) => new Set(prev).add(key));
      }
    } catch (err) {
      const msg = err?.body?.non_field_errors?.[0] || err?.body?.detail || "Could not update bookmark.";
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setBookmarkBusy((prev) => ({ ...prev, [app.id]: false }));
    }
  };

  const countByStatus = (status) => status === "All"
    ? applicationsList.length
    : applicationsList.filter((a) => a.status.toLowerCase() === status.toLowerCase()).length;

  const filtered = activeTab === "All"
    ? applicationsList
    : applicationsList.filter((a) => a.status.toLowerCase() === activeTab.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-20 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />

      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors mb-3">
              ←
            </button>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => navigate(-1)} className="text-white text-sm hover:underline">← </button>
              <h1 className="text-2xl font-bold text-white">Applicants</h1>
            </div>
            {opportunityTitle && <p className="text-purple-200 text-sm">For: {opportunityTitle}</p>}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
            {STATUS_TABS.map((tab) => {
              const count = countByStatus(tab);
              const active = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                    active ? "border-[#8D4087] text-[#8D4087]" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  {tab}
                  {count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? "bg-[#8D4087] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Applicant List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">No {activeTab.toLowerCase()} applicants yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((app) => {
                const expanded = expandedId === app.id;
                const { label, cls } = statusBadge(app.status);
                const bookmarkKey = app.bookmarkPathfinderId != null ? String(app.bookmarkPathfinderId) : String(app.id);
                const isBookmarked = savedPathfinderIds.has(bookmarkKey);

                return (
                  <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header row */}
                    <div className="flex items-center justify-between px-5 py-4 cursor-pointer"
                      onClick={() => setExpandedId(expanded ? null : app.id)}>
                      <div className="flex items-center gap-3">
                        {app.avatar ? (
                          <img src={app.avatar} alt={app.pathfinderName} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-[#8D4087] font-bold">
                            {app.pathfinderName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{app.pathfinderName}</p>
                          <p className="text-sm text-gray-400">{app.pathfinderEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>{label}</span>
                        <span className="text-gray-400">{expanded ? "▲" : "▶"}</span>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expanded && (
                      <div className="px-5 pb-5 border-t border-gray-50">
                        {app.applicationText && (
                          <div className="mt-4 mb-5">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Application Statement</p>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-6">{app.applicationText}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-4">
                          {/* Left actions */}
                          <div className="flex items-center gap-2">
                            {app.cvUrl && (
                              <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 border border-purple-200 bg-purple-50 text-[#8D4087] px-3 py-2 rounded-xl text-xs font-semibold hover:bg-purple-100 transition-colors">
                                📄 View CV
                              </a>
                            )}
                            {app.userId && (
                              <button onClick={() => navigate(`/enabler/pathfinder-profile/${app.userId}`)}
                                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                                👤 View profile
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleBookmark(app)}
                              disabled={bookmarkBusy[app.id]}
                              className={`border px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                isBookmarked ? "border-[#8D4087] bg-[#8D4087] text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                              }`}>
                              {isBookmarked ? "🔖" : "🔖"}
                            </button>
                          </div>

                          {/* Right actions */}
                          <div className="flex flex-col gap-2 min-w-[180px]">
                            {app.status !== "accepted" && (
                              <button
                                onClick={() => handleStatusChange(app.id, "accepted")}
                                disabled={updatingStatus[app.id]}
                                className="bg-[#651F5F] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a1647] transition-colors disabled:opacity-50 text-center">
                                {updatingStatus[app.id] ? "Updating..." : "Accept Candidate"}
                              </button>
                            )}
                            {app.userId && (
                              <button onClick={() => navigate(`/enabler/contact-pathfinder/${app.userId}`)}
                                className="border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-center">
                                Contact
                              </button>
                            )}
                            {app.status !== "rejected" && (
                              <button
                                onClick={() => handleStatusChange(app.id, "rejected")}
                                disabled={updatingStatus[app.id]}
                                className="text-red-500 text-sm font-semibold hover:underline text-center disabled:opacity-50">
                                Reject Application
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })} />
    </div>
  );
};

export default Applicants;
