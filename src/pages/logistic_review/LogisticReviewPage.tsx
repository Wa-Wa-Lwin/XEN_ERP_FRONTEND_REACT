import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, Button, Spinner } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useAuth } from '@context/AuthContext'
import LogisticReviewForm from './components/LogisticReviewForm'
import type { ShipmentForReview } from './types/logistic-review.types'
import axios from 'axios'

const LogisticReviewPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [shipmentData, setShipmentData] = useState<ShipmentForReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user has logistic access (you can modify this based on your auth logic)
  const hasLogisticAccess = user?.role === 'logistic' || user?.role === 'admin'

  useEffect(() => {
    // Redirect if user doesn't have access
    if (!hasLogisticAccess) {
      navigate('/shipment')
      return
    }

    // Fetch shipment data
    fetchShipmentData()
  }, [id, hasLogisticAccess, navigate])

  const fetchShipmentData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Replace with your actual API endpoint
      const response = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/shipments/${id}`)

      if (response.data && response.data.data) {
        setShipmentData(response.data.data)
      } else {
        setError('Shipment data not found')
      }
    } catch (err) {
      console.error('Error fetching shipment data:', err)
      setError('Failed to load shipment data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSuccess = () => {
    // Navigate back to shipment table or show success message
    navigate('/shipment')
  }

  const handleCancel = () => {
    navigate('/shipment')
  }

  if (!hasLogisticAccess) {
    return null // Component will redirect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !shipmentData) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardBody className="text-center p-8">
          <Icon icon="solar:danger-triangle-bold" className="w-16 h-16 mx-auto text-danger mb-4" />
          <h3 className="text-xl font-semibold text-danger mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error || 'Shipment not found'}</p>
          <Button
            color="primary"
            onPress={() => navigate('/shipment')}
            startContent={<Icon icon="solar:arrow-left-linear" />}
          >
            Back to Shipments
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <Card shadow="sm" className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="light"
              onPress={handleCancel}
              aria-label="Go back"
            >
              <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Logistic Review</h1>
              <p className="text-gray-600">Update shipment details for PO: {shipmentData.po_number}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Shipment ID</p>
            <p className="font-semibold">#{shipmentData.shipmentRequestID}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Shipment Info Summary */}
      <Card shadow="sm" className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Shipment Information</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">PO Number</p>
              <p className="font-medium">{shipmentData.po_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">PO Date</p>
              <p className="font-medium">{shipmentData.po_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{shipmentData.request_status}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Update Form */}
      <LogisticReviewForm
        shipmentData={shipmentData}
        onSuccess={handleUpdateSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default LogisticReviewPage