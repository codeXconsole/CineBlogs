/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "react-modal"; // Install via `npm install react-modal`
import { logout } from "../../AppWrite/Apibase";

Modal.setAppElement("#root"); // Ensure accessibility compliance

function LogoutBtn() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    setModalOpen(false); // Close modal on confirm
    try {
      await logout(dispatch, navigate);
      toast.success("Logout Successfully...", {
        autoClose: 1000,
        style: {
          backgroundColor: "#2e1065",
          color: "#ffffff",
        },
        hideProgressBar: true,
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out. Please try again.", {
        autoClose: 2000,
        style: {
          backgroundColor: "#ff6347",
          color: "#ffffff",
        },
        hideProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className=""
        onClick={() => setModalOpen(true)}
        disabled={loading}
      >
        {loading ? "Processing..." : "Logout"}
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="max-w-md mx-auto my-20 p-6 bg-white rounded-xl shadow-lg relative"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Logout</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to log out? You will need to log in again to access your account.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#B91C1C] transition-all duration-200"C
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default LogoutBtn;
