/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ScaleLoader } from "react-spinners";
import { getPostById, reactToPost } from "../AppWrite/Apibase.js";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp, faShare } from '@fortawesome/free-solid-svg-icons';
import DeletePost from "../Components/DeletePost.jsx";

export default function Post() {
  const [post, setPost] = useState(null);
  const [isAuthor, setAuthor] = useState(false);
  const token = localStorage.getItem('authToken')
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const { postId } = useParams();
  const [isDisliked, setIsDisliked] = useState(false)
  const userStatus = useSelector((state) => state.Auth.status);
  const navigate = useNavigate();
  const userData = useSelector((state) => state.Auth.userData);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (postId) {
      getPostById(postId)
        .then((fetchedPost) => {
          setPost(fetchedPost);
          setUserHasLiked(fetchedPost.userHasLiked);
          setIsDisliked(fetchedPost.userHasDisliked);
          setLikes(fetchedPost.likes || 0);
          if(fetchedPost.userId._id === userData._id) {
            setAuthor(true);
          }
          setDislikes(fetchedPost.dislikes || 0)
        })
        .catch((error) => {
          console.log(error);
          navigate("/");
        })
        .finally(() => setLoading(false));
    }
  }, [postId, userData]);

  const updateReactionState = (value) => {
    setPost(prev => {
      let newLikes = prev.likes;
      let newDislikes = prev.dislikes;

      if (value === 1) {
        if (prev.dislikes > 0 && isDisliked) newDislikes -= 1;
        newLikes += 1;
      } else if (value === -1) {
        if (prev.likes > 0 && userHasLiked) newLikes -= 1;
        newDislikes += 1;
      }

      return { ...prev, likes: newLikes, dislikes: newDislikes };
    });

    setUserHasLiked(value === 1);
    setIsDisliked(value === -1);
  };

  const handleLike = async () => {
    try {
      if (!userHasLiked) {
        setLikes((prevLikes) => prevLikes + 1);
        setDislikes((prevDislikes) => Math.max(prevDislikes - 1, 0));
        reactToPost(post._id, userHasLiked ? 0 : 1, token);
        updateReactionState(userHasLiked ? 0 : 1);
      }
    } catch (error) {
      toast.error("Failed to react to post");
    }
  };

  const handleDislike = async () => {
    try {
      if (!isDisliked) {
        setLikes((prevLikes) => Math.max(prevLikes - 1, 0));
        setDislikes((prevDislikes) => prevDislikes + 1);
        reactToPost(post._id, isDisliked ? 0 : -1, token);
        updateReactionState(isDisliked ? 0 : -1);
      }
    } catch (error) {
      toast.error("Failed to react to post");
    }
  };


  const handleShare = async () => {
    try {
      const currentURL = window.location.href;
      await navigator.clipboard.writeText(currentURL);
      toast.success("Link copied to clipboard", {
        autoClose: 1000,
        style: {
          backgroundColor: "#2e1065",
          color: "#ffffff",
        },
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error("Failed to copy!");
      console.error("Copy failed", error);
    }
  }

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

  if (userStatus !== true) {
    return (
      <div className="w-full py-12 mt-4 text-center">
        <div className="flex flex-wrap justify-center">
          <div className="p-4 w-full">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              "Unlock a World of Stories, One Post at a Time."
            </h1>
            <p className="text-lg mt-2 text-gray-300">
              Sign in and start exploring. Dive into the world of endless content!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return post ? (
    <div
      className={`bg-gradient-to-b from-black via-[#0d0216] to-black min-h-screen flex-col relative ${isAuthor ? "py-10" : "py-0"
        }`}
    >
      {isAuthor && (
        <div className="absolute top-8 right-8 sm:right-10 flex gap-4">
          <Link to={`/edit-post/${post._id}`}>
            <button className="px-4 py-2 bg-purple-500 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-all duration-300">
              Edit
            </button>
          </Link>
          <DeletePost post={post} />
        </div>
      )}

      <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="w-full max-w-[80rem] sm:flex gap-12 text-white mt-16 sm:mt-8 px-4">

          <div className="sm:w-1/3 mt-5 h-[20rem] flex-col justify-start items-start sm:items-center">

            <div className="w-full flex justify-center sm:justify-start items-center -auto rounded-xl overflow-hidden mb-8 sm:mb-0">
              <img
                src={post?.image}
                alt={post?.title}
                className="h-[21rem] object-cover rounded-xl transition-transform duration-300 hover:scale-105"
              />
            </div>
            {!isAuthor && (
              <div className="sm:flex hidden justify-start items-center mt-5 ml-5">
                <button className={`p-3  ${userHasLiked ? "text-green-500" : "text-gray-400"}`} onClick={handleLike}>
                  <FontAwesomeIcon className="mr-3" icon={faThumbsUp} /> {/* Adjusted margin-right */}
                  {likes || 0}
                </button>
                <button className={`p-3  ${isDisliked ? "text-red-500" : "text-gray-400"}`} onClick={handleDislike}>
                  <FontAwesomeIcon className="mr-3" icon={faThumbsDown} /> {/* Adjusted margin-right */}
                  {dislikes || 0}
                </button>
                <button className="p-3 text-blue-400" onClick={handleShare}>
                  <FontAwesomeIcon className="mr-3" icon={faShare} /> {/* Adjusted margin-right */}
                </button>
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="w-full flex-col justify-center items-center max-w-[60rem] mt-7 text-white text-center">
            <div className="flex justify-between items-center">
              {!isAuthor && (
                <div className=" w-full relative flex flex-col items-center sm:items-center text-gray-300">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    Written by
                  </h2>
                  <Link to={`/profile/${post?.userId._id}`}>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.05] transform transition-all duration-[.3]">
                      {post?.userId.username || "Unknown Author"}
                    </h3>
                  </Link>
                  <p className="text-sm sm:text-base text-gray-400 mt-2 tracking-wide">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <p className="text-lg text-gray-300 mt-7 px-6 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>

        {/* Like/Dislike Buttons Mobile*/}
        {!isAuthor && (
          <div className="flex justify-center items-center sm:mr-[5rem] mt-5 gap-12 relative mb-8">
            <button
              className={`flex justify-center sm:hidden items-center p-3 text-2xl font-bold transition-all transform ${userHasLiked ? "scale-110" : "hover:scale-105"}`}
              onClick={handleLike}
              style={{
                borderRadius: "15px",
                background: "linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                color: "white", // Green color for the icon and text
              }}
            >
              <FontAwesomeIcon icon={faThumbsUp} style={{ marginRight: '8px' }} />
              {post?.likes}
            </button>

            <button
              className={` flex justify-center sm:hidden items-center p-3 text-2xl font-bold transition-all transform`}
              onClick={handleDislike}
              style={{
                borderRadius: "15px",
                background: "linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                color: "white",
              }}
            >
              <FontAwesomeIcon icon={faThumbsDown} style={{ marginRight: '8px' }} />
              {post?.dislikes}
            </button>

            <button
              className={`flex justify-center items-center sm:hidden p-3 text-3xl font-bold transition-all transform ${userHasLiked ? "scale-110" : "hover:scale-105"}`}
              onClick={handleShare}
              style={{
                borderRadius: "15px",
                background: "linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                color: "white", // Green color for the icon and text
              }}
            >
              <FontAwesomeIcon icon={faShare} style={{ marginRight: '8px' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  ) : null;
}
