import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { notifications, profile } from "../../services/api";

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white";

const ContactPathfinder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pathfinder, setPathfinder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchPathfinder() {
      try {
        const data = await profile.pathfinderGetById(id);
        if (data) {
          const base = data.base_details || {};
          const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.name || base.contact_email || "Pathfinder";
          const locationParts = [base.address, base.state, base.country].filter(Boolean);
          setPathfinder({ id: data.id, name, role: data.title || "Pathfinder", location: locationParts.join(", ") });
        }
      } catch (err) {
        console.error("Error loading pathfinder:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPathfinder();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pathfinder || !subject.trim() || !message.trim()) {
      setToast({ isOpen: true, message: "Please fill in subject and message.", type: "error" });
      return;
    }
    setSending(true);
    try {
      await notifications.create({
        title: subject.trim(), message: message.trim(), priority: "info", type: "personal",
        link: `/enabler/pathfinder/${pathfinder.id}`,
      });
      setToast({ isOpen: true, message: "Message sent successfully. The pathfinder will be notified.", type: "success" });
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Error sending notification:", err);
      setToast({ isOpen: true, message: "Failed to send message. Please try again.", type: "error" });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" /></div>
      </div>
    );
  }

  if (!pathfinder) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-20 text-center">
          <p className="text-gray-500 mb-4">No pathfinder found.</p>
          <button onClick={() => navigate(-1)} className="text-[#8D4087] font-semibold hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-4 hover:bg-white/30 transition-colors">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">Contact Pathfinder</h1>
            <p className="text-purple-200 text-sm mt-1">
              Send a message to <span className="text-white font-semibold">{pathfinder.name}</span>
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-8 space-y-4">
          {/* Pathfinder card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center font-bold text-[#8D4087] text-lg shrink-0">
              {pathfinder.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{pathfinder.name}</h3>
              <p className="text-xs text-gray-500">{pathfinder.role}{pathfinder.location && ` • ${pathfinder.location}`}</p>
            </div>
          </div>

          {/* Message form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 mb-2">Write your message</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Collaboration opportunity" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..." rows={6} className={inputCls + " resize-none"} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)}
                className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={sending}
                className="flex-1 bg-[#651F5F] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#4a1647] transition-colors disabled:opacity-50">
                {sending ? "Sending..." : "Send message"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast({ isOpen: false, message: "", type: "success" })} />
    </div>
  );
};

export default ContactPathfinder;
