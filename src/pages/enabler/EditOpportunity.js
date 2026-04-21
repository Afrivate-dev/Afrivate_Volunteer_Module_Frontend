import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { opportunities } from "../../services/api";
import { combineDescription, parseDescription, createOpportunityLink } from "../../utils/descriptionUtils";

const EditOpportunity = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [opportunityFound, setOpportunityFound] = useState(false);

  useEffect(() => {
    document.title = "Edit Opportunity - AfriVate";
    
    const loadOpportunity = async () => {
      try {
        const data = await opportunities.get(id);
        if (data) {
          setOpportunityFound(true);
          // Parse the combined description into separate sections
          const parsed = parseDescription(data.description || "");
          setFormData({
            title: data.title || "",
            description: parsed.description || "",
            keyResponsibilities: parsed.keyResponsibilities || "",
            requirementsBenefits: parsed.requirementsBenefits || "",
            aboutCompany: parsed.aboutCompany || "",
            applicationInstructions: parsed.applicationInstructions || "",
            workModel: parsed.workModel || "Hybrid",
            location: parsed.location || "",
            timeCommitment: parsed.timeCommitment || "",
            opportunityType: data.opportunity_type || "volunteering",
          });
          
          // Try to load custom questions from session storage
          try {
            const savedQuestions = sessionStorage.getItem(`opportunity_questions_${id}`);
            if (savedQuestions) {
              setCustomQuestions(JSON.parse(savedQuestions));
            }
          } catch (e) {
            // no custom questions stored
          }
        }
      } catch (err) {
        console.error("Error loading opportunity:", err);
        setOpportunityFound(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadOpportunity();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCustomQuestion = () => {
    const q = newQuestion.trim();
    if (q) {
      setCustomQuestions((prev) => [...prev, { id: `q-${Date.now()}`, question: q }]);
      setNewQuestion("");
      setShowAddQuestion(false);
    }
  };
  
  const removeCustomQuestion = (qId) => {
    setCustomQuestions((prev) => prev.filter((x) => x.id !== qId));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setToast({ isOpen: true, message: "Please fill in title and description.", type: "error" });
      return;
    }

    setSaving(true);
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
      });

      const link = createOpportunityLink(formData.title, formData.opportunityType);
      if (!link.startsWith("https://")) {
        throw new Error("Generated opportunity link must use HTTPS. Please contact support.");
      }

      const updateData = {
        title: formData.title,
        description: combinedDesc,
        opportunity_type: formData.opportunityType,
        link,
        is_open: true,
      };

      await opportunities.update(id, updateData);
      
      // Save custom questions to session storage
      if (customQuestions.length > 0) {
        sessionStorage.setItem(`opportunity_questions_${id}`, JSON.stringify(customQuestions));
      }

      setToast({ isOpen: true, message: "Opportunity updated successfully!", type: "success" });
      setTimeout(() => navigate(`/enabler/opportunity/${id}`), 1200);
    } catch (err) {
      console.error("Error updating opportunity:", err);
      const body = err?.body;
      let msg = err?.message || "Failed to update opportunity. Please try again.";
      if (body && typeof body === "object") {
        if (typeof body.detail === "string") msg = body.detail;
        else if (Array.isArray(body.detail)) msg = body.detail.join(". ");
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
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!opportunityFound) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-gray-500">Opportunity not found.</p>
            <button
              onClick={() => navigate('/enabler/opportunities-posted')}
              className="mt-4 text-[#6A00B1] font-semibold hover:underline"
            >
              Back to opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <EnablerNavbar />
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(`/enabler/opportunity/${id}`)}
            className="mb-4 text-[#6A00B1] hover:text-[#5A0091] transition-colors"
          >
            <i className="fa fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Edit Opportunity</h1>
          <p className="text-gray-600 mb-6">Update the opportunity details below.</p>

          <div className="bg-white rounded-[30px] p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
            <div>
              <label className="block text-sm md:text-base font-bold text-black mb-2">Opportunity Type</label>
              <select
                name="opportunityType"
                value={formData.opportunityType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 bg-white text-sm md:text-base"
              >
                <option value="volunteering">Volunteering</option>
                <option value="internship">Internship</option>
                <option value="scholarship">Scholarship</option>
                <option value="job">Job</option>
                <option value="grant">Grant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm md:text-base font-bold text-black mb-2">Opportunity Title</label>
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
              <label className="block text-sm md:text-base font-bold text-black mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter opportunity description"
                rows="5"
                className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 resize-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-bold text-black mb-2">Key Responsibilities</label>
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
              <label className="block text-sm md:text-base font-bold text-black mb-2">Requirements & Benefits</label>
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
              <label className="block text-sm md:text-base font-bold text-black mb-2">About the Organization</label>
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
              <label className="block text-sm md:text-base font-bold text-black mb-2">Application Instructions</label>
              <textarea
                name="applicationInstructions"
                value={formData.applicationInstructions}
                onChange={handleInputChange}
                placeholder="Provide any special instructions for applicants"
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 resize-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-bold text-black mb-2">Work Model</label>
              <select
                name="workModel"
                value={formData.workModel}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 bg-white text-sm md:text-base"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm md:text-base font-bold text-black mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Lagos, Nigeria or Remote"
                className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm md:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter any location - city, country, or "Remote" for remote positions
              </p>
            </div>
            <div>
              <label className="block text-sm md:text-base font-bold text-black mb-2">Time Commitment</label>
              <select
                name="timeCommitment"
                value={formData.timeCommitment}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 bg-white text-sm md:text-base"
              >
                <option value="">Select time commitment</option>
                <option value="Part-time">Part-time</option>
                <option value="Full-time">Full-time</option>
                <option value="Flexible">Flexible</option>
                <option value="Project-based">Project-based</option>
              </select>
            </div>
            <div>
              <label className="block text-sm md:text-base font-bold text-black mb-2">Custom Application Questions</label>
              <p className="text-gray-600 text-xs mb-2">Add or remove questions applicants must answer</p>
              {customQuestions.map((q) => (
                <div key={q.id} className="flex items-center gap-2 mb-2">
                  <span className="flex-1 text-sm text-gray-700">{q.question}</span>
                  <button type="button" onClick={() => removeCustomQuestion(q.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Remove</button>
                </div>
              ))}
              {showAddQuestion ? (
                <div className="mt-2 p-3 border border-purple-200 rounded-lg bg-purple-50">
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter your question for applicants"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A00B1]"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={addCustomQuestion}
                      disabled={!newQuestion.trim()}
                      className="px-3 py-1.5 bg-[#6A00B1] text-white text-sm rounded-lg hover:bg-[#5A0091] disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddQuestion(false); setNewQuestion(""); }}
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
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/enabler/opportunity/${id}`)}
                className="border-2 border-[#6A00B1] text-[#6A00B1] px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
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

export default EditOpportunity;
