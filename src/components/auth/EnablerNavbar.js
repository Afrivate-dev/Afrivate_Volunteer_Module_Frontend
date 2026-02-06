import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const EnablerNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed font-sans bg-white sticky top-0 z-20 px-4 py-3 
                      flex items-center justify-between w-full">
        {/* Left side - Hamburger and Home */}
        <div className="flex items-center gap-4">
          <i
            className="fa-solid fa-bars text-xl font-bold cursor-pointer text-gray-800"
            onClick={() => setIsOpen(true)}
          ></i>
          <Link to="/">
            <i className="fa-regular fa-house text-xl font-bold text-gray-800 cursor-pointer hover:text-purple-600"></i>
          </Link>
        </div>

        {/* Center - Purple Banner */}
        <div className="flex-1 flex justify-center mx-2 md:mx-4">
          <div className="bg-[#6A00B1] rounded-full px-4 md:px-6 py-1.5 md:py-2">
            <p className="text-white text-xs md:text-sm font-medium whitespace-nowrap">
              Afrivate is elevating life in Africa-Watch out!!
            </p>
          </div>
        </div>

        {/* Right side - Bell icon */}
        <div className="flex items-center">
          <i className="fa-regular fa-bell text-xl text-gray-800"></i>
        </div>
      </nav>

      {/* Enabler Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[270px] rounded-tr-3xl rounded-br-3xl bg-[#E5E5E5] shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <Link 
            to="/enabler/profile" 
            onClick={() => setIsOpen(false)}
            className="px-4 py-6 flex items-center gap-3 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 border-2 border-[#6A00B1] rounded-full flex-shrink-0"></div>
            <p className="font-sans text-lg font-bold text-[#6A00B1]">Tech Innovators</p>
          </Link>

          {/* Navigation Links */}
          <ul className="flex-1 px-3 space-y-2">
            <Link to="/enabler/dashboard" onClick={() => setIsOpen(false)}>
              <li className={`py-3 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                isActive('/enabler/dashboard')
                  ? 'bg-[#E0C6FF] text-black'
                  : 'bg-transparent text-black hover:bg-gray-200'
              }`}>
                <i className="fas fa-house"></i>
                <span className="font-medium">Home</span>
              </li>
            </Link>
            
            <Link to="/enabler/recommendations" onClick={() => setIsOpen(false)}>
              <li className={`py-3 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                isActive('/enabler/recommendations')
                  ? 'bg-[#E0C6FF] text-black'
                  : 'bg-transparent text-black hover:bg-gray-200'
              }`}>
                <i className="fas fa-briefcase"></i>
                <span className="font-medium">Recommendations</span>
              </li>
            </Link>
            
            <Link to="/enabler/opportunities-posted" onClick={() => setIsOpen(false)}>
              <li className={`py-3 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                isActive('/enabler/opportunities-posted')
                  ? 'bg-[#E0C6FF] text-black'
                  : 'bg-transparent text-black hover:bg-gray-200'
              }`}>
                <i className="fas fa-file-alt"></i>
                <span className="font-medium">Opportunities Posted</span>
              </li>
            </Link>
            
            <Link to="/enabler/bookmarked-pathfinders" onClick={() => setIsOpen(false)}>
              <li className={`py-3 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                isActive('/enabler/bookmarked-pathfinders')
                  ? 'bg-[#E0C6FF] text-black'
                  : 'bg-transparent text-black hover:bg-gray-200'
              }`}>
                <i className="fas fa-bookmark"></i>
                <span className="font-medium">Bookmarked Pathfinders</span>
              </li>
            </Link>
            
            <Link to="/enabler/settings" onClick={() => setIsOpen(false)}>
              <li className={`py-3 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                isActive('/enabler/settings')
                  ? 'bg-[#E0C6FF] text-black'
                  : 'bg-transparent text-black hover:bg-gray-200'
              }`}>
                <i className="fas fa-cog"></i>
                <span className="font-medium">Settings</span>
              </li>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left py-3 px-4 rounded-lg flex items-center gap-3 transition-colors bg-transparent text-black hover:bg-gray-200"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="font-medium">Logout</span>
            </button>
          </ul>

          {/* Post an Opportunity Button */}
          <div className="px-3 pb-6">
            <Link to="/create-opportunity" onClick={() => setIsOpen(false)}>
              <button className="w-full bg-[#6A00B1] text-white font-bold py-3 rounded-lg hover:bg-[#5A0091] transition-colors shadow-md">
                Post an opportunity
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default EnablerNavbar;
