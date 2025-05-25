import { useState, useEffect } from "react";
import axios from "axios";
import { X, Upload, User, Phone, Mail, FileText, Calendar } from "lucide-react"; // Using Lucide icons for a modern touch

const EditDriverForm = ({ driver, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    Name: driver.Name || "",
    Phone: driver.Phone || "",
    Email: driver.Email || "",
    LicenseNumber: driver.LicenseNumber || "",
    LicenseExpiry: driver.LicenseExpiry
      ? new Date(driver.LicenseExpiry).toISOString().split("T")[0]
      : "",
  });
  const [licenseImage, setLicenseImage] = useState(driver.LicenseImage || ""); // Current license image (base64 or URL)
  const [newImageFile, setNewImageFile] = useState(null); // New image file selected by user
  const [imagePreview, setImagePreview] = useState(driver.LicenseImage || ""); // Preview for new image
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:5172",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });

  // Handle text input changes
  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation: check file type and size
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image (JPEG, PNG, or JPG).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size must be less than 5MB.");
        return;
      }

      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Update preview
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert image file to base64 for submission
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare the data to send to the backend
      const updateData = {
        Name: formData.Name,
        Phone: formData.Phone,
        Email: formData.Email,
        Role: "Driver",
        LicenseNumber: formData.LicenseNumber,
        LicenseExpiry: formData.LicenseExpiry
          ? new Date(formData.LicenseExpiry + "T00:00:00").toISOString()
          : null,
        LicenseImage: newImageFile ? await getBase64(newImageFile) : licenseImage, // Use new image if uploaded, otherwise keep the existing one
      };

      const response = await api.put(`/api/Users/${driver.UserId}`, updateData);
      onUpdate({
        ...driver,
        Name: formData.Name,
        Phone: formData.Phone,
        Email: formData.Email,
        LicenseNumber: formData.LicenseNumber,
        LicenseExpiry: formData.LicenseExpiry,
        LicenseImage: updateData.LicenseImage, // Update with new or existing image
      });
      setSuccess("Profile updated successfully!");
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError(
        "Failed to update profile: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-orange-300 bg-opacity-50 flex items-center justify-center z-20 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{formData.Name || "Driver Profile"}</h2>
              <p className="text-sm text-gray-500">Role: Driver</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
              <span>{success}</span>
              <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                    <User className="w-4 h-4 mr-1 text-gray-500" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Name"
                    value={formData.Name}
                    onChange={(e) => handleChange("Name", e.target.value)}
                    placeholder="Enter full name"
                    required
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-gray-500" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="Phone"
                    value={formData.Phone}
                    onChange={(e) => handleChange("Phone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                    <Mail className="w-4 h-4 mr-1 text-gray-500" />
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={(e) => handleChange("Email", e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* License Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">License Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                    <FileText className="w-4 h-4 mr-1 text-gray-500" />
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="LicenseNumber"
                    value={formData.LicenseNumber}
                    onChange={(e) => handleChange("LicenseNumber", e.target.value)}
                    placeholder="Enter license number"
                    required
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                    License Expiry <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="LicenseExpiry"
                    value={formData.LicenseExpiry}
                    onChange={(e) => handleChange("LicenseExpiry", e.target.value)}
                    required
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* License Image Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">License Image</h3>
              <div className="flex flex-col items-center space-y-3">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="License Preview"
                    className="w-48 h-48 object-cover rounded-lg shadow-md"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=Image+Not+Found")}
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg shadow-md">
                    <span className="text-gray-500">No Image Available</span>
                  </div>
                )}
                <label className="flex items-center space-x-2 cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition">
                  <Upload className="w-5 h-5" />
                  <span>{newImageFile ? "Change Image" : "Upload License Image"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500">Supported formats: JPEG, PNG, JPG (Max 5MB)</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 rounded-lg text-white flex items-center space-x-2 transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                )}
                <span>{loading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDriverForm;