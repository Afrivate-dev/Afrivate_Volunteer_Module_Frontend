import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EnablerNavbar from '../../components/auth/EnablerNavbar';
import {
  UploadCloud,
  FileText,
  Trash2,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function ShowWork() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const letterheadInputRef = useRef(null);
  const additionalInputRef = useRef(null);

  // Proof of work uploaded items
  const [proofFiles, setProofFiles] = useState([
    {
      id: '1',
      name: 'Community_Workshop.jpg',
      size: '1.2 MB',
      status: 'Upload complete',
      description: 'Recent community outreach event',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: '2',
      name: 'Annual_Report_2023.pdf',
      size: '4.5 MB',
      status: 'Upload complete',
      description: 'Annual impact report',
      type: 'pdf'
    }
  ]);

  // Letterhead document
  const [letterheadFile, setLetterheadFile] = useState({
    name: 'AfriVote_Letterhead.pdf',
    size: '850 KB'
  });

  // Additional documents
  const [additionalFiles, setAdditionalFiles] = useState([]);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFilesSelected = (files) => {
    const newItems = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'Upload complete',
      description: '',
      type: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'doc',
      thumbnail: file.type.includes('image') ? URL.createObjectURL(file) : null
    }));
    setProofFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveProof = (id) => {
    setProofFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDescriptionChange = (id, text) => {
    setProofFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, description: text } : item))
    );
  };

  const handleLetterheadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLetterheadFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`
      });
    }
  };

  const handleAdditionalFileSelected = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdditionalFiles((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`
        }
      ]);
    }
  };

  const handleRemoveAdditional = (id) => {
    setAdditionalFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleNext = () => {
    navigate('/enabler/congratulations');
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
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-3 hover:bg-white/30 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Show us your work
            </h1>
            <p className="text-purple-200 text-sm max-w-xl">
              Share evidence of programs, events, projects, or activities your organization has carried out. One item is enough to get started.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
          {/* 1. Proof of Work Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Proof of Work
                </h2>
                <span className="bg-[#FFEBEB] text-[#E03131] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  REQUIRED
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload at least one photo, video, or document demonstrating your organization's activities.
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#8D4087] bg-purple-50/60'
                  : 'border-purple-200/80 bg-purple-50/20 hover:bg-purple-50/40'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-purple-100/60 flex items-center justify-center text-[#8D4087] mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>

              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                <span className="text-[#8D4087] font-semibold underline cursor-pointer">
                  Click to browse
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Supported: JPG, PNG, MP4, PDF (Max 10MB each)
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-4 px-4 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
              >
                Browse files
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.mp4,.pdf"
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Uploaded items list */}
            {proofFiles.length > 0 && (
              <div className="space-y-4 pt-2">
                {proofFiles.map((file) => (
                  <div
                    key={file.id}
                    className="border border-gray-200 rounded-xl p-4 bg-white space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {file.type === 'image' && file.thumbnail ? (
                          <img
                            src={file.thumbnail}
                            alt={file.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#8D4087] flex items-center justify-center shrink-0 border border-purple-100">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {file.size} • {file.status}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveProof(file.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition shrink-0"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* What does this show? Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span>What does this show?</span>
                        <span className="bg-gray-100 text-gray-500 font-semibold px-1.5 py-0.5 rounded text-[9px]">
                          OPTIONAL
                        </span>
                      </label>
                      <input
                        type="text"
                        value={file.description}
                        onChange={(e) => handleDescriptionChange(file.id, e.target.value)}
                        placeholder="e.g. Recent community outreach event"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white transition"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Organizational Letterhead Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Organizational Letterhead
                </h2>
                <span className="bg-[#FFEBEB] text-[#E03131] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  REQUIRED
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Please provide an official document on your organization's letterhead.
              </p>
            </div>

            {letterheadFile && (
              <div className="bg-[#FAF7FA] border border-purple-100/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-purple-100/70 text-[#8D4087] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {letterheadFile.name}
                    </p>
                    <p className="text-[11px] text-gray-400">{letterheadFile.size}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => letterheadInputRef.current?.click()}
                  className="text-xs font-semibold text-[#8D4087] hover:underline shrink-0"
                >
                  Replace
                </button>
                <input
                  ref={letterheadInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleLetterheadChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* 3. Additional Supporting Evidence Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Additional Supporting Evidence
                </h2>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  OPTIONAL
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Add any other relevant documents that verify your organization's standing.
              </p>
            </div>

            {/* List of additional docs */}
            {additionalFiles.length > 0 && (
              <div className="space-y-2 mb-3">
                {additionalFiles.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-[#8D4087] shrink-0" />
                      <span className="font-medium text-gray-800 truncate">{doc.name}</span>
                      <span className="text-gray-400">({doc.size})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAdditional(doc.id)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => additionalInputRef.current?.click()}
              className="w-full py-3.5 border-2 border-dashed border-purple-200 bg-[#FAF5FB]/60 hover:bg-[#FAF5FB] text-[#70236A] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add supporting document</span>
            </button>
            <input
              ref={additionalInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleAdditionalFileSelected}
              className="hidden"
            />
          </div>

          {/* Bottom Action Button */}
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={handleNext}
              className="bg-[#70236A] hover:bg-[#591B54] text-white px-10 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition min-w-[200px]"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
