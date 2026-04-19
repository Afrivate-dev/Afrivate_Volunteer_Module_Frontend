import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Pagination from "../../components/common/Pagination";
import { applications, profile } from "../../services/api";

const PAGE_SIZE = 6;

const Recommendations = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allMatches, setAllMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Recommended Pathfinders - AfriVate";
    
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        // Load applications from API
        const appsData = await applications.list();
        
        if (Array.isArray(appsData)) {
          // Deduplicate applicants by user ID
          const seenIds = new Set();
          const userIds = [];
          appsData.forEach((a) => {
            const uid = a.user;
            if (uid != null && !seenIds.has(uid)) {
              seenIds.add(uid);
              userIds.push(uid);
            }
          });

          // Fetch full profiles in parallel; skip any that fail
          const results = await Promise.allSettled(
            userIds.map((uid) => profile.pathfinderGetById(uid))
          );

          const list = results
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
              const locationParts = [base.address, base.state, base.country].filter(Boolean);
              return {
                id: userIds[i],
                name,
                role: data.title || "Pathfinder",
                experience: data.work_experience || data.about || "Volunteering experience",
                skills: skillsArr.length ? skillsArr.join(", ") : "—",
                location: locationParts.join(", "),
                email: base.contact_email || data.gmail || "",
              };
            })
            .filter(Boolean);

          setAllMatches(list);
        }
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
          p.skills.toLowerCase().includes(q)
        );
      })
    : allMatches;

  const totalPages = Math.ceil(filteredAll.length / PAGE_SIZE);
  const pagedAll = filteredAll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
              Recommended Pathfinders
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Discover talented pathfinders recommended to you based on your opportunities
            </p>
          </div>

          <div className="relative mb-8">
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search pathfinders..."
              className="w-full border border-gray-300 rounded-lg px-9 py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] bg-white text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
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
                            Experience: {pathfinder.experience}
                          </p>
                          <p className="text-gray-700 text-xs md:text-sm">
                            Skills: {pathfinder.skills}
                          </p>
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
                      : "No recommended pathfinders yet. Applicants will appear here once pathfinders apply to your opportunities."}
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
