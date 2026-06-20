import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import { useUser } from "../../context/UserContext";
import { opportunities, applications } from "../../services/api";
import { getOrgName, navigateToVolunteerDetails } from "../../utils/opportunityUtils";

const TYPE_FILTERS = ["Internship", "Mentorship", "Volunteer", "Full-time"];

const typeBadge = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("mentor")) return "bg-blue-100 text-blue-700";
  if (t.includes("intern")) return "bg-purple-100 text-purple-700";
  if (t.includes("volunteer")) return "bg-green-100 text-green-700";
  if (t.includes("full")) return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-600";
};

const statusBadge = (status = "") => {
  const s = status.toLowerCase();
  if (s === "pending") return { label: "PENDING", cls: "bg-orange-100 text-orange-600" };
  if (s === "shortlisted") return { label: "SHORTLISTED", cls: "bg-purple-100 text-purple-700" };
  if (s === "rejected") return { label: "REJECTED", cls: "bg-red-100 text-red-600" };
  if (s === "accepted") return { label: "ACCEPTED", cls: "bg-green-100 text-green-700" };
  return { label: status.toUpperCase(), cls: "bg-gray-100 text-gray-500" };
};

const PathfinderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [stats, setStats] = useState({ active: 0, saved: 18, total: 0 });
  const [recommended, setRecommended] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingOpps, setLoadingOpps] = useState(true);
  const [profileChecklist, setProfileChecklist] = useState([
    { label: "Complete your profile", done: false },
    { label: "Upload CV/Resume", done: false },
    { label: "Complete skill assessment", done: false },
    { label: "Apply for first opportunity", done: false },
  ]);

  useEffect(() => {
    document.title = "Pathfinder Dashboard - AfriVate";
    if (user?.name) setDisplayName(user.name.split(" ")[0]);
    else if (user?.first_name) setDisplayName(user.first_name);
    if (user?.has_profile) {
      setProfileChecklist((prev) => prev.map((item, i) => i === 0 ? { ...item, done: true } : item));
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await applications.list();
        const raw = Array.isArray(data) ? data : data?.results || [];
        const active = raw.filter((a) => a.status === "pending").length;
        setStats((s) => ({ ...s, active, total: raw.length }));
        const recent = raw.slice(0, 4).map((a) => ({
          title: a.opportunity_title || "Opportunity",
          company: a.company || "Organisation",
          status: a.status || "pending",
          time: a.updated_at || a.created_at || "",
        }));
        setRecentActivity(recent);
        if (raw.length > 0) setProfileChecklist((prev) => prev.map((item, i) => i === 3 ? { ...item, done: true } : item));
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoadingOpps(true);
      try {
        const data = await opportunities.list({ is_open: true });
        const raw = Array.isArray(data) ? data : data?.results || [];
        setRecommended(raw.slice(0, 3).map((o) => ({
          id: o.id, title: o.title || "Opportunity",
          type: o.opportunity_type || "Volunteer",
          company: getOrgName(o), location: o.location || "",
          description: (o.description || "").replace(/\s+/g, " ").slice(0, 160).trim(),
          _raw: o,
        })));
      } catch {}
      setLoadingOpps(false);
    };
    load();
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) navigate("/pathfinder/opportunities");
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} ago`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <NavBar />

      <div className="pt-16">
        {/* Purple Hero */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-8 py-10">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-1">
              Welcome back{displayName ? `, ${displayName}` : ""}!
            </h1>
            <p className="text-purple-200 text-sm mb-6">
              You're making great strides! There are exciting opportunities ready for your skills.
            </p>
            {/* Search */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Explore roles, skills, or organizations..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
            {/* Filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 bg-white/20 text-white border border-white/30 px-3 py-1.5 rounded-lg text-xs font-semibold">
                Filters ▾
              </button>
              {TYPE_FILTERS.map((f) => (
                <button key={f} onClick={() => setActiveFilter(activeFilter === f ? "" : f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    activeFilter === f ? "bg-white text-[#651F5F] border-white" : "border-white/40 text-white hover:bg-white/10"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: "🚀", label: "Active Applications", val: stats.active },
              { icon: "🔖", label: "Saved Opportunities", val: stats.saved },
              { icon: "✅", label: "Total Applications", val: stats.total },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl mb-3">{s.icon}</div>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">{s.val}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Recommended */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Recommended for you</h2>
                <button onClick={() => navigate("/pathfinder/opportunities")}
                  className="text-[#8D4087] text-sm font-semibold hover:underline flex items-center gap-1">
                  Filters ▾
                </button>
              </div>

              {loadingOpps ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#8D4087] border-t-transparent" />
                </div>
              ) : recommended.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <p className="text-gray-400">No opportunities available right now.</p>
                  <button onClick={() => navigate("/pathfinder/opportunities")}
                    className="mt-3 text-[#8D4087] font-semibold text-sm hover:underline">Browse all →</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommended.map((opp) => (
                    <div key={opp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-xl shrink-0">
                            {opp.type.toLowerCase().includes("mentor") ? "👥" : opp.type.toLowerCase().includes("intern") ? "💼" : "🌱"}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{opp.title}</h3>
                            <p className="text-xs text-gray-500">
                              {opp.company}{opp.location && ` • ${opp.location}`}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${typeBadge(opp.type)}`}>
                          {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
                        </span>
                      </div>
                      {opp.description && (
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">{opp.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => navigateToVolunteerDetails(navigate, opp.id, { job: opp, _raw: opp._raw })}
                          className="bg-[#651F5F] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#4a1647] transition-colors">
                          View &amp; Apply
                        </button>
                        <button className="text-gray-400 hover:text-[#8D4087] transition-colors text-xl">🔖</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => navigate("/pathfinder/opportunities")}
                    className="w-full text-center text-[#8D4087] text-sm font-semibold hover:underline py-2">
                    View all opportunities →
                  </button>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">Your recent activity</h3>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No activity yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((item, i) => {
                      const { label, cls } = statusBadge(item.status);
                      return (
                        <div key={i} className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 leading-tight">{item.title}</p>
                            <p className="text-xs text-gray-400">
                              {item.company}{item.time && ` • ${formatTime(item.time)}`}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cls}`}>{label}</span>
                        </div>
                      );
                    })}
                    <button onClick={() => navigate("/pathfinder/my-applications")}
                      className="text-[#8D4087] text-xs font-semibold hover:underline w-full text-center pt-1">
                      See all history
                    </button>
                  </div>
                )}
              </div>

              {/* Get Started */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">Get started</h3>
                <div className="space-y-3">
                  {profileChecklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        item.done ? "bg-[#8D4087] border-[#8D4087]" : "border-gray-300"
                      }`}>
                        {item.done && <span className="text-white text-xs">✓</span>}
                      </div>
                      <p className={`text-sm ${item.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathfinderDashboard;
