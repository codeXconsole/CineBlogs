import { useSelector } from 'react-redux';
import { ScaleLoader } from 'react-spinners';

export default function Overview() {
  const user = useSelector((state) => state.Auth.userData);

  if (!user) {
    return (
      <div className="flex w-full h-screen justify-center items-start mt-40">
        <div className="mt-16">
          <ScaleLoader color="#ffffff" height={50} />
        </div>
      </div>
    );
  }

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
        {/* <div className="bg-[#242424] p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out flex items-center space-x-6">
          <img
            src={user.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
          />
          <div className="flex flex-col">
            <p className="text-sm text-gray-400 mb-1">Profile</p>
            <h2 className="text-2xl font-semibold text-white">{user.username}</h2>
            <p className="text-sm text-gray-500 w-20 truncate">{user.email}</p>
          </div>
        </div> */}

      </div>
    </div>

  );
}
