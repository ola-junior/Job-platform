export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton h-4 rounded ${className}`} />;
}
export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-3/4" />
          <SkeletonLine className="w-1/2" />
        </div>
      </div>
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-5/6" />
      <div className="flex gap-2 pt-1">
        <SkeletonLine className="w-16 h-5 rounded-full" />
        <SkeletonLine className="w-20 h-5 rounded-full" />
      </div>
    </div>
  );
}
