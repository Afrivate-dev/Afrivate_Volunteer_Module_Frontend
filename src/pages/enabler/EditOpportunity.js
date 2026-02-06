import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";

const EditOpportunity = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
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
  const [opportunityFound, setOpportunityFound] = useState(false);

  useEffect(() => {
    document.title = "Edit Opportunity - AfriVate";
    const opportunities = JSON.parse(localStorage.getItem("enablerOpportunities") || "[]");
    const found = opportunities.find((opp) => opp.id === id || opp.id === String(id));
    setOpportunityFound(!!found);
    if (found) {
      const requirementsText = Array.isArray(found.responsibilities)
        ? found.responsibilities.join("\n")
        : Array.isArray(found.qualifications)
        ? found.qualifications.join("\n")
        : "";
      setFormData({
        title: found.title || "",
        description: found.description || "",
        requirements: requirementsText,
        workModel: found.workModel || "Hybrid",
        location: found.location || "",
        timeCommitment: found.timeCommitment || "",
      });
      setCustomQuestions(Array.isArray(found.customQuestions) ? found.customQuestions : []);
    }
    setLoading(false);
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCustomQuestion = () => {
    const q = window.prompt("Enter your question for applicants:");
    if (q && q.trim()) {
      setCustomQuestions((prev) => [...prev, { id: `q-${Date.now()}`, question: q.trim() }]);
    }
  };
  const removeCustomQuestion = (qId) => {
    setCustomQuestions((prev) => prev.filter((x) => x.id !== qId));
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.requirements.trim()) {
      setToast({ isOpen: true, message: "Please fill in title, description, and requirements.", type: "error" });
      return;
    }
    if (!formData.location.trim() || !formData.timeCommitment.trim()) {
      setToast({ isOpen: true, message: "Please select location and time commitment.", type: "error" });
      return;
    }
    const opportunities = JSON.parse(localStorage.getItem("enablerOpportunities") || "[]");
    const index = opportunities.findIndex((opp) => opp.id === id || opp.id === String(id));
    if (index === -1) {
      setToast({ isOpen: true, message: "Opportunity not found.", type: "error" });
      return;
    }
    const lines = formData.requirements.split("\n").filter((r) => r.trim() !== "");
    const updated = {
      ...opportunities[index],
      title: formData.title,
      description: formData.description,
      responsibilities: lines,
      qualifications: lines,
      workModel: formData.workModel,
      location: formData.location,
      timeCommitment: formData.timeCommitment,
      customQuestions,
      updatedAt: new Date().toISOString(),
    };
    opportunities[index] = updated;
    localStorage.setItem("enablerOpportunities", JSON.stringify(opportunities));
    const qMap = JSON.parse(localStorage.getItem("opportunityCustomQuestions") || "{}");
    qMap[id] = customQuestions;
    qMap[String(id)] = customQuestions;
    localStorage.setItem("opportunityCustomQuestions", JSON.stringify(qMap));
    setToast({ isOpen: true, message: "Opportunity updated successfully!", type: "success" });
    setTimeout(() => navigate(`/enabler/opportunity/${id}`), 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-gray-500">Loading...</p>
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
              <label className="block text-sm md:text-base font-bold text-black mb-2">Requirements (one per line)</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Enter requirements, one per line"
                rows="6"
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
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 bg-white text-sm md:text-base"
              >
                <option value="">Select location</option>
                <option value="Lagos, Nigeria">Lagos, Nigeria</option>
                <option value="Nairobi, Kenya">Nairobi, Kenya</option>
                <option value="Accra, Ghana">Accra, Ghana</option>
                <option value="Cape Town, South Africa">Cape Town, South Africa</option>
                <option value="Dar es Salaam, Tanzania (Remote)">Dar es Salaam, Tanzania (Remote)</option>
                <option value="Remote">Remote</option>
              </select>
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
              <button type="button" onClick={addCustomQuestion} className="mt-2 text-[#6A00B1] font-semibold text-sm hover:underline">+ Add question</button>
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
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors"
              >
                Save changes
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
