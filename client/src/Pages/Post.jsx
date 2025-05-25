/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ScaleLoader } from "react-spinners";
import { getPostById, reactToPost } from "../AppWrite/Apibase.js";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsDown, faThumbsUp, faShare, faCalendarAlt, faClock, faBookmark, faUser } from '@fortawesome/free-solid-svg-icons';
import DeletePost from "../Components/DeletePost.jsx";

export default function Post() {
  const [post, setPost] = useState(null);
  const [isAuthor, setAuthor] = useState(false);
  const token = localStorage.getItem('authToken');
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { postId } = useParams();
  const userStatus = useSelector((state) => state.Auth.status);
  const navigate = useNavigate();
  const userData = useSelector((state) => state.Auth.userData);
  const [isLoading, setLoading] = useState(false);

  // Calculate reading time
  const calculateReadingTime = (text) => {
    if (!text || typeof text !== 'string') return 1;
    const cleanText = text.replace(/<[^>]*>/g, '');
    const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const wordsPerMinute = 225;
    const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readingTimeMinutes);
  };

  useEffect(() => {
    setLoading(true);
    if (postId) {
      getPostById(postId)
        .then((fetchedPost) => {
          setPost(fetchedPost);
          setUserHasLiked(fetchedPost.userHasLiked);
          setIsDisliked(fetchedPost.userHasDisliked);
          setLikes(fetchedPost.likes || 0);
          setDislikes(fetchedPost.dislikes || 0);
          if (fetchedPost.userId._id === userData._id) {
            setAuthor(true);
          }
        })
        .catch((error) => {
          console.error(error);
          navigate("/");
        })
        .finally(() => setLoading(false));
    }
  }, [postId, userData]);

  const updateReactionState = (value) => {
    setPost((prev) => {
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
    if (!userHasLiked) {
      try {
        setLikes((prevLikes) => prevLikes + 1);
        setDislikes((prevDislikes) => Math.max(prevDislikes - 1, 0));
        reactToPost(post._id, 1, token);
        updateReactionState(1);
      } catch {
        toast.error("Failed to react to post");
      }
    }
  };

  const handleDislike = async () => {
    if (!isDisliked) {
      try {
        setLikes((prevLikes) => Math.max(prevLikes - 1, 0));
        setDislikes((prevDislikes) => prevDislikes + 1);
        reactToPost(post._id, -1, token);
        updateReactionState(-1);
      } catch {
        toast.error("Failed to react to post");
      }
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard", {
        autoClose: 1000,
        style: { backgroundColor: "#1f2937", color: "#ffffff" },
        hideProgressBar: true,
      });
    } catch {
      toast.error("Failed to copy!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#14061F] to-black flex items-center justify-center relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-blue-500/5 rounded-full blur-2xl"></div>
        </div>

        <div className="text-center z-10">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-200 mb-2">
              Loading Article...
            </h1>
            <p className="text-sm text-gray-400">
              Please wait while we prepare your content.
            </p>
          </div>
          <ScaleLoader color="#a855f7" height={35} width={4} />
        </div>
      </div>
    );
  }

  if (!userStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#14061F] to-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-purple-500/3 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-blue-500/3 rounded-full blur-2xl"></div>
        </div>

        <div className="text-center z-10 px-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl max-w-md">
            <div className="mb-6">
              <FontAwesomeIcon icon={faUser} className="text-3xl text-purple-400 mb-4" />
              <h1 className="text-2xl font-semibold text-white mb-2">
                Sign In Required
              </h1>
              <p className="text-sm text-gray-300">
                Please sign in to read this article and access all features.
              </p>
            </div>
            <Link to="/login">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return post ? (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#14061F] to-black relative hide-chatbot">
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-purple-500/3 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-blue-500/3 rounded-full blur-2xl"></div>
      </div>

      {/* Header with author controls */}
      {isAuthor && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Link to={`/edit-post/${post._id}`}>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md border border-white/10">
              Edit Post
            </button>
          </Link>
          <DeletePost post={post} />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta information */}
            <div className="flex items-center justify-center gap-4 text-gray-400 text-sm mb-6">
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faClock} className="text-xs" />
                <span>{calculateReadingTime(post.content)} min read</span>
              </div>
            </div>

            {/* Author section */}
            {!isAuthor && (
              <div className="flex items-center justify-center gap-3 mb-6">
                <img
                  src={post?.userId?.profileImage || "https://via.placeholder.com/40"}
                  alt={post?.userId?.username}
                  className="w-10 h-10 rounded-full border-2 border-purple-500/30"
                />
                <div className="text-left">
                  <p className="text-gray-400 text-xs">Written by</p>
                  <Link to={`/profile/${post?.userId._id}`}>
                    <h3 className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                      {post?.userId.username || "Unknown Author"}
                    </h3>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Main content layout */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Article image */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="relative group mb-6">
                  <img
                    src={post?.image}
                    alt={post?.title}
                    className="w-[13rem] mx-auto sm:w-full h-auto rounded-xl shadow-lg border border-white/10 transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>

                {/* Engagement buttons - Desktop */}
                {!isAuthor && (
                  <div className="hidden lg:block">
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={handleLike}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-300 ${userHasLiked
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-white/5 text-gray-400 hover:bg-green-500/10 hover:text-green-400 border border-white/10'
                              }`}
                          >
                            <FontAwesomeIcon icon={faThumbsUp} className="text-xs" />
                            <span className="font-medium">{likes}</span>
                          </button>

                          <button
                            onClick={handleDislike}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-300 ${isDisliked
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-white/10'
                              }`}
                          >
                            <FontAwesomeIcon icon={faThumbsDown} className="text-xs" />
                            <span className="font-medium">{dislikes}</span>
                          </button>
                        </div>

                        <button
                          onClick={handleShare}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm bg-white/5 text-blue-400 hover:bg-blue-500/10 border border-white/10 transition-all duration-300"
                        >
                          <FontAwesomeIcon icon={faShare} className="text-xs" />
                          <span className="font-medium">Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Article content */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-lg">
                <div className="prose prose-lg prose-invert max-w-none">
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile engagement buttons */}
          {!isAuthor && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-3 z-20">
              <div className="flex gap-2 max-w-sm mx-auto">
                <button
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-300 ${userHasLiked
                    ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                    : 'bg-white/10 text-gray-300 border border-white/20'
                    }`}
                >
                  <FontAwesomeIcon icon={faThumbsUp} className="text-xs" />
                  <span className="font-medium">{likes}</span>
                </button>

                <button
                  onClick={handleDislike}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-300 ${isDisliked
                    ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                    : 'bg-white/10 text-gray-300 border border-white/20'
                    }`}
                >
                  <FontAwesomeIcon icon={faThumbsDown} className="text-xs" />
                  <span className="font-medium">{dislikes}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm bg-white/10 text-blue-400 border border-white/20 transition-all duration-300"
                >
                  <FontAwesomeIcon icon={faShare} className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
}