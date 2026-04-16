import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API = "http://localhost:3000/api";

// Checks password strength based on multiple security rules
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
    // password is valid only if all conditions are satisfied
    isValid: Object.values(checks).every((check) => check === true),

    // strength score out of 5 based on passed conditions
    strength: Object.values(checks).filter((check) => check === true).length,
  };
}

// Reads auth token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Safely retrieves stored student data
function getStudent() {
  try {
    return JSON.parse(localStorage.getItem("student") || "{}");
  } catch {
    return {};
  }
}

// Standard headers used for authenticated API requests
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// Top navigation bar showing current page context and user identity
function TopNav() {
  const student = getStudent();

  // Convert full name into initials for avatar display
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

      {/* User avatar in top right corner */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center text-xs">
          {initials}
        </div>
      </div>
    </header>
  );
}

// Settings page where user can update profile photo and password
export default function Settings() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Stores password form fields
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Tracks password strength live while typing
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Stores selected profile photo before upload
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  // Preview URL for selected image
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // Recalculate password strength whenever new password changes
    if (name === "newPassword") {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  // Handles profile image selection and validation
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Only allow common image formats
    if (
      !["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
        file.type
      )
    ) {
      setError("Only JPEG, PNG, JPG and WEBP images are allowed");
      return;
    }

    // Limit file size to 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    // Create preview for UI before upload
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    setProfilePhotoFile(file);
    setError("");
  };

  // Uploads profile photo to backend
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
        return;
      }

      // Update stored student data with new profile photo
      const updatedStudent = {
        ...getStudent(),
        profile_photo: data.profile_photo,
      };

      localStorage.setItem("student", JSON.stringify(updatedStudent));

      setMessage("Profile photo updated successfully!");
      setProfilePhotoFile(null);
      setPreviewUrl(null);

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handles password update flow with validation and API call
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Basic empty field validation
      if (
        !form.currentPassword ||
        !form.newPassword ||
        !form.confirmPassword
      ) {
        setError("All fields are required");
        return;
      }

      // Ensure both passwords match
      if (form.newPassword !== form.confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      // Ensure password meets strength rules
      const validation = validatePasswordStrength(form.newPassword);
      if (!validation.isValid) {
        setError(
          "Password does not meet complexity requirements. Please check below."
        );
        return;
      }

      // Send password update request
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
        return;
      }

      setMessage("Password changed successfully!");

      // Reset form after success
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const student = getStudent();

  // Redirect if user is not logged in
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
            {/* Profile section showing avatar and upload option */}
            <div className="bg-white rounded-xl p-8 mb-8 shadow-sm flex flex-col items-center">
              <div className="relative mb-6">

                {/* Profile image or initials fallback */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0d1b3e] to-[#DC143C] flex items-center justify-center overflow-hidden border-4 border-[#DC143C]/20">

                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : student.profile_photo ? (
                    <img
                      src={`${API.replace("/api", "")}/${student.profile_photo}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
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

                {/* Photo upload trigger button */}
                <label className="absolute bottom-0 right-0 bg-[#DC143C] hover:bg-[#a50e2d] text-white rounded-full p-3 cursor-pointer">
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

              {/* Show upload button only when a file is selected */}
              {profilePhotoFile && (
                <button
                  onClick={handleUploadProfilePhoto}
                  disabled={loading}
                  className="px-6 py-2 bg-[#DC143C] text-white rounded-lg"
                >
                  {loading ? "Uploading..." : "Save Profile Photo"}
                </button>
              )}
            </div>

            {/* Profile details section (read-only info) */}
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#0d1b3e] mb-4">
                Profile Information
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-[#0d1b3e]">
                    {student.name}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-[#0d1b3e]">
                    {student.email}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-semibold text-[#0d1b3e]">
                    {student.faculty}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-semibold text-[#0d1b3e]">
                    {student.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Password change section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#0d1b3e] mb-6">
                Change Password
              </h2>

              {/* Success and error messages */}
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
                {/* Current password input */}
                <input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  placeholder="Current password"
                />

                {/* New password with strength indicator */}
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="New password"
                />

                {/* Confirm password input */}
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                />

                {/* Submit button */}
                <button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}