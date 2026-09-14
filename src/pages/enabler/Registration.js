import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnablerNavbar from '../../components/auth/EnablerNavbar';
import Toast from '../../components/common/Toast';
import { organization, profile, getApiErrorMessage } from '../../services/api';
import { getDraftOrgId, setDraftOrgId } from '../../utils/orgDraft';
import {
  Landmark,
  Shield,
  UploadCloud,
  FileText,
  Trash2,
  Info,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  FileCheck
} from 'lucide-react';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB, matches backend limit
const CAC_ACCEPT = ['application/pdf', 'image/jpeg', 'image/png'];

const ORG_TYPES = [
  { id: 'ngo', label: 'NGO / Nonprofit' },
  { id: 'company', label: 'Company' },
  { id: 'school', label: 'School' },
  { id: 'government', label: 'Government body' },
  { id: 'community_group', label: 'Community group' },
  { id: 'other', label: 'Other' },
];

export default function Registration() {
  const navigate = useNavigate();
  const cacFileInputRef = useRef(null);
  const scumlFileInputRef = useRef(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'error' });
  const [orgId, setOrgId] = useState(null);
  const [orgName, setOrgName] = useState('');

  // 1. Is organization formally registered? ('yes' | 'no')
  const [isRegistered, setIsRegistered] = useState('yes');

  // 2. Registration Authority
  const [authority] = useState('CAC Corporate Affairs Commission');
  const [country, setCountry] = useState('Nigeria');

  // 3. Registration Type ('RC' | 'BN' | 'IT') — informational only today; the
  // backend has no registry_type/registry_id field yet (Sprint 5, not built),
  // so this doesn't get submitted anywhere. It still drives the organization_type
  // default below, since IT almost always means an NGO.
  const [registrationType, setRegistrationType] = useState('IT');

  // Required by the backend to create an organization, and gates whether the
  // SCUML upload is offered at all (SCUML only ever applies to NGOs).
  const [organizationType, setOrganizationType] = useState('ngo');

  // 4. CAC Certificate document upload — the actual required artifact; there is
  // no field to submit a bare registration number to yet.
  const [cacCertificate, setCacCertificate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // 5. Optional SCUML Certificate upload + registration number (NGO only)
  const [scumlCertificate, setScumlCertificate] = useState(null);
  const [scumlNumber, setScumlNumber] = useState('');
  const [scumlVerifiedAt, setScumlVerifiedAt] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [profileData, orgs] = await Promise.all([
          profile.enablerGet().catch(() => null),
          organization.mine().catch(() => []),
        ]);
        if (profileData) {
          setOrgName(profileData.name || '');
          const profileCountry = profileData.base_details?.country;
          if (profileCountry) setCountry(profileCountry);
        }

        const draftId = getDraftOrgId();
        const existing = (orgs || []).find((o) => String(o.id) === String(draftId)) || (orgs || [])[0];
        if (existing) {
          setOrgId(existing.id);
          setDraftOrgId(existing.id);
          setOrgName(existing.name || orgName);
          setCountry(existing.country || country);
          if (existing.organization_type) setOrganizationType(existing.organization_type);
          if (existing.scuml_id) setScumlNumber(existing.scuml_id);
          if (existing.scuml_verified_at) setScumlVerifiedAt(existing.scuml_verified_at);
        }
      } finally {
        setInitialLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFile = (file) => {
    if (file.size > MAX_FILE_BYTES) return 'File is too large — max 10MB.';
    if (!CAC_ACCEPT.includes(file.type)) return 'Please upload a PDF, JPG, or PNG file.';
    return null;
  };

  const handleCacFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) return setToast({ isOpen: true, message: err, type: 'error' });
    setCacCertificate({
      file,
      name: file.name,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      uploadedAt: 'Just now'
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const err = validateFile(file);
      if (err) return setToast({ isOpen: true, message: err, type: 'error' });
      setCacCertificate({
        file,
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedAt: 'Just now'
      });
    }
  };

  const handleRemoveCacFile = () => {
    setCacCertificate(null);
    if (cacFileInputRef.current) {
      cacFileInputRef.current.value = '';
    }
  };

  const handleScumlFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) return setToast({ isOpen: true, message: err, type: 'error' });
    setScumlCertificate({
      file,
      name: file.name,
      size: `${(file.size / 1024).toFixed(0)} KB`,
    });
  };

  const handleRemoveScumlFile = () => {
    setScumlCertificate(null);
    if (scumlFileInputRef.current) scumlFileInputRef.current.value = '';
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = async () => {
    if (isRegistered === 'yes' && !cacCertificate) {
      setToast({ isOpen: true, message: 'Please upload your CAC Certificate to continue.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      let currentOrgId = orgId;
      if (!currentOrgId) {
        const created = await organization.create({
          name: orgName || 'My Organization',
          organization_type: organizationType,
          country,
        });
        currentOrgId = created.id;
        setOrgId(currentOrgId);
        setDraftOrgId(currentOrgId);
      } else if (orgName) {
        await organization.update(currentOrgId, { name: orgName, country }).catch(() => {});
      }

      if (isRegistered === 'yes' && cacCertificate?.file) {
        await organization.documents.create(currentOrgId, 'cac_certificate', cacCertificate.file);
      }
      if (organizationType === 'ngo' && scumlCertificate?.file) {
        await organization.documents.create(currentOrgId, 'scuml_certificate', scumlCertificate.file);
      }
      if (organizationType === 'ngo' && scumlNumber.trim()) {
        await organization.update(currentOrgId, { scuml_id: scumlNumber.trim() });
      }

      navigate('/enabler/online-presence');
    } catch (err) {
      setToast({ isOpen: true, message: getApiErrorMessage(err), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans">
        <EnablerNavbar />
        <div className="pt-16 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
        </div>
      </div>
    );
  }

  const registrationTypes = [
    {
      id: 'RC',
      title: 'RC - Private or Public Company',
      description: 'For Limited Liability Companies (LLC), Public Limited Companies (PLC).'
    },
    {
      id: 'BN',
      title: 'BN - Business Name',
      description: 'For Sole Proprietorships and Partnerships.'
    },
    {
      id: 'IT',
      title: 'IT - Incorporated Trustees',
      description: 'For NGOs, Associations, Foundations, and Religious Bodies.'
    }
  ];

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
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-3 hover:bg-white/30 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Tell us about your registration
            </h1>
            <p className="text-purple-200 text-sm max-w-xl">
              If your organization is formally registered, provide the registration details below. This information helps us verify your organization's identity.
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-8">
            {/* Section 1: Is your organization formally registered? */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">
                Is your organization formally registered?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option Yes */}
                <div
                  onClick={() => setIsRegistered('yes')}
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isRegistered === 'yes'
                      ? 'border-[#8D4087] bg-[#FAF5FB]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${
                      isRegistered === 'yes'
                        ? 'bg-[#8D4087] text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isRegistered === 'yes' ? 'text-[#70236A]' : 'text-gray-700'
                    }`}
                  >
                    Yes, my organization is registered
                  </span>
                </div>

                {/* Option No */}
                <div
                  onClick={() => setIsRegistered('no')}
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isRegistered === 'no'
                      ? 'border-[#8D4087] bg-[#FAF5FB]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${
                      isRegistered === 'no'
                        ? 'bg-[#8D4087] text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Landmark className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      isRegistered === 'no' ? 'text-[#70236A]' : 'text-gray-500'
                    }`}
                  >
                    No, my organization is not formally registered
                  </span>
                </div>
              </div>
            </div>

            {isRegistered === 'yes' && (
              <>
                {/* Section 2: Registration Authority */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900">
                    Registration Authority
                  </label>

                  <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-white shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {authority}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {country}
                        </p>
                      </div>
                    </div>

                    <CheckCircle2 className="w-5 h-5 text-[#8D4087]" />
                  </div>
                </div>

                {/* Section 3: Registration Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900">
                    Registration Type
                  </label>

                  <div className="space-y-3">
                    {registrationTypes.map((type) => {
                      const isSelected = registrationType === type.id;
                      return (
                        <div
                          key={type.id}
                          onClick={() => {
                            setRegistrationType(type.id);
                            setOrganizationType(type.id === 'IT' ? 'ngo' : 'company');
                          }}
                          className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#8D4087] bg-[#FAF5FB]'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="pt-0.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-[#8D4087] bg-white'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-[#8D4087]" />
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs sm:text-sm font-bold text-gray-900">
                              {type.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 4: Organization type — determines whether SCUML applies */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-900">
                    Organization Type
                  </label>
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white"
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <div className="bg-[#FAF7FA] border border-purple-100 rounded-xl p-3 flex items-center gap-2.5 text-xs text-gray-600 mt-2">
                    <Info className="w-4 h-4 text-[#8D4087] shrink-0" />
                    <span>
                      A verification number field for your RC/BN/IT number isn't available yet — for now, admins verify your organization directly from the certificate you upload below.
                    </span>
                  </div>
                </div>

                {/* Section 5: CAC Certificate Document Upload */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-bold text-gray-900">
                      Upload CAC Certificate
                    </label>
                    <span className="bg-[#FFEBEB] text-[#E03131] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      REQUIRED
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload a clear scan or digital copy of your official CAC Certificate of Incorporation or Registration.
                  </p>

                  {!cacCertificate ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => cacFileInputRef.current?.click()}
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
                        <span className="text-[#8D4087] font-semibold underline">
                          Click to upload your CAC Certificate
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Supported: PDF, JPG, PNG (Max 10MB)
                      </p>

                      <input
                        ref={cacFileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleCacFileSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="bg-[#FAF7FA] border border-purple-100/90 rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-purple-100/80 text-[#8D4087] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {cacCertificate.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {cacCertificate.size} • {cacCertificate.uploadedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => cacFileInputRef.current?.click()}
                          className="text-xs font-semibold text-[#8D4087] hover:underline px-2 py-1"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveCacFile}
                          className="p-1 text-gray-400 hover:text-red-500 transition"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        ref={cacFileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleCacFileSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Section 6: Optional SCUML Certificate — NGOs only */}
                {organizationType === 'ngo' && (
                  <div className="border border-dashed border-gray-200 rounded-xl p-5 bg-[#FAFAFA] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-700" />
                        <span className="text-xs font-bold text-gray-800">
                          Optional SCUML Certificate
                        </span>
                      </div>
                      <span className="bg-gray-100 text-gray-500 font-semibold text-[10px] px-2 py-0.5 rounded uppercase">
                        OPTIONAL
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      As an NGO, providing your SCUML certificate and number adds an extra "SCUML-Verified" credibility signal once an admin confirms it — it's never required for Tier 1.
                    </p>

                    {scumlVerifiedAt ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        SCUML-Verified
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          SCUML Registration Number
                        </label>
                        <input
                          type="text"
                          value={scumlNumber}
                          onChange={(e) => setScumlNumber(e.target.value)}
                          placeholder="e.g. SCN000000"
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white transition"
                        />
                      </div>
                    )}

                    {!scumlCertificate ? (
                      <button
                        type="button"
                        onClick={() => scumlFileInputRef.current?.click()}
                        className="w-full py-3 border-2 border-dashed border-purple-200 bg-white hover:bg-[#FAF5FB] text-[#70236A] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload SCUML Certificate (PDF, JPG, PNG)</span>
                      </button>
                    ) : (
                      <div className="bg-white border border-purple-100/90 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-[#8D4087] shrink-0" />
                          <span className="text-xs font-bold text-gray-800 truncate">{scumlCertificate.name}</span>
                          <span className="text-[11px] text-gray-400 shrink-0">{scumlCertificate.size}</span>
                        </div>
                        <button type="button" onClick={handleRemoveScumlFile} className="p-1 text-gray-400 hover:text-red-500 transition shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <input
                      ref={scumlFileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleScumlFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Navigation Bar */}
          <div className="border-t border-gray-200/70 pt-6 mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="bg-[#FAF5FB] hover:bg-purple-100/70 text-[#70236A] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={submitting}
              className="bg-[#70236A] hover:bg-[#591B54] text-white font-semibold text-xs sm:text-sm px-7 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition disabled:opacity-60"
            >
              <span>{submitting ? 'Saving…' : 'Continue'}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
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
