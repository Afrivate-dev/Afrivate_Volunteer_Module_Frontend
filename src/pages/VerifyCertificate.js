import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { engagements as apiEngagements } from '../services/api';
import logoImg from '../Assets/afrivate-logo.svg';
import { Download, FileText, Loader, ShieldCheck } from 'lucide-react';

export default function VerifyCertificate() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const data = await apiEngagements.verifyCertificate(id);
        setCertificate(data);
      } catch (err) {
        console.error("Failed to verify certificate:", err);
        setError('Certificate not found, invalid, or revoked.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <Loader className="w-10 h-10 animate-spin text-[#8D4087] mb-4" />
        <p className="text-gray-500 font-medium tracking-wider text-sm uppercase">Verifying Credential...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="inline-flex px-6 py-2.5 bg-[#8D4087] text-white rounded-xl font-bold hover:bg-[#651F5F] transition">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans py-12 px-4 sm:px-6 flex flex-col items-center justify-center">

      {/* Certificate Container (A4 Landscape aspect ratio) */}
      <div className="relative w-full max-w-[1000px] aspect-[1.414/1] bg-white shadow-2xl overflow-hidden flex flex-col items-center p-8 sm:p-16 border border-gray-200">

        {/* Abstract Purple Corner - Top Right */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%]">
          <svg viewBox="0 0 200 200" className="w-full h-full text-[#8D4087] opacity-90 origin-top-right transform scale-150" fill="currentColor">
            <path d="M 200,0 L 200,200 C 120,150 80,100 0,0 Z" />
          </svg>
        </div>

        {/* Abstract Purple Corner - Bottom Left */}
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%]">
          <svg viewBox="0 0 200 200" className="w-full h-full text-[#8D4087] opacity-90 origin-bottom-left transform scale-150" fill="currentColor">
            <path d="M 0,200 L 200,200 C 150,120 100,80 0,0 Z" />
          </svg>
        </div>

        {/* Content Wrapper (z-10 ensures text is above shapes) */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between">

          {/* Top Row: Logo & Ribbon */}
          <div className="flex justify-between items-start w-full">
            {/* Logo & Title */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <img src={logoImg} alt="Afrivate" className="h-10 sm:h-12 object-contain filter" style={{ filter: 'brightness(0) saturate(100%) invert(31%) sepia(43%) saturate(1637%) hue-rotate(272deg) brightness(87%) contrast(92%)' }} />
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-[#8D4087] leading-tight tracking-tight uppercase">
                Certificate
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-[0.2em] uppercase mt-1">
                Of Achievement
              </h2>
            </div>

            {/* Best Award Ribbon SVG */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 -mt-4 mr-4">
              <svg viewBox="0 0 100 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ribbon tails */}
                <path d="M 35,90 L 20,115 L 45,105 L 50,90 Z" fill="#8D4087" />
                <path d="M 65,90 L 80,115 L 55,105 L 50,90 Z" fill="#8D4087" />
                <path d="M 32,92 L 23,112 L 42,104" stroke="#D4AF37" strokeWidth="2" />
                <path d="M 68,92 L 77,112 L 58,104" stroke="#D4AF37" strokeWidth="2" />

                {/* Ribbon medal circle */}
                <circle cx="50" cy="50" r="38" fill="white" stroke="#8D4087" strokeWidth="6" strokeDasharray="4 4" />
                <circle cx="50" cy="50" r="30" fill="white" stroke="#D4AF37" strokeWidth="2" />

                {/* Text inside ribbon */}
                <text x="50" y="46" fontFamily="sans-serif" fontSize="12" fontWeight="900" fill="#8D4087" textAnchor="middle">BEST</text>
                <text x="50" y="60" fontFamily="sans-serif" fontSize="12" fontWeight="900" fill="#8D4087" textAnchor="middle">AWARD</text>
              </svg>
            </div>
          </div>

          {/* Middle: Recipient */}
          <div className="w-full flex flex-col items-center justify-center flex-1 my-8">
            <p className="text-sm sm:text-base font-black text-gray-900 tracking-wider mb-6">
              THIS CERTIFICATE IS PRESENTED TO
            </p>

            <div className="border border-gray-400 rounded-full px-10 sm:px-16 py-3 sm:py-5 mb-8 w-full max-w-2xl text-center">
              <span className="text-3xl sm:text-5xl font-black text-[#8D4087] uppercase tracking-wide">
                {certificate.volunteer_name}
              </span>
            </div>

            <p className="text-center text-gray-500 font-medium text-xs sm:text-sm max-w-3xl leading-relaxed uppercase tracking-widest px-4">
              HAS SUCCESSFULLY COMPLETED VOLUNTEERING AS A {certificate.role_title}
              <br className="hidden sm:block" />AT {certificate.organization_name}.
              <br /><br />
              WE ACKNOWLEDGE THE COMPLETION OF {certificate.total_hours} HOURS OF SERVICE
              AND COMMEND THEIR DEDICATION AND COMMITMENT TO THE PROJECT.
            </p>
          </div>

          {/* Bottom: Date & Signature */}
          <div className="w-full flex justify-between items-end mt-4 px-8 sm:px-20 pb-4">
            {/* Date */}
            <div className="flex flex-col items-center w-40 sm:w-48">
              <div className="w-full h-[2px] bg-gray-800 mb-3"></div>
              <span className="text-base sm:text-lg font-bold text-gray-900 uppercase">
                {new Date(certificate.issued_at).toLocaleDateString()}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-500 tracking-widest mt-1">
                DATE
              </span>
            </div>

            {/* Signature */}
            <div className="flex flex-col items-center w-40 sm:w-48">
              <div className="w-full h-[2px] bg-gray-800 mb-3"></div>
              <span className="text-base sm:text-lg font-bold text-[#8D4087] uppercase italic">
                {certificate.attested_by_name || certificate.organization_name}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-500 tracking-widest mt-1">
                SIGNATURE
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons Below Certificate */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href={`/api/engagements/verify/${certificate.id}/pdf/`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#8D4087] to-[#651F5F] hover:from-[#763371] hover:to-[#50174A] text-white rounded-xl font-bold transition shadow-lg shadow-[#8D4087]/20 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" /> Download PDF
        </a>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Verification link copied!");
          }}
          className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" /> Copy Link
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400 font-medium">
          Credential ID: {certificate.id} <br />
          Verified securely by AfriVate
        </p>
      </div>

    </div>
  );
}
