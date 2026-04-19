import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { profile, notifications } from '../../services/api';

const EnablerNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profile.enablerGet();
        setProfileData(data);
        try {
          const picData = await profile.pictureGet();
          if (picData && picData.profile_pic) {
            setProfilePic(picData.profile_pic);
          }
        } catch (picErr) {
          // Picture not set yet
        }
      } catch (err) {
        console.error("Error loading enabler profile:", err);
        // Fallback: use default
        setProfileData({ name: 'Enabler' });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await notifications.list();
        const raw = Array.isArray(response) ? response : response?.results || [];
        const count = raw.filter(item => item.current_user_read === false).length;
        setUnreadCount(count);
      } catch (err) {
        console.error('Error loading unread notifications:', err);
        setUnreadCount(0);
      }
    };
    loadUnreadCount();
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getDisplayName = () => {
    if (profileData && profileData.name) {
      return profileData.name;
    }
    return "Enabler";
  };

  return (
    <>
      <nav className="fixed font-sans bg-white sticky top-0 z-20 px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <i
            className="fa-solid fa-bars text-xl font-bold cursor-pointer text-gray-800"
            onClick={() => setIsOpen(true)}
          ></i>
          <Link to="/">
            <i className="fa-regular fa-house text-xl font-bold text-gray-800 cursor-pointer hover:text-purple-600"></i>
          </Link>
        </div>

        <div className="flex-1 flex justify-center mx-2 md:mx-4">
          <div className="bg-[#6A00B1] rounded-full px-4 md:px-6 py-1.5 md:py-2">
            <p className="text-white text-xs md:text-sm font-medium whitespace-nowrap">
              Afrivate is elevating life in Africa-Watch out!!
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <Link to="/notifications" className="text-gray-800 hover:text-purple-600 relative">
            <i className="fa-regular fa-bell text-xl" role="img" aria-label="Notifications"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div
        className={`fixed top-0 left-0 h-full w-[270px] rounded-tr-3xl rounded-br-3xl bg-[#E5E5E5] shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <Link 
            to="/enabler/profile" 
            onClick={() => setIsOpen(false)}
            className="px-4 py-6 flex items-center gap-3 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            {loading ? (
              <div className="w-12 h-12 border-2 border-[#6A00B1] rounded-full flex-shrink-0 bg-gray-300 animate-pulse"></div>
            ) : profilePic ? (
              <img src={profilePic} alt="Profile" className="w-12 h-12 border-2 border-[#6A00B1] rounded-full flex-shrink-0 object-cover" />
            ) : (
              <div className="w-12 h-12 border-2 border-[#6A00B1] rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200">
                <i className="fa-solid fa-user text-[#6A00B1]"></i>
              </div>
            )}
            <p className="font-sans text-lg font-bold text-[#6A00B1]">{getDisplayName()}</p>
          </Link>

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

          <div className="px-3 pb-6">
            <Link to="/create-opportunity" onClick={() => setIsOpen(false)}>
              <button className="w-full bg-[#6A00B1] text-white font-bold py-3 rounded-lg hover:bg-[#5A0091] transition-colors shadow-md">
                Post an opportunity
              </button>
            </Link>
          </div>
        </div>
      </div>

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
