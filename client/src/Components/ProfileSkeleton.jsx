const ProfileSkeleton = () => {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse bg-neutral-900 rounded-xl w-full max-w-sm">
      {/* Avatar Placeholder */}
      <div className="w-14 h-14 rounded-full bg-neutral-700" />

      {/* Info Placeholder */}
      <div className="flex flex-col gap-2 flex-1">
        {/* Name Line */}
        <div className="w-3/4 h-4 bg-neutral-700 rounded" />

        {/* Last Seen Line */}
        <div className="w-1/2 h-3 bg-neutral-600 rounded" />
      </div>
    </div>
  );
};

export default ProfileSkeleton;
