import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { engagements as apiEngagements } from '../services/api';
import logoImg from '../Assets/afrivate-logo.svg';
import { CheckCircle, Award, Calendar, Clock, Download, ShieldCheck, Loader, FileText } from 'lucide-react';

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
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-sans">
        <Loader className="w-10 h-10 animate-spin text-[#D4AF37] mb-4" />
        <p className="text-gray-400 font-medium tracking-wider text-sm uppercase">Verifying Credential...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center font-sans p-4">
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
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-gray-100 selection:bg-[#8D4087] selection:text-white pb-12">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <img src={logoImg} alt="Afrivate" className="h-8 brightness-0 invert opacity-90" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1B804B] bg-[#1B804B]/10 px-3 py-1.5 rounded-full border border-[#1B804B]/20">
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Authentic Credential</span>
            <span className="sm:hidden">Verified</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-12">
        {/* Certificate Card */}
        <div className="relative rounded-3xl overflow-hidden p-[1px] bg-gradient-to-br from-[#8D4087] via-[#D4AF37] to-gray-800 shadow-2xl">
          <div className="bg-[#121212] rounded-[23px] relative overflow-hidden h-full w-full p-8 sm:p-12 text-center">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#8D4087]/10 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#8D4087] opacity-[0.03] blur-[100px] rounded-full pointer-events-none"></div>
            
            {/* Seal */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#B38D1E] rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 mb-8 relative z-10">
              <div className="w-16 h-16 bg-[#121212] rounded-full flex items-center justify-center border-2 border-[#D4AF37]/50">
                <Award className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </div>

            <p className="text-sm tracking-[0.2em] text-[#D4AF37] uppercase font-bold mb-2">Verified Experience Credential</p>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-2 leading-tight">
              {certificate.volunteer_name}
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 font-medium mb-10">
              has successfully completed volunteering as a <br className="hidden sm:block" />
              <span className="text-white font-bold">{certificate.role_title}</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left mb-10 border-t border-b border-gray-800 py-8 relative z-10">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Organization</p>
                <p className="text-base text-gray-200 font-semibold">{certificate.organization_name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Total Hours Logged</p>
                <div className="flex items-center gap-1.5 text-base text-gray-200 font-semibold">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  {certificate.total_hours} Hours
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Duration</p>
                <div className="flex items-center gap-1.5 text-base text-gray-200 font-semibold">
                  <Calendar className="w-4 h-4 text-[#8D4087]" />
                  {certificate.start_date} to {certificate.end_date || 'Present'}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Issue Date</p>
                <p className="text-base text-gray-200 font-semibold">
                  {new Date(certificate.issued_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="text-left relative z-10">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1B804B]" />
                Official Attestation
              </p>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-300 italic mb-3">
                  "This record has been officially verified by the organization. The tasks and hours logged were confirmed to be accurate."
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Verified by: <strong className="text-gray-300">{certificate.attested_by_name || certificate.organization_name}</strong> on {new Date(certificate.attested_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`/api/engagements/verify/${certificate.id}/pdf/`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#8D4087] to-[#651F5F] hover:from-[#763371] hover:to-[#50174A] text-white rounded-xl font-bold transition shadow-lg shadow-[#8D4087]/20 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" /> Download PDF Certificate
          </a>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Verification link copied!");
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" /> Copy Link
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            This credential is cryptographically tied to the AfriVate platform. Any alterations to the PDF or URL will result in verification failure.
            <br/><br/>
            Credential ID: <span className="font-mono text-gray-500">{certificate.id}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
