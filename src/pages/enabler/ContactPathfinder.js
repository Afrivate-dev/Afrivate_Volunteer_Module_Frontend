import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { getPathfinderById } from "../../utils/pathfinderData";
import { notifications } from "../../services/api";

const ContactPathfinder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pathfinder, setPathfinder] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setPathfinder(getPathfinderById(id));
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
        title: subject.trim(),
        message: message.trim(),
        priority: "info",
        type: "personal",
        link: `/pathfinder/profile/${pathfinder.id}`
      });
      setToast({ isOpen: true, message: "Message sent successfully. The pathfinder will be notified.", type: "success" });
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error('Error sending notification:', err);
      setToast({ isOpen: true, message: "Failed to send message. Please try again.", type: "error" });
    } finally {
      setSending(false);
    }
  };

  if (!pathfinder) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-gray-500">No pathfinder found.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-[#6A00B1] font-semibold hover:underline"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-[#6A00B1] hover:text-[#5A0091] transition-colors"
          >
            <i className="fa fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Contact Pathfinder
          </h1>
          <p className="text-gray-600 mb-6">
            Send a message to <span className="font-semibold text-black">{pathfinder.name}</span> ({pathfinder.role}).
          </p>

          <div className="bg-white rounded-[30px] p-4 md:p-6 border border-gray-200 mb-6">
            <h2 className="text-lg font-bold text-black mb-3">Pathfinder details</h2>
            <p className="text-gray-700 text-sm"><span className="font-medium">Name:</span> {pathfinder.name}</p>
            <p className="text-gray-700 text-sm"><span className="font-medium">Role:</span> {pathfinder.role}</p>
            <p className="text-gray-700 text-sm"><span className="font-medium">Location:</span> {pathfinder.location}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Collaboration opportunity"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows="5"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="border-2 border-[#6A00B1] text-[#6A00B1] px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={sending}
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send message"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })}
      />
    </div>
  );
};

export default ContactPathfinder;
