import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AddUserForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '',
    Password: '',
    Role: 'Customer', // Changed from 'Staff' to match UserRole enum
    IsGuest: false,
    LicenseNumber: '',
    LicenseExpiry: '',
    DriverStatus: 'Inactive', // Default to Inactive for drivers
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      console.log('Decoded Token on Load:', decoded); // Log token on component load
      setCurrentUserRole(decoded.role || '');
    }
  }, []);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleCheckboxChange = (key) => {
    setFormData({ ...formData, [key]: !formData[key] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('token');
    console.log('Token:', token); // Log the token before making requests
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    const data = {
      Name: formData.Name,
      Email: formData.Email,
      Phone: formData.Phone,
      Password: formData.IsGuest ? null : formData.Password, // Null for guests
      Role: formData.Role,
      IsGuest: formData.IsGuest,
      LicenseNumber: formData.Role === 'Driver' ? formData.LicenseNumber : null,
      LicenseExpiry: formData.Role === 'Driver' ? formData.LicenseExpiry : null,
    };

    try {
      const response = await axios.post('http://localhost:5172/api/Users', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include token for POST
        },
      });
      const userId = response.data.UserId;
      console.log('Created User ID:', userId);
      if (currentUserRole === 'Admin' && formData.Role === 'Driver') {
        console.log('Updating DriverStatus to:', formData.DriverStatus);
        await axios.put(
          `http://localhost:5172/api/Users/${userId}/driverstatus`,
          `"${formData.DriverStatus}"`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Include token for PUT
            },
          }
        );
      }
      setSuccess('User created successfully!');
      setTimeout(() => navigate('/users'), 1000);
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800">Create User</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.Name}
            onChange={(e) => handleChange('Name', e.target.value)}
            placeholder="Enter full name"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.Email}
            onChange={(e) => handleChange('Email', e.target.value)}
            placeholder="Enter email address"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.Phone}
            onChange={(e) => handleChange('Phone', e.target.value)}
            placeholder="Enter phone number"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">{formData.IsGuest ? '' : '*'}</span>
          </label>
          <input
            type="password"
            value={formData.Password}
            onChange={(e) => handleChange('Password', e.target.value)}
            placeholder="Enter password"
            required={!formData.IsGuest}
            disabled={formData.IsGuest}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.Role}
            onChange={(e) => handleChange('Role', e.target.value)}
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Admin">Admin</option>
            <option value="Driver">Driver</option>
            <option value="Customer">Customer</option> {/* Changed from Staff */}
          </select>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.IsGuest}
            onChange={() => handleCheckboxChange('IsGuest')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm font-medium text-gray-700">
            Is Guest
          </label>
        </div>
        {formData.Role === 'Driver' && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                License Number <span className="text-red-500">*</span> {/* Made required for Driver */}
              </label>
              <input
                type="text"
                value={formData.LicenseNumber}
                onChange={(e) => handleChange('LicenseNumber', e.target.value)}
                placeholder="Enter license number"
                required
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                License Expiry <span className="text-red-500">*</span> {/* Made required for Driver */}
              </label>
              <input
                type="date"
                value={formData.LicenseExpiry}
                onChange={(e) => handleChange('LicenseExpiry', e.target.value)}
                placeholder="Select license expiry date"
                required
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
        {formData.Role === 'Driver' && currentUserRole === 'Admin' && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Driver Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.DriverStatus}
              onChange={(e) => handleChange('DriverStatus', e.target.value)}
              required
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="OnLeave">On Leave</option>
            </select>
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
        >
          Create User
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;