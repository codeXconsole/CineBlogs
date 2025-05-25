/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

function AuthorCard({ userData, className, viewProfileBtn }) {
  const userId = userData?.user?._id || userData._id;
  const username = userData?.user?.username || userData.username || "Unknown User";
  const profileImage = userData?.user?.profileImage || userData.profileImage || "https://via.placeholder.com/100";

  return (
    <div className={`relative mx-auto w-full min-w-[9rem] max-w-[13rem] border border-gray-700 rounded-xl shadow-sm bg-transparent hover:shadow-lg transition-all transform hover:-translate-y-1 hover:scale-[1.02] duration-300 ${className}`}>
      {/* Profile Image */}
      <div className="flex justify-center mt-4">
        <img
          src={profileImage}
          alt={`${username}'s Profile`}
          className="w-16 h-16 rounded-full border-2 border-gray-600 object-cover"
        />
      </div>

      {/* User Info */}
      <div className="text-center my-3 px-3">
        <h3 className="text-sm font-semibold text-white truncate">{username}</h3>
      </div>

      {/* Buttons or Placeholder */}
      <div className="mb-4 px-4">
        {viewProfileBtn ? (
          <div className="space-y-2">
            <Link to={`/profile/${userId}`}>
              <button className="w-full py-1.5 text-xs font-medium bg-gradient-to-br from-[#d24e83] to-[#8f44fd] hover:bg-blue-900 text-white rounded-full transition duration-300 mb-2">
                View Profile
              </button>
            </Link>
          </div>
        ) : (
          <div /> // Keeps spacing consistent
        )}
        <Link to={`/conversations/${userId}`}>
          <button className="w-full py-1.5 text-xs font-medium flex items-center justify-center gap-1 border border-gray-600 text-white  dark:hover:bg-gray-800 rounded-full transition duration-300">
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
        </Link>
      </div>
    </div>
  );
}

export default AuthorCard;
