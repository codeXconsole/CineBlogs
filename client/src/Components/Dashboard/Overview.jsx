import { useSelector } from 'react-redux';

export default function Overview() {
  const userData = useSelector((state) => state.Auth.userData);

  return (
    <div className="bg-black min-h-screen flex flex-col items-center px-4 py-12">
      {/* Dashboard Container */}
      <div className="w-full max-w-[50rem] bg-[#121212] rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center py-6">
          <h2 className="text-white font-semibold text-3xl">
            Dashboard Overview
          </h2>
          <p className="mt-2 text-gray-400 text-lg">
            Quick glance at your profile stats.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="flex justify-center p-6 space-x-6">
          {/* Followers Card */}
          <div className="bg-[#1e1e1e] text-white w-64 rounded-xl shadow-md p-4">
            <div className="flex items-center">
              <div className="text-white text-4xl mr-2">
                <i className="fas fa-users"></i>
              </div>
              <h4 className="text-lg font-bold">Followers</h4>
            </div>
            <div className="mt-3 text-center font-semibold text-3xl">
              {userData?.followers.length || 0}
            </div>
          </div>

          {/* Posts Card */}
          <div className="bg-[#1e1e1e] text-white w-64 rounded-xl shadow-md p-4">
            <div className="flex items-center">
              <div className="text-white text-4xl mr-2">
                <i className="fas fa-pen"></i>
              </div>
              <h4 className="text-lg font-bold">Posts</h4>
            </div>
            <div className="mt-3 text-center font-semibold text-3xl">
              {userData?.posts || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
