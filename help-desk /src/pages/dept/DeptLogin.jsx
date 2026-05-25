import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000/api";

export default function DeptLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("All fields are required");

    setLoading(true);
    try {
      const res = await fetch(`${API}/dept/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("deptToken", data.token);
        localStorage.setItem("deptHead", JSON.stringify(data.deptHead));
        navigate("/dept/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b3e] via-[#1a2f5e] to-[#0a1628] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-blue-500/40">🏛️</div>
            <div>
              <p className="text-white font-black text-sm">Setu Helpdesk</p>
              <p className="text-white/40 text-xs">Academic Support System</p>
            </div>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Department<br />Head Portal
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Manage your department's support tickets, monitor resolution rates, and keep your students supported.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { label: "Active Departments", val: "8+" },
            { label: "Tickets Resolved", val: "1.2K" },
            { label: "Avg Resolution", val: "< 24h" },
            { label: "Satisfaction", val: "94%" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-black text-white">{s.val}</p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-3 shadow-xl shadow-blue-500/30">
              <span className="text-2xl">🏛️</span>
            </div>
            <p className="text-white font-black">Department Portal</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all group mb-6"
              title="Back to Home"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div className="mb-2">
              <span className="inline-block text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                Department Login
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-3 mb-1">Sign In</h1>
            <p className="text-white/40 text-xs mb-7">Access is restricted to appointed department heads.</p>

            {error && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-semibold flex items-start gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Email Address</label>
                <input
                  id="dept-login-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm font-medium outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <input
                    id="dept-login-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-14 text-white placeholder-white/25 text-sm font-medium outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40 hover:text-white transition-colors focus:outline-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                id="dept-login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/30 text-sm mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
                ) : "Sign In"}
              </button>
            </form>

            <p className="text-center text-white/25 text-xs mt-6">
              No account? Contact your system administrator to receive an invitation.
            </p>
          </div>

          <p className="text-center text-white/15 text-xs mt-5">
            © {new Date().getFullYear()} Setu · BIC Nepal Academic Helpdesk
          </p>
        </div>
      </div>
    </div>
  );
}
