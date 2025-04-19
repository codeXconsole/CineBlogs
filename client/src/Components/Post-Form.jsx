import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Select } from "./index";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { ScaleLoader } from "react-spinners";
import AILoader from "../Components/AILoader.jsx";
import { Rating, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MovieCreation } from "@mui/icons-material";

export default function PostForm({ post }) {
    const { register, handleSubmit, setValue, watch  } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.slug || "",
            content: post?.content || "",
            status: post?.status || "Public",
        },
    });
    const contentValue = watch("content");
    const [isLoading, setLoading] = useState(false);
    const [isAIContent, setAIContent] = useState(false);
    const [isAILoading, setAILoading] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [rating, setRating] = useState(3);
    const [sentiment, setSentiment] = useState("positive");
    const navigate = useNavigate();
    const movie = useSelector((state) => state.Auth.movie);
    const userData = useSelector((state) => state.Auth.userData);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        if (!movie) navigate("/add-post");
    }, [movie, navigate]);

    useEffect(() => {
        if (post) {
            setValue("title", post?.title);
            setValue("content", post?.content);
            setValue("status", post?.status ? "Public" : "Private");
        }
    }, [post, setValue]);

    const getAiResponse = async () => {
        setAILoading(true);
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_AI_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Write a ${sentiment} review for the movie "${movie?.Title || post?.title}", assuming a rating of ${rating} out of 5 stars, without adding stars into content and make content simpler in min 150 words, make content beautiful with little emojis.`;
            const result = await model.generateContent(prompt);

            if (result) {
                setValue("content", result.response.text());
                setAIContent(true);
            } else {
                toast.error("Failed to get AI response...", {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                });
            }
        } catch (error) {
            console.error("Error generating AI response:", error);
            toast.error("Error occurred while getting AI response...", {
                autoClose: 1000,
                style: {
                    backgroundColor: "#2e1065",
                    color: "#ffffff",
                },
                hideProgressBar: true,
            });
        } finally {
            setAILoading(false);
            setShowAIModal(false);
        }
    };

    const improveContentWithAI = async () => {
        setAILoading(true);
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_AI_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `${movie?.Title || post?.title}, ${contentValue}, Make this content more read feiendly and social media worthy, without adding stars into content and make content simpler in min 150 words, make content beautiful with little emojis.`;
            const result = await model.generateContent(prompt);

            if (result) {
                setValue("content", result.response.text());
                setAIContent(true);
            } else {
                toast.error("Failed to get AI response...", {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                });
            }
        } catch (error) {
            console.error("Error generating AI response:", error);
            toast.error("Error occurred while getting AI response...", {
                autoClose: 1000,
                style: {
                    backgroundColor: "#2e1065",
                    color: "#ffffff",
                },
                hideProgressBar: true,
            });
        } finally {
            setAILoading(false);
        }
    }

    const submit = async (data) => {
       setLoading(true)
        if (data?.content.trim() == '') {
            toast.error("Content cannot be empty. Please write something.", {
                autoClose: 2000,
                style: {
                    backgroundColor: "#2e1065",
                    color: "#ffffff",
                },
                hideProgressBar: true,
            });
            setLoading(false)
            return;
        }
        try {
            const postData = post
                ? {
                    title: data?.title,
                    content: data?.content,
                    status: data?.status === "Public",
                }
                : {
                    userId: userData?._id,
                    title: movie?.Title,
                    content: data?.content,
                    status: data?.status === "Public",
                    image: movie?.Poster,
                };

            let response;
            if (post) {
                response = await axios.put(
                    `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/v1/posts/update-post/${post._id}`,
                    postData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                toast.success("Post updated successfully...", {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                });
            } else {
                response = await axios.post(
                    `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/v1/posts/create`,
                    postData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                toast.success("Post created successfully...", {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                });
            }
            setLoading(false);
            navigate(`/post/${response.data.data._id}`);
        } catch (error) {
            setLoading(false);
            toast.error(
                error.response?.data?.message || "An error occurred. Please try again.",
                {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                }
            );
        }
    };

    if (isAILoading) {
        return <AILoader />;
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

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="w-ful flex flex-col justify-center items-center bg-gradient-to-b from-black via-[#14061F] to-black text-white py-5 px-6 rounded-lg shadow-lg"
        >
            {/* AI Modal */}
            {showAIModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white text-black rounded-lg p-6 w-[90%] sm:w-[30rem]">
                        <h2 className="text-xl font-bold mb-4">Customize AI Content</h2>
                        <div className="mb-6">
                            <h3 className="text-lg">Select Rating</h3>
                            <Rating
                                name="ai-rating"
                                value={rating}
                                onChange={(event, newValue) => setRating(newValue)}
                                size="large"
                            />
                        </div>
                        <div className="mb-6">
                            <h3 className="text-lg">Choose Sentiment</h3>
                            <ToggleButtonGroup
                                value={sentiment}
                                exclusive
                                onChange={(event, newValue) => setSentiment(newValue)}
                                aria-label="Sentiment Selection" // Accessibility
                                className="flex justify-center gap-4 mt-4"
                            >
                                <ToggleButton
                                    value="positive"
                                    className="bg-teal-400 text-black  transition-colors px-4 py-2 rounded-lg shadow-md font-semibold"
                                    aria-label="Positive Sentiment"
                                >
                                    Positive
                                </ToggleButton>
                                <ToggleButton
                                    value="neutral"
                                    className="bg-gray-300 text-black  transition-colors px-4 py-2 rounded-lg shadow-md font-semibold"
                                    aria-label="Neutral Sentiment"
                                >
                                    Neutral
                                </ToggleButton>
                                <ToggleButton
                                    value="negative"
                                    className="bg-red-400 text-white  transition-colors px-4 py-2 rounded-lg shadow-md font-semibold"
                                    aria-label="Negative Sentiment"
                                >
                                    Negative
                                </ToggleButton>
                            </ToggleButtonGroup>

                        </div>
                        <div className="flex justify-between">
                            <Button
                                onClick={() => setShowAIModal(false)}
                                className="px-4 py-2 bg-gray-400 text-black rounded-lg shadow-md"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={getAiResponse}
                                className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:scale-[1.04] duration-150"
                            >
                                Generate AI Content
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Content */}
            <div className="text-center mb-8">
                <h2 className="text-4xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    Share Your Views on <span className="text-teal-400">{movie?.Title || post?.title}</span>
                </h2>
                <p className="text-xl text-gray-300 mt-4">
                    Write down your positive or negative points here — our AI will help turn them into a complete review.
                </p>
            </div>

            {/* Content Textarea */}
            <div className="w-full flex flex-col items-center gap-8 mt-6">
                    <textarea
                        className="w-full sm:w-3/4 h-[20rem] p-4 rounded-lg text-gray-800 bg-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-transform transform hover:scale-105"
                        placeholder="Write your content here..."
                        {...register("content")}
                        disabled={isAIContent}
                    />
                <div className="flex gap-4">
                   {contentValue ? <Button
                        type="button"
                        onClick={improveContentWithAI}
                        className="px-4 py-2 bg-teal-400 text-black rounded-lg shadow-md hover:bg-teal-600 hover:scale-105 transition">
                        Improve content with AI
                    </Button> :
                    <Button
                        type="button"
                        onClick={() => setShowAIModal(true)}
                        className="px-4 py-2 bg-teal-400 text-black rounded-lg shadow-md hover:bg-teal-600 hover:scale-105 transition">
                        Use AI Content
                    </Button> }
                    <Button
                        type="button"
                        onClick={() => setAIContent(false)}
                        className="px-4 py-2 bg-teal-400 text-black rounded-lg shadow-md hover:bg-teal-600 hover:scale-105 transition"
                    >
                        Edit Manually
                    </Button>
                </div>
            </div>

            {/* Submit Section */}
            <div className="w-full sm:w-[45rem] flex flex-col sm:flex-row justify-center items-center mt-8">
                <Select
                    options={["Public", "Private"]}
                    label="Status"
                    className="w-[15rem] sm:mr-5 flex justify-center items-center sm:w-[20rem] bg-gray-300 text-black rounded-lg shadow-md py-3 px-4 hover:scale-105"
                    {...register("status", { required: true })}
                />
                <Button
                    type="submit"
                    bgColor="bg-teal-500"
                    className="w-full sm:w-[20rem] mt-5 py-4 sm:mt-6 rounded-lg text-black hover:bg-teal-600 shadow-lg transition-transform transform hover:scale-105"
                >
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
