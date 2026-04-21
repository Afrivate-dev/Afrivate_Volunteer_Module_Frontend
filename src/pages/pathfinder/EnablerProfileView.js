import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Toast from "../../components/common/Toast";
import { bookmarks, profile } from "../../services/api";
import { normalizeBookmarkList, findEnablerBookmarkRow } from "../../utils/bookmarkHelpers";

/**
 * Pathfinder's view of an enabler/organization profile.
 * Similar to how enablers view pathfinder profiles.
 * Accessed via /enabler-profile/:id
 */
const EnablerProfileView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [enabler, setEnabler] = useState(null);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });

  useEffect(() => {
    document.title = "Enabler Profile - AfriVate";
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await profile.enablerGetById(id);
        if (data) {
          const base = data.base_details || {};
          const name =
            data.name ||
            [data.first_name, data.last_name].filter(Boolean).join(" ") ||
            base.contact_email ||
            "Organization";
          const role = data.role || "Organization";
          const locationParts = [base.address, base.state, base.country].filter(Boolean);
          const location = locationParts.join(", ");
          const bio = data.bio || base.bio || "";
          const email = base.contact_email || "";
          const phone = base.phone_number || "";
          const website = base.website || "";
          const profilePic = base.profile_pic || "";

          setEnabler({
            id: data.id,
            name,
            role,
            location,
            bio,
            email,
            phone,
            website,
            profilePic,
          });
          if (data.id != null) {
            checkBookmarkStatus(data.id);
          }
        } else {
          setEnabler(null);
        }
      } catch (err) {
        console.error("Error loading enabler profile:", err);
        setError(err?.status === 404 ? "Profile not available." : "Could not load enabler profile.");
        setEnabler(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const checkBookmarkStatus = async (enablerId) => {
    try {
      const raw = await bookmarks.list();
      const bookmarksList = normalizeBookmarkList(raw);
      const foundBookmark = findEnablerBookmarkRow(bookmarksList, enablerId);
      if (foundBookmark) {
        setIsBookmarked(true);
        setBookmarkId(foundBookmark.id ?? foundBookmark.pk ?? null);
      } else {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } catch (err) {
      console.error("Error checking bookmark status:", err);
    }
  };

  const handleBookmark = async () => {
    if (!enabler?.id) return;

    if (isBookmarked) {
      try {
        let idToDelete = bookmarkId;
        if (idToDelete == null) {
          const raw = await bookmarks.list();
          const list = normalizeBookmarkList(raw);
          const row = findEnablerBookmarkRow(list, enabler.id);
          idToDelete = row?.id ?? row?.pk;
        }
        if (idToDelete != null) {
          await bookmarks.delete(idToDelete);
        }
        setIsBookmarked(false);
        setBookmarkId(null);
        setToast({
          isOpen: true,
          message: "Removed from bookmarks.",
          type: "success",
        });
      } catch (err) {
        console.error("Error removing bookmark:", err);
        setToast({
          isOpen: true,
          message: "We couldn't remove that bookmark. Please try again in a moment.",
          type: "error",
        });
      }
    } else {
      try {
        const newBookmark = await bookmarks.create({ enabler: enabler.id });
        const newId = newBookmark?.id ?? newBookmark?.pk;
        setIsBookmarked(true);
        setBookmarkId(newId ?? null);
        setToast({
          isOpen: true,
          message: "Organization saved to your bookmarks.",
          type: "success",
        });
      } catch (err) {
        console.error("Error creating bookmark:", err);
        setToast({
          isOpen: true,
          message: "We couldn't save this organization to your bookmarks. Please try again.",
          type: "error",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <NavBar />
        <div className="pt-14 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6A00B1] border-t-transparent mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!enabler) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <NavBar />
        <div className="pt-14 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <button
              onClick={() => navigate(-1)}
              className="text-[#6A00B1] hover:underline mb-4"
            >
              ← Go back
            </button>
            <p className="text-gray-600">{error || "Organization not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar />

      <div className="pt-14 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Go back"
          >
            <i className="fa fa-arrow-left text-lg"></i>
          </button>

          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#6A00B1] to-[#8B2FA8] rounded-3xl p-6 md:p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
              {/* Profile Picture */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white/20 flex-shrink-0 flex items-center justify-center border-4 border-white/30">
                {enabler.profilePic ? (
                  <img
                    src={enabler.profilePic}
                    alt={enabler.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10">
                    <i className="fa fa-building text-3xl text-white/50"></i>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{enabler.name}</h1>
                {enabler.role && (
                  <p className="text-white/90 text-lg mb-3 font-medium">{enabler.role}</p>
                )}
                {enabler.location && (
                  <p className="text-white/80 flex items-center gap-2 mb-4">
                    <i className="fa fa-map-marker"></i>
                    {enabler.location}
                  </p>
                )}
                {enabler.bio && (
                  <p className="text-white/90 leading-relaxed max-w-2xl">{enabler.bio}</p>
                )}

                {/* Bookmark Button */}
                <button
                  onClick={handleBookmark}
                  className={`mt-6 px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    isBookmarked
                      ? "bg-white text-[#6A00B1] hover:bg-gray-100"
                      : "bg-white/20 text-white border border-white hover:bg-white/30"
                  }`}
                >
                  <i className={`fa fa-bookmark ${isBookmarked ? "fas" : "far"}`}></i>
                  {isBookmarked ? "Saved" : "Save Organization"}
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-black mb-4">Contact Information</h2>
              <div className="space-y-4">
                {enabler.email && (
                  <div className="flex items-start gap-3">
                    <i className="fa fa-envelope text-[#6A00B1] text-lg w-6 mt-0.5"></i>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${enabler.email}`}
                        className="text-gray-800 hover:text-[#6A00B1] break-all"
                      >
                        {enabler.email}
                      </a>
                    </div>
                  </div>
                )}
                {enabler.phone && (
                  <div className="flex items-start gap-3">
                    <i className="fa fa-phone text-[#6A00B1] text-lg w-6 mt-0.5"></i>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Phone</p>
                      <a
                        href={`tel:${enabler.phone}`}
                        className="text-gray-800 hover:text-[#6A00B1]"
                      >
                        {enabler.phone}
                      </a>
                    </div>
                  </div>
                )}
                {enabler.website && (
                  <div className="flex items-start gap-3">
                    <i className="fa fa-globe text-[#6A00B1] text-lg w-6 mt-0.5"></i>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Website</p>
                      <a
                        href={enabler.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6A00B1] hover:underline break-all"
                      >
                        {enabler.website}
                      </a>
                    </div>
                  </div>
                )}
                {!enabler.email && !enabler.phone && !enabler.website && (
                  <p className="text-gray-500 text-sm">No contact information available</p>
                )}
              </div>
            </div>

            {/* About Section */}
            {enabler.bio && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-black mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{enabler.bio}</p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="bg-[#FAFAFA] rounded-2xl border border-gray-200 p-6 md:p-8 text-center">
            <h3 className="text-xl font-bold text-black mb-3">Interested in Volunteering?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Browse this organization's opportunities to find volunteering positions that match your skills and interests.
            </p>
            <button
              onClick={() => navigate("/available-opportunities")}
              className="bg-[#6A00B1] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors"
            >
              View Opportunities
            </button>
          </div>
        </div>
      </div>
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default EnablerProfileView;
