/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

function PostCard({ _id, title, image }) {
  return (
    <Link
      to={`/post/${_id}`}
      className="flex w-[11rem] h-[17rem] transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="w-[11rem] h-[17rem] bg-gray-800 border border-gray-700 text-white rounded-md overflow-hidden shadow hover:shadow-md">
        <div className="w-full h-full">
          <img
            src={image}
            alt={title}
            className="w-full h-full transition-transform duration-300 hover:scale-105"
          />
          <div className="bg-gradient-to-t from-black/80 to-transparent hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
            <h2 className="text-xs font-medium text-white">{title}</h2>
          </div>
        </div>
      </div>
    </Link>

  );
}

export default PostCard;
