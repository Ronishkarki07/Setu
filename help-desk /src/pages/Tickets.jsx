import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useLocation } from "react-router-dom";

const API = "http://localhost:3000/api";

/* ── helpers ─────────────────────────────────────────────────────────────────── */
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

const DEPARTMENTS = [
  "Student Service",
  "Admission",
  "Finance",
  "RTE",
  "IT Support",
  "Resource",
  "PAT",
];

const statusClass = (s) => {
  if (s === "open") return "bg-[#DC143C] text-white";
  if (s === "in_progress") return "bg-[#0d1b3e] text-white";
  if (s === "resolved") return "bg-green-500 text-white";
  if (s === "closed") return "bg-gray-500 text-white";
  return "";
};

const statusLabel = (s) => {
  if (s === "open") return "OPEN";
  if (s === "in_progress") return "IN PROGRESS";
  if (s === "resolved") return "RESOLVED";
  if (s === "closed") return "CLOSED";
  return s?.toUpperCase() || "";
};

const statusIcon = (s) => {
  if (s === "open") return { icon: "✳", bg: "bg-red-100" };
  if (s === "in_progress") return { icon: "↻", bg: "bg-blue-100" };
  if (s === "resolved") return { icon: "✔", bg: "bg-green-100" };
  if (s === "closed") return { icon: "🔒", bg: "bg-gray-100" };
  return { icon: "📋", bg: "bg-gray-100" };
};

/* Sidebar moved to src/components/Sidebar.jsx - using shared Sidebar */

// ─── EDIT TICKET MODAL ────────────────────────────────────────────────────────
function EditTicketModal({ ticket, onClose, onSaved }) {
  const [title, setTitle] = useState(ticket.title || "");
  const [dept, setDept] = useState(ticket.category || "");
  const [priority, setPriority] = useState(ticket.priority || "medium");
  const [desc, setDesc] = useState(ticket.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!title || !dept || !desc) {
      setError("Title, department, and description are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/tickets/${ticket.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ title, category: dept, priority, description: desc }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update ticket");
        return;
      }
      onSaved();
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>

        <h2 className="text-xl font-bold text-[#0d2740] mb-1">Edit Ticket</h2>
        <p className="text-xs text-gray-400 mb-4">#{ticket.ticket_number}</p>

        <p className="text-red-500 text-xs min-h-[16px] mb-3">{error || ""}</p>

        <div className="mb-4">
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-1.5">TITLE</label>
          <input
            className="w-full px-4 py-2.5 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 text-sm text-[#0d1b3e] outline-none focus:border-[#DC143C] transition-colors"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-1.5">DEPARTMENT</label>
          <select
            className="w-full px-4 py-2.5 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 text-sm text-[#0d1b3e] outline-none focus:border-[#DC143C] transition-colors appearance-none cursor-pointer"
            value={dept}
            onChange={(e) => { setDept(e.target.value); setError(""); }}
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-1.5">PRIORITY LEVEL</label>
          <div className="flex rounded-lg border-[1.5px] border-gray-200 overflow-hidden">
            {["low", "medium", "high"].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 py-2.5 text-sm border-r border-gray-200 last:border-0 cursor-pointer transition-colors ${
                  priority === p ? "bg-[#0d1b3e] text-white font-bold" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-1.5">DESCRIPTION</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 text-sm text-[#0d1b3e] outline-none focus:border-[#DC143C] transition-colors resize-y min-h-[100px] leading-relaxed"
            value={desc}
            onChange={(e) => { setDesc(e.target.value); setError(""); }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90 shadow-md"
            }`}
            style={loading ? {} : { background: "linear-gradient(135deg, #800000, #0f2a4a)" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TOP NAV ─────────────────────────────────────────────────────────────────
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
      <div className="font-bold text-lg text-gray-800">Student Helpdesk Portal</div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-[#0D1B3E]">{student.name || "Student"}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verified Student</p>
          </div>
          <div className="w-10 h-10 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center text-sm font-bold border border-gray-200 overflow-hidden shadow-sm transition-transform hover:scale-105">
            {student.profile_photo ? (
              <img src={`${API.replace('/api', '')}/${student.profile_photo}`} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── MY TICKETS ───────────────────────────────────────────────────────────────
function MyTickets() {
  const [filter, setFilter] = useState("All Tickets");
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open_count: 0, inprogress_count: 0, resolved_count: 0 });
  const [loading, setLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState(null);

  const filters = ["All Tickets", "Open", "In Progress", "Resolved"];

  const fetchData = () => {
    const token = getToken();
    if (!token) return;
    Promise.all([
      fetch(`${API}/tickets/my-tickets`, { headers: authHeaders() })
        .then((r) => r.json())
        .catch(() => ({ tickets: [] })),
      fetch(`${API}/tickets/stats/overview`, { headers: authHeaders() })
        .then((r) => r.json())
        .catch(() => ({ statistics: {} })),
    ])
      .then(([ticketsData, statsData]) => {
        setTickets(ticketsData.tickets || []);
        const s = statsData.statistics || {};
        setStats({
          total: Number(s.total || 0),
          open_count: Number(s.open_count || 0),
          inprogress_count: Number(s.inprogress_count || 0),
          resolved_count: Number(s.resolved_count || 0),
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = tickets.filter((t) => {
    if (filter === "All Tickets") return true;
    if (filter === "Open") return t.status === "open";
    if (filter === "In Progress") return t.status === "in_progress";
    if (filter === "Resolved") return t.status === "resolved";
    return true;
  });

  const activeCount = stats.open_count + stats.inprogress_count;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // relative time removed to satisfy lint rules; UI shows formatted date only

  return (
    <div className="p-10 pb-16">
      {/* Edit Ticket Modal */}
      {editingTicket && (
        <EditTicketModal
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
          onSaved={() => { setEditingTicket(null); fetchData(); }}
        />
      )}

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-[#8B0000] to-[#6B0000] rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 w-96 h-96 bg-white rounded-full -mr-48 -mt-24"></div>
        <div className="relative z-10">
          <p className="text-sm font-bold tracking-wide mb-2 bg-white/20 w-fit px-3 py-1 rounded">
            STUDENT PORTAL
          </p>
          <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
          <p className="text-white/80">
            You have <span className="font-bold text-white">{activeCount} active</span> tickets requiring your attention today.
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

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100/60 rounded-xl p-1 w-fit">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-sans cursor-pointer transition-all ${
              filter === f
                ? "bg-white text-[#0d2740] font-bold shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      {loading ? (
        <p className="text-gray-500 py-8 text-center">Loading tickets...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🎫</p>
          <p className="font-semibold text-lg text-gray-500">No tickets found</p>
          <p className="text-sm mt-1">
            {filter === "All Tickets"
              ? "Submit your first ticket to get started!"
              : `No ${filter.toLowerCase()} tickets.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((t) => {
            const si = statusIcon(t.status);
            return (
              <div
                key={t.id}
                className="bg-white rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="min-w-[90px] text-left">
                  <p className="text-[11px] text-gray-300 font-sans">{t.ticket_number}</p>
                </div>

                <div className={`w-12 h-12 rounded-xl ${si.bg} flex items-center justify-center text-base flex-shrink-0`}>{si.icon}</div>

                <div className="flex-1">
                  <p className="font-serif font-bold text-lg text-[#0d2740] mb-0.5">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.category}</p>
                </div>

                <div className="flex flex-col items-end min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap ${statusClass(t.status)}`}>{statusLabel(t.status)}</span>
                    {t.status === "open" ? (
                      <button
                        onClick={() => setEditingTicket(t)}
                        title="Edit ticket"
                        className="px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex-shrink-0"
                      >
                        Edit
                      </button>
                    ) : (
                      <span
                        title="Cannot edit — ticket is no longer open"
                        className="px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap bg-gray-200 text-gray-400 flex-shrink-0 cursor-not-allowed"
                      >
                        Edit
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#0d2740] mt-2">{formatDate(t.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SUBMIT TICKET ────────────────────────────────────────────────────────────
function SubmitTicket({ onSubmitted }) {
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState("");
  const [priority, setPriority] = useState("medium");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = (incoming) =>
    setFiles((f) => [...f, ...Array.from(incoming)]);
  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!title || !dept || !desc) {
      setError("Title, department, and description are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", desc);
      formData.append("category", dept);
      formData.append("priority", priority);

      // Attach files
      files.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await fetch(`${API}/tickets/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit ticket");
        return;
      }

      // Success
      setSubmitted(true);
      setTitle("");
      setDept("");
      setPriority("medium");
      setDesc("");
      setFiles([]);

      // Auto-switch to tickets list after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        if (onSubmitted) onSubmitted();
      }, 2500);
    } catch (err) {
      console.error("Submit ticket error:", err);
      setError("Unable to connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = title && dept && desc && !loading;

  return (
    <div className="p-10 pb-16 max-w-3xl">
      {/* Badge */}
      <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1 text-[11px] font-bold tracking-widest text-[#0d1b3e] font-sans">
        ⚡ SUPPORT CENTER
      </span>

      <h1 className="text-4xl font-bold text-[#0d1b3e] mt-3 mb-2">
        Submit Ticket
      </h1>
      <p className="text-sm text-gray-500 font-sans leading-relaxed mb-8 max-w-lg">
        Our dedicated academic support team is here to assist you. Complete the
        form below and we will route your inquiry to the appropriate department.
      </p>

      {/* Success Toast */}
      {submitted && (
        <div className="bg-[#0d1b3e] text-white px-5 py-3.5 rounded-xl mb-5 text-sm font-sans border-l-4 border-[#DC143C]">
          ✓ Ticket submitted successfully! We'll be in touch soon.
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="bg-red-50 text-red-600 px-5 py-3.5 rounded-xl mb-5 text-sm font-sans border-l-4 border-red-500">
          ✕ {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl px-10 py-9 shadow-md mb-6">
        {/* Title */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 font-sans mb-2">
            TITLE
          </label>
          <input
            className="w-full px-4 py-3 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 text-sm text-[#0d1b3e] font-sans outline-none focus:border-[#DC143C] transition-colors"
            placeholder="Brief summary of your issue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Dept + Priority */}
        <div className="flex gap-5 mb-6">
          <div className="flex-1">
            <label className="block text-[11px] font-bold tracking-widest text-gray-400 font-sans mb-2">
              DEPARTMENT
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 text-sm text-[#0d1b3e] font-sans outline-none focus:border-[#DC143C] transition-colors appearance-none cursor-pointer"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-bold tracking-widest text-gray-400 font-sans mb-2">
              PRIORITY LEVEL
            </label>
            <div className="flex rounded-lg border-[1.5px] border-gray-200 overflow-hidden">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-3 text-sm font-sans border-r border-gray-200 last:border-0 cursor-pointer transition-colors ${
                    priority === p
                      ? "bg-[#0d1b3e] text-white font-bold"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 font-sans mb-2">
            DETAILED DESCRIPTION
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 text-sm text-[#0d1b3e] font-sans outline-none focus:border-[#DC143C] transition-colors resize-y min-h-[130px] leading-relaxed"
            placeholder="Please provide as much detail as possible..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        {/* Attachments */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 font-sans mb-2">
            ATTACHMENTS
          </label>
          <div
            className={`border-2 border-dashed rounded-xl py-9 px-5 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-[#DC143C] bg-red-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => document.getElementById("fileIn").click()}
          >
            <input
              id="fileIn"
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="text-3xl mb-2">📄</div>
            <p className="font-semibold text-sm text-[#0d1b3e] font-sans">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400 font-sans mt-1">
              PDF, PNG, JPG (Max 5MB)
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-100 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-[#0d1b3e] font-sans">
                    📎 {f.name}
                  </span>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-[#DC143C] font-bold text-sm cursor-pointer hover:opacity-70 transition-opacity bg-transparent border-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`px-8 py-3.5 rounded-xl bg-[#DC143C] text-white font-bold text-[15px] font-sans transition-colors ${
            canSubmit
              ? "cursor-pointer hover:bg-[#a50e2d]"
              : "opacity-60 cursor-not-allowed"
          }`}
        >
          {loading ? "Submitting..." : "Submit Ticket  ➜"}
        </button>
      </div>

      {/* Help Banner */}
      <div className="bg-white rounded-2xl px-6 py-5 flex items-start gap-4 shadow-sm">
        <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          💬
        </div>
        <div>
          <p className="font-bold text-[15px] text-[#0d1b3e] mb-1">
            Need immediate assistance?
          </p>
          <p className="text-sm text-gray-500 font-sans">
            Check our Knowledge Base for quick answers to common questions about
            admissions, enrollment, and technical troubleshooting before
            submitting a ticket.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function Tickets() {
  const [page, setPage] = useState("tickets");
  const location = useLocation();

   useEffect(() => {
    if (location.state?.openNewTicket) {
      setPage("submit");
    } else {
      setPage("tickets");
    }
  }, [location.key]);

  const handleSubmitted = () => {
    setPage("tickets");
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Sidebar onNewTicket={() => setPage("submit")} />
      <main className="ml-56 flex flex-col min-h-screen">
        <TopNav page={page} setPage={setPage} />
        {page === "tickets" && <MyTickets setPage={setPage} />}
        {page === "submit" && <SubmitTicket onSubmitted={handleSubmitted} />}
      </main>
    </div>
  );
}
