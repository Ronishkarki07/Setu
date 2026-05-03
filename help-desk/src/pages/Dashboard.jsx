import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

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

/* sidebar removed - using shared component (src/components/Sidebar.jsx) */

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
    <header className="flex justify-between items-center px-8 h-16 bg-white bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="font-bold text-lg text-gray-800">
        Student Helpdesk Portal
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
          🔔
        </button>
        <div className="w-10 h-10 bg-[#8B0000] text-white rounded-full flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-[#a50e2d]">
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
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="ml-56 flex flex-col min-h-screen">
        <TopNav />

        <div className="flex-1 flex overflow-hidden">
          {/* MAIN CONTENT */}
          <div className="flex-1 overflow-auto p-8">
            {/* WELCOME HERO SECTION */}
            <div className="bg-gradient-to-br from-[#8B0000] to-[#6B0000] rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 w-96 h-96 bg-white rounded-full -mr-48 -mt-24"></div>
              <div className="relative z-10">
                <p className="text-sm font-bold tracking-wide mb-2 bg-white/20 w-fit px-3 py-1 rounded">
                  STUDENT PORTAL
                </p>
                <h1 className="text-4xl font-bold mb-2">Welcome back, {student.name || "Student"}.</h1>
                <p className="text-white/80">
                  You have <span className="font-bold text-white">{stats.open_count + stats.inprogress_count} active</span> tickets requiring your attention today.
                </p>
              </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-gray-400 font-semibold mb-2">AGGREGATE</p>
                <p className="text-4xl font-bold text-gray-800 mb-2">{String(stats.total).padStart(2, "0")}</p>
                <p className="text-xs text-gray-500">TOTAL TICKETS</p>
              </div>
              <div className="bg-[#8B0000] rounded-2xl p-6 shadow-sm hover:shadow-md transition text-white">
                <p className="text-sm text-white/70 font-semibold mb-2">URGENT</p>
                <p className="text-4xl font-bold mb-2">{String(stats.open_count).padStart(2, "0")}</p>
                <p className="text-xs text-white/60">OPEN TICKETS</p>
              </div>
              <div className="bg-green-600 rounded-2xl p-6 shadow-sm hover:shadow-md transition text-white">
                <p className="text-sm text-white/70 font-semibold mb-2">COMPLETED</p>
                <p className="text-4xl font-bold mb-2">{String(stats.resolved_count).padStart(2, "0")}</p>
                <p className="text-xs text-white/60">RESOLVED TICKETS</p>
              </div>
            </div>

            {/* RECENT UPDATES */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                <a href="#" className="text-[#8B0000] text-sm font-semibold hover:text-[#a50e2d]">VIEW ALL ACTIVITY →</a>
              </div>

              {loading ? (
                <p className="text-gray-500">Loading tickets...</p>
              ) : recent.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                  <p className="text-gray-500">No tickets found. Create your first ticket to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border-l-4"
                      style={{
                        borderLeftColor:
                          r.status === "resolved"
                            ? "#16a34a"
                            : r.status === "open"
                            ? "#8B0000"
                            : "#eab308",
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block">
                              {r.status === "resolved"
                                ? "✓"
                                : r.status === "open"
                                ? "!"
                                : "⚙"}
                            </span>
                            <p className="font-bold text-gray-800">{r.title}</p>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {r.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Ticket #{r.ticket_number}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                            r.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : r.status === "open"
                              ? "bg-red-100 text-red-700"
                              : r.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusLabel(r.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-auto">
            {/* QUICK STATS */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Status Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Open</span>
                  </div>
                  <span className="font-bold text-gray-800">{stats.open_count}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">In Progress</span>
                  </div>
                  <span className="font-bold text-gray-800">{stats.inprogress_count}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Resolved</span>
                  </div>
                  <span className="font-bold text-gray-800">{stats.resolved_count}</span>
                </div>
              </div>
            </div>

            {/* TIPS & ANNOUNCEMENTS */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tips & Updates</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">💡 Pro Tip</p>
                <p className="text-xs text-blue-700">
                  Use ticket tags to organize and filter your requests for better tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}