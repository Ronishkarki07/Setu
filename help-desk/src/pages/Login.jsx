import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../images/footer-logo.svg";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      // 🔥 SAFE JSON PARSE
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        // OTP required
        if (data?.requiresOTPVerification) {
          localStorage.setItem("otpEmail", cleanEmail);
          navigate("/verify-otp");
          return;
        }

        // account disabled
        if (data?.accountDisabled) {
          setError("Your account is deactivated. Contact admin.");
          return;
        }

        setError(data?.error || "Invalid email or password");
        return;
      }

      // ✅ SUCCESS
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div
          className="px-6 py-6 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(73, 3, 3, 0.85), rgba(5, 35, 86, 0.85))",
          }}
        >
          <img src={Logo} alt="logo" className="w-20 mx-auto mb-3" />
          <h1 className="text-2xl text-white font-semibold">Welcome Back!</h1>
          <p className="text-white text-xs">
            Secure gateway for Academic Helpdesk
          </p>
        </div>

        {/* FORM */}
        <div className="px-10 py-8 space-y-5">

          {/* EMAIL */}
          <div>
            <p className="text-xs font-semibold mb-1">Email</p>
            <input
              type="email"
              placeholder="student@bicnepal.edu.np"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <p className="text-xs font-semibold mb-1">Password</p>
            <div className="flex bg-gray-100 rounded-xl px-4 py-3">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="••••••"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-900 hover:bg-blue-800"
            }`}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          {/* SIGNUP */}
          <p className="text-center text-sm text-gray-500">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-900 cursor-pointer font-semibold"
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}