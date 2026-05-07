import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../images/footer-logo.svg";

const API = "http://localhost:3000/api";

export default function AdminTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const adminToken = localStorage.getItem("adminToken");
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const url = filter === "all"
        ? `${API}/tickets`
        : `${API}/tickets?status=${filter}`;

      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${adminToken}` }
      });

      if (!res.ok) throw new Error("Failed to fetch tickets");

      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.ticket_number.toString().includes(search) ||
    t.student_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* SIDEBAR (Same as Dashboard for consistency) */}
      <aside className="w-64 bg-[#0f172a] text-[#94a3b8] flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 flex items-center gap-3 border-b border-white/5 mb-4">
          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
            <img src={Logo} alt="Logo" className="w-6 h-6" />
          </div>
          <span className="text-white font-bold text-lg">Help Desk System</span>
        </div>
        <nav className="flex-1 px-4 overflow-y-auto space-y-6 pb-6 custom-scrollbar">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-3">Main</p>
            <div className="space-y-1">
              <NavItem icon="📊" label="Dashboard" onClick={() => navigate("/admin/dashboard")} />
              <NavItem icon="🎫" label="Tickets" active onClick={() => navigate("/admin/tickets")} />
              <NavItem icon="🏢" label="Departments" />
              <NavItem icon="👥" label="Users" />
              <NavItem icon="🛡️" label="Roles & Permissions" />
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => { localStorage.clear(); navigate("/admin/login"); }} className="flex items-center gap-3 px-4 py-3 text-sm hover:text-white hover:bg-white/5 rounded-xl w-full transition-all">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">Ticket Management</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{adminData.name || "Admin"}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">System Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">👤</div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* SEARCH & FILTERS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[300px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search by Ticket ID, Subject, or Student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-2">
              {["all", "open", "in_progress", "resolved", "closed"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${filter === s ? "bg-[#0f172a] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <th className="px-8 py-5">Ticket ID</th>
                    <th className="px-6 py-5">Student Information</th>
                    <th className="px-6 py-5">Subject & Category</th>
                    <th className="px-6 py-5">Priority</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="6" className="p-20 text-center"><div className="flex flex-col items-center gap-4"><div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div><span className="text-gray-400 font-medium">Loading tickets...</span></div></td></tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr><td colSpan="6" className="p-20 text-center text-gray-400">No tickets matching your criteria.</td></tr>
                  ) : filteredTickets.map(t => (
                    <tr 
                      key={t.id} 
                      onClick={() => { setSelectedTicket(t); setShowDetailModal(true); }}
                      className="hover:bg-gray-50 transition-all cursor-pointer group"
                    >
                      <td className="px-8 py-6 font-bold text-blue-600 text-sm">#{t.ticket_number}</td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{t.student_name}</span>
                          <span className="text-[11px] text-gray-400">{t.student_email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">{t.title}</span>
                          <span className="text-[11px] text-gray-500">{t.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.priority === 'high' ? 'bg-red-50 text-red-600' :
                          t.priority === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                        }`}>{t.priority}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          t.status === 'open' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          t.status === 'in_progress' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                          'bg-green-50 text-green-600 border-green-100'
                        }`}>{t.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-8 py-6 text-right text-sm text-gray-400">{new Date(t.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL (Reusing the one from Dashboard for consistency) */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">#{selectedTicket.ticket_number}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${selectedTicket.status === 'open' ? 'bg-blue-50 text-blue-500' : selectedTicket.status === 'in_progress' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>{selectedTicket.status.replace('_', ' ')}</span>
                </div>
                <h3 className="font-black text-2xl text-gray-800">{selectedTicket.title}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-2xl text-gray-400 hover:text-gray-600 transition">&times;</button>
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
                    <button
                      key={s}
                      onClick={async () => {
                        const res = await fetch(`${API}/tickets/${selectedTicket.id}/status`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                          body: JSON.stringify({ status: s })
                        });
                        if (res.ok) { fetchTickets(); setShowDetailModal(false); }
                      }}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${selectedTicket.status === s ? "bg-[#0f172a] text-white border-[#0f172a]" : "bg-white text-gray-500 border-gray-200 hover:border-[#0f172a]"}`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2 text-sm rounded-xl cursor-pointer transition-all ${active ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/5 hover:text-white"}`}>
      <span className="text-base opacity-80">{icon}</span>
      <span className="font-medium">{label}</span>
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
