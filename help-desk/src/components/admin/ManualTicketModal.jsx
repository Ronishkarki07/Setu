import React, { useState, useEffect } from "react";

const API = "http://localhost:3000/api";

export default function ManualTicketModal({ onClose }) {
  const [studentEmail, setStudentEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("medium");
  const [attachments, setAttachments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API}/admin/departments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDepartments(data);
        if (data.length > 0) setDepartment(data[0].name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeFile = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!department) {
        setError("Please select a department");
        return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("studentEmail", studentEmail);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", department);
    formData.append("priority", priority);
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      const res = await fetch(`${API}/tickets/manual`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        alert("Manual ticket created successfully!");
        onClose();
      } else {
        setError(data.error || "Failed to create ticket");
      }
    } catch (err) {
      console.error("Manual ticket error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D1B3E]/40 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-2xl p-12 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-[#0D1B3E] tracking-tight">Manual Ticket Entry</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-2">Institutional Support Management</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 transition-colors">✕</button>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-black uppercase tracking-widest rounded-r-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Student Official Email</label>
                <input 
                required
                type="email"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-bold"
                placeholder="e.g. student@bicnepal.edu.np"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Subject / Title</label>
                <input 
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-bold"
                placeholder="Brief summary of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Department</label>
              <select 
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-black uppercase tracking-wider"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Priority Level</label>
              <div className="flex bg-gray-50 p-1 rounded-2xl gap-1">
                {["low", "medium", "high"].map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            priority === p 
                            ? (p === 'high' ? 'bg-red-500 text-white shadow-lg' : p === 'medium' ? 'bg-[#0D1B3E] text-white shadow-lg' : 'bg-gray-400 text-white shadow-lg')
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        {p}
                    </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Detailed Description</label>
            <textarea 
              required
              rows="5"
              className="w-full px-6 py-4 rounded-[30px] bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium leading-relaxed resize-none"
              placeholder="Provide full context for the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Supporting Documentation (Optional)</label>
            <div className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-[30px] p-8 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all">
                <input 
                    type="file" 
                    id="manual-file-upload" 
                    className="hidden" 
                    multiple 
                    onChange={handleFileChange}
                />
                <label htmlFor="manual-file-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📎</div>
                    <p className="text-xs font-black text-[#0D1B3E] uppercase tracking-widest mb-1">Upload Files or Photos</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Drag and drop or click to browse</p>
                </label>
            </div>
            
            {attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                    {attachments.map((file, index) => (
                        <div key={index} className="px-4 py-2 bg-white border border-gray-100 rounded-xl flex items-center gap-3 shadow-sm group">
                            <span className="text-[10px] font-bold text-gray-600 truncate max-w-[150px]">{file.name}</span>
                            <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500 transition-colors font-black">✕</button>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={onClose} 
              className="flex-1 py-4 text-xs font-black text-gray-400 hover:bg-gray-50 rounded-2xl uppercase tracking-widest transition-all"
            >
              Discard Entry
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-4 text-xs font-black bg-[#0D1B3E] text-white rounded-2xl hover:bg-black uppercase tracking-widest shadow-2xl shadow-blue-900/30 transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Authorize & Log Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
