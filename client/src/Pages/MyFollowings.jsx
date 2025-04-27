/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ScaleLoader } from "react-spinners";
import AuthorCard from "../Components/AuthorCard";

const MyFollowings = () => {
  const [followings, setFollowings] = useState(null);
  const { userId } = useParams();
  const authToken = localStorage.getItem("authToken");
  const [isLoading, setLoading] = useState(false);

  const getUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/v1/users/followings/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const followings = response.data.data;
      setFollowings(followings);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, [userId]);

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
    <div className="w-full min-h-screen flex flex-col justify-start bg-gradient-to-b from-black via-[#0d0216] to-black py-16">
      <div className="px-8 md:px-12">

        {/* No Followings Message */}
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
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 mt-8">
            {/* Followings Cards */}
            {followings?.map((follower, index) => (
              <div
                key={index}
                className="flex justify-center items-center"
              >
                <AuthorCard userData={follower} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFollowings;
