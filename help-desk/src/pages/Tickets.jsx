import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    navigate("/");
  };

  return (
    <aside className="w-56 bg-[#0d1b3e] flex flex-col min-h-screen flex-shrink-0">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-[#DC143C] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          AN
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">
            Setu
          </div>
          <div className="text-white/40 text-[9px] tracking-widest mt-0.5">
            ACADEMIC AUTHORITY
          </div>
        </div>
      </div>

      <nav className="p-3 flex-1">
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/60 text-sm cursor-pointer mb-1 hover:text-white transition-colors"
        >
          <span className="w-5 text-center">⊞</span> Dashboard
        </div>
        <div
          onClick={() => setPage("tickets")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm cursor-pointer mb-1 transition-colors ${
            page === "tickets"
              ? "bg-[#7a3f5a] text-white border-l-[4px] border-[#DC143C]"
              : "text-white/60 hover:text-white"
          }`}
        >
          <span className="w-5 text-center">🎫</span> My Tickets
        </div>
        <button
          onClick={() => setPage("submit")}
          className="mt-4 w-full py-3 rounded-xl bg-[#DC143C] text-white font-bold text-sm cursor-pointer hover:bg-[#a50e2d]"
        >
          + New Ticket
        </button>
      </nav>

      <div className="px-3 pb-3 border-t border-white/10 pt-4">
        <div 
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-white/60 text-sm cursor-pointer hover:text-white/90 transition-colors"
        >
          ⚙ Settings
        </div>
        <div
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[#DC143C] text-sm cursor-pointer hover:opacity-80 transition-opacity"
        >
          → Sign Out
        </div>
      </div>
    </aside>
  );
}

// ─── TOP NAV ─────────────────────────────────────────────────────────────────
function TopNav({ page, setPage }) {
  const student = getStudent();
  const initials = (student.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex items-center justify-between px-8 h-14 bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="flex gap-7">
        <span className="text-gray-400 text-sm cursor-pointer hover:text-gray-600 transition-colors">
          Dashboard
        </span>
        <span className="text-[#0d1b3e] font-bold text-sm cursor-pointer border-b-2 border-[#DC143C] pb-0.5">
          Tickets
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 w-48">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            className="bg-transparent outline-none text-sm text-[#0d1b3e] w-full placeholder-gray-400"
            placeholder="Search ticekts"
          />
        </div>
        <div className="w-9 h-9 rounded-full bg-[#0d1b3e] text-white flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}

// ─── MY TICKETS ───────────────────────────────────────────────────────────────
function MyTickets({ setPage }) {
  const [filter, setFilter] = useState("All Tickets");
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open_count: 0, inprogress_count: 0, resolved_count: 0 });
  const [loading, setLoading] = useState(true);

  const filters = ["All Tickets", "Open", "In Progress", "Resolved"];

  useEffect(() => {
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

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "JUST NOW";
    if (hours < 24) return `${hours} HOUR${hours > 1 ? "S" : ""} AGO`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} DAY${days > 1 ? "S" : ""} AGO`;
    return "COMPLETED";
  };

  return (
    <div className="p-10 pb-16">
      <h1 className="text-4xl font-bold text-[#0d1b3e] mb-2">My Tickets</h1>
      <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-2xl">
        Track and manage your academic support requests. Our curators are here
        to ensure your educational journey remains fluid.
      </p>

      {/* Stats */}
      <div className="flex gap-4 mb-8">
        {[
          { icon: "📋", bg: "bg-blue-100", value: String(activeCount).padStart(2, "0"), label: "ACTIVE TICKETS", val: "text-[#0d1b3e]" },
          { icon: "✔", bg: "bg-green-100", value: String(stats.resolved_count).padStart(2, "0"), label: "RESOLVED", val: "text-[#0d1b3e]" },
          { icon: "!", bg: "bg-red-100", value: String(stats.open_count).padStart(2, "0"), label: "REQUIRES ACTION", val: "text-[#DC143C]" },
        ].map((st) => (
          <div key={st.label} className="flex-1 bg-white rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${st.bg} flex items-center justify-center text-lg flex-shrink-0`}>
              {st.icon}
            </div>
            <div>
              <p className={`text-3xl font-bold ${st.val}`}>{st.value}</p>
              <p className="text-[11px] text-gray-400 tracking-widest">
                {st.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5 bg-blue-100/60 rounded-xl p-1 w-fit">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-all ${
              filter === f
                ? "bg-white text-[#0d1b3e] font-bold shadow-sm"
                : "text-gray-400 hover:text-gray-600"
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
                className="bg-white rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <p className="text-xs text-gray-400 min-w-[80px]">
                  {t.ticket_number}
                </p>
                <div className={`w-10 h-10 rounded-xl ${si.bg} flex items-center justify-center text-base flex-shrink-0`}>
                  {si.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-[#0d1b3e] mb-0.5">
                    {t.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t.category}
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${statusClass(t.status)}`}>
                  {statusLabel(t.status)}
                </span>
                <div className="text-right min-w-[110px]">
                  <p className="text-sm font-semibold text-[#0d1b3e]">
                    {formatDate(t.created_at)}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {timeAgo(t.created_at)}
                  </p>
                </div>
                <span className="text-gray-300 text-xl ml-2">›</span>
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
      <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1 text-[11px] font-bold tracking-widest text-[#0d1b3e]">
        ⚡ SUPPORT CENTER
      </span>

      <h1 className="text-4xl font-bold text-[#0d1b3e] mt-3 mb-2">
        Submit Ticket
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-lg">
        Our dedicated academic support team is here to assist you. Complete the
        form below and we will route your inquiry to the appropriate department.
      </p>

      {/* Success Toast */}
      {submitted && (
        <div className="bg-[#0d1b3e] text-white px-5 py-3.5 rounded-xl mb-5 text-sm border-l-4 border-[#DC143C]">
          ✓ Ticket submitted successfully! We'll be in touch soon.
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="bg-red-50 text-red-600 px-5 py-3.5 rounded-xl mb-5 text-sm border-l-4 border-red-500">
          ✕ {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl px-10 py-9 shadow-md mb-6">
        {/* Title */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-2">
            TITLE
          </label>
          <input
            className="w-full px-4 py-3 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 text-sm text-[#0d1b3e] outline-none focus:border-[#DC143C] transition-colors"
            placeholder="Brief summary of your issue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Dept + Priority */}
        <div className="flex gap-5 mb-6">
          <div className="flex-1">
            <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-2">
              DEPARTMENT
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 text-sm text-[#0d1b3e] outline-none focus:border-[#DC143C] transition-colors appearance-none cursor-pointer"
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
            <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-2">
              PRIORITY LEVEL
            </label>
            <div className="flex rounded-lg border-[1.5px] border-gray-200 overflow-hidden">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-3 text-sm border-r border-gray-200 last:border-0 cursor-pointer transition-colors ${
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
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-2">
            DETAILED DESCRIPTION
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 text-sm text-[#0d1b3e] outline-none focus:border-[#DC143C] transition-colors resize-y min-h-[130px] leading-relaxed"
            placeholder="Please provide as much detail as possible..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        {/* Attachments */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 mb-2">
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

  // When a ticket is successfully submitted, switch back to tickets list
  const handleSubmitted = () => {
    setPage("tickets");
  };

  return (
    <div className="flex min-h-screen bg-[#f0f2f7] text-[#0d1b3e]">
      <Sidebar page={page} setPage={setPage} />
      <main className="flex-1 flex flex-col min-h-screen">
        <TopNav page={page} setPage={setPage} />
        {page === "tickets" && <MyTickets setPage={setPage} />}
        {page === "submit" && <SubmitTicket onSubmitted={handleSubmitted} />}
      </main>
    </div>
  );
}