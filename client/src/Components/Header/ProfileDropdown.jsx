/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ProfileDropdown = ({ userData }) => {
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

  return (
    <Link to="/dashboard">
    <li className="relative flex items-center mr-4 space-x-2" ref={dropdownRef}>
      <div onClick={toggleDropdown}>
        <div
          className="w-11 h-11 cursor-pointer bg-cover bg-center rounded-full border-[1px] border-white hover:scale-105 transition-transform duration-200"
          style={{
            backgroundImage: `url(${userData?.profileImage || 'https://via.placeholder.com/150'})`,
          }}
        ></div>
      </div>
    </li>
    </Link>
  );
};

export default ProfileDropdown;
