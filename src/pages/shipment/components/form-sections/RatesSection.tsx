import { Card, CardHeader, CardBody, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react'
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
  serviceOption?: string
}

const RatesSection = ({ rates, onCalculateRates, isCalculating, selectedRateId, onSelectRate, serviceOption }: RatesSectionProps) => {
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

      // Try to use cached rates even if expired as fallback
      const { rates: cachedRates } = loadCachedRates()
      if (cachedRates) {
        setExchangeRates(cachedRates)
        // Only show error if we're forcing a refresh, not on initial load
        if (forceRefresh) {
          setRatesError('Failed to fetch current exchange rates')
        }
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
        // Only show error if we're forcing a refresh, not on initial load
        if (forceRefresh) {
          setRatesError('Failed to fetch current exchange rates')
        }
      }
    } finally {
      setIsLoadingRates(false)
    }
  }

  // Auto-refresh rates every hour
  useEffect(() => {
    // Initial load - only if no cached rates exist or cache is expired
    const { rates: cachedRates, timestamp: cachedTimestamp } = loadCachedRates()

    if (!cachedRates || !cachedTimestamp || !isCacheValid(cachedTimestamp)) {
      // Only fetch if we don't have valid cached data
      fetchExchangeRates()
    } else {
      // Use cached data and don't show error
      setExchangeRates(cachedRates)
      setLastUpdated(new Date(cachedTimestamp).toLocaleString())
    }

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
    return `${thbAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
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

  // const getStatusColor = (rate: RateResponse) => {
  //   if (rate.error_message) return 'danger'
  //   if (rate.info_message && !rate.total_charge?.amount) return 'warning'
  //   if (rate.total_charge?.amount) return 'success'
  //   return 'default'
  // }

  // const getStatusText = (rate: RateResponse) => {
  //   if (rate.error_message) return 'Error'
  //   if (rate.info_message && !rate.total_charge?.amount) return 'No Quote'
  //   if (rate.total_charge?.amount) return 'Available'
  //   return 'Unknown'
  // }

  // Filter unique rates based on shipper_account.id + service_type combination
  // Only show available rates (rates with total_charge amount and no errors)
  // For "normal" service option, show only the cheapest rate
  const getAvailableUniqueRates = (rates: RateResponse[]) => {
    const seen = new Set<string>()
    let availableRates = rates.filter(rate => {
      // Only include rates that are available (have total_charge and no error_message)
      if (rate.error_message || !rate.total_charge?.amount) {
        return false
      }

      // Create unique key combining shipper account and service type
      const uniqueKey = `${rate.shipper_account.id}-${rate.service_type}`
      if (seen.has(uniqueKey)) {
        return false
      }
      seen.add(uniqueKey)
      return true
    })

    // If service option is "normal", return only the cheapest rate
    if (serviceOption === 'Normal' && availableRates.length > 0) {
      // Convert all rates to THB for fair comparison
      const ratesWithTHBCost = availableRates.map(rate => {
        const amount = rate.total_charge?.amount || 0
        const currency = rate.total_charge?.currency || 'THB'
        const conversionRate = exchangeRates[currency.toUpperCase()] || 1
        const thbAmount = amount * conversionRate

        return {
          ...rate,
          thbAmount
        }
      })

      // Find the cheapest rate
      const cheapestRate = ratesWithTHBCost.reduce((cheapest, current) =>
        current.thbAmount < cheapest.thbAmount ? current : cheapest
      )

      return [cheapestRate]
    }

    return availableRates
  }

  // Generate unique rate ID for selection (should match the one in ShipmentForm)
  const getRateUniqueId = (rate: RateResponse, index: number) => {
    return `${rate.shipper_account.id}-${rate.service_type}-${index}`
  }

  // Auto-select the cheapest rate when service option is "normal"
  useEffect(() => {
    if (serviceOption === 'Normal' && rates.length > 0) {
      const availableRates = getAvailableUniqueRates(rates)
      if (availableRates.length === 1) {
        const cheapestRateId = getRateUniqueId(availableRates[0], 0)
        if (selectedRateId !== cheapestRateId) {
          onSelectRate(cheapestRateId)
        }
      }
    }
  }, [rates, serviceOption, exchangeRates, selectedRateId, onSelectRate])

  return (
    <Card shadow="none">
    {/* <Card shadow="none" className="py-0 px-4 m-0"> */}
      <CardHeader className="px-0 pt-0 pb-1 flex-row items-center justify-between w-full">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Shipping Rates</h2>
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
      </CardHeader>

      <CardBody className="px-0 pt-0 pb-0">
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
              <TableColumn className='text-right'>Estimated THB</TableColumn>
              <TableColumn>Total Charge</TableColumn>
              <TableColumn>Charge Weight (kg)</TableColumn>
              <TableColumn>Transit Time</TableColumn>
              <TableColumn>Delivery Date</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No available rates found.">
              {getAvailableUniqueRates(rates).map((rate, index) => {
                const rateUniqueId = getRateUniqueId(rate, index)
                const isSelected = selectedRateId === rateUniqueId
                return (
                <TableRow
                  key={rateUniqueId}
                  className={isSelected ? 'bg-green-50 border-green-200' : ''}
                >
                  <TableCell>
                    {isSelected ? (
                      <Button
                        size="sm"
                        color="success"
                        variant="solid"
                        disabled
                        startContent={<Icon icon="solar:check-circle-bold" />}
                      >
                        {serviceOption === 'Normal' ? 'Cheapest' : 'Selected'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => {
                          onSelectRate(rateUniqueId)
                        }}
                        disabled={!!rate.error_message || !rate.total_charge?.amount}
                        startContent={<Icon icon="solar:check-circle-line-duotone" />}
                      >
                        Select
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{rate.shipper_account.description}</TableCell>
                  <TableCell>{rate.service_name || rate.service_type || '-'}</TableCell>
                  <TableCell className="text-right">
                    {convertToTHB(
                      rate.total_charge?.amount ?? null,
                      rate.total_charge?.currency ?? null
                    )}
                    {/* {convertToTHB(
                      rate.total_charge?.amount ?? null,
                      rate.total_charge?.currency ?? null
                    )} */}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      rate.total_charge?.amount ?? null,
                      rate.total_charge?.currency ?? null
                    )}
                  </TableCell>
                  <TableCell>
                    {convertWeightToKg(rate.charge_weight)}
                  </TableCell>
                  <TableCell>{rate.transit_time ? `${rate.transit_time} day(s)` : '-'}</TableCell>
                  <TableCell>{formatDateTime(rate.delivery_date)}</TableCell>
                </TableRow>
                )
              })}
            </TableBody>



          </Table>
        )}
      </CardBody>
    </Card>
  )
}

export default RatesSection
