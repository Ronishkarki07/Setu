import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

// Base API URL for backend communication
const API = "http://localhost:3000/api";

// Retrieve authentication token from local storage
function getToken() {
  return localStorage.getItem("token");
}

// Safely retrieve logged-in student data
function getStudent() {
  try {
    return JSON.parse(localStorage.getItem("student") || "{}");
  } catch {
    return {};
  }
}

// Standard headers for authenticated API requests
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// Predefined departments for ticket categorization
const DEPARTMENTS = [
  "Student Service",
  "Admission",
  "Finance",
  "RTE",
  "IT Support",
  "Resource",
];

// Converts backend status to UI styling
const statusClass = (s) => {
  if (s === "open") return "bg-[#DC143C] text-white";
  if (s === "in_progress") return "bg-[#0d1b3e] text-white";
  if (s === "resolved") return "bg-green-500 text-white";
  if (s === "closed") return "bg-gray-500 text-white";
  return "";
};

// Converts backend status into readable labels
const statusLabel = (s) => {
  if (s === "open") return "OPEN";
  if (s === "in_progress") return "IN PROGRESS";
  if (s === "resolved") return "RESOLVED";
  if (s === "closed") return "CLOSED";
  return s?.toUpperCase() || "";
};

// Returns icon and background color for each status
const statusIcon = (s) => {
  if (s === "open") return { icon: "✳", bg: "bg-red-100" };
  if (s === "in_progress") return { icon: "↻", bg: "bg-blue-100" };
  if (s === "resolved") return { icon: "✔", bg: "bg-green-100" };
  if (s === "closed") return { icon: "🔒", bg: "bg-gray-100" };
  return { icon: "📋", bg: "bg-gray-100" };
};

// Top navigation bar displaying system title and user avatar
function TopNav() {
  const student = getStudent();

  // Generate initials from student name
  const initials = (student.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex justify-between items-center px-8 h-16 bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="font-bold text-lg text-gray-800">
        Student Helpdesk Portal
      </div>

      <div className="flex items-center gap-4">
        {/* Notification icon (UI only) */}
        <button className="p-2 hover:bg-gray-100 rounded-lg">🔔</button>

        {/* User avatar with initials */}
        <div className="w-10 h-10 bg-[#8B0000] text-white rounded-full flex items-center justify-center text-sm font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}

// Component for displaying and filtering tickets
function MyTickets() {
  const [filter, setFilter] = useState("All Tickets");
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open_count: 0,
    inprogress_count: 0,
    resolved_count: 0,
  });
  const [loading, setLoading] = useState(true);

  const filters = ["All Tickets", "Open", "In Progress", "Resolved"];

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Fetch tickets and statistics from backend API
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

  // Filter tickets based on selected category
  const filtered = tickets.filter((t) => {
    if (filter === "All Tickets") return true;
    if (filter === "Open") return t.status === "open";
    if (filter === "In Progress") return t.status === "in_progress";
    if (filter === "Resolved") return t.status === "resolved";
    return true;
  });

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-10 pb-16">
      <h1 className="text-5xl font-serif font-bold text-[#0d2740] mb-3">
        My Tickets
      </h1>

      <p className="text-gray-600 mb-8">
        Track and manage your support requests.
      </p>

      {/* Filter tabs for ticket status */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === f
                ? "bg-white font-bold shadow-sm"
                : "text-gray-500"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Ticket display logic */}
      {loading ? (
        <p className="text-center text-gray-500">Loading tickets...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400">No tickets found</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((t) => {
            const si = statusIcon(t.status);

            return (
              <div
                key={t.id}
                className="bg-white rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm"
              >
                {/* Status icon */}
                <div className={`w-12 h-12 ${si.bg} rounded-xl flex items-center justify-center`}>
                  {si.icon}
                </div>

                {/* Ticket details */}
                <div className="flex-1">
                  <p className="font-bold">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.category}</p>
                </div>

                {/* Status and date */}
                <div className="text-right">
                  <p className="font-semibold">{statusLabel(t.status)}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(t.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Ticket submission form component
function SubmitTicket({ onSubmitted }) {
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState("");
  const [priority, setPriority] = useState("medium");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Handle file attachments
  const handleFiles = (incoming) =>
    setFiles((f) => [...f, ...Array.from(incoming)]);

  // Submit ticket to backend
  const handleSubmit = async () => {
    if (!title || !dept || !desc) {
      setError("Fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", desc);
      formData.append("category", dept);
      formData.append("priority", priority);

      files.forEach((file) =>
        formData.append("attachments", file)
      );

      const res = await fetch(`${API}/tickets/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit ticket");
        return;
      }

      // Show success message
      setSubmitted(true);

      // Reset form fields
      setTitle("");
      setDept("");
      setDesc("");
      setFiles([]);

      setTimeout(() => {
        setSubmitted(false);
        onSubmitted?.();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Submit Ticket</h1>

      {submitted && (
        <p className="mb-4 text-green-600">Ticket submitted successfully</p>
      )}

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Ticket title input */}
      <input
        className="w-full p-3 mb-3 bg-gray-100 rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-red-600 text-white px-6 py-3 rounded"
      >
        {loading ? "Submitting..." : "Submit Ticket"}
      </button>
    </div>
  );
}

// Main tickets page controlling navigation between views
export default function Tickets() {
  const [page, setPage] = useState("tickets");

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar navigation */}
      <Sidebar onNewTicket={() => setPage("submit")} />

      <main className="ml-56">
        <TopNav />

        {/* Conditional rendering of pages */}
        {page === "tickets" && <MyTickets />}
        {page === "submit" && (
          <SubmitTicket onSubmitted={() => setPage("tickets")} />
        )}
      </main>
    </div>
  );
}