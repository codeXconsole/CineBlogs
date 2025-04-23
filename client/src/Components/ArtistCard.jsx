/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

export default function ArtistCard({ _id, username, profileImage, postCount }) {
  return (
    <div className=" bg-black rounded-lg p-4 border-[1px] border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-fit">
      <div className="relative flex flex-col items-center">
        {/* Profile Image */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-violet-500 mb-3">
          <img
            src={profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt={username}
            className="w-full h-full object-cover transition-transform duration-300"
          />
        </div>

        {/* Artist's Name */}
        <h3 className="text-white text-md font-semibold mb-2">{username}</h3>
      </div>

      {/* Divider */}
      <div className="border-t border-[#2a2a2a] mx-6 mb-3" />

      {/* Stats Section */}
      <div className="flex justify-center space-x-4 text-sm text-gray-400">
        {/* Posts Section */}
        <Link to={`/all-posts/${_id}`} className="group transition-colors duration-300">
          <div className="p-2 px-3 rounded-xl bg-transparent hover:bg-gray-800/30 cursor-pointer flex items-center justify-center">
            <span className="text-white font-semibold mr-2">{postCount}</span>
            <span className="text-xs">Posts</span>
          </div>
          <span className="flex justify-center items-center text-xs group-hover:text-blue-600">View Posts</span>
        </Link>

        {/* View Profile Section */}
        <Link to={`/profile/${_id}`} className="grouptransition-colors duration-300">
          <div className="p-2 px-3 rounded-xl bg-transparent hover:bg-gray-800/30 cursor-pointer flex items-center justify-center">
            <span className="text-white mr-2">View</span>
            <span className="text-xs">Profile</span>
          </div>
          <span className="text-xs group-hover:text-blue-600 ml-4">Go to Profile</span>
        </Link>
      </div>
    </div>
  );
}
