/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { PostCard } from "..";
import { useSelector } from "react-redux";
import { getAllPostsByUser } from "../../AppWrite/Apibase";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import DeletePost from "../DeletePost";

function MyPosts() {
  const userData = useSelector((state) => state.Auth.userData);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);  // State to hold selected post
  const navigate = useNavigate();
  const userStatus = useSelector((state) => state.Auth.status);
  const authToken = localStorage.getItem("authToken");

  const getPosts = async () => {
    setIsLoading(true);
    try {
      const response = await getAllPostsByUser(authToken, userData._id);
      if (response) {
        setPosts(response);
        setSelectedPost(response[0]); 
      } else {
        setPosts([]);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (authToken) {
      getPosts();
    }
  }, [authToken]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

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
        <div className="mt-[5rem]">
          <ScaleLoader color="#ffffff" height={50} />
        </div>
      </div>
    );
  }

  if (posts.length === 0 && userStatus === true) {
    return (
      <div className="w-full h-full py-8 mt-4 flex justify-center items-center text-center">
        <div className="max-w-lg">
          <h1 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4">
            No Posts Yet
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Start sharing your thoughts with the world! Click the <span onClick={() => navigate('/add-post')} className="text-indigo-400 cursor-pointer">Add Post</span> button to get started.
          </p>
          <p className="text-sm text-gray-500">
            Whether it's your first blog or a new idea, we're excited to see what you create.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-between items-start w-full gap-6">
      {/* Posts Grid */}
      <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts?.map((post) => (
          <div
            key={post._id}
            className="transition-transform transform hover:scale-105 hover:shadow-xl animate__animated animate__fadeIn"
            onClick={() => handlePostClick(post)} // Set the selected post when clicked
          >
            <PostCard {...post} isLink={false} />
          </div>
        ))}
      </div>

      {/* Sidebar - Display Selected Post */}
      <div className="w-1/4 p-6 rounded-xl shadow-lg flex flex-col gap-4">
        {selectedPost ? (
          <div className="flex flex-col items-center text-white">
            <img
              src={selectedPost?.image}
              alt={selectedPost?.title}
              className="w-full object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{selectedPost?.title}</h2>
            <p className="text-sm mb-4 text-gray-300">{selectedPost?.content.substring(0, 150)}...</p>
            <div className="flex gap-3">
              {/* Smaller and more professional buttons */}
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                onClick={() => navigate(`/edit-post/${selectedPost._id}`)}
              >
                Edit
              </button>
              <DeletePost post={selectedPost} />
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-300">Select a post to view details</p>
        )}
      </div>
    </div>
  );
}

export default MyPosts;
