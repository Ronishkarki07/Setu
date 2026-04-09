import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../images/footer-logo.svg";
import Building from "../images/building.png";

export default function Signup() {
  const navigate = useNavigate();

  const emailRef = useRef();
  const facultyRef = useRef();
  const levelRef = useRef();
  const passwordRef = useRef();
  const confirmRef = useRef();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    faculty: "",
    level: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(""); // ✅ NEW
  const [loading, setLoading] = useState(false);

  const getError = (name, value, currentForm) => {
    if (name === "name") {
      if (!value) return "Full name is required";
      if (!/^[A-Za-z\s]+$/.test(value)) return "Name cannot contain numbers";
    }

    if (name === "email") {
      if (!value) return "Email is required";
      if (!value.endsWith("@bicnepal.edu.np"))
        return "Use institutional email";
    }

    if (name === "faculty" && !value) return "Select faculty";
    if (name === "level" && !value) return "Select level";

    // ✅ STRONG PASSWORD
    if (name === "password") {
      if (!value) return "Password required";
      if (value.length < 8) return "Minimum 8 characters";
      if (!/[A-Z]/.test(value)) return "Must include uppercase letter";
      if (!/[a-z]/.test(value)) return "Must include lowercase letter";
      if (!/[0-9]/.test(value)) return "Must include a number";
      if (!/[!@#$%^&*]/.test(value))
        return "Must include special character";
    }

    if (name === "confirmPassword") {
      if (!value) return "Confirm password";
      const pwd = currentForm ? currentForm.password : form.password;
      if (value !== pwd) return "Passwords do not match";
    }

    return "";
  };

  const validate = (name, value) => {
    const error = getError(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
    setFormError(""); // ✅ clear top error when typing
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // ✅ UI ERROR instead of alert
    const isFormEmpty = Object.values(form).every((val) => !val);
    if (isFormEmpty) {
      setFormError("Please fill the form first");
      return;
    }

    setFormError(""); // clear if valid

    const newErrors = {};
    Object.keys(form).forEach((key) => {
      newErrors[key] = getError(key, form[key], form);
    });

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e)) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Signup failed");
      } else {
        localStorage.setItem("otpEmail", data.email);
        alert("OTP sent 📩 Check your email.");
        navigate("/verify-otp");
      }
    } catch (err) {
      alert("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT SIDE */}
        <div
          className="relative text-white p-10 flex flex-col justify-between rounded-l-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${Building})` }}
        >
          <div
            className="absolute inset-0 rounded-l-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(128,0,0,0.75), rgba(15,42,74,0.75))",
            }}
          />

          <div className="relative z-10 mb-6">
            <img src={Logo} alt="College Logo" className="w-20 h-20 mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              Biratnagar International College
            </h1>
            <p className="text-blue-200 text-sm">
              Access the centralized nexus for student support.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-10 relative z-10">
            <div className="bg-white/20 p-3 rounded-lg">🔒</div>
            <div>
              <p className="font-semibold">Secure Access</p>
              <p className="text-blue-200 text-sm">
                Institutional Single Sign-On Ready
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10">
          <h2 className="text-2xl font-semibold mb-2">Create Account</h2>
          <p className="text-gray-500 mb-6">
            Enter your institutional details.
          </p>

          <form onSubmit={handleSignup} className="space-y-4">

            {/* ✅ TOP FORM ERROR */}
            <p className="text-red-500 text-sm text-center min-h-[20px]">
              {formError || ""}
            </p>

            {/* NAME */}
            <div>
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && emailRef.current.focus()
                }
                className="w-full p-3 rounded-lg bg-gray-100 focus:outline-none"
              />
              <p className="text-red-500 text-xs mt-1 min-h-[16px]">
                {errors.name || ""}
              </p>
            </div>

            {/* EMAIL */}
            <div>
              <input
                ref={emailRef}
                name="email"
                type="email"
                placeholder="student@bicnepal.edu.np"
                value={form.email}
                onChange={handleChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && facultyRef.current.focus()
                }
                className="w-full p-3 rounded-lg bg-gray-100 focus:outline-none"
              />
              <p className="text-red-500 text-xs mt-1 min-h-[16px]">
                {errors.email || ""}
              </p>
            </div>

            {/* FACULTY */}
            <div>
              <select
                ref={facultyRef}
                name="faculty"
                value={form.faculty}
                onChange={handleChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && levelRef.current.focus()
                }
                className="w-full p-3 rounded-lg bg-gray-100 focus:outline-none"
              >
                <option value="">Select Faculty</option>
                <option value="BSc Hons Computer Science">Computer Science</option>
                <option value="BIBM">Business</option>
                <option value="BSc(Hons) CyberSecurity">Cyber Security</option>
                <option value="MBA">MBA</option>
              </select>
              <p className="text-red-500 text-xs mt-1 min-h-[16px]">
                {errors.faculty || ""}
              </p>
            </div>

            {/* ✅ FIXED LEVEL */}
            <div>
              <select
                ref={levelRef}
                name="level"
                value={form.level}
                onChange={handleChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && passwordRef.current.focus()
                }
                className="w-full p-3 rounded-lg bg-gray-100 focus:outline-none"
              >
                <option value="">Select Level</option>
                <option value="Level 4 - First Semester">Level 4 - First Semester</option>
                <option value="Level 4 - Second Semester">Level 4 - Second Semester</option>
                <option value="Level 5 - First Semester">Level 5 - First Semester</option>
                <option value="Level 5 - Second Semester">Level 5 - Second Semester</option>
                <option value="Level 6 - First Semester">Level 6 - First Semester</option>
                <option value="Level 6 - Second Semester">Level 6 - Second Semester</option>
              </select>
              <p className="text-red-500 text-xs mt-1 min-h-[16px]">
                {errors.level || ""}
              </p>
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <input
                ref={passwordRef}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && confirmRef.current.focus()
                }
                className="w-full p-3 rounded-lg bg-gray-100 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-sm text-blue-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              <p className="text-red-500 text-xs mt-1 min-h-[16px]">
                {errors.password || ""}
              </p>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <input
                ref={confirmRef}
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-100 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-sm text-blue-600"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
              <p className="text-red-500 text-xs mt-1 min-h-[16px]">
                {errors.confirmPassword || ""}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white ${
                loading
                  ? "bg-gray-400"
                  : "bg-blue-900 hover:bg-blue-800"
              } transition`}
            >
              {loading ? "Creating..." : "Create Account →"}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-red-500 cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}