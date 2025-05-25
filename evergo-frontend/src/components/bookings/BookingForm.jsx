import { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode';
import { Link } from 'react-router-dom';

// Set base URL for Axios (optional if using proxy)
// axios.defaults.baseURL = 'http://localhost:5000'; // Adjust to your backend port

const BookingForm = () => {
  const [step, setStep] = useState(1);
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState({});
  const [formData, setFormData] = useState({
    PassengerName: '',
    PassengerEmail: '',
    PassengerPhone: '',
    ScheduleId: '',
    PickupPoint: '',
    NumberOfSeats: 1,
    Amount: 0,
    PaymentMethod: '',
    PaymentPhone: ''
  });
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [pickupPoints, setPickupPoints] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get('/api/Schedules');
        setSchedules(res.data || []);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Failed to load schedules.');
      }
    };
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (booking && booking.QrCodeData) {
      QRCode.toDataURL(booking.QrCodeData, { width: 128, margin: 1 }, (err, url) => {
        if (err) {
          console.error('Error generating QR code:', err);
          setError('Failed to generate QR code.');
          return;
        }
        setQrCodeUrl(url);
      });
    }
  }, [booking]);

  useEffect(() => {
    const fetchRouteDetails = async () => {
      if (selectedSchedule && selectedSchedule.RouteId) {
        try {
          if (!routes[selectedSchedule.RouteId]) {
            const res = await axios.get(`/api/Routes/${selectedSchedule.RouteId}`);
            setRoutes(prev => ({
              ...prev,
              [selectedSchedule.RouteId]: res.data || {}
            }));
          }
          const route = routes[selectedSchedule.RouteId] || {};
          let points = (route.PickupPoints || []).map(p => p.Name).filter(name => name);
          if (!points.includes('Kigali')) {
            points = [...points, 'Kigali'];
          }
          setPickupPoints(points);
          setFormData(prev => ({
            ...prev,
            PickupPoint: points.includes('Kigali') ? 'Kigali' : points[0] || ''
          }));
        } catch (err) {
          console.error('Error fetching route details:', err);
          setError('Failed to load route details. Using default pickup point.');
          setPickupPoints(['Kigali']);
          setFormData(prev => ({ ...prev, PickupPoint: 'Kigali' }));
        }
      } else {
        setPickupPoints(['Kigali']);
        setFormData(prev => ({ ...prev, PickupPoint: 'Kigali' }));
      }
    };
    fetchRouteDetails();
  }, [selectedSchedule, routes]);

  const handleChange = (key, value) => {
    const updatedFormData = { ...formData, [key]: value };

    if (key === 'ScheduleId') {
      const schedule = schedules.find(s => s.ScheduleId === parseInt(value));
      setSelectedSchedule(schedule);
      if (schedule) {
        updatedFormData.Amount = (routes[schedule.RouteId]?.Price || schedule.Price || 0) * updatedFormData.NumberOfSeats;
      }
    }

    if (key === 'NumberOfSeats' && selectedSchedule) {
      updatedFormData.Amount = (routes[selectedSchedule.RouteId]?.Price || selectedSchedule.Price || 0) * parseInt(value);
    }

    setFormData(updatedFormData);
  };

  const generateTransactionId = () => {
    const randomNum = Math.floor(Math.random() * 100000);
    return `TR${String(randomNum).padStart(5, '0')}`;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.PassengerName || !formData.PassengerEmail || !formData.PassengerPhone) {
        setError('Please fill in all personal details.');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      if (!formData.ScheduleId || !formData.PickupPoint || formData.NumberOfSeats < 1) {
        setError('Please select a schedule, pickup point, and number of seats.');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const bookingData = {
          ScheduleId: parseInt(formData.ScheduleId),
          PassengerName: formData.PassengerName,
          PassengerEmail: formData.PassengerEmail,
          PassengerPhone: formData.PassengerPhone,
          PickupPoint: formData.PickupPoint,
          NumberOfSeats: parseInt(formData.NumberOfSeats)
        };
        const res = await axios.post('/api/Bookings', bookingData);
        setBooking(res.data);
        // Fetch the booking details to ensure Amount is correct
        const bookingDetails = await axios.get(`/api/Bookings/${res.data.BookingId}`);
        setFormData(prev => ({
          ...prev,
          // Amount: bookingDetails.data.Amount // Use backend-calculated Amount
        }));
        setBooking(bookingDetails.data);
        setStep(3);
      } catch (err) {
        console.error('Error creating booking:', err);
        setError('Failed to create booking. Please try again. Details: ' + JSON.stringify(err.response?.data || err.message));
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      if (!formData.PaymentMethod || (formData.PaymentMethod === 'MobileMoney' && !formData.PaymentPhone)) {
        setError('Please select a payment method and provide a phone number if using MobileMoney.');
        return;
      }

      // Validate PaymentMethod
      const normalizedPaymentMethod = formData.PaymentMethod.replace(' ', '');
      if (!['CreditCard', 'MobileMoney'].includes(normalizedPaymentMethod)) {
        setError('Invalid payment method. Please select CreditCard or MobileMoney.');
        return;
      }

      setError(null);
      setLoading(true);
      try {
        const transactionId = generateTransactionId();
        const paymentData = {
          BookingId: booking.BookingId,
          Amount: parseFloat(formData.Amount), // Ensure Amount matches backend calculation
          PaymentMethod: normalizedPaymentMethod,
          TransactionId: transactionId
        };

        console.log('Sending payment data:', paymentData);
        const paymentRes = await axios.post('/api/Bookings/payments', paymentData);
        console.log('Payment response:', paymentRes.data);

        const updatedBookingRes = await axios.get(`/api/Bookings/${booking.BookingId}`);
        console.log('Updated booking data:', updatedBookingRes.data);
        setBooking(updatedBookingRes.data);

        setStep(4);
      } catch (err) {
        console.error('Error processing payment:', err);
        setError('Failed to process payment. Please try again. Details: ' + JSON.stringify(err.response?.data || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (loading) return <div className="text-center p-4 text-gray-500">Processing...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  const renderStepIndicator = () => (
    <div className="flex justify-center items-center mb-8">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= num ? 'bg-[#FF5733] text-white' : 'bg-gray-300 text-gray-700'}`}>
            {num}
          </div>
          {num < 3 && <div className={`w-12 h-1 ${step > num ? 'bg-[#FF5733]' : 'bg-gray-300'}`}></div>}
        </div>
      ))}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 4 ? 'bg-[#FF5733] text-white' : 'bg-gray-300 text-gray-700'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
    </div>
  );

  const renderPersonalDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Details</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full Names"
          value={formData.PassengerName}
          onChange={(e) => handleChange('PassengerName', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#FF5733]"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={formData.PassengerEmail}
          onChange={(e) => handleChange('PassengerEmail', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#FF5733]"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={formData.PassengerPhone}
          onChange={(e) => handleChange('PassengerPhone', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#FF5733]"
        />
      </div>
      <button
        onClick={handleNext}
        className="bg-[#FF5733] text-white px-6 py-2 rounded-md hover:bg-[#E64A2F]"
      >
        Next
      </button>
    </div>
  );

  const renderTripSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Trip Selection</h3>
      <div className="space-y-4">
        <select
          value={formData.ScheduleId}
          onChange={(e) => handleChange('ScheduleId', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#FF5733]"
        >
          <option value="">Select a schedule</option>
          {schedules.map(schedule => (
            <option key={schedule.ScheduleId} value={schedule.ScheduleId}>
              {schedule.RouteName || `Route ${schedule.RouteId}`} - {schedule.DepartureTime} on {new Date(schedule.TripDate).toLocaleDateString()} (Price: {schedule.Price || 'N/A'} RWF)
            </option>
          ))}
        </select>
        {selectedSchedule && (
          <div className="bg-gray-100 p-3 rounded-md">
            <p><strong>Route:</strong> {routes[selectedSchedule.RouteId]?.RouteName || selectedSchedule.RouteName || `Route ${selectedSchedule.RouteId}`}</p>
            <p><strong>Departure:</strong> {selectedSchedule.DepartureTime} on {new Date(selectedSchedule.TripDate).toLocaleDateString()}</p>
            <p><strong>Destination:</strong> {routes[selectedSchedule.RouteId]?.EndLocation || selectedSchedule.EndLocation || 'TBD'}</p>
            <p><strong>Price per Seat:</strong> {routes[selectedSchedule.RouteId]?.Price || selectedSchedule.Price || 'N/A'} RWF</p>
          </div>
        )}
        <select
          value={formData.PickupPoint}
          onChange={(e) => handleChange('PickupPoint', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#FF5733]"
        >
          <option value="">Select pickup point</option>
          {pickupPoints.map((point, index) => (
            <option key={index} value={point}>{point}</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Number of passengers"
          value={formData.NumberOfSeats}
          onChange={(e) => handleChange('NumberOfSeats', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#FF5733]"
        />
        <p className="text-sm text-gray-600">Total Price: {formData.Amount.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' }) || 'N/A'}</p>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={handleBack}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-[#FF5733] text-white px-6 py-2 rounded-md hover:bg-[#E64A2F]"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payment</h3>
      <div className="space-y-4">
        <div className="bg-gray-100 p-3 rounded-md">
          <p><strong>Total:</strong> {formData.Amount.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}</p>
          {selectedSchedule && (
            <p><strong>Route:</strong> {routes[selectedSchedule.RouteId]?.RouteName || selectedSchedule.RouteName || `Route ${selectedSchedule.RouteId}`}</p>
          )}
        </div>
        <select
          value={formData.PaymentMethod}
          onChange={(e) => handleChange('PaymentMethod', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#FF5733]"
        >
          <option value="">Payment method</option>
          <option value="CreditCard">Credit Card</option>
          <option value="MobileMoney">Mobile Money</option>
        </select>
        {formData.PaymentMethod === 'MobileMoney' && (
          <input
            type="tel"
            placeholder="Phone number"
            value={formData.PaymentPhone}
            onChange={(e) => handleChange('PaymentPhone', e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#FF5733]"
          />
        )}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={handleBack}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-[#FF5733] text-white px-6 py-2 rounded-md hover:bg-[#E64A2F]"
        >
          Confirm and Pay
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-4 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-[#FF5733] rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-semibold">Booking Confirmed!</h3>
      <p>
        Thank you for your payment. Your ticket details will be sent via SMS and email shortly.<br />
        For assistance, contact support@evergo.com or +1-234-567-8901.
      </p>
      <p className="text-sm">Safe travels! 🌟</p>
      {booking && (
        <div className="mt-4">
          <p>Booking Reference: {booking.BookingReference}</p>
          <p>Ticket Code: {booking.TicketCode}</p>
          <p>Payment Status: {booking.PaymentStatus || 'Pending'}</p>
          <div className="flex justify-center mt-2">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" width="128" height="128" />
            ) : (
              <p>Generating QR code...</p>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => window.location.href = '/'}
        className="mt-4 bg-[#FF5733] text-white px-6 py-2 rounded-md hover:bg-[#E64A2F]"
      >
        Back to Home
      </button>
    </div>
  );

  const renderNavbar = () => (
    <header className="bg-[#F2F2F2] text-gray py-4 fixed top-0 w-full shadow-md z-10">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center">
          <img src="/src/assets/Logo.png" alt="Logo" className="w-24" />
        </div>
        <nav className="space-x-6">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/" className="hover:text-gray-300">About Us</Link>
          <Link to="/bookings/add" className="hover:text-gray-300">Booking</Link>
          <Link to="/login" className="bg-[#FF5733] text-white px-4 py-2 rounded-md hover:bg-[#E64A2F]">Login</Link>
        </nav>
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="bg-[#1F2937] text-white py-6">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div>
          <Link to="/" className="hover:text-gray-300 mr-4">Home</Link>
          <Link to="/#" className="hover:text-gray-300 mr-4">About</Link>
          <Link to="/bookings/add" className="hover:text-gray-300 mr-4">Booking</Link>
          <Link to="#" className="hover:text-gray-300">Contact</Link>
        </div>
        <p>© Copyright 2025</p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#ced2da]">
      {renderNavbar()}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Booking Form</h2>
          {renderStepIndicator()}
          {step === 1 && renderPersonalDetails()}
          {step === 2 && renderTripSelection()}
          {step === 3 && renderPayment()}
          {step === 4 && renderConfirmation()}
        </div>
      </div>
      {renderFooter()}
    </div>
  );
};

export default BookingForm;