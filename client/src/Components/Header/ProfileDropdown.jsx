/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = ({ userData }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-full border-2 border-white transition-transform duration-200 transform group-hover:scale-105 shadow-md"
        style={{
          backgroundImage: `url(${userData?.profileImage || 'https://via.placeholder.com/150'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Icon Overlay */}
      <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-[2px] shadow-md group-hover:scale-110 transition-all duration-150">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M4 6h16M4 18h16" />
        </svg>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-[-2.8rem] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-[-4px] transition-all duration-300 z-50 whitespace-nowrap">
        Go to Dashboard
        {/* Tooltip Arrow */}
        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
