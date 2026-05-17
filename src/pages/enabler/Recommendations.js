import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Pagination from "../../components/common/Pagination";
import { applications, profile, opportunities, bookmarks } from "../../services/api";

const PAGE_SIZE = 6;

/**
 * Calculate match score between pathfinder and opportunity based on skills/education
 * 
 * Scoring Weights:
 * - Skill match: +5 points each (high weight for direct skill alignment)
 * - Education match: +3 points each (relevant degree/institution)
 * - Experience keyword match: +2 points (work experience relevance)
 * - Base score: +1 point (having a profile)
 */
function calculateMatchScore(pathfinder, opportunity) {
  let score = 0;
  
  // Extract and normalize skills from pathfinder
  const pathfinderSkills = (Array.isArray(pathfinder.skills)
    ? pathfinder.skills.map(s => typeof s === "string" ? s.toLowerCase() : (s?.name || s?.skill || "").toLowerCase()).filter(Boolean)
    : []);
  
  // Extract and normalize education from pathfinder
  const pathfinderEducations = (Array.isArray(pathfinder.educations)
    ? pathfinder.educations.map(e => typeof e === "string" ? e.toLowerCase() : (e?.institution || e?.degree || "").toLowerCase()).filter(Boolean)
    : []);
  
  // Extract keywords from opportunity
  const opportunityText = `${opportunity.title || ""} ${opportunity.description || ""}`.toLowerCase();
  
  // Score based on skill matches
  pathfinderSkills.forEach(skill => {
    if (opportunityText.includes(skill)) {
      score += 5; // High weight for direct skill alignment
    }
  });
  
  // Score based on work experience relevance
  const pathfinderExperience = (pathfinder.work_experience || "").toLowerCase();
  const experienceKeywords = ["volunteer", "experience", "project", "work", "lead", "develop", "manage"];
  experienceKeywords.forEach(keyword => {
    if (pathfinderExperience.includes(keyword) && opportunityText.includes(keyword)) {
      score += 2;
    }
  });
  
  // Score based on education match
  pathfinderEducations.forEach(education => {
    if (opportunityText.includes(education)) {
      score += 3;
    }
  });
  
  // Base score for having a complete profile
  score += 1;
  
  return Math.max(score, 1); // Ensure minimum score of 1
}

const Recommendations = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allMatches, setAllMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Recommended Pathfinders - AfriVate";
  }, []);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        // Load enabler's posted opportunities
        const opportunitiesData = await opportunities.mine();
        const enablerOpportunities = Array.isArray(opportunitiesData) 
          ? opportunitiesData 
          : (opportunitiesData?.results || []);

        // Load all applications
        const appsData = await applications.list();
        const applicationsArray = Array.isArray(appsData) ? appsData : (appsData?.results || []);

        // Load bookmarked pathfinders
        let bookmarkedPathfinders = [];
        try {
          const bookmarked = await bookmarks.applicantsSavedList();
          bookmarkedPathfinders = Array.isArray(bookmarked) ? bookmarked : (bookmarked?.results || []);
        } catch (e) {
          console.error("Error loading bookmarks:", e);
        }

        // Collect unique pathfinder user IDs from both applications and bookmarks
        const seenIds = new Set();
        const userIds = [];

        // Add applicants
        applicationsArray.forEach((a) => {
          const uid = a.user;
          if (uid != null && !seenIds.has(uid)) {
            seenIds.add(uid);
            userIds.push(uid);
          }
        });

        // Add bookmarked pathfinders
        bookmarkedPathfinders.forEach((b) => {
          const uid = b.pathfinder || b.pathfinder_id || b.pathfinder_user_id;
          if (uid != null && !seenIds.has(uid)) {
            seenIds.add(uid);
            userIds.push(uid);
          }
        });

        // Fetch full profiles in parallel
        const results = await Promise.allSettled(
          userIds.map((uid) => profile.pathfinderGetById(uid))
        );

        const listWithScores = results
          .map((r, i) => {
            if (r.status !== "fulfilled" || !r.value) return null;
            const data = r.value;
            const base = data.base_details || {};
            const name =
              [data.first_name, data.last_name].filter(Boolean).join(" ") ||
              data.name ||
              base.contact_email ||
              "Pathfinder";
            const skillsArr = Array.isArray(data.skills)
              ? data.skills.map((s) => (typeof s === "string" ? s : s?.name || s?.skill || "")).filter(Boolean)
              : [];
            const educationsArr = Array.isArray(data.educations)
              ? data.educations.map((e) => (typeof e === "string" ? e : e?.institution || e?.degree || "")).filter(Boolean)
              : [];
            const locationParts = [base.address, base.state, base.country].filter(Boolean);

            // Calculate match score against enabler's opportunities
            let totalScore = 0;
            enablerOpportunities.forEach(opp => {
              const score = calculateMatchScore({
                ...data,
                skills: skillsArr,
                educations: educationsArr,
                work_experience: data.work_experience || data.about || ""
              }, opp);
              totalScore += score;
            });

            return {
              id: userIds[i],
              name,
              role: data.title || "Pathfinder",
              experience: data.work_experience || data.about || "Volunteering experience",
              skills: skillsArr.length ? skillsArr.join(", ") : "—",
              educations: educationsArr.length ? educationsArr.join(", ") : "—",
              location: locationParts.join(", "),
              email: base.contact_email || data.gmail || "",
              matchScore: totalScore,
            };
          })
          .filter(Boolean);

        // Sort by match score (highest first)
        listWithScores.sort((a, b) => b.matchScore - a.matchScore);

        setAllMatches(listWithScores);
      } catch (err) {
        console.error("Error loading recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecommendations();
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredAll = search.trim()
    ? allMatches.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.experience.toLowerCase().includes(q) ||
          p.skills.toLowerCase().includes(q) ||
          p.educations.toLowerCase().includes(q)
        );
      })
    : allMatches;

  const totalPages = Math.ceil(filteredAll.length / PAGE_SIZE);
  const pagedAll = filteredAll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      
      <div className="pt-14 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
              Recommended Pathfinders
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Discover talented pathfinders recommended to you based on your opportunities and their skills
            </p>
          </div>

          <div className="relative mb-8">
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10"></i>
            <input
              type="text"
              placeholder="Search pathfinders..."
              className="w-full border border-gray-300 rounded-lg px-9 py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] bg-white text-gray-700 relative z-20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6A00B1] border-t-transparent mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading recommendations...</p>
            </div>
          ) : (
            <>
              {pagedAll.length > 0 ? (
                <div>
                  <div className="space-y-3">
                    {pagedAll.map((pathfinder) => (
                      <div
                        key={pathfinder.id}
                        className="bg-gray-100 rounded-lg p-3 md:p-4 flex flex-col md:flex-row items-start gap-3 md:gap-4"
                      >
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                          <i className="fa fa-user text-gray-500 text-xl"></i>
                        </div>

                        <div className="flex-1 min-w-0 w-full md:w-auto">
                          <h3 className="font-bold text-black text-base md:text-lg mb-1 md:mb-2">
                            {pathfinder.name}
                          </h3>
                          <p className="text-gray-700 text-xs md:text-sm mb-1">
                            <strong>Role:</strong> {pathfinder.role}
                          </p>
                          <p className="text-gray-700 text-xs md:text-sm mb-1">
                            <strong>Experience:</strong> {pathfinder.experience}
                          </p>
                          <p className="text-gray-700 text-xs md:text-sm mb-1">
                            <strong>Skills:</strong> {pathfinder.skills}
                          </p>
                          <p className="text-gray-700 text-xs md:text-sm mb-1">
                            <strong>Education:</strong> {pathfinder.educations}
                          </p>
                          <p className="text-gray-700 text-xs md:text-sm mb-2">
                            <strong>Location:</strong> {pathfinder.location || "—"}
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 inline-block">
                            <p className="text-[#6A00B1] text-xs md:text-sm font-bold">
                              Match Score: {pathfinder.matchScore}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:flex-shrink-0">
                          <button
                            onClick={() => navigate(`/enabler/pathfinder/${pathfinder.id}`)}
                            className="bg-[#E0C6FF] text-[#6A00B1] px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#D0B6FF] transition-colors whitespace-nowrap"
                          >
                            View Profile
                          </button>
                          {pathfinder.email && (
                            <a
                              href={`mailto:${pathfinder.email}`}
                              className="bg-[#6A00B1] text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#5A0091] transition-colors whitespace-nowrap text-center"
                            >
                              Contact
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPrev={() => setPage((p) => p - 1)}
                    onNext={() => setPage((p) => p + 1)}
                  />
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="fa fa-users text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500 text-lg">
                    {search.trim()
                      ? "No pathfinders found matching your search."
                      : "No recommended pathfinders yet. Post more opportunities to get better recommendations based on skills and education alignment!"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
