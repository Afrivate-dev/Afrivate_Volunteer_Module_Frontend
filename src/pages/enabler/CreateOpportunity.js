import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import * as api from "../../services/api";

const CreateOpportunity = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Create Opportunity - AfriVate";
  }, []);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    workModel: "Hybrid",
    location: "",
    timeCommitment: "",
  });
  const [customQuestions, setCustomQuestions] = useState([]);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProceed = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const addCustomQuestion = () => {
    const q = prompt("Enter your question for applicants:");
    if (q && q.trim()) {
      setCustomQuestions((prev) => [...prev, { id: `q-${Date.now()}`, question: q.trim() }]);
    }
  };
  const removeCustomQuestion = (id) => {
    setCustomQuestions((prev) => prev.filter((x) => x.id !== id));
  };

  const handlePost = async () => {
    let oppId = Date.now().toString();
    try {
      const res = await api.bookmark.opportunitiesCreate({
        title: formData.title,
        description: formData.description,
        link: formData.location
          ? `https://afrivate.com/${formData.location}`
          : "https://afrivate.com",
        is_open: true,
      });
      if (res && res.id != null) oppId = String(res.id);
    } catch (_) {}
    const newOpportunity = {
      id: oppId,
      title: formData.title,
      company: "Tech Innovators",
      type: "Volunteering",
      description: formData.description,
      responsibilities: formData.requirements.split('\n').filter(r => r.trim() !== ''),
      qualifications: formData.requirements.split('\n').filter(r => r.trim() !== ''),
      aboutCompany: "Tech Innovators is a forward-thinking technology company dedicated to creating positive social impact through innovative digital solutions.",
      applicationInstructions: "To apply for this position, please click the 'Apply Now' button below and complete the application form. Be sure to upload your resume and a cover letter.",
      jobType: "Volunteer",
      location: formData.location,
      workModel: formData.workModel,
      timeCommitment: formData.timeCommitment,
      createdAt: new Date().toISOString(),
      customQuestions,
    };
    const opportunities = JSON.parse(localStorage.getItem('enablerOpportunities') || '[]');
    opportunities.push(newOpportunity);
    localStorage.setItem('enablerOpportunities', JSON.stringify(opportunities));
    const qMap = JSON.parse(localStorage.getItem('opportunityCustomQuestions') || '{}');
    qMap[oppId] = customQuestions;
    localStorage.setItem('opportunityCustomQuestions', JSON.stringify(qMap));

    setToast({ isOpen: true, message: "Opportunity posted successfully!", type: "success" });
    setTimeout(() => {
      navigate('/enabler/dashboard');
    }, 1500);
  };

  const handleStepClick = (stepNumber) => {
    // Allow navigation to any step
    setCurrentStep(stepNumber);
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.title.trim() !== "" && formData.description.trim() !== "";
    } else if (currentStep === 2) {
      return formData.requirements.trim() !== "";
    }
    return false;
  };

  const canPost = () => {
    return formData.location.trim() !== "" && formData.timeCommitment.trim() !== "";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <EnablerNavbar />
      
      {/* Main Content */}
      <div className="pt-20 px-4 md:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* White Card Container */}
          <div className="bg-white rounded-[30px] p-6 md:p-8 shadow-sm">
            
            {/* Page Title */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                Create an Opportunity
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Post a new volunteering opportunity and connect with talented pathfinders
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6 md:mb-8">
              {/* Step 1 */}
              <div className="flex items-center">
                <button
                  onClick={() => handleStepClick(1)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep === 1 
                      ? 'bg-[#6A00B1] text-white cursor-default' 
                      : 'bg-gray-200 text-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-pointer'
                  }`}
                >
                  1
                </button>
                {currentStep === 1 ? (
                  <div className="w-16 md:w-24 h-0.5 border-t-2 border-dashed border-[#6A00B1]"></div>
                ) : currentStep > 1 ? (
                  <div className="w-16 md:w-24 h-0.5 border-t-2 border-dashed border-gray-300"></div>
                ) : (
                  <div className="w-16 md:w-24 h-0.5 border-t-2 border-dashed border-gray-300"></div>
                )}
              </div>

              {/* Step 2 */}
              <div className="flex items-center">
                <button
                  onClick={() => handleStepClick(2)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
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
                  <div className="w-16 md:w-24 h-0.5 border-t-2 border-dashed border-[#6A00B1]"></div>
                ) : currentStep > 2 ? (
                  <div className="w-16 md:w-24 h-0.5 border-t-2 border-dashed border-[#6A00B1]"></div>
                ) : (
                  <div className="w-16 md:w-24 h-0.5 border-t-2 border-dashed border-gray-300"></div>
                )}
              </div>

              {/* Step 3 */}
              <div className="flex items-center">
                <button
                  onClick={() => handleStepClick(3)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep === 3 
                      ? 'bg-[#6A00B1] text-white cursor-default' 
                      : 'bg-gray-200 text-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-pointer'
                  }`}
                >
                  3
                </button>
              </div>
            </div>

            {/* Step 1: Title and Description */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Opportunity Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter opportunity title"
                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Opportunity Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter opportunity description"
                    rows="5"
                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 resize-none text-sm md:text-base"
                  />
                </div>

                <div className="flex justify-end mt-6 md:mt-8">
                  <button
                    onClick={handleProceed}
                    disabled={!canProceed()}
                    className={`px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold text-white transition-colors ${
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

            {/* Step 2: Requirements and Benefits */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Specific Requirements and Benefits
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="Enter specific requirements and benefits"
                    rows="6"
                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 resize-none text-sm md:text-base"
                  />
                </div>

                <div className="flex justify-center mt-6 md:mt-8">
                  <button
                    onClick={handleProceed}
                    disabled={!canProceed()}
                    className={`px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold text-white transition-colors ${
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

            {/* Step 3: Work Model, Location, Time Commitment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Work Model
                  </label>
                  <div className="relative">
                    <select
                      name="workModel"
                      value={formData.workModel}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 appearance-none bg-white pr-8 md:pr-10 text-sm md:text-base"
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                    </select>
                    <i className="fa fa-chevron-down absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                  </div>
                </div>

                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 appearance-none bg-white pr-8 md:pr-10 text-sm md:text-base"
                    >
                      <option value="">Select location</option>
                      <option value="Lagos, Nigeria">Lagos, Nigeria</option>
                      <option value="Nairobi, Kenya">Nairobi, Kenya</option>
                      <option value="Accra, Ghana">Accra, Ghana</option>
                      <option value="Cape Town, South Africa">Cape Town, South Africa</option>
                      <option value="Remote">Remote</option>
                    </select>
                    <i className="fa fa-chevron-down absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                  </div>
                </div>

                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Time Commitment
                  </label>
                  <div className="relative">
                    <select
                      name="timeCommitment"
                      value={formData.timeCommitment}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 appearance-none bg-white pr-8 md:pr-10 text-sm md:text-base"
                    >
                      <option value="">Select time commitment</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Flexible">Flexible</option>
                      <option value="Project-based">Project-based</option>
                    </select>
                    <i className="fa fa-chevron-down absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                  </div>
                </div>

                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Custom Application Questions
                  </label>
                  <p className="text-gray-600 text-xs md:text-sm mb-2">
                    Add questions that pathfinders must answer when applying (optional)
                  </p>
                  {customQuestions.map((q) => (
                    <div key={q.id} className="flex items-center gap-2 mb-2">
                      <span className="flex-1 text-sm text-gray-700">{q.question}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomQuestion(q.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCustomQuestion}
                    className="mt-2 text-[#6A00B1] font-semibold text-sm hover:underline"
                  >
                    + Add question
                  </button>
                </div>

                <div className="flex justify-end mt-6 md:mt-8">
                  <button
                    onClick={handlePost}
                    disabled={!canPost()}
                    className={`px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold text-white transition-colors ${
                      canPost()
                        ? 'bg-[#6A00B1] hover:bg-[#5A0091]'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })}
      />
    </div>
  );
};

export default CreateOpportunity;
