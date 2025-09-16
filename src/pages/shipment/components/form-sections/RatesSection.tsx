import { Card, CardHeader, CardBody, Button, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, RadioGroup, Radio } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import type { FormSectionProps } from '../../types/shipment-form.types'

// Interface for exchange rate API response
interface ExchangeRateResponse {
  conversion_rates: Record<string, number>
  time_last_update_unix: number
}

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
  selectedRateId?: string
  onSelectRate: (rateId: string) => void
}

const RatesSection = ({ rates, onCalculateRates, isCalculating, selectedRateId, onSelectRate }: RatesSectionProps) => {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    THB: 1.0 // Default fallback
  })
  const [isLoadingRates, setIsLoadingRates] = useState(false)
  const [ratesError, setRatesError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Cache keys
  const CACHE_KEY = 'exchange_rates_thb'
  const CACHE_TIMESTAMP_KEY = 'exchange_rates_timestamp'
  const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

  // Load cached rates from localStorage
  const loadCachedRates = (): { rates: Record<string, number> | null; timestamp: number | null } => {
    try {
      const cachedRates = localStorage.getItem(CACHE_KEY)
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

      if (cachedRates && cachedTimestamp) {
        return {
          rates: JSON.parse(cachedRates),
          timestamp: parseInt(cachedTimestamp)
        }
      }
    } catch (error) {
      console.error('Failed to load cached rates:', error)
    }
    return { rates: null, timestamp: null }
  }

  // Save rates to localStorage
  const saveCachedRates = (rates: Record<string, number>, timestamp: number) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(rates))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString())
    } catch (error) {
      console.error('Failed to save cached rates:', error)
    }
  }

  // Check if cached rates are still valid (less than 1 hour old)
  const isCacheValid = (timestamp: number): boolean => {
    const now = Date.now()
    return (now - timestamp) < CACHE_DURATION
  }

  // Fetch exchange rates from API or cache
  const fetchExchangeRates = async (forceRefresh = false) => {
    setIsLoadingRates(true)
    setRatesError(null)

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const { rates: cachedRates, timestamp: cachedTimestamp } = loadCachedRates()

      if (cachedRates && cachedTimestamp && isCacheValid(cachedTimestamp)) {
        setExchangeRates(cachedRates)
        setLastUpdated(new Date(cachedTimestamp).toLocaleString())
        setIsLoadingRates(false)
        return
      }
    }

    try {
      // Using exchangerate-api.com free tier (1500 requests/month)
      const response = await axios.get<ExchangeRateResponse>(
        'https://api.exchangerate-api.com/v4/latest/THB'
      )

      // Convert from THB-based rates to rates TO THB
      const thbRates: Record<string, number> = {}
      Object.entries(response.data.conversion_rates).forEach(([currency, rate]) => {
        thbRates[currency] = 1 / rate // Invert to get rate TO THB
      })
      thbRates.THB = 1.0 // THB to THB is always 1

      const timestamp = Date.now()

      // Save to cache and state
      saveCachedRates(thbRates, timestamp)
      setExchangeRates(thbRates)
      setLastUpdated(new Date(timestamp).toLocaleString())
      setRatesError(null)
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
      setRatesError('Failed to fetch current exchange rates')

      // Try to use cached rates even if expired as fallback
      const { rates: cachedRates } = loadCachedRates()
      if (cachedRates) {
        setExchangeRates(cachedRates)
      } else {
        // Ultimate fallback to hardcoded rates
        setExchangeRates({
          USD: 35.0,
          EUR: 38.5,
          GBP: 43.2,
          JPY: 0.24,
          CNY: 4.9,
          SGD: 26.1,
          MYR: 7.8,
          THB: 1.0
        })
      }
    } finally {
      setIsLoadingRates(false)
    }
  }

  // Auto-refresh rates every hour
  useEffect(() => {
    // Initial load
    fetchExchangeRates()

    // Set up hourly refresh interval
    const interval = setInterval(() => {
      fetchExchangeRates()
    }, CACHE_DURATION)

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number | undefined | null, currency: string | null) => {
    if (amount == null || !currency) return 'N/A'; // covers null and undefined
    return `${amount.toLocaleString()} ${currency}`;
  };

  const convertToTHB = (amount: number | undefined | null, currency: string | null) => {
    if (amount == null || !currency) return 'N/A';

    const rate = exchangeRates[currency.toUpperCase()];
    if (!rate) {
      return `${amount.toLocaleString()} ${currency} (Rate N/A)`;
    }

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
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Shipping Rates</h2>
            {ratesError && (
              <p className="text-red-500 text-sm mt-1">
                <Icon icon="solar:info-circle-bold" className="inline mr-1" />
                {ratesError} - Using fallback rates
              </p>
            )}
            {lastUpdated && !ratesError && (
              <p className="text-gray-500 text-xs mt-1">
                <Icon icon="solar:clock-circle-bold" className="inline mr-1" />
                Exchange rates updated: {lastUpdated}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="light"
              size="sm"
              startContent={<Icon icon="solar:refresh-bold" />}
              onPress={() => fetchExchangeRates(true)}
              isLoading={isLoadingRates}
              disabled={isLoadingRates}
              title="Force refresh exchange rates"
            >
              {isLoadingRates ? 'Updating...' : 'Refresh Rates'}
            </Button>
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
              <TableColumn>Select</TableColumn>
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
                  <TableCell>
                    <input
                      type="radio"
                      name="selectedRate"
                      value={rate.shipper_account.id}
                      checked={selectedRateId === rate.shipper_account.id}
                      onChange={() => onSelectRate(rate.shipper_account.id)}
                      disabled={!!rate.error_message || !rate.total_charge?.amount}
                      className="w-4 h-4 text-primary"
                    />
                  </TableCell>
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
