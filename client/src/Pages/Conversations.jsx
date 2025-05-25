import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllConversations, getMessagesAPI, getUserData } from "../AppWrite/Apibase";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { Link, useParams } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import EmojiSendAnimation from "../Components/EmojiSendAnimation";

const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const socket = io(apiBaseUrl);

const Conversations = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isTyping, setIsTyping] = useState(false);
    let typingTimeout = useRef(null);

    const isSingleEmoji = (text) => {
        const regexEmoji = /^\p{Extended_Pictographic}$/u;
        return regexEmoji.test(text);
    };

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const [emojiToAnimate, setEmojiToAnimate] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showConversationsList, setShowConversationsList] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const { userId } = useParams();
    const userData = useSelector((state) => state.Auth.userData);
    const currentUserId = userData?._id;
    const authToken = localStorage.getItem("authToken");

    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        socket.on("typing", ({ senderId, receiverId }) => {
            if (receiverId === currentUserId && senderId === activeChatUser?._id) {
                setIsTyping(true);
            }
        });

        socket.on("stopTyping", ({ senderId, receiverId }) => {
            if (receiverId === currentUserId && senderId === activeChatUser?._id) {
                setIsTyping(false);
            }
        });

        return () => {
            socket.off("typing");
            socket.off("stopTyping");
        };
    }, [currentUserId, activeChatUser]);


    const handleTyping = (e) => {
        setInput(e.target.value);

        if (activeChatUser) {
            socket.emit("typing", {
                senderId: currentUserId,
                receiverId: activeChatUser._id
            });

            clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => {
                socket.emit("stopTyping", {
                    senderId: currentUserId,
                    receiverId: activeChatUser._id
                });
            }, 1000);
        }
    };


    useEffect(() => {
        const fetchConversations = async () => {
            if (!userId || !currentUserId) return;
            setLoadingConversations(true);
            try {
                const response = await getAllConversations(authToken);
                const allConversations = response.data;
                setConversations(allConversations);
                if (userId !== currentUserId) {
                    const existing = allConversations.find((conv) => conv.userData._id === userId);
                    if (existing) {
                        setActiveChatUser(existing.userData);
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
                                setActiveChatUser(user);
                                loadMessages(user);
                            }
                        } catch (err) {
                            console.error("Failed to fetch user by ID:", err);
                        }
                    }
                } else {
                    const first = allConversations[0]?.userData;
                    if (first) {
                        setActiveChatUser(first);
                        loadMessages(first);
                    }
                }
                setLoadingConversations(false);
            } catch (error) {
                console.error("Error fetching conversations:", error);
                setLoadingConversations(false);
            }
        };
        fetchConversations();
    }, [authToken, userId, currentUserId]);

    const loadMessages = async (user) => {
        setLoadingMessages(true);
        if (window.innerWidth < 768) setShowConversationsList(false);
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
        return () => socket.off("receiveMessage");
    }, [activeChatUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim() || !activeChatUser) return;

        // Show animation only if input is a single emoji
        if (isSingleEmoji(input.trim())) {
            setEmojiToAnimate(input.trim());
        }

        const messageData = {
            senderId: currentUserId,
            receiverId: activeChatUser._id,
            content: input.trim(),
        };
        socket.emit("sendMessage", messageData);
        setInput("");
        setShowEmojiPicker(false);
    };

    // Hide animation after it finishes
    const handleAnimationEnd = () => setEmojiToAnimate(null);

    const filteredConversations = conversations.filter((conv) =>
        conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                emojiButtonRef.current &&
                !emojiButtonRef.current.contains(event.target)
            ) {
                setShowEmojiPicker(false);
            }
        }

        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEmojiPicker]);

    return (
        <div className="flex flex-col md:flex-row h-[75vh] md:mx-10 rounded-2xl overflow-hidden shadow-2xl bg-[#0e0e0e] border border-[#2c2c2e]">
            {showConversationsList && (
                <div className="w-full md:w-1/3 bg-[#121212] border-r border-[#262626] min-h-[75dvh] p-5 overflow-y-auto no-scrollbar">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search"
                        className="w-full px-4 py-2 mb-5 rounded-xl bg-[#1e1e1e] text-white placeholder-neutral-500 border border-[#3b3b3d] focus:ring-2 focus:ring-[#ff4d94] outline-none"
                    />
                    {loadingConversations ? (
                        <div className="flex justify-center py-16">
                            <div className="w-6 h-6 border-2 border-t-white border-[#ff4d94] rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
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
                                        onClick={() => {
                                            setActiveChatUser(otherUser);
                                            loadMessages(otherUser);
                                        }}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#232323] shadow-sm ${activeChatUser?._id === otherUser._id ? "bg-[#232323]" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    otherUser.profileImage ||
                                                    "https://via.placeholder.com/150"
                                                }
                                                alt="User"
                                                className="w-12 h-12 rounded-full object-cover border-2 border-[#444] hover:scale-105 transition-transform"
                                            />
                                            <div className="flex flex-col max-w-[10rem]">
                                                <h3 className="text-white font-medium truncate">{otherUser.username}</h3>
                                                <p className="text-sm text-neutral-400 truncate">{content}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-neutral-500">{time}</span>
                                    </div>
                                );
                            })}
                            {filteredConversations.length === 0 && (
                                <p className="text-center text-neutral-500 mt-5">No conversations found.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="w-full md:w-2/3 flex h-full flex-col p-5 bg-[#101010] relative">
                {activeChatUser ? (
                    <>
                        <div className="flex items-center pb-4 border-b border-[#2f2f2f] mb-3">
                            <button
                                className="md:hidden text-white text-2xl mr-4"
                                onClick={() => {
                                    setShowConversationsList(true);
                                    setActiveChatUser(null);
                                    setMessages([]);
                                }}
                            >
                                ←
                            </button>
                            <Link to={`/profile/${activeChatUser._id}`} className="flex items-center">
                                <img
                                    src={
                                        activeChatUser.profileImage ||
                                        "https://via.placeholder.com/150"
                                    }
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full object-cover border border-[#555] mr-3"
                                />
                                <h2 className="text-white font-semibold text-lg">{activeChatUser.username}</h2>
                            </Link>
                        </div>

                        {/* Messages Section */}
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2 max-h-[50vh] md:max-h-none pb-3">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center h-full text-neutral-400">
                                    <div className="w-6 h-6 border-2 border-t-white border-[#ff4d94] rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, i) => {
                                        const isOwn = msg.senderId === currentUserId;
                                        return (
                                            <div key={i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                                <div
                                                    className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm shadow-md ${isOwn
                                                        ? "bg-gradient-to-br from-[#ff4d94] to-[#8f44fd] text-white rounded-bl-none"
                                                        : "bg-[#1e1e1e] text-white rounded-br-none"
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                        <AnimatePresence>
                            {isTyping && (
                                <motion.div
                                    className="flex items-center gap-3 px-4 pb-3"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex gap-1 mt-1">
                                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0s]" />
                                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                                    </div>
                                    <span className="text-sm text-neutral-400">Typing...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Input + Emoji Picker */}
                        <div className="relative">
                            {showEmojiPicker && windowWidth >= 768 && (
                                <div className="bottom-16 left-0 z-50 absolute md:absolute" ref={emojiPickerRef}>
                                    <EmojiPicker
                                        theme="dark"
                                        onEmojiClick={(e) => setInput((prev) => prev + e.emoji)}
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    ref={emojiButtonRef}
                                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                                    className="text-white text-2xl hidden md:block"
                                >
                                    😊
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => handleTyping(e)}
                                    placeholder="Type a message"
                                    className="flex-grow bg-[#222] text-white rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#ff4d94]"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim()}
                                    className={`px-4 py-2 rounded-full text-white font-semibold transition-colors ${input.trim()
                                        ? "bg-[#ff4d94] hover:bg-[#e04485]"
                                        : "bg-gray-600 cursor-not-allowed"
                                        }`}
                                >
                                    Send
                                </button>
                            </div>
                        </div>

                        {/* Emoji send animation */}
                        {emojiToAnimate && (
                            <EmojiSendAnimation emoji={emojiToAnimate} onAnimationEnd={handleAnimationEnd} />
                        )}
                    </>
                ) : (
                    <div className="flex justify-center items-center h-full text-neutral-500">
                        Select a conversation to start chatting.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Conversations;
