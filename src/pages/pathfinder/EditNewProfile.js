import React, { useState, useEffect, useCallback, useRef } from "react";
import NavBar from "../../components/auth/Navbar";
import { profile, getApiErrorMessage } from "../../services/api";
import {
  buildPathfinderBaseDetails,
  buildPathfinderProfileBody,
  stripBaseDetailsId,
  normalizeSocialLink,
} from "../../utils/pathfinderProfilePayload";

function extractSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = {};
  let current = null;
  lines.forEach((raw) => {
    const line = raw.trim();
    const lower = line.toLowerCase();
    if (lower.startsWith("work experience")) {
      current = "work_experience";
      sections[current] = [];
      return;
    }
    if (lower.startsWith("education")) {
      current = "educations";
      sections[current] = [];
      return;
    }
    if (lower.startsWith("certification") || lower.startsWith("certifications")) {
      current = "certifications";
      sections[current] = [];
      return;
    }
    if (current) {
      if (/^[A-Z][A-Za-z ]+:$/.test(line) && !line.includes("@")) {
        current = null;
        return;
      }
      if (line) sections[current].push(line);
    }
  });
  return sections;
}

const EditNewProfile = () => {
  const photoInputRef = useRef(null);

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
  const [loadedProfileId, setLoadedProfileId] = useState(null);
  const [loadedBaseDetailsId, setLoadedBaseDetailsId] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState(null);
  const [currentCvUrl, setCurrentCvUrl] = useState(null);
  const [currentCvName, setCurrentCvName] = useState(null);

  const parseResumeFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (typeof text !== "string") return;
      const sec = extractSections(text);
      if (sec.work_experience && sec.work_experience.length) {
        setFormData((prev) => {
          if (prev.work_experience) return prev;
          return { ...prev, work_experience: sec.work_experience.join("\n") };
        });
      }
      if (sec.educations && sec.educations.length) {
        setEducations((prev) => {
          const additions = sec.educations.filter((e) => !prev.includes(e));
          return [...prev, ...additions];
        });
      }
      if (sec.certifications && sec.certifications.length) {
        setCertifications((prev) => {
          const additions = sec.certifications.filter((c) => !prev.includes(c));
          return [...prev, ...additions];
        });
      }
    };
    reader.readAsText(file);
  }, []);

  useEffect(() => {
    if (cvFile) {
      parseResumeFile(cvFile);
    }
  }, [cvFile, parseResumeFile]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profile.pathfinderGet();
      if (data) {
        if (data.id != null) setLoadedProfileId(data.id);
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
          setSocialLinks(
            data.social_links
              .map((l) => {
                const n = normalizeSocialLink(l);
                if (n) return n;
                if (l && typeof l === "object") {
                  return {
                    platform_name: String(
                      l.platform_name ?? l.platform ?? l.name ?? ""
                    ).trim(),
                    platform_url: String(
                      l.platform_url ?? l.url ?? l.link ?? ""
                    ).trim(),
                  };
                }
                return null;
              })
              .filter((l) => l && (l.platform_name || l.platform_url))
          );
        }
      }
      try {
        const picData = await profile.pictureGet();
        if (picData && picData.profile_pic) setProfilePhotoUrl(picData.profile_pic);
      } catch (_) {}
      try {
        const credList = await profile.credentialsList();
        const credsArray = Array.isArray(credList) ? credList : credList?.results || [];

        // Find and set the current CV
        const cvCred = credsArray.find((c) => 
          (c.document_name || c.name || "").toLowerCase().includes("cv")
        );
        
        if (cvCred && cvCred.document) {
          setCurrentCvUrl(cvCred.document);
          setCurrentCvName(cvCred.document_name || cvCred.name || "CV");
        }
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

  const handleCvUpload = async () => {
    if (!cvFile) return;
    setUploadingCv(true);
    setError(null);
    try {
      // First, find and delete any existing CV
      const credList = await profile.credentialsList();
      const existingCreds = Array.isArray(credList) ? credList : credList?.results || [];
      
      for (const cred of existingCreds) {
        if ((cred.document_name || cred.name || "").toLowerCase().includes("cv")) {
          try {
            await profile.credentialsDelete(cred.id);
          } catch (deleteErr) {
            // Continue even if delete fails
            console.log("Could not delete old CV:", deleteErr);
          }
        }
      }
      
      // Now upload the new CV
      const fd = new FormData();
      fd.append("document_name", "CV");
      fd.append("document", cvFile);
      await profile.credentialsCreate(fd);
      
      // Clear the file input
      setCvFile(null);
      
      // Reload credentials to get the new CV
      const newCredList = await profile.credentialsList();
      const newCreds = Array.isArray(newCredList) ? newCredList : newCredList?.results || [];

      // Find and set the new CV URL
      const newCvCred = newCreds.find((c) => 
        (c.document_name || c.name || "").toLowerCase().includes("cv")
      );
      
      if (newCvCred && newCvCred.document) {
        setCurrentCvUrl(newCvCred.document);
        setCurrentCvName(newCvCred.document_name || newCvCred.name || "CV");
      }
    } catch (err) {
      setError(getApiErrorMessage(err) || "Failed to upload CV.");
    } finally {
      setUploadingCv(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

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

      try {
        await profile.pathfinderUpdate(profileData);
      } catch (updateErr) {
        if (updateErr.status === 404 || !loadedProfileId) {
          const createPayload = stripBaseDetailsId(profileData);
          await profile.pathfinderCreate(createPayload);
        } else {
          throw updateErr;
        }
      }

      await loadProfile();
      setError(null);
      setSuccessMessage("Profile saved successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans relative">
        <NavBar />
        <div className="pt-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans relative">
      <NavBar />
      
      {/* Main Content Container */}
      <div className="pt-20 px-4 md:px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Background Container */}
          <div className="bg-[#FAFAFA] rounded-2xl p-4 md:p-6">
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {successMessage}
              </div>
            )}
            
            {/* Page Header */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-1" style={{ fontFamily: 'Inter' }}>
                Pathfinder Profile Setup
              </h1>
              <p className="text-xs font-extrabold text-[#A1A1A1] mb-2" style={{ fontFamily: 'Inter' }}>
                Complete your profile to get started on your volunteering journey
              </p>
              <p className="text-xs font-extrabold text-[#A1A1A1]" style={{ fontFamily: 'Inter' }}>
                You can come back and update your profile anytime.
              </p>
            </div>

            {/* Profile Picture and Basic Info Section */}
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              {/* Profile Picture - same method as enabler (pictureGet / picturePatch) */}
              <div className="relative flex-shrink-0">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-[#E4E4E4] relative border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#6A00B1]"
                >
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fa fa-user text-3xl text-gray-400" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-[rgba(182,120,255,0.8)] rounded-full flex items-center justify-center">
                    <i className="fa fa-camera text-white text-xs" />
                  </span>
                </button>
                {photoUploadError && <p className="text-red-500 text-xs mt-1">{photoUploadError}</p>}
              </div>

              {/* Basic Information */}
              <div className="flex-1 space-y-3">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Software Engineer"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white rounded-[30px] p-4 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-4" style={{ fontFamily: 'Inter' }}>
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email (from base_details) */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Email *</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                {/* Gmail */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Gmail</label>
                  <input
                    type="email"
                    name="gmail"
                    value={formData.gmail}
                    onChange={handleInputChange}
                    placeholder="yourname@gmail.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                  />
                </div>

                {/* Phone Number (from base_details) */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+234..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                  />
                </div>

                {/* Country (from base_details) */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm bg-white"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Ghana">Ghana</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* State (from base_details) */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                {/* Address (from base_details) */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                {/* Website (from base_details) */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://portfolio.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-1.5" style={{ fontFamily: 'Inter' }}>
                About
              </h2>
              <p className="text-xs font-bold text-[#A1A1A1] mb-2" style={{ fontFamily: 'Inter' }}>
                Share some details about yourself, your expertise, and what you offer.
              </p>
              <div className="border border-[#E0C6FF] rounded-[10px] p-2.5">
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full outline-none resize-none text-gray-700 text-xs"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
            </div>

            {/* Work Experience Section */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-1.5" style={{ fontFamily: 'Inter' }}>
                Work Experience
              </h2>
              <div className="border border-[#E0C6FF] rounded-[10px] p-2.5">
                <textarea
                  name="work_experience"
                  value={formData.work_experience}
                  onChange={handleInputChange}
                  placeholder="Describe your work experience..."
                  rows="4"
                  className="w-full outline-none resize-none text-gray-700 text-xs"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
            </div>

            {/* Languages */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-1.5" style={{ fontFamily: 'Inter' }}>
                Languages
              </h2>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleInputChange}
                placeholder="e.g. English, French, Yoruba"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
              />
            </div>

            {/* Skills Section */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-1.5" style={{ fontFamily: 'Inter' }}>
                Skills and Expertise
              </h2>
              <p className="text-xs font-bold text-[#A1A1A1] mb-2" style={{ fontFamily: 'Inter' }}>
                Attract relevant clients by sharing your strength and abilities
              </p>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-[#6A00B1] px-2 py-0.5 rounded-full text-xs flex items-center gap-1.5"
                    >
                      {typeof skill === "string" ? skill : skill?.name || ""}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="text-[#6A00B1] hover:text-red-500"
                      >
                        <i className="fa fa-times text-xs"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="e.g. JavaScript, Project Management"
                  className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="border border-[#E0C6FF] rounded-[10px] px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-purple-50 transition-colors"
                  style={{ fontFamily: 'Inter' }}
                >
                  <span className="text-lg md:text-xl font-extrabold text-[#6A00B1] leading-none">+</span>
                  <span className="text-xs font-extrabold text-[#6A00B1]">Add skill</span>
                </button>
              </div>
            </div>

            {/* Education Section */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-1.5" style={{ fontFamily: 'Inter' }}>
                Education
              </h2>
              <p className="text-xs font-bold text-[#A1A1A1] mb-2" style={{ fontFamily: 'Inter' }}>
                Add institutions or degrees (e.g. BSc Computer Science, University of Lagos)
              </p>
              {educations.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {educations.map((edu, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-lg flex items-center justify-between"
                    >
                      <span className="text-gray-700 text-xs">{typeof edu === "string" ? edu : edu?.name || edu?.institution || ""}</span>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fa fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  value={newEducation}
                  onChange={(e) => setNewEducation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEducation())}
                  placeholder="e.g. BSc Computer Science, University of Lagos"
                  className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
                <button
                  type="button"
                  onClick={addEducation}
                  className="border border-[#E0C6FF] rounded-[10px] px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-purple-50 transition-colors"
                  style={{ fontFamily: 'Inter' }}
                >
                  <span className="text-lg md:text-xl font-extrabold text-[#6A00B1] leading-none">+</span>
                  <span className="text-xs font-extrabold text-[#6A00B1]">Add Education</span>
                </button>
              </div>
            </div>

            {/* Certification Section */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-1.5" style={{ fontFamily: 'Inter' }}>
                Certification
              </h2>
              <p className="text-xs font-bold text-[#A1A1A1] mb-2" style={{ fontFamily: 'Inter' }}>
                Add professional certifications (e.g. AWS Certified, PMP)
              </p>
              {certifications.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-lg flex items-center justify-between"
                    >
                      <span className="text-gray-700 text-xs">{typeof cert === "string" ? cert : cert?.name || cert?.title || ""}</span>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fa fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                  placeholder="e.g. AWS Certified Solutions Architect, PMP"
                  className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="border border-[#E0C6FF] rounded-[10px] px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-purple-50 transition-colors"
                  style={{ fontFamily: 'Inter' }}
                >
                  <span className="text-lg md:text-xl font-extrabold text-[#6A00B1] leading-none">+</span>
                  <span className="text-xs font-extrabold text-[#6A00B1]">Add Certification</span>
                </button>
              </div>
            </div>

            {/* CV / Documents - Government Credentials API */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-1.5" style={{ fontFamily: 'Inter' }}>
                CV / Resume
              </h2>
              <p className="text-xs font-bold text-[#A1A1A1] mb-2" style={{ fontFamily: 'Inter' }}>
                Upload your CV (PDF or image). Used for applications and profile.
              </p>
              
              {/* Current CV Display */}
              {currentCvUrl && !cvFile && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="fa fa-file-pdf-o text-green-600 text-xl"></i>
                    <div>
                      <p className="text-sm font-medium text-green-800">{currentCvName || "CV"}</p>
                      <a 
                        href={currentCvUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:underline"
                      >
                        View Current CV
                      </a>
                    </div>
                  </div>
                  <span className="text-green-600 text-xs">
                    <i className="fa fa-check-circle mr-1"></i> Uploaded
                  </span>
                </div>
              )}
              
              {/* File Input and Upload Button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  accept=".pdf,.png,.jpeg,.jpg,.jfif,.webp"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#6A00B1] file:text-white file:cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleCvUpload}
                  disabled={!cvFile || uploadingCv}
                  className="bg-[#6A00B1] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5A0091] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingCv ? "Uploading..." : cvFile ? "Upload New CV" : "Upload CV"}
                </button>
              </div>
              
              {/* Selected file preview */}
              {cvFile && (
                <div className="mt-2 flex items-center gap-2">
                  <i className="fa fa-file text-gray-500"></i>
                  <span className="text-sm text-gray-600">{cvFile.name}</span>
                  <button 
                    type="button"
                    onClick={() => setCvFile(null)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {/* Success message */}
              {currentCvUrl && !uploadingCv && !cvFile && (
                <p className="text-green-600 text-xs mt-2">
                  <i className="fa fa-check mr-1" /> CV uploaded successfully
                </p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#6A00B1] text-white px-6 md:px-12 py-2 md:py-2.5 rounded-[30px] font-semibold text-sm md:text-base hover:bg-[#5A0091] transition-colors disabled:opacity-50"
                style={{ fontFamily: 'Montserrat' }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNewProfile;
