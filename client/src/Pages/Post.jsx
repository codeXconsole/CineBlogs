import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ScaleLoader } from "react-spinners";
import { addLike, deletePost, getPostById, addDislike } from "../AppWrite/Apibase.js";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faL, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp, faShare } from '@fortawesome/free-solid-svg-icons';
import DeletePost from "../Components/DeletePost.jsx";

export default function Post() {
  const [post, setPost] = useState(null);
  const [isAuthor, setAuthor] = useState(false);
  const token = localStorage.getItem('authToken')
  const [likes, setLikes] = useState(0);
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
          fetchedPost.likes?.map((user) => {
            if (user?.userId === userData?._id) {
              setUserHasLiked(true);
            }
          })
          fetchedPost.dislikes?.map((user) => {
            if (user?.userId === userData?._id) {
              setIsDisliked(true)
            }
          })
          setPost(fetchedPost);
          if (userData) {
            checkIsAuthor(fetchedPost);
          }
        })
        .catch((error) => {
          console.log(error)
          // toast.error("Post not found");
          navigate("/");
        })
        .finally(() => setLoading(false));
    }
  }, [postId, userData]);

  const checkIsAuthor = (fetchedPost) => {
    if (userData && fetchedPost.userId._id === userData._id) {
      setAuthor(true);
    }
  };

  const saveLikesInDatabase = async (postId, isPostLiked, trial = 0) => {
    if (trial === 3) {
      alert('Error occured while updating content');
      // Revert state that is updated on like operation
      updateStateOnLike(!isPostLiked);
    }
    if (trial < 3) {
      try {
        await addLike(postId, token);
      } catch (err) {
        saveLikesInDatabase(postId, isPostLiked, ++trial);
      }
    }
  };

  const saveDislikesInDatabase = async (postId, isPostDisliked, trial = 0) => {
    if (trial === 3) {
      alert('Error occured while updating content');
      // Revert state that is updated on dislike operation
      updateStateOnDislike(!isPostDisliked);
    }
    if (trial < 3) {
      try {
        await addDislike(postId, token);
      } catch (err) {
        saveDislikesInDatabase(postId, isPostDisliked, ++trial);
      }
    }
  };

  const updateStateOnLike = (isPostLiked)=> {
    setPost(post => {
      if (isPostLiked) {
        post.likes.push({ userId: userData?._id });
      } else {
        post.likes = post.likes.filter(item => item.userId !== userData?._id);
      }
      return post;
    })
    setUserHasLiked((prev) => !prev);
  };

  const updateStateOnDislike = (isPostDisliked)=> {
    setPost(post => {
      if (isPostDisliked) {
        post.dislikes.push({ userId: userData?._id });
      } else {
        post.dislikes = post.dislikes.filter(item => item.userId !== userData?._id);
      }
      return post;
    })
    setIsDisliked((prev) => !prev);
  };

  const handleLike = async () => {
    saveLikesInDatabase(post?._id, !userHasLiked);
    updateStateOnLike(!userHasLiked);
    if(isDisliked){
      updateStateOnDislike(false);
    }
  };

  const handleDislike = async () => {
    saveDislikesInDatabase(post?._id, !isDisliked);
    updateStateOnDislike(!isDisliked);
    if(userHasLiked) {
      updateStateOnLike(false);
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
          <DeletePost post={post} deletePost={deletePost} />
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
                  {post?.likes?.length}
                </button>
                <button className={`p-3  ${isDisliked ? "text-red-500" : "text-gray-400"}`} onClick={handleDislike}>
                  <FontAwesomeIcon className="mr-3" icon={faThumbsDown} /> {/* Adjusted margin-right */}
                  {post?.dislikes?.length}
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
              {post?.likes?.length}
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
              {post?.dislikes?.length}
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
