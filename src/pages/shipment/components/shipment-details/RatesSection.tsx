import { Card, CardBody, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { ShipmentGETData } from './types';

// Interface for exchange rate API response
interface ExchangeRateResponse {
  conversion_rates: Record<string, number>
  time_last_update_unix: number
}

interface RatesSectionProps {
  shipment: ShipmentGETData;
  showAllRates: boolean;
  setShowAllRates: (show: boolean) => void;
}

const RatesSection = ({ shipment, showAllRates, setShowAllRates }: RatesSectionProps) => {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    THB: 1.0 // Default fallback
  })

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
  const fetchExchangeRates = async () => {
    // Check cache first
    const { rates: cachedRates, timestamp: cachedTimestamp } = loadCachedRates()

    if (cachedRates && cachedTimestamp && isCacheValid(cachedTimestamp)) {
      setExchangeRates(cachedRates)
      return
    }

    try {
      // Using local API endpoint for exchange rates
      const apiUrl = import.meta.env.VITE_APP_CONVERT_RATES_TO_THB || '/api/exchange-rates/rates'
      const response = await axios.get<ExchangeRateResponse>(apiUrl)

      // The API response already contains rates TO THB, so use them directly
      const thbRates: Record<string, number> = response.data.conversion_rates
      thbRates.THB = 1.0 // Ensure THB to THB is always 1

      const timestamp = Date.now()

      // Save to cache and state
      saveCachedRates(thbRates, timestamp)
      setExchangeRates(thbRates)
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)

      // Try to use cached rates even if expired as fallback
      const { rates: cachedRates } = loadCachedRates()
      if (cachedRates) {
        setExchangeRates(cachedRates)
      } else {
        // Ultimate fallback to hardcoded rates
        setExchangeRates({
          USD: 32.26,
          EUR: 37.74,
          GBP: 43.10,
          JPY: 0.22,
          CNY: 4.50,
          SGD: 24.94,
          MYR: 7.63,
          HKD: 4.13,
          THB: 1.0
        })
      }
    }
  }

  // Load exchange rates on component mount
  useEffect(() => {
    fetchExchangeRates()
  }, [])

  // Convert currency to THB
  const convertToTHB = (amount: number | string | undefined | null, currency: string | null) => {
    if (amount == null || !currency) return 'N/A';

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';

    const rate = exchangeRates[currency.toUpperCase()];
    if (!rate) {
      return `${numAmount.toLocaleString()} ${currency} (Rate N/A)`;
    }

    const thbAmount = numAmount * rate;
    return `${thbAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  if (!shipment.rates?.length) {
    return null;
  }

  return (
    <Card className="m-3">
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:dollar-bold" width={24} className="text-blue-600" />
            <h3 className="font-semibold text-blue-900 text-lg">Shipping Rates</h3>
          </div>
          {shipment.rates.length > 1 && (
            <Button
              size="sm"
              variant="bordered"
              onPress={() => setShowAllRates(!showAllRates)}
              startContent={<Icon icon={showAllRates ? "solar:eye-closed-bold" : "solar:eye-bold"} />}
            >
              {showAllRates ? "Show Selected Only" : "View All Rates"}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table
            shadow="none"
            removeWrapper
            aria-label="Rates Table"
            classNames={{
              wrapper: "min-w-fit",
              table: "min-w-[1200px]"
            }}
          >
            <TableHeader>
              <TableColumn className="min-w-[80px]">Chosen</TableColumn>
              <TableColumn className="min-w-[60px]">No.</TableColumn>
              <TableColumn className="min-w-[120px]">Rate ID</TableColumn>
              <TableColumn className="min-w-[150px]">Carrier(Service)</TableColumn>
              <TableColumn className="min-w-[100px]">Transit Time</TableColumn>
              <TableColumn className="min-w-[120px] text-right">Estimate THB</TableColumn>
              <TableColumn className="min-w-[120px]">Cost</TableColumn>
              <TableColumn className="min-w-[100px]">Charge Weight</TableColumn>
              <TableColumn className="min-w-[150px]">Pickup Deadline</TableColumn>
              <TableColumn className="min-w-[150px]">Booking Cut Off</TableColumn>
              <TableColumn className="min-w-[150px]">Delivery Date</TableColumn>
              <TableColumn className="min-w-[150px]">Past Chosen</TableColumn>
              {/* <TableColumn className="min-w-[200px]">Error Message</TableColumn>
              <TableColumn className="min-w-[200px]">Info Message</TableColumn> */}
            </TableHeader>
            <TableBody>
              {(showAllRates ? shipment.rates : shipment.rates.filter((rate: any) => rate.chosen == 1))
                .map((rate: any, idx: number) => (
                  <TableRow key={idx} className={rate.chosen == 1 ? "bg-green-100" : rate.past_chosen == 1 ? "bg-orange-100" : ""}>
                    <TableCell>
                      {rate.chosen == 1 ? <Icon icon="mdi:check-circle" className="text-green-600 w-5 h-5" /> : null}
                    </TableCell>
                    <TableCell>{showAllRates ? shipment.rates!.indexOf(rate) + 1 : idx + 1}</TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{rate.rateID}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{rate.shipper_account_description}({rate.service_name || 'N/A'})</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{rate.transit_time ? `${rate.transit_time} days` : 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-right">
                        {convertToTHB(rate.total_charge_amount, rate.total_charge_currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold">
                        {rate.total_charge_amount && rate.total_charge_currency
                          ? `${rate.total_charge_amount} ${rate.total_charge_currency}`
                          : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {rate.charge_weight_value && rate.charge_weight_unit
                          ? `${rate.charge_weight_value} ${rate.charge_weight_unit}`
                          : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {rate.pickup_deadline
                          ?
                           new Date(rate.pickup_deadline).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',                           
                          })
                          : new Date(shipment.pick_up_date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',                           
                          }) 
                          }
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {rate.booking_cut_off
                          ? new Date(rate.booking_cut_off).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'Call to confirm exact time.'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {rate.delivery_date
                          ? new Date(rate.delivery_date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'Call to confirm exact time.'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {rate.past_chosen == 1 ?
                        <>
                          <span className="text-xs flex items-center gap-1">
                            <Icon icon="mdi:check-circle" className="text-gray-600 w-4 h-4" />
                            by {rate.created_user_name}
                          </span>
                        </> : null
                      }
                    </TableCell>
                    {/* <TableCell>
                      {rate.error_message ? (
                        <div className="text-xs text-red-600 max-w-[200px] break-words">
                          {rate.error_message}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {rate.info_message ? (
                        <div className="text-xs text-blue-600 max-w-[200px] break-words">
                          {rate.info_message}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </TableCell> */}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default RatesSection;