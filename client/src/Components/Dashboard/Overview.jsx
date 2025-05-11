import { useSelector } from 'react-redux';

export default function Overview() {
  const user = useSelector((state) => state.Auth.userData);

  if (!user) return <div className="text-white p-4">Loading user...</div>;

  return (
    <div className="bg-black min-h-screen text-white p-6">
      <h1 className="text-3xl font-semibold mb-8">Dashboard Overview</h1>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Posts */}
        <div className="bg-[#242424] p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
          <p className="text-sm text-gray-400 mb-1">Posts</p>
          <h2 className="text-4xl font-semibold">{user.posts || 0}</h2>
        </div>

        {/* Followers */}
        <div className="bg-[#242424] p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
          <p className="text-sm text-gray-400 mb-1">Followers</p>
          <h2 className="text-4xl font-semibold">{user.followers || 0}</h2>
        </div>

        {/* Followings */}
        <div className="bg-[#242424] p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
          <p className="text-sm text-gray-400 mb-1">Followings</p>
          <h2 className="text-4xl font-semibold">{user.followings || 0}</h2>
        </div>

        {/* Profile Info with Profile Pic */}
        <div className="bg-[#242424] p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out flex items-center space-x-6">
          <img
            src={user.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
          />
          <div>
            <p className="text-sm text-gray-400 mb-1">Profile</p>
            <h2 className="text-2xl font-semibold text-white">{user.username}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
