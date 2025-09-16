import { Card, CardHeader, CardBody, Button, Chip } from '@heroui/react'
import { Icon } from '@iconify/react'
import type { FormSectionProps } from '../../types/shipment-form.types'
// Interface for the new API response structure
interface RateResponse {
  shipper_account: {
    id: string
    slug: string
    description: string
  }
  service_type: string | null
  service_name: string | null
  pickup_deadline: string | null
  booking_cut_off: string | null
  delivery_date: string | null
  transit_time: number | null
  error_message: string | null
  info_message: string | null
  charge_weight: {
    value: number
    unit: string
  } | null
  total_charge: {
    amount: number
    currency: string
  } | null
  detailed_charges: Array<{
    type: string
    charge: {
      amount: number
      currency: string
    }
  }>
}

interface RatesSectionProps extends FormSectionProps {
  rates: RateResponse[]
  onCalculateRates: () => void
  isCalculating: boolean
}

const RatesSection = ({ rates, onCalculateRates, isCalculating }: RatesSectionProps) => {
  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount || !currency) return 'N/A'
    return `${amount.toLocaleString()} ${currency}`
  }

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return 'N/A'
    return new Date(dateTime).toLocaleString()
  }

  const getStatusColor = (rate: RateResponse) => {
    if (rate.error_message) return 'danger'
    if (rate.info_message && !rate.total_charge?.amount) return 'warning'
    if (rate.total_charge?.amount) return 'success'
    return 'default'
  }

  const getStatusText = (rate: RateResponse) => {
    if (rate.error_message) return 'Error'
    if (rate.info_message && !rate.total_charge?.amount) return 'No Quote'
    if (rate.total_charge?.amount) return 'Available'
    return 'Unknown'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold">Shipping Rates</h2>
          <Button
            type="button"
            color="secondary"
            size="sm"
            startContent={<Icon icon="solar:calculator-bold" />}
            onPress={onCalculateRates}
            isLoading={isCalculating}
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculating...' : 'Calculate Rates'}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {rates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon icon="solar:calculator-bold" className="text-4xl mb-2 mx-auto" />
            <p>No rates calculated yet. Click "Calculate Rates" to get shipping quotes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Found {rates.length} rate option(s) from carriers
            </p>
            {rates.map((rate, index) => (
              <Card key={index} className="border">
                <CardBody className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-medium">
                        {rate.service_name || rate.shipper_account.description || 'Unknown Service'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {rate.shipper_account.description} ({rate.shipper_account.slug?.toUpperCase()})
                      </p>
                    </div>
                    <Chip color={getStatusColor(rate)} size="sm">
                      {getStatusText(rate)}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Pricing Information */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Pricing</h4>
                      <p className="text-sm">
                        <span className="font-medium">Total: </span>
                        {formatCurrency(rate.total_charge?.amount, rate.total_charge?.currency)}
                      </p>
                      {rate.charge_weight && (
                        <p className="text-sm">
                          <span className="font-medium">Charge Weight: </span>
                          {rate.charge_weight.value} {rate.charge_weight.unit}
                        </p>
                      )}
                    </div>

                    {/* Timing Information */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Timing</h4>
                      {rate.transit_time && (
                        <p className="text-sm">
                          <span className="font-medium">Transit: </span>
                          {rate.transit_time} day(s)
                        </p>
                      )}
                      {rate.delivery_date && (
                        <p className="text-sm">
                          <span className="font-medium">Delivery: </span>
                          {formatDateTime(rate.delivery_date)}
                        </p>
                      )}
                      {rate.pickup_deadline && (
                        <p className="text-sm">
                          <span className="font-medium">Pickup Deadline: </span>
                          {formatDateTime(rate.pickup_deadline)}
                        </p>
                      )}
                    </div>

                    {/* Service Details */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Service</h4>
                      {rate.service_type && (
                        <p className="text-sm">
                          <span className="font-medium">Type: </span>
                          {rate.service_type}
                        </p>
                      )}
                      {rate.booking_cut_off && (
                        <p className="text-sm">
                          <span className="font-medium">Booking Cutoff: </span>
                          {formatDateTime(rate.booking_cut_off)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Detailed Charges */}
                  {rate.detailed_charges && rate.detailed_charges.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Detailed Charges</h4>
                      <div className="space-y-1">
                        {rate.detailed_charges.map((charge, chargeIndex) => (
                          <div key={chargeIndex} className="flex justify-between text-sm">
                            <span className="capitalize">{charge.type.replace('_', ' ')}:</span>
                            <span>{formatCurrency(charge.charge?.amount, charge.charge?.currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {rate.error_message && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-600">
                        <Icon icon="solar:close-circle-bold" className="inline mr-1" />
                        {rate.error_message}
                      </p>
                    </div>
                  )}

                  {rate.info_message && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-600">
                        <Icon icon="solar:info-circle-bold" className="inline mr-1" />
                        {rate.info_message}
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default RatesSection