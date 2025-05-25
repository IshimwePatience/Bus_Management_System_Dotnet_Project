import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import 'remixicon/fonts/remixicon.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        setUser({
          name: decoded.name || 'Unknown User',
          email: decoded.email || '',
          role: decoded.role || 'Unknown Role'
        });
      } catch (err) {
        setError('Failed to decode token. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { path: '/buses', label: 'Buses', icon: 'ri-bus-line' },
    { path: '/routes', label: 'Routes', icon: 'ri-route-line' },
    { path: '/schedules', label: 'Schedules', icon: 'ri-calendar-todo-line' },
    { path: '/bookings', label: 'Bookings', icon: 'ri-ticket-line' },
    { path: '/payments', label: 'Payments', icon: 'ri-money-dollar-circle-line' },
    { path: '/users', label: 'Users', icon: 'ri-user-line' },
    { path: '/reports', label: 'Reports', icon: 'ri-file-chart-line' },
  ];

  const routeTitles = {
    '/dashboard': 'Dashboard',
    '/buses': 'Bus Management',
    '/buses/add': 'Add Bus',
    '/buses/edit': 'Edit Bus',
    '/routes': 'Route Management',
    '/routes/add': 'Add Route',
    '/routes/edit': 'Edit Route',
    '/schedules': 'Schedule Management',
    '/bookings': 'Booking Management',
    '/payments': 'Payment Management',
    '/users': 'User Management',
    '/reports': 'Report Management',
  };

  const getCurrentTitle = () => {
    if (routeTitles[location.pathname]) {
      return routeTitles[location.pathname];
    }
    const basePath = '/' + location.pathname.split('/')[1];
    return routeTitles[basePath] || 'Bus Management';
  };

  if (loading) {
    return <div className="text-center p-4 text-gray-500">Loading...</div>;
  }
  if (error || !user) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
        <p>{error || 'User not found. Please log in again.'}</p>
        <button onClick={() => navigate('/login')} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-48 bg-[#1F2937] text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-4">
          <img src="/src/assets/Logo.png" alt="" className="w-32" />
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-2 px-4 hover:bg-[#FF6B35] ${location.pathname === item.path ? 'bg-[#FF6B35]' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className={`${item.icon} mr-2`}></i>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-48">
        {/* Topbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
            <h2 className="text-xl font-semibold text-[#005EB8]">{getCurrentTitle()}</h2>
          </div>
          <div className="relative flex items-center">
            {/* <img
              src="https://via.placeholder.com/40"
              alt="User"
              className="w-10 h-10 rounded-full mr-2"
            /> */}
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-sm text-gray-500">{user.role}</span>
            </div>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="ml-2"
            >
              <i className="ri-arrow-down-s-line"></i>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white shadow-lg rounded-md py-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 flex items-center"
                >
                  <i className="ri-logout-circle-r-line mr-2"></i> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;