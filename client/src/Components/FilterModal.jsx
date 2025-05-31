/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export const FilterModal = ({ isOpen, onClose, currentFilter, onApplyFilter }) => {
    const [tempRatingFilter, setTempRatingFilter] = useState(currentFilter);

    const ratingOptions = [
        { value: "all", label: "All Ratings", min: 1, max: 10, description: "Show all posts", icon: "⭐" },
        { value: "poor", label: "Poor", min: 1, max: 3, description: "1-3 stars", icon: "💫" },
        { value: "average", label: "Average", min: 4, max: 6, description: "4-6 stars", icon: "🌟" },
        { value: "good", label: "Good", min: 7, max: 8, description: "7-8 stars", icon: "✨" },
        { value: "excellent", label: "Excellent", min: 9, max: 10, description: "9-10 stars", icon: "🌠" }
    ];

    useEffect(() => {
        setTempRatingFilter(currentFilter);
    }, [currentFilter, isOpen]);

    const handleApply = () => {
        onApplyFilter(tempRatingFilter);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-black rounded-2xl w-full max-w-sm border border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Filters</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Filter Options */}
                <div className="p-4">
                    <div className="space-y-2">
                        {ratingOptions.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                    tempRatingFilter === option.value
                                        ? 'bg-gray-800 border border-gray-600'
                                        : 'hover:bg-gray-900 border border-transparent'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="rating"
                                    value={option.value}
                                    checked={tempRatingFilter === option.value}
                                    onChange={(e) => setTempRatingFilter(e.target.value)}
                                    className="sr-only"
                                />
                                
                                {/* Icon */}
                                <span className="text-lg mr-3">{option.icon}</span>
                                
                                {/* Text Content */}
                                <div className="flex-1">
                                    <div className="font-medium text-white text-sm">{option.label}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {option.description}
                                    </div>
                                </div>
                                
                                {/* Selection Indicator */}
                                {tempRatingFilter === option.value && (
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 p-4 border-t border-gray-700">
                    <button
                        onClick={() => setTempRatingFilter("all")}
                        className="flex-1 py-2.5 px-4 text-sm text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 font-medium border border-gray-600"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-2.5 px-4 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 font-medium"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function FilterModalDemo() {
    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const [currentFilter, setCurrentFilter] = useState("all");

    const handleApplyFilter = (filter) => {
        setCurrentFilter(filter);
        console.log("Applied filter:", filter);
    };

    return (
        <div className="min-h-screen bg-black p-8 flex items-center justify-center">
            <div className="text-center">
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium border border-gray-600"
                >
                    Open Filter Modal
                </button>
                <p className="text-gray-400 mt-4">Current filter: {currentFilter}</p>
            </div>

            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                currentFilter={currentFilter}
                onApplyFilter={handleApplyFilter}
            />
        </div>
    );
}