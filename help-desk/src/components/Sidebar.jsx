import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ onNewTicket }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <aside className="w-56 bg-white flex flex-col min-h-screen border-r border-gray-200 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-200">
        <div className="w-10 h-10 rounded-lg bg-[#8B0000] text-white flex items-center justify-center font-bold text-sm">
          ST
        </div>
        <div>
          <div className="text-gray-800 font-bold text-sm">Setu</div>
          <div className="text-gray-400 text-[9px] tracking-widest">STUDENT PORTAL</div>
        </div>
      </div>

      <nav className="p-3 flex-1">
        <div
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-3 px-3 py-3 text-sm cursor-pointer rounded-lg mb-2 ${
            isActive("/dashboard")
              ? "text-[#8B0000] bg-red-50 border-l-4 border-[#8B0000]"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <span className="text-lg">📊</span> Dashboard
        </div>

        <div
          onClick={() => navigate("/tickets")}
          className={`flex items-center gap-3 px-3 py-3 text-sm cursor-pointer rounded-lg mb-2 ${
            isActive("/tickets")
              ? "text-[#8B0000] bg-red-50 border-l-4 border-[#8B0000]"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <span className="text-lg">🎫</span> Tickets
        </div>

        {/* ✅ FIXED BUTTON */}
        <button
          onClick={() => {
            if (typeof onNewTicket === "function") {
              onNewTicket();
            } else {
              navigate("/tickets", { state: { openNewTicket: true } });
            }
          }}
          className="mt-6 w-full py-3 rounded-lg bg-[#8B0000] text-white font-bold text-sm hover:bg-[#a50e2d]"
        >
          + New Ticket
        </button>
      </nav>

      <div className="px-3 pb-3 border-t border-gray-200 pt-4">
        <div
          onClick={() => navigate("/settings")}
          className={`px-3 py-2 text-sm cursor-pointer rounded-lg ${
            isActive("/settings")
              ? "text-[#8B0000] bg-red-50 border-l-4 border-[#8B0000]"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          ⚙ Settings
        </div>

        <div
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("student");
            navigate("/");
          }}
          className="px-3 py-2 text-gray-500 text-sm cursor-pointer hover:text-red-600 hover:bg-gray-50 rounded-lg"
        >
          → Sign Out
        </div>
      </div>


    </aside>
  );
}