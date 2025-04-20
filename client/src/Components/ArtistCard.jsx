/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

export default function ArtistCard({ _id, username, profileImage, postCount }) {
  return (
    <div className="bg-black rounded-2xl p-3 border-[1px] border-white">
      <div className="relative z-10 flex flex-col items-center p-6 pb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-violet-500 shadow-md mb-3">
          <img
            src={profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt={username}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        <h3 className="text-white text-lg font-semibold tracking-wide mb-1">{username}</h3>
      </div>

      {/* Divider */}
      <div className="border-t border-[#2a2a2a] mx-6 relative z-10" />

      {/* Stats */}
      <div className="relative z-10 flex justify-between items-center px-6 py-4 text-sm text-gray-400">
        {postCount > 0 ? (
          <Link to={`/all-posts/${_id}`} className="flex flex-col items-center">
            <div className="flex flex-col items-center bg-transparent hover:bg-gray-800/30 p-3 px-4 rounded-xl transition-all duration-300 ease-in-out cursor-pointer hover:shadow-md">
              <span className="text-white font-semibold transition duration-300 ">{postCount}</span>
              <span className="text-xs transition duration-300 hover:text-blue-600">Posts</span>
            </div>
          </Link>
        ) : (
          <div className="flex flex-col items-center bg-transparent hover:bg-gray-800/30 p-3 px-4 rounded-xl transition-all duration-300 ease-in-out cursor-pointer hover:shadow-md">
            <span className="text-white font-semibold ">{postCount}</span>
            <span className="text-xs ">Posts</span>
          </div>
        )}

        <div className="w-[1px] h-6 bg-[#2a2a2a]" />
        <Link to={`/profile/${_id}`} className="flex flex-col items-center">
          <div className="flex flex-col items-center bg-transparent hover:bg-gray-800/30 p-3 px-4 rounded-xl transition-all duration-300 ease-in-out cursor-pointer hover:shadow-md">
            <span className="text-white font-semibold transition duration-300">View</span>
            <span className="text-xs transition duration-300">Profile</span>
          </div>
        </Link>
      </div>

    </div>
  );
}
