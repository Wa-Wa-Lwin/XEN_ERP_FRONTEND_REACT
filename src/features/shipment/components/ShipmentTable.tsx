import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Pagination,
  Select,
  SelectItem,
  Button
} from '@heroui/react'
import axios from 'axios'
import type { ShipmentRequest, ShipmentRequestsResponse } from '../../../types'
import { useAuth } from '../../../context/AuthContext'

const ShipmentTable = () => {
  const { user } = useAuth()
  const [shipmentRequests, setShipmentRequests] = useState<ShipmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'mine'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'requestor_requested', label: 'Waiting Approver' },
    { value: 'send_to_logistic', label: 'Waiting Logistics' },
    { value: 'logistic_updated', label: 'Waiting Approver' },
    { value: 'approver_approved', label: 'Approved' },
    { value: 'approver_rejected', label: 'Rejected' }
  ]

  // Pagination states
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const pageSizeOptions = [10, 20, 100]

  const fetchShipmentRequests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrl = import.meta.env.VITE_APP_GET_ALL_SHIPMENT_REQUESTS
      if (!apiUrl) {
        throw new Error('API URL not configured')
      }

      const response = await axios.get<ShipmentRequestsResponse>(apiUrl)

      // setShipmentRequests(response.data.shipment_requests)
      setShipmentRequests(response.data.shipment_requests_desc)
      setTotalCount(response.data.shipment_requests_count)
    } catch (err) {
      console.error('Error fetching shipment requests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch shipment requests')
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter logic
  const filteredRequests = useMemo(() => {
    let filtered = shipmentRequests

    // Filter by user (mine vs all)
    if (filterType === 'mine' && user?.email) {
      filtered = filtered.filter(request =>
        request.created_user_mail.toLowerCase() === user.email.toLowerCase()
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request =>
        request.request_status === statusFilter
      )
    }

    return filtered
  }, [shipmentRequests, filterType, user?.email, statusFilter])

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredRequests.slice(startIndex, endIndex)
  }, [filteredRequests, page, pageSize])

  const totalPages = Math.ceil(filteredRequests.length / pageSize)

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setPage(1) // Reset to first page when changing page size
  }

  const handleFilterChange = (newFilterType: 'all' | 'mine') => {
    setFilterType(newFilterType)
    setPage(1) // Reset to first page when changing filter
  }

  const handleStatusFilterChange = (keys: any) => {
    const selectedStatus = Array.from(keys)[0] as string
    setStatusFilter(selectedStatus)
    setPage(1) // Reset to first page when changing filter
  }

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
      case 'requestor_requested':
        return 'warning'
      case 'send_to_logistic':
        return 'warning'
      case 'logistic_updated':
        return 'warning'
      case 'approver_approved':
        return 'success'
      case 'approver_rejected':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getDisplayStatus = (status: string) => {
    switch (status) {
      case 'requestor_requested':
        return 'WAITING APPROVER';
      case 'send_to_logistic':
        return 'WAITING LOGISTICS';
      case 'logistic_updated':
        return 'WAITING APPROVER';
      case 'approver_approved':
        return 'APPROVED';
      case 'approver_rejected':
        return 'REJECTED';
      default:
        return status.toUpperCase();
    }
  };

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
      <div className="mb-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Shipment Requests</h2>
            <p className="text-gray-600 text-sm">
              Showing: {filteredRequests.length} of {totalCount} requests
              {filterType === 'mine' && user?.email && (
                <span className="text-primary"> (My Requests)</span>
              )}
              {statusFilter !== 'all' && (
                <span className="text-secondary"> • Filtered by: {statusOptions.find(opt => opt.value === statusFilter)?.label}</span>
              )}
            </p>
          </div>

          {/* Filter Toggle Buttons */}
          <div className="flex gap-2">
            {/* Status Filter Row */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                <Select
                  size="sm"
                  className="w-48"
                  placeholder="Select status..."
                  selectedKeys={[statusFilter]}
                  onSelectionChange={handleStatusFilterChange}
                >
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                {statusFilter !== 'all' && (
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => {
                      setStatusFilter('all')
                      setPage(1)
                    }}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>             
            </div>
            <div  className="flex gap-1">
              <Button
                size="sm"
                variant={filterType === 'all' ? 'solid' : 'bordered'}
                color={filterType === 'all' ? 'primary' : 'default'}
                onPress={() => handleFilterChange('all')}
              >
                All Requests
              </Button>
              <Button
                size="sm"
                variant={filterType === 'mine' ? 'solid' : 'bordered'}
                color={filterType === 'mine' ? 'primary' : 'default'}
                onPress={() => handleFilterChange('mine')}
                isDisabled={!user?.email}
              >
                My Requests
              </Button>
            </div>
          </div>
        </div>


      </div>

      <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg">

        <Table
          aria-label="Shipment requests table"
          className="min-w-full"
          removeWrapper
        >
          <TableHeader className="sticky top-0 z-20 bg-white shadow-sm">
            <TableColumn>ID</TableColumn>
            <TableColumn>Scope</TableColumn>
            <TableColumn>Topic (PO Number)</TableColumn>
            <TableColumn>FROM</TableColumn>
            <TableColumn>TO</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Requestor</TableColumn>
            <TableColumn>Request Date</TableColumn>
            <TableColumn>Due Date</TableColumn>
            <TableColumn>Approver</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {paginatedData.map((request) => (
              <TableRow key={request.shipmentRequestID} className="border-b border-gray-200">
                <TableCell>
                  <Link
                    to={`/shipment/${request.shipmentRequestID}`}
                    className="text-primary hover:text-primary-600 font-medium"
                  >
                    {request.shipmentRequestID}
                  </Link>
                </TableCell>
                <TableCell>
                  {request.shipment_scope_type?.toUpperCase()}
                </TableCell>
                <TableCell>
                  {request.topic} ({request.po_number})
                  {/* DONT_DELETE_YET */}
                  {/* {request.topic === 'Others' && request.other_topic ? <p className="text-xs text-gray-500">
                  {request.other_topic}
                </p> : ''} */}
                </TableCell>
                <TableCell>{request.ship_from?.company_name}</TableCell>
                <TableCell>{request.ship_to?.company_name}</TableCell>
                <TableCell>
                  <Chip
                    color={getStatusColor(request.request_status)}
                    variant="flat"
                    size="sm"
                  >
                    {getDisplayStatus(request.request_status)}

                  </Chip>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{request.created_user_name}</p>
                    {/* <p className="text-xs text-gray-500">{request.created_user_mail}</p> */}
                  </div>
                </TableCell>
                <TableCell>{formatDate(request.created_date_time)}</TableCell>
                <TableCell>{formatDate(request.due_date)}</TableCell>
                <TableCell>
                  {
                    request.approver_user_name
                  }
                  {/* {request.approver_user_name ? (
                    <div>
                      <p className="font-medium">{request.approver_user_name}</p>
                      {request.logistic_approved_date_time ? (
                        <p className="text-xs text-gray-500">
                          Approved: {request.approver_approved_date_time ? formatDate(request.approver_approved_date_time) : 'N/A'}
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-600">Waiting</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )} */}
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 px-2">
        {/* Left side - Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <Select
            size="sm"
            className="w-20"
            selectedKeys={[pageSize.toString()]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string
              handlePageSizeChange(selected)
            }}
          >
            {pageSizeOptions.map((size) => (
              <SelectItem key={size.toString()} value={size.toString()}>
                {size.toString()}
              </SelectItem>
            ))}
          </Select>
          <span className="text-sm text-gray-600">
            Showing {Math.min((page - 1) * pageSize + 1, filteredRequests.length)} to{' '}
            {Math.min(page * pageSize, filteredRequests.length)} of {filteredRequests.length} entries
          </span>
        </div>

        {/* Right side - Pagination */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="bordered"
            onPress={() => setPage(Math.max(1, page - 1))}
            isDisabled={page === 1}
          >
            Previous
          </Button>

          <Pagination
            total={totalPages}
            page={page}
            onChange={setPage}
            size="sm"
            showControls={false}
            classNames={{
              wrapper: "gap-0 overflow-visible h-8 rounded border border-divider",
              item: "w-8 h-8 text-small rounded-none bg-transparent",
              cursor: "bg-gradient-to-b shadow-lg from-default-500 to-default-800 dark:from-default-300 dark:to-default-100 text-white font-bold",
            }}
          />

          <Button
            size="sm"
            variant="bordered"
            onPress={() => setPage(Math.min(totalPages, page + 1))}
            isDisabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ShipmentTable