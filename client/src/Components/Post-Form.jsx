/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
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

export default function PostForm({ post }) {
  const { register, handleSubmit, setValue, watch } = useForm({
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
      const prompt = `Write a ${sentiment} review for the movie "${
        movie?.Title || post?.title
      }", assuming a rating of ${rating} out of 5 stars, without adding stars into content and make content simpler in min 150 words, make content beautiful with little emojis.`;
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
      const prompt = `${
        movie?.Title || post?.title
      }, ${contentValue}, Make this content more read feiendly and social media worthy, without adding stars into content and make content simpler in min 150 words, make content beautiful with little emojis.`;
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
  };

  const submit = async (data) => {
    setLoading(true);
    if (data?.content.trim() == "") {
      toast.error("Content cannot be empty. Please write something.", {
        autoClose: 2000,
        style: {
          backgroundColor: "#2e1065",
          color: "#ffffff",
        },
        hideProgressBar: true,
      });
      setLoading(false);
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
          `${
            import.meta.env.VITE_REACT_APP_API_BASE_URL
          }/api/v1/posts/update-post/${post._id}`,
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
            &quot;Patience, the Best Stories Are Worth the Wait.&quot;
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
      className="w-full flex flex-col items-center bg-gradient-to-b from-black via-[#14061F] to-black text-white py-10 px-6 rounded-2xl shadow-2xl"
    >
      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white text-black rounded-2xl p-8 w-[90%] sm:w-[32rem] shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              🧠 Customize AI Content
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Select Rating</h3>
              <Rating
                name="ai-rating"
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                size="large"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Choose Sentiment
              </h3>
              <ToggleButtonGroup
                value={sentiment}
                exclusive
                onChange={(event, newValue) => setSentiment(newValue)}
                aria-label="Sentiment Selection"
                className="grid grid-cols-3 gap-4 w-full sm:w-[24rem] mx-auto"
              >
                {[
                  {
                    val: "positive",
                    label: "Positive",
                    bg: "bg-green-100",
                    active: "bg-green-400 text-white",
                    icon: "😊",
                  },
                  {
                    val: "neutral",
                    label: "Neutral",
                    bg: "bg-gray-100",
                    active: "bg-gray-400 text-white",
                    icon: "😐",
                  },
                  {
                    val: "negative",
                    label: "Negative",
                    bg: "bg-red-100",
                    active: "bg-red-500 text-white",
                    icon: "😞",
                  },
                ].map(({ val, label, bg, active, icon }) => (
                  <ToggleButton
                    key={val}
                    value={val}
                    className={`flex flex-col items-center justify-center gap-1 p-4 rounded-xl font-medium shadow-md transition-all duration-200
                    ${sentiment === val ? active : `${bg} text-black hover:scale-105`}`}
                  >
                    <span className="text-xl">{icon}</span>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg shadow hover:bg-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={getAiResponse}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:scale-[1.05] transition"
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl sm:text-3xl font-bold text-white tracking-tight">
          Share Your Views on{" "}
          <span className="text-teal-400">{movie?.Title || post?.title}</span>
        </h2>
        <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">
          ✍️ Write your positive or negative points here — AI will turn them
          into an awesome review!
        </p>
      </div>

      {/* Content Textarea */}
      <div className="w-full flex flex-col items-center gap-6 mt-2">
        <textarea
          className="w-full sm:w-3/4 h-[20rem] p-4 rounded-xl text-gray-800 bg-white placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-transform transform hover:scale-[1.01] resize-none shadow-md"
          placeholder="Type your thoughts here..."
          {...register("content")}
          disabled={isAIContent}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap justify-center">
          {contentValue ? (
            <Button
              type="button"
              onClick={improveContentWithAI}
              className="px-5 py-2 bg-teal-500 text-white rounded-xl shadow-md hover:bg-teal-600 hover:scale-105 transition"
            >
              ✨ Improve with AI
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="px-5 py-2 bg-teal-500 text-white rounded-xl shadow-md hover:bg-teal-600 hover:scale-105 transition"
            >
              🤖 Use AI Content
            </Button>
          )}

          <Button
            type="button"
            onClick={() => setAIContent(false)}
            className="px-5 py-2 bg-white text-black rounded-xl shadow-md hover:bg-gray-200 hover:scale-105 transition"
          >
            📝 Edit Manually
          </Button>
        </div>
      </div>

      {/* Status + Submit */}
      <div className="w-full sm:w-[45rem] flex flex-col sm:flex-row justify-center items-center mt-10 gap-6">
        <Select
          options={["Public", "Private"]}
          label="Status"
          className="w-[15rem] sm:w-[20rem] bg-white text-black border border-gray-300 rounded-xl shadow-md py-3 px-4 hover:scale-105 transition"
          {...register("status", { required: true })}
        />
        <Button
          type="submit"
          className="w-full sm:w-[20rem] mt-5 py-4 bg-teal-600 text-white rounded-xl font-semibold shadow-xl hover:bg-teal-700 hover:scale-105 transition"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
