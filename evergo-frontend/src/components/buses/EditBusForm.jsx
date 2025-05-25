import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const EditBusForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    BusId: '',
    BusNumber: '',
    Model: '',
    Capacity: '',
    BusStatus: 'Active',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchBus = async () => {
      try {
        console.log('Fetching bus with ID:', id)
        const res = await axios.get(`/api/Buses/${id}`)
        console.log('Fetched bus data:', res.data)
        setFormData({
          BusId: res.data.BusId,
          BusNumber: res.data.BusNumber || '',
          Model: res.data.Model || '',
          Capacity: res.data.Capacity || '',
          BusStatus: res.data.Status || 'Active',
        })
      } catch (err) {
        console.error('Error fetching bus:', err)
        setError('Failed to load bus data: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchBus()
  }, [id])

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const data = {
      BusNumber: formData.BusNumber,
      Model: formData.Model,
      Capacity: parseInt(formData.Capacity) || 0,
      Status: formData.BusStatus,
    }

    try {
      await axios.put(`/api/Buses/${id}`, data)
      setSuccess('Bus updated successfully!')
      setTimeout(() => navigate('/buses'), 1000)
    } catch (err) {
      console.error('Error updating bus:', err)
      setError('Failed to update bus: ' + (err.response?.data?.message || err.message))
    }
  }

  if (loading) {
    return <div className="text-center p-4 text-gray-500">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="space-y-4 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800">Edit Bus</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Bus Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.BusNumber}
            onChange={(e) => handleChange('BusNumber', e.target.value)}
            placeholder="Enter bus number"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.Model}
            onChange={(e) => handleChange('Model', e.target.value)}
            placeholder="Enter bus model"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Capacity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.Capacity}
            onChange={(e) => handleChange('Capacity', e.target.value)}
            placeholder="Enter passenger capacity"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.Status}
            onChange={(e) => handleChange('BusStatus', e.target.value)}
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="OutofService">Out of Service</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
        >
          Update Bus
        </button>
      </form>
    </div>
  )
}

export default EditBusForm