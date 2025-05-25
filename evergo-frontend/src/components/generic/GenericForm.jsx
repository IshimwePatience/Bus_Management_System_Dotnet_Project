import { useState, useEffect } from 'react'
import axios from 'axios'

const GenericForm = ({ title, endpoint, isEdit, idKey, initialValues, fields, additionalFields, transformData, onSuccess, onFormDataChange }) => {
  const [formData, setFormData] = useState(initialValues || {})
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    setFormData(initialValues || {})
    if (onFormDataChange) {
      onFormDataChange(initialValues || {})
    }
  }, [initialValues, onFormDataChange])

  const handleChange = (key, value) => {
    const updatedFormData = { ...formData, [key]: value }
    setFormData(updatedFormData)
    if (onFormDataChange) {
      onFormDataChange(updatedFormData)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const data = transformData ? transformData(formData) : formData
      if (isEdit) {
        await axios.put(`${endpoint}/${formData[idKey]}`, data)
      } else {
        await axios.post(endpoint, data)
      }
      setSuccess('Saved successfully!')
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error saving:', err)
      setError('Failed to save: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
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
        {fields.map(field => (
          <div key={field.key} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'select' ? (
              <select
                value={formData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                required={field.required}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.isArray(field.options) ? (
                  field.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label || 'Unnamed Option'}
                    </option>
                  ))
                ) : (
                  <option value="">No options available</option>
                )}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                value={formData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
        {additionalFields && additionalFields}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
        >
          {isEdit ? title.replace('Create', 'Update') : title}
        </button>
      </form>
    </div>
  )
}

export default GenericForm