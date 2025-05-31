/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

function PostCard({
    _id,
    title,
    image,
    isLink,
    likes = 0,
    dislikes = 0,
    authorName,
    authorProfile,
    createdAt,
    content = "",
    showUser = true,
    showLikeDislike = true,
}) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const calculateReadingTime = (text) => {
        if (!text || typeof text !== 'string') return 1;

        // Remove HTML tags if present
        const cleanText = text.replace(/<[^>]*>/g, '');

        // Count words (split by whitespace and filter out empty strings)
        const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;

        // Average reading speed is 200-250 words per minute
        // Using 225 as middle ground
        const wordsPerMinute = 225;
        const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);

        // Minimum 1 minute for very short content
        return Math.max(1, readingTimeMinutes);
    };

    const readingTime = calculateReadingTime(content);

    const CardContent = () => (
        <div className="w-[11rem] h-[17rem] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-blue-500/10 group relative transition-all duration-300 hover:-translate-y-1">
            {/* Blog post image */}
            <div className={`relative overflow-hidden ${image ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800'} ${showUser ? 'h-2/3' : 'h-[13rem]'}`}>
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Like/Dislike stats - appears on hover */}
                {showLikeDislike && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-2 shadow-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 fill-green-500" viewBox="0 0 24 24">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{likes}</span>
                        </div>

                        <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>

                        <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 fill-red-500" viewBox="0 0 24 24">
                                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{dislikes}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reading time estimate */}
                {showLikeDislike && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span>{readingTime} min read</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Blog post content */}
            <div className="h-1/3 p-3 flex flex-col justify-between bg-white dark:bg-gray-900">
                {/* Title */}
                <div className="flex-1">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {title}
                    </h2>
                </div>

                {/* Author and meta info */}
                {showUser && (
                    <div className="mt-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img
                                    src={authorProfile}
                                    alt={authorName}
                                    className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover transition-all duration-300 group-hover:border-blue-400"
                                />
                                <div className="flex flex-col">
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[4rem]">
                                        {authorName}
                                    </p>
                                    {createdAt && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(createdAt)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bookmark icon - top right corner of content area */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button className="text-gray-400 hover:text-yellow-500 transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
            </div>

            {/* Subtle hover effect line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </div>
    );

    if (!isLink) {
        return (
            <div className="flex w-[11rem] h-[17rem] transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <CardContent />
            </div>
        );
    } else {
        return (
            <Link
                to={`/post/${_id}`}
                className="flex w-[11rem] h-[17rem] transition-all duration-300 hover:scale-[1.02]"
            >
                <CardContent />
            </Link>
        );
    }
}

export default PostCard;