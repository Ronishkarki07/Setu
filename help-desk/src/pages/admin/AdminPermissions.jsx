import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import ManualTicketModal from "../../components/admin/ManualTicketModal";

export default function AdminPermissions() {
  const navigate = useNavigate();
  const [showManualModal, setShowManualModal] = useState(false);
  const [adminData, setAdminData] = useState({});

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin") || "{}");
    if (!admin.token) navigate("/admin/login");
    setAdminData(admin);
  }, []);

  const roles = [
    {
      role: "Student",
      color: "blue",
      permissions: [
        "Create academic support tickets",
        "View personal ticket history",
        "Manage personal profile & photo",
        "Receive real-time email notifications"
      ]
    },
    {
      role: "Staff / Curator",
      color: "orange",
      permissions: [
        "View assigned tickets",
        "Update ticket status & priority",
        "Post internal notes (Curator view)",
        "Search institutional student registry"
      ]
    },
    {
      role: "Department Head",
      color: "purple",
      permissions: [
        "Manage departmental staff assignments",
        "Override ticket priorities",
        "View unit-level performance stats",
        "Escalate tickets to global admin"
      ]
    },
    {
      role: "Global Administrator",
      color: "slate",
      permissions: [
        "Full system access (Bypass limits)",
        "Manage institutional departments",
        "Appoint & revoke leadership roles",
        "Monitor system-wide audit logs"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <AdminSidebar setShowManualModal={setShowManualModal} />
      
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-sm font-black text-[#0D1B3E] uppercase tracking-widest">Setu Central Intelligence</h1>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-[#0D1B3E]">🔔</button>
            <div className="flex items-center gap-3 ml-4">
              <div className="text-right">
                <p className="text-sm font-bold text-[#0D1B3E]">{adminData.name || "Admin"}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Global Oversight</p>
              </div>
              <div className="w-10 h-10 bg-[#0D1B3E] text-white rounded-full flex items-center justify-center text-sm font-bold border border-gray-200 shadow-sm transition-transform hover:scale-105">
                {(adminData.name || "A").split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Roles & Permissions</h2>
            <p className="text-gray-500 font-medium">Definition of institutional access tiers and operational capabilities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roles.map((r) => (
              <div key={r.role} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                    r.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    r.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                    r.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                    'bg-slate-50 text-slate-600'
                  }`}>
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{r.role}</h3>
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">System Role Tier</p>
                  </div>
                </div>

                <ul className="space-y-4">
                  {r.permissions.map((p, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`mt-1 text-xs ${
                        r.color === 'blue' ? 'text-blue-500' :
                        r.color === 'orange' ? 'text-orange-500' :
                        r.color === 'purple' ? 'text-purple-500' :
                        'text-slate-500'
                      }`}>✓</span>
                      <span className="text-sm text-gray-600 font-medium">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2 italic">Access Policy Notice</h3>
              <p className="text-blue-100 max-w-2xl leading-relaxed">
                Permission levels are inherited based on the institutional hierarchy. Any modifications to these access tiers must be authorized by the Global Administrator and documented in the system audit logs.
              </p>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </main>

      {showManualModal && (
        <ManualTicketModal onClose={() => setShowManualModal(false)} />
      )}
    </div>
  );
}
