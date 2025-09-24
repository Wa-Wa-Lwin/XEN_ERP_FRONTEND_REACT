import React from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Tooltip
} from '@heroui/react'
import { Icon } from '@iconify/react'
import type { ShippingRate } from '../types/rate-calculator.types'

interface RatesTableProps {
  rates: ShippingRate[]
}

export const RatesTable: React.FC<RatesTableProps> = ({ rates }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatTransitTime = (transitTime?: number) => {
    if (!transitTime) return 'N/A'
    return transitTime === 1 ? '1 day' : `${transitTime} days`
  }

  const getStatusColor = (rate: ShippingRate) => {
    if (rate.error_message) return 'danger'
    if (rate.info_message) return 'warning'
    return 'success'
  }

  const getStatusText = (rate: ShippingRate) => {
    if (rate.error_message) return 'Error'
    if (rate.info_message) return 'Warning'
    return 'Available'
  }

  return (
    <div className="overflow-x-auto">
      <Table
        aria-label="Shipping rates table"
        className="min-w-full"
        removeWrapper
      >
        <TableHeader>
          <TableColumn>CARRIER</TableColumn>
          <TableColumn>SERVICE</TableColumn>
          <TableColumn>TRANSIT TIME</TableColumn>
          <TableColumn>PICKUP DEADLINE</TableColumn>
          <TableColumn>DELIVERY DATE</TableColumn>
          <TableColumn>WEIGHT</TableColumn>
          <TableColumn>TOTAL COST</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {rates.map((rate, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex flex-col">
                  <p className="text-bold text-sm capitalize">
                    {rate.shipper_account.description}
                  </p>
                  <p className="text-bold text-xs capitalize text-default-400">
                    {rate.shipper_account.slug}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <p className="text-bold text-sm">
                    {rate.service_name}
                  </p>
                  <p className="text-bold text-xs text-default-400">
                    {rate.service_type}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                  {formatTransitTime(rate.transit_time)}
                </Chip>
              </TableCell>

              <TableCell>
                <p className="text-sm">
                  {rate.pickup_deadline ? new Date(rate.pickup_deadline).toLocaleDateString() : 'N/A'}
                </p>
              </TableCell>

              <TableCell>
                <p className="text-sm">
                  {rate.delivery_date ? new Date(rate.delivery_date).toLocaleDateString() : 'N/A'}
                </p>
              </TableCell>

              <TableCell>
                <p className="text-sm">
                  {rate.charge_weight ?
                    `${rate.charge_weight.value} ${rate.charge_weight.unit}` :
                    'N/A'
                  }
                </p>
              </TableCell>

              <TableCell>
                <p className="text-sm font-semibold">
                  {rate.total_charge ?
                    formatCurrency(rate.total_charge.amount, rate.total_charge.currency) :
                    'N/A'
                  }
                </p>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={getStatusColor(rate)}
                  >
                    {getStatusText(rate)}
                  </Chip>

                  {rate.error_message && (
                    <Tooltip content={rate.error_message} color="danger">
                      <Icon
                        icon="solar:info-circle-linear"
                        width={16}
                        className="text-danger cursor-help"
                      />
                    </Tooltip>
                  )}

                  {rate.info_message && !rate.error_message && (
                    <Tooltip content={rate.info_message} color="warning">
                      <Icon
                        icon="solar:info-circle-linear"
                        width={16}
                        className="text-warning cursor-help"
                      />
                    </Tooltip>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex gap-1">
                  {rate.detailed_charges && (
                    <Tooltip content="View detailed charges breakdown">
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => {
                          console.log('Detailed charges:', rate.detailed_charges)
                          // You can implement a modal to show detailed charges
                        }}
                      >
                        <Icon icon="solar:eye-linear" width={16} />
                      </Button>
                    </Tooltip>
                  )}

                  {!rate.error_message && (
                    <Tooltip content="Select this rate for shipment">
                      <Button
                        isIconOnly
                        variant="light"
                        color="success"
                        size="sm"
                        onPress={() => {
                          // This could navigate to create shipment with this rate
                          console.log('Selected rate:', rate)
                        }}
                      >
                        <Icon icon="solar:check-circle-linear" width={16} />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {rates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Icon icon="solar:box-linear" width={48} className="text-default-300 mb-4" />
          <p className="text-default-500">No rates available</p>
          <p className="text-default-400 text-sm">
            Please fill out the form and calculate rates
          </p>
        </div>
      )}
    </div>
  )
}