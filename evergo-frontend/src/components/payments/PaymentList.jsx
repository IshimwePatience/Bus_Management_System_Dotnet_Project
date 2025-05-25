import { useState, useEffect } from 'react'
import axios from 'axios'

const PaymentList = () => {
  const [payments, setPayments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const res = await axios.get('/api/Payments')
        console.log('API Response:', res.data)
        setPayments(res.data)
      } catch (err) {
        console.error('Error fetching payments:', err)
        setError('Failed to load payments. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  if (loading) return <div className="text-center p-4 text-gray-500">Loading...</div>
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm">
        Retry
      </button>
    </div>
  )

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search payments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-1/2 focus:ring-2 focus:ring-[#00C4B4]"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Booking ID</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Payment Method</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {payments
              .filter((payment) =>
                Object.values(payment).some((val) =>
                  val?.toString().toLowerCase().includes(search.toLowerCase())
                )
              )
              .map((payment, index) => (
                <tr key={payment.PaymentId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{payment.PaymentId || '-'}</td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{payment.BookingId || '-'}</td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{payment.Amount || '-'}</td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{payment.PaymentMethod || '-'}</td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{payment.TransactionId || '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PaymentList