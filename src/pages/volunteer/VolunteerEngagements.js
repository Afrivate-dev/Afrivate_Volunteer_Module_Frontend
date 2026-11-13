import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import VolunteerLayout from "../../components/layout/VolunteerLayout";
import { engagements as engagementsApi } from "../../services/api";

export default function VolunteerEngagements() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [engagements, setEngagements] = useState([]);

  useEffect(() => {
    document.title = "Engagements - Volunteer - AfriVate";
    loadEngagements();
  }, []);

  const loadEngagements = async () => {
    try {
      setLoading(true);
      const data = await engagementsApi.list();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item) => {
          const volName =
            item.pathfinder_name ||
            item.volunteer_name ||
            item.pathfinder?.user?.email ||
            "Volunteer";
          const initials = volName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "VO";

          const rawStatus = (item.status || "active").toLowerCase();
          let statusText = "Confirmed";
          let statusCls = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
          let dotCls = "bg-emerald-500";
          let filterGroup = "confirmed";

          if (rawStatus.includes("pending") || rawStatus.includes("review")) {
            statusText = "Awaiting review";
            statusCls = "bg-amber-50 text-amber-700 border-amber-200/60";
            dotCls = "bg-amber-500";
            filterGroup = "attention";
          } else if (rawStatus.includes("change") || rawStatus.includes("request")) {
            statusText = "Changes requested";
            statusCls = "bg-rose-50 text-rose-700 border-rose-200/60";
            dotCls = "bg-rose-500";
            filterGroup = "attention";
          } else if (rawStatus === "attested" || rawStatus === "certified" || item.certificate_id) {
            statusText = "Credential issued";
            statusCls = "bg-blue-50 text-blue-700 border-blue-200/60";
            dotCls = "bg-blue-500";
            filterGroup = "issued";
          } else if (rawStatus === "draft") {
            statusText = "Draft";
            statusCls = "bg-gray-100 text-gray-600 border-gray-200/60";
            dotCls = "bg-gray-400";
            filterGroup = "all";
          }

          const rawDate = item.end_date || item.created_at;
          const formattedDate = rawDate
            ? new Date(rawDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—";

          return {
            id: String(item.id),
            initials,
            avatarBg: "bg-teal-100 text-teal-800",
            volunteer: volName,
            role: item.role || item.opportunity_title || "Volunteer",
            engagement: item.title || item.opportunity_title || "Volunteer Engagement",
            hours: item.hours_contributed ? `${item.hours_contributed} hrs` : "—",
            status: statusText,
            statusCls,
            dotCls,
            endDate: formattedDate,
            filterGroup,
          };
        });
        setEngagements(mapped);
      } else {
        setEngagements([]);
      }
    } catch (err) {
      console.warn("Could not load backend engagements", err);
      setEngagements([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = engagements.filter((item) => {
    if (activeFilter === "attention" && item.filterGroup !== "attention") return false;
    if (activeFilter === "confirmed" && item.filterGroup !== "confirmed") return false;
    if (activeFilter === "issued" && item.filterGroup !== "issued") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.volunteer.toLowerCase().includes(q) ||
        item.engagement.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countAttention = engagements.filter((e) => e.filterGroup === "attention").length;

  return (
    <VolunteerLayout activeItem="Engagements">
      {/* ══════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-gray-500 block mb-1">
          Engagements
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Engagements
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Track confirmed and pending volunteer contributions.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          SEARCH AND FILTER BAR
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Search input */}
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search engagements or volunteers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/15 transition shadow-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl text-xs font-semibold self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-gray-900 text-white shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
              {engagements.length}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter("attention")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === "attention"
                ? "bg-gray-900 text-white shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>Needs attention</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
              {countAttention}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter("confirmed")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === "confirmed"
                ? "bg-gray-900 text-white shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setActiveFilter("issued")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === "issued"
                ? "bg-gray-900 text-white shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Credentials issued
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ENGAGEMENTS TABLE CARD
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#843A7F] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#843A7F] flex items-center justify-center mx-auto mb-3">
              <FolderOpen size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              No volunteer engagements found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No engagements matched "${searchQuery}".`
                : "You don't have any volunteer engagements in this filter."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards Stack (Matching Mobile Design) */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/volunteer/credentials`)}
                  className="p-5 hover:bg-gray-50/60 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-gray-500 block mb-1">
                    {item.volunteer}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight leading-snug">
                    {item.engagement}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 mb-3">
                    {item.role}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span>{item.hours}</span>
                    <span>•</span>
                    <span>End date: {item.endDate}</span>
                  </div>

                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${item.statusCls}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dotCls}`} />
                      {item.status}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs font-semibold text-[#0B7B69]">
                    <span>View engagement</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/40">
                    <th className="py-3.5 px-6 font-semibold">VOLUNTEER</th>
                    <th className="py-3.5 px-4 font-semibold">ENGAGEMENT</th>
                    <th className="py-3.5 px-4 font-semibold">HOURS</th>
                    <th className="py-3.5 px-4 font-semibold">STATUS</th>
                    <th className="py-3.5 px-4 font-semibold">END DATE</th>
                    <th className="py-3.5 px-6 font-semibold text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/volunteer/credentials`)}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${item.avatarBg}`}
                          >
                            {item.initials}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">
                              {item.volunteer}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                              {item.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <p className="text-gray-900 font-semibold text-xs sm:text-sm">
                          {item.engagement}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {item.role}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-gray-500 font-medium text-xs">
                        {item.hours}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${item.statusCls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.dotCls}`} />
                          {item.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-gray-500 font-medium text-xs">
                        {item.endDate}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <ChevronRight
                          size={18}
                          className="text-gray-300 group-hover:text-gray-600 transition-colors inline-block"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </VolunteerLayout>
  );
}

