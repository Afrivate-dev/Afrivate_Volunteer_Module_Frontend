import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import { bookmarks } from "../../services/api";

const avatarBg = (name = "") => {
  const colors = ["bg-purple-100 text-purple-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-orange-100 text-orange-700"];
  return colors[name.charCodeAt(0) % colors.length] || "bg-purple-100 text-purple-700";
};

const EnablerPathfinderBookmarks = () => {
  const navigate = useNavigate();
  const [pathfinders, setPathfinders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Bookmarked Pathfinders - AfriVate";
    const loadBookmarks = async () => {
      setLoading(true);
      try {
        const data = await bookmarks.applicantsSavedList();
        const raw = Array.isArray(data) ? data : data?.results || [];
        const list = raw.map((row) => {
          const details = row.pathfinder_details || {};
          const baseDetails = details.base_details || {};
          const first = details.first_name || "";
          const last = details.last_name || "";
          const name = [first, last].filter(Boolean).join(" ").trim() || "Pathfinder";
          const role = details.title || "Pathfinder";
          const locationStr = [baseDetails.state, baseDetails.country].filter(Boolean).join(", ");
          const pathfinderUserId = row.pathfinder_user_id ?? null;
          return { bookmarkId: row.id, pathfinderUserId, name, role, location: locationStr };
        }).filter((p) => p.pathfinderUserId != null);
        setPathfinders(list);
      } catch (err) {
        console.error("Error loading bookmarks:", err);
        setPathfinders([]);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (pathfinderUserId) => {
    try {
      await bookmarks.applicantsSavedDelete(pathfinderUserId);
      setPathfinders((prev) => prev.filter((p) => String(p.pathfinderUserId) !== String(pathfinderUserId)));
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />
      <div className="pt-16">
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-1">Bookmarked Pathfinders</h1>
            <p className="text-purple-200 text-sm">Pathfinders you have saved. View their profiles or contact them.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
            </div>
          ) : pathfinders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p className="font-bold text-gray-800 mb-1">No bookmarked pathfinders yet</p>
              <p className="text-sm text-gray-400 mb-5">Go to Recommendations and bookmark pathfinders to see them here.</p>
              <button onClick={() => navigate("/enabler/recommendations")}
                className="bg-[#651F5F] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#4a1647] transition-colors">
                Browse Recommendations
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pathfinders.map((pf) => (
                <div key={String(pf.pathfinderUserId)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${avatarBg(pf.name)}`}>
                    {pf.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900">{pf.name}</h2>
                    <p className="text-xs text-gray-500">{pf.role}{pf.location && ` • ${pf.location}`}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => navigate(`/enabler/pathfinder/${pf.pathfinderUserId}`)}
                      className="bg-[#651F5F] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#4a1647] transition-colors">
                      View Profile
                    </button>
                    <button onClick={() => navigate(`/enabler/contact/${pf.pathfinderUserId}`)}
                      className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                      Contact
                    </button>
                    <button onClick={() => handleRemoveBookmark(pf.pathfinderUserId)}
                      className="text-gray-400 hover:text-red-500 transition-colors" title="Remove from bookmarks">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnablerPathfinderBookmarks;
