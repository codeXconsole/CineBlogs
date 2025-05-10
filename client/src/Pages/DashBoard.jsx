import { useState } from "react";
import Profile from "../Components/Dashboard/Profile";
import LogoutBtn from "../Components/Header/LogoutBtn";
import MyPosts from "../Components/Dashboard/MyPosts";
import Followers from "../Components/Dashboard/Followers.jsx";
import Followings from "../Components/Dashboard/Followings";
import Conversations from "./Conversations.jsx";

function DashBoard() {
  const [activeTab, setActiveTab] = useState('conversations');

  const tabs = [
    { label: "Conversations", key: "conversations" },
    { label: "Followers", key: "followers" },
    { label: "Followings", key: "followings" },
    { label: "My Posts", key: "posts" },
    { label: "Settings", key: "settings" },
  ];

  return (
    <div className="flex w-full min-h-screen text-gray-300">
      <aside className="w-56 border-r border-gray-700 p-4 flex flex-col text-sm">

        <nav className="flex flex-col space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-left px-3 py-2 rounded-md hover:bg-[#21262d] transition 
              ${activeTab === tab.key ? 'bg-[#21262d] text-white' : ''}`}
            >
              {tab.label}
            </button>
          ))}

          <button className="text-left px-3 py-2 mt-8 rounded-md text-red-400 hover:bg-[#21262d] transition">
            <LogoutBtn/>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === 'conversations' && (
          <section>
            <Conversations />
          </section>
        )}
        {activeTab === 'followers' && (
          <section>
            <Followers />
          </section>
        )}
        {activeTab === 'followings' && (
          <section>
            <Followings />
          </section>
        )}
        {activeTab === 'posts' && (
          <section>
            <MyPosts/>
          </section>
        )}
        {activeTab === 'settings' && (
          <section>
            <Profile />
          </section>
        )}
      </main>
    </div>
  );
}

export default DashBoard;
