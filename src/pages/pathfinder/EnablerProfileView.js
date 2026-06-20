import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Toast from "../../components/common/Toast";
import { bookmarks, profile, getRole } from "../../services/api";
import { normalizeBookmarkList, findEnablerBookmarkRow } from "../../utils/bookmarkHelpers";

const EnablerProfileView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [enabler, setEnabler] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });

  useEffect(() => { document.title = "Enabler Profile - AfriVate"; }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await profile.enablerGetById(id);
        if (data) {
          const base = data.base_details || {};
          const name = data.name || [data.first_name, data.last_name].filter(Boolean).join(" ") || base.contact_email || "Organization";
          const role = data.role || "Organization";
          const locationParts = [base.address, base.state, base.country].filter(Boolean);
          setEnabler({ id: data.id, name, role, location: locationParts.join(", "), bio: data.bio || base.bio || "", email: base.contact_email || "", phone: base.phone_number || "", website: base.website || "", profilePic: base.profile_pic || "" });
          if (id != null) checkBookmarkStatus(id);
        } else { setEnabler(null); }
      } catch (err) {
        console.error("Error loading enabler profile:", err);
        setError(err?.status === 404 ? "Profile not available." : "Could not load enabler profile.");
        setEnabler(null);
      } finally { setLoading(false); }
    };
    if (id) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const checkBookmarkStatus = async (enablerId) => {
    try {
      const raw = await bookmarks.enablersSavedList();
      const bookmarksList = normalizeBookmarkList(raw);
      const foundBookmark = findEnablerBookmarkRow(bookmarksList, enablerId);
      setIsBookmarked(!!foundBookmark);
    } catch (err) { console.error("Error checking bookmark status:", err); }
  };

  const handleBookmark = async () => {
    if (!enabler) return;
    if (isBookmarked) {
      try {
        await bookmarks.enablersSavedDelete(id);
        setIsBookmarked(false);
        setToast({ isOpen: true, message: "Removed from bookmarks.", type: "success" });
      } catch (err) {
        console.error("Error removing bookmark:", err);
        setToast({ isOpen: true, message: "We couldn't remove that bookmark. Please try again in a moment.", type: "error" });
      }
    } else {
      try {
        await bookmarks.enablersSavedCreate({ enabler_id: id });
        setIsBookmarked(true);
        setToast({ isOpen: true, message: "Organization saved to your bookmarks.", type: "success" });
      } catch (err) {
        console.error("Error creating bookmark:", err);
        setToast({ isOpen: true, message: "We couldn't save this organization to your bookmarks. Please try again.", type: "error" });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <NavBar />
        <div className="pt-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" /></div>
      </div>
    );
  }

  if (!enabler) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <NavBar />
        <div className="pt-20 text-center">
          <button onClick={() => navigate(-1)} className="text-[#8D4087] hover:underline mb-4 block mx-auto">← Go back</button>
          <p className="text-gray-600">{error || "Organization not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <NavBar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-5 hover:bg-white/30 transition-colors">
              ← Back
            </button>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
                {enabler.profilePic ? (
                  <img src={enabler.profilePic} alt={enabler.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🏢</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white mb-0.5">{enabler.name}</h1>
                {enabler.role && <p className="text-purple-200 text-sm mb-1">{enabler.role}</p>}
                {enabler.location && <p className="text-purple-300 text-xs flex items-center gap-1">📍 {enabler.location}</p>}
                {enabler.bio && <p className="text-purple-200 text-sm mt-2 max-w-2xl leading-relaxed">{enabler.bio}</p>}
                {getRole() === "pathfinder" && (
                  <button onClick={handleBookmark}
                    className={`mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                      isBookmarked ? "bg-white text-[#651F5F] hover:bg-purple-50" : "bg-white/20 border border-white/40 text-white hover:bg-white/30"
                    }`}>
                    🔖 {isBookmarked ? "Saved" : "Save Organization"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              {enabler.email && (
                <div className="flex items-start gap-3">
                  <span className="text-[#8D4087]">✉️</span>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <a href={`mailto:${enabler.email}`} className="text-gray-800 hover:text-[#8D4087] text-sm break-all">{enabler.email}</a>
                  </div>
                </div>
              )}
              {enabler.phone && (
                <div className="flex items-start gap-3">
                  <span className="text-[#8D4087]">📞</span>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                    <a href={`tel:${enabler.phone}`} className="text-gray-800 hover:text-[#8D4087] text-sm">{enabler.phone}</a>
                  </div>
                </div>
              )}
              {enabler.website && (
                <div className="flex items-start gap-3">
                  <span className="text-[#8D4087]">🌐</span>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Website</p>
                    <a href={enabler.website} target="_blank" rel="noopener noreferrer" className="text-[#8D4087] hover:underline text-sm break-all">{enabler.website}</a>
                  </div>
                </div>
              )}
              {!enabler.email && !enabler.phone && !enabler.website && (
                <p className="text-gray-400 text-sm">No contact information available</p>
              )}
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">About</h2>
            {enabler.bio ? (
              <p className="text-gray-700 text-sm leading-relaxed">{enabler.bio}</p>
            ) : (
              <p className="text-gray-400 text-sm">No description available</p>
            )}
          </div>

          {/* CTA */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <h3 className="font-bold text-gray-900 mb-2">Interested in Volunteering?</h3>
            <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">Browse this organization's opportunities to find positions that match your skills.</p>
            <button onClick={() => navigate("/available-opportunities")}
              className="bg-[#651F5F] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#4a1647] transition-colors">
              View Opportunities
            </button>
          </div>
        </div>
      </div>
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

export default EnablerProfileView;
