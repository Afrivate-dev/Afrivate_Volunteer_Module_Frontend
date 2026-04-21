import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import { bookmarks, profile, opportunities } from "../../services/api";

const PathfinderProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const opportunityId = location.state?.opportunityId;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [pathfinder, setPathfinder] = useState(null);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [enablerId, setEnablerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const enablerIdRef = useRef(enablerId);
  enablerIdRef.current = enablerId;

  useEffect(() => {
    document.title = "Pathfinder Profile - AfriVate";
  }, []);

  const checkBookmarkStatus = useCallback(async (pathfinderId) => {
    try {
      try {
        await bookmarks.applicantsSavedGet(pathfinderId);
        setIsBookmarked(true);
        setBookmarkId(null);
        return;
      } catch (_) {}

      const saved = await bookmarks.applicantsSavedList();
      const list = Array.isArray(saved) ? saved : saved?.results || [];
      const idStr = String(pathfinderId);
      const inApplicantsSaved = list.some((row) => {
        const pid = row.pathfinder_id ?? row.pathfinder ?? row.pathfinder?.id;
        return pid != null && String(pid) === idStr;
      });
      if (inApplicantsSaved) {
        setIsBookmarked(true);
        setBookmarkId(null);
        return;
      }

      let myEnablerId = enablerIdRef.current;
      if (!myEnablerId) {
        try {
          const me = await profile.enablerGet();
          if (me && me.id != null) {
            myEnablerId = me.id;
            setEnablerId(me.id);
          }
        } catch (_) {}
      }

      const bookmarksList = await bookmarks.list();
      const arr = Array.isArray(bookmarksList) ? bookmarksList : bookmarksList?.results || [];
      const foundBookmark = arr.find(
        (b) =>
          b.pathfinder &&
          String(b.pathfinder) === String(pathfinderId) &&
          (!myEnablerId || String(b.enabler) === String(myEnablerId))
      );
      if (foundBookmark) {
        setIsBookmarked(true);
        setBookmarkId(foundBookmark.id);
      } else {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } catch (err) {
      console.error("Error checking bookmark status:", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (opportunityId) {
          try {
            data = await opportunities.getApplicant(opportunityId, id);
          } catch (_) {
            data = await profile.pathfinderGetById(id);
          }
        } else {
          data = await profile.pathfinderGetById(id);
        }

        if (data) {
          const base = data.base_details || {};

          const name =
            [data.first_name, data.last_name].filter(Boolean).join(" ") ||
            data.name ||
            base.contact_email ||
            "Pathfinder";

          const skills = Array.isArray(data.skills)
            ? data.skills.map((s) => (typeof s === "string" ? s : s?.name || s?.skill || "")).filter(Boolean)
            : [];
          const educations = Array.isArray(data.educations)
            ? data.educations.map((e) => (typeof e === "string" ? e : e?.name || e?.institution || e?.degree || "")).filter(Boolean)
            : [];
          const certifications = Array.isArray(data.certifications)
            ? data.certifications.map((c) => (typeof c === "string" ? c : c?.name || c?.title || c?.certificate || "")).filter(Boolean)
            : [];
          const socialLinks = Array.isArray(data.social_links)
            ? data.social_links.filter((l) => l?.platform_url)
            : [];

          // Documents may be embedded in the profile or in a separate field
          const documents = Array.isArray(data.credentials)
            ? data.credentials.filter((c) => c?.document)
            : Array.isArray(data.documents)
            ? data.documents.filter((d) => d?.document || d?.url)
            : [];

          // Profile photo: check embedded fields first
          let profilePic = data.profile_pic || base.profile_pic || null;
          if (!profilePic) {
            try {
              const picData = await profile.pictureGetById(id);
              if (picData?.profile_pic) profilePic = picData.profile_pic;
            } catch (_) {}
          }

          setPathfinder({
            id: data.id,
            name,
            profilePic,
            title: data.title || "",
            bio: base.bio || "",
            contactEmail: base.contact_email || data.gmail || "",
            phone: base.phone_number || "",
            gmail: data.gmail || "",
            website: base.website || "",
            address: base.address || "",
            state: base.state || "",
            country: base.country || "",
            languages: data.languages || "",
            about: data.about || base.bio || "",
            workExperience: data.work_experience || "",
            skills,
            educations,
            certifications,
            socialLinks,
            documents,
          });

          if (data.id != null) {
            await checkBookmarkStatus(data.id);
          }
        } else {
          setPathfinder(null);
        }
      } catch (err) {
        console.error("Error loading pathfinder profile:", err);
        setError("Could not load pathfinder profile.");
        setPathfinder(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, opportunityId, checkBookmarkStatus]);

  const handleBookmark = async () => {
    const oppId = location.state?.opportunityId;
    const applicantFlow = oppId != null && oppId !== "";

    if (applicantFlow) {
      try {
        if (isBookmarked) {
          await bookmarks.applicantsSavedDelete(pathfinder.id);
          setIsBookmarked(false);
          setBookmarkId(null);
        } else {
          await bookmarks.applicantsSavedCreate({
            pathfinder_id: pathfinder.id,
            opportunity_id: Number(oppId),
          });
          setIsBookmarked(true);
          setBookmarkId(null);
        }
      } catch (err) {
        console.error("Error toggling applicant bookmark:", err);
      }
      return;
    }

    if (isBookmarked && bookmarkId) {
      try {
        await bookmarks.delete(bookmarkId);
        setIsBookmarked(false);
        setBookmarkId(null);
      } catch (err) {
        console.error("Error removing bookmark:", err);
      }
    } else {
      try {
        let myEnablerId = enablerId;
        if (!myEnablerId) {
          try {
            const me = await profile.enablerGet();
            if (me && me.id != null) {
              myEnablerId = me.id;
              setEnablerId(me.id);
            }
          } catch (_) {}
        }
        const payload = { pathfinder: pathfinder.id };
        if (myEnablerId) payload.enabler = myEnablerId;
        const newBookmark = await bookmarks.create(payload);
        if (newBookmark && newBookmark.id) {
          setIsBookmarked(true);
          setBookmarkId(newBookmark.id);
        }
      } catch (err) {
        console.error("Error creating bookmark:", err);
      }
    }
  };

  // ─── helpers ────────────────────────────────────────────────────────────────
  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h2 className="text-base font-bold text-[#6A00B1] uppercase tracking-wide mb-3 pb-1 border-b border-gray-200">
        {title}
      </h2>
      {children}
    </div>
  );

  const Field = ({ label, value }) =>
    value ? (
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase mb-0.5">{label}</p>
        <p className="text-gray-800 text-sm whitespace-pre-wrap">{value}</p>
      </div>
    ) : null;
  // ────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!pathfinder) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-gray-500">{error || "No pathfinder profile found."}</p>
            <button
              onClick={() => navigate("/enabler/recommendations")}
              className="mt-4 text-[#6A00B1] font-semibold hover:underline"
            >
              Back to recommendations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />

      <div className="pt-20 px-4 md:px-6 pb-10">
        <div className="max-w-4xl mx-auto">

          {/* Hero header — purple banner matching EditNewProfile preview */}
          <div className="bg-[#6A00B1] rounded-2xl p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-white/20 flex-shrink-0 flex items-center justify-center">
              {pathfinder.profilePic ? (
                <img src={pathfinder.profilePic} alt={pathfinder.name} className="w-full h-full object-cover" />
              ) : (
                <i className="fa fa-user text-4xl text-white/70" />
              )}
            </div>

            {/* Name / title / bio */}
            <div className="text-center md:text-left flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">{pathfinder.name}</h1>
              {pathfinder.title && <p className="text-white/80 text-sm mb-2">{pathfinder.title}</p>}
              {pathfinder.bio && <p className="text-white/70 text-sm italic">{pathfinder.bio}</p>}
            </div>

            {/* Bookmark + Contact */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleBookmark}
                title={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-colors ${
                  isBookmarked
                    ? "bg-white border-white text-[#6A00B1]"
                    : "bg-transparent border-white/60 text-white hover:border-white"
                }`}
              >
                <i className={`fa fa-bookmark text-lg ${isBookmarked ? "text-[#6A00B1]" : "text-white"}`} />
              </button>
              <button
                onClick={() => navigate(`/enabler/contact/${id}`)}
                className="bg-white text-[#6A00B1] px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Sections card */}
          <div className="bg-[#FAFAFA] rounded-2xl p-4 md:p-6">

            {/* Contact Information */}
            {(pathfinder.contactEmail || pathfinder.phone || pathfinder.gmail || pathfinder.website) && (
              <Section title="Contact Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Email" value={pathfinder.contactEmail} />
                  <Field label="Phone" value={pathfinder.phone} />
                  <Field label="Gmail" value={pathfinder.gmail} />
                  <Field label="Website" value={pathfinder.website} />
                </div>
              </Section>
            )}

            {/* Location */}
            {(pathfinder.address || pathfinder.state || pathfinder.country || pathfinder.languages) && (
              <Section title="Location">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Address" value={pathfinder.address} />
                  <Field label="State" value={pathfinder.state} />
                  <Field label="Country" value={pathfinder.country} />
                  <Field label="Languages" value={pathfinder.languages} />
                </div>
              </Section>
            )}

            {/* About */}
            {(pathfinder.about || pathfinder.workExperience) && (
              <Section title="About">
                <div className="space-y-4">
                  <Field label="About" value={pathfinder.about} />
                  <Field label="Work Experience" value={pathfinder.workExperience} />
                </div>
              </Section>
            )}

            {/* Skills */}
            {pathfinder.skills.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {pathfinder.skills.map((s, i) => (
                    <span key={i} className="bg-purple-100 text-[#6A00B1] px-3 py-1 rounded-full text-sm font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Education */}
            {pathfinder.educations.length > 0 && (
              <Section title="Education">
                <ul className="space-y-1">
                  {pathfinder.educations.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                      <i className="fa fa-graduation-cap text-[#6A00B1] mt-0.5 text-xs" />
                      {e}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Certifications */}
            {pathfinder.certifications.length > 0 && (
              <Section title="Certifications">
                <ul className="space-y-1">
                  {pathfinder.certifications.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                      <i className="fa fa-certificate text-[#6A00B1] mt-0.5 text-xs" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Social Links */}
            {pathfinder.socialLinks.length > 0 && (
              <Section title="Social Links">
                <div className="flex flex-wrap gap-3">
                  {pathfinder.socialLinks.map((l, i) => (
                    <a
                      key={i}
                      href={l.platform_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-50 text-[#6A00B1] px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                    >
                      {l.platform_name || l.platform_url}
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {/* Documents */}
            {pathfinder.documents.length > 0 && (
              <Section title="Documents">
                <div className="flex flex-wrap gap-3">
                  {pathfinder.documents.map((doc, i) => (
                    <a
                      key={doc.id ?? i}
                      href={doc.document || doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#E0C6FF] text-[#6A00B1] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#D0B6FF] transition-colors"
                    >
                      <i className="fa fa-file-o" />
                      {doc.document_name || doc.name || "Document"}
                    </a>
                  ))}
                </div>
              </Section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PathfinderProfile;
