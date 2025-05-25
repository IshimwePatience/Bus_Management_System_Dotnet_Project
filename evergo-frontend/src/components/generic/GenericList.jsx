import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const GenericList = ({ title, endpoint, fields, idKey = 'id', addPath, editPath, onDataFetched }) => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await axios.get(endpoint)
        console.log('API Response:', res.data)
        setData(res.data)
        if (onDataFetched) onDataFetched(res.data)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [endpoint, onDataFetched])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${endpoint}/${id}`)
        setData(data.filter((item) => item[idKey] !== id))
      } catch (err) {
        console.error('Error deleting item:', err)
        setError('Failed to delete item. Please try again.')
      }
    }
  }

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  if (loading) {
    return <div className="text-center p-4 text-gray-500">Loading...</div>
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-1/3 focus:ring-2 focus:ring-[#00C4B4]"
        />
        {addPath && (
          <Link
            to={addPath}
            className="bg-[#3066BE] hover:bg-teal-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New
          </Link>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {fields.map((field) => (
                <th key={field.key} className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {field.label}
                </th>
              ))}
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item[idKey]} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                {fields.map((field) => (
                  <td key={field.key} className="border-b border-gray-200 px-4 py-2 text-sm">
                    {field.render ? field.render(item) : item[field.key] || '-'}
                  </td>
                ))}
                <td className="border-b border-gray-200 px-4 py-2 text-sm">
                  <div className="flex gap-2">
                    {editPath && (
                      <button
                        onClick={() => navigate(`${editPath}/${item[idKey]}`)}
                        className="bg-[#3066BE] hover:bg-teal-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item[idKey])}
                      className="bg-[#FF0000] hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GenericList