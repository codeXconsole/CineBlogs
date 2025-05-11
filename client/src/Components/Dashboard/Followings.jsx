/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ScaleLoader } from "react-spinners";
import AuthorCard from "../../Components/AuthorCard";
import { getFollowings } from "../../AppWrite/Apibase";
import { Link } from "react-router-dom";

const Followings = () => {
  const [followings, setFollowings] = useState(null);
  const userData = useSelector((state) => state.Auth.userData);
  const authToken = localStorage.getItem("authToken");
  const [isLoading, setLoading] = useState(false);
  const [selectedFollowing, setSelectedFollowing] = useState(null);

  const getUserFollowings = async () => {
    setLoading(true);
    try {
      const response = await getFollowings(userData?._id, authToken);
      const followings = response.data;
      setFollowings(followings);
      setSelectedFollowing(followings[0]);
    } catch (error) {
      console.error("Error fetching followings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?._id) getUserFollowings();
  }, [userData?._id]);

  if (isLoading) {
    return (
      <div className="flex w-full h-screen justify-center items-start mt-40">
        <div className="mt-16">
          <ScaleLoader color="#ffffff" height={50} />
        </div>
      </div>
    );
  }
  else {
    return (
      <div className="flex flex-row justify-between items-start w-full min-h-screen px-8 md:px-12 gap-6 py-8 bg-black">
        {/* Followings Grid */}
           <div className={`${followings?.length === 0 ? 'w-full' : 'w-3/4'}`}>
          {followings?.length === 0 ? (
            <div className="text-center text-white mt-12">
              <p className="text-2xl font-medium">You don't have any followings yet.</p>
              <p className="text-lg text-gray-400 mt-2 max-w-md mx-auto">
                Start following other authors to build your network and discover new content!
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

        {/* Vertical Divider */}
        <div className="w-px bg-gray-600 mx-6" />

        {/* Sidebar */}
        {followings?.length > 0 && !isLoading ? (
          <div className="w-1/4 p-6 rounded-xl shadow-lg flex flex-col overflow-y-auto max-h-[90vh] text-white border border-gray-600">
            {selectedFollowing ? (
              <>
                <div className="flex flex-col items-center mb-6 space-y-4">
                  <img
                    src={selectedFollowing?.profileImage || "/default-avatar.png"}
                    alt={selectedFollowing?.fullName}
                    className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-500 transform hover:scale-110 transition-transform duration-300"
                  />
                  <p className="text-xl font-semibold text-gray-200 mb-1">@{selectedFollowing?.username}</p>
                  <p className="text-center text-gray-300 text-sm">{selectedFollowing?.bio || "No bio available yet."}</p>
                </div>

                {/* Stats Section */}
                <div className="flex justify-around items-center text-center border-t border-gray-700 pt-4 mb-4">
                  <div className="text-sm">
                    <p className="text-lg font-semibold">{selectedFollowing?.followers || 0}</p>
                    <p className="text-xs text-gray-400">Followers</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-lg font-semibold">{selectedFollowing?.followings || 0}</p>
                    <p className="text-xs text-gray-400">Following</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-lg font-semibold">{selectedFollowing?.posts || 0}</p>
                    <p className="text-xs text-gray-400">Posts</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 mt-6">
                  {/* View Profile Button */}
                  <Link to={`/profile/${selectedFollowing?._id}`}>
                    <button className="py-2 px-4 w-full rounded-lg border-2 border-gray-600 hover:bg-white transition-all duration-300 text-white hover:text-black font-medium text-sm shadow-lg hover:shadow-xl">
                      View Profile
                    </button>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400">Select a follower to view profile</p>
            )}
          </div>
        ) : null}

      </div>
    );
  }


};

export default Followings;
