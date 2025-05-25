import { useState, useEffect } from 'react';
import axios from 'axios';
import ReportFilters from './ReportFilters';
import ReportPreview from './ReportPreview';
import ReportPDFGenerator from './ReportPDFGenerator';

// Utility function to convert PascalCase keys to camelCase
const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  } else if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: 'http://localhost:5172',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  },
});

const ReportPage = () => {
  const [reportType, setReportType] = useState('bookingSummary');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // 2025-05-25
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const companyName = "EverGo Bus Management";
  const generatedBy = "System Admin";
  const generatedAt = "03:54 AM CAT on Sunday, May 25, 2025"; // Updated to current time

  useEffect(() => {
    fetchReportData();
  }, [reportType, startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      if (reportType === 'bookingSummary') {
        const response = await api.get('/api/Bookings/date-range', {
          params: { start: startDate, end: endDate },
        });
        const bookings = toCamelCase(Array.isArray(response.data) ? response.data : []);
        console.log('Booking Summary API Response:', bookings);

        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
        const bookingCount = bookings.length;
        const averageRevenue = bookingCount ? (totalRevenue / bookingCount).toFixed(2) : 0;

        const paymentMethods = [];
        for (const booking of bookings) {
          try {
            const payment = await api.get(`/api/Payments/booking/${booking.bookingId}`);
            const method = toCamelCase(payment.data)?.paymentMethod || 'Unknown';
            const amount = booking.amount || 0;
            const existing = paymentMethods.find(pm => pm.method === method);
            if (existing) {
              existing.amount += amount;
            } else {
              paymentMethods.push({ method, amount });
            }
          } catch (err) {
            console.warn(`Failed to fetch payment for booking ${booking.bookingId}:`, err);
            const method = 'Unknown';
            const amount = booking.amount || 0;
            const existing = paymentMethods.find(pm => pm.method === method);
            if (existing) {
              existing.amount += amount;
            } else {
              paymentMethods.push({ method, amount });
            }
          }
        }

        const dailyBreakdown = bookings.reduce((acc, booking) => {
          const date = booking.createdAt ? booking.createdAt.split('T')[0] : 'Unknown';
          const amount = booking.amount || 0;
          const existing = acc.find(db => db.date === date);
          if (existing) {
            existing.amount += amount;
          } else {
            acc.push({ date, amount });
          }
          return acc;
        }, []);

        setReportData({
          totalRevenue: totalRevenue.toFixed(2),
          bookingCount,
          averageRevenue,
          paymentMethods: paymentMethods.map(pm => ({
            method: pm.method,
            amount: pm.amount.toFixed(2),
          })),
          dailyBreakdown: dailyBreakdown.map(db => ({
            date: db.date,
            amount: db.amount.toFixed(2),
          })),
        });

      } else if (reportType === 'driverPerformance') {
        const response = await api.get('/api/Schedules/date-range', {
          params: { start: startDate, end: endDate },
        });
        const schedules = toCamelCase(Array.isArray(response.data) ? response.data : []);
        console.log('Driver Performance API Response:', schedules);

        const driverPerformance = schedules.reduce((acc, schedule) => {
          const driverId = schedule.driverId;
          const driverName = schedule.driverName || 'Unknown';
          const existing = acc.find(dp => dp.driverId === driverId);
          if (existing) {
            existing.trips += 1;
            existing.revenue += schedule.price || 0;
          } else {
            acc.push({ driverId, driverName, trips: 1, revenue: schedule.price || 0 });
          }
          return acc;
        }, []);

        setReportData(driverPerformance.map(dp => ({
          driverName: dp.driverName,
          trips: dp.trips,
          revenue: dp.revenue.toFixed(2),
        })));

      } else if (reportType === 'busUtilization') {
        const response = await api.get('/api/Schedules/date-range', {
          params: { start: startDate, end: endDate },
        });
        const schedules = toCamelCase(Array.isArray(response.data) ? response.data : []);
        console.log('Bus Utilization API Response:', schedules);

        const busUtilization = schedules.reduce((acc, schedule) => {
          const busId = schedule.busId;
          const busNumber = schedule.busNumber || 'Unknown';
          const existing = acc.find(bu => bu.busId === busId);
          if (existing) {
            existing.trips += 1;
            existing.revenue += schedule.price || 0;
          } else {
            acc.push({ busId, busNumber, trips: 1, revenue: schedule.price || 0 });
          }
          return acc;
        }, []);

        setReportData(busUtilization.map(bu => ({
          busNumber: bu.busNumber,
          trips: bu.trips,
          revenue: bu.revenue.toFixed(2),
        })));

      } else if (reportType === 'upcomingSchedules') {
        const response = await api.get('/api/Schedules/date-range', {
          params: { start: startDate, end: endDate },
        });
        const schedules = toCamelCase(Array.isArray(response.data) ? response.data : []);
        console.log('Upcoming Schedules API Response:', schedules);

        const upcomingSchedules = schedules.filter(schedule => schedule.status !== 'Completed' && schedule.status !== 'Cancelled');
        setReportData(upcomingSchedules.map(schedule => ({
          scheduleId: schedule.scheduleId,
          routeName: schedule.routeName || '-',
          busNumber: schedule.busNumber || '-',
          driverName: schedule.driverName || '-',
          departureTime: schedule.departureTime || '-',
          tripDate: schedule.tripDate || '-',
          status: schedule.status || '-',
        })));
      }
    } catch (err) {
      console.error(`Error fetching ${reportType} report data:`, err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Unknown error';
      setError(`Failed to load ${reportType} report data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Bus Management Reports - {companyName}</h2>

      <ReportFilters
        reportType={reportType}
        setReportType={setReportType}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {loading && (
        <div className="flex justify-center items-center mb-6">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Generating report...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <ReportPreview reportType={reportType} reportData={reportData} startDate={startDate} endDate={endDate} />

      <ReportPDFGenerator
        reportType={reportType}
        reportData={reportData}
        startDate={startDate}
        endDate={endDate}
        companyName={companyName}
        generatedBy={generatedBy}
        generatedAt={generatedAt}
      />
    </div>
  );
};

export default ReportPage;