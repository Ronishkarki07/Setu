import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar({ setShowManualModal }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ icon, label, path }) => (
    <div
      onClick={() => navigate(path)}
      className={`flex items-center gap-4 px-6 py-3.5 text-sm cursor-pointer transition-all ${
        isActive(path)
          ? "bg-[#F3F4F6] text-[#0D1B3E] font-bold border-r-4 border-[#0D1B3E]"
          : "text-gray-400 hover:text-[#0D1B3E] hover:bg-gray-50"
      }`}
    >
      <span className={`text-lg ${isActive(path) ? "text-[#0D1B3E]" : "text-gray-400"}`}>{icon}</span>
      {label}
    </div>
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-50">
      {/* Logo Section */}
      <div className="p-8 flex flex-col gap-1 mb-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0D1B3E] rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-900/20">S</div>
            <div className="flex flex-col">
                <span className="text-[#0D1B3E] font-black text-2xl tracking-tighter leading-none uppercase">Setu</span>
            </div>
        </div>
        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] mt-1">Institutional Portal</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem icon="📊" label="Dashboard" path="/admin/dashboard" />
        <NavItem icon="🎫" label="Ticket Queue" path="/admin/tickets" />
        <NavItem icon="🏢" label="Departments" path="/admin/departments" />
        <NavItem icon="👥" label="Users" path="/admin/users" />
        <NavItem icon="📣" label="Announcements" path="/admin/announcements" />
        <NavItem icon="⚙️" label="Settings" path="/admin/settings" />
        <NavItem icon="❓" label="Support" path="/admin/support" />
      </nav>

      <div className="p-6 space-y-3">
        <button
          onClick={() => setShowManualModal && setShowManualModal(true)}
          className="flex items-center justify-center gap-3 px-4 py-3.5 text-sm bg-[#0D1B3E] text-white rounded-xl w-full hover:bg-black transition-all font-black shadow-xl shadow-blue-900/20"
        >
          <span className="text-lg">+</span> New Ticket
        </button>
        <button 
          onClick={() => { localStorage.clear(); navigate("/admin/login"); }} 
          className="flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-gray-400 hover:text-[#0D1B3E] hover:bg-gray-50 rounded-xl w-full transition-all"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
