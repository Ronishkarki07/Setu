import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminTopNav from "../../components/admin/AdminTopNav";
import ManualTicketModal from "../../components/admin/ManualTicketModal";

const API = "http://localhost:3000/api";

export default function AdminTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showManualModal, setShowManualModal] = useState(false);

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
      <AdminSidebar setShowManualModal={setShowManualModal} />

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <AdminTopNav>
          <h1 className="text-sm font-black text-[#0D1B3E] uppercase tracking-widest">Setu Admin Portal</h1>
        </AdminTopNav>

        <div className="p-12 max-w-7xl mx-auto w-full space-y-8">
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Institutional Queue / Governance</p>
            <h2 className="text-4xl font-black text-[#0D1B3E] tracking-tight">Ticket Management</h2>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm flex flex-wrap gap-6 items-center justify-between">
            <div className="relative flex-1 min-w-[400px]">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              <input 
                type="text" 
                placeholder="Search by ID, Student, or Issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl pl-16 pr-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0D1B3E] transition-all"
              />
            </div>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
              {["all", "open", "in_progress", "resolved", "closed"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === s ? "bg-[#0D1B3E] text-white shadow-lg" : "text-gray-400 hover:text-[#0D1B3E] hover:bg-white"
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                    <th className="px-10 py-6">Ticket ID</th>
                    <th className="px-8 py-6">Student Entity</th>
                    <th className="px-8 py-6">Subject & Classification</th>
                    <th className="px-8 py-6">Priority</th>
                    <th className="px-8 py-6 text-center">Current Status</th>
                    <th className="px-10 py-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="6" className="p-24 text-center"><div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-[#0D1B3E]/10 border-t-[#0D1B3E] rounded-full animate-spin"></div><span className="text-gray-400 text-xs font-black uppercase tracking-widest">Synchronizing Queue...</span></div></td></tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr><td colSpan="6" className="p-24 text-center text-gray-400 font-bold uppercase tracking-widest">No matching institutional records found.</td></tr>
                  ) : filteredTickets.map(t => (
                    <tr 
                      key={t.id} 
                      onClick={() => { setSelectedTicket(t); setShowDetailModal(true); }}
                      className="hover:bg-gray-50/50 transition-all cursor-pointer group"
                    >
                      <td className="px-10 py-8 font-black text-[#0D1B3E] text-sm">#{t.ticket_number}</td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#0D1B3E]">{t.student_name}</span>
                          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tight">{t.student_email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#0D1B3E]">{t.title}</span>
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{t.category}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                          t.priority === 'high' ? 'bg-red-50 text-red-600' :
                          t.priority === 'medium' ? 'bg-[#0D1B3E]/5 text-[#0D1B3E]' : 'bg-gray-50 text-gray-400'
                        }`}>{t.priority}</span>
                      </td>
                      <td className="px-8 py-8 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${
                          t.status === 'open' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          t.status === 'in_progress' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                          t.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>{t.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-10 py-8 text-right text-xs font-bold text-gray-300 uppercase">{new Date(t.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-[#0D1B3E]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-white bg-[#0D1B3E] px-3 py-1 rounded-full uppercase tracking-widest">#{selectedTicket.ticket_number}</span>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${selectedTicket.status === 'open' ? 'bg-blue-50 text-blue-500 border-blue-100' : selectedTicket.status === 'in_progress' ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-green-50 text-green-500 border-green-100'}`}>{selectedTicket.status.replace('_', ' ')}</span>
                </div>
                <h3 className="font-black text-3xl text-[#0D1B3E] tracking-tight">{selectedTicket.title}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white text-2xl text-gray-300 transition-all hover:text-red-500">✕</button>
            </div>
            <div className="p-10 overflow-y-auto custom-scrollbar space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <DetailField label="Authorized Student" value={selectedTicket.student_name} subValue={selectedTicket.student_email} icon="👤" />
                <DetailField label="Service Unit" value={selectedTicket.category} icon="🏢" />
                <DetailField label="Urgency Level" value={selectedTicket.priority.toUpperCase()} icon="📶" highlight={selectedTicket.priority === 'high' ? 'text-red-500' : 'text-[#0D1B3E]'} />
                <DetailField label="Registry Timestamp" value={new Date(selectedTicket.created_at).toLocaleString('en-GB')} icon="📅" />
              </div>
              <div className="bg-gray-50 p-8 rounded-[30px] border border-gray-100">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Case Documentation</p>
                <p className="text-sm text-[#0D1B3E] font-medium leading-relaxed whitespace-pre-wrap">{selectedTicket.description || "No formal documentation provided."}</p>
              </div>
              <div className="pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Governance Action: Update Status</p>
                <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
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
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTicket.status === s ? "bg-[#0D1B3E] text-white shadow-xl" : "text-gray-400 hover:text-[#0D1B3E] hover:bg-white"}`}
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

      {showManualModal && <ManualTicketModal onClose={() => setShowManualModal(false)} />}
    </div>
  );
}

function DetailField({ label, value, subValue, icon, highlight = "" }) {
  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-gray-100 shadow-sm">{icon}</div>
      <div className="flex flex-col justify-center">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-sm font-black ${highlight || "text-[#0D1B3E]"}`}>{value}</p>
        {subValue && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{subValue}</p>}
      </div>
    </div>
  );
}
