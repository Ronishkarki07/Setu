import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../images/footer-logo.svg";

export default function VerifyOTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  // Get email from localStorage
  const email = localStorage.getItem("otpEmail");

  const handleVerify = async () => {
    if (!otp) {
      setError("Enter OTP");
      return;
    }
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid or expired OTP");
        return;
      }

      localStorage.removeItem("otpEmail");
      alert("Email verified successfully ✅ Please log in.");
      navigate("/");

    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("No email found. Please sign up again.");
      return;
    }

    try {
      setResendLoading(true);
      setResendMsg("");
      setError("");

      const res = await fetch("http://localhost:3000/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
      } else {
        setResendMsg("OTP resent! Check your email 📩");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #e8eaf6 50%, #fce4ec 100%)",
      }}
    >
      {/* background blobs */}
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
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">

        {/* logo + heading */}
        <div className="flex flex-col items-center mb-6">
          <img src={Logo} alt="College Logo" className="w-14 h-14 mb-3" />
          <h2 className="text-xl font-bold text-gray-800">Verify Your Email</h2>
          <p className="text-gray-400 text-xs text-center mt-1">
            Enter the 6-digit OTP sent to
          </p>
          <p className="text-gray-700 text-xs font-semibold text-center mt-0.5">
            {email || "your email"}
          </p>
        </div>

        {/* divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-semibold tracking-widest">OTP</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* OTP input */}
        <div className="mb-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            One-Time Password
          </label>
          <input
            type="text"
            placeholder="• • • • • •"
            value={otp}
            maxLength={6}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setOtp(val);
              setError("");
              setResendMsg("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-center text-lg tracking-[0.4em] outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
          />
        </div>

        {/* error / success — always rendered, no jump */}
        <p className="text-red-500 text-xs text-center min-h-[16px] mb-1">
          {error || ""}
        </p>
        <p className="text-green-600 text-xs text-center min-h-[16px] mb-3">
          {resendMsg || ""}
        </p>

        {/* verify button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "shadow-md hover:shadow-lg hover:opacity-90"
            }`}
          style={
            loading
              ? {}
              : { background: "linear-gradient(135deg, #800000, #0f2a4a)" }
          }
        >
          {loading ? "Verifying..." : "Verify OTP →"}
        </button>

        {/* resend */}
        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="w-full mt-3 py-2 text-xs text-blue-800 font-semibold hover:underline transition-colors disabled:opacity-50"
        >
          {resendLoading ? "Resending..." : "Didn't receive it? Resend OTP"}
        </button>

        {/* back to login */}
        <p
          onClick={() => navigate("/")}
          className="text-center text-xs text-gray-400 mt-3 cursor-pointer hover:text-blue-800 hover:underline transition-colors"
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );
}