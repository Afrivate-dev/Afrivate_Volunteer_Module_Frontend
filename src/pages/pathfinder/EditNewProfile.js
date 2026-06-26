import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Camera, Edit2, BookOpen, Award, FileText } from "lucide-react";
import NavBar from "../../components/auth/Navbar";
import { useUser } from "../../context/UserContext";
import { profile, getApiErrorMessage } from "../../services/api";
import { syncSocialLinksRestApi, socialLinksHaveRestIds } from "../../utils/syncSocialLinks";
import {
  buildPathfinderBaseDetails,
  buildPathfinderProfileBody,
  normalizeSocialLink,
} from "../../utils/pathfinderProfilePayload";


const EditNewProfile = () => {
  const navigate = useNavigate();
  const { refetchUser } = useUser();
  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);
  // Snapshot of social links as loaded from the server; used as "previous" state
  // for syncSocialLinksRestApi so we can diff additions, changes, and deletions.
  const initialSocialLinksRef = useRef([]);
  // useRef (not useState) so the value is always current inside handleSave() without
  // causing extra re-renders and without the stale-closure problem during the countdown.
  const isFirstSaveRef = useRef(true);

  useEffect(() => {
    document.title = "Edit Profile - AfriVate";
  }, []);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    other_name: "",
    title: "",
    about: "",
    work_experience: "",
    languages: "",
    gmail: "",
    // base_details
    bio: "",
    contact_email: "",
    phone_number: "",
    address: "",
    state: "",
    country: "",
    website: "",
  });

  const [skills, setSkills] = useState([]);
  const [educations, setEducations] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loadedBaseDetailsId, setLoadedBaseDetailsId] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [photoUploadError, setPhotoUploadError] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profile.pathfinderGet();
      if (data) {
        // Profile has real data if any name/title/about/email field is non-empty
        const hasData = !!(data.first_name || data.last_name || data.title || data.about || data.base_details?.contact_email);
        if (hasData) isFirstSaveRef.current = false;
        if (!hasData) setIsPreviewMode(false);
        const base = data.base_details || {};
        if (base.id != null) setLoadedBaseDetailsId(base.id);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          other_name: data.other_name || "",
          title: data.title || "",
          about: data.about || "",
          work_experience: data.work_experience || "",
          languages: data.languages || "",
          gmail: data.gmail || "",
          bio: base.bio || "",
          contact_email: base.contact_email || "",
          phone_number: base.phone_number || "",
          address: base.address || "",
          state: base.state || "",
          country: base.country || "",
          website: base.website || "",
        });
        
        // Load skills and expertise from backend (API may return [{ name: "X" }] or ["X"])
        if (Array.isArray(data.skills)) setSkills(data.skills.map(s => (typeof s === "string" ? s : s?.name || s?.skill || "")).filter(Boolean));
        if (Array.isArray(data.educations)) setEducations(data.educations.map(e => (typeof e === "string" ? e : e?.name || e?.institution || "")).filter(Boolean));
        if (Array.isArray(data.certifications)) setCertifications(data.certifications.map(c => (typeof c === "string" ? c : c?.name || c?.title || "")).filter(Boolean));
        if (Array.isArray(data.social_links)) {
          const sl = data.social_links.map((l) => normalizeSocialLink(l)).filter(Boolean);
          setSocialLinks(sl);
          initialSocialLinksRef.current = JSON.parse(JSON.stringify(sl));
        }
      }
      try {
        const picData = await profile.pictureGet();
        if (picData && picData.profile_pic) setProfilePhotoUrl(picData.profile_pic);
      } catch (_) {}
      try {
        const credList = await profile.credentialsList();
        const credsArray = Array.isArray(credList) ? credList : credList?.results || [];
        setCredentials(credsArray);
      } catch (_) {}
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      navigate("/pathf");
      return;
    }
    const t = setTimeout(() => setRedirectCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [redirectCountdown, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setPhotoUploadError(null);
    const reader = new FileReader();
    reader.onload = () => setProfilePhotoUrl(reader.result);
    reader.readAsDataURL(file);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("profile_pic", file);
      await profile.picturePatch(formDataToSend);
    } catch (err) {
      setPhotoUploadError(getApiErrorMessage(err) || "Failed to upload picture.");
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentFile) return;
    setUploadingDoc(true);
    setDocUploadError(null);
    try {
      const fd = new FormData();
      fd.append("document_name", documentFile.name || "Document");
      fd.append("document", documentFile);
      await profile.credentialsCreate(fd);
      const credList = await profile.credentialsList();
      setCredentials(Array.isArray(credList) ? credList : credList?.results || []);
      setDocumentFile(null);
      if (documentInputRef.current) documentInputRef.current.value = "";
    } catch (err) {
      setDocUploadError(getApiErrorMessage(err) || "Failed to upload document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteCredential = async (id) => {
    try {
      await profile.credentialsDelete(id);
      setCredentials((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err) || "Failed to remove document.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const wasFirstSave = isFirstSaveRef.current;

    const first = (formData.first_name || "").trim() || "User";
    const last = (formData.last_name || "").trim();
    if (!last) {
      setError("Last name is required.");
      setSaving(false);
      return;
    }
    const contactEmail = (formData.contact_email || "").trim();
    const address = (formData.address || "").trim();
    const state = (formData.state || "").trim();
    const country = (formData.country || "").trim();
    if (!contactEmail || !address || !state || !country) {
      setError("Email, Address, State and Country are required in Contact Information.");
      setSaving(false);
      return;
    }

    try {
      const baseDetails = buildPathfinderBaseDetails({
        bio: formData.bio,
        contact_email: contactEmail,
        phone_number: formData.phone_number,
        address,
        state,
        country,
        website: formData.website,
        id: loadedBaseDetailsId != null ? loadedBaseDetailsId : undefined,
      });

      const normalizedForSync = (socialLinks || [])
        .map((l) => normalizeSocialLink(l))
        .filter(Boolean);
      // If the server returned social links with `id` fields they must be managed
      // via individual REST endpoints (/profile/social-links/<id>/) rather than
      // embedded in the profile body, which only works for brand-new links.
      const useRest =
        socialLinksHaveRestIds(initialSocialLinksRef.current) ||
        socialLinksHaveRestIds(normalizedForSync);

      const profileData = buildPathfinderProfileBody({
        first_name: first,
        last_name: last,
        other_name: formData.other_name,
        title: formData.title,
        about: formData.about,
        work_experience: formData.work_experience,
        languages: formData.languages,
        gmail: formData.gmail,
        base_details: baseDetails,
        social_links: Array.isArray(socialLinks) ? socialLinks : [],
        skills,
        educations,
        certifications,
      });
      if (useRest) {
        delete profileData.social_links;
      }

      // Backend uses get_or_create on PATCH — single call handles both first save and updates.
      const savedData = await profile.pathfinderPatch(profileData);

      if (useRest) {
        await syncSocialLinksRestApi(initialSocialLinksRef.current, normalizedForSync);
        // Re-fetch social links to capture server-assigned IDs for future saves.
        try {
          const freshLinks = await profile.socialLinksList();
          if (Array.isArray(freshLinks)) {
            const sl = freshLinks.map((l) => normalizeSocialLink(l)).filter(Boolean);
            setSocialLinks(sl);
            initialSocialLinksRef.current = JSON.parse(JSON.stringify(sl));
          }
        } catch (_) {}
      } else if (Array.isArray(savedData?.social_links)) {
        const sl = savedData.social_links.map((l) => normalizeSocialLink(l)).filter(Boolean);
        setSocialLinks(sl);
        initialSocialLinksRef.current = JSON.parse(JSON.stringify(sl));
      }

      // Persist any inline credential name edits
      await Promise.all(
        credentials
          .filter((c) => c.id != null)
          .map((c) =>
            profile.credentialsPatch(c.id, { document_name: c.document_name ?? c.name ?? "" }).catch(() => {})
          )
      );

      await refetchUser();
      isFirstSaveRef.current = false;
      setError(null);
      setSuccessMessage("Profile saved successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
      setIsPreviewMode(true);
      // Only start the countdown after the very first profile save so returning
      // users are not redirected every time they update their profile.
      if (wasFirstSave) {
        setRedirectCountdown(5);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(getApiErrorMessage(err) || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  const [newSkill, setNewSkill] = useState("");
  const [newEducation, setNewEducation] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const addSkill = () => {
    const v = (newSkill || "").trim();
    if (v) {
      setSkills([...skills, v]);
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    const v = (newEducation || "").trim();
    if (v) {
      setEducations([...educations, v]);
      setNewEducation("");
    }
  };

  const removeEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    const v = (newCertification || "").trim();
    if (v) {
      setCertifications([...certifications, v]);
      setNewCertification("");
    }
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform_name: "", platform_url: "" }]);
  };

  const updateSocialLink = (index, field, value) => {
    setSocialLinks((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { platform_name: "", platform_url: "" };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeSocialLink = (index) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans relative">
        <NavBar />
        <div className="pt-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8D4087] border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isPreviewMode) {
    const displayName = [formData.first_name, formData.last_name, formData.other_name]
      .filter(Boolean).join(" ") || "Pathfinder";
    const PreviewSection = ({ title, children }) => (
      <div className="mb-6">
        <h2 className="text-base font-bold text-[#8D4087] uppercase tracking-wide mb-3 pb-1 border-b border-gray-200">
          {title}
        </h2>
        {children}
      </div>
    );
    const PreviewField = ({ label, value }) =>
      value ? (
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase mb-0.5">{label}</p>
          <p className="text-gray-800 text-sm whitespace-pre-wrap">{value}</p>
        </div>
      ) : null;
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans">
        <NavBar />
        <div className="pt-16">

          {/* Notifications */}
          {(successMessage || (redirectCountdown !== null && redirectCountdown > 0)) && (
            <div className="max-w-4xl mx-auto px-8 pt-4">
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-2 text-sm">
                  {successMessage}
                </div>
              )}
              {redirectCountdown !== null && redirectCountdown > 0 && (
                <div className="bg-purple-50 border border-purple-200 text-[#651F5F] px-4 py-3 rounded-xl mb-2 text-sm">
                  Redirecting to your dashboard in {redirectCountdown}s…
                </div>
              )}
            </div>
          )}

          {/* Purple gradient header */}
          <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
            <div className="max-w-4xl mx-auto flex items-start gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex-shrink-0 flex items-center justify-center border-2 border-white/30">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">{displayName.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white mb-0.5">{displayName}</h1>
                {formData.title && <p className="text-purple-200 text-sm mb-1">{formData.title}</p>}
                {formData.bio && <p className="text-purple-300 text-xs italic">{formData.bio}</p>}
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className="shrink-0 bg-white text-[#651F5F] px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors"
              >
                <Edit2 size={14} className="inline mr-1" />Edit profile
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

              {(formData.contact_email || formData.phone_number || formData.website) && (
                <PreviewSection title="Contact Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PreviewField label="Email" value={formData.contact_email} />
                    <PreviewField label="Phone" value={formData.phone_number} />
                    <PreviewField label="Website" value={formData.website} />
                  </div>
                </PreviewSection>
              )}

              {(formData.address || formData.state || formData.country || formData.languages) && (
                <PreviewSection title="Location">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PreviewField label="Address" value={formData.address} />
                    <PreviewField label="State" value={formData.state} />
                    <PreviewField label="Country" value={formData.country} />
                    <PreviewField label="Languages" value={formData.languages} />
                  </div>
                </PreviewSection>
              )}

              {(formData.about || formData.work_experience) && (
                <PreviewSection title="About">
                  <div className="space-y-4">
                    <PreviewField label="About" value={formData.about} />
                    <PreviewField label="Work Experience" value={formData.work_experience} />
                  </div>
                </PreviewSection>
              )}

              {skills.length > 0 && (
                <PreviewSection title="Skills">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span key={i} className="bg-purple-100 text-[#8D4087] px-3 py-1 rounded-full text-sm font-medium">{s}</span>
                    ))}
                  </div>
                </PreviewSection>
              )}

              {educations.length > 0 && (
                <PreviewSection title="Education">
                  <ul className="space-y-1.5">
                    {educations.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                        <BookOpen size={14} className="text-[#8D4087] mt-0.5 shrink-0" /> {e}
                      </li>
                    ))}
                  </ul>
                </PreviewSection>
              )}

              {certifications.length > 0 && (
                <PreviewSection title="Certifications">
                  <ul className="space-y-1.5">
                    {certifications.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                        <Award size={14} className="text-[#8D4087] mt-0.5 shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </PreviewSection>
              )}

              {socialLinks.filter(l => l.platform_url).length > 0 && (
                <PreviewSection title="Social Links">
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.filter(l => l.platform_url).map((l, i) => (
                      <a key={i} href={l.platform_url} target="_blank" rel="noopener noreferrer"
                        className="bg-purple-50 text-[#8D4087] px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors">
                        {l.platform_name || l.platform_url}
                      </a>
                    ))}
                  </div>
                </PreviewSection>
              )}

              {credentials.filter(c => c.document).length > 0 && (
                <PreviewSection title="Documents">
                  <div className="flex flex-wrap gap-2">
                    {credentials.filter(c => c.document).map((cred) => (
                      <a key={cred.id} href={cred.document} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-purple-100 text-[#651F5F] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-200 transition-colors">
                        <FileText size={14} className="shrink-0" /> {cred.document_name || cred.name || "Document"}
                      </a>
                    ))}
                  </div>
                </PreviewSection>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white";
  const sectionCls = "mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6";

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <NavBar />

      <div className="pt-16">
        {/* Purple header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-0.5">Pathfinder Profile Setup</h1>
            <p className="text-purple-200 text-sm">Complete your profile to get started on your volunteering journey.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {successMessage}
              </div>
            )}

            {/* Profile Picture and Basic Info */}
            <div className={sectionCls}>
              <div className="flex items-center gap-5 mb-6">
                <div className="relative flex-shrink-0">
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  <button type="button" onClick={() => photoInputRef.current?.click()}
                    className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 relative flex items-center justify-center border-2 border-gray-200 hover:border-[#8D4087] transition-colors focus:outline-none">
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                    <span className="absolute bottom-0 right-0 w-6 h-6 bg-[#8D4087] rounded-full flex items-center justify-center text-white"><Camera size={12} /></span>
                  </button>
                  {photoUploadError && <p className="text-red-500 text-xs mt-1">{photoUploadError}</p>}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Profile Photo</p>
                  <p className="text-xs text-gray-400">Click to upload. PNG or JPG recommended.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">First Name *</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="First Name" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Last Name *</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Last Name" className={inputCls} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1.5">Title / Role</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Software Engineer" className={inputCls} />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className={sectionCls}>
              <h2 className="font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Email *</label>
                  <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} placeholder="your@email.com" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Phone Number</label>
                  <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="+234..." className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Country</label>
                  <div className="relative">
                    <select name="country" value={formData.country} onChange={handleInputChange} className={inputCls + " appearance-none pr-8"}>
                      <option value="">Select Country</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Ghana">Ghana</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Other">Other</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Website</label>
                  <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://portfolio.com" className={inputCls} />
                </div>
              </div>
            </div>

            {/* About + Work Experience */}
            <div className={sectionCls}>
              <h2 className="font-bold text-gray-900 mb-1">About</h2>
              <p className="text-sm text-gray-400 mb-3">Share some details about yourself, your expertise, and what you offer.</p>
              <textarea name="about" value={formData.about} onChange={handleInputChange} placeholder="Tell us about yourself..." rows={4}
                className={inputCls + " resize-none mb-4"} />
              <h2 className="font-bold text-gray-900 mb-1">Work Experience</h2>
              <textarea name="work_experience" value={formData.work_experience} onChange={handleInputChange} placeholder="Describe your work experience..." rows={4}
                className={inputCls + " resize-none"} />
            </div>

            {/* Languages */}
            <div className={sectionCls}>
              <h2 className="font-bold text-gray-900 mb-3">Languages</h2>
              <input type="text" name="languages" value={formData.languages} onChange={handleInputChange} placeholder="e.g. English, French, Yoruba" className={inputCls} />
            </div>

            {/* Skills */}
            <div className={sectionCls}>
              <h2 className="font-bold text-gray-900 mb-1">Skills and Expertise</h2>
              <p className="text-sm text-gray-400 mb-3">Add your skills and areas of expertise.</p>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, index) => (
                    <span key={index} className="bg-purple-100 text-[#8D4087] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
                      {typeof skill === "string" ? skill : skill?.name || ""}
                      <button type="button" onClick={() => removeSkill(index)} className="text-[#8D4087] hover:text-red-500 text-xs font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="e.g. JavaScript, Project Management" className={inputCls + " flex-1"} />
                <button type="button" onClick={addSkill} className="shrink-0 text-[#8D4087] text-sm font-semibold border border-[#8D4087] px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors">
                  + Add
                </button>
              </div>
            </div>

            {/* Education */}
            <div className={sectionCls}>
              <h2 className="font-bold text-gray-900 mb-1">Education</h2>
              <p className="text-sm text-gray-400 mb-3">Add institutions or degrees (e.g. BSc Computer Science, University of Lagos)</p>
              {educations.length > 0 && (
                <div className="space-y-2 mb-3">
                  {educations.map((edu, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl flex items-center justify-between">
                      <span className="text-gray-700 text-sm">{typeof edu === "string" ? edu : edu?.name || edu?.institution || ""}</span>
                      <button type="button" onClick={() => removeEducation(index)} className="text-gray-400 hover:text-red-500 text-lg ml-3">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input type="text" value={newEducation} onChange={(e) => setNewEducation(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEducation())}
                  placeholder="e.g. BSc Computer Science, University of Lagos" className={inputCls + " flex-1"} />
                <button type="button" onClick={addEducation} className="shrink-0 text-[#8D4087] text-sm font-semibold border border-[#8D4087] px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors">
                  + Add
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div className={sectionCls}>
              <h2 className="font-bold text-gray-900 mb-1">Certifications</h2>
              <p className="text-sm text-gray-400 mb-3">Add professional certifications (e.g. AWS Certified, PMP)</p>
              {certifications.length > 0 && (
                <div className="space-y-2 mb-3">
                  {certifications.map((cert, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl flex items-center justify-between">
                      <span className="text-gray-700 text-sm">{typeof cert === "string" ? cert : cert?.name || cert?.title || ""}</span>
                      <button type="button" onClick={() => removeCertification(index)} className="text-gray-400 hover:text-red-500 text-lg ml-3">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input type="text" value={newCertification} onChange={(e) => setNewCertification(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                  placeholder="e.g. AWS Certified Solutions Architect, PMP" className={inputCls + " flex-1"} />
                <button type="button" onClick={addCertification} className="shrink-0 text-[#8D4087] text-sm font-semibold border border-[#8D4087] px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors">
                  + Add
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className={sectionCls}>
              <h2 className="font-bold text-gray-900 mb-1">Social Links</h2>
              <p className="text-sm text-gray-400 mb-3">Add your professional links (e.g. LinkedIn, GitHub, Portfolio)</p>
              <div className="space-y-2 mb-3">
                {socialLinks.map((link, index) => (
                  <div key={link.id != null ? `sl-${link.id}` : `sl-new-${index}`} className="flex gap-2 items-center">
                    <input type="text" value={link.platform_name || ""} onChange={(e) => updateSocialLink(index, "platform_name", e.target.value)}
                      placeholder="Platform" className="w-32 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white shrink-0" />
                    <input type="url" value={link.platform_url || ""} onChange={(e) => updateSocialLink(index, "platform_url", e.target.value)}
                      placeholder="https://..." className={inputCls + " flex-1"} />
                    <button type="button" onClick={() => removeSocialLink(index)} className="text-gray-400 hover:text-red-500 text-xl shrink-0">×</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addSocialLink} className="text-[#8D4087] text-sm font-semibold hover:underline flex items-center gap-1">
                + Add social link
              </button>
            </div>

            {/* Documents / Credentials */}
            <div className={sectionCls}>
              <h2 className="font-bold text-gray-900 mb-1">Documents</h2>
              <p className="text-sm text-gray-400 mb-4">Upload your CV, certificates, or other credentials (PDF or image).</p>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-3 mb-4">
                <input ref={documentInputRef} type="file" accept=".pdf,.png,.jpeg,.jpg,.jfif,.webp"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#651F5F] file:text-white file:cursor-pointer flex-1" />
                <button type="button" onClick={handleDocumentUpload} disabled={!documentFile || uploadingDoc}
                  className="shrink-0 bg-[#651F5F] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#4a1647] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {uploadingDoc ? "Uploading..." : "Upload"}
                </button>
                {documentFile && (
                  <button type="button" onClick={() => { setDocumentFile(null); if (documentInputRef.current) documentInputRef.current.value = ""; }}
                    className="text-gray-400 hover:text-gray-700 text-sm">Cancel</button>
                )}
              </div>
              {docUploadError && <p className="text-red-500 text-sm mb-3">{docUploadError}</p>}

              {credentials.length > 0 && (
                <ul className="space-y-2">
                  {credentials.map((cred) => (
                    <li key={cred.id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl">
                      <input type="text" value={cred.document_name ?? cred.name ?? ""}
                        onChange={(e) => setCredentials((prev) => prev.map((c) => c.id === cred.id ? { ...c, document_name: e.target.value } : c))}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8D4087]" placeholder="Document name" />
                      <div className="flex items-center gap-3 shrink-0">
                        {cred.document && (
                          <a href={cred.document} target="_blank" rel="noopener noreferrer" className="text-[#8D4087] text-sm hover:underline">View</a>
                        )}
                        <button type="button" onClick={() => handleDeleteCredential(cred.id)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Save / Preview */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button type="button" onClick={() => setIsPreviewMode(true)}
                className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                Preview
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-8 py-3 rounded-xl bg-[#651F5F] text-white font-semibold text-sm hover:bg-[#4a1647] transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Save profile"}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditNewProfile;

