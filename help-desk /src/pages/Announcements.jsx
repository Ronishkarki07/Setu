import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

const API = "http://localhost:3000/api";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API}/announcements`);
      const data = await res.json();
      if (res.ok) {
        // Filter for students or all
        const filtered = data.filter(a => a.audience === 'all' || a.audience === 'students');
        setAnnouncements(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const student = JSON.parse(localStorage.getItem("student") || "{}");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <TopNav title="Announcements" />

        <div className="p-12 max-w-5xl mx-auto w-full">
          <div className="mb-12">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Institutional Updates / Feed</p>
            <h2 className="text-4xl font-black text-[#0D1B3E] tracking-tight mb-4">Campus Announcements</h2>
            <p className="text-gray-400 font-medium">Stay informed about the latest institutional updates, academic cycles, and emergency notices.</p>
          </div>

          <div className="space-y-8">
            {loading ? (
              <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">Synchronizing Broadcasts...</div>
            ) : announcements.length === 0 ? (
              <div className="bg-white rounded-[30px] p-20 text-center border border-gray-100 shadow-sm">
                <div className="text-5xl mb-6">📢</div>
                <h3 className="text-xl font-black text-[#0D1B3E] mb-2">No Active Announcements</h3>
                <p className="text-gray-400 text-sm">Everything is quiet on the campus feed right now.</p>
              </div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className={`bg-white rounded-3xl p-8 border ${a.is_emergency ? 'border-red-100 shadow-lg shadow-red-500/5' : 'border-gray-100 shadow-sm'} transition-all hover:shadow-md relative overflow-hidden group`}>
                  {a.is_emergency && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${a.is_emergency ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-600'}`}>
                            {a.is_emergency ? 'Emergency' : 'Institutional'}
                        </span>
                        <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest">{new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-[#0D1B3E] mb-3 group-hover:text-blue-600 transition-colors">{a.title}</h3>
                  <div className="text-sm text-gray-500 font-medium leading-relaxed">
                    {a.content}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[7px] font-bold">🏛️</div>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Office of the Registrar</span>
                    </div>
                    <button className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-[#0D1B3E] transition-colors">Mark as Read</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
