import React from 'react';
import { useLocation } from 'react-router-dom';


const NotFound = ({ message = 'Page Not Found' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-6">{message}</p>
        <a href="/" className="text-blue-500 hover:text-blue-600">
          Go back to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;