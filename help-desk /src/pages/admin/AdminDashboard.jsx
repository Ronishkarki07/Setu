import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/react.svg";
import AdminSidebar from "../../components/AdminSidebar";
import ManualTicketModal from "../../components/admin/ManualTicketModal";

const API = "http://localhost:3000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0
  });

  const adminToken = localStorage.getItem("adminToken");
  const [showManualModal, setShowManualModal] = useState(false);
  const adminData = JSON.parse(localStorage.getItem("admin") || "{}");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchFaculties = async () => {
    try {
      const res = await fetch(`${API}/admin/faculties`, {
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFaculties(data.faculties || []);
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API}/admin/departments`, {
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : (data.departments || []));
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/tickets`, {
        headers: { "Authorization": `Bearer ${adminToken}` }
      });

      if (!res.ok) throw new Error("Failed to fetch tickets");

      const data = await res.json();
      const allTickets = data.tickets || [];
      setTickets(allTickets);

      const newStats = allTickets.reduce((acc, t) => {
        acc.total++;
        if (t.status === 'open') acc.open++;
        else if (t.status === 'in_progress') acc.in_progress++;
        else if (t.status === 'resolved' || t.status === 'closed') acc.resolved++;
        return acc;
      }, { total: 0, open: 0, in_progress: 0, resolved: 0 });
      
      setStats(newStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchFaculties();
    fetchTickets();

    // poll for updates every 5 seconds to provide near real-time UI
    const interval = setInterval(() => {
      fetchFaculties();
      fetchDepartments();
      fetchTickets();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const displayedTickets = filter === "all" 
    ? tickets 
    : tickets.filter(t => t.status === filter || (filter === 'resolved' && t.status === 'closed'));

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  const getDistribution = () => {
    const dist = {};
    tickets.forEach(t => {
      dist[t.category] = (dist[t.category] || 0) + 1;
    });
    return Object.entries(dist).map(([name, count]) => ({
      name,
      count,
      percentage: ((count / tickets.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  };

  const distribution = getDistribution();
  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#94a3b8"];

  const getLineChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      result.push({ 
        day: days[d.getDay()], 
        count: 0,
        dateStr: d.toISOString().split('T')[0]
      });
    }
    tickets.forEach(t => {
      const tDate = t.created_at.split('T')[0];
      const match = result.find(r => r.dateStr === tDate);
      if (match) match.count++;
    });
    return result;
  };

  const lineData = getLineChartData();
  const maxCount = Math.max(...lineData.map(d => d.count), 5);
  const chartHeight = 200;
  const chartWidth = 500;

  const getPoints = () => {
    return lineData.map((d, i) => {
      const x = (i / 6) * chartWidth;
      const y = chartHeight - (d.count / (maxCount * 1.2)) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <AdminSidebar setShowManualModal={setShowManualModal} />

      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-sm font-black text-[#0D1B3E] uppercase tracking-widest">SETU ADMIN PORTAL</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 ml-4">
              <div className="text-right">
                <p className="text-sm font-bold text-[#0D1B3E]">{adminData.name || "System Administrator"}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">SENIOR CONTROLLER</p>
              </div>
              <div className="w-10 h-10 bg-[#0D1B3E] text-white rounded-full flex items-center justify-center text-sm font-bold border border-gray-200 overflow-hidden shadow-sm transition-transform hover:scale-105">
                {(adminData.name || "System Administrator").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-4 gap-6">
            <StatCard label="Total Tickets" value={stats.total} icon="🎟️" color="blue" onClick={() => setFilter("all")} />
            <StatCard label="Open Tickets" value={stats.open} icon="🔓" color="green" onClick={() => setFilter("open")} />
            <StatCard label="In Progress" value={stats.in_progress} icon="⚙️" color="orange" onClick={() => setFilter("in_progress")} />
            <StatCard label="Resolved" value={stats.resolved} icon="✅" color="purple" onClick={() => setFilter("resolved")} />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6">Tickets Overview</h3>
              <div className="h-64 flex items-end justify-between gap-2 px-2 relative pt-8 ml-6">
                <div className="absolute left-[-24px] top-0 bottom-0 flex flex-col justify-between text-[10px] text-gray-400 pb-6 pr-4">
                  <span>{Math.ceil(maxCount * 1.2)}</span>
                  <span>{Math.ceil(maxCount * 0.9)}</span>
                  <span>{Math.ceil(maxCount * 0.6)}</span>
                  <span>{Math.ceil(maxCount * 0.3)}</span>
                  <span>0</span>
                </div>
                <div className="absolute inset-0 flex flex-col justify-between pb-6">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-gray-50" />)}
                </div>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="absolute inset-0 w-full h-[calc(100%-1.5rem)] pointer-events-none overflow-visible">
                  <polyline fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={getPoints()} className="chart-line" />
                  {lineData.map((d, i) => {
                    const x = (i / 6) * chartWidth;
                    const y = chartHeight - (d.count / (maxCount * 1.2)) * chartHeight;
                    return (
                      <g key={i} className="group/point">
                        <circle cx={x} cy={y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" className="transition-all duration-300" />
                        <rect x={x - 15} y={y - 25} width="30" height="15" rx="4" fill="#0f172a" className="opacity-0 group-hover/point:opacity-100 transition-opacity" />
                        <text x={x} y={y - 14} textAnchor="middle" fontSize="10" fill="white" className="opacity-0 group-hover/point:opacity-100 transition-opacity font-bold">{d.count}</text>
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute bottom-0 inset-x-0 flex justify-between">
                  {lineData.map(d => (
                    <span key={d.day} className="text-[10px] text-gray-400 w-full text-center">{d.day}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6">By Department</h3>
              <div className="flex flex-col items-center">
                <div className="relative w-44 h-44 mb-8">
                  <div className="absolute inset-0 rounded-full" style={{ background: distribution.length > 0 ? `conic-gradient(${distribution.map((d, i) => `${colors[i % colors.length]} 0% ${distribution.slice(0, i+1).reduce((acc, curr) => acc + parseFloat(curr.percentage), 0)}%`).join(', ')})` : "#f3f4f6" }}></div>
                  <div className="absolute inset-[30px] bg-white rounded-full flex items-center justify-center shadow-inner">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Total</p>
                      <p className="text-xl font-black text-gray-800 leading-none">{tickets.length}</p>
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {distribution.length > 0 ? distribution.map((d, i) => (
                    <DeptLegend key={d.name} label={d.name} value={d.count} percentage={`${d.percentage}%`} color={colors[i % colors.length]} />
                  )) : <p className="text-xs text-gray-400 text-center">No data available</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pb-8">
            <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Recent Tickets</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <th className="px-6 py-4">Ticket ID</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading...</td></tr>
                    ) : displayedTickets.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-400">No tickets found</td></tr>
                    ) : displayedTickets.slice(0, 10).map(t => (
                      <tr key={t.id} onClick={() => { setSelectedTicket(t); setShowDetailModal(true); }} className="text-xs hover:bg-gray-50 transition-all cursor-pointer group">
                        <td className="px-6 py-4 font-bold text-blue-600">#{t.ticket_number}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{t.title}</td>
                        <td className="px-6 py-4 text-gray-500">{t.category}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.priority === 'high' ? 'bg-red-50 text-red-500' : t.priority === 'medium' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>{t.priority}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'open' ? 'bg-blue-50 text-blue-500' : t.status === 'in_progress' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>{t.status.replace('_', ' ')}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6">System Summary</h3>
              <div className="space-y-4">
                  <SummaryItem icon="🏢" label="Total Departments" value={departments.length} />
                <SummaryItem icon="🎟️" label="Open Tickets" value={stats.open} />
                <SummaryItem icon="✅" label="Resolved Tickets" value={stats.resolved} />
                <SummaryItem icon="⚙️" label="In Progress" value={stats.in_progress} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showManualModal && (
        <ManualTicketModal onClose={() => setShowManualModal(false)} />
      )}

      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">#{selectedTicket.ticket_number}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${selectedTicket.status === 'open' ? 'bg-blue-50 text-blue-500' : selectedTicket.status === 'in_progress' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>{selectedTicket.status.replace('_', ' ')}</span>
                </div>
                <h3 className="font-black text-2xl text-gray-800 leading-tight">{selectedTicket.title}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <DetailField label="Student" value={selectedTicket.student_name} subValue={selectedTicket.student_email} icon="👤" />
                <DetailField label="Category" value={selectedTicket.category} icon="🏢" />
                <DetailField label="Priority" value={selectedTicket.priority.toUpperCase()} icon="📶" highlight={selectedTicket.priority === 'high' ? 'text-red-500' : selectedTicket.priority === 'medium' ? 'text-orange-500' : 'text-green-500'} />
                <DetailField label="Date" value={new Date(selectedTicket.created_at).toLocaleString('en-GB')} icon="📅" />
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description || "No description."}</p>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Update Status</p>
                <div className="flex gap-2">
                  {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                    <button key={s} onClick={async () => {
                        const res = await fetch(`${API}/tickets/${selectedTicket.id}/status`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                          body: JSON.stringify({ status: s })
                        });
                        if (res.ok) { fetchTickets(); setShowDetailModal(false); }
                      }} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${selectedTicket.status === s ? "bg-[#0f172a] text-white border-[#0f172a]" : "bg-white text-gray-500 border-gray-200 hover:border-[#0f172a]"}`}>{s.replace('_', ' ')}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .chart-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: dash 2s linear forwards; }
        @keyframes dash { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer transition-all ${active ? "bg-blue-600 text-white" : "hover:bg-white/5 hover:text-white"}`}>
      <span className="text-base opacity-80">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon, color, onClick }) {
  const colors = { blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600", orange: "bg-orange-50 text-orange-600", purple: "bg-purple-50 text-purple-600" };
  return (
    <div onClick={onClick} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition cursor-pointer group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function DeptLegend({ label, value, percentage, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-[11px] font-medium text-gray-600 truncate max-w-[120px]">{label}</span>
      </div>
      <span className="text-[11px] font-bold text-gray-800">{value} <span className="text-[9px] text-gray-400 font-normal">({percentage})</span></span>
    </div>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between p-1">
      <div className="flex items-center gap-3">
        <span className="text-lg opacity-70">{icon}</span>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
  );
}

function DetailField({ label, value, subValue, icon, highlight = "" }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0 border border-gray-100">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-bold ${highlight || "text-gray-800"}`}>{value}</p>
        {subValue && <p className="text-[10px] text-gray-400">{subValue}</p>}
      </div>
    </div>
  );
}
