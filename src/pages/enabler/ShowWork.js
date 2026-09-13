import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnablerNavbar from '../../components/auth/EnablerNavbar';
import Toast from '../../components/common/Toast';
import { organization, getApiErrorMessage } from '../../services/api';
import { getDraftOrgId } from '../../utils/orgDraft';
import {
  UploadCloud,
  FileText,
  Trash2,
  ArrowRight,
  Plus
} from 'lucide-react';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** Map a browser File to the document_type the backend expects. */
function proofDocumentType(file) {
  if (file.type.startsWith('image/')) return 'proof_of_work_photo';
  if (file.type === 'video/mp4') return 'proof_of_work_video';
  return 'other';
}

function docToItem(doc) {
  const isImage = /\.(jpe?g|png|webp)$/i.test(doc.file || '');
  return {
    id: doc.id,
    name: doc.file ? doc.file.split('/').pop().split('?')[0] : doc.document_type,
    status: doc.review_status === 'approved' ? 'Approved' : doc.review_status === 'rejected' ? 'Rejected' : 'Pending review',
    type: isImage ? 'image' : 'doc',
    thumbnail: isImage ? doc.file : null,
    url: doc.file,
  };
}

export default function ShowWork() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const letterheadInputRef = useRef(null);
  const additionalInputRef = useRef(null);

  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'error' });

  // Proof of work uploaded items — loaded from the org's real documents
  const [proofFiles, setProofFiles] = useState([]);

  // Letterhead document
  const [letterheadFile, setLetterheadFile] = useState(null);

  // Additional documents (stored as document_type: "other")
  const [additionalFiles, setAdditionalFiles] = useState([]);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const init = async () => {
      const id = getDraftOrgId();
      if (!id) {
        navigate('/enabler/registration');
        return;
      }
      setOrgId(id);
      try {
        const docs = await organization.documents.list(id);
        const proof = [];
        let letterhead = null;
        const extras = [];
        // API returns most-recent-first, so the first letterhead seen is the current one.
        (docs || []).forEach((doc) => {
          if (doc.document_type === 'proof_of_work_photo' || doc.document_type === 'proof_of_work_video') {
            proof.push(docToItem(doc));
          } else if (doc.document_type === 'letterhead') {
            if (!letterhead) letterhead = docToItem(doc);
          } else if (doc.document_type !== 'cac_certificate' && doc.document_type !== 'scuml_certificate') {
            extras.push(docToItem(doc));
          }
        });
        setProofFiles(proof);
        setLetterheadFile(letterhead);
        setAdditionalFiles(extras);
      } catch (err) {
        setToast({ isOpen: true, message: getApiErrorMessage(err), type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFile = (file) => {
    if (file.size > MAX_FILE_BYTES) return 'File is too large — max 10MB.';
    return null;
  };

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

  const handleFilesSelected = async (files) => {
    setUploadingProof(true);
    try {
      for (const file of Array.from(files)) {
        const err = validateFile(file);
        if (err) {
          setToast({ isOpen: true, message: `${file.name}: ${err}`, type: 'error' });
          continue;
        }
        const doc = await organization.documents.create(orgId, proofDocumentType(file), file);
        setProofFiles((prev) => [...prev, docToItem(doc)]);
      }
    } catch (err) {
      setToast({ isOpen: true, message: getApiErrorMessage(err), type: 'error' });
    } finally {
      setUploadingProof(false);
    }
  };

  const handleRemoveProof = async (id) => {
    const prev = proofFiles;
    setProofFiles((p) => p.filter((item) => item.id !== id));
    try {
      await organization.documents.delete(id);
    } catch (err) {
      setProofFiles(prev);
      setToast({ isOpen: true, message: getApiErrorMessage(err), type: 'error' });
    }
  };

  const handleLetterheadChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) return setToast({ isOpen: true, message: err, type: 'error' });
    try {
      const doc = await organization.documents.create(orgId, 'letterhead', file);
      setLetterheadFile(docToItem(doc));
    } catch (err2) {
      setToast({ isOpen: true, message: getApiErrorMessage(err2), type: 'error' });
    }
  };

  const handleAdditionalFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) return setToast({ isOpen: true, message: err, type: 'error' });
    try {
      const doc = await organization.documents.create(orgId, 'other', file);
      setAdditionalFiles((prev) => [...prev, docToItem(doc)]);
    } catch (err2) {
      setToast({ isOpen: true, message: getApiErrorMessage(err2), type: 'error' });
    }
  };

  const handleRemoveAdditional = async (id) => {
    const prev = additionalFiles;
    setAdditionalFiles((p) => p.filter((item) => item.id !== id));
    try {
      await organization.documents.delete(id);
    } catch (err) {
      setAdditionalFiles(prev);
      setToast({ isOpen: true, message: getApiErrorMessage(err), type: 'error' });
    }
  };

  const handleNext = () => {
    if (proofFiles.length === 0) {
      setToast({ isOpen: true, message: 'Please upload at least one item of proof-of-work before continuing.', type: 'error' });
      return;
    }
    if (!letterheadFile) {
      setToast({ isOpen: true, message: 'Please upload your organizational letterhead before continuing.', type: 'error' });
      return;
    }
    setSaving(true);
    navigate('/enabler/congratulations');
  };

  if (loading) {
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
                disabled={uploadingProof}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-4 px-4 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
              >
                {uploadingProof ? 'Uploading…' : 'Browse files'}
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
                            {file.status}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveProof(file.id)}
                        disabled={file.status !== 'Pending review'}
                        title={file.status !== 'Pending review' ? 'A reviewed document can no longer be removed' : 'Delete file'}
                        className="p-1 text-gray-400 hover:text-red-500 transition shrink-0 disabled:opacity-30 disabled:hover:text-gray-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

            {letterheadFile ? (
              <div className="bg-[#FAF7FA] border border-purple-100/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-purple-100/70 text-[#8D4087] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {letterheadFile.name}
                    </p>
                    <p className="text-[11px] text-gray-400">{letterheadFile.status}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => letterheadInputRef.current?.click()}
                  className="text-xs font-semibold text-[#8D4087] hover:underline shrink-0"
                >
                  Replace
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => letterheadInputRef.current?.click()}
                className="w-full py-3.5 border-2 border-dashed border-purple-200 bg-[#FAF5FB]/60 hover:bg-[#FAF5FB] text-[#70236A] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload letterhead (PDF, JPG, PNG)</span>
              </button>
            )}
            <input
              ref={letterheadInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleLetterheadChange}
              className="hidden"
            />
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
                      <span className="text-gray-400">({doc.status})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAdditional(doc.id)}
                      disabled={doc.status !== 'Pending review'}
                      title={doc.status !== 'Pending review' ? 'A reviewed document can no longer be removed' : 'Delete file'}
                      className="text-gray-400 hover:text-red-500 ml-2 disabled:opacity-30 disabled:hover:text-gray-400"
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
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleAdditionalFileSelected}
              className="hidden"
            />
          </div>

          {/* Bottom Action Button */}
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="bg-[#70236A] hover:bg-[#591B54] text-white px-10 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition min-w-[200px] disabled:opacity-60"
            >
              <span>{saving ? 'Saving…' : 'Next'}</span>
              {!saving && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
