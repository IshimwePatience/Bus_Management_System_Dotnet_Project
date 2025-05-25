const ReportPreview = ({ reportType, reportData, startDate, endDate }) => {
  if (!reportData || !Array.isArray(reportData)) return null;

  const getTable = () => {
    if (reportType === 'bookingSummary' && !Array.isArray(reportData)) {
      return (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Metric</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b border-gray-200 text-gray-600">Total Revenue</td>
              <td className="py-2 px-4 border-b border-gray-200 text-gray-600">${reportData.totalRevenue}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b border-gray-200 text-gray-600">Number of Bookings</td>
              <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{reportData.bookingCount}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b border-gray-200 text-gray-600">Average Revenue per Booking</td>
              <td className="py-2 px-4 border-b border-gray-200 text-gray-600">${reportData.averageRevenue}</td>
            </tr>
            <tr>
              <td colSpan="2" className="py-2 px-4 border-b border-gray-200 font-semibold text-center text-gray-700">Payment Method Breakdown</td>
            </tr>
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Payment Method</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Amount</th>
            </tr>
            {reportData.paymentMethods.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.method}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">${row.amount}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="2" className="py-2 px-4 border-b border-gray-200 font-semibold text-center text-gray-700">Daily Revenue Breakdown</td>
            </tr>
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Amount</th>
            </tr>
            {reportData.dailyBreakdown.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.date}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">${row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (reportType === 'driverPerformance') {
      return (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Driver Name</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Trips Completed</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.driverName}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.trips}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">${row.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (reportType === 'busUtilization') {
      return (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Bus Number</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Trips</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.busNumber}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.trips}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">${row.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (reportType === 'upcomingSchedules') {
      return (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Schedule ID</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Route</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Bus</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Driver</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Trip Date</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Departure Time</th>
              <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.scheduleId}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.routeName}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.busNumber}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.driverName}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.tripDate}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.departureTime}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-gray-600">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  };

  return reportData && reportData.length > 0 ? (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        {reportType === 'bookingSummary' ? 'Booking Summary Report' :
         reportType === 'driverPerformance' ? 'Driver Performance Report' :
         reportType === 'busUtilization' ? 'Bus Utilization Report' :
         'Upcoming Schedules Report'} (Date Range: {startDate} to {endDate})
      </h3>
      <div className="overflow-x-auto">
        {getTable()}
      </div>
    </div>
  ) : reportData && reportData.length === 0 ? (
    <div className="text-center text-gray-500 py-4">
      No data available for the selected report type and date range.
    </div>
  ) : null;
};

export default ReportPreview;