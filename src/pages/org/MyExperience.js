import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnablerNavbar from '../../components/auth/EnablerNavbar';
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
  FileText,
  Play,
  Download
} from 'lucide-react';

export default function MyExperience() {
  const navigate = useNavigate();

  // Experiences data matching screenshots
  const experiences = [
    {
      id: 'event-logistics',
      title: 'Event Logistics Volunteer',
      organization: 'Alafia Empowerment Foundation',
      dateRange: 'June 12, 2026 – June 28, 2026',
      location: 'Abuja, Nigeria',
      isAttested: true,
      description:
        'I supported event logistics and volunteer coordination for a community-focused program, helping with participant registration, event setup, coordination, and on-site support.',
      contributions: [
        'Coordinated volunteer check-in',
        'Supported participant registration',
        'Assisted with event setup'
      ],
      skills: ['Project Coordination', 'Event Operations', 'Community Outreach'],
      evidence: [
        {
          type: 'image',
          name: 'Event setup.jpg',
          preview: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80'
        },
        {
          type: 'video',
          name: 'Volunteer coordination.mp4',
          preview: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80'
        },
        {
          type: 'document',
          name: 'Participation letter.pdf'
        }
      ],
      attestation: {
        roleAttestedBy: 'Jane Doe, Event Logistics Volunteer',
        confirmedBy: 'Amaka Okafor (CEO, Alafia Empowerment Foundation)',
        attestedOn: 'June 28, 2026'
      }
    },
    {
      id: 'social-media',
      title: 'Social Media Manager',
      organization: 'Wat Empowerment Foundation',
      dateRange: 'June 12, 2026 – June 28, 2026',
      location: 'Abuja, Nigeria',
      isAttested: true,
      description:
        'I supported event logistics and volunteer coordination for a community-focused program, helping with participant registration, event setup, coordination, and on-site support.',
      contributions: [
        'Coordinated volunteer check-in',
        'Supported participant registration',
        'Assisted with event setup'
      ],
      skills: ['Project Coordination', 'Event Operations', 'Community Outreach'],
      evidence: [
        {
          type: 'image',
          name: 'Event setup.jpg',
          preview: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80'
        },
        {
          type: 'video',
          name: 'Volunteer coordination.mp4',
          preview: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80'
        },
        {
          type: 'document',
          name: 'Participation letter.pdf'
        }
      ],
      attestation: {
        roleAttestedBy: 'Jane Doe, Social Media Manager',
        confirmedBy: 'Amaka Okafor (CEO, WAT Empowerment Foundation)',
        attestedOn: 'June 28, 2026'
      }
    }
  ];

  // In Screenshot 1, 'social-media' is expanded. In Screenshot 2, 'event-logistics' is expanded.
  const [expandedId, setExpandedId] = useState('social-media');
  const [copiedNotification, setCopiedNotification] = useState(false);

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

  const handleDownloadCredential = () => {
    alert(`Downloading verified credential certificate for "${activeExperience.title}"...`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />

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
                Everything you've added is shown below. Review the details before adding this experience to your profile.
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Experience Cards */}
          <div className="lg:col-span-8 space-y-5">
            {experiences.map((exp) => {
              const isExpanded = expandedId === exp.id;

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
                              {exp.title}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F8F0] text-[#1B804B]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Organization attested
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-[#8D4087] mt-0.5">
                            {exp.organization}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {exp.dateRange}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {exp.location}
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
                          <span>Profile preview</span>
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
                              {exp.title}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F8F0] text-[#1B804B]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Organization attested
                            </span>
                          </div>

                          <p className="text-xs font-bold text-[#8D4087] mt-0.5">
                            {exp.organization}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {exp.dateRange}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {exp.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                          Description
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {exp.description}
                        </p>
                      </div>

                      {/* Key Contributions */}
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Key Contributions
                          </h4>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5FB] text-[#8D4087] border border-purple-100">
                            <ShieldCheck className="w-3 h-3 text-[#8D4087]" />
                            Attested Data
                          </span>
                        </div>

                        <ul className="space-y-2.5">
                          {exp.contributions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <Check className="w-4 h-4 text-[#8D4087] shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Skills Applied */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                          Skills Applied
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {exp.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-[#FAF5FB] text-[#8D4087] border border-purple-100/90 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Supporting Evidence */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                          Supporting Evidence
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Image evidence */}
                          <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-900 group shadow-sm border border-gray-200">
                            <img
                              src={exp.evidence[0].preview}
                              alt="Event setup"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                              <span className="text-[11px] text-white font-medium truncate">
                                {exp.evidence[0].name}
                              </span>
                            </div>
                          </div>

                          {/* Video evidence */}
                          <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-900 group shadow-sm border border-gray-200 flex items-center justify-center">
                            <img
                              src={exp.evidence[1].preview}
                              alt="Volunteer coordination"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30"></div>
                            <div className="relative w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md">
                              <Play className="w-4 h-4 text-gray-900 fill-gray-900 ml-0.5" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                              <span className="text-[11px] text-white font-medium truncate">
                                {exp.evidence[1].name}
                              </span>
                            </div>
                          </div>

                          {/* Document evidence */}
                          <div className="rounded-xl border border-gray-200 bg-[#FAF9FB] flex flex-col items-center justify-center p-4 text-center hover:bg-purple-50/50 transition cursor-pointer shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-purple-100/70 text-[#8D4087] flex items-center justify-center mb-2">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 truncate max-w-full">
                              {exp.evidence[2].name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Attestation Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Card 1: Organization Attested */}
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
                    Role Attested By:
                  </span>
                  <p className="text-xs font-semibold text-gray-800">
                    {activeExperience.attestation.roleAttestedBy}
                  </p>
                </div>

                <div>
                  <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-0.5">
                    Official Attestation Confirmed By:
                  </span>
                  <p className="text-xs font-semibold text-gray-800">
                    {activeExperience.attestation.confirmedBy}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-200/50">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    Attested On:
                  </span>
                  <span className="text-xs font-semibold text-gray-800">
                    {activeExperience.attestation.attestedOn}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Credential Available */}
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

              <button
                onClick={handleDownloadCredential}
                className="w-full py-2.5 px-4 border border-[#8D4087] text-[#8D4087] hover:bg-[#8D4087] hover:text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
