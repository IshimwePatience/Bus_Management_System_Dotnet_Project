import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const EditRouteForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    RouteId: '',
    RouteName: '',
    StartLocation: '',
    EndLocation: '',
    Price: '',
  })
  const [pickupPoints, setPickupPoints] = useState([{ Name: '' }])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        console.log('Fetching route with ID:', id)
        const res = await axios.get(`/api/Routes/${id}`)
        console.log('Fetched route data:', res.data)
        setFormData({
          RouteId: res.data.RouteId,
          RouteName: res.data.RouteName || '',
          StartLocation: res.data.StartLocation || '',
          EndLocation: res.data.EndLocation || '',
          Price: res.data.Price || '',
        })
        setPickupPoints(
          res.data.PickupPoints?.length > 0
            ? res.data.PickupPoints.map(point => ({ Name: point.Name || '' }))
            : [{ Name: '' }]
        )
      } catch (err) {
        console.error('Error fetching route:', err)
        setError('Failed to load route data: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchRoute()
  }, [id])

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value })
  }

  const handlePickupPointChange = (index, value) => {
    const updatedPoints = [...pickupPoints]
    updatedPoints[index].Name = value
    setPickupPoints(updatedPoints)
  }

  const handleAddPickupPoint = () => {
    setPickupPoints([...pickupPoints, { Name: '' }])
  }

  const handleRemovePickupPoint = (index) => {
    setPickupPoints(pickupPoints.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const points = pickupPoints
      .filter((point) => point.Name)
      .map((point) => ({
        Name: point.Name,
        Latitude: 0,
        Longitude: 0,
      }))

    if (points.length === 0) {
      setError('At least one pickup point with a name is required.')
      return
    }

    const data = {
      ...formData,
      Price: parseFloat(formData.Price) || 0,
      PickupPoints: points,
    }

    try {
      await axios.put(`/api/Routes/${id}`, data)
      setSuccess('Route updated successfully!')
      setTimeout(() => navigate('/routes'), 1000)
    } catch (err) {
      console.error('Error updating route:', err)
      setError('Failed to update route: ' + (err.response?.data?.message || err.message))
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
      <h2 className="text-xl font-semibold text-gray-800">Edit Route</h2>
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
            Route Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.RouteName}
            onChange={(e) => handleChange('RouteName', e.target.value)}
            placeholder="Enter route name"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Start Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.StartLocation}
            onChange={(e) => handleChange('StartLocation', e.target.value)}
            placeholder="Enter start location"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            End Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.EndLocation}
            onChange={(e) => handleChange('EndLocation', e.target.value)}
            placeholder="Enter end location"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Price (RWF) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.Price}
            onChange={(e) => handleChange('Price', e.target.value)}
            placeholder="Enter price"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700 mt-4">Pickup Points</h2>
          {pickupPoints.map((point, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-md space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Point Name
                </label>
                <input
                  type="text"
                  value={point.Name}
                  onChange={(e) => handlePickupPointChange(index, e.target.value)}
                  placeholder="Enter pickup point name"
                  className="bg-[#F5F6FA] border-none p-2 w-full rounded-md focus:ring-2 focus:ring-[#00C4B4]"
                  required
                />
              </div>
              {pickupPoints.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePickupPoint(index)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddPickupPoint}
            className="bg-[#00C4B4] hover:bg-teal-600 text-white px-4 py-2 rounded-md"
          >
            Add Pickup Point
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
        >
          Update Route
        </button>
      </form>
    </div>
  )
}

export default EditRouteForm