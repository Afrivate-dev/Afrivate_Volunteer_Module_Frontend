import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Volunteer from '../../Assets/img/pathf/8ea3ad24e25785accacd2be3a0b0dba93082dcd2.jpg';
import { useUser } from "../../context/UserContext";

const PathfinderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [activeApplicationsCount, setActiveApplicationsCount] = useState(0);

  useEffect(() => {
    document.title = "Pathfinder Dashboard - AfriVate";
    if (user && user.name) {
      const first = user.name.split(" ")[0];
      setDisplayName(first);
      setActiveApplicationsCount(0);
    } else {
      try {
        const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
        if (profile.displayName) {
          const first = profile.displayName.split(" ")[0];
          setDisplayName(first);
        } else {
          setDisplayName("");
        }
        setActiveApplicationsCount(0);
      } catch (_) {
        setDisplayName("");
        setActiveApplicationsCount(0);
      }
    }
  }, [user]);

  const [recommendedOpportunities, setRecommendedOpportunities] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("enablerOpportunities") || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        const mapped = saved.map((o) => ({
          id: o.id,
          title: o.title || "Opportunity",
          type: o.jobType || o.type || "Volunteer",
          location: o.location || "Remote",
          company: o.company || "",
          button: "Apply",
        }));
        setRecommendedOpportunities(mapped);
      }
    } catch (_) {}
  }, []);

  const filteredOpportunities = recommendedOpportunities.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.type && item.type.toLowerCase().includes(q)) ||
      (item.company && item.company.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-white font-sans relative w-full">
      <NavBar />
      
      {/* Main Content Container */}
      <div className="w-full max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8">
        
        {/* Welcome Section */}
        <div className="text-center mt-8 sm:mt-10 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#6A00B1] mb-1">
            Welcome{displayName ? `, ${displayName}` : ""}!
          </h1>
          <p className="text-base text-[#7E7E7E] font-medium mb-4">
            Let's Find your next opportunity
          </p>

          {/* Search Bar */}
          <div className="relative w-full max-w-xl mx-auto">
            <div className="absolute inset-0 bg-[rgba(217,217,217,0.4)] border border-[#E9E9E9] rounded-2xl"></div>
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search opportunities..."
              className="w-full pl-9 pr-3 py-2.5 bg-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Active Volunteering Applications Card */}
        <div className="bg-white border border-[#E9E9E9] rounded-2xl p-4 sm:p-5 mb-6 w-full mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#6A00B1] mb-2">
                Active Volunteering Applications
              </h2>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-black text-[#6A00B1]">{activeApplicationsCount}</p>
                <p className="text-sm text-[#BDBDBD] font-medium">Active Applications</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/opportunity")}
              className="bg-[#6A00B1] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#5A0091] transition-colors whitespace-nowrap"
            >
              View
            </button>
          </div>
        </div>

        {/* Discover your Path Section */}
        <div className="mb-6">
          <h2 className="text-lg font-black text-[#6A00B1] text-center mb-3">
            Discover your Path
          </h2>
          
          {/* Volunteering Image Card */}
          <button
            onClick={() => navigate("/opportunity")}
            className="relative rounded-2xl overflow-hidden w-full mx-auto h-48 sm:h-56 border border-[#E9E9E9] block text-left"
          >
            <img src={Volunteer} alt="Volunteering" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-lg sm:text-xl font-extrabold text-white mb-0.5">Volunteering</h3>
              <p className="text-sm text-white/95">Explore volunteering Opportunities</p>
            </div>
          </button>
        </div>

        {/* Recommended just for you Section */}
        <div>
          <h2 className="text-lg font-black text-[#6A00B1] text-center mb-3">
            Recommended just for you
          </h2>

          {/* Opportunity Cards */}
          <div className="flex flex-col gap-3 w-full mx-auto">
            {filteredOpportunities.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E7E7E7] rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all"
              >
                {/* Left - Circular Placeholder */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#D9D9D9] rounded-full flex-shrink-0"></div>

                {/* Center - Job Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-black mb-0.5">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 items-center text-xs sm:text-sm">
                    <span className="text-[#FF0000] font-bold">
                      {item.type}
                    </span>
                    <span className="text-[#A7A1A1] font-medium">
                      {item.location}
                    </span>
                  </div>
                </div>

                {/* Right - Apply Button */}
                <button
                  onClick={() => navigate("/volunteer-details", { state: { job: item } })}
                  className="bg-[#6A00B1] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5A0091] transition-colors flex-shrink-0 whitespace-nowrap"
                >
                  {item.button}
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredOpportunities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No opportunities found...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathfinderDashboard;
