import React, { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import ManualTicketModal from "../../components/admin/ManualTicketModal";

const API = "http://localhost:3000/api";

export default function AdminAnnouncements() {
  const [showManualModal, setShowManualModal] = useState(false);
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
  
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("all");
  const [content, setContent] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({ title, audience, content, isEmergency })
      });

      if (res.ok) {
        setMessage("Announcement published successfully!");
        setTitle("");
        setContent("");
        setIsEmergency(false);
      } else {
        setMessage("Failed to publish announcement.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <AdminSidebar setShowManualModal={setShowManualModal} />
      
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-sm font-black text-[#0D1B3E] uppercase tracking-widest">SETU ADMIN PORTAL</h1>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-[#0D1B3E]">❓</button>
            <div className="flex items-center gap-3 ml-4">
              <div className="text-right">
                <p className="text-sm font-bold text-[#0D1B3E]">{adminData.name || "System Administrator"}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">SENIOR CONTROLLER</p>
              </div>
              <div className="w-10 h-10 bg-[#0D1B3E] text-white rounded-full flex items-center justify-center text-sm font-bold border border-gray-200 overflow-hidden shadow-sm">
                {(adminData.name || "System Administrator").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 max-w-6xl mx-auto w-full">
          <div className="mb-12">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Announcements / Create New</p>
            <h2 className="text-4xl font-black text-[#0D1B3E] tracking-tight mb-4">Broadcast Institutional Updates</h2>
            <p className="text-gray-400 font-medium max-w-2xl">Craft intentional messages for the campus community. Use asymmetric layouts and tonal layering to ensure high visibility without visual clutter.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Editor Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
                <form onSubmit={handlePublish} className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Announcement Title</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium"
                      placeholder="e.g. Scheduled Maintenance: Student Portal"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target Audience</label>
                    <select 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-bold"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                    >
                      <option value="all">All Institutional Members</option>
                      <option value="students">Students Only</option>
                      <option value="staff">Staff & Faculty Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Rich Text Description</label>
                    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
                        <div className="flex gap-4 p-4 border-b border-gray-50 bg-gray-50/50 text-gray-400 text-xs">
                            <span className="font-bold cursor-pointer hover:text-black">B</span>
                            <span className="italic cursor-pointer hover:text-black">I</span>
                            <span className="cursor-pointer hover:text-black">🔗</span>
                            <span className="cursor-pointer hover:text-black">🖼️</span>
                        </div>
                        <textarea 
                          required
                          rows="10"
                          className="w-full p-6 outline-none text-gray-700 leading-relaxed resize-none"
                          placeholder="Detailed information goes here..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button type="button" className="flex-1 px-8 py-4 bg-gray-50 text-gray-400 font-black text-xs rounded-2xl hover:bg-gray-100 uppercase tracking-widest transition-all">Preview Draft</button>
                    <button type="button" className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 font-black text-xs rounded-2xl hover:bg-gray-200 uppercase tracking-widest transition-all">Save as Draft</button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-8 py-4 bg-[#0D1B3E] text-white font-black text-xs rounded-2xl hover:bg-black uppercase tracking-widest shadow-2xl shadow-blue-900/30 transition-all"
                    >
                      {loading ? "Publishing..." : "Publish Announcement"}
                    </button>
                  </div>
                  {message && <p className={`text-center text-sm font-bold ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
                </form>
              </div>
            </div>

            {/* Sidebar Config Section */}
            <div className="space-y-8">
              <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-6">Live Display Context</h3>
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-[#0D1B3E] to-blue-900 -mx-6 -mt-6 mb-6 p-6 flex flex-col justify-end">
                        <span className="bg-green-400 text-[#0D1B3E] text-[8px] font-black px-2 py-0.5 rounded w-fit mb-2 uppercase">Emergency</span>
                        <p className="text-white text-[10px] font-bold opacity-80">Posted 2 minutes ago</p>
                    </div>
                    <h4 className="text-xl font-black text-[#0D1B3E] mb-2 leading-tight">Campus Portal Upgrade Underway</h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-6">Our technical team is currently deploying Version 4.2 of the...</p>
                    <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[8px] font-bold text-blue-600 border border-white">JD</div>
                            <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-[8px] font-bold text-red-600 border border-white">AS</div>
                        </div>
                        <span className="text-[10px] font-black text-[#0D1B3E] cursor-pointer group">Read Announcement <span className="transition-transform group-hover:translate-x-1 inline-block">→</span></span>
                    </div>
                </div>
              </div>

              <div className="bg-[#F9FAFB] rounded-[40px] p-10 space-y-6">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Announcement Configuration</h3>
                <div className="space-y-4">
                    <Toggle label="Email Notification" defaultChecked />
                    <Toggle label="Push to Mobile App" defaultChecked />
                    <Toggle label="Pin to Top of Feed" />
                    <Toggle 
                      label="Emergency Broadcast" 
                      checked={isEmergency} 
                      onChange={(e) => setIsEmergency(e.target.checked)} 
                      color="bg-red-500"
                    />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showManualModal && <ManualTicketModal onClose={() => setShowManualModal(false)} />}
    </div>
  );
}

function Toggle({ label, checked, onChange, defaultChecked, color = "bg-green-500" }) {
    const [isChecked, setIsChecked] = useState(defaultChecked || false);
    const effectiveChecked = checked !== undefined ? checked : isChecked;
    const effectiveOnChange = onChange || ((e) => setIsChecked(e.target.checked));

    return (
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={effectiveChecked} onChange={effectiveOnChange} />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:${color}`}></div>
            </label>
        </div>
    );
}
