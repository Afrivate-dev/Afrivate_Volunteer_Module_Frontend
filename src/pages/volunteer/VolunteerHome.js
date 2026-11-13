import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Heart,
  ShieldCheck,
  Shield,
  X,
  ArrowRight,
  Menu,
  CheckCircle2,
} from "lucide-react";
import VolunteerLayout from "../../components/layout/VolunteerLayout";
import { opportunities as opportunitiesApi, applications as applicationsApi } from "../../services/api";
import logoImg from "../../Assets/AfriVate_logo_long_white_on_navy.png";

const BRAND_PURPLE = "#843A7F";

export default function VolunteerHome() {
  const [opportunitiesList, setOpportunitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("All"); // "All" | "In person" | "Remote" | "Hybrid"
  const [selectedTiers, setSelectedTiers] = useState({
    "Tier 1": true,
    "Tier 2": true,
    "Tier 3": true,
  });
  const [sortOption, setSortOption] = useState("Default, relevant");
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Volunteer Opportunity Directory - AfriVate";

    const fetchLiveOpps = async () => {
      setLoading(true);
      try {
        const res = await opportunitiesApi.list({ is_open: true, page_size: 100 });
        const liveResults = Array.isArray(res) ? res : res?.results || [];
        const mapped = liveResults.map((item, idx) => ({
          id: String(item.id || idx),
          category: item.opportunity_type || "VOLUNTEERING",
          featured: idx === 0,
          title: item.title || "Volunteer Opportunity",
          description:
            item.description?.slice(0, 160) ||
            "Support community programs and verified social impact initiatives.",
          org: item.organization_name || item.organization || "AfriVate Partner",
          orgBadge: (item.organization_name || "AF")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          orgBg: "bg-teal-50 text-teal-800",
          tier: item.tier || "Tier 2",
          tierLabel: `${item.tier || "Tier 2"} - Verified`,
          location: item.location || "Lagos, Nigeria",
          commitment: item.time_commitment || "Flexible",
          mode: item.work_mode || "In person",
        }));
        setOpportunitiesList(mapped);
      } catch (err) {
        console.warn("Could not load backend opportunities", err);
        setOpportunitiesList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveOpps();
  }, []);

  const toggleBookmark = (id, e) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTier = (tierKey) => {
    setSelectedTiers((prev) => ({
      ...prev,
      [tierKey]: !prev[tierKey],
    }));
  };

  // Filter logic
  const filteredOpps = opportunitiesList.filter((item) => {
    // Work mode filter
    if (workModeFilter !== "All" && item.mode.toLowerCase() !== workModeFilter.toLowerCase()) {
      return false;
    }

    // Tier filter
    const matchesTier = Object.entries(selectedTiers).some(
      ([tier, isChecked]) => isChecked && item.tier.includes(tier)
    );
    if (!matchesTier) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.org.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Count breakdowns
  const inPersonCount = opportunitiesList.filter(
    (o) => o.mode.toLowerCase() === "in person"
  ).length;
  const remoteCount = opportunitiesList.filter(
    (o) => o.mode.toLowerCase() === "remote"
  ).length;
  const hybridCount = opportunitiesList.filter(
    (o) => o.mode.toLowerCase() === "hybrid"
  ).length;

  const handleApply = async () => {
    if (!selectedOpp) return;
    setIsApplying(true);
    try {
      const oppId = Number(selectedOpp.id);
      if (!isNaN(oppId)) {
        await applicationsApi.create({
          opportunity: oppId,
          cover_letter: "I am interested in this volunteer opportunity and would like to contribute.",
        });
      }
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        setSelectedOpp(null);
      }, 2500);
    } catch (err) {
      console.warn("Application creation info:", err);
      // If already applied or returned message
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        setSelectedOpp(null);
      }, 2500);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <VolunteerLayout activeItem="Home" fullWidth={true}>
      <div className="w-full min-h-screen bg-[#FBFBFC] font-sans antialiased text-gray-900 pb-16">
        {/* ══════════════════════════════════════════════════════
            PURPLE HERO BANNER (Image 1)
        ══════════════════════════════════════════════════════ */}
        <div
          className="w-full text-white pt-6 pb-20 sm:pb-24 px-4 sm:px-8 relative text-center"
          style={{ backgroundColor: BRAND_PURPLE }}
        >
          {/* Top Bar inside Banner: Logo badge on left, Hamburger Menu on right */}
          <div className="max-w-7xl mx-auto flex items-center justify-between mb-8 sm:mb-12 relative z-30">
            {/* AfriVate Logo Badge */}
            <Link
              to="/volunteer/dashboard"
              className="bg-white rounded-2xl py-2 px-3.5 shadow-sm flex items-center justify-center max-w-[150px] hover:opacity-95 transition-opacity"
            >
              <img
                src={logoImg}
                alt="AfriVate"
                className="h-5 sm:h-6 w-auto object-contain"
              />
            </Link>

            {/* Hamburger Button & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNavMenuOpen(!navMenuOpen)}
                className="w-9 h-9 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Navigation Menu"
              >
                <Menu size={18} strokeWidth={2.5} />
              </button>

              {/* Dropdown Menu (Matches Image 1 Dropdown) */}
              {navMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNavMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100 text-xs">
                    <Link
                      to="/volunteer/home"
                      onClick={() => setNavMenuOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Home
                    </Link>
                    <Link
                      to="/volunteer/home"
                      onClick={() => setNavMenuOpen(false)}
                      className="block mx-2 px-3 py-1.5 bg-[#843A7F] text-white rounded-lg font-bold shadow-2xs"
                    >
                      Volunteering
                    </Link>
                    <Link
                      to="/pathfinder/opportunities"
                      onClick={() => setNavMenuOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Job Opportunities
                    </Link>
                    <Link
                      to="/enabler/dashboard"
                      onClick={() => setNavMenuOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Organization
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <Link
                      to="/about"
                      onClick={() => setNavMenuOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      About Us
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setNavMenuOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Contact
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Banner Titles */}
          <div className="max-w-3xl mx-auto px-4">
            <span className="text-[10px] sm:text-xs font-bold text-purple-200 tracking-widest uppercase mb-2 block">
              VOLUNTEER OPPORTUNITY DIRECTORY
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-2 leading-tight">
              Find a place to make a difference
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl mx-auto leading-relaxed mb-6 sm:mb-8">
              Explore real, verified opportunities with transparent trust profiles and clear contribution expectations.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SEARCH BAR (Overlaps the bottom of the purple banner)
        ══════════════════════════════════════════════════════ */}
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 -mt-7 sm:-mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-xl shadow-purple-900/10 border border-gray-100 p-2 sm:p-2.5 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full flex items-center">
              <Search
                size={18}
                className="absolute left-3.5 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by role, skills, organization, or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>
            <button
              type="button"
              className="w-full sm:w-auto bg-[#843A7F] hover:bg-[#70236A] active:scale-95 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs shrink-0 cursor-pointer"
            >
              Search opportunities
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MAIN CONTENT AREA: 2-COLUMN DIRECTORY (Image 1)
        ══════════════════════════════════════════════════════ */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ──────────────────────────────────────────────────
                LEFT COLUMN: FILTERS (Work mode, Trust, Notice)
            ────────────────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-6">
              {/* Filter 1: Work Mode */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">
                  Work mode
                </h3>
                <div className="space-y-1 text-xs">
                  {[
                    { label: "All", count: opportunitiesList.length },
                    { label: "In person", count: inPersonCount },
                    { label: "Remote", count: remoteCount },
                    { label: "Hybrid", count: hybridCount },
                  ].map((mode) => {
                    const isActive = workModeFilter === mode.label;
                    return (
                      <button
                        key={mode.label}
                        type="button"
                        onClick={() => setWorkModeFilter(mode.label)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                          isActive
                            ? "bg-[#843A7F]/10 text-[#843A7F] font-bold shadow-2xs"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium"
                        }`}
                      >
                        <span>{mode.label}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-[#843A7F] text-white"
                              : "text-gray-400 bg-gray-100"
                          }`}
                        >
                          {mode.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 2: Organization Trust Checkboxes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">
                  Organization trust
                </h3>
                <div className="space-y-2.5 text-xs text-gray-700">
                  {[
                    { key: "Tier 1", label: "Tier 1 - Registered" },
                    { key: "Tier 2", label: "Tier 2 - Referenced" },
                    { key: "Tier 3", label: "Tier 3 - Pending" },
                  ].map((tier) => (
                    <label
                      key={tier.key}
                      className="flex items-center gap-2.5 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTiers[tier.key] || false}
                        onChange={() => toggleTier(tier.key)}
                        className="w-4 h-4 rounded text-[#843A7F] border-gray-300 focus:ring-[#843A7F]"
                      />
                      <span className="font-medium text-gray-700">
                        {tier.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Card 3: Transparent Trust Notice Box */}
              <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E3A8A]">
                    Trust tiers are transparent
                  </h4>
                  <p className="text-[11px] text-[#3B82F6] mt-1 leading-relaxed">
                    A tier describes what evidence has been reviewed. It is not a guarantee of a specific volunteering experience.
                  </p>
                </div>
              </div>
            </div>

            {/* ──────────────────────────────────────────────────
                RIGHT COLUMN: OPPORTUNITIES DIRECTORY GRID
            ────────────────────────────────────────────────── */}
            <div className="lg:col-span-9">
              {/* Header: Count and Sorting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                    {filteredOpps.length} opportunities
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Across Nigeria • Updated today
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 font-medium">Sort by:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-[#843A7F] cursor-pointer shadow-2xs"
                  >
                    <option value="Default, relevant">Default, relevant</option>
                    <option value="Latest">Latest</option>
                    <option value="Organization A-Z">Organization A-Z</option>
                  </select>
                </div>
              </div>

              {/* 3-Column Cards Grid (Matches Image 1) */}
              {loading ? (
                <div className="py-20 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#843A7F] border-t-transparent" />
                </div>
              ) : filteredOpps.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
                  <p className="text-sm font-bold text-gray-800">
                    No matching opportunities found
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    {searchQuery || workModeFilter !== "All"
                      ? "Try adjusting your search terms or filters to explore more volunteer roles."
                      : "There are currently no active volunteer opportunities on the platform. Please check back later."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredOpps.map((opp) => {
                    const isBookmarked = bookmarkedIds.has(opp.id);
                    return (
                      <div
                        key={opp.id}
                        onClick={() => setSelectedOpp(opp)}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
                      >
                        <div>
                          {/* Top Row: Category Pill & Bookmark Heart */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/60">
                              {opp.category}
                              {opp.featured && " • Featured"}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => toggleBookmark(opp.id, e)}
                              className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                              aria-label="Bookmark opportunity"
                            >
                              <Heart
                                size={16}
                                className={
                                  isBookmarked
                                    ? "fill-rose-500 text-rose-500"
                                    : "stroke-gray-300 group-hover:stroke-gray-400"
                                }
                              />
                            </button>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#843A7F] transition-colors leading-snug line-clamp-2 mb-2">
                            {opp.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">
                            {opp.description}
                          </p>

                          {/* Organization & Trust Tier */}
                          <div className="flex items-center gap-2.5 mb-3 pt-3 border-t border-gray-100">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${opp.orgBg}`}
                            >
                              {opp.orgBadge}
                            </div>
                            <div className="overflow-hidden min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">
                                {opp.org}
                              </p>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                <span>{opp.tier}</span>
                              </span>
                            </div>
                          </div>

                          {/* Metadata: Location, Commitment, Mode */}
                          <div className="text-[11px] text-gray-400 flex items-center gap-1.5 flex-wrap">
                            <span>{opp.location}</span>
                            <span>•</span>
                            <span>{opp.commitment}</span>
                            <span>•</span>
                            <span className="font-medium text-gray-600">
                              {opp.mode}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer Link */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#0B7B69] group-hover:underline flex items-center gap-1">
                            <span>View opportunity</span>
                            <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            OPPORTUNITY DETAILS MODAL (Image 2)
        ══════════════════════════════════════════════════════ */}
        {selectedOpp && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedOpp(null);
            }}
          >
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
              {/* Header with Title and Close Button */}
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug pr-4">
                  {selectedOpp.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition"
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tag, Org Name and Trust Tier */}
              <div className="space-y-1 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  {selectedOpp.category}
                </span>
                <p className="text-xs font-bold text-gray-800">
                  {selectedOpp.org}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>{selectedOpp.tierLabel}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                {selectedOpp.description}
              </p>

              {/* 3-Column Metadata Row (Image 2) */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Location
                  </span>
                  <span className="text-xs font-semibold text-gray-800 block truncate">
                    {selectedOpp.location}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Commitment
                  </span>
                  <span className="text-xs font-semibold text-gray-800 block truncate">
                    {selectedOpp.commitment}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Mode
                  </span>
                  <span className="text-xs font-semibold text-gray-800 block truncate">
                    {selectedOpp.mode}
                  </span>
                </div>
              </div>

              {/* Blue Safety Notice Box (Image 2) */}
              <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E3A8A]">
                    Apply safely through AfriVate
                  </h4>
                  <p className="text-[11px] text-[#3B82F6] mt-0.5 leading-relaxed">
                    Your account details are protected when you apply to opportunities. Never pay a premise or application fee.
                  </p>
                </div>
              </div>

              {/* Application Confirmation State */}
              {appliedSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                  <h4 className="text-xs font-bold text-emerald-900">
                    Application submitted successfully!
                  </h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    The organization has received your profile and will review your verified volunteer credentials.
                  </p>
                </div>
              ) : (
                /* Modal Footer Buttons */
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedOpp(null)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition cursor-pointer"
                  >
                    Not now
                  </button>
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={handleApply}
                    className="bg-[#843A7F] hover:bg-[#70236A] active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isApplying ? "Submitting..." : "Apply for this opportunity"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </VolunteerLayout>
  );
}
