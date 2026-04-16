import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const API = "http://localhost:3000/api";

// Helper to get token from localStorage for authenticated requests
function getToken() {
  return localStorage.getItem("token");
}

// Safely retrieves stored student data (fallback to empty object if broken/missing)
function getStudent() {
  try {
    return JSON.parse(localStorage.getItem("student") || "{}");
  } catch {
    return {};
  }
}

// Standard headers used in all authenticated API calls
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// Top navigation bar with title, notifications, and user avatar
function TopNav() {
  const student = getStudent();

  // Convert student name into initials for avatar display
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
        {/* Notification icon (UI only for now might remove in future) */}
        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
          🔔
        </button>

        {/* User avatar using initials */}
        <div className="w-10 h-10 bg-[#8B0000] text-white rounded-full flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-[#a50e2d]">
          {initials}
        </div>
      </div>
    </header>
  );
}

// Main dashboard page where tickets and stats are shown
export default function Dashboard() {
  const [recent, setRecent] = useState([]);

  // Stores ticket statistics like total, open, resolved, etc.
  const [stats, setStats] = useState({
    total: 0,
    open_count: 0,
    inprogress_count: 0,
    resolved_count: 0,
  });

  // Handles loading state while fetching API data
  const [loading, setLoading] = useState(true);

  const student = getStudent();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Fetch tickets and stats at the same time for efficiency
    Promise.all([
      fetch(`${API}/tickets/my-tickets`, { headers: authHeaders() })
        .then((r) => r.json())
        .catch(() => ({ tickets: [] })),

      fetch(`${API}/tickets/stats/overview`, { headers: authHeaders() })
        .then((r) => r.json())
        .catch(() => ({ statistics: {} })),
    ])
      .then(([ticketsData, statsData]) => {
        // Show only latest 5 tickets for dashboard preview
        setRecent((ticketsData.tickets || []).slice(0, 5));

        const s = statsData.statistics || {};

        // Normalize stats so UI always gets safe numbers
        setStats({
          total: Number(s.total || 0),
          open_count: Number(s.open_count || 0),
          inprogress_count: Number(s.inprogress_count || 0),
          resolved_count: Number(s.resolved_count || 0),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // Converts backend status values into readable labels
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
          {/* Main content area */}
          <div className="flex-1 overflow-auto p-8">

            {/* Welcome section with user context */}
            <div className="bg-gradient-to-br from-[#8B0000] to-[#6B0000] rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 w-96 h-96 bg-white rounded-full -mr-48 -mt-24"></div>

              <div className="relative z-10">
                <p className="text-sm font-bold tracking-wide mb-2 bg-white/20 w-fit px-3 py-1 rounded">
                  STUDENT PORTAL
                </p>

                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {student.name || "Student"}.
                </h1>

                <p className="text-white/80">
                  You have{" "}
                  <span className="font-bold text-white">
                    {stats.open_count + stats.inprogress_count} active
                  </span>{" "}
                  tickets requiring your attention today.
                </p>
              </div>
            </div>

            {/* Stats overview cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">

              {/* Total tickets */}
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-gray-400 font-semibold mb-2">
                  AGGREGATE
                </p>
                <p className="text-4xl font-bold text-gray-800 mb-2">
                  {String(stats.total).padStart(2, "0")}
                </p>
                <p className="text-xs text-gray-500">TOTAL TICKETS</p>
              </div>

              {/* Open tickets */}
              <div className="bg-[#8B0000] rounded-2xl p-6 shadow-sm hover:shadow-md transition text-white">
                <p className="text-sm text-white/70 font-semibold mb-2">
                  URGENT
                </p>
                <p className="text-4xl font-bold mb-2">
                  {String(stats.open_count).padStart(2, "0")}
                </p>
                <p className="text-xs text-white/60">OPEN TICKETS</p>
              </div>

              {/* Resolved tickets */}
              <div className="bg-green-600 rounded-2xl p-6 shadow-sm hover:shadow-md transition text-white">
                <p className="text-sm text-white/70 font-semibold mb-2">
                  COMPLETED
                </p>
                <p className="text-4xl font-bold mb-2">
                  {String(stats.resolved_count).padStart(2, "0")}
                </p>
                <p className="text-xs text-white/60">RESOLVED TICKETS</p>
              </div>
            </div>

            {/* Recent ticket activity */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Recent Activity
                </h2>

                <a href="#" className="text-[#8B0000] text-sm font-semibold hover:text-[#a50e2d]">
                  VIEW ALL ACTIVITY →
                </a>
              </div>

              {/* Loading / empty / data states */}
              {loading ? (
                <p className="text-gray-500">Loading tickets...</p>
              ) : recent.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                  <p className="text-gray-500">
                    No tickets found. Create your first ticket to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {/* Ticket list */}
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

                        {/* Ticket details */}
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">
                            {r.title}
                          </p>

                          <p className="text-sm text-gray-500 line-clamp-1">
                            {r.description}
                          </p>

                          <p className="text-xs text-gray-400 mt-2">
                            Ticket #{r.ticket_number}
                          </p>
                        </div>

                        {/* Status badge */}
                        <span className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4">
                          {statusLabel(r.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-auto">

            {/* Status breakdown */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Status Overview
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-gray-600">Open</span>
                  <span className="font-bold text-gray-800">
                    {stats.open_count}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-bold text-gray-800">
                    {stats.inprogress_count}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="font-bold text-gray-800">
                    {stats.resolved_count}
                  </span>
                </div>
              </div>
            </div>

            {/* Help section */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Need Help?
              </h3>

              <button className="w-full py-3 px-4 rounded-lg bg-[#8B0000] text-white font-semibold hover:bg-[#a50e2d] transition mb-3">
                📞 Contact Support
              </button>

              <button className="w-full py-2 px-4 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">
                📚 View FAQ
              </button>
            </div>

            {/* Tips section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Tips & Updates
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  💡 Pro Tip
                </p>
                <p className="text-xs text-blue-700">
                  Use ticket tags to organize and track requests better.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}