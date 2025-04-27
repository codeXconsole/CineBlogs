/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from 'axios';
import { ScaleLoader } from 'react-spinners';
import AuthorCard from "../../Components/AuthorCard";
import { useSelector } from "react-redux";
 
const Followers = () => {
    const [user, setUser] = useState(null)
    const userData = useSelector((state) => state.Auth.userData);
    const authToken = localStorage.getItem('authToken');
    const [isLoading, setLoading] = useState(false);
    const getUser = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/v1/users/get-user/${userData._id}`, {
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
      }, [userData._id]);

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
        <div className="w-full flex flex-col justify-start bg-gradient-to-b from-black via-[#0d0216] to-black">
      
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

export default Followers;
