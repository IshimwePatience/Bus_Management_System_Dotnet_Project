import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [message, setMessage] = useState("Verifying your email...");
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const email = decodeURIComponent(params.get("email")); // Decode the email

      if (!token || !email) {
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5172/api/users/verify",
          { email, token }
        );
        setMessage(
          response.data ||
            "Email verified successfully. Awaiting admin approval."
        );
      } catch (err) {
        setMessage(
          err.response?.data ||
            "Failed to verify email. The link may be invalid or expired."
        );
      }
    };

    verifyEmail();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md justify-center items-center flex flex-col">
        <img src="/src/assets/verified.png" alt="" className="w-35" />
        <h2 className="text-2xl font-bold mb-6 text-center">{message}</h2>
        <button className="p-3 bg-orange-500 text-white rounded-xs">
          <a href="/">Return to Home</a>
        </button>
      </div>
    </div>
  );  
};

export default VerifyEmail;
