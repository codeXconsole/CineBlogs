/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

function UserCard({ userData, index }) {
  return (
    <div
      key={index}
      className="relative mx-4 sm:mx-0 bg-transparent border-[1px] border-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform"
    >
      <div className="flex justify-center mb-4">
        <img
          src={userData?.user?.profileImage || userData.profileImage  ||"https://via.placeholder.com/100"}
          alt={`${userData?.user?.username || userData.username || "User"}'s Profile`}
          className="w-20 h-20 rounded-full border-2 border-white object-cover"
        />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-white">
          {userData?.user?.username || userData.username ||"Unknown User"}
        </h3>
        <p className="text-sm text-gray-400">
          {userData?.user?.email || userData.email ||"No email found"}
        </p>
      </div>
      <div className="mt-4">
        <Link to={`/profile/${userData?.user?._id || userData._id}`}>
          <button className="w-full py-2 text-sm bg-white text-black rounded-lg shadow hover:bg-gray-400 transform hover:scale-[1.02] transition">
            View Profile
          </button>
        </Link>
      </div>
    </div>
  );
}

export default UserCard;
