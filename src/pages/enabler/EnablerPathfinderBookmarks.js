import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import { bookmarks } from "../../services/api";

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
          const nested =
            row.pathfinder && typeof row.pathfinder === "object"
              ? row.pathfinder
              : null;
          const pathfinderId =
            row.pathfinder_id ??
            (typeof row.pathfinder === "number" || typeof row.pathfinder === "string"
              ? row.pathfinder
              : null) ??
            nested?.id ??
            row.id;
          const first = nested?.first_name || "";
          const last = nested?.last_name || "";
          const nameFromNested = [first, last].filter(Boolean).join(" ").trim();
          const name =
            row.pathfinder_name ||
            nameFromNested ||
            nested?.name ||
            "Pathfinder";
          const profileNavId =
            row.user ??
            row.user_id ??
            nested?.user ??
            pathfinderId;
          const locationStr =
            [nested?.address, nested?.state, nested?.country]
              .filter(Boolean)
              .join(", ") ||
            row.location ||
            "";
          return {
            pathfinderId,
            profileNavId,
            name,
            role: nested?.title || "Pathfinder",
            location: locationStr,
          };
        }).filter((p) => p.pathfinderId != null);

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

  const handleRemoveBookmark = async (pathfinderId) => {
    try {
      await bookmarks.applicantsSavedDelete(pathfinderId);
      setPathfinders((prev) =>
        prev.filter((p) => String(p.pathfinderId) !== String(pathfinderId))
      );
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Bookmarked Pathfinders</h1>
          <p className="text-gray-600 mb-6">
            Pathfinders you have saved. View their profiles or contact them.
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading bookmarks...</p>
            </div>
          ) : pathfinders.length === 0 ? (
            <div className="bg-gray-50 rounded-[30px] p-8 md:p-12 border border-gray-200 text-center">
              <i className="fa fa-bookmark text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 mb-2">No bookmarked pathfinders yet.</p>
              <p className="text-gray-500 text-sm mb-4">
                Go to Recommendations and bookmark pathfinders to see them here.
              </p>
              <button
                onClick={() => navigate("/enabler/recommendations")}
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors"
              >
                Browse Recommendations
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pathfinders.map((pf) => (
                <div
                  key={String(pf.pathfinderId)}
                  className="bg-white rounded-[30px] p-4 md:p-6 border border-gray-200 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa fa-user text-2xl text-gray-400"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-black">{pf.name}</h2>
                    <p className="text-gray-700 text-sm">{pf.role}</p>
                    <p className="text-gray-500 text-xs md:text-sm">{pf.location}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/enabler/pathfinder/${pf.profileNavId}`)}
                      className="bg-[#6A00B1] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#5A0091] transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => navigate(`/enabler/contact/${pf.profileNavId}`)}
                      className="border-2 border-[#6A00B1] text-[#6A00B1] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors"
                    >
                      Contact
                    </button>
                    <button
                      onClick={() => handleRemoveBookmark(pf.pathfinderId)}
                      className="text-gray-500 hover:text-red-600 px-2 py-1 text-sm"
                      title="Remove from bookmarks"
                    >
                      <i className="fa fa-bookmark"></i> Remove
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
