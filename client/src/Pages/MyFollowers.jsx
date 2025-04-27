/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ScaleLoader } from 'react-spinners';
import UserCard from "../Components/UserCard";
import AuthorCard from "../Components/AuthorCard";
 
const MyFollowers = () => {
    const [user, setUser] = useState(null)
    const { userId } = useParams();
    const authToken = localStorage.getItem('authToken');
    const [isLoading, setLoading] = useState(false);
    const getUser = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/v1/users/get-user/${userId}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          const user = response.data.data;
          setUser(user);
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
          <div className="w-full flex flex-col justify-center items-center bg-gradient-to-b from-black via-[#14061F] to-black py-12">
            <div className="p-4 w-full flex flex-col justify-center items-center">
              <h1 className="text-4xl font-semibold text-white">
                "Patience, the Best Stories Are Worth the Wait."
              </h1>
              <p className="text-lg mt-2 text-gray-300">
                We’re brewing something great! Check back soon for fresh content.
              </p>
            </div>
            <div className='mt-[5rem]'>
              <ScaleLoader color="#ffffff" height={50} />
            </div>
          </div>
        );
      }

      if (!isLoading) return (
        <div className="w-full min-h-screen flex flex-col justify-start bg-gradient-to-b from-black via-[#0d0216] to-black py-16 px-">
      
          {/* No Followers message */}
          {user?.followers?.length === 0 ? (
            <p className="text-xl text-white text-center mb-10">
              You have no followers yet. Start posting content to build your network!
            </p>
          ) : (
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 mt-8">
            {user?.followers?.map((follower, index) => (
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
      );    
};

export default MyFollowers;
