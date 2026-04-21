import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { profile, getApiErrorMessage } from "../../services/api";
import { normalizeWebsiteForStorage } from "../../utils/websiteUrl";

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

  // Form data aligned with Enabler Profile API documentation
  const [formData, setFormData] = useState({
    // Step 1: Profile Info
    name: "",
    bio: "",
    // Step 2: Contact Information
    contact_email: "",
    phone_number: "",
    address: "",
    state: "",
    country: "",
    // Step 3: Business Info
    website: "",
    employees: "",
    role: "",
    social_links: [],
    document: null,
  });

  // Load existing enabler profile from API on mount
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const handleProceed = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    setToast(prev => ({ ...prev, isOpen: false }));
    try {
      // Coerce employees to integer per API (integer or null)
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

      // Upload company document via /api/profile/credentials/ (multipart: document_name, document)
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
      setToast({
        isOpen: true,
        message: getApiErrorMessage(err),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.name.trim() !== "" && formData.bio.trim() !== "";
    } else if (currentStep === 2) {
      return formData.contact_email.trim() !== "" && 
             formData.country.trim() !== "" &&
             formData.state.trim() !== "" &&
             formData.address.trim() !== "";
    } else if (currentStep === 3) {
      return formData.website.trim() !== "" && 
             formData.employees.trim() !== "" && 
             formData.role.trim() !== "";
    }
    return false;
  };

  const handleStepClick = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-14 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />
      
      {/* Main Content */}
      <div className="pt-14 px-4 md:px-6 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* White Card Container */}
          <div className="bg-white rounded-[30px] p-3 md:p-4 shadow-sm border border-gray-200">
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              {/* Step 1 */}
              <div className="flex items-center">
                <button
                  onClick={() => handleStepClick(1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors ${
                    currentStep === 1 
                      ? 'bg-[#6A00B1] text-white cursor-default' 
                      : 'bg-gray-200 text-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-pointer'
                  }`}
                >
                  1
                </button>
                {currentStep === 1 ? (
                  <div className="w-12 md:w-16 h-0.5 border-t-2 border-dashed border-[#6A00B1]"></div>
                ) : currentStep > 1 ? (
                  <div className="w-12 md:w-16 h-0.5 border-t-2 border-dashed border-gray-300"></div>
                ) : (
                  <div className="w-12 md:w-16 h-0.5 border-t-2 border-dashed border-gray-300"></div>
                )}
              </div>

              {/* Step 2 */}
              <div className="flex items-center">
                <button
                  onClick={() => handleStepClick(2)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors ${
                    currentStep === 2 
                      ? 'bg-[#6A00B1] text-white cursor-default' 
                      : currentStep > 2
                      ? 'bg-gray-200 text-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-pointer'
                      : 'bg-gray-200 text-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-pointer'
                  }`}
                >
                  2
                </button>
                {currentStep === 2 ? (
                  <div className="w-12 md:w-16 h-0.5 border-t-2 border-dashed border-[#6A00B1]"></div>
                ) : currentStep > 2 ? (
                  <div className="w-12 md:w-16 h-0.5 border-t-2 border-dashed border-[#6A00B1]"></div>
                ) : (
                  <div className="w-12 md:w-16 h-0.5 border-t-2 border-dashed border-gray-300"></div>
                )}
              </div>

              {/* Step 3 */}
              <div className="flex items-center">
                <button
                  onClick={() => handleStepClick(3)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors ${
                    currentStep === 3 
                      ? 'bg-[#6A00B1] text-white cursor-default' 
                      : 'bg-gray-200 text-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-pointer'
                  }`}
                >
                  3
                </button>
              </div>
            </div>

            {/* Step 1: Profile Setup */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-lg md:text-xl font-bold text-[#6A00B1] mb-2">
                    Setup your Profile
                  </h1>
                </div>

                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your organization name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio *</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Describe your organization"
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleProceed}
                    disabled={!canProceed() || loading}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-semibold text-white transition-colors text-xs md:text-sm ${
                      canProceed() && !loading
                        ? 'bg-[#6A00B1] hover:bg-[#5A0091]'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Proceed'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h1 className="text-lg md:text-xl font-bold text-[#6A00B1] mb-1">
                    Enabler Profile Setup
                  </h1>
                  <p className="text-gray-500 text-xs">
                    Step 2: Contact Information - These details will help pathfinders reach you
                  </p>
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    placeholder="contact@organization.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+234..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                  />
                </div>

                {/* Country and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
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
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Full address"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleProceed}
                    disabled={!canProceed() || loading}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-semibold text-white transition-colors text-xs md:text-sm ${
                      canProceed() && !loading
                        ? 'bg-[#6A00B1] hover:bg-[#5A0091]'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Proceed'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Business Info */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h1 className="text-lg md:text-xl font-bold text-[#6A00B1] mb-1">
                    Enabler Profile Setup
                  </h1>
                  <p className="text-gray-500 text-xs">
                    Step 3: Business Information - Add your business details to complete your profile
                  </p>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website *</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://organization.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                {/* Employees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees *</label>
                  <input
                    type="text"
                    name="employees"
                    value={formData.employees}
                    onChange={handleInputChange}
                    placeholder="e.g. 50"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Role *</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g. CEO, Programme Manager"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                    required
                  />
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Upload your document (ID/Business Document)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpeg,.jpg,.svg"
                      onChange={(e) => handleFileChange(e, 'document')}
                      className="hidden"
                      id="document-upload"
                    />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      {formData.document ? (
                        <div>
                          <i className="fa fa-file text-2xl text-gray-400 mb-2"></i>
                          <p className="text-xs text-gray-600">{formData.document.name}</p>
                        </div>
                      ) : (
                        <div>
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <i className="fa fa-arrow-down text-lg text-gray-400"></i>
                          </div>
                          <p className="text-xs text-gray-500">
                            Drag and Drop your document (PDF, MS doc, PNG, JPEG, SVG)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleProceed}
                    disabled={!canProceed() || loading}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-semibold text-white transition-colors text-xs md:text-sm ${
                      canProceed() && !loading
                        ? 'bg-[#6A00B1] hover:bg-[#5A0091]'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Complete Setup'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnablerProfileSetup;
