import React, { useState } from "react";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { deletePost } from "../AppWrite/Apibase";

Modal.setAppElement("#root");

const DeletePost = ({ post }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const deletePostFunc = async () => {
    setLoading(true);
    setModalOpen(false); // Close the modal when proceeding
    await deletePost(post._id)
      .then(() => {
        toast.success("Post deleted successfully", {
          autoClose: 1000,
          style: {
            backgroundColor: "#2e1065",
            color: "#ffffff",
          },
          hideProgressBar: true,
        });
        navigate(-1);
      })
      .catch((error) => {
        toast.error(error.message || "An error occurred while deleting the post.", {
          autoClose: 1000,
          style: {
            backgroundColor: "#2e1065",
            color: "#ffffff",
          },
          hideProgressBar: true,
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all duration-300"
        onClick={() => setModalOpen(true)}
        disabled={loading}
      >
        {loading ? "Processing..." : "Delete"}
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="max-w-md mx-auto my-20 p-6 bg-white rounded-xl shadow-lg relative"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Are you sure?</h2>
        <p className="text-gray-600 mb-6">
          Do you really want to delete this post? This process cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            onClick={deletePostFunc}
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DeletePost;
