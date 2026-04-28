import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000/api";

/* ---------------- helpers ---------------- */
function getToken() {
  return localStorage.getItem("token");
}

function getStudent() {
  try {
    return JSON.parse(localStorage.getItem("student") || "{}");
  } catch {
    return {};
  }
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

/* ---------------- SIDEBAR ---------------- */
function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    navigate("/");
  };

  return (
    <aside className="w-56 bg-[#0d1b3e] flex flex-col min-h-screen flex-shrink-0">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-[#DC143C] text-white flex items-center justify-center font-bold text-sm">
          AN
        </div>
        <div>
          <div className="text-white font-bold text-sm">Setu</div>
          <div className="text-white/40 text-[9px] tracking-widest">
            ACADEMIC AUTHORITY
          </div>
        </div>
      </div>

      <nav className="p-3 flex-1">
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm cursor-pointer bg-[#7a3f5a] border-l-[4px] border-[#DC143C]"
        >
          ⊞ Dashboard
        </div>

        <div
          onClick={() => navigate("/tickets")}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/60 text-sm cursor-pointer hover:text-white"
        >
          🎫 My Tickets
        </div>

        <button
          onClick={() => navigate("/tickets")}
          className="mt-4 w-full py-3 rounded-xl bg-[#DC143C] text-white font-bold text-sm hover:bg-[#a50e2d]"
        >
          + New Ticket
        </button>
      </nav>

      <div className="px-3 pb-3 border-t border-white/10 pt-4">
        <div
          onClick={() => navigate("/settings")}
          className="px-3 py-2 text-white/60 text-sm cursor-pointer hover:text-white"
        >
          ⚙ Settings
        </div>
        <div
          onClick={handleSignOut}
          className="px-3 py-2 text-[#DC143C] text-sm cursor-pointer"
        >
          → Sign Out
        </div>
      </div>
    </aside>
  );
}

/* ---------------- TOP NAV ---------------- */
function TopNav() {
  const student = getStudent();
  const initials = (student.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex justify-between px-8 h-14 bg-white border-b sticky top-0 z-10">
      <div className="flex gap-6 items-center">
        <span className="text-[#0d1b3e] font-bold border-b-2 border-[#DC143C]">
          Dashboard
        </span>
        <span className="text-gray-400">Tickets</span>
      </div>

      <div className="flex items-center gap-3">
        <input
          className="bg-gray-100 rounded-lg px-3 py-1 text-sm outline-none"
          placeholder="Search tickets..."
        />
        <div className="w-9 h-9 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center text-xs">
          {initials}
        </div>
      </div>
    </header>
  );
}

/* ---------------- MAIN DASHBOARD ---------------- */
export default function Dashboard() {
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ total: 0, open_count: 0, inprogress_count: 0, resolved_count: 0 });
  const [loading, setLoading] = useState(true);

  const student = getStudent();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Fetch tickets + stats in parallel
    Promise.all([
      fetch(`${API}/tickets/my-tickets`, { headers: authHeaders() })
        .then((r) => r.json())
        .catch(() => ({ tickets: [] })),
      fetch(`${API}/tickets/stats/overview`, { headers: authHeaders() })
        .then((r) => r.json())
        .catch(() => ({ statistics: {} })),
    ])
      .then(([ticketsData, statsData]) => {
        // Show latest 5 tickets as recent activity
        setRecent((ticketsData.tickets || []).slice(0, 5));

        const s = statsData.statistics || {};
        setStats({
          total: Number(s.total || 0),
          open_count: Number(s.open_count || 0),
          inprogress_count: Number(s.inprogress_count || 0),
          resolved_count: Number(s.resolved_count || 0),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const statusLabel = (s) => {
    if (s === "open") return "Open";
    if (s === "in_progress") return "In Progress";
    if (s === "resolved") return "Resolved";
    if (s === "closed") return "Closed";
    return s;
  };

  return (
    <div className="flex min-h-screen bg-[#f0f2f7] text-[#0d1b3e]">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <TopNav />

        <div className="p-10">
          {/* HEADER */}
          <h1 className="text-3xl font-bold">Welcome back,</h1>
          <h1 className="text-3xl font-bold text-[#DC143C] mb-6">
            {student.name || "Student"}
          </h1>

          {/* STATS */}
          <div className="flex gap-4 mb-8">
            {[
              { label: "Total Tickets", value: String(stats.total).padStart(2, "0") },
              { label: "Active", value: String(stats.open_count + stats.inprogress_count).padStart(2, "0") },
              { label: "Resolved", value: String(stats.resolved_count).padStart(2, "0") },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-5 rounded-xl flex-1 shadow"
              >
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* RECENT */}
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>

          {loading ? (
            <p className="text-gray-500">Loading tickets...</p>
          ) : recent.length === 0 ? (
            <p className="text-gray-500">No tickets found</p>
          ) : (
            recent.map((r) => (
              <div
                key={r.id}
                className="bg-white p-4 rounded-xl mb-3 shadow hover:shadow-md cursor-pointer"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold">{r.title}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{r.description}</p>
                  </div>

                  <div className="text-sm flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {r.ticket_number}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${
                        r.status === "resolved"
                          ? "bg-green-100 text-green-600"
                          : r.status === "open"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}