import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const email = localStorage.getItem("otpEmail");

  const handleVerify = async () => {
    if (!otp) return setError("Enter OTP");
    if (otp.length !== 6) return setError("OTP must be 6 digits");

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
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return setError("No email found. Please sign up again.");

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
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 space-y-5">

        <h2 className="text-2xl font-semibold text-center">Verify OTP</h2>

        <p className="text-sm text-gray-500 text-center">
          Enter the 6-digit OTP sent to <br />
          <span className="font-medium text-gray-700">
            {email || "your email"}
          </span>
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          maxLength={6}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setOtp(val);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          className="w-full p-3 bg-gray-100 rounded-xl text-center text-lg tracking-widest"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {resendMsg && (
          <p className="text-green-600 text-sm text-center">{resendMsg}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="w-full py-2 text-sm text-blue-700 hover:underline"
        >
          {resendLoading ? "Resending..." : "Resend OTP"}
        </button>

        <p
          onClick={() => navigate("/")}
          className="text-center text-sm text-blue-600 cursor-pointer hover:underline"
        >
          Back to Login
        </p>

      </div>
    </div>
  );
}