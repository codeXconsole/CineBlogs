import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import { FiPaperclip, FiImage, FiVideo, FiMusic, FiFileText } from 'react-icons/fi';

const FilePreview = ({ message, isOwn, formatTime }) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [fileSize, setFileSize] = useState('Loading...');
  const imageRef = useRef(null);

  useEffect(() => {
    const fetchFileSize = async () => {
      if (message.fileUrl) {
        const size = await getFileSize(message.fileUrl);
        setFileSize(size);
      }
    };
    fetchFileSize();
  }, [message.fileUrl]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <FiImage className="w-5 h-5" />;
      case 'video': return <FiVideo className="w-5 h-5" />;
      case 'audio': return <FiMusic className="w-5 h-5" />;
      default: return <FiFileText className="w-5 h-5" />;
    }
  };

  const getFileSize = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      
      if (contentLength) {
        const bytes = parseInt(contentLength);
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      }
      return 'Unknown size';
    } catch (error) {
      console.error('Error getting file size:', error);
      return 'Unknown size';
    }
  };

  const downloadFile = async (url, filename) => {
    try {
      // For images and other files
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      
      // Set the download filename
      const fileExtension = url.split('.').pop();
      const downloadFilename = filename || `download.${fileExtension}`;
      link.download = downloadFilename;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const maxWidth = 300;
    const maxHeight = 200;
    
    if (img.naturalWidth > maxWidth || img.naturalHeight > maxHeight) {
      const widthRatio = maxWidth / img.naturalWidth;
      const heightRatio = maxHeight / img.naturalHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      
      img.style.width = `${img.naturalWidth * ratio}px`;
      img.style.height = `${img.naturalHeight * ratio}px`;
    }
  };

  const FullscreenModal = () => (
    <AnimatePresence>
      {showFullscreen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowFullscreen(false)}
        >
          <motion.div
            className="relative max-w-[90vw] max-h-[90vh]"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                onClick={() => setImageScale(prev => Math.min(prev + 0.25, 3))}
                className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setImageScale(prev => Math.max(prev - 0.25, 0.25))}
                className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setImageRotation(prev => prev + 90)}
                className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => downloadFile(message.fileUrl, message.content)}
                className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFullscreen(false)}
                className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              ref={imageRef}
              src={message.fileUrl}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${imageScale}) rotate(${imageRotation}deg)`
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (message.type === "image") {
    return (
      <>
        <div className="relative group max-w-sm">
          <div className="relative overflow-hidden rounded-lg border border-slate-600/50">
            <img
              src={message.fileUrl}
              alt="Shared image"
              className="w-full h-auto max-w-[300px] max-h-[200px] object-cover cursor-pointer transition-transform duration-200 hover:scale-105"
              onLoad={handleImageLoad}
              onClick={() => setShowFullscreen(true)}
            />
            
            {/* Overlay with controls */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullscreen(true);
                  }}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                  title="View full size"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const filename = message.content || `image-${Date.now()}.jpg`;
                    downloadFile(message.fileUrl, filename);
                  }}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                  title="Download image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Image info */}
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Image • {fileSize}</span>
            <button
              onClick={() => {
                const filename = message.content || `image-${Date.now()}.jpg`;
                downloadFile(message.fileUrl, filename);
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <FullscreenModal />
      </>
    );
  }

  if (message.type === "video") {
    return (
      <div className="relative group max-w-sm">
        <div className="relative overflow-hidden rounded-lg border border-slate-600/50 bg-slate-800">
          <video 
            controls 
            className="w-full h-auto max-w-[300px] max-h-[200px] object-cover"
            poster={message.thumbnail} // Add thumbnail support
            preload="metadata"
          >
            <source src={message.fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Download button overlay */}
          <button
            onClick={() => downloadFile(message.fileUrl, message.content)}
            className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-slate-400">
          <span>Video • {fileSize}</span>
        </div>
      </div>
    );
  }

  if (message.type === "audio") {
    return (
      <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-600/50 min-w-[280px] max-w-sm">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <FiMusic className="w-5 h-5 text-purple-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate mb-1">
            {message.content || 'Voice message'}
          </div>
          <audio controls className="w-full h-8">
            <source src={message.fileUrl} type="audio/wav" />
            <source src={message.fileUrl} type="audio/mp3" />
            Your browser does not support the audio tag.
          </audio>
          <div className="text-xs text-slate-400 mt-1">
            Audio • {fileSize}
          </div>
        </div>
        
        <button
          onClick={() => downloadFile(message.fileUrl, message.content)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Generic file type
  return (
    <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-lg border border-slate-600/50 min-w-[280px] max-w-sm hover:bg-slate-700/50 transition-colors group">
      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
        {getFileIcon(message.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {message.content}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {message.type?.toUpperCase() || 'FILE'} • {fileSize}
        </div>
      </div>
      
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => window.open(message.fileUrl, '_blank')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => downloadFile(message.fileUrl, message.content)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FilePreview;