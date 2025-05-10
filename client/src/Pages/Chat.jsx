import { useEffect, useState } from "react";
import io from "socket.io-client";
import { getMessagesAPI } from "../AppWrite/Apibase";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const socket = io(apiBaseUrl);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const userData = useSelector((state) => state.Auth.userData);
  const currentUserId = userData?._id;
  const selectedUserId = useParams().userId;
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    getMessagesAPI(selectedUserId, authToken)
      .then((res) => setMessages(res.data))
      .catch(console.error);
  }, [selectedUserId, authToken]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const messageData = {
      senderId: currentUserId,
      receiverId: selectedUserId,
      content: input.trim(),
    };
    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setInput("");
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
        {messages.map((msg, i) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <div
              key={i}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[70%] px-4 py-3 rounded-lg break-words
                  ${isOwn 
                    ? "bg-blue-600 text-white rounded-bl-none"
                    : "bg-gray-800 text-white rounded-br-none"}
                  shadow-md transition-transform duration-200 ease-in-out
                `}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="
            flex-1 bg-gray-800 text-white placeholder-gray-400
            border border-gray-600 focus:border-blue-500 focus:outline-none
            px-4 py-2 rounded-lg transition-all duration-200 ease-in-out"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="
            bg-blue-600 hover:bg-blue-700 text-white font-medium
            py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
