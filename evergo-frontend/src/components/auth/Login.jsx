import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email/Password, 2: OTP
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (step === 1) {
        response = await axios.post('http://localhost:5172/api/Users/login-step1', {
          email: formData.email,
          password: formData.password
        });
        console.log('LoginStep1 Response:', response.data);
        setStep(2); // Move to OTP step
      } else {
        response = await axios.post('http://localhost:5172/api/Users/verify-otp', {
          email: formData.email,
          otp: formData.otp
        });
        console.log('VerifyOtp Response:', response.data);
        const token = response.data.token;
        if (!token) throw new Error('No token received');
        localStorage.setItem('token', token);

        const decoded = jwtDecode(token);
        console.log('Decoded Token:', decoded);
        const userRole = (decoded.role || '').toLowerCase(); // Fallback to empty string if role is undefined

        if (userRole === 'admin') {
          navigate('/dashboard');
        } else if (userRole === 'driver') {
          navigate('/driver-dashboard');
        } else {
          setError('Unsupported role. Please contact support.');
          localStorage.removeItem('token');
        }
      }
    } catch (err) {
      console.error('Login Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">
        {/* Left Side - Image */}
        <div className="hidden md:block w-1/2">
          <img
            src="src/assets/bus1.jpg"
            alt="Buses in a parking lot"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-black uppercase mb-6">{step === 1 ? 'Login' : 'Verify OTP'}</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#FF5733] focus:border-[#FF5733]"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#FF5733] focus:border-[#FF5733]"
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <div>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter OTP"
                  required
                  className="block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#FF5733] focus:border-[#FF5733]"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#FF5733] hover:bg-[#e04e2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5733] disabled:opacity-50"
              >
                {loading ? 'Processing...' : step === 1 ? 'Next' : 'Login'}
              </button>
            </div>

            <div className="text-center text-sm">
              {step === 1 ? (
                <span className="text-gray-600">Don't have an account? <Link to="/register" className="text-blue-500 hover:text-blue-600">Sign up here.</Link></span>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Back to Login
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;