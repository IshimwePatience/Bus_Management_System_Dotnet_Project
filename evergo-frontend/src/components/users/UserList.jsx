import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5172';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // For sidebar
  const [currentUserRole, setCurrentUserRole] = useState(null); // To check if user is admin
  const [openDropdownId, setOpenDropdownId] = useState(null); // For collapsible actions
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch current user's role from JWT
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          console.log('Decoded Token on Load:', decoded); // Log token on component load
          setCurrentUserRole(decoded.role || '');
        } else {
          console.log('No token found in localStorage');
        }

        const res = await axios.get('/api/Users', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        console.log('Fetched users:', res.data);
        setUsers(res.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/Users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setUsers(users.filter((user) => user.UserId !== id));
        if (selectedUser?.UserId === id) setSelectedUser(null); // Close sidebar if deleted
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      console.log('Toggling status for user:', id, 'to:', newStatus);
      await axios.put(
        `/api/Users/${id}/driverstatus`,
        `"${newStatus}"`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setUsers(
        users.map((user) =>
          user.UserId === id ? { ...user, DriverStatus: newStatus } : user
        )
      );
      if (selectedUser?.UserId === id) {
        setSelectedUser({ ...selectedUser, DriverStatus: newStatus });
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      setError(
        'Failed to toggle status: ' + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenDropdownId(null); // Close any open dropdown
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return <div className="text-center p-4 text-gray-500">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-1/3 focus:ring-2 focus:ring-[#00C4B4]"
          />
          <Link
            to="/users/add"
            className="bg-[#3066BE] hover:bg-teal-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  ID
                </th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Email
                </th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Role
                </th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  License Number
                </th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  License Expiry
                </th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Driver Status
                </th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.UserId}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100`}
                >
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">
                    {user.UserId}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">
                    {user.Name || '-'}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">
                    {user.Email || '-'}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">
                    {user.Role || '-'}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">
                    {user.LicenseNumber || '-'}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">
                    {user.LicenseExpiry || '-'}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">
                    {user.Role === 'Driver' ? user.DriverStatus || 'Inactive' : '-'}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm relative">
                    <button
                      onClick={() => toggleDropdown(user.UserId)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                      Actions
                    </button>
                    {openDropdownId === user.UserId && (
                      <div className="absolute mt-1 w-40 bg-white shadow-lg rounded-md py-1 z-10">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="block w-full text-left px-4 py-2 text-sm text-green-500 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <Link
                          to={`/users/edit/${user.UserId}`}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-500 hover:bg-gray-100"
                          onClick={() => setOpenDropdownId(null)}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            handleDelete(user.UserId);
                            setOpenDropdownId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                        {currentUserRole === 'Admin' && user.Role === 'Driver' && (
                          <button
                            onClick={() => {
                              handleToggleStatus(user.UserId, user.DriverStatus);
                              setOpenDropdownId(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-yellow-500 hover:bg-gray-100"
                          >
                            {user.DriverStatus === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar */}
      {selectedUser && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <strong>ID:</strong> {selectedUser.UserId}
            </div>
            <div>
              <strong>Name:</strong> {selectedUser.Name || '-'}
            </div>
            <div>
              <strong>Email:</strong> {selectedUser.Email || '-'}
            </div>
            <div>
              <strong>Phone:</strong> {selectedUser.Phone || '-'}
            </div>
            <div>
              <strong>Role:</strong> {selectedUser.Role || '-'}
            </div>
            <div>
              <strong>Is Guest:</strong> {selectedUser.IsGuest ? 'Yes' : 'No'}
            </div>
            {selectedUser.Role === 'Driver' && (
              <>
                <div>
                  <strong>Driver Status:</strong> {selectedUser.DriverStatus || 'Inactive'}
                </div>
                <div>
                  <strong>License Number:</strong> {selectedUser.LicenseNumber || '-'}
                </div>
                <div>
                  <strong>License Expiry:</strong> {selectedUser.LicenseExpiry || '-'}
                </div>
                <div>
                  <strong>License Photo:</strong>
                  {selectedUser.LicenseImage ? (
                    <img
                      src={selectedUser.LicenseImage}
                      alt="License"
                      className="mt-2 w-full h-40 object-cover rounded-md"
                      onError={(e) =>
                        (e.target.src =
                          'https://via.placeholder.com/150?text=Image+Not+Found')
                      }
                    />
                  ) : (
                    <p className="text-gray-500">No license photo available</p>
                  )}
                </div>
              </>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => navigate(`/users/edit/${selectedUser.UserId}`)}
                className="bg-[#3066BE] hover:bg-teal-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedUser.UserId)}
                className="bg-[#FF0000] hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Delete
              </button>
              {currentUserRole === 'Admin' && selectedUser.Role === 'Driver' && (
                <button
                  onClick={() =>
                    handleToggleStatus(
                      selectedUser.UserId,
                      selectedUser.DriverStatus
                    )
                  }
                  className={`${
                    selectedUser.DriverStatus === 'Active'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white px-3 py-1 rounded-md text-sm`}
                >
                  {selectedUser.DriverStatus === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;