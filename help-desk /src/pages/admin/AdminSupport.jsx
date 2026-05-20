import React, { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import ManualTicketModal from "../../components/admin/ManualTicketModal";

export default function AdminSupport() {
  const [showManualModal, setShowManualModal] = useState(false);
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  const supportCategories = [
    {
      title: "Technical Infrastructure",
      description: "Support for server issues, database connectivity, and API responsiveness.",
      contact: "sysadmin@setu.edu.np",
      icon: "⚙️"
    },
    {
      title: "Governance & Roles",
      description: "Assistance with institutional hierarchy, department creation, and personnel access levels.",
      contact: "registrar@setu.edu.np",
      icon: "🛡️"
    },
    {
      title: "Broadcast & Communication",
      description: "Support for the announcement engine, emergency broadcast protocols, and email notifications.",
      contact: "communications@setu.edu.np",
      icon: "📢"
    },
    {
      title: "System Documentation",
      description: "Access the full institutional operator guide and technical manual.",
      contact: "View Documentation →",
      icon: "📜"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <AdminSidebar setShowManualModal={setShowManualModal} />
      
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-sm font-black text-[#0D1B3E] uppercase tracking-widest">SETU ADMIN PORTAL</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 ml-4">
              <div className="text-right">
                <p className="text-sm font-bold text-[#0D1B3E]">{adminData.name || "System Administrator"}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">SENIOR CONTROLLER</p>
              </div>
              <div className="w-10 h-10 bg-[#0D1B3E] text-white rounded-full flex items-center justify-center text-sm font-bold border border-gray-200 shadow-sm">
                {(adminData.name || "System Administrator").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto w-full">
          <div className="mb-12">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Institutional Resources / Support</p>
            <h2 className="text-4xl font-black text-[#0D1B3E] tracking-tight mb-4">Help & Governance Support</h2>
            <p className="text-gray-400 font-medium max-w-2xl">Access administrative assistance and technical documentation to ensure the continued stability of the Setu institutional ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {supportCategories.map((cat) => (
              <div key={cat.title} className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-[#0D1B3E] group-hover:text-white transition-all shadow-inner">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-black text-[#0D1B3E] mb-3">{cat.title}</h3>
                <p className="text-gray-400 font-medium mb-8 leading-relaxed">{cat.description}</p>
                <div className="pt-8 border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Institutional Channel</p>
                    <p className="text-sm font-black text-blue-600 cursor-pointer hover:text-[#0D1B3E] transition-colors">{cat.contact}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0D1B3E] rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 p-20 text-white/5 text-[200px] font-black leading-none pointer-events-none">SETU</div>
            <div className="relative z-10 max-w-xl">
                <h3 className="text-3xl font-black mb-4">Need immediate emergency support?</h3>
                <p className="text-white/60 font-medium mb-8">If you are experiencing a critical system failure or security breach, contact the core institutional response team immediately.</p>
                <div className="flex gap-4">
                    <button className="bg-white text-[#0D1B3E] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition shadow-xl">Emergency Hot-Line</button>
                    <button className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition">Open System Audit</button>
                </div>
            </div>
          </div>
        </div>
      </main>

      {showManualModal && <ManualTicketModal onClose={() => setShowManualModal(false)} />}
    </div>
  );
}
