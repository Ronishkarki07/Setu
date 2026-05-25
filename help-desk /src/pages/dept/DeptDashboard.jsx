import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeptSidebar from "../../components/DeptSidebar";

const API = "http://localhost:3000/api";
const getDeptHead = () => { try { return JSON.parse(localStorage.getItem("deptHead") || "{}"); } catch { return {}; } };
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("deptToken")}` });

const STATUS_CFG = {
  open:        { label: "Pending",     cls: "text-red-500",   dot: "bg-red-500" },
  in_progress: { label: "Assigned",    cls: "text-gray-600",  dot: "bg-gray-500" },
  resolved:    { label: "Resolved",    cls: "text-green-600", dot: "bg-green-500" },
  closed:      { label: "Closed",      cls: "text-gray-400",  dot: "bg-gray-400" },
};
const PRI_CFG = {
  high:   "bg-red-500 text-white",
  medium: "bg-gray-200 text-gray-700",
  low:    "bg-green-100 text-green-700",
};

export default function DeptDashboard() {
  const navigate = useNavigate();
  const head = getDeptHead();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/dept/tickets`, { headers: authHeaders() }).then(r => r.json()),
      fetch(`${API}/dept/stats`, { headers: authHeaders() }).then(r => r.json()),
    ]).then(([td, sd]) => {
      setTickets((td.tickets || []).slice(0, 6));
      setStats(sd.stats || {});
      setWeekly(sd.weekly || []);
    }).finally(() => setLoading(false));
  }, []);

  const total = Number(stats.total || 0);
  const pending = Number(stats.open_count || 0) + Number(stats.inprogress_count || 0);
  const resolvedWk = Number(stats.resolved_this_week || 0);
  const resRate = total > 0 ? Math.round((Number(stats.resolved_count || 0) / total) * 100) : 0;

  const chartDays = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const found = weekly.find(w => (w.date || "").split("T")[0] === ds);
      days.push({ label: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()], count: found ? Number(found.count) : 0 });
    }
    return days;
  })();
  const maxBar = Math.max(...chartDays.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <DeptSidebar />
      <main className="ml-56 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <h1 className="text-sm font-bold text-gray-700">Department Overview</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input placeholder="Search tickets..." className="bg-gray-100 rounded-full px-4 py-1.5 text-xs outline-none w-44 pr-7" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            </div>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">❓</button>
            <div className="w-8 h-8 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center text-xs font-bold">
              {(head.name || "D").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { title: "TOTAL ASSIGNED", val: total, badge: `+${Number(stats.inprogress_count||0)}`, badgeCls: "bg-green-100 text-green-700", sub: "Active workload across all staff", bar: "bg-blue-500", pct: 100, icon: "📋" },
              { title: "PENDING REVIEW", val: pending, badge: "High Urgency", badgeCls: "bg-red-100 text-red-500", sub: "Requires immediate attention", bar: "bg-red-400", pct: total > 0 ? (pending/total)*100 : 0, icon: "⏳", valCls: "text-red-500" },
              { title: "RESOLVED THIS WEEK", val: resolvedWk, badge: "Target Met", badgeCls: "bg-green-100 text-green-700", sub: "Successfully closed requests", bar: "bg-green-500", pct: total > 0 ? Math.min((resolvedWk/total)*100,100) : 0, icon: "✅", valCls: "text-green-600" },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.title}</p>
                  <span className="text-xl opacity-40">{c.icon}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-4xl font-black ${c.valCls || "text-gray-800"}`}>{c.val}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.badgeCls}`}>{c.badge}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{c.sub}</p>
                <div className="h-1.5 bg-gray-100 rounded-full"><div className={`h-full rounded-full ${c.bar}`} style={{width:`${Math.min(c.pct,100)}%`}} /></div>
              </div>
            ))}
          </div>

          {/* Main content row */}
          <div className="grid grid-cols-3 gap-5">
            {/* Recent Tickets table */}
            <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <h2 className="font-bold text-gray-800">Recent Tickets</h2>
                <button onClick={() => navigate("/dept/tickets")} className="text-xs text-blue-500 font-semibold hover:underline">View All →</button>
              </div>
              {loading ? (
                <p className="p-8 text-center text-sm text-gray-400">Loading...</p>
              ) : tickets.length === 0 ? (
                <p className="p-8 text-center text-sm text-gray-400">No tickets in your department yet.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">
                      <th className="px-5 py-3">Ticket ID</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tickets.map(t => {
                      const sc = STATUS_CFG[t.status] || STATUS_CFG.open;
                      const pc = PRI_CFG[t.priority] || PRI_CFG.medium;
                      return (
                        <tr key={t.id} onClick={() => navigate(`/dept/tickets/${t.id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                          <td className="px-5 py-4 text-xs font-bold text-gray-500">#{t.ticket_number}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                                {(t.student_name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                              </div>
                              <span className="text-xs font-semibold text-gray-700 truncate max-w-[90px]">{t.student_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-700 truncate max-w-[140px]">{t.title}</td>
                          <td className="px-4 py-4">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded ${pc}`}>{(t.priority||"med").toUpperCase().slice(0,3)}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${sc.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Weekly Trend */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800 text-sm">Weekly Trend</h3>
                  <span className="text-gray-400">···</span>
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Resolution Rate</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-black text-gray-800">{resRate}%</span>
                  <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded font-bold">+{resolvedWk} wk</span>
                </div>
                <div className="flex items-end gap-1.5 h-20">
                  {chartDays.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t" style={{
                        height: `${Math.max((d.count/maxBar)*100,8)}%`,
                        backgroundColor: i===6 ? "#3b82f6" : "#d1d5db",
                        minHeight: 4,
                      }} />
                      <span className="text-[8px] text-gray-400">{d.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/>Resolved</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block"/>Target</span>
                </div>
              </div>

              {/* System Efficiency */}
              <div className="bg-[#0d1b3e] rounded-2xl p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">⚡ System Efficiency</p>
                <p className="text-white/70 text-xs leading-relaxed mb-4">
                  {resRate >= 70 ? `Resolution rate ${resRate}%. Performance on track.` : `${pending} tickets need attention. Resolution at ${resRate}%.`}
                </p>
                <button onClick={() => navigate("/dept/tickets")} className="text-[10px] font-black border border-white/20 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors uppercase tracking-widest">
                  VIEW REPORT
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
