import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../images/footer-logo.svg";

export default function Login() {
  const navigate = useNavigate();

  // Controls password visibility toggle (show/hide)
  const [showPassword, setShowPassword] = useState(false);

  // Stores form input values for email and password
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Stores validation errors for each field
  const [errors, setErrors] = useState({});

  // Used to disable button + show loading state during API call
  const [loading, setLoading] = useState(false);

  // Validation logic for each field (kept same as signup)
  const getError = (name, value) => {
    if (name === "email") {
      if (!value) return "Email is required";
      if (!value.endsWith("@bicnepal.edu.np"))
        return "Use institutional email";
    }

    if (name === "password") {
      if (!value) return "Password is required";
    }

    return "";
  };

  // Runs validation and updates error state per field
  const validate = (name, value) => {
    const error = getError(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handles input updates and live validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  // Main login handler (validation → API call → navigation)
  const handleLogin = async () => {
    const newErrors = {};

    // Run validation for all fields before submitting
    Object.keys(form).forEach((key) => {
      newErrors[key] = getError(key, form[key]);
    });

    setErrors(newErrors);

    // Stop login if any validation error exists
    if (Object.values(newErrors).some((e) => e)) return;

    try {
      setLoading(true);

      // Send login request to backend
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      // Safely parse response JSON
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      // Handle failed login cases
      if (!res.ok) {
        // If OTP verification is required, redirect to OTP page
        if (data?.requiresOTPVerification) {
          localStorage.setItem("otpEmail", form.email);
          navigate("/verify-otp");
          return;
        }

        // Otherwise show login error
        setErrors({ password: data?.error || "Invalid email or password" });
        return;
      }

      // Store auth session details after successful login
      localStorage.setItem("token", data.token);
      localStorage.setItem("student", JSON.stringify(data.student));

      // Redirect user to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Handle network/server failure
      setErrors({ password: "Unable to connect to server" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Top header section with branding */}
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

        {/* Login form section */}
        <div className="px-10 py-8 space-y-5">

          {/* Email input field */}
          <div>
            <p className="text-xs font-semibold mb-1">Email</p>
            <input
              name="email"
              type="email"
              placeholder="student@bicnepal.edu.np"
              value={form.email}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none"
            />
            <p className="text-red-500 text-xs mt-1 min-h-[16px]">
              {errors.email || ""}
            </p>
          </div>

          {/* Password input with toggle visibility */}
          <div>
            <p className="text-xs font-semibold mb-1">Password</p>
            <div className="flex bg-gray-100 rounded-xl px-4 py-3">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                value={form.password}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="flex-1 bg-transparent text-sm outline-none"
              />

              {/* Toggle show/hide password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p className="text-red-500 text-xs mt-1 min-h-[16px]">
              {errors.password || ""}
            </p>
          </div>

          {/* Submit button with loading state */}
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

          {/* Navigation to signup page */}
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