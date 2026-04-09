import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";

/* ---------------- DATA ---------------- */
const TICKETS = [
  {
    id: "#TIC-8492",
    icon: "✳",
    iconBg: "bg-red-100",
    title: "Course Enrollment Error - CS302",
    dept: "Registrar Office • Technical Support",
    status: "OPEN",
    date: "Oct 24, 2023",
    ago: "2 HOURS AGO",
  },
  {
    id: "#TIC-8471",
    icon: "↻",
    iconBg: "bg-blue-100",
    title: "Scholarship Disbursement Delay",
    dept: "Financial Aid Office",
    status: "IN PROGRESS",
    date: "Oct 22, 2023",
    ago: "2 DAYS AGO",
  },
  {
    id: "#TIC-8405",
    icon: "✔",
    iconBg: "bg-green-100",
    title: "Library Access Card Activation",
    dept: "Campus Services",
    status: "RESOLVED",
    date: "Oct 18, 2023",
    ago: "COMPLETED",
  },
];

/* ---------------- STATUS STYLE ---------------- */
const statusClass = (s) => {
  if (s === "OPEN") return "bg-[#ff5c5c] text-white";
  if (s === "IN PROGRESS") return "bg-[#0d1b3e] text-white";
  if (s === "RESOLVED") return "bg-green-400 text-white";
};

/* ---------------- DEPARTMENTS ---------------- */
const DEPARTMENTS = [
  "Admissions",
  "Enrollment",
  "Financial Aid",
  "IT Support",
  "Registrar Office",
  "Campus Services",
];

/* ---------------- MY TICKETS ---------------- */
function MyTickets() {
  const [filter, setFilter] = useState("All Tickets");

  const filters = ["All Tickets", "Open", "In Progress", "Resolved"];

  const filtered = TICKETS.filter((t) => {
    if (filter === "All Tickets") return true;
    if (filter === "Open") return t.status === "OPEN";
    if (filter === "In Progress") return t.status === "IN PROGRESS";
    if (filter === "Resolved") return t.status === "RESOLVED";
  });

  return (
    <div className="p-10">
      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
      <p className="text-gray-500 mb-8 max-w-xl">
        Track and manage your academic support requests. Our curators are here to ensure your educational journey remains fluid.
      </p>

      {/* FILTER */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === f ? "bg-white shadow font-bold" : "text-gray-400"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl px-6 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs text-gray-400 min-w-[90px]">{t.id}</p>

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.iconBg}`}>
              {t.icon}
            </div>

            <div className="flex-1">
              <p className="font-bold text-[#0d1b3e]">{t.title}</p>
              <p className="text-sm text-gray-400">{t.dept}</p>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass(t.status)}`}>
              {t.status}
            </span>

            <div className="text-right min-w-[120px]">
              <p className="text-sm font-semibold">{t.date}</p>
              <p className="text-xs text-gray-400">{t.ago}</p>
            </div>

            <span className="text-gray-300 text-xl">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmitTicket() {
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);

  /* FILE HANDLERS */
  const handleFiles = (newFiles) => {
    setFiles([...files, ...Array.from(newFiles)]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = () => {
    if (!title || !dept || !desc) return alert("Please fill all fields");

    console.log({
      title,
      dept,
      priority,
      desc,
      attachments: files,
    });

    alert("Ticket Submitted ✅");

    setTitle("");
    setDept("");
    setDesc("");
    setPriority("Medium");
    setFiles([]);
  };

  return (
    <div className="p-10">
      {/* PAGE HEADER */}
      <p className="text-sm font-semibold text-[#0d1b3e] mb-2 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
        SUPPORT CENTER
      </p>

      <h1 className="text-4xl font-bold mb-2">Submit Ticket</h1>
      <p className="text-gray-500 mb-8 max-w-xl">
        Our dedicated academic support team is here to assist you. Complete the form
        below and we will route your inquiry to the appropriate department.
      </p>

      {/* FORM */}
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl">
        
        {/* Title */}
        <div className="mb-6">
          <p className="font-semibold text-sm mb-2">TITLE</p>
          <input
            placeholder="Brief summary of your issue"
            className="w-full p-4 border rounded-xl bg-gray-50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Department + Priority */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="font-semibold text-sm mb-2">DEPARTMENT</p>
            <select
              className="w-full p-4 border rounded-xl bg-gray-50"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="font-semibold text-sm mb-2">PRIORITY LEVEL</p>
            <div className="flex gap-2">
              {["Low", "Medium", "High"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setPriority(lvl)}
                  className={`flex-1 py-3 rounded-xl border text-sm 
                    ${priority === lvl ? "bg-[#0d1b3e] text-white" : "bg-gray-50"}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="font-semibold text-sm mb-2">DETAILED DESCRIPTION</p>
          <textarea
            placeholder="Please provide as much detail as possible..."
            className="w-full p-4 border rounded-xl bg-gray-50 h-40"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        {/* Attachments */}
        <div className="mb-8">
          <p className="font-semibold text-sm mb-2">ATTACHMENTS</p>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("fileInput").click()}
            className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
          >
            <span className="text-3xl mb-2">📎</span>
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG (Max 10MB)</p>

            <input
              id="fileInput"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* File Preview */}
          {files.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded-xl border">
              <p className="text-sm font-semibold mb-2">Uploaded Files:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center gap-2">
                    📄 {file.name}
                    <span className="text-gray-400">
                      ({Math.round(file.size / 1024)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="bg-green-400 hover:bg-green-500 text-black font-semibold px-6 py-3 rounded-xl transition"
        >
          Submit Ticket ➤
        </button>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 mt-8 p-6 rounded-xl max-w-3xl flex gap-3">
        <span className="text-xl">💡</span>
        <div>
          <p className="font-semibold">Need immediate assistance?</p>
          <p className="text-gray-500 text-sm">
            Check our Knowledge Base for quick answers.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MAIN ---------------- */
export default function Tickets() {
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get("new");

  return <Layout>{isNew ? <SubmitTicket /> : <MyTickets />}</Layout>;
}