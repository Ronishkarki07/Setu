import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeptSidebar from "../../components/DeptSidebar";

const API = "http://localhost:3000/api";
const getDeptHead = () => { try { return JSON.parse(localStorage.getItem("deptHead") || "{}"); } catch { return {}; } };
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("deptToken")}` });

const STATUS_STYLES = {
  open:        { label: "Open",        cls: "text-blue-600 bg-blue-50 border border-blue-100" },
  in_progress: { label: "In Progress", cls: "text-amber-600 bg-amber-50 border border-amber-100" },
  resolved:    { label: "Resolved",    cls: "text-green-600 bg-green-100" },
  closed:      { label: "Closed",      cls: "text-gray-500 bg-gray-100" },
};
const PRI_STYLES = {
  high:   "bg-red-500 text-white",
  medium: "bg-gray-200 text-gray-700",
  low:    "bg-green-100 text-green-700",
};

export default function DeptTickets() {
  const navigate = useNavigate();
  const head = getDeptHead();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPri, setFilterPri] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const PER_PAGE = 4;

  useEffect(() => {
    Promise.all([
      fetch(`${API}/dept/tickets`, { headers: authHeaders() }).then(r => r.json()),
      fetch(`${API}/dept/stats`, { headers: authHeaders() }).then(r => r.json()),
    ]).then(([td, sd]) => {
      setTickets(td.tickets || []);
      setStats(sd.stats || {});
    }).finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.title?.toLowerCase().includes(q) || t.ticket_number?.toString().includes(q) || t.student_name?.toLowerCase().includes(q);
    const matchPri = filterPri === "all" || t.priority === filterPri;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchPri && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const total = Number(stats.total || 0);
  const resolved = Number(stats.resolved_count || 0);
  const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const handleExport = () => {
    const rows = [["Ticket#","Student","Title","Priority","Status","Date"],...filtered.map(t => [t.ticket_number,t.student_name,t.title,t.priority,t.status,new Date(t.created_at).toLocaleDateString()])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv);
    a.download = `${head.department}-tickets.csv`; a.click();
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <DeptSidebar />
      <main className="ml-56 min-h-screen">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button onClick={() => navigate("/dept/dashboard")} className="hover:text-gray-700 font-semibold">Academic Nexus</button>
            <span>/</span>
            <span className="font-semibold text-gray-600">Department Queue</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input placeholder="Search tickets..." className="bg-gray-100 rounded-full px-4 py-1.5 text-xs outline-none w-44 pr-7" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            </div>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">❓</button>
            <div className="w-8 h-8 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center text-xs font-bold">
              {(head.name||"D").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Ticket Queue — {head.department || "Department"}</h1>
              <p className="text-sm text-gray-400 mt-1">Manage and monitor academic technical requests across the campus network.</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Queue Health</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-gray-800">{resRate}% Resolved</span>
                <div className="w-10 h-10 relative">
                  <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${resRate} ${100-resRate}`} strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[180px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">☰</span>
              <input placeholder="Filter by keyword..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 rounded-xl outline-none border border-gray-200 focus:border-blue-300 transition-colors" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">PRIORITY</span>
              <select value={filterPri} onChange={e=>{setFilterPri(e.target.value);setPage(1);}} className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none cursor-pointer">
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">STATUS</span>
              <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1);}} className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none cursor-pointer">
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <button onClick={handleExport} className="ml-auto flex items-center gap-2 bg-[#0d1b3e] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1a2f5e] transition-colors">
              Export Report <span className="bg-white/20 px-1.5 py-0.5 rounded">↓</span>
            </button>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Issue Title</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="6" className="p-12 text-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"/></td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-gray-400 text-sm">No matching tickets found.</td></tr>
                ) : paged.map(t => {
                  const sc = STATUS_STYLES[t.status] || STATUS_STYLES.open;
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-6 py-5 text-xs font-bold text-gray-600">#{t.ticket_number}</td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-[11px] font-bold text-gray-600 shrink-0">
                            {(t.student_name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{t.student_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-5 text-sm text-gray-700 max-w-[200px] truncate">{t.title}</td>
                      <td className="px-5 py-5">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded w-fit ${PRI_STYLES[t.priority]||PRI_STYLES.medium}`}>{(t.priority||"MED").toUpperCase()}</span>
                          {t.priority === "high" && <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded w-fit">PRIORITY</span>}
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${sc.cls}`}>{sc.label}</span>
                      </td>
                      <td className="px-5 py-5">
                        <button onClick={() => navigate(`/dept/tickets/${t.id}`)} className="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors">View →</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Showing {Math.min((page-1)*PER_PAGE+1, filtered.length)}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} tickets</p>
              <div className="flex gap-1">
                <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors">‹</button>
                {Array.from({length:totalPages},(_, i)=>i+1).map(n=>(
                  <button key={n} onClick={()=>setPage(n)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${n===page?"bg-[#0d1b3e] text-white":"text-gray-500 hover:bg-gray-100"}`}>{n}</button>
                ))}
                <button disabled={page===totalPages||totalPages===0} onClick={()=>setPage(p=>p+1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors">›</button>
              </div>
            </div>
          </div>

          {/* Bottom info cards */}
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-[#0d1b3e] rounded-2xl p-5 text-white">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Queue Load</p>
              <h3 className="text-2xl font-black mb-2">{Number(stats.open_count||0)+Number(stats.inprogress_count||0) > 10 ? "Critical" : Number(stats.open_count||0)+Number(stats.inprogress_count||0) > 5 ? "Moderate" : "Healthy"}</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                {Number(stats.open_count||0)+Number(stats.inprogress_count||0)} active tickets require attention.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Staff Performance</p>
              {[{ label: "Resolution Rate", val: resRate }].map(s => (
                <div key={s.label} className="mb-3">
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="text-gray-600">{s.label}</span><span className="text-green-600">{s.val}% Satisf.</span></div>
                  <div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-[#0d1b3e] rounded-full" style={{width:`${s.val}%`}}/></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Update</p>
              <h3 className="text-lg font-black text-gray-800 mb-2">Queue Synchronized</h3>
              <p className="text-xs text-gray-400 mb-4">Data refreshed at {new Date().toLocaleTimeString()}</p>
              <div className="flex gap-2">
                <button onClick={()=>window.location.reload()} className="flex-1 py-2 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">REFRESH</button>
                <button className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center text-white">✓</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
