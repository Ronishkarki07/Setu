import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = "http://localhost:3000/api";

export default function SetupAccount() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [step, setStep] = useState("loading"); // loading | valid | invalid | success
  const [deptInfo, setDeptInfo] = useState({ department: "", email: "" });
  const [form, setForm] = useState({ name: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setStep("invalid"); return; }
    fetch(`${API}/dept/validate-invite?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setDeptInfo(data);
          if (data.alreadyAccepted) {
            setStep("success");
          } else {
            setStep("valid");
          }
        }
        else setStep("invalid");
      })
      .catch(() => setStep("invalid"));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Full name is required");
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/dept/accept-invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name: form.name, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) setStep("success");
      else setError(data.error || "Failed to set up account");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b3e] via-[#1a2f5e] to-[#0d1b3e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-2xl shadow-blue-500/30">
            <span className="text-2xl">🏛️</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Setu Academic Helpdesk</h1>
          <p className="text-white/50 text-sm mt-1">Department Administration Portal</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {step === "loading" && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60 text-sm">Validating your invitation...</p>
            </div>
          )}

          {step === "invalid" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-black text-white mb-2">Invalid Invitation</h2>
              <p className="text-white/50 text-sm mb-6">This invitation link is invalid or has expired. Please contact your administrator.</p>
              <button onClick={() => navigate("/dept/login")} className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
                Go to Login →
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-black text-white mb-2">Account Created!</h2>
              <p className="text-white/60 text-sm mb-6">
                Your account for <span className="text-blue-400 font-bold">{deptInfo.department}</span> has been set up successfully.
              </p>
              <button
                onClick={() => navigate("/dept/login")}
                className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/30 text-sm"
              >
                Proceed to Login →
              </button>
            </div>
          )}

          {step === "valid" && (
            <>
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Invited As</p>
                <p className="text-white font-bold text-sm">Head of {deptInfo.department}</p>
                <p className="text-white/50 text-xs">{deptInfo.email}</p>
              </div>

              <h2 className="text-xl font-black text-white mb-1">Setup Your Account</h2>
              <p className="text-white/50 text-xs mb-6">Create your credentials to access the department portal.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Subodh Shrestha"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min 8 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Re-enter password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/30 text-sm mt-2"
                >
                  {submitting ? "Creating Account..." : "Activate Department Account →"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} Setu · BIC Nepal · Institutional Access Only
        </p>
      </div>
    </div>
  );
}
