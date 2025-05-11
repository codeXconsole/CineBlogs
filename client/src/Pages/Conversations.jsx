import { useState, useEffect, useRef } from "react";
import { getAllConversations, getMessagesAPI, getUserData } from "../AppWrite/Apibase";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const socket = io(apiBaseUrl);

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConversationsList, setShowConversationsList] = useState(true);
  const { userId } = useParams();
  const userData = useSelector((state) => state.Auth.userData);
  const currentUserId = userData?._id;
  const authToken = localStorage.getItem("authToken");
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId || !currentUserId) return;

      setLoadingConversations(true);
      try {
        const response = await getAllConversations(authToken);
        const allConversations = response.data;
        setConversations(allConversations);
        setLoadingConversations(false);

        if (userId !== currentUserId) {
          const existing = allConversations.find((conv) => conv.userData._id === userId);
          if (existing) {
            loadMessages(existing.userData);
          } else {
            try {
              const res = await getUserData(userId, authToken);
              const user = res.data;
              if (user) {
                setConversations((prev) => [
                  ...prev,
                  {
                    userData: user,
                    lastMessage: { content: "", timestamp: new Date().toISOString() },
                  },
                ]);
                loadMessages(user);
              }
            } catch (err) {
              console.error("Failed to fetch user by ID:", err);
            }
          }
        }
        else {
          loadMessages(allConversations[0]?.userData);
        }
      } catch (error) {
        setLoadingConversations(false);
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [authToken, userId, currentUserId]);


  const loadMessages = async (user) => {
    setActiveChatUser(user);
    setLoadingMessages(true);
    if (window.innerWidth < 768) {
      setShowConversationsList(false);
    }
    try {
      const res = await getMessagesAPI(user._id, authToken);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
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
    <div className="flex flex-col md:flex-row h-[70vh] md:h-[75vh] md:mx-10 rounded-xl overflow-hidden shadow-lg bg-[#121212]">
      {/* Conversations List */}
      {showConversationsList && (
        <div className="h-full w-full md:w-1/3 bg-[#1e1e1e] p-4 overflow-y-auto no-scrollbar border-b md:border-b-0 md:border-r border-gray-700">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search messages..."
            className="w-full p-2 mb-4 rounded-md bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring focus:ring-purple-600"
          />
          {loadingConversations ? (
            <div className="text-center text-gray-400 py-10 flex justify-center">
              <div className="w-6 h-6 border-2 border-t-white border-gray-500 rounded-full animate-spin" />
            </div>
          ) : (
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
              {filteredConversations.length === 0 && !loadingConversations && (
                <p className="text-center text-gray-500">No conversations found.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chat Area */}
      <div className="w-full md:w-2/3 flex flex-col p-4 bg-[#181818] flex-1">
        {activeChatUser ? (
          <>
            <div className="flex items-center mb-4 pb-2 border-b border-gray-700">
              {/* Back button for mobile */}
              <button
                className="md:hidden mr-3 text-white text-xl"
                onClick={() => {
                  setShowConversationsList(true);
                  setActiveChatUser(null);
                  setMessages([]);
                }}
              >
                ←
              </button>
              <img
                src={activeChatUser.profileImage || "https://via.placeholder.com/40"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-600 mr-3"
              />
              <h2 className="text-white font-semibold text-lg">{activeChatUser.username}</h2>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2 max-h-[50vh] md:max-h-none">

              {loadingMessages ? (
                <div className="flex justify-center items-center h-full text-gray-400">
                  <div className="w-6 h-6 border-2 border-t-white border-gray-500 rounded-full animate-spin" />
                </div>
              ) : (
                messages.map((msg, i) => {
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
                })
              )}
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
          <div className="md:flex hidden items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;
