import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Toast from "../../components/common/Toast";
import { profile, bookmarks, getAccessToken, getRole } from "../../services/api";
import { normalizeBookmarkList, findEnablerBookmarkRow } from "../../utils/bookmarkHelpers";

/**
 * Public view of an enabler/organization profile.
 * Linked from VolunteerDetails "View organization profile".
 */
const OrganizationProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state || {};
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });

  useEffect(() => {
    document.title = "Organization Profile - AfriVate";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        setError("Organization not found.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await profile.enablerGetById(id);
        setProfileData(data);
        if (data?.id != null && getAccessToken() && getRole() === "pathfinder") {
          try {
            const raw = await bookmarks.enablersSavedList();
            const list = normalizeBookmarkList(raw);
            const row = findEnablerBookmarkRow(list, data.id);
            if (row) {
              setIsBookmarked(true);
              setBookmarkId(row.id ?? row.pk ?? null);
            } else {
              setIsBookmarked(false);
              setBookmarkId(null);
            }
          } catch (_) {
            setIsBookmarked(false);
            setBookmarkId(null);
          }
        }
      } catch (err) {
        console.error("Error loading organization profile:", err);
        setProfileData(null);
        setError(err?.status === 404 ? "Profile not available." : "Could not load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBookmark = async () => {
    const enablerPk = profileData?.id;
    if (enablerPk == null || !getAccessToken() || getRole() !== "pathfinder") {
      setToast({
        isOpen: true,
        message: "Sign in as a pathfinder to bookmark organizations.",
        type: "error",
      });
      return;
    }

    if (isBookmarked) {
      try {
        await bookmarks.enablersSavedDelete(enablerPk);
        setIsBookmarked(false);
        setBookmarkId(null);
        setToast({ isOpen: true, message: "Removed from bookmarks.", type: "success" });
      } catch (err) {
        console.error("Delete bookmark error:", err);
        setToast({
          isOpen: true,
          message: "Could not remove bookmark. Try again.",
          type: "error",
        });
      }
    } else {
      try {
        const res = await bookmarks.enablersSavedCreate({ enabler_id: enablerPk }); 
        setIsBookmarked(true);
        setBookmarkId(res?.id ?? res?.pk ?? null);
        setToast({ isOpen: true, message: "Organization saved to bookmarks.", type: "success" });
      } catch (err) {
        console.error("Create bookmark error:",err);

        const errorMessage = err?.body?.non_field_errors?.[0] || "";
        if (errorMessage.includes("already bookmarked")) {
          setIsBookmarked(true);
          setToast({ isOpen: true, message: "Organization is already saved.", type: "success" });
        } else {
          setToast({
            isOpen: true,
            message: "Could not save bookmark. Try again.",
            type: "error",
          });
        }
      }
    }
  };

  const base = profileData?.base_details || {};
  const displayName = profileData?.name || stateData.name || "Organization";

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <NavBar />
        <div className="pt-20 px-4 py-12 text-center text-gray-500">Loading organization...</div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <NavBar />
        <div className="pt-20 px-4 py-12 max-w-2xl mx-auto text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{displayName}</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          {stateData.website && (
            <a
              href={stateData.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6A00B1] hover:underline"
            >
              Visit website
            </a>
          )}
          <button
            onClick={() => navigate(-1)}
            className="mt-6 block mx-auto text-[#6A00B1] hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar />
      <div className="pt-20 px-4 md:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <i className="fa fa-arrow-left text-xl"></i>
          </button>

          <div className="bg-[#6A00B1] rounded-[30px] p-6 md:p-8 text-white mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {base.profile_pic ? (
                  <img
                    src={base.profile_pic}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ffffff&color=6A00B1&size=128`}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">{displayName}</h1>
                {profileData?.role && <p className="text-white/80 mb-2">{profileData.role}</p>}
                {base.bio && <p className="text-white/90 text-sm max-w-xl">{base.bio}</p>}
                {getAccessToken() && getRole() === "pathfinder" && profileData?.id != null && (
                  <button
                    type="button"
                    onClick={handleBookmark}
                    className={`mt-4 px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      isBookmarked
                        ? "bg-white text-[#6A00B1] hover:bg-gray-100"
                        : "bg-white/20 border border-white/40 hover:bg-white/30"
                    }`}
                  >
                    <i className={`fa fa-bookmark mr-2 ${isBookmarked ? "fas" : "far"}`} />
                    {isBookmarked ? "Saved" : "Save organization"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-[30px] p-4 md:p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-black mb-4">Contact Information</h2>
              <div className="space-y-3">
                {base.contact_email && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-envelope text-[#6A00B1] w-5"></i>
                    <span className="text-gray-700">{base.contact_email}</span>
                  </div>
                )}
                {base.phone_number && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-phone text-[#6A00B1] w-5"></i>
                    <span className="text-gray-700">{base.phone_number}</span>
                  </div>
                )}
                {base.website && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-globe text-[#6A00B1] w-5"></i>
                    <a
                      href={base.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6A00B1] hover:underline"
                    >
                      {base.website}
                    </a>
                  </div>
                )}
                {!base.contact_email && !base.phone_number && !base.website && (
                  <p className="text-gray-500 text-sm">No contact details available.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[30px] p-4 md:p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-black mb-4">Location</h2>
              <div className="space-y-3">
                {base.address && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-map-marker text-[#6A00B1] w-5"></i>
                    <span className="text-gray-700">{base.address}</span>
                  </div>
                )}
                {base.state && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-map text-[#6A00B1] w-5"></i>
                    <span className="text-gray-700">
                      {base.state}
                      {base.country ? `, ${base.country}` : ""}
                    </span>
                  </div>
                )}
                {!base.address && !base.state && (
                  <p className="text-gray-500 text-sm">No location details available.</p>
                )}
              </div>
            </div>
          </div>

          {profileData?.social_links && profileData.social_links.length > 0 && (
            <div className="bg-white rounded-[30px] p-4 md:p-6 border border-gray-200 mt-4">
              <h2 className="text-lg font-bold text-black mb-4">Social Links</h2>
              <div className="flex flex-wrap gap-3">
                {profileData.social_links.map((link, index) => (
                  <a
                    key={index}
                    href={link.platform_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-50 text-[#6A00B1] px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                  >
                    {link.platform_name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, isOpen: false }))}
      />
    </div>
  );
};

export default OrganizationProfile;
