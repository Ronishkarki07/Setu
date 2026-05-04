import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../images/footer-logo.svg";
import Building from "../images/building.png";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) =>
    email.toLowerCase().endsWith("@bicnepal.edu.np");

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("All fields are required");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError("Use your institutional email");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      // SAFE JSON PARSE
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        if (data?.requiresOTPVerification) {
          localStorage.setItem("otpEmail", cleanEmail);
          navigate("/verify-otp");
          return;
        }
        if (data?.accountDisabled) {
          setError("Your account is deactivated. Contact admin.");
          return;
        }
        setError(data?.error || "Invalid email or password");
        return;
      }

      // SUCCESS
      localStorage.setItem("token", data.token);
      localStorage.setItem("student", JSON.stringify(data.student));
      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #e8eaf6 50%, #fce4ec 100%)",
      }}
    >
      {/* decorative background blobs */}
      <div
        className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #800000, transparent)" }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #0f2a4a, transparent)" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #1e40af, transparent)" }}
      />

      {/* card */}
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        {/* LEFT — branding panel */}
        <div
          className="relative hidden md:flex flex-col justify-between p-10 text-white bg-cover bg-center"
          style={{ backgroundImage: `url(${Building})` }}
        >
          {/* gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(128,0,0,0.82), rgba(15,42,74,0.82))",
            }}
          />

          {/* decorative rings */}
          <div className="absolute top-6 right-6 w-28 h-28 rounded-full border border-white/20 pointer-events-none" />
          <div className="absolute top-10 right-10 w-16 h-16 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute bottom-16 left-6 w-20 h-20 rounded-full border border-white/10 pointer-events-none" />

          {/* branding */}
          <div className="relative z-10">
            <img src={Logo} alt="College Logo" className="w-16 h-16 mb-5" />
            <h1 className="text-2xl font-bold leading-snug mb-1">
              Biratnagar International College
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Student Academic Helpdesk Portal
            </p>
          </div>

          {/* info badges */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl text-lg">🔒</div>
              <div>
                <p className="font-semibold text-sm">Secure Access</p>
                <p className="text-blue-200 text-xs">Institutional Single Sign-On Ready</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl text-lg">🎓</div>
              <div>
                <p className="font-semibold text-sm">Student Portal</p>
                <p className="text-blue-200 text-xs">Raise & track support tickets</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — login form */}
        <div className="flex flex-col justify-center px-10 py-8 overflow-y-auto">

          {/* mobile-only logo */}
          <div className="flex justify-center mb-5 md:hidden">
            <img src={Logo} alt="logo" className="w-14 h-14" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
          <p className="text-gray-400 text-sm mb-6">Sign in to your student account</p>

          {/* divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-semibold tracking-widest">
              INSTITUTIONAL LOGIN
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-4">

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                  ✉
                </span>
                <input
                  type="email"
                  placeholder="student@bicnepal.edu.np"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                  🔑
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-16 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-700 font-semibold hover:text-blue-900 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* ERROR */}
            <p className="text-red-500 text-xs text-center min-h-[16px]">
              {error || ""}
            </p>

            {/* SUBMIT */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "shadow-md hover:shadow-lg hover:opacity-90"
                }`}
              style={
                loading
                  ? {}
                  : {
                    background:
                      "linear-gradient(135deg, #800000, #0f2a4a)",
                  }
              }
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>

          </div>

          {/* SIGNUP LINK */}
          <p className="text-center text-xs text-gray-400 mt-5">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-800 cursor-pointer font-semibold hover:underline"
            >
              Create one
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}