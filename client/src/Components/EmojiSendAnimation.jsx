/* eslint-disable react/prop-types */
import { useEffect   } from "react";

const EmojiSendAnimation = ({ emoji, onAnimationEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 1500); // animation duration 1.5s
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div
      className="emoji-send-animation fixed bottom-20 left-1/2 transform -translate-x-1/2 text-6xl select-none pointer-events-none"
      style={{
        animation: "emojiPop 1.5s ease forwards",
        zIndex: 9999,
      }}
    >
      {emoji}
    </div>
  );
};

export default EmojiSendAnimation;
