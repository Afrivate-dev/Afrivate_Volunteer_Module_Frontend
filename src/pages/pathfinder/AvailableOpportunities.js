/* eslint-disable no-unused-vars */


import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Toast from "../../components/common/Toast";
import Pagination from "../../components/common/Pagination";
import { opportunities, bookmarks } from "../../services/api";
// import {application } from "../../services/api";
import { getOrgName, navigateToVolunteerDetails } from "../../utils/opportunityUtils";
import { parseDescription } from "../../utils/descriptionUtils";

const PAGE_SIZE = 10;
const OPP_TYPES = ["All", "Volunteer Work", "Internship", "Mentorship"];
const WORK_MODES = ["All", "Remote", "Hybrid", "On-site"];
const SORT_OPTIONS = ["Latest First", "Oldest First", "A-Z"];

function getPreview(text) {
  const { description, keyResponsibilities } = parseDescription(text);
  const raw = [description, keyResponsibilities].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  return raw.length > 200 ? raw.slice(0, 200).trim() + "…" : raw;
}

function mapOpp(item) {
  if (!item) return null;
  // location/work mode/time commitment are not backend fields — they're
  // embedded in the structured description, so parse them out (otherwise the
  // work-mode filter can never match anything).
  const parsed = parseDescription(item.description || "");
  return {
    id: String(item.id), title: item.title, company: getOrgName(item),
    type: item.opportunity_type || "Volunteering",
    location: item.location || parsed.location || "",
    workMode: item.work_mode || parsed.workModel || "",
    timeCommitment: item.time_commitment || parsed.timeCommitment || "",
    description: getPreview(item.description || ""),
    status: item.is_open ? "Currently Active" : "Closed",
    postedAt: item.posted_at || "",
    _raw: item,
  };
}

// const statusStyle = (s = "") => {
//   if (s === "Currently Active") return "bg-green-100 text-green-700";
//   if (s === "Closing Soon") return "bg-red-100 text-red-600";
//   return "text-gray-500 text-xs";
// };

const formatPosted = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 7) return `Posted ${days} days ago`;
  if (days < 30) return `Posted ${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} ago`;
  return `Posted ${Math.floor(days / 30)} month${days >= 60 ? "s" : ""} ago`;
};

const typeIcon = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("mentor")) return "B";
  if (t.includes("intern")) return "I";
  if (t.includes("volunteer")) return "V";
  return "O";
};

const typeColor = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("mentor")) return "bg-blue-50";
  if (t.includes("intern")) return "bg-purple-50";
  if (t.includes("volunteer")) return "bg-green-50";
  return "bg-orange-50";
};

const AvailableOpportunities = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Search text carried over from the dashboard search bar, if any.
  const [search, setSearch] = useState(location.state?.search || "");
  const [filterType, setFilterType] = useState("All");
  const [filterMode, setFilterMode] = useState("All");
  const [sort, setSort] = useState("Latest First");
  const [page, setPage] = useState(1);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [setSaveBusy] = useState({});
  // const [saveBusy] = useState({});
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await opportunities.list({ is_open: true });
      const raw = Array.isArray(data) ? data : data?.results || [];
      setList(raw.map(mapOpp).filter(Boolean));
    } catch (err) {
      setToast({ isOpen: true, message: err.message || "Failed to load.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSavedIds = useCallback(async () => {
    try {
      const api = await import("../../services/api");
      if (!api.getAccessToken()) return;
      const data = await bookmarks.opportunitiesSavedList();
      const raw = Array.isArray(data) ? data : data?.results || [];
      setSavedIds(new Set(raw.map((r) => {
        const oid = r.opportunity_id ?? (typeof r.opportunity === "number" || typeof r.opportunity === "string" ? r.opportunity : r.opportunity?.id);
        return oid != null ? String(oid) : null;
      }).filter(Boolean)));
    } catch {}
  }, []);

  useEffect(() => {
    document.title = "Available Opportunities - AfriVate";
    loadOpportunities();
    loadSavedIds();
  }, [loadOpportunities, loadSavedIds]);

  const handleToggleSave = async (opp) => {
    setSaveBusy((p) => ({ ...p, [opp.id]: true }));
    try {
      if (savedIds.has(opp.id)) {
        await bookmarks.opportunitiesSavedDelete(Number(opp.id));
        setSavedIds((p) => { const n = new Set(p); n.delete(opp.id); return n; });
      } else {
        await bookmarks.opportunitiesSavedCreate({ opportunity_id: Number(opp.id) });
        setSavedIds((p) => new Set(p).add(opp.id));
        setToast({ isOpen: true, message: "Opportunity saved!", type: "success" });
      }
    } catch (err) {
      setToast({ isOpen: true, message: err?.body?.non_field_errors?.[0] || "Could not update bookmark.", type: "error" });
    } finally {
      setSaveBusy((p) => ({ ...p, [opp.id]: false }));
    }
  };

  // Filter + sort
  let filtered = list.filter((o) => {
    const matchesSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.company.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || o.type.toLowerCase().includes(filterType.toLowerCase().split(" ")[0]);
    const matchesMode = filterMode === "All" || o.workMode.toLowerCase() === filterMode.toLowerCase();
    return matchesSearch && matchesType && matchesMode;
  });
  if (sort === "A-Z") filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === "Oldest First") filtered = [...filtered].reverse();

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <NavBar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-5 hover:bg-white/30 transition-colors">
              ← Back
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">Available Opportunities</h1>
            <p className="text-purple-200">Explore your next career step with tailored internships, mentorship programs, and impactful volunteer positions.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row gap-6 items-start">
          {/* Sidebar Filters — desktop only */}
          <div className="hidden sm:block w-52 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 self-start">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={() => { setFilterType("All"); setFilterMode("All"); }}
                className="text-xs text-[#8D4087] font-semibold hover:underline">Clear all</button>
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TYPE</p>
              <div className="space-y-2">
                {OPP_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setFilterType(t)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${filterType === t ? "border-[#8D4087] bg-[#8D4087]" : "border-gray-300"}`}>
                      {filterType === t && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-700">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ARRANGEMENT</p>
              <div className="space-y-2">
                {WORK_MODES.map((m) => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setFilterMode(m)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${filterMode === m ? "border-[#8D4087] bg-[#8D4087]" : "border-gray-300"}`}>
                      {filterMode === m && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-700">{m}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile filter chips */}
          <div className="sm:hidden flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full">
            {OPP_TYPES.filter((t) => t !== "All").map((t) => (
              <button key={t} onClick={() => setFilterType(filterType === t ? "All" : t)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  filterType === t ? "bg-[#8D4087] text-white border-[#8D4087]" : "bg-white text-gray-600 border-gray-200"
                }`}>
                {t}
              </button>
            ))}
            {WORK_MODES.filter((m) => m !== "All").map((m) => (
              <button key={m} onClick={() => setFilterMode(filterMode === m ? "All" : m)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  filterMode === m ? "bg-[#8D4087] text-white border-[#8D4087]" : "bg-white text-gray-600 border-gray-200"
                }`}>
                {m}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full">
            {/* Search + Sort */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by job title, company name, or keywords..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8D4087]" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Displaying {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} opportunities
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <div className="relative">
                  <select value={sort} onChange={(e) => setSort(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#8D4087] font-semibold focus:outline-none appearance-none pr-7 bg-white">
                    {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8D4087] pointer-events-none text-xs">▾</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
              </div>
            ) : paginated.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <p className="text-gray-400">No opportunities match your filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginated.map((opp) => (
                  <div key={opp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl ${typeColor(opp.type)} flex items-center justify-center font-bold text-[#8D4087] text-base shrink-0`}>
                        {typeIcon(opp.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900 text-sm leading-snug">{opp.title}</h3>
                          {opp.status === "Currently Active" ? (
                            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">Active</span>
                          ) : opp.status === "Closing Soon" ? (
                            <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">Closing Soon</span>
                          ) : null}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 mb-2">{opp.company}{opp.location && ` • ${opp.location}`}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mb-3">
                          {opp.type && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{opp.type}</span>}
                          {opp.workMode && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{opp.workMode}</span>}
                          {opp.timeCommitment && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{opp.timeCommitment}</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          {opp.postedAt && <span className="text-xs text-gray-400">{formatPosted(opp.postedAt)}</span>}
                          <button onClick={() => navigateToVolunteerDetails(navigate, opp.id, { job: opp, _raw: opp._raw })}
                            className="ml-auto bg-[#651F5F] text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#4a1647] transition-colors">
                            See Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "error" })} />
    </div>
  );
};

export default AvailableOpportunities;
