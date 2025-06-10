import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllConversations,
  getMessagesAPI,
  getUserData,
} from "../AppWrite/Apibase";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import EmojiSendAnimation from "../Components/EmojiSendAnimation";
import FilePreview from "../Components/FilePreview";
import { FiPaperclip, FiMic, FiVideo, FiEdit2 } from "react-icons/fi";
import { Search, Send, ArrowLeft, Smile, MoreVertical, Phone, Video, Info, X, Upload, Edit3, Check, XCircle, Loader2 } from "lucide-react";


const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const socket = io(apiBaseUrl);

const FileUploadProgress = ({ message, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-slate-800/80 rounded-lg p-4 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
          <span className="text-sm text-slate-300">Uploading {message.content}...</span>
        </div>
        <button
          onClick={() => onCancel(message._id)}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
};

const Conversations = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, messageId: null });
  const contextMenuRef = useRef(null);

  const handleFileUpload = async (file, messageId = null) => {
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB limit
    if (file.size > maxSize) {
      alert("File size should be less than 50MB");
      return;
    }

    // Determine file type
    let type = 'file';
    if (file.type.startsWith('image/')) {
      type = 'image';
    } else if (file.type.startsWith('video/')) {
      type = 'video';
    } else if (file.type.startsWith('audio/')) {
      type = 'audio';
    }

    // Create temporary message with loading state
    const tempMessage = {
      _id: messageId || Date.now().toString(),
      senderId: currentUserId,
      receiverId: activeChatUser._id,
      content: file.name,
      type: type,
      fileUrl: URL.createObjectURL(file),
      isUploading: true,
      isCancelled: false,
      timestamp: new Date().toISOString()
    };

    // Add or update message in state
    setMessages(prev => {
      if (messageId) {
        return prev.map(msg => msg._id === messageId ? tempMessage : msg);
      }
      return [...prev, tempMessage];
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("receiverId", activeChatUser._id);
    formData.append("content", file.name);
    formData.append("type", type);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/message/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const data = await response.json();
      
      // Update the temporary message with the real one
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id ? { ...data.data, isUploading: false, isCancelled: false } : msg
      ));

      // Emit the message through socket
      socket.emit("sendMessage", {
        ...data.data,
        receiverId: activeChatUser._id
      });

    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error.message || "Failed to upload file");
      // Remove the failed message
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const handleCancelUpload = (messageId) => {
    // Mark the message as cancelled instead of removing it
    setMessages(prev => prev.map(msg => 
      msg._id === messageId ? { ...msg, isUploading: false, isCancelled: true } : msg
    ));
  };

  const handleRetryUpload = (message) => {
    // Convert the file URL back to a File object
    fetch(message.fileUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], message.content, { type: blob.type });
        handleFileUpload(file, message._id);
      })
      .catch(error => {
        console.error("Error retrying upload:", error);
        alert("Failed to retry upload");
      });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        await handleFileUpload(
          new File([audioBlob], "voice-message.wav", { type: "audio/wav" })
        );
      };

      setAudioStream({ stream, mediaRecorder, audioChunks });
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Cannot access microphone");
    }
  };

  const stopRecording = () => {
    if (audioStream?.mediaRecorder) {
      audioStream.mediaRecorder.stop();
      audioStream.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setAudioStream(null);
  };

  useEffect(() => {
    if (currentUserId) {
      socket.emit("user_connected", currentUserId);
    }

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
        receiverId: activeChatUser._id,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", {
          senderId: currentUserId,
          receiverId: activeChatUser._id,
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
        console.log(allConversations);
        setConversations(allConversations);
        if (userId !== currentUserId) {
          const existing = allConversations.find(
            (conv) => conv.userData._id === userId
          );
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
                    lastMessage: {
                      content: "",
                      timestamp: new Date().toISOString(),
                    },
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

  useEffect(() => {
  return () => {
    if (audioStream) {
      audioStream.stream.getTracks().forEach(track => track.stop());
    }
  };
}, [audioStream]);

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
    
    // Handle incoming messages
    socket.on("receiveMessage", (message) => {
      console.log("Received message:", message); // Debug log
      if (
        activeChatUser &&
        (message.senderId === activeChatUser._id ||
          message.receiverId === activeChatUser._id)
      ) {
        setMessages(prev => {
          const messageExists = prev.some(msg => msg._id === message._id);
          if (!messageExists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });
    
    // Handle message updates
    socket.on("messageUpdate", (update) => {
      console.log("Message update:", update); // Debug log
      if (
        activeChatUser &&
        (update.senderId === activeChatUser._id ||
          update.receiverId === activeChatUser._id)
      ) {
        // Refresh messages if needed
        loadMessages(activeChatUser);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageUpdate");
    };
  }, [activeChatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleContextMenu = (e, messageId, messageContent, isOwn) => {
    e.preventDefault();
    if (!isOwn || editingMessageId) return;
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      messageId,
      messageContent
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu({ show: false, x: 0, y: 0, messageId: null });
      }
    };

    if (contextMenu.show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.show]);

  const startEditMessage = () => {
    if (!contextMenu.messageId || !contextMenu.messageContent) return;
    
    setEditingMessageId(contextMenu.messageId);
    setEditingContent(contextMenu.messageContent);
    setInput(contextMenu.messageContent);
    setContextMenu({ show: false, x: 0, y: 0, messageId: null });
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
    setInput("");
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeChatUser) return;

    if (editingMessageId) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/message/${editingMessageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ content: input.trim() }),
        });

        if (!response.ok) {
          throw new Error('Failed to edit message');
        }

        const data = await response.json();
        
        // Update the message in local state
        setMessages(prev => prev.map(msg => 
          msg._id === editingMessageId ? data.data : msg
        ));

        // Reset editing state
        setEditingMessageId(null);
        setEditingContent("");
        setInput("");
      } catch (error) {
        console.error("Error editing message:", error);
        alert("Failed to edit message. Please try again.");
      }
    } else {
      // Original send message logic
      const messageData = {
        senderId: currentUserId,
        receiverId: activeChatUser._id,
        content: input.trim(),
        type: 'text'
      };

      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/message/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(messageData),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        socket.emit("sendMessage", data.data);
        setInput("");
        setShowEmojiPicker(false);
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
      }
    }
  };

  useEffect(() => {
    socket.on("messageEdited", (editedMessage) => {
      setMessages(prev => prev.map(msg => 
        msg._id === editedMessage._id ? editedMessage : msg
      ));
    });

    return () => socket.off("messageEdited");
  }, []);

  // Hide animation after it finishes
  const handleAnimationEnd = () => setEmojiToAnimate(null);

  const filteredConversations = conversations.filter((conv) =>
    conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString();
    }
  };

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
    <div className="flex flex-col md:flex-row h-[85vh] w-full mx-auto rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 backdrop-blur-sm">
      {/* Conversations Sidebar */}
      {showConversationsList && (
        <motion.div 
          className="w-full md:w-96 bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50 flex flex-col"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <h1 className="text-2xl font-bold text-white mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800/60 text-white placeholder-slate-400 border border-slate-600/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
            {loadingConversations ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-t-white border-purple-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv, index) => {
                  const otherUser = conv.userData;
                  const { content, timestamp } = conv.lastMessage;
                  const isActive = activeChatUser?._id === otherUser._id;
                  
                  return (
                    <motion.div
                      key={index}
                      onClick={() => {
                        setActiveChatUser(otherUser);
                        loadMessages(otherUser);
                      }}
                      className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-slate-800/60 group ${
                        isActive ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30" : ""
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative">
                        <img
                          src={
                            otherUser.profileImage ||
                            "https://via.placeholder.com/150"
                          }
                          alt="User"
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-600 group-hover:border-purple-500/50 transition-colors"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${getStatusColor(otherUser.status || 'offline')}`} />
                      </div>
                      
                      <div className="flex-1 ml-4 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-semibold truncate">{otherUser.username}</h3>
                          <span className="text-xs text-slate-400">{formatTime(timestamp)}</span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">{content}</p>
                      </div>
                    </motion.div>
                  );
                })}
                {filteredConversations.length === 0 && (
                  <p className="text-center text-slate-400 mt-5">
                    No conversations found.
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-800/30 backdrop-blur-xl relative">
        {activeChatUser ? (
          <>
            {/* Chat Header */}
            <motion.div 
              className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <button
                  className="md:hidden text-white mr-4 p-2 hover:bg-slate-700 rounded-xl transition-colors"
                  onClick={() => {
                    setShowConversationsList(true);
                    setActiveChatUser(null);
                    setMessages([]);
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="relative">
                  <img
                    src={
                      activeChatUser.profileImage ||
                      "https://via.placeholder.com/150"
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-600"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(activeChatUser.status || 'offline')}`} />
                </div>
                
                <div className="ml-4">
                  <h2 className="text-white font-semibold text-lg">{activeChatUser.username}</h2>
                  <p className="text-sm text-slate-400 capitalize">{activeChatUser.status || 'offline'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors">
                  <Info className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Messages Section */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full text-slate-400">
                  <div className="w-6 h-6 border-2 border-t-white border-purple-500 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {messages.map((msg, i) => {
                      const isOwn = msg.senderId === currentUserId;
                      return (
                        <motion.div
                          key={i}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                          <div className={`flex items-end space-x-2 max-w-[75%] ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                            {!isOwn && (
                              <img
                                src={activeChatUser.profileImage || "https://via.placeholder.com/150"}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <div>
                              {msg.isUploading ? (
                                <FileUploadProgress 
                                  message={msg} 
                                  onCancel={handleCancelUpload}
                                />
                              ) : msg.isCancelled ? (
                                <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                                  Upload cancelled
                                  <button
                                    onClick={() => handleRetryUpload(msg)}
                                    className="ml-2 text-red-400 hover:text-red-300 underline"
                                  >
                                    Retry
                                  </button>
                                </div>
                              ) : (
                                <div
                                  className={`px-[0.4rem] py-[0.4rem] rounded-lg text-sm shadow-lg backdrop-blur-sm relative ${
                                    isOwn
                                      ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-lg"
                                      : "bg-slate-700/80 text-white rounded-bl-lg border border-slate-600/50"
                                  } ${editingMessageId === msg._id ? "ring-2 ring-yellow-400" : ""}`}
                                  onContextMenu={(e) => isOwn && msg.type === 'text' && handleContextMenu(e, msg._id, msg.content, isOwn)}
                                >
                                  {msg.type !== "text" ? (
                                    <FilePreview 
                                      message={msg} 
                                      isOwn={isOwn} 
                                      formatTime={formatTime}
                                    />
                                  ) : (
                                    <>
                                      {msg.content}
                                      {msg.edited && (
                                        <span className="text-xs opacity-70 ml-2 italic">
                                          (edited)
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                              <div className={`text-xs text-slate-400 mt-1 ${isOwn ? "text-right" : "text-left"}`}>
                                {formatTime(msg.timestamp)}
                                {msg.edited && msg.editedAt && (
                                  <span className="ml-1">• Edited {formatTime(msg.editedAt)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        className="flex items-end space-x-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <img
                          src={activeChatUser.profileImage || "https://via.placeholder.com/150"}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="bg-slate-700/80 rounded-3xl rounded-bl-lg px-6 py-3 border border-slate-600/50">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input + Emoji Picker */}
            <motion.div 
              className="p-6 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="relative">
                {showEmojiPicker && windowWidth >= 768 && (
                  <motion.div
                    className="absolute bottom-16 left-0 z-50"
                    ref={emojiPickerRef}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <EmojiPicker
                      theme="dark"
                      onEmojiClick={(e) => setInput((prev) => prev + e.emoji)}
                    />
                  </motion.div>
                )}
                
                <div className="flex items-end space-x-4">
                  <div className="flex gap-2">
                    <button
                      ref={emojiButtonRef}
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-2xl transition-colors hidden md:block"
                    >
                      <Smile className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-2xl transition-colors"
                    >
                      <FiPaperclip size={20} />
                    </button>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-2xl transition-colors ${
                        isRecording ? "text-red-500" : ""
                      }`}
                    >
                      <FiMic size={20} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />
                  </div>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => handleTyping(e)}
                      placeholder={editingMessageId ? "Edit your message..." : "Type your message..."}
                      className={`w-full px-6 py-4 rounded-3xl text-white placeholder-slate-400 border outline-none transition-all duration-200 backdrop-blur-sm ${
                        editingMessageId 
                          ? "bg-yellow-500/10 border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                          : "bg-slate-700/60 border-slate-600/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                        if (e.key === "Escape" && editingMessageId) {
                          cancelEdit();
                        }
                      }}
                    />
                  </div>

                  <motion.button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className={`p-4 rounded-2xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                      input.trim()
                        ? editingMessageId
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-yellow-500/25"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                    whileHover={input.trim() ? { scale: 1.05 } : {}}
                    whileTap={input.trim() ? { scale: 0.95 } : {}}
                  >
                    {editingMessageId ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Emoji send animation */}
            {emojiToAnimate && (
              <EmojiSendAnimation
                emoji={emojiToAnimate}
                onAnimationEnd={handleAnimationEnd}
              />
            )}

            {/* Edit Mode Indicator */}
            {editingMessageId && (
              <motion.div 
                className="px-6 py-3 bg-yellow-500/10 border-t border-yellow-500/20 flex items-center justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Editing message</span>
                </div>
                <button 
                  onClick={cancelEdit}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Context Menu */}
            {contextMenu.show && (
              <motion.div
                ref={contextMenuRef}
                className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-lg py-2 min-w-[120px]"
                style={{
                  left: contextMenu.x,
                  top: contextMenu.y,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <button
                  onClick={startEditMessage}
                  className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div 
            className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
              <Search className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold">Select a conversation</h3>
            <p className="text-center max-w-md">Choose from your existing conversations or start a new one to begin messaging.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Conversations;