import React, { useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { document.title = "Pathfinder Profile - AfriVate"; }, []);

  const checkBookmarkStatus = useCallback(async (pathfinderUserId) => {
    try {
      const saved = await bookmarks.applicantsSavedList();
      const list = Array.isArray(saved) ? saved : saved?.results || [];
      const idStr = String(pathfinderUserId);
      const found = list.some((row) => {
        const pid = row.pathfinder_user_id ?? row.pathfinder_id ?? row.pathfinder ?? row.pathfinder?.id;
        return pid != null && String(pid) === idStr;
      });
      setIsBookmarked(found);
    } catch (err) { console.error("Error checking bookmark status:", err); }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (opportunityId) {
          try { data = await opportunities.getApplicant(opportunityId, id); } catch (_) { data = await profile.pathfinderGetById(id); }
        } else {
          data = await profile.pathfinderGetById(id);
        }
        if (data) {
          const base = data.base_details || {};
          const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.name || base.contact_email || "Pathfinder";
          const skills = Array.isArray(data.skills) ? data.skills.map((s) => (typeof s === "string" ? s : s?.name || s?.skill || "")).filter(Boolean) : [];
          const educations = Array.isArray(data.educations) ? data.educations.map((e) => (typeof e === "string" ? e : e?.name || e?.institution || e?.degree || "")).filter(Boolean) : [];
          const certifications = Array.isArray(data.certifications) ? data.certifications.map((c) => (typeof c === "string" ? c : c?.name || c?.title || c?.certificate || "")).filter(Boolean) : [];
          const socialLinks = Array.isArray(data.social_links) ? data.social_links.filter((l) => l?.platform_url) : [];
          const documents = Array.isArray(data.credentials) ? data.credentials.filter((c) => c?.document) : Array.isArray(data.documents) ? data.documents.filter((d) => d?.document || d?.url) : [];
          const profilePic = data.profile_pic || base.profile_pic || null;
          setPathfinder({
            id: data.id, name, profilePic, title: data.title || "", bio: base.bio || "",
            contactEmail: base.contact_email || data.gmail || "", phone: base.phone_number || "",
            gmail: data.gmail || "", website: base.website || "", address: base.address || "",
            state: base.state || "", country: base.country || "", languages: data.languages || "",
            about: data.about || base.bio || "", workExperience: data.work_experience || "",
            skills, educations, certifications, socialLinks, documents,
          });
          if (id != null) await checkBookmarkStatus(id);
        } else { setPathfinder(null); }
      } catch (err) {
        console.error("Error loading pathfinder profile:", err);
        setError("Could not load pathfinder profile.");
        setPathfinder(null);
      } finally { setLoading(false); }
    };
    if (id) load();
  }, [id, opportunityId, checkBookmarkStatus]);

  const handleBookmark = async () => {
    if (!id) return;
    try {
      if (isBookmarked) {
        await bookmarks.applicantsSavedDelete(Number(id));
        setIsBookmarked(false);
      } else {
        const payload = { pathfinder_id: Number(id) };
        const oppId = location.state?.opportunityId;
        if (oppId != null && oppId !== "") payload.opportunity_id = Number(oppId);
        await bookmarks.applicantsSavedCreate(payload);
        setIsBookmarked(true);
      }
    } catch (err) { console.error("Error toggling bookmark:", err); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" /></div>
      </div>
    );
  }

  if (!pathfinder) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-20 text-center">
          <p className="text-gray-500 mb-4">{error || "No pathfinder profile found."}</p>
          <button onClick={() => navigate("/enabler/recommendations")} className="text-[#8D4087] font-semibold hover:underline">Back to recommendations</button>
        </div>
      </div>
    );
  }

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h2 className="text-xs font-bold text-[#8D4087] uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );

  const Field = ({ label, value }) =>
    value ? (
      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">{label}</p>
        <p className="text-gray-800 text-sm whitespace-pre-wrap">{value}</p>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-5 hover:bg-white/30 transition-colors">
              ← Back
            </button>
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
                {pathfinder.profilePic ? (
                  <img src={pathfinder.profilePic} alt={pathfinder.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">{pathfinder.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white mb-0.5">{pathfinder.name}</h1>
                {pathfinder.title && <p className="text-purple-200 text-sm mb-1">{pathfinder.title}</p>}
                {pathfinder.bio && <p className="text-purple-300 text-xs italic">{pathfinder.bio}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={handleBookmark} title={isBookmarked ? "Remove bookmark" : "Save"}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-colors ${
                    isBookmarked ? "bg-white border-white text-[#8D4087]" : "bg-transparent border-white/50 text-white hover:border-white"
                  }`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
                <button onClick={() => navigate(`/enabler/contact/${id}`)}
                  className="bg-white text-[#651F5F] px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {(pathfinder.contactEmail || pathfinder.phone || pathfinder.website) && (
              <Section title="Contact Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Email" value={pathfinder.contactEmail} />
                  <Field label="Phone" value={pathfinder.phone} />
                  <Field label="Website" value={pathfinder.website} />
                </div>
              </Section>
            )}
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
            {(pathfinder.about || pathfinder.workExperience) && (
              <Section title="About">
                <div className="space-y-4">
                  <Field label="About" value={pathfinder.about} />
                  <Field label="Work Experience" value={pathfinder.workExperience} />
                </div>
              </Section>
            )}
            {pathfinder.skills.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {pathfinder.skills.map((s, i) => (
                    <span key={i} className="bg-purple-100 text-[#8D4087] px-3 py-1 rounded-full text-sm font-medium">{s}</span>
                  ))}
                </div>
              </Section>
            )}
            {pathfinder.educations.length > 0 && (
              <Section title="Education">
                <ul className="space-y-1">
                  {pathfinder.educations.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2" class="mt-0.5 shrink-0"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> {e}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {pathfinder.certifications.length > 0 && (
              <Section title="Certifications">
                <ul className="space-y-1">
                  {pathfinder.certifications.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2" class="mt-0.5 shrink-0"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> {c}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {pathfinder.socialLinks.length > 0 && (
              <Section title="Social Links">
                <div className="flex flex-wrap gap-2">
                  {pathfinder.socialLinks.map((l, i) => (
                    <a key={i} href={l.platform_url} target="_blank" rel="noopener noreferrer"
                      className="bg-purple-50 text-[#8D4087] px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors">
                      {l.platform_name || l.platform_url}
                    </a>
                  ))}
                </div>
              </Section>
            )}
            {pathfinder.documents.length > 0 && (
              <Section title="Documents">
                <div className="flex flex-wrap gap-2">
                  {pathfinder.documents.map((doc, i) => (
                    <a key={doc.id ?? i} href={doc.document || doc.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-purple-100 text-[#651F5F] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-200 transition-colors">
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
