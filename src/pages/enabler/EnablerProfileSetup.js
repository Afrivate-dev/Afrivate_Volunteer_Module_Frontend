import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import * as api from "../../services/api";

const EnablerProfileSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    document.title = "Enabler Profile Setup - AfriVate";
  }, []);
  const [formData, setFormData] = useState({
    // Step 1: Setup Profile
    profilePicture: null,
    bio: "",
    // Step 2: Personal Information
    name: "",
    country: "",
    email: "",
    state: "",
    phoneNumber: "",
    address: "",
    // Step 3: Business Info
    website: "",
    employees: "",
    role: "",
    document: null
  });

  // Load existing enabler profile from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('enablerProfile');
      if (saved) {
        const profile = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          bio: profile.bio ?? prev.bio,
          name: profile.name ?? prev.name,
          country: profile.country ?? prev.country,
          email: profile.email ?? prev.email,
          state: profile.state ?? prev.state,
          phoneNumber: profile.phoneNumber ?? prev.phoneNumber,
          address: profile.address ?? prev.address,
          website: profile.website ?? prev.website,
          employees: profile.employees ?? prev.employees,
          role: profile.role ?? prev.role,
        }));
      }
    } catch (e) {
      console.error('Error loading enabler profile from localStorage:', e);
    }
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
    const { profilePicture, document: doc, ...rest } = formData;
    const profileData = {
      ...rest,
      profileComplete: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('enablerProfile', JSON.stringify(profileData));
    localStorage.setItem('hasCompletedEnablerProfile', 'true');

    try {
      const base_details = {
        bio: formData.bio || '',
        country: formData.country || '',
        contact_email: formData.email || '',
        phone_number: formData.phoneNumber || '',
        website: formData.website || '',
        address: formData.address || '',
        city: '',
        state: formData.state || '',
      };
      const body = { name: formData.name || 'Enabler', base_details, social_links: [] };
      await api.profile.enablerUpdate(body);
    } catch (_) {
      try {
        const base_details = {
          bio: formData.bio || '',
          country: formData.country || '',
          contact_email: formData.email || '',
          phone_number: formData.phoneNumber || '',
          website: formData.website || '',
          address: formData.address || '',
          city: '',
          state: formData.state || '',
        };
        await api.profile.enablerCreate({ name: formData.name || 'Enabler', base_details, social_links: [] });
      } catch (__) {}
    }
    navigate('/enabler/dashboard');
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.bio.trim() !== "";
    } else if (currentStep === 2) {
      return formData.name.trim() !== "" && 
             formData.email.trim() !== "" && 
             formData.country.trim() !== "";
    } else if (currentStep === 3) {
      return formData.website.trim() !== "" && 
             formData.employees.trim() !== "" && 
             formData.role.trim() !== "";
    }
    return false;
  };

  const handleStepClick = (stepNumber) => {
    // Allow navigation to any step
    setCurrentStep(stepNumber);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      
      {/* Main Content */}
      <div className="pt-20 px-4 md:px-6 pb-8">
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

            {/* Step 1: Setup Profile */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-lg md:text-xl font-bold text-[#6A00B1] mb-2">
                    Setup your Profile
                  </h1>
                </div>

                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <label className="cursor-pointer">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                      {formData.profilePicture ? (
                        <img 
                          src={URL.createObjectURL(formData.profilePicture)} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <i className="fa fa-camera text-xl md:text-2xl text-gray-400"></i>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profilePicture')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-400 text-xs">Picture</p>
                </div>

                {/* Bio */}
                <div>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Bio"
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 resize-none text-xs"
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleProceed}
                    disabled={!canProceed()}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-semibold text-white transition-colors text-xs md:text-sm ${
                      canProceed()
                        ? 'bg-[#6A00B1] hover:bg-[#5A0091]'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h1 className="text-lg md:text-xl font-bold text-[#6A00B1] mb-1">
                    Enabler Profile Setup
                  </h1>
                  <p className="text-gray-500 text-xs">
                    Step 2: Personal Information - These details will help customize your account
                  </p>
                </div>

                {/* Name */}
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-xs"
                  />
                </div>

                {/* Country and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 appearance-none bg-white pr-8 text-xs"
                    >
                      <option value="">Select Country</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Ghana">Ghana</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Tanzania">Tanzania</option>
                    </select>
                    <i className="fa fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-xs"
                    />
                  </div>
                </div>

                {/* State and Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-xs"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-xs"
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleProceed}
                    disabled={!canProceed()}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-semibold text-white transition-colors text-xs md:text-sm ${
                      canProceed()
                        ? 'bg-[#6A00B1] hover:bg-[#5A0091]'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Proceed
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
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="Website"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-xs"
                  />
                </div>

                {/* Employees */}
                <div>
                  <input
                    type="text"
                    name="employees"
                    value={formData.employees}
                    onChange={handleInputChange}
                    placeholder="How Many employees are in your company?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-xs"
                  />
                </div>

                {/* Role */}
                <div>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="What's your role?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-xs"
                  />
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Upload your document
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
                    disabled={!canProceed()}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-semibold text-white transition-colors text-xs md:text-sm ${
                      canProceed()
                        ? 'bg-[#6A00B1] hover:bg-[#5A0091]'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Proceed
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
