/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import { ScaleLoader } from "react-spinners";
import AuthorCard from "../../Components/AuthorCard";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Followers = () => {
  const [user, setUser] = useState(null);
  const [selectedFollower, setSelectedFollower] = useState(null);
  const userData = useSelector((state) => state.Auth.userData);
  const authToken = localStorage.getItem("authToken");
  const [isLoading, setLoading] = useState(false);

  const getUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/v1/users/get-user/${userData._id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const user = response.data.data;
      setUser(user);
      setSelectedFollower(user?.followers?.[0]?.follower || null);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?._id) getUser();
  }, [userData?._id]);

  if (isLoading) {
    return (
      <div className="flex w-creen h-screen justify-center items-start mt-40">
        <div className="mt-16">
          <ScaleLoader color="#ffffff" height={50} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-between items-start w-full min-h-screen px-8 md:px-12 gap-6 py-8">
      
      {/* Followers Grid */}
      <div className="w-3/4">
        {user?.followers?.length === 0 ? (
          <div className="text-center text-white mt-12">
            <p className="text-2xl font-medium">
              You have no followers yet.
            </p>
            <p className="text-lg text-gray-400 mt-2 max-w-md mx-auto">
              Start posting content to build your network!
            </p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {user?.followers?.map((followerObj, index) => (
              <div
                key={index}
                className="flex justify-center items-center cursor-pointer"
                onClick={() => setSelectedFollower(followerObj?.follower)}
              >
                <AuthorCard userData={followerObj?.follower} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-1/4 p-6 rounded-2xl shadow-lg flex flex-col gap-6 overflow-y-auto max-h-[90vh] bg-[#1c1c24] text-white">
        {selectedFollower ? (
          <>
            <div className="flex flex-col items-center">
              <img
                src={selectedFollower?.profileImage || "/default-avatar.png"}
                alt={selectedFollower?.fullName}
                className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-purple-600"
              />
              <h2 className="text-2xl font-bold">{selectedFollower?.fullName}</h2>
              <p className="text-sm text-gray-400 mb-2">@{selectedFollower?.username}</p>
              <p className="text-center text-gray-300 text-sm">
                {selectedFollower?.bio || "No bio available yet."}
              </p>
            </div>

            {/* Stats */}
            <div className="flex justify-around items-center text-center border-y border-gray-700 py-4">
              <div>
                <p className="text-lg font-semibold">{selectedFollower?.followers?.length || 0}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{selectedFollower?.followings?.length || 0}</p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
            </div>

            {/* Extra Info */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-400">Posts:</p>
                <p>{selectedFollower?.totalPosts || 0}</p>
              </div>
            </div>

            {/* Action Button */}
            <Link to={`/dashboard`}>
            <button className="mt-4 py-2 w-full rounded-full bg-purple-600 hover:bg-purple-700 transition text-white font-semibold">
              Message
            </button>
            </Link>
          </>
        ) : (
          <p className="text-center text-gray-400">Select a follower to view profile</p>
        )}
      </div>

    </div>
  );
};

export default Followers;
