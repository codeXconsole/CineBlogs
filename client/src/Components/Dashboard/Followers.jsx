/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import AuthorCard from "../../Components/AuthorCard";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getFollowers } from "../../AppWrite/Apibase";

const Followers = () => {
  const [selectedFollower, setSelectedFollower] = useState(null);
  const [followersData, setFollowersData] = useState(null);
  const userData = useSelector((state) => state.Auth.userData);
  const authToken = localStorage.getItem("authToken");
  const [isLoading, setLoading] = useState(false);

  const getUserFollowers = async () => {
    setLoading(true);
    try {
      const response = await getFollowers(userData?._id, authToken);
      setSelectedFollower(response.data[0]);
      setFollowersData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching followers:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userData?._id) getUserFollowers()
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
  else {
    return (
      <div className="flex flex-row justify-between items-start w-full min-h-screen px-8 md:px-12 gap-6 py-8 bg-black">
        {/* Followers Grid */}
        <div className={`${followersData?.length === 0 ? 'w-full' : 'w-3/4'}`}>
          {followersData?.length === 0 ? (
            <div className="text-center text-white mt-12">
              <p className="text-2xl font-medium">
                You have no followers yet.
              </p>
              <p className="text-lg text-gray-400 mt-2 max-w-md mx-auto">
                Start posting content to build your network!
              </p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-[7rem] gap-y-[1rem]">
              {followersData?.map((followerObj, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center cursor-pointer"
                  onClick={() => setSelectedFollower(followerObj)}
                >
                  <AuthorCard userData={followerObj} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-gray-600 mx-6" />

        {/* Sidebar */}
        {
          followersData?.length > 0 && !isLoading ? (
            <div className="w-1/4 p-6 rounded-xl shadow-lg flex flex-col overflow-y-auto max-h-[90vh] text-white border border-gray-600">
              {selectedFollower ? (
                <>
                  {/* Profile Section */}
                  <div className="flex flex-col items-center mb-6 space-y-4">
                    <img
                      src={selectedFollower?.profileImage || "/default-avatar.png"}
                      alt={selectedFollower?.fullName}
                      className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-500 transform hover:scale-110 transition-transform duration-300"
                    />
                    <p className="text-xl font-semibold text-gray-200 mb-1">@{selectedFollower?.username}</p>
                    <p className="text-center text-gray-300 text-sm">{selectedFollower?.bio || "No bio available yet."}</p>
                  </div>

                  {/* Stats Section */}
                  <div className="flex justify-around items-center text-center border-t border-gray-700 pt-4 mb-4">
                    <div className="text-sm">
                      <p className="text-lg font-semibold">{selectedFollower?.followers || 0}</p>
                      <p className="text-xs text-gray-400">Followers</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-lg font-semibold">{selectedFollower?.followings || 0}</p>
                      <p className="text-xs text-gray-400">Following</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-lg font-semibold">{selectedFollower?.posts || 0}</p>
                      <p className="text-xs text-gray-400">Posts</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4 mt-6">
                    {/* View Profile Button */}
                    <Link to={`/profile/${selectedFollower?._id}`}>
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
          ) : null
        }
      </div>
    );
  }


};

export default Followers;
