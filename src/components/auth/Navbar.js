import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { profile, getRole, notifications } from '../../services/api';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [profilePic, setProfilePic] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const rawPic = user?.raw?.base_details?.profile_pic || user?.raw?.profile_pic;
    if (rawPic) {
      setProfilePic(rawPic);
      return;
    }
    profile.pictureGet().then(picData => {
      if (picData?.profile_pic) setProfilePic(picData.profile_pic);
    }).catch(() => {});
  }, [user]);

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

  const profileInfo = useMemo(() => {
    const raw = user?.raw;
    let name = user?.name || 'Pathfinder';
    let title = '';
    if (raw) {
      if (raw.first_name || raw.last_name) {
        name = `${raw.first_name || ''} ${raw.last_name || ''}`.trim();
      } else if (raw.name) {
        name = raw.name;
      }
      if (raw.title) title = raw.title;
      else if (raw.about) title = raw.about.split('\n')[0];
    }
    return { name, title };
  }, [user]);

  const role = getRole();

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
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
          <Link to={role === 'pathfinder' ? '/pathf' : '/'}>
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
        <div className="flex items-center relative">
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

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[270px] rounded-tr-3xl rounded-br-3xl bg-[#FAFAFA] shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="px-3 py-5 text-center">
            {profilePic ? (
              <img 
                src={profilePic} 
                alt={profileInfo.name}
                className="w-[50px] h-[50px] mx-auto rounded-full object-cover border-2 border-purple-500"
              />
            ) : (
              <div className="w-[50px] h-[50px] bg-gray-300 mx-auto rounded-full flex items-center justify-center text-[#6A00B1] font-bold text-lg">
                {profileInfo.name ? profileInfo.name.charAt(0).toUpperCase() : 'P'}
              </div>
            )}
            <p className="font-sans text-xl text-black mt-3 font-bold truncate px-2">{profileInfo.name}</p>
            <p className="font-sans text-sm text-[#797979] truncate px-2">{profileInfo.title || 'Pathfinder'}</p>
          </div>

          <ul className="p-4 space-y-5 text-sm text-black font-medium font-sans">
            <Link to={role === 'pathfinder' ? '/pathf' : '/'}>
              <li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2">
                <i className="fas fa-house"></i> Home
              </li>
            </Link>
            {role === 'pathfinder' ? (
              <Link to="/my-applications">
                <li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2">
                  <i className="fas fa-file-alt"></i> My Applications
                </li>
              </Link>
            ) : (
              <Link to="/pathf">
                <li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2">
                  <i className="fas fa-chart-line"></i> Dashboard
                </li>
              </Link>
            )}
            {role === 'pathfinder' && (
              <Link to="/available-opportunities">
                <li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2">
                  <i className="fas fa-briefcase"></i> Available Opportunities
                </li>
              </Link>
            )}
            <Link to="/bookmarks">
              <li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2">
                <i className="fas fa-bookmark"></i> Bookmarks
              </li>
            </Link>
            <Link to="/edit-new-profile">
              <li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2">
                <i className="fas fa-user"></i> Profile
              </li>
            </Link>
            {role === "pathfinder" && (
              <Link to="/set-password" onClick={() => setIsOpen(false)}>
                <li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2">
                  <i className="fas fa-key"></i> Set password
                </li>
              </Link>
            )}
          </ul>

          {user ? (
            <div className="px-4 pb-6">
              <button
                type="button"
                onClick={handleLogout}
                className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 w-full m-2 text-sm font-medium text-black"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 "
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default NavBar;
