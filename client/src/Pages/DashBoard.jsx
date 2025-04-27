import { useState } from "react";
import Profile from "../Components/Dashboard/Profile";
import LogoutBtn from "../Components/Header/LogoutBtn";
import Overview from "../Components/Dashboard/Overview";
import MyPosts from "../Components/Dashboard/MyPosts";
import Followers from "../Components/Dashboard/Followers";

function DashBoard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { label: "Overview", key: "overview" },
    { label: "Followers", key: "followers" },
    { label: "Followings", key: "followings" },
    { label: "My Posts", key: "posts" },
    { label: "Settings", key: "settings" },
  ];

  return (
    <div className="flex w-full min-h-screen text-gray-300">
      
      {/* Sidebar */}
      <aside className="w-56 border-r border-gray-700 p-4 flex flex-col text-sm">
        {/* <h1 className="text-xl font-semibold text-white mb-6 pl-2">Dashboard</h1> */}

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
        {activeTab === 'overview' && (
          <section>
            <Overview/>
          </section>
        )}
        {activeTab === 'followers' && (
          <section>
            <Followers />
          </section>
        )}
        {activeTab === 'followings' && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-white">Followings</h2>
            <p className="text-sm">People you are following.</p>
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
