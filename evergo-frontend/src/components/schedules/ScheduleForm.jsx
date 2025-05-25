import { useState, useEffect } from 'react'
import GenericForm from '../generic/GenericForm'
import axios from 'axios'

const ScheduleForm = ({ isEdit, scheduleId }) => {
  const [routes, setRoutes] = useState([])
  const [drivers, setDrivers] = useState([])
  const [scheduleData, setScheduleData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get('/api/Routes')
        setRoutes(res.data || [])
      } catch (err) {
        console.error('Error fetching routes:', err)
        setError('Failed to load routes.')
      }
    }

    const fetchDrivers = async () => {
      try {
        const res = await axios.get('/api/Users/drivers')
        setDrivers(res.data || [])
      } catch (err) {
        console.error('Error fetching drivers:', err)
        setError('Failed to load drivers.')
      }
    }

    const fetchSchedule = async () => {
      if (isEdit && scheduleId) {
        try {
          const res = await axios.get(`/api/Schedules/${scheduleId}`)
          setScheduleData(res.data)
        } catch (err) {
          console.error('Error fetching schedule:', err)
          setError('Failed to load schedule data.')
        }
      }
    }

    fetchRoutes()
    fetchDrivers()
    fetchSchedule()
  }, [isEdit, scheduleId])

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  const formatTimeSpan = (timeSpan) => {
    if (!timeSpan) return '';
    const [hours, minutes] = timeSpan.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  const parseTimeToTimeSpan = (time) => {
    if (!time) return '00:00:00';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}:00`;
  }

  const initialValues = isEdit && scheduleData
    ? {
        RouteId: scheduleData.RouteId?.toString() || '',
        BusId: scheduleData.BusId?.toString() || '',
        DriverId: scheduleData.DriverId?.toString() || '',
        DepartureTime: formatTimeSpan(scheduleData.DepartureTime),
        TripDate: scheduleData.TripDate ? scheduleData.TripDate.split('T')[0] : ''
      }
    : {
        RouteId: '',
        BusId: '',
        DriverId: '',
        DepartureTime: '',
        TripDate: ''
      }

  const routeOptions = routes.length > 0
    ? routes.map(route => ({
        value: route.RouteId?.toString() || '',
        label: route.RouteName || 'Unnamed Route'
      }))
    : [{ value: '', label: 'No routes available' }];

  const driverOptions = drivers.length > 0
    ? drivers.map(driver => ({
        value: driver.UserId?.toString() || '',
        label: driver.Name || 'Unnamed Driver'
      }))
    : [{ value: '', label: 'No drivers available' }];

  return (
    <div className="p-6">
      <GenericForm
        title={isEdit ? 'Edit Schedule' : 'Create Schedule'}
        endpoint="/api/Schedules"
        isEdit={isEdit}
        idKey="ScheduleId"
        initialValues={initialValues}
        fields={[
          {
            key: 'RouteId',
            label: 'Route',
            type: 'select',
            options: routeOptions,
            required: true
          },
          {
            key: 'BusId',
            label: 'Bus ID',
            type: 'number',
            placeholder: 'Enter bus ID',
            required: true
          },
          {
            key: 'DriverId',
            label: 'Driver',
            type: 'select',
            options: driverOptions,
            required: true
          },
          {
            key: 'DepartureTime',
            label: 'Departure Time',
            type: 'time',
            placeholder: 'Select departure time',
            required: true
          },
          {
            key: 'TripDate',
            label: 'Trip Date',
            type: 'date',
            placeholder: 'Select trip date',
            required: true
          }
        ]}
        transformData={(data) => ({
          RouteId: parseInt(data.RouteId),
          BusId: parseInt(data.BusId),
          DriverId: parseInt(data.DriverId),
          DepartureTime: parseTimeToTimeSpan(data.DepartureTime),
          TripDate: data.TripDate
        })}
        onSuccess={() => window.location.href = '/schedules'}
      />
    </div>
  )
}

export default ScheduleForm