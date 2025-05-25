import { useState, useEffect, useRef } from "react";
import axios from "axios";
import QrScanner from "qr-scanner";
import { jwtDecode } from "jwt-decode";
import EditDriverForm from "../users/EditDriverForm";

const DriverDashboard = () => {
  const [driver, setDriver] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isTripEnded, setIsTripEnded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  // Axios instance
  const api = axios.create({
    baseURL: "http://localhost:5172",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });

  // Decode JWT token and fetch driver details
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const fetchDriverDetails = async () => {
        try {
          const response = await api.get(`/api/Users/${decoded.id}`);
          const driverData = response.data;
          // Map the API response to the exact fields expected by EditDriverForm
          setDriver({
            UserId: driverData.UserId || decoded.id,
            Name: driverData.Name || decoded.name || "",
            Phone: driverData.Phone || "",
            Email: driverData.Email || "",
            LicenseNumber: driverData.LicenseNumber || "",
            LicenseExpiry: driverData.LicenseExpiry || "", // Will be formatted as a date string in EditDriverForm
            LicenseImage: driverData.LicenseImage || "", // Base64 string or URL, if available
            Role: driverData.Role || decoded.role || "", // Optional, for completeness
          });
        } catch (err) {
          console.error("Driver fetch error:", err.response?.data || err.message);
          setError(
            `Failed to fetch driver details: ${
              err.response?.data?.message || err.message
            }`
          );
        }
      };
      fetchDriverDetails();
    } catch (err) {
      console.error("Token decode error:", err);
      setError("Invalid authentication token. Please log in again.");
    }
  }, []);

  // Update driver state after EditDriverForm updates
  const handleDriverUpdate = (updatedDriver) => {
    setDriver({
      ...driver,
      Name: updatedDriver.Name,
      Phone: updatedDriver.Phone,
      Email: updatedDriver.Email,
      LicenseNumber: updatedDriver.LicenseNumber,
      LicenseExpiry: updatedDriver.LicenseExpiry,
      LicenseImage: updatedDriver.LicenseImage,
    });
    setIsProfileModalOpen(false); // Close the modal after update
  };

  // Fetch driver's schedules
  useEffect(() => {
    if (!driver?.UserId) return;

    const fetchDriverSchedules = async () => {
      try {
        const response = await api.get(`/api/Schedules/driver/${driver.UserId}`);
        const fetchedSchedules = response.data || [];
        setSchedules(fetchedSchedules);
        const activeSchedule = fetchedSchedules.find(
          (s) => s.Status === "Scheduled" || s.Status === "InProgress"
        );
        if (activeSchedule) {
          setSelectedScheduleId(activeSchedule.ScheduleId);
        } else if (fetchedSchedules.length > 0) {
          setSelectedScheduleId(fetchedSchedules[0].ScheduleId);
        } else {
          setError("No schedules assigned to this driver.");
        }
      } catch (err) {
        console.error("Schedules fetch error:", err.response?.data || err.message);
        setError(
          `Failed to fetch schedules: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    };
    fetchDriverSchedules();
  }, [driver?.UserId]);

  // Fetch bookings for the selected schedule
  useEffect(() => {
    if (!selectedScheduleId) return;
    const fetchBookings = async () => {
      try {
        const response = await api.get(`/api/Bookings/schedule/${selectedScheduleId}`);
        setBookings(response.data || []);
        console.log("Fetched bookings:", response.data);
        const selectedSchedule = schedules.find(
          (s) => s.ScheduleId === selectedScheduleId
        );
        if (selectedSchedule && selectedSchedule.Status === "Completed") {
          setIsTripEnded(true);
        } else {
          setIsTripEnded(false);
        }
      } catch (err) {
        console.error("Bookings fetch error:", err.response?.data || err.message);
        setError(
          `Failed to fetch bookings: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    };
    fetchBookings();
  }, [selectedScheduleId, schedules]);

  // Sorting logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedBookings = [...bookings].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === "VerificationStatus") {
        aValue = aValue || "Pending";
        bValue = bValue || "Pending";
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setBookings(sortedBookings);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // QR Scanner logic
  const startScanner = () => {
    if (!videoRef.current) {
      setError("Video element not found.");
      return;
    }

    setIsScanning(true);
    setError(null);
    setSuccess(null);

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        stopScanner();
        const decodedText = result.data.trim();
        console.log("Decoded QR code:", decodedText);

        let booking = bookings.find(
          (b) => b.QrCodeData && b.QrCodeData.trim() === decodedText
        );
        if (!booking) {
          const ticketCodeMatch = decodedText.match(/ticket:([A-Z0-9-]+)(?:\||$)/);
          if (ticketCodeMatch && ticketCodeMatch[1]) {
            const ticketCode = ticketCodeMatch[1];
            booking = bookings.find((b) => b.TicketCode === ticketCode);
          }
        }

        if (booking) {
          api
            .put(`/api/Bookings/${booking.BookingId}/verify`)
            .then(() => {
              setBookings((prev) =>
                prev.map((b) =>
                  b.BookingId === booking.BookingId
                    ? { ...b, VerificationStatus: "Verified" }
                    : b
                )
              );
              setSuccess(`Ticket verified for ${booking.PassengerName}`);
            })
            .catch((err) => {
              setError(
                "Failed to verify ticket: " +
                  (err.response?.data?.message || err.message)
              );
            });
        } else {
          setError("No matching booking found for this QR code.");
        }
      },
      {
        onDecodeError: (error) => {
          console.error("Decode error:", error);
          setError("Failed to decode QR code: " + error.message);
        },
        maxScansPerSecond: 10,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scanner
      .start()
      .catch((err) => {
        console.error("Scanner start error:", err);
        setError("Failed to start scanner: " + err.message);
        setIsScanning(false);
      });

    scannerRef.current = scanner;
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  // Handle image upload for QR code scanning
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError("Please select an image file.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      if (!result.data) {
        setError("No QR code detected in the uploaded image.");
        return;
      }

      const decodedText = result.data.trim();
      let booking = bookings.find(
        (b) => b.QrCodeData && b.QrCodeData.trim() === decodedText
      );
      if (!booking) {
        const ticketCodeMatch = decodedText.match(/ticket:([A-Z0-9-]+)(?:\||$)/);
        if (ticketCodeMatch && ticketCodeMatch[1]) {
          const ticketCode = ticketCodeMatch[1];
          booking = bookings.find((b) => b.TicketCode === ticketCode);
        }
      }

      if (booking) {
        await api.put(`/api/Bookings/${booking.BookingId}/verify`);
        setBookings((prev) =>
          prev.map((b) =>
            b.BookingId === booking.BookingId
              ? { ...b, VerificationStatus: "Verified" }
              : b
          )
        );
        setSuccess(`Ticket verified from image for ${booking.PassengerName}`);
      } else {
        setError("No matching booking found for this QR code.");
      }
    } catch (err) {
      console.error("Image scan error:", err);
      setError("Failed to scan QR code from image: " + err.message);
    }
  };

  // Mark remaining bookings as No Show
  const markNoShow = async () => {
    try {
      const updates = bookings
        .filter((b) => b.VerificationStatus !== "Verified")
        .map((b) => api.put(`/api/Bookings/${b.BookingId}/noshow`));
      await Promise.all(updates);
      setBookings((prev) =>
        prev.map((b) =>
          b.VerificationStatus !== "Verified"
            ? { ...b, VerificationStatus: "NoShow" }
            : b
        )
      );
      setSuccess("Marked remaining passengers as No Show.");
      setIsTripEnded(true);
      await api.put(`/api/Schedules/${selectedScheduleId}/status`, "Completed", {
        headers: { "Content-Type": "application/json" },
      });
      setSchedules((prev) =>
        prev.map((s) =>
          s.ScheduleId === selectedScheduleId ? { ...s, Status: "Completed" } : s
        )
      );
    } catch (err) {
      setError(
        "Failed to update statuses: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(
    (booking) =>
      booking.PassengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.PassengerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.TicketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.BookingId.toString().includes(searchQuery)
  );

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          {error || "Loading driver details..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center px-12">
        <div className="flex items-center space-x-2">
          <img src="/src/assets/logo.png" alt="EverGo Logo" className="w-24" />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <span className="font-semibold">{driver.Name}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Update Modal */}
      {isProfileModalOpen && (
        <EditDriverForm
          driver={driver}
          onUpdate={handleDriverUpdate}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-grow p-12">
        <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>

        {/* Schedule Selector */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Select Schedule</label>
          <select
            value={selectedScheduleId || ""}
            onChange={(e) => setSelectedScheduleId(parseInt(e.target.value))}
            className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={schedules.length === 0}
          >
            {schedules.length === 0 ? (
              <option value="">No schedules available</option>
            ) : (
              schedules.map((schedule) => (
                <option key={schedule.ScheduleId} value={schedule.ScheduleId}>
                  {`${schedule.TripDate} at ${schedule.DepartureTime} - ${schedule.RouteName} (${schedule.Status})`}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Scan Options */}
        <div className="mb-4 flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 space-y-2 sm:space-y-0">
          <button
            onClick={startScanner}
            disabled={isScanning || isTripEnded || !selectedScheduleId}
            className={`w-full sm:w-auto px-4 py-2 rounded-md text-white flex items-center justify-center space-x-2 ${
              isScanning || isTripEnded || !selectedScheduleId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 9h6M3 15h6M9 3v6M9 15v6M15 3v6M15 15v6M3 3h6v6H3V3zM15 3h6v6h-6V3zM3 15h6v6H3v-6zM15 15h6v6h-6v-6z"
              />
            </svg>
            <span>Scan Ticket with Camera</span>
          </button>
          <label className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer flex items-center justify-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Upload Image to Scan</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isTripEnded || !selectedScheduleId}
            />
          </label>
          {!isTripEnded && selectedScheduleId && (
            <button
              onClick={markNoShow}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              End Trip & Mark No Show
            </button>
          )}
        </div>

        {/* QR Code Scanner with Cancel Button */}
        <div className="relative w-full max-w-md mx-auto mb-4">
          <video
            ref={videoRef}
            className={`w-full ${isScanning ? "block" : "hidden"}`}
            style={{ height: isScanning ? "300px" : "0" }}
          />
          {isScanning && (
            <button
              onClick={stopScanner}
              className="absolute top-2 right-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("BookingId")}
                >
                  Booking ID {getSortIcon("BookingId")}
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("PassengerName")}
                >
                  Passenger Name {getSortIcon("PassengerName")}
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("PassengerPhone")}
                >
                  Phone number {getSortIcon("PassengerPhone")}
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("TicketCode")}
                >
                  Ticket Code {getSortIcon("TicketCode")}
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("PickupPoint")}
                >
                  Pickup Location {getSortIcon("PickupPoint")}
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("VerificationStatus")}
                >
                  Verification Status {getSortIcon("VerificationStatus")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking.BookingId}
                    className="border-b-gray-900 hover:bg-gray-50"
                  >
                    <td className="p-2">{booking.BookingId}</td>
                    <td className="p-2">{booking.PassengerName}</td>
                    <td className="p-2">{booking.PassengerPhone}</td>
                    <td className="p-2">{booking.TicketCode}</td>
                    <td className="p-2">{booking.PickupPoint}</td>
                    <td className="p-2">{booking.VerificationStatus || "Pending"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-2 text-center text-gray-500">
                    No bookings found for this schedule.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;