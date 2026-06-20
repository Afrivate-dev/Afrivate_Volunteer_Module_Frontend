import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Toast from "../../components/common/Toast";
import { profile, bookmarks, getAccessToken, getRole } from "../../services/api";
import { normalizeBookmarkList, findEnablerBookmarkRow } from "../../utils/bookmarkHelpers";

const OrganizationProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state || {};
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });

  useEffect(() => { document.title = "Organization Profile - AfriVate"; }, []);

  useEffect(() => {
    const load = async () => {
      if (!id) { setLoading(false); setError("Organization not found."); return; }
      setLoading(true);
      setError(null);
      try {
        const data = await profile.enablerGetById(id);
        setProfileData(data);
        if (data?.id != null && getAccessToken() && getRole() === "pathfinder") {
          try {
            const raw = await bookmarks.enablersSavedList();
            const list = normalizeBookmarkList(raw);
            const row = findEnablerBookmarkRow(list, id);
            setIsBookmarked(!!row);
          } catch (_) { setIsBookmarked(false); }
        }
      } catch (err) {
        console.error("Error loading organization profile:", err);
        setProfileData(null);
        setError(err?.status === 404 ? "Profile not available." : "Could not load profile.");
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleBookmark = async () => {
    const enablerPk = id;
    if (enablerPk == null || !getAccessToken() || getRole() !== "pathfinder") {
      setToast({ isOpen: true, message: "Sign in as a pathfinder to bookmark organizations.", type: "error" }); return;
    }
    if (isBookmarked) {
      try {
        await bookmarks.enablersSavedDelete(enablerPk);
        setIsBookmarked(false);
        setToast({ isOpen: true, message: "Removed from bookmarks.", type: "success" });
      } catch (err) {
        console.error("Delete bookmark error:", err);
        setToast({ isOpen: true, message: "Could not remove bookmark. Try again.", type: "error" });
      }
    } else {
      try {
        await bookmarks.enablersSavedCreate({ enabler_id: enablerPk });
        setIsBookmarked(true);
        setToast({ isOpen: true, message: "Organization saved to bookmarks.", type: "success" });
      } catch (err) {
        console.error("Create bookmark error:", err);
        const errorMessage = err?.body?.non_field_errors?.[0] || "";
        if (errorMessage.includes("already bookmarked")) {
          setIsBookmarked(true);
          setToast({ isOpen: true, message: "Organization is already saved.", type: "success" });
        } else {
          setToast({ isOpen: true, message: "Could not save bookmark. Try again.", type: "error" });
        }
      }
    }
  };

  const base = profileData?.base_details || {};
  const displayName = profileData?.name || stateData.name || "Organization";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <NavBar />
        <div className="pt-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" /></div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <NavBar />
        <div className="pt-20 px-4 max-w-2xl mx-auto text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{displayName}</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          {stateData.website && (
            <a href={stateData.website} target="_blank" rel="noopener noreferrer" className="text-[#8D4087] hover:underline block mb-4">{stateData.website}</a>
          )}
          <button onClick={() => navigate(-1)} className="text-[#8D4087] font-semibold hover:underline">Go back</button>
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
                {base.profile_pic ? (
                  <img src={base.profile_pic} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🏢</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white mb-0.5">{displayName}</h1>
                {profileData?.role && <p className="text-purple-200 text-sm mb-1">{profileData.role}</p>}
                {base.bio && <p className="text-purple-300 text-sm mt-1 max-w-xl leading-relaxed">{base.bio}</p>}
                {getAccessToken() && getRole() === "pathfinder" && profileData?.id != null && (
                  <button onClick={handleBookmark}
                    className={`mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                      isBookmarked ? "bg-white text-[#651F5F] hover:bg-purple-50" : "bg-white/20 border border-white/40 text-white hover:bg-white/30"
                    }`}>
                    🔖 {isBookmarked ? "Saved" : "Save organization"}
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
            <div className="space-y-3">
              {base.contact_email && (
                <div className="flex items-center gap-3">
                  <span className="text-[#8D4087]">✉️</span>
                  <span className="text-gray-700 text-sm">{base.contact_email}</span>
                </div>
              )}
              {base.phone_number && (
                <div className="flex items-center gap-3">
                  <span className="text-[#8D4087]">📞</span>
                  <span className="text-gray-700 text-sm">{base.phone_number}</span>
                </div>
              )}
              {base.website && (
                <div className="flex items-center gap-3">
                  <span className="text-[#8D4087]">🌐</span>
                  <a href={base.website} target="_blank" rel="noopener noreferrer" className="text-[#8D4087] hover:underline text-sm">{base.website}</a>
                </div>
              )}
              {!base.contact_email && !base.phone_number && !base.website && (
                <p className="text-gray-400 text-sm">No contact details available.</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Location</h2>
            <div className="space-y-3">
              {base.address && (
                <div className="flex items-center gap-3">
                  <span className="text-[#8D4087]">📍</span>
                  <span className="text-gray-700 text-sm">{base.address}</span>
                </div>
              )}
              {base.state && (
                <div className="flex items-center gap-3">
                  <span className="text-[#8D4087]">🗺️</span>
                  <span className="text-gray-700 text-sm">{base.state}{base.country ? `, ${base.country}` : ""}</span>
                </div>
              )}
              {!base.address && !base.state && (
                <p className="text-gray-400 text-sm">No location details available.</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          {profileData?.social_links && profileData.social_links.length > 0 && (
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Social Links</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.social_links.map((link, index) => (
                  <a key={index} href={link.platform_url} target="_blank" rel="noopener noreferrer"
                    className="bg-purple-50 text-[#8D4087] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-colors">
                    {link.platform_name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />
    </div>
  );
};

export default OrganizationProfile;
