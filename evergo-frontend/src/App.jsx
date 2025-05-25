import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import BusList from './components/buses/BusList';
import RouteList from './components/routes/RouteList';
import ScheduleList from './components/schedules/ScheduleList';
import BookingList from './components/bookings/BookingList';
import BookingForm from './components/bookings/BookingForm';
import PaymentList from './components/payments/PaymentList';
import UserList from './components/users/UserList';
import Login from './components/auth/Login';
import NotFound from './components/error/NotFound';
import LandingPage from './components/LandingPage';
import AddRouteForm from './components/routes/AddRouteForm';
import EditRouteForm from './components/routes/EditRouteForm';
import AddBusForm from './components/buses/AddBusForm';
import EditBusForm from './components/buses/EditBusForm';
import EditUserForm from './components/users/EditUserForm';
import AddUserForm from './components/users/AddUserForm';
import AddScheduleForm from './components/schedules/AddScheduleForm';
import EditScheduleForm from './components/schedules/EditScheduleForm';
import DriverDashboard from './components/dashboard/DriverDashboard';
import RegisterDriver from './components/auth/RegisterDriver';
import VerifyEmail from './components/auth/VerifyEmail';
import ApproveDriver from './components/auth/ApproveDriver';
import ReportPage from './components/report/ReportPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;
    const normalizedRole = userRole.toLowerCase();

    // Check if the user's role is allowed for this route
    if (allowedRoles && !allowedRoles.map(role => role.toLowerCase()).includes(normalizedRole)) {
      return <Navigate to="/unauthorized" />;
    }

    return children;
  } catch (err) {
    // If token is invalid, remove it and redirect to login
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver-dashboard"
        element={
          <ProtectedRoute allowedRoles={['Driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buses"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <BusList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/buses/add"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <AddBusForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/buses/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <EditBusForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/routes"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <RouteList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/routes/add"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <AddRouteForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/routes/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <EditRouteForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedules"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <ScheduleList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedules/add"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <AddScheduleForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedules/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <EditScheduleForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <BookingList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/bookings/add" element={<BookingForm />} />
      <Route
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <PaymentList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <UserList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/add"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <AddUserForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <EditUserForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <ReportPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterDriver />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/admin/approve-driver" element={<ApproveDriver />} />
      <Route path="/unauthorized" element={<Layout><NotFound message="Unauthorized Access" /></Layout>} />
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  </BrowserRouter>
);

export default App;