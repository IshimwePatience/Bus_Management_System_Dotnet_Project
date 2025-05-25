import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const EditUserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '',
    Role: 'Customer',
    IsGuest: false,
    LicenseNumber: '',
    LicenseExpiry: '',
    DriverStatus: 'Inactive',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          setCurrentUserRole(decoded.role || '');
        }

        console.log('Fetching user with ID:', id);
        const res = await axios.get(`http://localhost:5172/api/Users/${id}`);
        console.log('Fetched user data:', res.data);

        const licenseExpiry = res.data.LicenseExpiry
          ? new Date(res.data.LicenseExpiry).toISOString().split('T')[0]
          : '';

        setFormData({
          Name: res.data.Name || '',
          Email: res.data.Email || '',
          Phone: res.data.Phone || '',
          Role: res.data.Role || 'Customer',
          IsGuest: res.data.IsGuest || false,
          LicenseNumber: res.data.LicenseNumber || '',
          LicenseExpiry: licenseExpiry,
          DriverStatus: res.data.DriverStatus || 'Inactive',
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

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

    const licenseExpiryForBackend = formData.LicenseExpiry
      ? new Date(formData.LicenseExpiry + 'T00:00:00').toISOString().split('.')[0]
      : null;

    const updateData = {
      Name: formData.Name,
      Email: formData.Email,
      Phone: formData.Phone,
      Role: formData.Role,
      IsGuest: formData.IsGuest,
      LicenseNumber: formData.Role === 'Driver' ? formData.LicenseNumber : null,
      LicenseExpiry: formData.Role === 'Driver' ? licenseExpiryForBackend : null,
    };

    console.log('Sending update data:', updateData);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5172/api/Users/${id}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }
      );
      console.log('Update response:', response.data);
      if (currentUserRole === 'Admin' && formData.Role === 'Driver') {
        await axios.put(
          `http://localhost:5172/api/Users/${id}/driverstatus`, // Corrected port from 5173 to 5172
          `"${formData.DriverStatus}"`,
          { headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' } }
        );
      }
      setSuccess('User updated successfully!');
      setTimeout(() => navigate('/users'), 1000);
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setError('Failed to update user: ' + errorMessage);
    }
  };

  if (loading) {
    return <div className="text-center p-4 text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-4 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
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
            <option value="Customer">Customer</option>
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
                License Number <span className="text-red-500">*</span>
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
                License Expiry <span className="text-red-500">*</span>
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
          Update User
        </button>
      </form>
    </div>
  );
};

export default EditUserForm;