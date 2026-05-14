import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API = "http://localhost:3000/api";

/* ---------- PASSWORD VALIDATION HELPER ---------- */
function validatePasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^\w\s]/.test(password),
  };
  
  return {
    checks,
    isValid: Object.values(checks).every(check => check === true),
    strength: Object.values(checks).filter(check => check === true).length
  };
}

/* ---------------- helpers ---------------- */
function getToken() {
  return localStorage.getItem("token");
}

function getStudent() {
  try {
    return JSON.parse(localStorage.getItem("student") || "{}");
  } catch {
    return {};
  }
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

/* Sidebar moved to src/components/Sidebar.jsx - using shared Sidebar */

/* ---------------- TOP NAV ---------------- */
function TopNav() {
  const student = getStudent();
  const initials = (student.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex justify-between px-8 h-14 bg-white border-b sticky top-0 z-10">
      <div className="flex gap-6 items-center">
        <span className="text-[#0d1b3e] font-bold border-b-2 border-[#DC143C]">
          Settings
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center text-xs">
          {initials}
        </div>
      </div>
    </header>
  );
}

/* ---------------- SETTINGS PAGE ---------------- */
export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Update password strength when new password changes
    if (name === "newPassword") {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        setError("Only JPEG, PNG, JPG and WEBP images are allowed");
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setProfilePhotoFile(file);
      setError("");
    }
  };

  const handleUploadProfilePhoto = async () => {
    if (!profilePhotoFile) {
      setError("Please select a photo first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("photo", profilePhotoFile);

    try {
      const response = await fetch(`${API}/auth/profile/photo`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to upload photo");
        setLoading(false);
        return;
      }

      // Update student data with new profile photo
      const updatedStudent = { ...student, profile_photo: data.profile_photo };
      localStorage.setItem("student", JSON.stringify(updatedStudent));

      setMessage("Profile photo updated successfully!");
      setProfilePhotoFile(null);
      setPreviewUrl(null);

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        setError("All fields are required");
        setLoading(false);
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        setError("New passwords do not match");
        setLoading(false);
        return;
      }

      // Validate password strength
      const validation = validatePasswordStrength(form.newPassword);
      if (!validation.isValid) {
        setError("Password does not meet complexity requirements. Please check the requirements below.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API}/auth/change-password`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to change password");
        setLoading(false);
        return;
      }

      setMessage("Password changed successfully!");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const student = getStudent();

  if (!getToken()) {
    navigate("/");
    return null;
  }

  return (
    <div className="h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-56 flex flex-col h-screen">
        <TopNav />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8">
            {/* Profile Photo Section */}
            <div className="bg-white rounded-xl p-8 mb-8 shadow-sm flex flex-col items-center">
              <div className="relative mb-6">
                {/* Circular Profile Photo */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0d1b3e] to-[#DC143C] flex items-center justify-center overflow-hidden border-4 border-[#DC143C]/20">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : student.profile_photo ? (
                    <img src={`${API.replace('/api', '')}/${student.profile_photo}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white text-4xl font-bold">
                      {(student.name || "U")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Upload Button Overlay */}
                <label className="absolute bottom-0 right-0 bg-[#DC143C] hover:bg-[#a50e2d] text-white rounded-full p-3 cursor-pointer transition shadow-lg">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleProfilePhotoChange}
                    className="hidden"
                  />
                  📷
                </label>
              </div>

              <h2 className="text-2xl font-bold text-[#0d1b3e] text-center mb-2">
                {student.name}
              </h2>
              <p className="text-gray-500 text-sm text-center mb-4">
                {student.email}
              </p>

              {/* Upload Preview and Button */}
              {profilePhotoFile && (
                <button
                  onClick={handleUploadProfilePhoto}
                  disabled={loading}
                  className="px-6 py-2 bg-[#DC143C] text-white rounded-lg hover:bg-[#a50e2d] disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  {loading ? "Uploading..." : "Save Profile Photo"}
                </button>
              )}
            </div>

            {/* User Profile Section */}
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#0d1b3e] mb-4">
                Profile Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-[#0d1b3e]">
                    {student.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-[#0d1b3e]">
                    {student.email}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-semibold text-[#0d1b3e]">
                    {student.faculty}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-semibold text-[#0d1b3e]">
                    {student.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#0d1b3e] mb-6">
                Change Password
              </h2>

              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">{message}</p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#DC143C]"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#DC143C]"
                  />

                  {/* Password Strength Indicator */}
                  {form.newPassword && passwordStrength && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700">Password Strength:</span>
                          <span className={`text-xs font-semibold ${
                            passwordStrength.strength === 5 ? 'text-green-600' :
                            passwordStrength.strength >= 3 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {passwordStrength.strength}/5
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              passwordStrength.strength === 5 ? 'bg-green-500' :
                              passwordStrength.strength >= 3 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{width: `${(passwordStrength.strength / 5) * 100}%`}}
                          />
                        </div>
                      </div>

                      {/* Requirements Checklist */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                          <span className={passwordStrength.checks.length ? 'text-gray-700' : 'text-gray-500'}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                          <span className={passwordStrength.checks.uppercase ? 'text-gray-700' : 'text-gray-500'}>
                            At least one uppercase letter (A-Z)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                          <span className={passwordStrength.checks.lowercase ? 'text-gray-700' : 'text-gray-500'}>
                            At least one lowercase letter (a-z)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                          <span className={passwordStrength.checks.number ? 'text-gray-700' : 'text-gray-500'}>
                            At least one number (0-9)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                          <span className={passwordStrength.checks.special ? 'text-gray-700' : 'text-gray-500'}>
                            At least one special character (@, #, $, %, &, *, !, etc.)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#DC143C]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#DC143C] text-white font-bold rounded-lg hover:bg-[#a50e2d] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Changing Password..." : "Change Password"}
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4">
                <strong>Password Requirements:</strong> Your password must be at least 8 characters long and contain:
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• At least one uppercase letter (A-Z)</li>
                  <li>• At least one lowercase letter (a-z)</li>
                  <li>• At least one number (0-9)</li>
                  <li>• At least one special character (@, #, $, %, &, *, !, etc.)</li>
                </ul>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
