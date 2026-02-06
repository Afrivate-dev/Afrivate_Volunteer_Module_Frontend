import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const profileInfo = useMemo(() => {
    let name = user?.name || 'Pathfinder';
    let title = '';
    try {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.displayName) name = p.displayName;
        if (p.title) title = p.title;
      }
    } catch (_) {}
    return { name, title };
  }, [user?.name]);

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
          <i className="fa-regular fa-bell text-xl text-gray-800" role="img" aria-label="Notifications"></i>
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
            <div className="w-[50px] h-[50px] bg-gray-300 mx-auto rounded-full flex items-center justify-center text-[#6A00B1] font-bold text-lg">
              {profileInfo.name ? profileInfo.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <p className="font-sans text-xl text-black mt-3 font-bold truncate px-2">{profileInfo.name}</p>
            <p className="font-sans text-sm text-[#797979] truncate px-2">{profileInfo.title || 'Pathfinder'}</p>
          </div>

          <ul className="p-4 space-y-5 text-sm text-black font-medium font-sans">
            <Link to="/">
              <li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2">
                <i className="fas fa-house"></i> Home
              </li>
            </Link>
            <Link to="/pathf">
              <li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2">
                <i className="fas fa-chart-line"></i> Dashboard
              </li>
            </Link>
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
          </ul>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-[80%] bg-purple-900 mt-10 mb-3 text-white text-sm font-extrabold py-3 rounded-xl mx-auto block"
            >
              Logout
            </button>
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
