import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnablerNavbar from '../../components/auth/EnablerNavbar';
import { engagements as apiEngagements } from '../../services/api';
import { CheckCircle2, XCircle, Clock, Loader, AlertTriangle } from 'lucide-react';

export default function PendingAttestations() {
  const navigate = useNavigate();
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'attest' or 'dispute'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [notes, setNotes] = useState('');

  const fetchAttestations = async () => {
    try {
      const data = await apiEngagements.pendingAttestations();
      setAttestations(data || []);
    } catch (err) {
      console.error("Failed to fetch pending attestations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttestations();
  }, []);

  const handleAttest = async (e) => {
    e.preventDefault();
    try {
      await apiEngagements.attest(selectedRecord.id, notes);
      alert('Engagement attested successfully!');
      setActiveModal(null);
      setNotes('');
      fetchAttestations();
    } catch (err) {
      alert(err.message || 'Failed to attest engagement');
    }
  };

  const handleDispute = async (e) => {
    e.preventDefault();
    try {
      await apiEngagements.dispute(selectedRecord.id, notes);
      alert('Engagement disputed.');
      setActiveModal(null);
      setNotes('');
      fetchAttestations();
    } catch (err) {
      alert(err.message || 'Failed to dispute engagement');
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
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-12">
      <EnablerNavbar />

      <div className="pt-16">
        <div
          style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }}
          className="px-4 sm:px-8 py-8 sm:py-10"
        >
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-4 hover:bg-white/30 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">
              Pending Attestations
            </h1>
            <p className="text-purple-200 text-sm max-w-xl">
              Review and officially verify the experience records submitted by your volunteers. Once attested, a shareable certificate will be generated for them.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
          {attestations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-[#FAF5FB] rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#8D4087]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500 max-w-md">There are no pending attestations to review right now.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {attestations.map((record) => (
                <div key={record.id} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row gap-8 lg:items-start justify-between">
                  {/* Info Section */}
                  <div className="flex-1 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-lg">
                        {record.volunteer_name ? record.volunteer_name.charAt(0).toUpperCase() : 'V'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{record.volunteer_name}</h3>
                        <p className="text-sm text-[#8D4087] font-semibold">{record.role_title}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{record.total_hours || '0'} hrs logged</span>
                      </div>
                      <div className="hidden sm:block text-gray-300">|</div>
                      <div>
                        {record.start_date} to {record.end_date || 'Present'}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Logged Tasks:</h4>
                      {record.tasks && record.tasks.length > 0 ? (
                        <ul className="space-y-2">
                          {record.tasks.map(task => (
                            <li key={task.id} className="flex gap-2 text-sm text-gray-700 bg-white border border-gray-100 p-2.5 rounded-lg">
                              <CheckCircle2 className="w-4 h-4 text-[#8D4087] shrink-0 mt-0.5" />
                              <span>{task.description} <span className="text-xs text-gray-400 ml-1">({task.date})</span></span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No tasks logged.</p>
                      )}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="lg:w-64 shrink-0 flex flex-col gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setActiveModal('attest');
                      }}
                      className="w-full py-3 bg-[#8D4087] hover:bg-[#651F5F] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Attest Record
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setActiveModal('dispute');
                      }}
                      className="w-full py-3 border-2 border-red-100 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" /> Dispute Record
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attest Modal */}
      {activeModal === 'attest' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[#1B804B]" /> Confirm Attestation
              </h2>
            </div>
            <form onSubmit={handleAttest} className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                By attesting this record, you are officially verifying that <strong className="text-gray-900">{selectedRecord?.volunteer_name}</strong> completed the tasks listed for the <strong className="text-gray-900">{selectedRecord?.role_title}</strong> role. A verified certificate will be generated and linked to your organization.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Endorsement Note (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a nice note about their performance. This may be included in their certificate."
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#8D4087] focus:ring-1 focus:ring-[#8D4087] transition-all text-sm"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setActiveModal(null); setNotes(''); }}
                  className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#8D4087] text-white font-bold hover:bg-[#651F5F] rounded-xl transition shadow-sm"
                >
                  Attest & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {activeModal === 'dispute' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
              <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" /> Dispute Record
              </h2>
            </div>
            <form onSubmit={handleDispute} className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                You are about to dispute the engagement record submitted by <strong className="text-gray-900">{selectedRecord?.volunteer_name}</strong>. Please provide a clear reason so they can update their record.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Dispute <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 'You logged 40 hours but we only have record of 25 hours.' or 'Please remove the event setup task, that was completed by someone else.'"
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setActiveModal(null); setNotes(''); }}
                  className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 text-white font-bold hover:bg-red-700 rounded-xl transition shadow-sm"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
