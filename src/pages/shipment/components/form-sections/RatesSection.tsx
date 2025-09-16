import { Card, CardHeader, CardBody, Button, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react'
import { Icon } from '@iconify/react'
import type { FormSectionProps } from '../../types/shipment-form.types'

// Interface for the API response
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
  charge_weight: { value: number; unit: string } | null
  total_charge: { amount: number; currency: string } | null
  detailed_charges: Array<{ type: string; charge: { amount: number; currency: string } }>
}

interface RatesSectionProps extends FormSectionProps {
  rates: RateResponse[]
  onCalculateRates: () => void
  isCalculating: boolean
}

const RatesSection = ({ rates, onCalculateRates, isCalculating }: RatesSectionProps) => {
  // Exchange rates to THB (approximate rates - in production, fetch from a real API)
  const exchangeRates: Record<string, number> = {
    USD: 35.0,
    EUR: 38.5,
    GBP: 43.2,
    JPY: 0.24,
    CNY: 4.9,
    SGD: 26.1,
    MYR: 7.8,
    THB: 1.0
  };

  const formatCurrency = (amount: number | undefined | null, currency: string | null) => {
    if (amount == null || !currency) return 'N/A'; // covers null and undefined
    return `${amount.toLocaleString()} ${currency}`;
  };

  const convertToTHB = (amount: number | undefined | null, currency: string | null) => {
    if (amount == null || !currency) return 'N/A';
    const rate = exchangeRates[currency.toUpperCase()] || 1;
    const thbAmount = amount * rate;
    return `${thbAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} THB`;
  };

  const convertWeightToKg = (weight: { value: number; unit: string } | null) => {
    if (!weight) return '-';

    let kgValue = weight.value;
    switch (weight.unit.toLowerCase()) {
      case 'lb':
      case 'lbs':
        kgValue = weight.value * 0.453592;
        break;
      case 'g':
      case 'gram':
      case 'grams':
        kgValue = weight.value / 1000;
        break;
      case 'oz':
      case 'ounce':
      case 'ounces':
        kgValue = weight.value * 0.0283495;
        break;
      case 'kg':
      case 'kilogram':
      case 'kilograms':
        // Already in kg
        break;
      default:
        // Assume kg if unknown unit
        break;
    }

    return `${kgValue.toFixed(2)} kg`;
  };

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

      <CardBody>
        {rates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon icon="solar:calculator-bold" className="text-4xl mb-2 mx-auto" />
            <p>No rates calculated yet. Click "Calculate Rates" to get shipping quotes.</p>
          </div>
        ) : (
          <Table aria-label="Shipping Rates" removeWrapper className="min-w-full">
            <TableHeader>
              <TableColumn>Carrier</TableColumn>
              <TableColumn>Service</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Total Charge</TableColumn>
              <TableColumn>Estimated THB</TableColumn>
              <TableColumn>Charge Weight</TableColumn>
              <TableColumn>Transit Time</TableColumn>
              <TableColumn>Delivery Date</TableColumn>
              <TableColumn>Messages</TableColumn>
            </TableHeader>
            <TableBody items={rates} emptyContent="No rates found.">
              {(rate) => (
                <TableRow key={rate.shipper_account.id}>
                  <TableCell>{rate.shipper_account.description}</TableCell>
                  <TableCell>{rate.service_name || rate.service_type || '-'}</TableCell>
                  <TableCell>
                    <Chip color={getStatusColor(rate)} size="sm">
                      {getStatusText(rate)}
                    </Chip>
                  </TableCell>
                  {/* <TableCell>{formatCurrency(rate.total_charge?.amount, rate.total_charge?.currency)}</TableCell> */}
                  <TableCell>
                    {formatCurrency(
                      rate.total_charge?.amount ?? null,
                      rate.total_charge?.currency ?? null
                    )}
                  </TableCell>
                  <TableCell>
                    {convertToTHB(
                      rate.total_charge?.amount ?? null,
                      rate.total_charge?.currency ?? null
                    )}
                  </TableCell>
                  <TableCell>
                    {convertWeightToKg(rate.charge_weight)}
                  </TableCell>
                  <TableCell>{rate.transit_time ? `${rate.transit_time} day(s)` : '-'}</TableCell>
                  <TableCell>{formatDateTime(rate.delivery_date)}</TableCell>
                  <TableCell className="space-y-1">
                    {rate.error_message && (
                      <p className="text-red-600 text-sm flex items-center">
                        <Icon icon="solar:close-circle-bold" className="inline mr-1" />
                        {rate.error_message}
                      </p>
                    )}
                    {rate.info_message && (
                      <p className="text-blue-600 text-sm flex items-center">
                        <Icon icon="solar:info-circle-bold" className="inline mr-1" />
                        {rate.info_message}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>



          </Table>
        )}
      </CardBody>
    </Card>
  )
}

export default RatesSection
