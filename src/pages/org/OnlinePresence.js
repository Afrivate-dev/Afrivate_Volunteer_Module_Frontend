import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnablerNavbar from '../../components/auth/EnablerNavbar';
import {
  Globe,
  Pencil,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  X,
  Share2
} from 'lucide-react';

const LinkedInIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function OnlinePresence() {
  const navigate = useNavigate();

  const [website, setWebsite] = useState('https://www.example.com');
  const [socialProfiles, setSocialProfiles] = useState([
    {
      id: '1',
      platform: 'LinkedIn',
      url: 'linkedin.com/company/example'
    }
  ]);

  // Modal / Inline Add or Edit Profile state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalPlatform, setModalPlatform] = useState('LinkedIn');
  const [modalUrl, setModalUrl] = useState('');

  const platforms = [
    { name: 'LinkedIn', icon: LinkedInIcon },
    { name: 'Twitter / X', icon: TwitterIcon },
    { name: 'Instagram', icon: InstagramIcon },
    { name: 'Facebook', icon: FacebookIcon },
    { name: 'YouTube', icon: YoutubeIcon }
  ];

  const getPlatformIcon = (platformName) => {
    const found = platforms.find(
      (p) => p.name.toLowerCase() === (platformName || '').toLowerCase()
    );
    if (found) {
      const IconComponent = found.icon;
      return <IconComponent className="w-4 h-4 text-[#8D4087]" />;
    }
    return <Share2 className="w-4 h-4 text-[#8D4087]" />;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setModalPlatform('LinkedIn');
    setModalUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (profile) => {
    setEditingId(profile.id);
    setModalPlatform(profile.platform);
    setModalUrl(profile.url);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setSocialProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!modalUrl.trim()) return;

    if (editingId) {
      setSocialProfiles((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, platform: modalPlatform, url: modalUrl.trim() }
            : p
        )
      );
    } else {
      setSocialProfiles((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          platform: modalPlatform,
          url: modalUrl.trim()
        }
      ]);
    }
    setIsModalOpen(false);
  };

  const handleBack = () => {
    navigate('/org/registration');
  };

  const handleContinue = () => {
    navigate('/org/show-work');
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
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-3 hover:bg-white/30 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Where can we find you online?
            </h1>
            <p className="text-purple-200 text-sm max-w-xl">
              Add your organization's website and public social profiles. These links help us understand your organization's presence and activity.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Card 1: Organization Website (Optional) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-sm space-y-3">
          <label className="block text-sm font-bold text-gray-800">
            Organization Website (Optional)
          </label>
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.example.com"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white transition"
            />
          </div>
        </div>

        {/* Card 2: Social Media Profiles */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-800">
              Social Media Profiles
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Add links to your public social media pages.
            </p>
          </div>

          {/* List of profiles */}
          <div className="space-y-3">
            {socialProfiles.map((item) => (
              <div
                key={item.id}
                className="bg-[#FAF7FA] border border-purple-100 rounded-xl p-3.5 sm:px-4 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-purple-100/80 text-[#8D4087] flex items-center justify-center shrink-0">
                    {getPlatformIcon(item.platform)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 leading-snug truncate">
                      {item.platform}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-white transition"
                    title="Edit profile link"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-[#E03131] hover:text-red-700 rounded-lg hover:bg-white transition"
                    title="Delete profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* + Add social profile trigger */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="text-xs font-semibold text-[#8D4087] hover:text-[#6a2565] flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add social profile</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="border-t border-gray-200/70 pt-6 mt-10 flex items-center justify-between">
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

      {/* Add / Edit Social Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Social Profile' : 'Add Social Profile'}
            </h3>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Platform
                </label>
                <select
                  value={modalPlatform}
                  onChange={(e) => setModalPlatform(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white"
                >
                  {platforms.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Profile URL / Handle
                </label>
                <input
                  type="text"
                  value={modalUrl}
                  onChange={(e) => setModalUrl(e.target.value)}
                  placeholder="e.g. linkedin.com/company/example"
                  required
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#70236A] hover:bg-[#591B54] text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {editingId ? 'Update' : 'Add Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
