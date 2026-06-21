import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { profile, getApiErrorMessage } from "../../services/api";
import { normalizeWebsiteForStorage } from "../../utils/websiteUrl";

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white";

const EnablerProfileSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });

  useEffect(() => {
    document.title = "Enabler Profile Setup - AfriVate";
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    contact_email: "",
    phone_number: "",
    address: "",
    state: "",
    country: "",
    website: "",
    employees: "",
    role: "",
    social_links: [],
    document: null,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profile.enablerGet();
        if (data) {
          setExistingProfile(data);
          const base = data.base_details || {};
          setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            bio: base.bio || prev.bio,
            contact_email: base.contact_email || prev.contact_email,
            phone_number: base.phone_number || prev.phone_number,
            address: base.address || prev.address,
            state: base.state || prev.state,
            country: base.country || prev.country,
            website: base.website || prev.website,
            employees: data.employees != null && data.employees !== "" ? String(data.employees) : prev.employees,
            role: data.role || prev.role,
            social_links: data.social_links || prev.social_links,
          }));
        }
      } catch (err) {
        console.log("No existing profile found, proceeding with setup");
      } finally {
        setInitialLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, [fieldName]: file }));
  };

  const handleProceed = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    setToast(prev => ({ ...prev, isOpen: false }));
    try {
      const employeesVal = formData.employees === "" || formData.employees == null
        ? null
        : parseInt(formData.employees, 10);
      const employees = employeesVal == null || Number.isNaN(employeesVal) ? null : employeesVal;

      const baseDetails = {
        contact_email: formData.contact_email || "",
        address: formData.address || "",
        state: formData.state || "",
        country: formData.country || "",
        phone_number: formData.phone_number || "",
        website: normalizeWebsiteForStorage(formData.website),
        bio: formData.bio || "",
      };
      if (existingProfile?.base_details?.id != null) {
        baseDetails.id = existingProfile.base_details.id;
      }

      const profileData = {
        name: (formData.name || "Enabler").trim(),
        employees,
        role: formData.role || null,
        base_details: baseDetails,
        social_links: Array.isArray(formData.social_links) ? formData.social_links : [],
      };

      let saved = false;
      if (existingProfile?.id != null) {
        try {
          await profile.enablerUpdate(profileData);
          saved = true;
        } catch (updateErr) {
          try {
            await profile.enablerPatch(profileData);
            saved = true;
          } catch (_) {
            throw updateErr;
          }
        }
      } else {
        try {
          await profile.enablerPatch(profileData);
          saved = true;
        } catch (patchErr) {
          try {
            await profile.enablerUpdate(profileData);
            saved = true;
          } catch (_) {
            throw patchErr;
          }
        }
      }

      if (!saved) throw new Error("Failed to save profile");

      if (formData.document) {
        try {
          const fd = new FormData();
          fd.append("document_name", "Company Document");
          fd.append("document", formData.document);
          await profile.credentialsCreate(fd);
        } catch (docErr) {
          console.error("Error uploading document:", docErr);
        }
      }

      navigate('/enabler/dashboard');
    } catch (err) {
      console.error("Error saving profile:", err);
      const rawMsg = getApiErrorMessage(err) || "";
      const msg = (rawMsg.toLowerCase().includes("website") || rawMsg.toLowerCase().includes("enter a valid url"))
        ? "Please enter a valid website URL (e.g. https://yourwebsite.com) or leave it blank"
        : rawMsg || "Failed to save profile. Please try again.";
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.name.trim() !== "" && formData.bio.trim() !== "";
    if (currentStep === 2) return formData.contact_email.trim() !== "" && formData.country.trim() !== "" && formData.state.trim() !== "" && formData.address.trim() !== "";
    if (currentStep === 3) return formData.employees.trim() !== "" && formData.role.trim() !== "";
    return false;
  };

  const stepLabels = ["Profile Info", "Contact", "Business"];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans">
        <EnablerNavbar />
        <div className="pt-16 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Purple gradient header */}
      <div className="pt-16">
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-1">Enabler Profile Setup</h1>
            <p className="text-purple-200 text-sm">Complete your profile to connect with pathfinders</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => setCurrentStep(step)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep === step
                        ? "text-white shadow-md"
                        : currentStep > step
                        ? "text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    style={currentStep >= step ? { background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" } : {}}
                  >
                    {currentStep > step ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : step}
                  </button>
                  <span className={`text-xs font-medium ${currentStep === step ? "text-[#8D4087]" : "text-gray-400"}`}>
                    {stepLabels[idx]}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full ${currentStep > step ? "bg-[#8D4087]" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Profile Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-0.5">Setup your Profile</h2>
              <p className="text-gray-500 text-xs">Tell pathfinders about your organization</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Organization Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                placeholder="Your organization name" className={inputCls} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Bio *</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange}
                placeholder="Describe your organization and mission"
                rows="4" className={inputCls + " resize-none"} required />
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={handleProceed} disabled={!canProceed() || loading}
                className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: canProceed() && !loading ? "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" : undefined, backgroundColor: !canProceed() || loading ? "#d1d5db" : undefined }}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-0.5">Contact Information</h2>
              <p className="text-gray-500 text-xs">Help pathfinders reach you</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Contact Email *</label>
              <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange}
                placeholder="contact@organization.com" className={inputCls} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
              <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange}
                placeholder="+234..." className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Country *</label>
                <select name="country" value={formData.country} onChange={handleInputChange}
                  className={inputCls} required>
                  <option value="">Select Country</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Ghana">Ghana</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                  placeholder="State" className={inputCls} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Address *</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                placeholder="Full address" className={inputCls} required />
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={() => setCurrentStep(1)}
                className="px-6 py-2.5 rounded-xl font-semibold text-[#8D4087] text-sm border border-[#8D4087] hover:bg-purple-50 transition-colors">
                Back
              </button>
              <button onClick={handleProceed} disabled={!canProceed() || loading}
                className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: canProceed() && !loading ? "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" : undefined, backgroundColor: !canProceed() || loading ? "#d1d5db" : undefined }}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Business Info */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-0.5">Business Information</h2>
              <p className="text-gray-500 text-xs">Add your business details to complete your profile</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Website</label>
              <input type="url" name="website" value={formData.website} onChange={handleInputChange}
                placeholder="https://yourwebsite.com (optional)" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">Include https:// or leave blank</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Number of Employees *</label>
              <input type="text" name="employees" value={formData.employees} onChange={handleInputChange}
                placeholder="e.g. 50" className={inputCls} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Your Role *</label>
              <input type="text" name="role" value={formData.role} onChange={handleInputChange}
                placeholder="e.g. CEO, Programme Manager" className={inputCls} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Upload Document</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <input type="file" accept=".pdf,.doc,.docx,.png,.jpeg,.jpg,.svg"
                  onChange={(e) => handleFileChange(e, 'document')}
                  className="hidden" id="document-upload" />
                <label htmlFor="document-upload" className="cursor-pointer">
                  {formData.document ? (
                    <div>
                      <p className="text-2xl mb-1">📄</p>
                      <p className="text-xs text-gray-600 font-medium">{formData.document.name}</p>
                      <p className="text-xs text-[#8D4087] mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl mb-2">📎</p>
                      <p className="text-sm font-semibold text-gray-700 mb-0.5">Upload ID or Business Document</p>
                      <p className="text-xs text-gray-400">PDF, MS Word, PNG, JPEG, SVG</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 rounded-xl font-semibold text-[#8D4087] text-sm border border-[#8D4087] hover:bg-purple-50 transition-colors">
                Back
              </button>
              <button onClick={handleProceed} disabled={!canProceed() || loading}
                className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: canProceed() && !loading ? "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" : undefined, backgroundColor: !canProceed() || loading ? "#d1d5db" : undefined }}>
                {loading ? "Saving..." : "Complete Setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnablerProfileSetup;
