import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Pagination from "../../components/common/Pagination";
import { applications, profile, opportunities, bookmarks } from "../../services/api";

const PAGE_SIZE = 6;

function calculateMatchScore(pathfinder, opportunity) {
  let score = 0;
  const pathfinderSkills = (Array.isArray(pathfinder.skills) ? pathfinder.skills.map(s => typeof s === "string" ? s.toLowerCase() : (s?.name || s?.skill || "").toLowerCase()).filter(Boolean) : []);
  const pathfinderEducations = (Array.isArray(pathfinder.educations) ? pathfinder.educations.map(e => typeof e === "string" ? e.toLowerCase() : (e?.institution || e?.degree || "").toLowerCase()).filter(Boolean) : []);
  const opportunityText = `${opportunity.title || ""} ${opportunity.description || ""}`.toLowerCase();
  pathfinderSkills.forEach(skill => { if (opportunityText.includes(skill)) score += 5; });
  const pathfinderExperience = (pathfinder.work_experience || "").toLowerCase();
  const experienceKeywords = ["volunteer", "experience", "project", "work", "lead", "develop", "manage"];
  experienceKeywords.forEach(keyword => { if (pathfinderExperience.includes(keyword) && opportunityText.includes(keyword)) score += 2; });
  pathfinderEducations.forEach(education => { if (opportunityText.includes(education)) score += 3; });
  score += 1;
  return Math.max(score, 1);
}

const avatarBg = (name = "") => {
  const colors = ["bg-purple-100 text-purple-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-orange-100 text-orange-700"];
  return colors[name.charCodeAt(0) % colors.length] || "bg-purple-100 text-purple-700";
};

const Recommendations = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allMatches, setAllMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Recommended Pathfinders - AfriVate"; }, []);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const opportunitiesData = await opportunities.mine();
        const enablerOpportunities = Array.isArray(opportunitiesData) ? opportunitiesData : (opportunitiesData?.results || []);
        const appsData = await applications.list();
        const applicationsArray = Array.isArray(appsData) ? appsData : (appsData?.results || []);
        let bookmarkedPathfinders = [];
        try {
          const bookmarked = await bookmarks.applicantsSavedList();
          bookmarkedPathfinders = Array.isArray(bookmarked) ? bookmarked : (bookmarked?.results || []);
        } catch (e) { console.error("Error loading bookmarks:", e); }

        const seenIds = new Set();
        const userIds = [];
        applicationsArray.forEach((a) => { const uid = a.applicant_id; if (uid != null && !seenIds.has(uid)) { seenIds.add(uid); userIds.push(uid); } });
        bookmarkedPathfinders.forEach((b) => { const uid = b.pathfinder || b.pathfinder_id || b.pathfinder_user_id; if (uid != null && !seenIds.has(uid)) { seenIds.add(uid); userIds.push(uid); } });

        const results = await Promise.allSettled(userIds.map((uid) => profile.pathfinderGetById(uid)));
        const listWithScores = results.map((r, i) => {
          if (r.status !== "fulfilled" || !r.value) return null;
          const data = r.value;
          const base = data.base_details || {};
          const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.name || base.contact_email || "Pathfinder";
          const skillsArr = Array.isArray(data.skills) ? data.skills.map((s) => (typeof s === "string" ? s : s?.name || s?.skill || "")).filter(Boolean) : [];
          const educationsArr = Array.isArray(data.educations) ? data.educations.map((e) => (typeof e === "string" ? e : e?.institution || e?.degree || "")).filter(Boolean) : [];
          const locationParts = [base.address, base.state, base.country].filter(Boolean);
          let totalScore = 0;
          enablerOpportunities.forEach(opp => { totalScore += calculateMatchScore({ ...data, skills: skillsArr, educations: educationsArr, work_experience: data.work_experience || data.about || "" }, opp); });
          return { id: userIds[i], name, role: data.title || "Pathfinder", experience: data.work_experience || data.about || "Volunteering experience", skills: skillsArr.length ? skillsArr : [], educations: educationsArr.length ? educationsArr : [], location: locationParts.join(", "), email: base.contact_email || data.gmail || "", matchScore: totalScore };
        }).filter(Boolean);
        listWithScores.sort((a, b) => b.matchScore - a.matchScore);
        setAllMatches(listWithScores);
      } catch (err) { console.error("Error loading recommendations:", err); } finally { setLoading(false); }
    };
    loadRecommendations();
  }, []);

  useEffect(() => { setPage(1); }, [search]);

  const filteredAll = search.trim() ? allMatches.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q) || p.skills.join(" ").toLowerCase().includes(q);
  }) : allMatches;

  const totalPages = Math.ceil(filteredAll.length / PAGE_SIZE);
  const pagedAll = filteredAll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-1">Recommended Pathfinders</h1>
            <p className="text-purple-200 text-sm">Discover talented pathfinders recommended to you based on your opportunities and their skills</p>
            <div className="relative mt-5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input type="text" placeholder="Search pathfinders by name, skills, or role..."
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40 bg-white"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
            </div>
          ) : pagedAll.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p className="font-bold text-gray-800 mb-1">No pathfinders found</p>
              <p className="text-sm text-gray-400">
                {search.trim() ? "Try a different search term." : "Post more opportunities to get better recommendations!"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pagedAll.map((pf) => (
                <div key={pf.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${avatarBg(pf.name)}`}>
                    {pf.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-900">{pf.name}</h3>
                      <span className="text-xs bg-purple-100 text-[#8D4087] px-2.5 py-0.5 rounded-full font-semibold">
                        Score: {pf.matchScore}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{pf.role}{pf.location && ` • ${pf.location}`}</p>
                    {pf.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {pf.skills.slice(0, 5).map((s, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{s}</span>
                        ))}
                        {pf.skills.length > 5 && <span className="text-xs text-gray-400">+{pf.skills.length - 5}</span>}
                      </div>
                    )}
                    {pf.experience && (
                      <p className="text-xs text-gray-400 line-clamp-1">{pf.experience.slice(0, 120)}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => navigate(`/enabler/pathfinder/${pf.id}`)}
                      className="bg-[#651F5F] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#4a1647] transition-colors">
                      View Profile
                    </button>
                    {pf.email && (
                      <a href={`mailto:${pf.email}`}
                        className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors text-center">
                        Contact
                      </a>
                    )}
                  </div>
                </div>
              ))}
              <Pagination page={page} totalPages={totalPages} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
