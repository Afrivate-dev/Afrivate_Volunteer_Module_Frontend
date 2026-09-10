import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/auth/Navbar';
import EnablerNavbar from '../../components/auth/EnablerNavbar';
import { getRole, engagements as apiEngagements } from '../../services/api';
import {
  ChevronDown,
  Share2,
  CheckCircle2,
  Check,
  Award,
  Eye,
  Calendar,
  MapPin,
  ShieldCheck,
  Download,
  Plus,
  Loader
} from 'lucide-react';

export default function MyExperience() {
  const navigate = useNavigate();
  const isEnabler = getRole() === 'enabler';

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  
  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedEngagementId, setSelectedEngagementId] = useState(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDate, setTaskDate] = useState('');

  const fetchExperiences = async () => {
    try {
      const data = await apiEngagements.list();
      setExperiences(data || []);
      if (data && data.length > 0 && !expandedId) {
        setExpandedId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch engagements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const activeExperience = experiences.find((exp) => exp.id === expandedId) || experiences[0];

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  const handleRequestAttestation = async (id) => {
    try {
      await apiEngagements.requestAttestation(id);
      alert('Attestation requested successfully!');
      fetchExperiences();
    } catch (err) {
      alert(err.message || 'Failed to request attestation');
    }
  };

  const handleGenerateCertificate = async (id) => {
    try {
      await apiEngagements.generateCertificate(id);
      alert('Certificate generated!');
      fetchExperiences();
    } catch (err) {
      alert(err.message || 'Failed to generate certificate');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await apiEngagements.createTask(selectedEngagementId, {
        description: taskDescription,
        date: taskDate
      });
      alert('Task added successfully!');
      setIsTaskModalOpen(false);
      setTaskDescription('');
      setTaskDate('');
      fetchExperiences();
    } catch (err) {
      alert(err.message || 'Failed to add task');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-[#8D4087]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      {isEnabler ? <EnablerNavbar /> : <NavBar />}

      <div className="pt-16">
        {/* Purple gradient header */}
        <div
          style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }}
          className="px-4 sm:px-8 py-6 sm:py-8"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-3 hover:bg-white/30 transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                My Experience
              </h1>
              <p className="text-purple-200 text-sm max-w-xl">
                Everything you've added is shown below. Review the details before requesting attestation.
              </p>
            </div>

            <div className="relative shrink-0">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 border border-white/40 text-white hover:bg-white hover:text-[#70236A] rounded-xl px-4 py-2 text-sm font-semibold transition shadow-sm bg-white/10"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              {copiedNotification && (
                <span className="absolute right-0 top-full mt-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded shadow-sm whitespace-nowrap">
                  Link copied to clipboard!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          {experiences.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No experiences found. Apply for opportunities to start your journey!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Experience Cards */}
              <div className="lg:col-span-8 space-y-5">
                {experiences.map((exp) => {
                  const isExpanded = expandedId === exp.id;
                  const isAttested = exp.status === 'attested';
                  const isPending = exp.status === 'pending_attestation';

                  return (
                    <div
                      key={exp.id}
                      className={`bg-white rounded-2xl border transition-all shadow-sm ${
                        isExpanded ? 'border-gray-200/90' : 'border-gray-200/70 hover:border-purple-200'
                      }`}
                    >
                      {/* Collapsed View / Card Header */}
                      {!isExpanded ? (
                        <div
                          onClick={() => handleToggle(exp.id)}
                          className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-4 min-w-0">
                            {/* Document icon thumbnail */}
                            <div className="w-12 h-13 rounded-lg border border-gray-200 bg-gray-50 flex flex-col justify-between p-1.5 shadow-inner shrink-0">
                              <div className="w-full space-y-1">
                                <div className="h-1 bg-gray-300 rounded-sm w-3/4"></div>
                                <div className="h-1 bg-gray-200 rounded-sm w-full"></div>
                                <div className="h-1 bg-gray-200 rounded-sm w-5/6"></div>
                              </div>
                              <div className="w-2 h-2 rounded-full bg-purple-400 self-end"></div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-gray-900 leading-snug truncate">
                                  {exp.role_title || 'Volunteer Role'}
                                </h3>
                                {isAttested && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F8F0] text-[#1B804B]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Organization attested
                                  </span>
                                )}
                                {isPending && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                    Pending Review
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-semibold text-[#8D4087] mt-0.5">
                                {exp.organization_name}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                  {exp.start_date} {exp.end_date ? `- ${exp.end_date}` : '- Present'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(exp.id);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition shrink-0"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        /* Expanded View (Profile Preview) */
                        <div className="p-6 sm:p-8 space-y-6">
                          {/* Top Preview Banner */}
                          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                              <Eye className="w-4 h-4 text-gray-600" />
                              <span>Experience details</span>
                            </div>
                            <button
                              onClick={() => handleToggle(exp.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                              title="Collapse view"
                            >
                              <ChevronDown className="w-5 h-5 rotate-180" />
                            </button>
                          </div>

                          {/* Header info */}
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-14 rounded-lg border border-gray-200 bg-gray-50 flex flex-col justify-between p-1.5 shadow-inner shrink-0">
                              <div className="w-full space-y-1">
                                <div className="h-1 bg-gray-300 rounded-sm w-3/4"></div>
                                <div className="h-1 bg-gray-200 rounded-sm w-full"></div>
                                <div className="h-1 bg-gray-200 rounded-sm w-5/6"></div>
                              </div>
                              <div className="w-2 h-2 rounded-full bg-purple-400 self-end"></div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                                  {exp.role_title || 'Volunteer Role'}
                                </h3>
                                {isAttested && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F8F0] text-[#1B804B]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Organization attested
                                  </span>
                                )}
                                {isPending && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                    Pending Review
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-bold text-[#8D4087] mt-0.5">
                                {exp.organization_name}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                  {exp.start_date} {exp.end_date ? `- ${exp.end_date}` : '- Present'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Key Contributions */}
                          <div>
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                Key Tasks Logged
                              </h4>
                              {isAttested && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5FB] text-[#8D4087] border border-purple-100">
                                  <ShieldCheck className="w-3 h-3 text-[#8D4087]" />
                                  Attested Data
                                </span>
                              )}
                            </div>

                            {exp.tasks && exp.tasks.length > 0 ? (
                              <ul className="space-y-2.5">
                                {exp.tasks.map((task) => (
                                  <li key={task.id} className="flex items-start gap-2.5">
                                    <Check className="w-4 h-4 text-[#8D4087] shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-600">{task.description} <span className="text-xs text-gray-400 ml-2">({task.date})</span></span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No tasks logged yet.</p>
                            )}

                            {(!isAttested && !isPending) && (
                              <button
                                onClick={() => {
                                  setSelectedEngagementId(exp.id);
                                  setIsTaskModalOpen(true);
                                }}
                                className="mt-4 inline-flex items-center gap-1 px-3 py-1.5 border border-[#8D4087] text-[#8D4087] text-sm font-semibold rounded-lg hover:bg-purple-50 transition"
                              >
                                <Plus className="w-4 h-4" /> Add Task
                              </button>
                            )}
                          </div>

                          {/* Skills Applied */}
                          {exp.role_skill_tags && exp.role_skill_tags.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                                Target Skills
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {exp.role_skill_tags.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-[#FAF5FB] text-[#8D4087] border border-purple-100/90 rounded-full text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          {(!isAttested && !isPending) && (
                            <div className="pt-4 border-t border-gray-100">
                              <button
                                onClick={() => handleRequestAttestation(exp.id)}
                                className="w-full bg-[#8D4087] text-white py-2.5 rounded-xl font-semibold hover:bg-[#651F5F] transition"
                              >
                                Request Attestation from Organization
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Attestation Sidebar */}
              {activeExperience && (
                <div className="lg:col-span-4 space-y-5">
                  {/* Card 1: Organization Attested */}
                  {activeExperience.status === 'attested' ? (
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#FAF5FB] text-[#8D4087] flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-[#8D4087]" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">
                          Organization attested
                        </h3>
                      </div>

                      <div className="bg-[#FAF9FB] rounded-xl p-4 border border-gray-100 space-y-3.5">
                        <div>
                          <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-0.5">
                            Official Attestation Confirmed By:
                          </span>
                          <p className="text-xs font-semibold text-gray-800">
                            {activeExperience.attested_by_name || activeExperience.organization_name}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/50">
                          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                            Attested On:
                          </span>
                          <span className="text-xs font-semibold text-gray-800">
                            {new Date(activeExperience.attested_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : activeExperience.status === 'pending_attestation' ? (
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-orange-600">
                        Waiting for Organization...
                      </h3>
                      <p className="text-xs text-gray-500">Your engagement has been submitted to the organization. Once they verify your tasks, your certificate will be generated.</p>
                    </div>
                  ) : activeExperience.status === 'disputed' ? (
                    <div className="bg-white rounded-2xl border border-red-200 p-5 sm:p-6 shadow-sm space-y-4 bg-red-50/50">
                      <h3 className="text-sm font-bold text-red-600">
                        Action Required: Disputed
                      </h3>
                      <p className="text-xs text-gray-700">The organization flagged an issue with your log:</p>
                      <p className="text-xs font-medium italic text-gray-900 bg-white p-3 rounded-lg border border-red-100">"{activeExperience.dispute_reason}"</p>
                    </div>
                  ) : null}

                  {/* Card 2: Credential Available */}
                  {activeExperience.status === 'attested' && (
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                      <div className="w-12 h-12 rounded-full bg-[#FAF5FB] border border-purple-100 flex items-center justify-center text-[#8D4087] mb-3 shadow-inner">
                        <Award className="w-6 h-6" />
                      </div>

                      <h3 className="text-base font-bold text-gray-900 mb-1">
                        Credential available
                      </h3>

                      <div className="mb-5">
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium bg-[#FAF5FB] text-[#8D4087] border border-purple-100/70">
                          <Check className="w-3 h-3 text-[#8D4087]" />
                          Verified experience
                        </span>
                      </div>

                      {!activeExperience.certificate ? (
                        <button
                          onClick={() => handleGenerateCertificate(activeExperience.id)}
                          className="w-full py-2.5 px-4 border border-[#8D4087] text-[#8D4087] hover:bg-[#8D4087] hover:text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-4 h-4" />
                          Generate Digital Certificate
                        </button>
                      ) : (
                        <a
                          href={`/verify/${activeExperience.certificate.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-4 border border-[#8D4087] bg-[#8D4087] text-white hover:bg-[#651F5F] rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Award className="w-4 h-4" />
                          View Public Certificate
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-[#8D4087]">Log a Task</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#8D4087]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="What did you do?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#8D4087]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8D4087] text-white font-medium hover:bg-[#651F5F] rounded-lg transition"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
