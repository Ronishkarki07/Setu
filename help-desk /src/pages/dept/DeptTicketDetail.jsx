import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DeptSidebar from "../../components/DeptSidebar";

const API = "http://localhost:3000/api";
const getDeptHead = () => { try { return JSON.parse(localStorage.getItem("deptHead") || "{}"); } catch { return {}; } };
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("deptToken")}` });

const STATUS_OPTS = ["open","in_progress","resolved","closed"];
const STATUS_STYLES = {
  open:        "bg-blue-100 text-blue-600",
  in_progress: "bg-amber-100 text-amber-600",
  resolved:    "bg-green-100 text-green-600",
  closed:      "bg-gray-100 text-gray-500",
};
const PRI_STYLES = {
  high:   "bg-red-100 text-red-600",
  medium: "bg-gray-100 text-gray-600",
  low:    "bg-green-100 text-green-600",
};

export default function DeptTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const head = getDeptHead();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const bottomRef = useRef(null);

  const fetchTicket = () => {
    fetch(`${API}/dept/tickets/${id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setTicket(d.ticket); setNewStatus(d.ticket?.status || "open"); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket?.comments?.length]);

  const handleStatusUpdate = async () => {
    if (newStatus === ticket?.status) return;
    setUpdating(true);
    try {
      await fetch(`${API}/dept/tickets/${id}/status`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status: newStatus })
      });
      fetchTicket();
    } finally { setUpdating(false); }
  };

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await fetch(`${API}/dept/tickets/${id}/comments`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ message: reply.trim() })
      });
      setReply("");
      fetchTicket();
    } finally { setSending(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f6fa] flex">
      <DeptSidebar />
      <main className="ml-56 flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </main>
    </div>
  );

  if (!ticket) return (
    <div className="min-h-screen bg-[#f5f6fa] flex">
      <DeptSidebar />
      <main className="ml-56 flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-gray-400 text-lg">Ticket not found</p>
        <button onClick={() => navigate("/dept/tickets")} className="text-blue-500 font-semibold">← Back to Queue</button>
      </main>
    </div>
  );

  const sc = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;
  const pc = PRI_STYLES[ticket.priority] || PRI_STYLES.medium;
  const slaHours = Math.max(0, 48 - Math.round((Date.now() - new Date(ticket.created_at).getTime()) / 3600000));

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <DeptSidebar />
      <main className="ml-56 min-h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-auto p-8 space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/dept/tickets")} className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm font-semibold transition-colors">
                ← <span>Ticket Details</span>
              </button>
            </div>

            {/* Title & badges */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">TICKET #{ticket.ticket_number}</p>
                <h1 className="text-2xl font-black text-gray-900">{ticket.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${sc}`}>⟳ {ticket.status.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}</span>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${pc}`}>↑ {ticket.priority.replace(/\b\w/g,c=>c.toUpperCase())} Priority</span>
              </div>
            </div>

            {/* Description card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-3">Problem Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>

              {ticket.attachments?.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Attachments ({ticket.attachments.length})</p>
                  <div className="flex flex-wrap gap-3">
                    {ticket.attachments.map(a => (
                      <a key={a.id} href={`${API.replace("/api","")}/uploads/tickets/${a.attachment_path.split("/").pop()}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                        <span className="text-lg">📎</span>
                        <div>
                          <p className="font-bold">{a.original_filename}</p>
                          <p className="text-gray-400 text-[10px]">Attachment ↓</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Activity Stream */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">Activity Stream</h2>
                <span className="text-xs text-gray-400">{(ticket.comments||[]).length} Total Messages</span>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {(ticket.comments||[]).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No messages yet. Start the conversation below.</p>
                ) : (
                  (ticket.comments||[]).map(c => {
                    const isStaff = c.author_role === "department_head";
                    return (
                      <div key={c.id} className={`flex gap-3 ${isStaff ? "flex-row-reverse" : ""}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isStaff ? "bg-[#0d1b3e] text-white" : "bg-gray-200 text-gray-600"}`}>
                          {(c.author_name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <div className={`max-w-[70%] ${isStaff ? "items-end" : "items-start"} flex flex-col`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-700">{c.author_name} ({c.author_role === "department_head" ? "Staff" : "Student"})</span>
                            <span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
                          </div>
                          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isStaff ? "bg-[#0d1b3e] text-white rounded-tr-sm" : "bg-gray-100 text-gray-700 rounded-tl-sm"}`}>
                            {c.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Reply box */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your response to the student..."
                  rows={3}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-300 resize-none transition-colors"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-3 text-gray-400">
                    <button className="hover:text-gray-600 transition-colors">📎</button>
                    <button className="hover:text-gray-600 transition-colors">😊</button>
                  </div>
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !reply.trim()}
                    className="flex items-center gap-2 bg-[#0d1b3e] text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-[#1a2f5e] disabled:opacity-50 transition-all"
                  >
                    {sending ? "Sending..." : "Send Reply ➤"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-64 border-l border-gray-200 bg-white overflow-auto p-5 space-y-5 shrink-0">
            {/* Student Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">👤</span>
                <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest">Student Information</h3>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center font-black text-sm">
                  {(ticket.student_name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{ticket.student_name}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">ID #ST-{String(ticket.student_id).padStart(5,"0")}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div><p className="text-[10px] font-black text-gray-400 uppercase">Email</p><p className="text-xs text-gray-700 break-all">{ticket.student_email}</p></div>
                <div><p className="text-[10px] font-black text-gray-400 uppercase">Department</p><p className="text-xs text-gray-700">{ticket.category}</p></div>
                {ticket.student_level && <div><p className="text-[10px] font-black text-gray-400 uppercase">Academic Year</p><p className="text-xs text-gray-700">{ticket.student_level}</p></div>}
              </div>
            </div>

            {/* Ticket Actions */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">⚙️</span>
                <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest">Ticket Actions</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Update Status</p>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none"
                  >
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                  </select>
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === ticket.status}
                  className="w-full py-2.5 bg-[#0d1b3e] text-white text-xs font-black rounded-xl hover:bg-[#1a2f5e] disabled:opacity-40 transition-all"
                >
                  {updating ? "Updating..." : "Update Information"}
                </button>
                <button className="w-full py-2.5 bg-red-50 text-red-600 text-xs font-black rounded-xl hover:bg-red-100 transition-all border border-red-100">
                  ⚡ Escalate Ticket
                </button>
                <button className="w-full py-2.5 bg-gray-50 text-gray-600 text-xs font-black rounded-xl hover:bg-gray-100 transition-all border border-gray-100">
                  👤 Reassign Staff
                </button>
              </div>
            </div>

            {/* SLA Status */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-black text-gray-400 uppercase">SLA Status</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${slaHours > 12 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                  {slaHours > 12 ? "HEALTHY" : "AT RISK"}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full mb-1">
                <div className={`h-full rounded-full ${slaHours > 12 ? "bg-green-500" : "bg-red-400"}`} style={{width:`${Math.min((slaHours/48)*100,100)}%`}}/>
              </div>
              <p className="text-[10px] text-gray-400">{slaHours}h remaining until resolution target</p>
            </div>

            {/* Internal Note */}
            <div className="border-t border-gray-100 pt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">⚑ Internal Team Note</p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Ticket opened {new Date(ticket.created_at).toLocaleDateString()}. Category: {ticket.category}. Keep student informed of progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
