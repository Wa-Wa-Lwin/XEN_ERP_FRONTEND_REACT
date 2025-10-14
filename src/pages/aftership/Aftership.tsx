import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Button,
  Input,
  Chip,
  Modal,
  ModalBody,
  ModalContent
} from '@heroui/react'
import { Icon } from '@iconify/react'
import axios from 'axios'

interface AftershipLabel {
  id: string
  tracking_numbers: string[]
  status: string
  created_at: string
  updated_at: string
  ship_date: string
  shipper_account: {
    id: string
    slug: string
  }
  service_type: string
  rate?: {
    shipper_account?: {
      id: string
      slug: string
      description: string
    }
    service_name?: string
    charge_weight: {
      value: number
      unit: string
    }
    total_charge: {
      amount: number
      currency: string
    }
  }
  files?: {
    label?: {
      paper_size: string
      url: string
      file_type: string
    }
    invoice?: {
      paper_size: string
      url: string
      file_type: string
    }
    packing_slip?: {
      paper_size: string
      url: string
      file_type: string
    }
  }
}

interface LabelCounts {
  total: number
  created: number
  failed: number
  cancelled: number
}

const Aftership = () => {
  const navigate = useNavigate()
  const [labels, setLabels] = useState<AftershipLabel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [counts, setCounts] = useState<LabelCounts>({
    total: 0,
    created: 0,
    failed: 0,
    cancelled: 0
  })

  useEffect(() => {
    fetchLabels()
  }, [])

  const fetchLabels = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(import.meta.env.VITE_APP_AFTERSHIP_GET_LABELS)

      if (response.data && response.data.data) {
        setLabels(response.data.data.labels || [])

        // Set counts from the response
        setCounts({
          total: response.data.total_request_count || 0,
          created: response.data.created_request_count || 0,
          failed: response.data.failed_request_count || 0,
          cancelled: response.data.cancelled_request_count || 0
        })
      }
    } catch (err) {
      console.error('Error fetching labels:', err)
      setError((err as Error).message || 'Failed to fetch labels')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const filteredLabels = labels.filter(label => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      label.id.toLowerCase().includes(query) ||
      label.tracking_numbers?.some(tn => tn.toLowerCase().includes(query)) ||
      label.status.toLowerCase().includes(query) ||
      label.shipper_account?.slug.toLowerCase().includes(query) ||
      label.rate?.shipper_account?.slug.toLowerCase().includes(query)
    )
  })

  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null) // Label to confirm
  const cancelLabel = async (labelId: string) => {
    try {
      setCancellingId(labelId)
      const response = await axios.post(import.meta.env.VITE_APP_AFTERSHIP_CANCEL_LABEL, {
        label: { id: labelId }
      })

      if (response.data?.meta?.code !== 200) {
        const message = response.data?.meta?.message || 'Failed to cancel label'
        const details_info = response.data?.meta?.details?.[0]?.info || ''
        alert(`Failed to cancel label: ${message} ${details_info}`)
      } else {
        await fetchLabels()
      }  
    } catch (err) {
      console.error('Error cancelling label:', err)
      alert('Failed to cancel label. Please try again.')
    } finally {
      setCancellingId(null)
      setConfirmCancelId(null)
    }
  }

  return (
    <div>
      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!confirmCancelId}
        hideCloseButton
        isDismissable={false}
        size="sm"
        backdrop="blur"
      >
        <ModalContent>
          <ModalBody className="flex flex-col items-center justify-center py-8 space-y-4">
            {cancellingId === confirmCancelId ? (
              <>
                <Spinner
                  size="lg"
                  color="danger"
                  label="Cancelling label..."
                  labelColor="danger"
                />
                <p className="text-sm text-gray-600 text-center">
                  Please wait while we cancel this label...
                </p>
              </>
            ) : (
              <>
                <p className="text-center text-sm font-medium">
                  Are you sure you want to cancel this label?
                </p>
                <div className="flex gap-3">
                  <Button color="danger" onPress={() => cancelLabel(confirmCancelId!)}>
                    Yes, Cancel
                  </Button>
                  <Button color="default" onPress={() => setConfirmCancelId(null)}>
                    No, Keep
                  </Button>
                </div>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Card className="w-full">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold">Aftership Labels</h1>
              <p className="text-small text-default-600">
                View and manage shipping labels from Aftership
              </p>
            </div>
            <div className="w-full max-w-md">
              <Input
                placeholder="Search by ID, tracking number, status, or carrier..."
                startContent={<Icon icon="solar:magnifer-linear" />}
                value={searchQuery}
                onValueChange={setSearchQuery}
                isClearable
                onClear={() => setSearchQuery('')}
              />
            </div>
            <div>
              {/* Counts Summary */}
              <div className="flex gap-3 flex-wrap">
                <Chip
                  variant="flat"
                  color="default"
                  size="sm"
                  startContent={<Icon icon="solar:box-bold" width={18} />}
                >
                  <span className="font-semibold">Total: {counts.total}</span>
                </Chip>
                <Chip
                  variant="flat"
                  color="success"
                  size="sm"
                  startContent={<Icon icon="solar:check-circle-bold" width={18} />}
                >
                  <span className="font-semibold">Created: {counts.created}</span>
                </Chip>
                <Chip
                  variant="flat"
                  color="danger"
                  size="sm"
                  startContent={<Icon icon="solar:close-circle-bold" width={18} />}
                >
                  <span className="font-semibold">Failed: {counts.failed}</span>
                </Chip>
                <Chip
                  variant="flat"
                  color="warning"
                  size="sm"
                  startContent={<Icon icon="solar:slash-circle-bold" width={18} />}
                >
                  <span className="font-semibold">Cancelled: {counts.cancelled}</span>
                </Chip>
              </div>
            </div>
            <Button
              color="primary"
              startContent={<Icon icon="solar:refresh-linear" />}
              onPress={fetchLabels}
              isLoading={loading}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardBody className="overflow-visible p-4">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <Button color="primary" onPress={fetchLabels}>
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <Table
              aria-label="Aftership labels table"
              classNames={{
                wrapper: 'min-h-[400px]'
              }}
            >
              <TableHeader>
                <TableColumn>No.</TableColumn>
                <TableColumn>ID</TableColumn>
                <TableColumn>TRACKING NUMBERS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>CREATED DATE</TableColumn>
                <TableColumn>SHIP DATE</TableColumn>
                <TableColumn>SHIPPER ACCOUNT</TableColumn>
                <TableColumn>SERVICE NAME</TableColumn>
                <TableColumn>CHARGE WEIGHT</TableColumn>
                <TableColumn>TOTAL CHARGE</TableColumn>
                <TableColumn>ACTION</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No labels found">
                {filteredLabels.map((label, index) => (
                  <TableRow
                    key={label.id}
                    className="cursor-pointer hover:bg-default-100"
                    onClick={() => navigate(`/aftership/${label.id}`)}
                  >
                    <TableCell>
                      <span className="text-xs font-mono">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono">{label.id}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {label.tracking_numbers?.slice(0, 2).map((tn, idx) => (
                          <span key={idx} className="text-xs font-mono">
                            {tn}
                          </span>
                        ))}
                        {label.tracking_numbers?.length > 2 && (
                          <span className="text-xs text-default-400">
                            +{label.tracking_numbers.length - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs uppercase">{label.status || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{formatDate(label.created_at)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{formatDate(label.ship_date)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">
                          {label.rate?.shipper_account?.description || label.shipper_account?.slug || '-'}
                        </span>
                        <span className="text-xs text-default-400">
                          {label.rate?.shipper_account?.slug || label.shipper_account?.slug || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{label.rate?.service_name || label.service_type || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {label.rate?.charge_weight
                          ? `${label.rate.charge_weight.value} ${label.rate.charge_weight.unit}`
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold">
                        {label.rate?.total_charge
                          ? `${label.rate.total_charge.currency} ${label.rate.total_charge.amount}`
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div
                        onClick={(e) => e.stopPropagation()}
                      >
                        {
                          label.status === "created" && 
                          <Button
                            color="danger"
                            size="sm"
                            variant="flat"
                            startContent={<Icon icon="solar:trash-bin-minimalistic-bold" />}
                            isLoading={cancellingId === label.id}
                            // onPress={() => cancelLabel(label.id)}
                            onPress={() => setConfirmCancelId(label.id)} // Open modal
                          >
                            Cancel
                          </Button>
                        }                         
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default Aftership
