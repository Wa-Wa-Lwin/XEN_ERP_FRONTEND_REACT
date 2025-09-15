import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import type { Rate, DetailedCharge } from '../types'

interface RateResultsProps {
  rates: Rate[]
  calculationId?: string | null
  isLoading: boolean
  error: string | null
  onClear: () => void
}

const RateResults = ({ rates, calculationId, isLoading, error, onClear }: RateResultsProps) => {
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Icon icon="solar:refresh-bold" className="animate-spin text-primary" width={48} />
            <p className="text-lg font-medium">Calculating shipping rates...</p>
            <p className="text-sm text-default-500">This may take a few moments</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <Icon icon="solar:close-circle-bold" className="text-danger" width={48} />
            <div>
              <p className="text-lg font-medium text-danger">Calculation Failed</p>
              <p className="text-sm text-default-500 mt-2 max-w-md">{error}</p>
            </div>
            <Button color="danger" variant="flat" onPress={onClear}>
              Try Again
            </Button>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (rates.length === 0) {
    return null
  }

  const sortedRates = [...rates].sort((a, b) => a.total_charge.amount - b.total_charge.amount)

  const getCarrierInfo = (slug: string) => {
    switch (slug?.toLowerCase()) {
      case 'ups':
        return {
          color: 'warning' as const,
          icon: 'solar:delivery-bold',
          name: 'UPS'
        }
      case 'fedex':
        return {
          color: 'secondary' as const,
          icon: 'solar:box-bold',
          name: 'FedEx'
        }
      case 'dhl':
        return {
          color: 'danger' as const,
          icon: 'solar:planet-bold',
          name: 'DHL'
        }
      case 'usps':
        return {
          color: 'primary' as const,
          icon: 'solar:letter-bold',
          name: 'USPS'
        }
      default:
        return {
          color: 'default' as const,
          icon: 'solar:delivery-bold',
          name: slug?.toUpperCase() || 'Carrier'
        }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleViewDetails = (rate: Rate) => {
    setSelectedRate(rate)
    setIsDetailModalOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon="solar:calculator-bold" className="text-primary" width={24} />
            <div>
              <h2 className="text-xl font-bold">Shipping Rates</h2>
              <p className="text-sm text-default-500">
                {rates.length} rate{rates.length !== 1 ? 's' : ''} found
                {calculationId && (
                  <span className="ml-2 font-mono text-tiny">
                    ID: {calculationId.slice(0, 8)}...
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="flat"
            color="danger"
            startContent={<Icon icon="solar:trash-bin-minimalistic-bold" />}
            onPress={onClear}
          >
            Clear Results
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            aria-label="Shipping rates table"
            classNames={{
              wrapper: "min-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn className="w-20">RANK</TableColumn>
              <TableColumn className="min-w-[180px]">CARRIER & SERVICE</TableColumn>
              <TableColumn className="w-24">TRANSIT</TableColumn>
              <TableColumn className="min-w-[120px]">DELIVERY DATE</TableColumn>
              <TableColumn className="w-32">CHARGE WEIGHT</TableColumn>
              <TableColumn className="w-32">TOTAL COST</TableColumn>
              <TableColumn className="w-24">DETAILS</TableColumn>
            </TableHeader>
            <TableBody>
              {sortedRates.map((rate, index) => {
                const carrierInfo = getCarrierInfo(rate.shipper_account.slug || '')
                const isBestPrice = index === 0
                const isFastest = rate.transit_time === Math.min(...rates.map(r => r.transit_time || Infinity))

                return (
                  <TableRow key={`${rate.shipper_account.id}-${rate.service_type}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-default-600">#{index + 1}</span>
                        {isBestPrice && (
                          <Chip size="sm" color="success" variant="flat">
                            Best Price
                          </Chip>
                        )}
                        {isFastest && (
                          <Chip size="sm" color="primary" variant="flat">
                            Fastest
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Chip
                            size="sm"
                            variant="flat"
                            color={carrierInfo.color}
                            startContent={<Icon icon={carrierInfo.icon} width={14} />}
                          >
                            {carrierInfo.name}
                          </Chip>
                          <span className="text-tiny text-default-500">
                            {rate.shipper_account.description}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{rate.service_name}</p>
                        {rate.info_message && (
                          <Tooltip content={rate.info_message}>
                            <div className="flex items-center gap-1">
                              <Icon icon="solar:info-circle-bold" className="text-warning" width={12} />
                              <span className="text-tiny text-warning">Info</span>
                            </div>
                          </Tooltip>
                        )}
                        {rate.error_message && (
                          <Chip size="sm" color="danger" variant="flat">
                            Error
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-primary">
                          {rate.transit_time || 'N/A'}
                        </span>
                        <span className="text-tiny text-default-500">
                          {rate.transit_time === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(rate.delivery_date)}
                        {rate.delivery_date && (
                          <p className="text-tiny text-default-500">
                            {new Date(rate.delivery_date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">
                          {rate.charge_weight.value} {rate.charge_weight.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-success">
                          ${rate.total_charge.amount.toFixed(2)}
                        </span>
                        <span className="text-tiny text-default-500">
                          {rate.total_charge.currency}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<Icon icon="solar:eye-bold" />}
                        onPress={() => handleViewDetails(rate)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Rate Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:calculator-bold" className="text-primary" width={24} />
                  <div>
                    <h3 className="text-xl font-bold">Rate Details</h3>
                    <p className="text-small text-default-600">
                      {selectedRate?.service_name} by {selectedRate?.shipper_account.description}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedRate && (
                  <div className="space-y-6">
                    {/* Service Information */}
                    <Card className="shadow-none border">
                      <CardHeader>
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                          <Icon icon="solar:delivery-bold" className="text-primary" width={20} />
                          Service Information
                        </h4>
                      </CardHeader>
                      <CardBody className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-default-700">Service Name</label>
                            <p className="text-sm text-default-600">{selectedRate.service_name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-default-700">Service Type</label>
                            <p className="text-sm text-default-600">{selectedRate.service_type}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-default-700">Transit Time</label>
                            <p className="text-sm text-default-600">
                              {selectedRate.transit_time} day{selectedRate.transit_time !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-default-700">Delivery Date</label>
                            <p className="text-sm text-default-600">{formatDate(selectedRate.delivery_date)}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Pricing Breakdown */}
                    <Card className="shadow-none border">
                      <CardHeader>
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                          <Icon icon="solar:dollar-bold" className="text-success" width={20} />
                          Pricing Breakdown
                        </h4>
                      </CardHeader>
                      <CardBody className="space-y-3">
                        <div className="space-y-2">
                          {selectedRate.detailed_charges.map((charge: DetailedCharge, index: number) => (
                            <div key={index} className="flex justify-between items-center py-2">
                              <span className="text-sm text-default-600 capitalize">
                                {charge.type.replace('_', ' ')} Charge
                              </span>
                              <span className="text-sm font-medium">
                                ${charge.charge.amount.toFixed(2)} {charge.charge.currency}
                              </span>
                            </div>
                          ))}
                          <Divider />
                          <div className="flex justify-between items-center py-2">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-lg font-bold text-success">
                              ${selectedRate.total_charge.amount.toFixed(2)} {selectedRate.total_charge.currency}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-default-100 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon icon="solar:weight-bold" className="text-default-600" width={16} />
                            <span className="text-sm font-medium">Charge Weight</span>
                          </div>
                          <p className="text-sm text-default-600">
                            {selectedRate.charge_weight.value} {selectedRate.charge_weight.unit}
                          </p>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Messages */}
                    {(selectedRate.info_message || selectedRate.error_message) && (
                      <Card className="shadow-none border">
                        <CardHeader>
                          <h4 className="text-lg font-semibold flex items-center gap-2">
                            <Icon icon="solar:info-circle-bold" className="text-warning" width={20} />
                            Important Information
                          </h4>
                        </CardHeader>
                        <CardBody>
                          {selectedRate.info_message && (
                            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg mb-3">
                              <div className="flex items-start gap-2">
                                <Icon icon="solar:info-circle-bold" className="text-warning flex-shrink-0 mt-0.5" width={16} />
                                <p className="text-sm text-warning-700">{selectedRate.info_message}</p>
                              </div>
                            </div>
                          )}
                          {selectedRate.error_message && (
                            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Icon icon="solar:close-circle-bold" className="text-danger flex-shrink-0 mt-0.5" width={16} />
                                <p className="text-sm text-danger-700">{selectedRate.error_message}</p>
                              </div>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default RateResults