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
      // 1) View single: GET /api/bookmark/applicants/saved/{pathfinder_id}/
      try {
        await bookmarks.applicantsSavedGet(pathfinderId);
        setIsBookmarked(true);
        setBookmarkId(null);
        return;
      } catch (_) {
        /* fall through to list */
      }

      // 2) List: GET /api/bookmark/applicants/saved/
      const saved = await bookmarks.applicantsSavedList();
      const list = Array.isArray(saved) ? saved : saved?.results || [];
      const idStr = String(pathfinderId);
      const inApplicantsSaved = list.some((row) => {
        const pid =
          row.pathfinder_id ?? row.pathfinder ?? row.pathfinder?.id;
        return pid != null && String(pid) === idStr;
      });
      if (inApplicantsSaved) {
        setIsBookmarked(true);
        setBookmarkId(null);
        return;
      }

      // 3) Legacy generic bookmarks (non–applicants-saved)
      let myEnablerId = enablerIdRef.current;
      if (!myEnablerId) {
        try {
          const me = await profile.enablerGet();
          if (me && me.id != null) {
            myEnablerId = me.id;
            setEnablerId(me.id);
          }
        } catch (_) {
          // ignore - bookmark check will still try to match by pathfinder alone
        }
      }

      const bookmarksList = await bookmarks.list();
      const arr = Array.isArray(bookmarksList) ? bookmarksList : bookmarksList?.results || [];
      const foundBookmark = arr.find((b) =>
        b.pathfinder && String(b.pathfinder) === String(pathfinderId) &&
        (!myEnablerId || String(b.enabler) === String(myEnablerId)));
      if (foundBookmark) {
        setIsBookmarked(true);
        setBookmarkId(foundBookmark.id);
      } else {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } catch (err) {
      console.error('Error checking bookmark status:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        
        // If viewing an applicant within an opportunity context, use the applicant profile endpoint
        if (opportunityId) {
          try {
            // Use the opportunity ID to fetch applicant profile
            data = await opportunities.getApplicant(opportunityId, id);
          } catch (err) {
            console.log("Could not fetch applicant profile, using regular pathfinder profile:", err);
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
          const role = data.title || "Pathfinder";
          const locationParts = [base.address, base.state, base.country].filter(Boolean);
          const location = locationParts.join(", ");
          const languages = data.languages || "";
          const about = data.about || base.bio || "";
          const skills = Array.isArray(data.skills)
            ? data.skills
                .map((s) =>
                  typeof s === "string" ? s : s?.name || s?.skill || ""
                )
                .filter(Boolean)
            : [];
          const education = Array.isArray(data.educations)
            ? data.educations
                .map((e) =>
                  typeof e === "string"
                    ? e
                    : e?.name || e?.institution || e?.degree || ""
                )
                .filter(Boolean)
            : [];
          const certifications = Array.isArray(data.certifications)
            ? data.certifications
                .map((c) =>
                  typeof c === "string"
                    ? c
                    : c?.name || c?.title || c?.certificate || ""
                )
                .filter(Boolean)
            : [];
          const workExperience = data.work_experience
            ? [data.work_experience]
            : [];
          const email = base.contact_email || data.gmail || "";

          setPathfinder({
            id: data.id,
            name,
            role,
            location,
            languages,
            about,
            skills,
            education,
            certifications,
            workExperience,
            email,
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
        console.error('Error toggling applicant bookmark:', err, err?.body || null);
      }
      return;
    }

    if (isBookmarked && bookmarkId) {
      try {
        await bookmarks.delete(bookmarkId);
        setIsBookmarked(false);
        setBookmarkId(null);
      } catch (err) {
        console.error('Error removing bookmark:', err);
      }
    } else {
      try {
        // Ensure we include the enabler id in the payload so backend can validate ownership
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
        console.error('Error creating bookmark:', err, err?.body || err?.response || null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-gray-500">Loading profile...</p>
          </div>
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
              onClick={() => navigate('/enabler/recommendations')}
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
      
      {/* Main Content */}
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Actions */}
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={handleBookmark}
              className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-purple-50 border-purple-300 hover:bg-purple-100' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
            >
              {isBookmarked ? (
                <i className="fa fa-bookmark text-[#6A00B1] text-lg"></i>
              ) : (
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                  style={{ color: '#6A00B1' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
            {pathfinder.email && (
              <a
                href={`mailto:${pathfinder.email}`}
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-[#5A0091] transition-colors"
              >
                Contact
              </a>
            )}
          </div>

          {/* Profile Header Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Profile Picture */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fa fa-user text-5xl md:text-6xl text-gray-400"></i>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                {pathfinder.name}
              </h1>
              <p className="text-gray-700 text-base md:text-lg mb-3">
                {pathfinder.role}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm md:text-base text-gray-600">
                <div className="flex items-center gap-2">
                  <i className="fa fa-map-marker text-[#6A00B1]"></i>
                  <span>{pathfinder.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{pathfinder.languages}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content Sections */}
          <div className="space-y-6">
            
            {/* About Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3">
                About
              </h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {pathfinder.about}
              </p>
            </div>

            {/* Skills and Expertise Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
                Skills and Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {pathfinder.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-[#6A00B1] text-white px-4 py-2 rounded-full text-xs md:text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Work Experience Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3">
                Work Experience
              </h2>
              {pathfinder.workExperience.length > 0 ? (
                <div className="space-y-4">
                  {pathfinder.workExperience.map((exp, index) => (
                    <div key={index} className="text-gray-700 text-sm md:text-base">
                      {/* Work experience items would go here */}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm md:text-base italic">
                  Add your job history and achievements to give clients insight into your expertise.
                </p>
              )}
            </div>

            {/* Education Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3">
                Education
              </h2>
              {pathfinder.education.length > 0 ? (
                <div className="space-y-4">
                  {pathfinder.education.map((edu, index) => (
                    <div key={index} className="text-gray-700 text-sm md:text-base">
                      {/* Education items would go here */}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm md:text-base italic">
                  Back up your skills by adding any educational degrees or programs.
                </p>
              )}
            </div>

            {/* Certification Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3">
                Certification
              </h2>
              {pathfinder.certifications.length > 0 ? (
                <div className="space-y-4">
                  {pathfinder.certifications.map((cert, index) => (
                    <div key={index} className="text-gray-700 text-sm md:text-base">
                      {/* Certification items would go here */}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm md:text-base italic">
                  Showcase your mastery with certification earned in your field.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathfinderProfile;
