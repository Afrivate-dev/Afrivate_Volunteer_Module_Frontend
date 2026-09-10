import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EnablerNavbar from '../../components/auth/EnablerNavbar';
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

export default function Registration() {
  const navigate = useNavigate();
  const cacFileInputRef = useRef(null);

  // 1. Is organization formally registered? ('yes' | 'no')
  const [isRegistered, setIsRegistered] = useState('yes');

  // 2. Registration Authority
  const [authority] = useState('CAC Corporate Affairs Commission');
  const [country] = useState('Nigeria');

  // 3. Registration Type ('RC' | 'BN' | 'IT')
  const [registrationType, setRegistrationType] = useState('IT');

  // 4. CAC Registration Number
  const [cacNumber, setCacNumber] = useState('');

  // 5. CAC Certificate document upload
  const [cacCertificate, setCacCertificate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // 6. Optional SCUML Registration Number
  const [scumlNumber, setScumlNumber] = useState('');

  const handleCacFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCacCertificate({
        file,
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedAt: 'Just now'
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
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

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    navigate('/enabler/congratulations');
  };

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
                          onClick={() => setRegistrationType(type.id)}
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

                {/* Section 4: CAC Registration Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-900">
                    CAC Registration Number
                  </label>

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={cacNumber}
                      onChange={(e) => setCacNumber(e.target.value)}
                      placeholder="Enter your RC, BN, or IT number"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white pr-10"
                    />
                    <span className="absolute right-4 text-gray-400 font-bold">#</span>
                  </div>

                  {/* Info helper banner */}
                  <div className="bg-[#FAF7FA] border border-purple-100 rounded-xl p-3 flex items-center gap-2.5 text-xs text-gray-600 mt-2">
                    <Info className="w-4 h-4 text-[#8D4087] shrink-0" />
                    <span>
                      Make sure the registered organization name matches the name you provided earlier.
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

                {/* Section 6: Optional SCUML Verification */}
                <div className="border border-dashed border-gray-200 rounded-xl p-5 bg-[#FAFAFA] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-700" />
                      <span className="text-xs font-bold text-gray-800">
                        Optional SCUML Verification
                      </span>
                    </div>
                    <span className="bg-gray-100 text-gray-500 font-semibold text-[10px] px-2 py-0.5 rounded uppercase">
                      OPTIONAL
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    As an NGO (Incorporated Trustee), providing your SCUML certificate number speeds up higher-tier verification.
                  </p>

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
                </div>
              </>
            )}
          </div>

          {/* Bottom Navigation Bar */}
          <div className="border-t border-gray-200/70 pt-6 mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="bg-[#FAF5FB] hover:bg-purple-100/70 text-[#70236A] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="bg-[#70236A] hover:bg-[#591B54] text-white font-semibold text-xs sm:text-sm px-7 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
