import React from "react";

const API = "http://localhost:3000/api";

export default function TopNav({ title = "Student Helpdesk Portal" }) {
  const student = {};
  try {
    Object.assign(student, JSON.parse(localStorage.getItem("student") || "{}"));
  } catch {}

  const initials = (student.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex justify-between items-stretch px-8 h-16 bg-white bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="flex gap-6 items-center flex-1 h-full">
        <div className="font-bold text-lg text-gray-800 h-full flex items-center">
          {title === "Settings" ? (
            <span className="text-[#0d1b3e] font-bold border-b-2 border-[#DC143C] h-full flex items-center pt-1">
              Settings
            </span>
          ) : title === "Announcements" ? (
            <span className="text-sm font-black text-[#0D1B3E] uppercase tracking-widest h-full flex items-center">
              Institutional Broadcasts
            </span>
          ) : (
            <span className="h-full flex items-center">{title}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col text-right">
          <span className="font-bold text-[#0D1B3E] text-sm">{student.name || "Student"}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">VERIFIED STUDENT</span>
        </div>
        <div className="w-10 h-10 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center text-sm font-bold border border-gray-200 overflow-hidden shadow-sm transition-transform hover:scale-105">
          {student.profile_photo ? (
            <img src={`${API.replace('/api', '')}/${student.profile_photo}`} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  );
}
