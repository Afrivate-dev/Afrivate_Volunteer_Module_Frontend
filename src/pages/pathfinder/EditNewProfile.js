import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import * as api from "../../services/api";

const EditNewProfile = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Edit Profile - AfriVate";
  }, []);

  const [formData, setFormData] = useState({
    displayName: "",
    title: "",
    location: "",
    languages: "",
    about: "",
    workExperience: "",
  });

  const [editingField, setEditingField] = useState(null);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const loadProfile = useCallback(async () => {
    try {
      const data = await api.profile.pathfinderGet();
      const base = data.base_details || {};
      const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || base.contact_email || '';
      setFormData(prev => ({
        ...prev,
        displayName: name || prev.displayName,
        title: prev.title,
        location: base.country || base.state || prev.location,
        languages: prev.languages,
        about: base.bio ?? prev.about,
        workExperience: prev.workExperience,
      }));
    } catch (_) {
      try {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
          const profile = JSON.parse(saved);
          setFormData(prev => ({
            ...prev,
            displayName: profile.displayName ?? prev.displayName,
            title: profile.title ?? prev.title,
            location: profile.location ?? prev.location,
            languages: profile.languages ?? prev.languages,
            about: profile.about ?? prev.about,
            workExperience: profile.workExperience ?? prev.workExperience,
          }));
          if (Array.isArray(profile.skills)) setSkills(profile.skills);
          if (Array.isArray(profile.education)) setEducation(profile.education);
          if (Array.isArray(profile.certifications)) setCertifications(profile.certifications);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      }
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

  const handleSave = async () => {
    const profileData = {
      ...formData,
      skills,
      education,
      certifications,
      profileComplete: true
    };
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    localStorage.setItem('hasCompletedProfile', 'true');

    try {
      const parts = (formData.displayName || '').trim().split(/\s+/);
      const first_name = parts[0] || 'User';
      const last_name = parts.slice(1).join(' ') || '';
      const base_details = {
        bio: formData.about || '',
        country: formData.location || '',
        contact_email: '',
        phone_number: '',
        website: '',
        address: '',
        city: '',
        state: '',
      };
      await api.profile.pathfinderUpdate({
        first_name,
        last_name,
        base_details,
        social_links: [],
      });
    } catch (_) {
      try {
        const parts = (formData.displayName || '').trim().split(/\s+/);
        const first_name = parts[0] || 'User';
        const last_name = parts.slice(1).join(' ') || '';
        const base_details = {
          bio: formData.about || '',
          country: formData.location || '',
          contact_email: '',
          phone_number: '',
          website: '',
          address: '',
          city: '',
          state: '',
        };
        await api.profile.pathfinderCreate({
          first_name,
          last_name,
          base_details,
          social_links: [],
        });
      } catch (__) {}
    }
    navigate('/pathf');
  };

  return (
    <div className="min-h-screen bg-white font-sans relative">
      <NavBar />
      
      {/* Main Content Container */}
      <div className="pt-20 px-4 md:px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Background Container */}
          <div className="bg-[#FAFAFA] rounded-2xl p-4 md:p-6">
            
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
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 bg-[#E4E4E4] rounded-full relative">
                  <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-white/50 rounded-full left-[28px] md:left-[34px] top-[6px]"></div>
                  <div className="absolute w-16 h-8 md:w-20 md:h-10 bg-white/50 rounded-full left-[16px] md:left-[20px] top-[60px] md:top-[72px]"></div>
                  <button className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-[rgba(182,120,255,0.5)] rounded-full flex items-center justify-center hover:bg-[rgba(182,120,255,0.7)] transition-colors">
                    <i className="fa fa-camera text-[#6A00B1] text-xs"></i>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="flex-1 space-y-2">
                {/* Display Name */}
                <div className="flex items-center gap-1.5">
                  {editingField === 'displayName' ? (
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      onBlur={() => setEditingField(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingField(null);
                      }}
                      autoFocus
                      placeholder="Add Display Name"
                      className="flex-1 text-base md:text-lg font-bold text-black outline-none border-b-2 border-[#6A00B1] py-0.5"
                      style={{ fontFamily: 'Montserrat' }}
                    />
                  ) : (
                    <>
                      <span 
                        className="text-base md:text-lg font-bold text-black cursor-pointer"
                        onClick={() => setEditingField('displayName')}
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        {formData.displayName || "Add Display Name"}
                      </span>
                      <button
                        onClick={() => setEditingField('displayName')}
                        className="w-6 h-6 bg-[rgba(182,120,255,0.4)] rounded-[10px] flex items-center justify-center ml-1"
                      >
                        <i className="fa fa-pencil text-[#7B00CD] text-xs"></i>
                      </button>
                    </>
                  )}
                </div>

                {/* Title */}
                <div className="flex items-center gap-1.5">
                  {editingField === 'title' ? (
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      onBlur={() => setEditingField(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingField(null);
                      }}
                      autoFocus
                      placeholder="Add Title"
                      className="flex-1 text-sm md:text-base font-semibold text-black outline-none border-b-2 border-[#6A00B1] py-0.5"
                      style={{ fontFamily: 'Montserrat' }}
                    />
                  ) : (
                    <>
                      <span 
                        className="text-sm md:text-base font-semibold text-black cursor-pointer"
                        onClick={() => setEditingField('title')}
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        {formData.title || "Add Title"}
                      </span>
                      <button
                        onClick={() => setEditingField('title')}
                        className="w-6 h-6 bg-[rgba(182,120,255,0.4)] rounded-[10px] flex items-center justify-center ml-1"
                      >
                        <i className="fa fa-pencil text-[#7B00CD] text-xs"></i>
                      </button>
                    </>
                  )}
                </div>

                {/* Location and Languages */}
                <div className="flex items-center gap-2 flex-wrap">
                  <i className="fa fa-map-marker-o text-[#727171] text-sm"></i>
                  <span className="text-sm md:text-base font-normal text-black" style={{ fontFamily: 'Montserrat' }}>
                    {formData.location}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {editingField === 'languages' ? (
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages}
                        onChange={handleInputChange}
                        onBlur={() => setEditingField(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingField(null);
                        }}
                        autoFocus
                        placeholder="Add languages"
                        className="flex-1 text-sm md:text-base font-semibold text-black outline-none border-b-2 border-[#6A00B1] py-0.5"
                        style={{ fontFamily: 'Montserrat' }}
                      />
                    ) : (
                      <>
                        <span 
                          className="text-sm md:text-base font-semibold text-black cursor-pointer"
                          onClick={() => setEditingField('languages')}
                          style={{ fontFamily: 'Montserrat' }}
                        >
                          {formData.languages || "Add languages"}
                        </span>
                        <button
                          onClick={() => setEditingField('languages')}
                          className="w-6 h-6 bg-[rgba(182,120,255,0.4)] rounded-[10px] flex items-center justify-center ml-1"
                        >
                          <i className="fa fa-pencil text-[#7B00CD] text-xs"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-1.5" style={{ fontFamily: 'Inter' }}>
                About
              </h2>
              <p className="text-xs font-bold text-[#A1A1A1] mb-2 opacity-60" style={{ fontFamily: 'Inter' }}>
                Share some details about yourself, your expertise, and what you offer.
              </p>
              <div className="border border-[#E0C6FF] rounded-[10px] p-2.5 opacity-60">
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full outline-none resize-none text-gray-700 text-xs"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
            </div>

            {/* Skills and Expertise Section */}
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
                      {skill}
                      <button
                        onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                        className="text-[#6A00B1] hover:text-red-500"
                      >
                        <i className="fa fa-times text-xs"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  const skill = prompt("Enter a skill:");
                  if (skill && skill.trim()) {
                    setSkills([...skills, skill.trim()]);
                  }
                }}
                className="border border-[#E0C6FF] rounded-[10px] px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-purple-50 transition-colors"
                style={{ fontFamily: 'Inter' }}
              >
                <span className="text-lg md:text-xl font-extrabold text-[#6A00B1] leading-none">+</span>
                <span className="text-xs font-extrabold text-[#6A00B1]">Add skills and expertise</span>
              </button>
            </div>

            {/* Work Experience Section */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-1.5" style={{ fontFamily: 'Inter' }}>
                Work Experience
              </h2>
              <p className="text-xs font-bold text-[#A1A1A1] mb-2" style={{ fontFamily: 'Inter' }}>
                Add your job history and achievements to give clients insight into your expertise
              </p>
              <div className="border border-[#E0C6FF] rounded-[10px] p-2.5 opacity-60">
                <textarea
                  name="workExperience"
                  value={formData.workExperience}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full outline-none resize-none text-gray-700 text-xs"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
            </div>

            {/* Education Section */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-black inline" style={{ fontFamily: 'Inter' }}>
                    Education
                  </h2>
                  <span className="text-xs md:text-sm font-extrabold text-[#A09D9D] ml-2" style={{ fontFamily: 'Inter' }}>
                    (Optional)
                  </span>
                </div>
                <button
                  onClick={() => {
                    const edu = prompt("Enter education:");
                    if (edu && edu.trim()) {
                      setEducation([...education, edu.trim()]);
                    }
                  }}
                  className="border border-[#E0C6FF] rounded-[10px] px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-purple-50 transition-colors flex-shrink-0"
                  style={{ fontFamily: 'Inter' }}
                >
                  <span className="text-lg md:text-xl font-extrabold text-[#6A00B1] leading-none">+</span>
                  <span className="text-xs font-extrabold text-[#6A00B1]">Add Education</span>
                </button>
              </div>
              <p className="text-xs font-bold text-[#A1A1A1] mb-2" style={{ fontFamily: 'Inter' }}>
                Back up your skills by adding any educational degrees or programs.
              </p>
              {education.length > 0 && (
                <div className="space-y-1.5">
                  {education.map((edu, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-lg flex items-center justify-between"
                    >
                      <span className="text-gray-700 text-xs">{edu}</span>
                      <button
                        onClick={() => setEducation(education.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fa fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certification Section */}
            <div className="mb-4 bg-white rounded-[30px] p-3 md:p-4">
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-black inline" style={{ fontFamily: 'Inter' }}>
                    Certification
                  </h2>
                  <span className="text-xs md:text-sm font-extrabold text-[#A09D9D] ml-2" style={{ fontFamily: 'Inter' }}>
                    (Optional)
                  </span>
                </div>
                <button
                  onClick={() => {
                    const cert = prompt("Enter certification:");
                    if (cert && cert.trim()) {
                      setCertifications([...certifications, cert.trim()]);
                    }
                  }}
                  className="border border-[#E0C6FF] rounded-[10px] px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-purple-50 transition-colors flex-shrink-0"
                  style={{ fontFamily: 'Inter' }}
                >
                  <span className="text-lg md:text-xl font-extrabold text-[#6A00B1] leading-none">+</span>
                  <span className="text-xs font-extrabold text-[#6A00B1]">Add Certification</span>
                </button>
              </div>
              <p className="text-xs font-bold text-[#A1A1A1] mb-2" style={{ fontFamily: 'Inter' }}>
                Showcase your mastery with certification earned in your field.
              </p>
              {certifications.length > 0 && (
                <div className="space-y-1.5">
                  {certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-lg flex items-center justify-between"
                    >
                      <span className="text-gray-700 text-xs">{cert}</span>
                      <button
                        onClick={() => setCertifications(certifications.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fa fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleSave}
                className="bg-[#6A00B1] text-white px-6 md:px-12 py-2 md:py-2.5 rounded-[30px] font-semibold text-sm md:text-base hover:bg-[#5A0091] transition-colors"
                style={{ fontFamily: 'Montserrat' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNewProfile;
