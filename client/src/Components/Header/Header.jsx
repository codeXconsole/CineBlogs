/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { LogoutBtn } from '../index';
import { useDispatch } from "react-redux";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '.././../App.css';
import { logout } from "../../AppWrite/Apibase";
import { toast } from "react-toastify";
import ProfileDropdown from './ProfileDropdown';

function Header() {
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(false);
  const authStatus = useSelector((state) => state.Auth.status);
  const userData = useSelector((state) => state.Auth.userData);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mobileNavRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout(dispatch, navigate);
      toast.success("Logout Successfully...", {
        autoClose: 1000,
        style: {
          backgroundColor: "#2e1065",
          color: "#ffffff",
        },
        hideProgressBar: true,
      });
      navigate('/login')
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out. Please try again.", {
        autoClose: 2000,
        style: {
          backgroundColor: "#ff6347",
          color: "#ffffff",
        },
        hideProgressBar: true,
      });
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: 'Home', slug: "/", active: true },
    { name: "Authors", slug: "/authors", active: authStatus },
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Create Account", slug: "/signup", active: !authStatus },
    { name: "My Posts", slug: `/all-posts/${userData?._id}`, active: authStatus },
    { name: "Add Post", slug: "/add-post", active: authStatus },
  ];

  return (
    <header className="py-3 px-6 lg:px-16 shadow bg-transparent text-white relative">
      <nav className="flex items-center justify-between">
        {/* Logo */}
        <div className="mr-4">
          <Link to="/">
            <img
              src="https://res.cloudinary.com/dbmn2pyi4/image/upload/v1730130777/Mega-Blogs-Header_b8myrb.png"
              alt="Logo"
              className="w-[6rem]"
            />
          </Link>
        </div>

        {!isMobileNavVisible ? <button
          className="lg:hidden ml-auto text-[2rem] text-white hover:text-blue-500"
          onClick={() => setIsMobileNavVisible(true)}
        >
          ☰
        </button> : <button
          className="lg:hidden ml-auto text-[1.5rem] text-white hover:text-blue-500"
          onClick={() => setIsMobileNavVisible(false)}
        >
          ✖
        </button>}

        {/* Desktop Navbar Links */}
        <ul className="hidden lg:flex space-x-4 ml-auto bg-transparent">
          {navItems.map((item) =>
            item.active ? (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.slug)}
                  className="inline-block px-6 py-2 duration-200 hover:text-blue-500 rounded-full"
                >
                  {item.name}
                </button>
              </li>
            ) : null
          )}
          {authStatus && (
            <>
              <li>
                <LogoutBtn />
              </li>
              <ProfileDropdown userData={userData} />
            </>
          )}
        </ul>
      </nav>

      {/* Mobile Navbar */}
      {isMobileNavVisible && (
        <div className=' relative '>
          <ul
            ref={mobileNavRef}
            className="absolute z-50 w-full flex-col lg:hidden bg-gray-900 p-6 space-y-4 rounded-lg shadow-lg slide-down transform transition-transform duration-300"
          >
            {/* Navigation Items */}
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      setIsMobileNavVisible(false);
                      navigate(item.slug);
                    }}
                    className="w-full text-left text-white px-4 py-2 rounded-lg bg-gray-800 hover:bg-blue-600 hover:shadow-md transition-all duration-300"
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}

            {/* Authenticated User Actions */}
            {authStatus && (
              <>
                <li onClick={handleLogout}>
                  <button
                    className="flex items-center justify-start space-x-3 w-full bg-gray-800 text-white rounded-lg p-3 hover:bg-red-600 hover:shadow-md transition-all duration-300"
                  >
                    <span className="ml-1">Logout</span>
                  </button>
                </li>
                <li className="relative flex items-center justify-start">
                  {/* Profile Button with Dropdown */}
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)} // Toggles the dropdown
                    className="flex items-center space-x-3 w-full hover:bg-gray-800 rounded-lg p-3 transition-all duration-300"
                  >
                    <img
                      src={userData?.profileImage || "https://via.placeholder.com/150"}
                      alt="User Profile"
                      className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-md"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <ul className="absolute top-[4.5rem] right-0 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-lg z-50 text-white divide-y divide-gray-700">
                      <li
                        className="px-5 py-3 flex items-center space-x-2 hover:bg-gray-700 hover:scale-105 transition-transform duration-200 cursor-pointer rounded-t-xl"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsMobileNavVisible(false);
                        }}
                      >
                        <span>🧑‍💻</span>
                        <Link to={`/profile/${userData?._id}`} className="text-sm font-medium">
                          My Profile
                        </Link>
                      </li>
                      <li
                        className="px-5 py-3 flex items-center space-x-2 hover:bg-gray-700 hover:scale-105 transition-transform duration-200 cursor-pointer rounded-b-xl"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsMobileNavVisible(false);
                        }}
                      >
                        <span>👥</span>
                        <Link to={`/followers/${userData?._id}`} className="text-sm font-medium">
                          My Followers
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            )}

          </ul>
        </div>
      )}
    </header>
  );
}

export default Header;
