import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../images/footer-logo.svg";
import Building from "../../images/building.png";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password; // Admin passwords might have spaces, don't trim

    if (!cleanEmail || !cleanPassword) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        setError(data?.error || "Invalid admin credentials");
        return;
      }

      // SUCCESS
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminData", JSON.stringify(data.admin));
      
      // Also clear student data to avoid confusion
      localStorage.removeItem("token");
      localStorage.removeItem("student");

      navigate("/admin/dashboard");

    } catch (err) {
      console.error("Admin login error:", err);
      setError("Unable to connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a1c2c 0%, #4a192c 100%)",
      }}
    >
      {/* decorative background blobs */}
      <div
        className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff0055, transparent)" }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #00d2ff, transparent)" }}
      />

      {/* card */}
      <div
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <img src={Logo} alt="Logo" className="w-20 h-20 mb-4" />
          <h1 className="text-3xl font-bold text-white text-center">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-2">Secure access for staff only</p>
        </div>

        <div className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                ✉
              </span>
              <input
                type="email"
                placeholder="admin@setu.edu.np"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-pink-500 focus:bg-white/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔑
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="••••••••"
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-16 py-3 text-white text-sm outline-none focus:border-pink-500 focus:bg-white/10 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-pink-400 font-bold hover:text-pink-300 transition-colors"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* ERROR */}
          <div className="min-h-[20px]">
            {error && (
              <p className="text-red-400 text-xs text-center font-medium animate-pulse">
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-white text-sm font-bold uppercase tracking-widest transition-all duration-300 ${loading
              ? "bg-gray-600 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-pink-600 to-purple-700 shadow-lg hover:shadow-pink-500/30 hover:scale-[1.02] active:scale-95"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                VERIFYING...
              </span>
            ) : (
              "AUTHENTICATE →"
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
