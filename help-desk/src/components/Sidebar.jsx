import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-56 bg-[#0d1b3e] flex flex-col h-screen">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-[#DC143C] text-white flex items-center justify-center font-bold">
          ST
        </div>
        <div>
          <div className="text-white font-bold text-sm">Setu</div>
          <div className="text-white/40 text-[9px] tracking-widest">
            Biratnagar International College
          </div>
        </div>
      </div>

      {/* NAV LINKS */}
      <nav className="p-3 flex-1 space-y-1">
        
        {/* DASHBOARD */}
        <div
          onClick={() => navigate("/dashboard")}
          className={`px-3 py-2 cursor-pointer rounded-lg transition-all 
            ${isActive("/dashboard") 
              ? "bg-[#DC143C] text-white font-semibold shadow" 
              : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
        >
          ⊞ Dashboard
        </div>

        {/* TICKETS */}
        <div
          onClick={() => navigate("/tickets")}
          className={`px-3 py-2 cursor-pointer rounded-lg transition-all 
            ${isActive("/tickets") && !location.search.includes("new")
              ? "bg-[#DC143C] text-white font-semibold shadow" 
              : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
        >
          🎫 Tickets
        </div>

        {/* NEW TICKET BUTTON */}
        <button
          onClick={() => navigate("/tickets?new=true")}
          className="mt-4 w-full py-3 bg-[#DC143C] text-white rounded-xl hover:bg-[#b81233] transition"
        >
          + New Ticket
        </button>
      </nav>

      {/* SETTINGS + SIGN OUT */}
      <div className="p-3 border-t border-white/10 space-y-3">

        {/* SETTINGS */}
        <div
          onClick={() => navigate("/settings")}
          className="text-white/70 hover:text-white hover:bg-white/10 cursor-pointer rounded-lg px-3 py-2 transition flex items-center gap-2"
        >
          ⚙️ Settings
        </div>

        {/* SIGN OUT */}
        <div
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="text-[#ff6b6b] hover:text-white hover:bg-[#ff6b6b]/20 rounded-lg px-3 py-2 cursor-pointer transition flex items-center gap-2"
        >
          → Sign Out
        </div>
      </div>
    </aside>
  );
}