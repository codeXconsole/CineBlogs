// ConversationsPage.jsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getAllConversations, getMessagesAPI } from "../AppWrite/Apibase";
import { useSelector } from "react-redux";
import io from "socket.io-client";
const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const socket = io(apiBaseUrl);

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const userData = useSelector((state) => state.Auth.userData);
  const currentUserId = userData?._id;
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await getAllConversations(authToken);
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [authToken]);

  const loadMessages = async (user) => {
    setActiveChatUser(user);
    try {
      const res = await getMessagesAPI(user._id, authToken);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      if (
        activeChatUser &&
        (message.senderId === activeChatUser._id || message.receiverId === activeChatUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [activeChatUser]);


  const sendMessage = () => {
    if (!input.trim() || !activeChatUser) return;
    const messageData = {
      senderId: currentUserId,
      receiverId: activeChatUser._id,
      content: input.trim(),
    };
    socket.emit("sendMessage", messageData);
    setInput("");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[75vh] rounded-xl overflow-hidden shadow-lg bg-[#121212]">
      <div className="w-1/3 bg-[#1e1e1e] p-4 overflow-y-auto no-scrollbar border-r border-gray-700">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search messages..."
          className="w-full p-2 mb-4 rounded-md bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring focus:ring-purple-600"
        />
        <div className="space-y-3">
          {filteredConversations.map((conv, index) => {
            const otherUser = conv.userData;
            const { content, timestamp } = conv.lastMessage;
            const time = new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={index}
                onClick={() => loadMessages(otherUser)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#2f2f2f] ${activeChatUser?._id === otherUser._id ? "bg-[#2f2f2f]" : ""
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={otherUser.profileImage || "https://via.placeholder.com/40"}
                    alt="User"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                  />
                  <div>
                    <h3 className="text-white font-medium">{otherUser.username}</h3>
                    <p className="text-sm text-gray-400 truncate max-w-[10rem]">{content}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <p className="text-center text-gray-500">No conversations found.</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col p-4 bg-[#181818]">
        {activeChatUser ? (
          <>
            <div className="flex items-center mb-4 pb-2 border-b border-gray-700">
              <img
                src={activeChatUser.profileImage || "https://via.placeholder.com/40"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-600 mr-3"
              />
              <h2 className="text-white font-semibold text-lg">{activeChatUser.username}</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, i) => {
                const isOwn = msg.senderId === currentUserId;
                return (
                  <div key={i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg text-white break-words text-sm shadow-md ${isOwn
                          ? "bg-blue-600 rounded-bl-none"
                          : "bg-gray-800 rounded-br-none"
                        }`}
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
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring focus:ring-blue-600"
              />
              <button
                onClick={sendMessage}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;