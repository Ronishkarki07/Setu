import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import ManualTicketModal from "../../components/admin/ManualTicketModal";

const API = "http://localhost:3000/api";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("student");
  const [showManualModal, setShowManualModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  useEffect(() => {
    fetchUsers();
  }, []);

  const studentCount = users.filter(u => u.role === 'student').length;

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return u.role === 'student' && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <AdminSidebar setShowManualModal={setShowManualModal} />
      
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <h1 className="text-sm font-black text-[#0D1B3E] uppercase tracking-widest">SETU ADMIN PORTAL</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative mr-4 hidden lg:block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input 
                    type="text" 
                    placeholder="Global search..." 
                    className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 w-64"
                />
            </div>
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

        <div className="p-12 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-4xl font-black text-[#0D1B3E] tracking-tight mb-2">Manage Students & Staff</h2>
              <p className="text-gray-400 font-medium">Registry of institutional personnel. Update roles, manage access tiers, and monitor account statuses.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 border border-gray-200 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 flex items-center gap-2">📥 Export Directory</button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <UserStatCard label="Total Students" value={studentCount.toLocaleString()} trend="+ 12% from last term" />
            <UserStatCard label="Active Students" value={Math.floor(studentCount * 0.34).toLocaleString()} subtext="Live system activity" color="text-green-500" dot="bg-green-500" />
            <UserStatCard label="Admin Roles" value="24" subtext="Restricted access levels" dot="bg-blue-500" />
            <UserStatCard label="Pending Sync" value="0" subtext="SiS Fully Synced" color="text-green-500" dot="bg-green-500" />
          </div>

          {/* Directory Filter Bar */}
          <div className="bg-white rounded-t-[30px] p-8 border-x border-t border-gray-100 flex justify-between items-center">
            <div className="flex gap-4 items-center">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search by name, email or ID..." 
                        className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-[300px]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-[#0D1B3E] border border-gray-100">🎚️</button>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
              <FilterTab label="Students" active={filter === "student"} onClick={() => setFilter("student")} />
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white rounded-b-[30px] border border-gray-100 shadow-sm overflow-hidden mb-12">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-10 py-5">User Profile</th>
                  <th className="px-10 py-5">Institutional Role</th>
                  <th className="px-10 py-5">Account Status</th>
                  <th className="px-10 py-5">Last Activity</th>
                  <th className="px-10 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-bold">Loading institutional registry...</td></tr>
                ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-bold">No records found matching your query.</td></tr>
                ) : (
                    filteredUsers.map(u => (
                        <tr key={u.id} className="group hover:bg-gray-50/30 transition-colors">
                            <td className="px-10 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xs overflow-hidden">
                                        {u.profile_photo ? (
                                            <img src={`${API.replace('/api', '')}/${u.profile_photo}`} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            u.name.split(" ").map(w => w[0]).join("")
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[#0D1B3E]">{u.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">{u.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-10 py-6">
                                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-200">
                                  {formatRole(u.role)}
                                </span>
                            </td>
                            <td className="px-10 py-6">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className={`text-[11px] font-bold ${u.is_active ? 'text-green-600' : 'text-gray-400'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                                </div>
                            </td>
                            <td className="px-10 py-6">
                                <p className="text-xs text-gray-500 font-medium">3 days ago</p>
                            </td>
                            <td className="px-10 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-gray-400 hover:text-[#0D1B3E] text-lg">⋯</button>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
            <div className="p-8 border-t border-gray-50 flex justify-between items-center bg-white rounded-b-[30px]">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Showing 1-10 of {filteredUsers.length} users</p>
                <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0D1B3E] text-white text-xs font-bold shadow-lg shadow-blue-900/20">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 text-xs font-bold">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 text-xs font-bold">3</button>
                    <span className="text-gray-300 self-center">...</span>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 text-xs font-bold">248</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 text-xs font-bold">→</button>
                </div>
            </div>
          </div>
        </div>
      </main>

      {showManualModal && <ManualTicketModal onClose={() => setShowManualModal(false)} />}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-black mb-4">Create Student</h3>
            <div className="space-y-3">
              <input value={newUser.name} onChange={(e) => setNewUser(prev => ({...prev, name: e.target.value}))} placeholder="Full name" className="w-full px-4 py-3 border rounded-lg" />
              <input value={newUser.email} onChange={(e) => setNewUser(prev => ({...prev, email: e.target.value}))} placeholder="Email" className="w-full px-4 py-3 border rounded-lg" />
              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setShowAddUserModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button onClick={async () => {
                  try {
                    const res = await fetch(`${API}/admin/users`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                      body: JSON.stringify(newUser)
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed');
                    // Refresh list
                    fetchUsers();
                    setShowAddUserModal(false);
                    setNewUser({ name: '', email: '' });
                    alert('Student created — temporary password: ' + (data.tempPassword || 'Sent'));
                  } catch (err) {
                    alert('Error creating student: ' + err.message);
                  }
                }} className="px-4 py-2 rounded-lg bg-[#0D1B3E] text-white">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRole(role) {
  if (!role) return "";
  const map = {
    'department_head': 'Head',
    'staff': 'Staff',
    'student': 'Student',
    'admin': 'Admin'
  };
  if (map[role]) return map[role];
  return role.replace(/_/g, ' ');
}

function UserStatCard({ label, value, trend, subtext, color = "text-[#0D1B3E]", dot }) {
    return (
        <div className="bg-white rounded-[30px] p-8 border border-gray-100 shadow-sm">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">{label}</p>
            <div className="flex items-end gap-3 mb-2">
                <h3 className={`text-3xl font-black ${color} leading-none tracking-tight`}>{value}</h3>
                {trend && <span className="text-green-500 text-[10px] font-black mb-1">{trend}</span>}
            </div>
            <div className="flex items-center gap-2">
                {dot && <div className={`w-1.5 h-1.5 rounded-full ${dot}`}></div>}
                <p className="text-[10px] text-gray-400 font-bold">{subtext}</p>
            </div>
        </div>
    );
}

function FilterTab({ label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                active ? "bg-white text-[#0D1B3E] shadow-sm" : "text-gray-400 hover:text-[#0D1B3E]"
            }`}
        >
            {label}
        </button>
    );
}
