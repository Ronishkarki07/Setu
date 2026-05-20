import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import ManualTicketModal from "../../components/admin/ManualTicketModal";

const API = "http://localhost:3000/api";

export default function AdminDepartments() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [headName, setHeadName] = useState("");
  const [headEmail, setHeadEmail] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API}/admin/departments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      const data = await res.json();
      if (res.ok) setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async () => {
    try {
      const res = await fetch(`${API}/admin/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({ name: deptName, description: deptDesc, head_name: headName, head_email: headEmail })
      });
      if (res.ok) {
        fetchDepartments();
        setShowAddModal(false);
        setDeptName("");
        setDeptDesc("");
        setHeadName("");
        setHeadEmail("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDept = async () => {
    try {
      const res = await fetch(`${API}/admin/departments/${selectedDept.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({ 
          name: deptName, 
          description: deptDesc, 
          head_name: headName, 
          head_email: headEmail 
        })
      });
      if (res.ok) {
        fetchDepartments();
        setShowEditModal(false);
        setSelectedDept(null);
        setDeptName("");
        setDeptDesc("");
        setHeadName("");
        setHeadEmail("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      const res = await fetch(`${API}/admin/departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      if (res.ok) fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteHead = async () => {
    try {
      const res = await fetch(`${API}/admin/departments/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({ email: inviteEmail, departmentId: selectedDept.id })
      });
      if (res.ok) {
        setShowInviteModal(false);
        setInviteEmail("");
        alert("Invitation sent successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

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
              <div className="w-10 h-10 bg-[#0D1B3E] text-white rounded-full flex items-center justify-center text-sm font-bold border border-gray-200 overflow-hidden shadow-sm transition-transform hover:scale-105">
                {(adminData.name || "System Administrator").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-start mb-12">
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Institutional Portal / Departments</p>
              <h2 className="text-4xl font-black text-[#0D1B3E] tracking-tight mb-4">Manage Departments</h2>
              <p className="text-gray-400 font-medium max-w-2xl">Orchestrate the institutional response ecosystem by managing specialized service units and their personnel allocation.</p>
            </div>
            <button 
              onClick={() => { setDeptName(""); setDeptDesc(""); setShowAddModal(true); }}
              className="bg-[#22C55E] text-[#0D1B3E] px-8 py-3.5 rounded-xl font-black text-xs hover:bg-[#16A34A] transition shadow-xl shadow-green-500/20 flex items-center gap-3 uppercase tracking-widest"
            >
              <span>🏢</span> Add Department
            </button>
          </div>

          {/* Directory Table */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mb-12">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
                <h3 className="text-xl font-black text-[#0D1B3E]">Departmental Directory</h3>
                <div className="flex gap-4">
                    <button className="px-6 py-2.5 border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50">Filter</button>
                    <button className="px-6 py-2.5 border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50">Export</button>
                </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Department Name</th>
                  <th className="px-8 py-5">Head of Department</th>
                  <th className="px-8 py-5 text-center">Active Tickets</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">Loading department registry...</td></tr>
                ) : departments.length === 0 ? (
                    <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">No departments configured yet.</td></tr>
                ) : (
                    departments.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg">🏢</div>
                                <div>
                                    <p className="text-sm font-black text-[#0D1B3E]">{d.name}</p>
                                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{d.description ? "Institutional Unit" : "Service Node"}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                                    <div className="w-full h-full bg-[#0D1B3E] text-white flex items-center justify-center text-[10px] font-bold uppercase">
                                        {d.head_name ? d.head_name.split(" ").map(w => w[0]).join("") : "U"}
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-gray-700">{d.head_name || "Unassigned"}</p>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                {d.active_tickets_count || 0} Active
                            </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3 transition-opacity">
                                <button 
                                    onClick={() => { setSelectedDept(d); setInviteEmail(""); setShowInviteModal(true); }}
                                    className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                                    title="Invite Head"
                                >
                                    👤+
                                </button>
                                <button 
                                    onClick={() => { 
                                      setSelectedDept(d); 
                                      setDeptName(d.name); 
                                      setDeptDesc(d.description || ""); 
                                      setHeadName(d.head_name || "");
                                      setHeadEmail(d.head_email || "");
                                      setShowEditModal(true); 
                                    }}
                                    className="w-8 h-8 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    title="Edit Unit"
                                >
                                    ✏️
                                </button>
                                <button 
                                    onClick={() => handleDeleteDept(d.id)}
                                    className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                                    title="Delete Unit"
                                >
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D1B3E]/40 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-md p-12 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-[#0D1B3E] mb-8">New Service Unit</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">NAME</label>
                <input 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium" 
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. IT Support, Admissions"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">DESCRIPTION</label>
                <textarea 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium h-32 resize-none" 
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder="Describe the unit's responsibilities..."
                />
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-xs font-black text-gray-400 hover:bg-gray-50 rounded-2xl uppercase tracking-widest transition-all">Cancel</button>
              <button onClick={handleCreateDept} className="flex-1 py-4 text-xs font-black bg-[#0D1B3E] text-white rounded-2xl hover:bg-black uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all">Create Unit</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D1B3E]/40 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-2xl p-12 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-black text-[#0D1B3E] mb-8 tracking-tight">Edit Service Unit</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">DEPARTMENT NAME</label>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-bold" 
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">DESCRIPTION</label>
                  <textarea 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium h-32 resize-none" 
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">HEAD OF DEPARTMENT NAME</label>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-bold" 
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    placeholder="e.g. Subodh Shrestha"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">HEAD OFFICIAL EMAIL</label>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-bold" 
                    value={headEmail}
                    onChange={(e) => setHeadEmail(e.target.value)}
                    placeholder="e.g. name@bicnepal.edu.np"
                  />
                  <p className="text-[10px] text-blue-500 font-bold mt-2 uppercase tracking-tight">Changing this will send a new institutional invitation.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-4 text-xs font-black text-gray-400 hover:bg-gray-50 rounded-2xl uppercase tracking-widest transition-all">Cancel</button>
              <button onClick={handleUpdateDept} className="flex-1 py-4 text-xs font-black bg-[#0D1B3E] text-white rounded-2xl hover:bg-black uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all">Save Institutional Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D1B3E]/40 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-md p-12 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-[#0D1B3E] mb-2 leading-tight">Appoint Head</h2>
            <p className="text-sm text-gray-400 font-medium mb-8">Send an institutional invitation to lead the <strong>{selectedDept?.name}</strong>.</p>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">OFFICIAL EMAIL</label>
              <input 
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="e.g. name@bicnepal.edu.np"
              />
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 py-4 text-xs font-black text-gray-400 hover:bg-gray-50 rounded-2xl uppercase tracking-widest transition-all">Cancel</button>
              <button onClick={handleInviteHead} className="flex-1 py-4 text-xs font-black bg-[#0D1B3E] text-white rounded-2xl hover:bg-black uppercase tracking-widest transition-all">Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {showManualModal && <ManualTicketModal onClose={() => setShowManualModal(false)} />}
    </div>
  );
}
