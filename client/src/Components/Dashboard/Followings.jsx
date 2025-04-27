import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ScaleLoader } from "react-spinners";
import AuthorCard from "../../Components/AuthorCard";
import { useSelector } from "react-redux";

const Followings = () => {
  const [followings, setFollowings] = useState(null);
  const userData = useSelector((state) => state.Auth.userData);
  const authToken = localStorage.getItem("authToken");
  const [isLoading, setLoading] = useState(false);
  const [selectedFollowing, setSelectedFollowing] = useState(null); // for sidebar

  const getUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/v1/users/followings/${userData._id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const followings = response.data.data;
      setFollowings(followings);
      setSelectedFollowing(followings[0].user);
      console.log(followings[0]); // default select first following
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) getUser();
  }, [userData]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-b from-black via-[#14061F] to-black py-12">
        <div className="p-4 w-full flex flex-col justify-center items-center">
          <h1 className="text-4xl font-semibold text-white text-center">
            "Patience, the Best Stories Are Worth the Wait."
          </h1>
          <p className="text-lg mt-2 text-gray-300 text-center">
            We’re brewing something great! Check back soon for fresh content.
          </p>
        </div>
        <div className="mt-16">
          <ScaleLoader color="#ffffff" height={50} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-between items-start w-full min-h-screen px-8 md:px-12 gap-6 py-8">
      
      {/* Followings Grid */}
      <div className="w-3/4">
        {followings?.length === 0 ? (
          <div className="text-center text-white mt-12">
            <p className="text-2xl font-medium">
              You don't have any followings yet.
            </p>
            <p className="text-lg text-gray-400 mt-2 max-w-md mx-auto">
              Start following other authors to build your network and discover
              new content!
            </p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {followings?.map((follower, index) => (
              <div
                key={index}
                className="flex justify-center items-center cursor-pointer"
                onClick={() => setSelectedFollowing(follower)}
              >
                <AuthorCard userData={follower} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-1/4 p-6 rounded-xl shadow-lg flex flex-col gap-4 overflow-y-auto max-h-[90vh] bg-[#1c1c24]">
        {selectedFollowing ? (
          <div className="flex flex-col items-center text-white">
            <img
              src={selectedFollowing?.profileImage || "/default-avatar.png"}
              alt={selectedFollowing?.fullName}
              className="w-32 h-32 rounded-full object-cover mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{selectedFollowing?.fullName}</h2>
            <p className="text-sm text-gray-400 mb-4">@{selectedFollowing?.username}</p>
            <p className="text-sm text-center text-gray-300">
              {selectedFollowing?.bio || "This user has not added a bio yet."}
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-400">Select a following to view profile</p>
        )}
      </div>

    </div>
  );
};

export default Followings;
