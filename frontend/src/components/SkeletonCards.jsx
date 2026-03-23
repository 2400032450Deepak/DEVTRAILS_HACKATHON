import React from "react";

const SkeletonCards = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="glass-panel shimmer rounded-2xl border border-white/10 p-4">
          <div className="mb-3 h-3 w-24 rounded bg-white/10" />
          <div className="h-7 w-28 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonCards;
