/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef, useCallback } from "react";
import { PostCard } from "../Components";
import { getAllPostsInHomePage } from "../AppWrite/Apibase";
import SearchBar from "../utility/SearchBar";
import { ScaleLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { AddHomePageData } from "../Store/AuthSlice";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [timer, setTimer] = useState(null);
  const observerRef = useRef(null);
  const postsPerPage = 16;
  const dispatch = useDispatch();
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);

    if (timer) {
      clearTimeout(timer);
    }
    const newTimer = setTimeout(() => {
      setCurrentPage(1);
      setPosts([]);
      fetchPosts(1, e.target.value);
    }, 1000);
    setTimer(newTimer);
  };

  const fetchPosts = async (page = 1, search = "") => {
    const authToken = localStorage.getItem("authToken");
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const { posts: newPosts, postCount } = await getAllPostsInHomePage(authToken, search, page, postsPerPage);
      const updatedPosts = page === 1 ? newPosts : [...posts, ...newPosts];
      setPosts(updatedPosts);
      dispatch(AddHomePageData({ data: updatedPosts, isDataLoaded: true, currentPage }));
      setTotalPosts(postCount);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  const { homePageData } = useSelector((state) => state.Auth);
  useEffect(() => {
    if (homePageData.isDataLoaded && homePageData.data.length > 0 && (homePageData.currentPage > currentPage)) {
      setPosts(homePageData.data);
      setLoading(false);
    } else {
      fetchPosts(1, searchQuery);
    }
  }, []);
  
  const loadMorePosts = useCallback(() => {
    if (!loadingMore && posts.length < totalPosts) {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchPosts(nextPage, searchQuery);
        return nextPage;
      });
    }
  }, [loadingMore, posts.length, totalPosts, searchQuery]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );

    const observerTarget = document.getElementById("loadMoreTrigger");
    if (observerTarget) observerRef.current.observe(observerTarget);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMorePosts]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setPosts([]);
    fetchPosts(1);
  };

  if (loading) {
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

  return (
    <div className="w-full bg-black py-8">
      <div className="w-full flex justify-center items-center mb-4">
        <SearchBar
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
        />
      </div>

      <div className="text-center mb-6 px-4">
        <h2 className="text-3xl font-bold text-white">"Discover the Unseen, Explore the Unknown."</h2>
        <p className="text-base text-gray-400 mt-2">
          From the latest movie reviews to insightful blogs, uncover content you’ve never seen before.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 px-2">
        {posts?.map((post) => (
          <PostCard key={post._id} {...post} />
        ))}

        {loadingMore &&
          Array.from({ length: postsPerPage }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="w-[11rem] h-[17rem] bg-gray-800 rounded-md animate-pulse"
            />
          ))}
      </div>

      {posts.length < totalPosts && <div id="loadMoreTrigger" className="w-full h-10 mt-4"></div>}
    </div>

  );
}

export default HomePage;
