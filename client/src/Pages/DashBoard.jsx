import { NavLink, Outlet } from "react-router-dom";
import LogoutBtn from "../Components/Header/LogoutBtn";
import { useSelector } from "react-redux";

function DashBoard() {
  const tabs = [
    { label: "Overview", key: "overview", path: "/dashboard/overview" },
    { label: "Followers", key: "followers", path: "/dashboard/followers" },
    { label: "Followings", key: "followings", path: "/dashboard/followings" },
    { label: "My Posts", key: "posts", path: "/dashboard/posts" },
    { label: "Settings", key: "settings", path: "/dashboard/settings" },
  ];
  const userData = useSelector((state) => state.Auth.userData);

  return (
    <div className="flex w-full min-h-screen text-gray-300">
      <aside className="w-56 border-r border-gray-700 p-4 flex flex-col text-sm">
        <nav className="flex flex-col space-y-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={tab.key === "overview" ? tab.path : `${tab.path}/${userData?._id}`}
              className={({ isActive }) =>
                `text-left px-3 py-2 rounded-md hover:bg-[#21262d] transition ${isActive ? "bg-[#21262d] text-white" : ""
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
          <button className="text-left px-3 py-2 mt-8 rounded-md text-red-400 hover:bg-[#21262d] transition">
            <LogoutBtn />
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default DashBoard;
