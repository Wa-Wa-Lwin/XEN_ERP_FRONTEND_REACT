import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Spinner
} from '@heroui/react'
import axios from 'axios'
import type { ShipmentRequest, ShipmentRequestsResponse } from '../../../types'

const ShipmentTable = () => {
  const [shipmentRequests, setShipmentRequests] = useState<ShipmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchShipmentRequests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiUrl = import.meta.env.VITE_APP_GET_ALL_SHIPMENT_REQUESTS
      if (!apiUrl) {
        throw new Error('API URL not configured')
      }

      const response = await axios.get<ShipmentRequestsResponse>(apiUrl)
      
      setShipmentRequests(response.data.shipment_requests)
      setTotalCount(response.data.shipment_requests_count)
    } catch (err) {
      console.error('Error fetching shipment requests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch shipment requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchShipmentRequests()
  }, [fetchShipmentRequests])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'logistic_approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'rejected':
        return 'danger'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-danger">Error: {error}</p>
        <button 
          onClick={fetchShipmentRequests}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Shipment Requests</h2>
        <p className="text-gray-600">Total: {totalCount} requests</p>
      </div>
      
      <Table aria-label="Shipment requests table">
        <TableHeader>
          <TableColumn>Request ID</TableColumn>
          <TableColumn>Topic</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Created By</TableColumn>
          <TableColumn>Created Date</TableColumn>
          <TableColumn>Due Date</TableColumn>
          <TableColumn>Logistic User</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {shipmentRequests.map((request) => (
            <TableRow key={request.shipmentRequestID}>
              <TableCell>
                <Link 
                  to={`/shipment/${request.shipmentRequestID}`}
                  className="text-primary hover:text-primary-600 font-medium"
                >
                  #{request.shipmentRequestID}
                </Link>
              </TableCell>
              <TableCell>{request.topic}</TableCell>
              <TableCell>
                <Chip 
                  color={getStatusColor(request.request_status)} 
                  variant="flat"
                  size="sm"
                >
                  {request.request_status.replace('_', ' ').toUpperCase()}
                </Chip>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{request.created_user_name}</p>
                  <p className="text-xs text-gray-500">{request.created_user_mail}</p>
                </div>
              </TableCell>
              <TableCell>{formatDate(request.created_date_time)}</TableCell>
              <TableCell>{formatDate(request.due_date)}</TableCell>
              <TableCell>
                {request.logistic_user_name ? (
                  <div>
                    <p className="font-medium">{request.logistic_user_name}</p>
                    {request.logistic_approved_date_time && (
                      <p className="text-xs text-gray-500">
                        Approved: {formatDate(request.logistic_approved_date_time)}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <Link 
                  to={`/shipment/${request.shipmentRequestID}`}
                  className="text-primary hover:text-primary-600 text-sm"
                >
                  View Details
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ShipmentTable