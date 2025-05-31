import { useState } from 'react';
import { Search, Film, Sparkles } from 'lucide-react';
import { PostCard } from '../Components';
import { AddMovie } from '../Store/AuthSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


const SearchMovie = () => {
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const getMovies = async (title) => {
        if (!title || !title.trim()) {
            setMovies([]);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch(`https://www.omdbapi.com/?apikey=14c12858&s=${title}`);
            const data = await response.json();
            setMovies(data.Search || []);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching movies:", error);
            setMovies([]);
            setIsLoading(false);
        }
    };

    const handleClick = (movie) => {
        dispatch(AddMovie(movie));
        navigate('/add-content');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-[#14061F] to-black relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                Cinematic Discovery
                            </h1>
                            <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                        </div>
                        <p className="text-gray-300 text-[1rem]">Find your next favorite movie with magical precision</p>
                    </div>

                    {/* Search Section */}
                    <div className="mb-8">
                        <div className="relative max-w-lg mx-auto">
                            <div className="relative bg-gray-800/80 backdrop-blur-lg rounded-lg border border-gray-700/50 p-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            getMovies(e.target.value);
                                        }}
                                        placeholder="Search movies to review..."
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                                    />
                                    {isLoading && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-3">
                        {movies.length === 0 && !isLoading ? (
                            <div className="text-center py-10">
                                <div className="relative inline-block mb-6">
                                    <Film className="w-24 h-24 text-gray-600 mx-auto" />
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <Search className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-1xl font-semibold text-gray-100 mb-2">No Movies Found</h3>
                                <p className="text-gray-500">Try searching for a movie title to start writing your review</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-4">
                                {movies.map((movie, index) => (
                                    <div
                                        key={movie.imdbID}
                                        onClick={() => handleClick(movie)}
                                        className="group relative"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <PostCard showLikeDislike={false} title={movie.Title} image={movie.Poster} isLink={false} showUser={false} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) rotate(1deg); }
                    66% { transform: translateY(5px) rotate(-1deg); }
                }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};

export default SearchMovie;