import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronRight,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import OrganizationLayout from "../../components/layout/OrganizationLayout";
import CreateEngagementModal from "../../components/enabler/CreateEngagementModal";
import { engagements as engagementsApi, opportunities as opportunitiesApi } from "../../services/api";

export default function OpportunitiesPosted() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [engagements, setEngagements] = useState([]);

  useEffect(() => {
    document.title = "Volunteer Engagements - AfriVate";
    if (location.search.includes("new=true")) {
      setIsCreateModalOpen(true);
    }
    loadData();
  }, [location.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [engListRes, pendingRes, oppsRes] = await Promise.allSettled([
        engagementsApi.list(),
        engagementsApi.pendingAttestations(),
        opportunitiesApi.mine(),
      ]);

      const rawEngagements = engListRes.status === "fulfilled" && Array.isArray(engListRes.value)
        ? engListRes.value
        : [];
      const pendingList = pendingRes.status === "fulfilled" && Array.isArray(pendingRes.value)
        ? pendingRes.value
        : [];
      const myOpps = oppsRes.status === "fulfilled" && Array.isArray(oppsRes.value)
        ? oppsRes.value
        : [];

      // Combine raw engagements and pending
      const combined = [...rawEngagements];
      pendingList.forEach((p) => {
        if (!combined.some((c) => c.id === p.id)) {
          combined.push(p);
        }
      });

      let mapped = [];
      if (combined.length > 0) {
        mapped = combined.map((item) => {
          const volunteerName =
            item.pathfinder_name ||
            item.volunteer_name ||
            item.pathfinder?.user?.email ||
            item.volunteer_email ||
            "Volunteer";

          const initials = volunteerName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "VO";

          const statusRaw = (item.status || "active").toLowerCase();
          let statusText = "Confirmed";
          let statusCls = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
          let dotCls = "bg-emerald-500";
          let filterGroup = "confirmed";

          if (statusRaw.includes("pending") || statusRaw.includes("attest")) {
            statusText = "Awaiting review";
            statusCls = "bg-amber-50 text-amber-700 border-amber-200/60";
            dotCls = "bg-amber-500";
            filterGroup = "attention";
          } else if (statusRaw === "attested" || statusRaw === "certified" || item.certificate_id) {
            statusText = "Credential issued";
            statusCls = "bg-blue-50 text-blue-700 border-blue-200/60";
            dotCls = "bg-blue-500";
            filterGroup = "issued";
          } else if (statusRaw === "draft") {
            statusText = "Draft";
            statusCls = "bg-gray-100 text-gray-600 border-gray-200/60";
            dotCls = "bg-gray-400";
            filterGroup = "all";
          }

          const rawDate = item.end_date || item.created_at || item.updated_at;
          const formattedEndDate = rawDate
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
            volunteer: volunteerName,
            role: item.role || item.opportunity_title || "Field Support Volunteer",
            engagement: item.title || item.opportunity_title || "Volunteer Engagement",
            hours: item.hours_contributed ? `${item.hours_contributed} hrs` : "—",
            status: statusText,
            statusCls,
            dotCls,
            endDate: formattedEndDate,
            filterGroup,
          };
        });
      } else if (myOpps.length > 0) {
        // Fallback: If no direct engagement contracts exist yet, map user's posted opportunities
        mapped = myOpps.map((opp) => {
          const initials = (opp.title || "OP")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          const rawDate = opp.created_at || opp.deadline;
          const formattedEndDate = rawDate
            ? new Date(rawDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—";

          return {
            id: String(opp.id),
            initials,
            avatarBg: "bg-purple-100 text-[#843A7F]",
            volunteer: "Open Assignment",
            role: opp.opportunity_type || "Volunteer Role",
            engagement: opp.title,
            hours: opp.time_commitment ? `${opp.time_commitment}` : "—",
            status: opp.is_open ? "Confirmed" : "Draft",
            statusCls: opp.is_open
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
              : "bg-gray-100 text-gray-600 border-gray-200/60",
            dotCls: opp.is_open ? "bg-emerald-500" : "bg-gray-400",
            endDate: formattedEndDate,
            filterGroup: opp.is_open ? "confirmed" : "all",
          };
        });
      }

      setEngagements(mapped);
    } catch (err) {
      console.error("Error loading opportunities/engagements", err);
      setEngagements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (newRecord, isDraft) => {
    setEngagements((prev) => [newRecord, ...prev]);
    setSuccessToast(
      isDraft ? "Engagement saved as draft." : "Volunteer engagement created successfully!"
    );
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const filteredEngagements = engagements.filter((item) => {
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
    <OrganizationLayout activeItem="Volunteer Engagements">
      {/* ══════════════════════════════════════════════════════
          CREATE VOLUNTEER ENGAGEMENT MODAL (Image 1)
      ══════════════════════════════════════════════════════ */}
      <CreateEngagementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreated}
      />

      {/* Success banner */}
      {successToast && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <span className="text-xs font-semibold text-gray-500 block mb-1">
            Volunteer Engagements
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Volunteer Engagements
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create, review, and confirm volunteer contributions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="hidden sm:flex bg-[#0B7B69] hover:bg-[#096657] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl items-center justify-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New engagement</span>
        </button>
      </div>

      {/* Full width button on mobile (Screenshot 4) */}
      <div className="sm:hidden mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full bg-[#0B7B69] hover:bg-[#096657] active:scale-[0.98] text-white text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>New engagement</span>
        </button>
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
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === "all"
                ? "bg-gray-900 text-white shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            All <span className="opacity-80">{engagements.length}</span>
          </button>
          <button
            onClick={() => setActiveFilter("attention")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === "attention"
                ? "bg-gray-900 text-white shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Needs attention <span className="opacity-80">{countAttention}</span>
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
        ) : filteredEngagements.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#843A7F] flex items-center justify-center mx-auto mb-3">
              <FolderOpen size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              No volunteer engagements found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No engagements matched "${searchQuery}". Try a different keyword.`
                : "You don't have any volunteer engagements recorded yet. Click '+ New engagement' to create one."}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 bg-[#843A7F] hover:bg-[#6e2e6a] text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
            >
              <Plus size={14} />
              <span>Create engagement</span>
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Cards List View (Matches Screenshot 4) */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredEngagements.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/enabler/opportunity/${item.id}`)}
                  className="p-4 cursor-pointer hover:bg-gray-50/80 active:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${item.avatarBg}`}
                      >
                        {item.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                          {item.volunteer}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {item.role}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${item.statusCls} shrink-0`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dotCls}`} />
                      {item.status}
                    </span>
                  </div>

                  <div className="pl-12 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {item.engagement}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {item.hours !== "—" ? `${item.hours} · ` : ""}{item.endDate}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 shrink-0" />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
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
                  {filteredEngagements.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/enabler/opportunity/${item.id}`)}
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

                      <td className="py-4 px-4 text-gray-800 font-medium text-xs sm:text-sm">
                        {item.engagement}
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
    </OrganizationLayout>
  );
}
