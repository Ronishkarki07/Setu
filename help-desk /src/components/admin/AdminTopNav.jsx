import React from "react";

export default function AdminTopNav({ children, rightContent }) {
  const adminData = {};
  try {
    Object.assign(adminData, JSON.parse(localStorage.getItem("admin") || "{}"));
  } catch {}

  const initials = (adminData.name || "System Administrator")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex-1 flex items-center h-full">
        {children || <h1 className="text-sm font-black text-[#0D1B3E] uppercase tracking-widest">Setu Admin Portal</h1>}
      </div>

      <div className="flex items-center gap-4">
        {rightContent}
        <div className="flex flex-col text-right">
          <span className="font-bold text-[#0D1B3E] text-sm">{adminData.name || "System Administrator"}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SENIOR CONTROLLER</span>
        </div>
        <div className="w-10 h-10 bg-[#0D1B3E] text-white rounded-full flex items-center justify-center text-sm font-bold border border-gray-200 shadow-sm transition-transform hover:scale-105">
          {initials}
        </div>
      </div>
    </header>
  );
}