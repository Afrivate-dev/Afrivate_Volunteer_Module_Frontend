import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import { getPathfinderById } from "../../utils/pathfinderData";

const PathfinderProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [pathfinder, setPathfinder] = useState(null);

  // Set page title
  useEffect(() => {
    document.title = "Pathfinder Profile - AfriVate";
  }, []);

  useEffect(() => {
    const found = getPathfinderById(id);
    setPathfinder(found);
    if (found) {
      const bookmarked = JSON.parse(localStorage.getItem('bookmarkedPathfinders') || '[]');
      setIsBookmarked(bookmarked.includes(found.id) || bookmarked.includes(String(found.id)));
    }
  }, [id]);

  const handleBookmark = () => {
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedPathfinders') || '[]');
    if (isBookmarked) {
      const updated = bookmarked.filter(bId => bId !== pathfinder.id && bId !== String(pathfinder.id));
      localStorage.setItem('bookmarkedPathfinders', JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      const updated = [...bookmarked.filter(bId => bId !== pathfinder.id && bId !== String(pathfinder.id)), pathfinder.id];
      localStorage.setItem('bookmarkedPathfinders', JSON.stringify(updated));
      setIsBookmarked(true);
    }
  };

  if (!pathfinder) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-gray-500">No pathfinder profile found.</p>
            <button
              onClick={() => navigate('/enabler/recommendations')}
              className="mt-4 text-[#6A00B1] font-semibold hover:underline"
            >
              Back to recommendations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      
      {/* Main Content */}
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Actions */}
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={handleBookmark}
              className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-purple-50 border-purple-300 hover:bg-purple-100' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
            >
              {isBookmarked ? (
                <i className="fa fa-bookmark text-[#6A00B1] text-lg"></i>
              ) : (
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                  style={{ color: '#6A00B1' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => navigate(`/enabler/contact/${pathfinder.id}`)}
              className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-[#5A0091] transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Profile Header Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Profile Picture */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fa fa-user text-5xl md:text-6xl text-gray-400"></i>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                {pathfinder.name}
              </h1>
              <p className="text-gray-700 text-base md:text-lg mb-3">
                {pathfinder.role}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm md:text-base text-gray-600">
                <div className="flex items-center gap-2">
                  <i className="fa fa-map-marker text-[#6A00B1]"></i>
                  <span>{pathfinder.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{pathfinder.languages}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content Sections */}
          <div className="space-y-6">
            
            {/* About Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3">
                About
              </h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {pathfinder.about}
              </p>
            </div>

            {/* Skills and Expertise Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
                Skills and Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {pathfinder.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-[#6A00B1] text-white px-4 py-2 rounded-full text-xs md:text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Work Experience Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3">
                Work Experience
              </h2>
              {pathfinder.workExperience.length > 0 ? (
                <div className="space-y-4">
                  {pathfinder.workExperience.map((exp, index) => (
                    <div key={index} className="text-gray-700 text-sm md:text-base">
                      {/* Work experience items would go here */}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm md:text-base italic">
                  Add your job history and achievements to give clients insight into your expertise.
                </p>
              )}
            </div>

            {/* Education Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3">
                Education
              </h2>
              {pathfinder.education.length > 0 ? (
                <div className="space-y-4">
                  {pathfinder.education.map((edu, index) => (
                    <div key={index} className="text-gray-700 text-sm md:text-base">
                      {/* Education items would go here */}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm md:text-base italic">
                  Back up your skills by adding any educational degrees or programs.
                </p>
              )}
            </div>

            {/* Certification Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3">
                Certification
              </h2>
              {pathfinder.certifications.length > 0 ? (
                <div className="space-y-4">
                  {pathfinder.certifications.map((cert, index) => (
                    <div key={index} className="text-gray-700 text-sm md:text-base">
                      {/* Certification items would go here */}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm md:text-base italic">
                  Showcase your mastery with certification earned in your field.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathfinderProfile;
