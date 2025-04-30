/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState, useRef, useCallback } from "react";
import SearchBar from "../utility/SearchBar";
import { ScaleLoader } from "react-spinners";
import { getAllArtists } from "../AppWrite/Apibase";
import UserCard from "../Components/UserCard";
import AuthorCard from "../Components/AuthorCard";

function Authors() {
  const [artists, setArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArtists, setTotalArtists] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [timer, setTimer] = useState(null);
  const observerRef = useRef(null);
  const artistsPerPage = 16;

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      setCurrentPage(1);
      setArtists([]);
      fetchArtists(1, e.target.value);
    }, 1000);
    setTimer(newTimer);
  };

  const fetchArtists = async (page = 1, search = "") => {
    const authToken = localStorage.getItem("authToken");
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const { artists: newArtists, artistsCount } = await getAllArtists(authToken, search, page, artistsPerPage);
      setArtists((prev) => (page === 1 ? newArtists : [...prev, ...newArtists]));
      setTotalArtists(artistsCount);
    } catch (error) {
      console.log(error);
      console.error("Error fetching artists:", error);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchArtists(1, searchQuery);
  }, []);

  const loadMoreArtists = useCallback(() => {
    if (!loadingMore && artists.length < totalArtists) {
      setCurrentPage((prev) => {
        const nextPage = prev + 1;
        fetchArtists(nextPage, searchQuery);
        return nextPage;
      });
    }
  }, [loadingMore, artists.length, totalArtists, searchQuery]);

  useEffect(() => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreArtists();
        }
      },
      { threshold: 0.5 }
    );

    const observerTarget = document.getElementById("loadMoreTrigger");
    if (observerTarget) observerRef.current.observe(observerTarget);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMoreArtists]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setArtists([]);
    fetchArtists(1);
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col justify-center items-center bg-gradient-to-b from-black via-[#14061F] to-black py-12">
        <div className="p-4 w-full flex flex-col justify-center items-center">
          <h1 className="text-4xl font-semibold text-white">"Spotlighting the Stars, Just a Moment..."</h1>
          <p className="text-lg mt-2 text-gray-300">Fetching the best artists just for you!</p>
        </div>
        <div className="mt-[5rem]">
          <ScaleLoader color="#ffffff" height={50} />
        </div>
      </div>
    );
  }

  // No artists found message
  const noArtistsFound = artists.length === 0 && !loading && searchQuery !== "";

  return (
    <div className="w-full bg-gradient-to-b from-black via-[#14061F] to-black py-12">
      <div className="w-full flex justify-center items-center mb-8">
        <SearchBar
          label="Search Artists"
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
        />
      </div>
      <div className="text-center mb-8">
        <h2 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
          "Explore the Faces Behind the Frames"
        </h2>
        <p className="text-xl text-gray-300 mt-4">
          Meet the creators, stars, and icons behind your favorite movies.
        </p>
      </div>

      {noArtistsFound ? (
        <div className="flex justify-center items-center w-full py-8">
          <p className="text-xl text-gray-400">No artists found for the search query. Please try another one!</p>
        </div>
      ) : (
        <div className="sm:ml-5 w-full h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-all duration-500">
          {artists?.map((artist) => (
            <div
              key={artist._id}
              className="p-2 transition-transform transform hover:scale-105 animate__animated animate__fadeIn animate__delay-1s"
            >
              <AuthorCard userData={artist} viewProfileBtn={true}/>
            </div>
          ))}

          {loadingMore &&
            Array.from({ length: artistsPerPage }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="p-2 bg-black rounded-lg h-[250px] animate-pulse"
              />
            ))}
        </div>
      )}

      {artists.length < totalArtists && <div id="loadMoreTrigger" className="w-full h-10 mt-6"></div>}
    </div>
  );
}

export default Authors;
