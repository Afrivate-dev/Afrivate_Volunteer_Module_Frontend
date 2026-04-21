import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { opportunities } from "../../services/api";
import { combineDescription, createOpportunityLink } from "../../utils/descriptionUtils";

const CreateOpportunity = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Create Opportunity - AfriVate";
  }, []);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keyResponsibilities: "",
    requirementsBenefits: "",
    aboutCompany: "",
    applicationInstructions: "",
    workModel: "Hybrid",
    location: "",
    timeCommitment: "",
    opportunityType: "volunteering",
  });
  const [customQuestions, setCustomQuestions] = useState([]);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [posting, setPosting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProceed = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const addCustomQuestion = () => {
    if (newQuestion && newQuestion.trim()) {
      setCustomQuestions((prev) => [...prev, { id: `q-${Date.now()}`, question: newQuestion.trim() }]);
      setNewQuestion("");
      setShowAddQuestion(false);
    }
  };
  
  const removeCustomQuestion = (id) => {
    setCustomQuestions((prev) => prev.filter((x) => x.id !== id));
  };

  const cancelAddQuestion = () => {
    setNewQuestion("");
    setShowAddQuestion(false);
  };

  const handlePost = async () => {
    setPosting(true);
    try {
      // Combine all sections into description field with markers
      const combinedDesc = combineDescription({
        description: formData.description,
        keyResponsibilities: formData.keyResponsibilities,
        requirementsBenefits: formData.requirementsBenefits,
        aboutCompany: formData.aboutCompany,
        applicationInstructions: formData.applicationInstructions,
        location: formData.location,
        workModel: formData.workModel,
        timeCommitment: formData.timeCommitment,
        customQuestions,
      });

      const link = createOpportunityLink(formData.title, formData.opportunityType);
      if (!link.startsWith("https://")) {
        throw new Error("Generated opportunity link must use HTTPS. Please contact support.");
      }

      const opportunityData = {
        title: formData.title.trim(),
        description: combinedDesc,
        opportunity_type: formData.opportunityType || "volunteering",
        link,
        is_open: true,
      };

      await opportunities.create(opportunityData);

      setToast({ isOpen: true, message: "Opportunity posted successfully!", type: "success" });
      setTimeout(() => {
        navigate(`/enabler/opportunities-posted`, { replace: true, state: { refreshList: true } });
      }, 1200);
      
    } catch (err) {
      console.error("Error posting opportunity:", err);
      const body = err?.body;
      let msg = err?.message || "Failed to post opportunity. Please try again.";
      if (body && typeof body === "object") {
        if (typeof body.detail === "string") msg = body.detail;
        else if (Array.isArray(body.detail)) msg = body.detail.join(". ");
        else if (body.link && Array.isArray(body.link)) msg = `Link: ${body.link.join(". ")}`;
        else if (body.title && Array.isArray(body.title)) msg = `Title: ${body.title.join(". ")}`;
        else if (body.description && Array.isArray(body.description)) msg = `Description: ${body.description.join(". ")}`;
        else {
          const parts = [];
          for (const [k, v] of Object.entries(body)) {
            if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
            else if (typeof v === "string") parts.push(`${k}: ${v}`);
          }
          if (parts.length) msg = parts.join(". ");
        }
      }
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setPosting(false);
    }
  };

  const handleStepClick = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.title.trim() !== "" && formData.description.trim() !== "";
    } else if (currentStep === 2) {
      return formData.keyResponsibilities.trim() !== "" || formData.requirementsBenefits.trim() !== "";
    } else if (currentStep === 3) {
      return formData.location.trim() !== "" && formData.timeCommitment.trim() !== "";
    }
    return false;
  };

  const canPreview = () => {
    return formData.location.trim() !== "" && formData.timeCommitment.trim() !== "";
  };

  const handlePreview = () => {
    if (canPreview()) {
      setShowPreview(true);
      setCurrentStep(4);
    }
  };

  const handleEditFromPreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <EnablerNavbar />
      
      <div className="pt-20 px-4 md:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[30px] p-6 md:p-8 shadow-sm">
            
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                Create an Opportunity
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Post a new volunteering opportunity and connect with talented pathfinders
              </p>
            </div>

            <div className="flex items-center justify-center mb-6 md:mb-8">
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

              <div className="flex items-center">
                <button
                  onClick={() => handleStepClick(3)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep === 3 || showPreview
                      ? 'bg-[#6A00B1] text-white cursor-default' 
                      : 'bg-gray-200 text-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-pointer'
                  }`}
                >
                  3
                </button>
                {currentStep === 3 || showPreview ? (
                  <div className="w-16 md:w-24 h-0.5 border-t-2 border-dashed border-[#6A00B1]"></div>
                ) : currentStep > 3 ? (
                  <div className="w-16 md:w-24 h-0.5 border-t-2 border-dashed border-[#6A00B1]"></div>
                ) : (
                  <div className="w-16 md:w-24 h-0.5 border-t-2 border-dashed border-gray-300"></div>
                )}
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => handleStepClick(4)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep === 4
                      ? 'bg-[#6A00B1] text-white cursor-default' 
                      : showPreview
                      ? 'bg-[#6A00B1] text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!showPreview}
                >
                  4
                </button>
              </div>
            </div>

            {currentStep === 4 && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-900">Preview & Verify Information</h3>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <i className="fa fa-edit"></i> Edit
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-purple-700 font-medium">Opportunity Type:</span>
                      <p className="text-gray-800 capitalize">{formData.opportunityType}</p>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium">Title:</span>
                      <p className="text-gray-800">{formData.title}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Description:</span>
                    <p className="text-gray-800">{formData.description}</p>
                  </div>
                  {formData.keyResponsibilities && (
                    <div>
                      <span className="text-purple-700 font-medium">Key Responsibilities:</span>
                      <p className="text-gray-800 whitespace-pre-wrap">{formData.keyResponsibilities}</p>
                    </div>
                  )}
                  {formData.requirementsBenefits && (
                    <div>
                      <span className="text-purple-700 font-medium">Requirements & Benefits:</span>
                      <p className="text-gray-800 whitespace-pre-wrap">{formData.requirementsBenefits}</p>
                    </div>
                  )}
                  {formData.aboutCompany && (
                    <div>
                      <span className="text-purple-700 font-medium">About the Organization:</span>
                      <p className="text-gray-800">{formData.aboutCompany}</p>
                    </div>
                  )}
                  {formData.applicationInstructions && (
                    <div>
                      <span className="text-purple-700 font-medium">Application Instructions:</span>
                      <p className="text-gray-800">{formData.applicationInstructions}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-purple-700 font-medium">Work Model:</span>
                      <p className="text-gray-800">{formData.workModel}</p>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium">Location:</span>
                      <p className="text-gray-800">{formData.location}</p>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium">Time Commitment:</span>
                      <p className="text-gray-800">{formData.timeCommitment}</p>
                    </div>
                  </div>
                  {customQuestions.length > 0 && (
                    <div>
                      <span className="text-purple-700 font-medium">Custom Questions ({customQuestions.length}):</span>
                      <ul className="text-gray-800 mt-1">
                        {customQuestions.map((q, index) => (
                          <li key={q.id} className="ml-4 list-disc">{q.question}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleEditFromPreview}
                    className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <i className="fa fa-edit mr-1"></i> Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handlePost}
                    disabled={posting}
                    className={`px-4 py-2 bg-[#6A00B1] text-white rounded-lg hover:bg-[#5A0091] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {posting ? "Posting..." : "Confirm & Post"} <i className="fa fa-check ml-1"></i>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Opportunity Type
                  </label>
                  <div className="relative">
                    <select
                      name="opportunityType"
                      value={formData.opportunityType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 appearance-none bg-white pr-8 md:pr-10 text-sm md:text-base"
                    >
                      <option value="volunteering">Volunteering</option>
                      <option value="internship">Internship</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="job">Job</option>
                      <option value="grant">Grant</option>
                    </select>
                    <i className="fa fa-chevron-down absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                  </div>
                </div>

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

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Key Responsibilities
                  </label>
                  <textarea
                    name="keyResponsibilities"
                    value={formData.keyResponsibilities}
                    onChange={handleInputChange}
                    placeholder="Enter key responsibilities for this opportunity"
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 resize-none text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Requirements & Benefits
                  </label>
                  <textarea
                    name="requirementsBenefits"
                    value={formData.requirementsBenefits}
                    onChange={handleInputChange}
                    placeholder="Enter requirements and benefits for this opportunity"
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 resize-none text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    About the Organization
                  </label>
                  <textarea
                    name="aboutCompany"
                    value={formData.aboutCompany}
                    onChange={handleInputChange}
                    placeholder="Tell applicants about your organization"
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 resize-none text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm md:text-base font-bold text-black mb-2">
                    Application Instructions
                  </label>
                  <textarea
                    name="applicationInstructions"
                    value={formData.applicationInstructions}
                    onChange={handleInputChange}
                    placeholder="Provide any special instructions for applicants"
                    rows="3"
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
                    Location <span className="text-gray-500 font-normal">(Enter the location for this opportunity)</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Lagos, Nigeria or Remote or Hybrid"
                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can enter any location - city, country, or "Remote" for remote positions
                  </p>
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
                  
                  {/* Existing Questions List */}
                  {customQuestions.map((q) => (
                    <div key={q.id} className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded">
                      <span className="flex-1 text-sm text-gray-700">{q.question}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomQuestion(q.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>
                  ))}
                  
                  {/* Add Question Form - Inline instead of prompt */}
                  {showAddQuestion ? (
                    <div className="mt-3 p-3 border border-purple-200 rounded-lg bg-purple-50">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter your question
                      </label>
                      <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Type your question here..."
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A00B1]"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={addCustomQuestion}
                          disabled={!newQuestion.trim()}
                          className="px-3 py-1.5 bg-[#6A00B1] text-white text-sm rounded-lg hover:bg-[#5A0091] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={cancelAddQuestion}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddQuestion(true)}
                      className="mt-2 text-[#6A00B1] font-semibold text-sm hover:underline"
                    >
                      + Add question
                    </button>
                  )}
                </div>

                <div className="flex justify-between mt-6 md:mt-8">
                  <button
                    onClick={handlePreview}
                    disabled={!canPreview()}
                    className={`px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-colors ${
                      canPreview()
                        ? 'bg-[#6A00B1] text-white hover:bg-[#5A0091]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Preview & Verify
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
