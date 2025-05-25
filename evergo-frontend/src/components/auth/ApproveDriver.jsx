import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const ApproveDriver = () => {
  const [message, setMessage] = useState('Processing driver approval...');
  const location = useLocation();

  useEffect(() => {
    const approveDriver = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const userId = params.get('userId');

      if (!token || !userId) {
        setMessage('Invalid approval link.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5172/api/Users/approve-driver', {
          params: { token, userId }
        });
        setMessage(response.data || 'Driver account approved successfully.');
      } catch (err) {
        setMessage(err.response?.data || 'Failed to approve driver. The link may be invalid or expired.');
      }
    };

    approveDriver();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md justify-center items-center flex flex-col">
      <img src="/src/assets/verified.png" alt="" className='w-35' />
        <h2 className="text-2xl font-bold mb-6 text-center">{message}</h2>
        <button className='p-3 bg-orange-500 text-white rounded-xs'><a href="/home">Return to Home</a></button>
      </div>
    </div>
  );
};

export default ApproveDriver;