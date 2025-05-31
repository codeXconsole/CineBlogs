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
import { FilterModal } from "../Components/FilterModal";

function HomePage() {
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [timer, setTimer] = useState(null);
    const [ratingFilter, setRatingFilter] = useState("all");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const observerRef = useRef(null);
    const postsPerPage = 16;
    const dispatch = useDispatch();

    const ratingOptions = [
        { value: "all", label: "All Ratings", min: 1, max: 10 },
        { value: "poor", label: "Poor (1-3)", min: 1, max: 3 },
        { value: "average", label: "Average (4-6)", min: 4, max: 6 },
        { value: "good", label: "Good (7-8)", min: 7, max: 8 },
        { value: "excellent", label: "Excellent (9-10)", min: 9, max: 10 }
    ];

    const getCurrentRatingRange = () => {
        const option = ratingOptions.find(opt => opt.value === ratingFilter);
        return { min: option.min, max: option.max };
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (ratingFilter !== "all") count++;
        return count;
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);

        if (timer) {
            clearTimeout(timer);
        }
        const newTimer = setTimeout(() => {
            setCurrentPage(1);
            setPosts([]);
            const { min, max } = getCurrentRatingRange();
            fetchPosts(1, e.target.value, min, max);
        }, 1000);
        setTimer(newTimer);
    };

    const handleApplyFilter = (filterValue) => {
        setRatingFilter(filterValue);
        const option = ratingOptions.find(opt => opt.value === filterValue);
        setCurrentPage(1);
        setPosts([]);
        fetchPosts(1, searchQuery, option.min, option.max);
    };

    const fetchPosts = async (page = 1, search = "", minRating = 1, maxRating = 10) => {
        const authToken = localStorage.getItem("authToken");
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const { posts: newPosts, postCount } = await getAllPostsInHomePage(
                authToken,
                search,
                page,
                minRating,
                maxRating
            );
            const updatedPosts = page === 1 ? newPosts : [...posts, ...newPosts];
            setPosts(updatedPosts);
            dispatch(AddHomePageData({
                data: updatedPosts,
                isDataLoaded: true,
                currentPage: page, // Fix: use the actual page parameter
                ratingFilter
            }));
            setTotalPosts(postCount);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }

        setLoading(false);
        setLoadingMore(false);
    };

    const { homePageData } = useSelector((state) => state.Auth);

    useEffect(() => {
        if (homePageData.isDataLoaded &&
            homePageData.data.length > 0 &&
            (homePageData.currentPage > currentPage) &&
            homePageData.ratingFilter === ratingFilter) {
            setPosts(homePageData.data);
            setLoading(false);
        } else {
            const { min, max } = getCurrentRatingRange();
            fetchPosts(1, searchQuery, min, max);
        }
    }, []);

    // Fixed loadMorePosts function with proper state management
    const loadMorePosts = useCallback(() => {
        if (loadingMore || loading) return; // Prevent multiple calls
        
        setCurrentPage((prevPage) => {
            const nextPage = prevPage + 1;
            if (posts.length >= totalPosts) return prevPage; // Don't increment if no more posts
            
            const { min, max } = getCurrentRatingRange();
            fetchPosts(nextPage, searchQuery, min, max);
            return nextPage;
        });
    }, [loadingMore, loading, posts.length, totalPosts, searchQuery, ratingFilter]);

    // Fixed intersection observer setup
    useEffect(() => {
        if (loading) return;
        
        // Cleanup previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create new observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore && posts.length < totalPosts) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1, rootMargin: '50px' } // Trigger a bit earlier
        );

        // Find and observe the trigger element
        const observerTarget = document.getElementById("loadMoreTrigger");
        if (observerTarget && observerRef.current) {
            observerRef.current.observe(observerTarget);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMorePosts, loading, posts.length, totalPosts, loadingMore]);

    const handleClearSearch = () => {
        setSearchQuery("");
        setCurrentPage(1);
        setPosts([]);
        const { min, max } = getCurrentRatingRange();
        fetchPosts(1, "", min, max);
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setRatingFilter("all");
        setCurrentPage(1);
        setPosts([]);
        fetchPosts(1, "", 1, 10);
    };

    if (loading) {
        return (
            <div className="h-full mt-20 bg-gradient-to-b from-black via-[#000000] to-black flex flex-col justify-center items-center">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Loading Amazing Content
                    </h1>
                    <p className="text-gray-400">
                        Curating the best stories for you...
                    </p>
                </div>
                <ScaleLoader color="#3B82F6" height={35} width={4} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-[#000000] to-black">
            <div className="bg-transparent border-b border-gray-800">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Centered Search Bar */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="w-full max-w-2xl mb-4">
                            <SearchBar
                                searchQuery={searchQuery}
                                handleSearchChange={handleSearchChange}
                                onClearSearch={handleClearSearch}
                            />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsFilterModalOpen(true)}
                                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm border border-gray-600 relative"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters
                                {getActiveFiltersCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </button>

                            {getActiveFiltersCount() > 0 && (
                                <button
                                    onClick={handleClearFilters}
                                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="text-center">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                            Discover Amazing Stories
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            From movie reviews to insightful blogs - explore content curated just for you
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full mx-auto px-4 py-8">
                <div className="flex flex-wrap justify-center gap-2">
                    {posts?.map((post) => (
                        <PostCard key={post._id} {...post} isLink={true} />
                    ))}

                    {loadingMore &&
                        Array.from({ length: postsPerPage }).map((_, index) => (
                            <div
                                key={`skeleton-${index}`}
                                className="w-[11rem] h-[17rem] bg-gray-800 rounded-lg animate-pulse border border-gray-700"
                            />
                        ))}
                </div>
                {posts.length < totalPosts && !loading && (
                    <div id="loadMoreTrigger" className="w-full h-20 flex items-center justify-center mt-8">
                        {loadingMore ? (
                            <ScaleLoader color="#3B82F6" height={20} width={3} />
                        ) : (
                            <div className="text-gray-400 text-sm">Scroll to load more...</div>
                        )}
                    </div>
                )}

                {posts.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                        <p className="text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
                        <button
                            onClick={handleClearFilters}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                currentFilter={ratingFilter}
                onApplyFilter={handleApplyFilter}
            />
        </div>
    );
}

export default HomePage;