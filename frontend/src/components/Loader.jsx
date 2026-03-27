import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="glass-panel gradient-border relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl p-6 text-center shadow-deep">
      <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-white/15 border-t-cyan-300" />
      <p className="text-sm text-slate-300">{text}</p>
    </div>
  );
};

export default Loader;
