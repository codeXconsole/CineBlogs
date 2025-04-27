/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

function AuthorCard({ userData, className }) {
  return (
    <div
      className={`relative mx-2 sm:mx-0 w-[10rem] sm:w-[12rem] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 hover:scale-[1.02] duration-300 ${className}`}
    >
      {/* Profile Image */}
      <div className="flex justify-center mt-4">
        <img
          src={userData?.user?.profileImage || userData.profileImage || "https://via.placeholder.com/100"}
          alt={`${userData?.user?.username || userData.username || "User"}'s Profile`}
          className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 object-cover"
        />
      </div>

      {/* User Info */}
      <div className="text-center my-3 px-3 ">
        <h3 className="text-[14px] font-medium text-gray-800 dark:text-white truncate">
          {userData?.user?.username || userData.username || "Unknown User"}
        </h3>
        {/* <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-1">
          {userData?.user?.email || userData.email || "No email found"}
        </p> */}
      </div>

      {/* Divider */}
      {/* <div className="border-t border-gray-200 dark:border-gray-700 my-3 mx-4"></div> */}

      {/* Stats */}
      {/* <div className="flex justify-around text-center text-gray-600 dark:text-gray-400 text-[11px] px-2">
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{userData.postCount || 0}</p>
          <p className="text-[10px] mt-0.5">Posts</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{userData.followers?.length || 0}</p>
          <p className="text-[10px] mt-0.5">Followers</p>
        </div>
      </div> */}

      {/* View Profile Button */}
      {/* <div className="mt-4 mb-4 px-4">
        <Link to={`/profile/${userData?.user?._id || userData._id}`}>
          <button className="w-full py-2 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300">
            View Profile
          </button>
        </Link>
      </div> */}
    </div>
  );
}

export default AuthorCard;
