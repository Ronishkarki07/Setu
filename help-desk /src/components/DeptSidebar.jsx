import { NavLink, useNavigate } from "react-router-dom";

function getDeptHead() {
  try { return JSON.parse(localStorage.getItem("deptHead") || "{}"); } catch { return {}; }
}

export default function DeptSidebar() {
  const navigate = useNavigate();
  const head = getDeptHead();
  const dept = head.department || "Department";
  const initials = (head.name || "D").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem("deptToken");
    localStorage.removeItem("deptHead");
    navigate("/dept/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-[#0d1b3e] text-white flex flex-col z-50 shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-sm font-black shadow-lg">
            {initials}
          </div>
          <div>
            <p className="text-xs font-black text-white leading-tight truncate max-w-[120px]">{dept}</p>
            <p className="text-[10px] text-white/40 font-semibold">Academic Helpdesk</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink
          to="/dept/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/8 hover:text-white"
            }`
          }
        >
          <span className="text-base">⊞</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/dept/tickets"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/8 hover:text-white"
            }`
          }
        >
          <span className="text-base">≡</span>
          Tickets
        </NavLink>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-1 border-t border-white/10 pt-3">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs font-black">{initials}</div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{head.name || "Dept Head"}</p>
            <p className="text-[10px] text-white/40 truncate">{head.email || ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/8 hover:text-white transition-all"
        >
          <span>↪</span> Logout
        </button>
      </div>
    </aside>
  );
}
