import { Card, CardHeader, CardBody, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tabs, Tab, Modal, ModalContent, ModalBody, Input, Select, SelectItem } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useState, useEffect, useMemo, useRef } from 'react'
import type { FormSectionProps } from '../../types/shipment-form.types'
import { getRateUniqueId as generateRateId } from '@services/rateCalculationService'
import { useExchangeRates } from '../../hooks/useExchangeRates'
import { formatCurrency, convertToTHB, convertWeightToKg, formatDateTime } from '../../utils/rate-utils'

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
  topic?: string
  rateCalculationError?: {
    message: string
    details?: Array<{ path: string; info: string }>
  } | null
  watch?: any
}

const RatesSection = ({ rates, onCalculateRates, isCalculating, selectedRateId, onSelectRate, serviceOption, rateCalculationError, watch, setValue }: RatesSectionProps) => {
  // Use custom hook for exchange rates
  const { exchangeRates, lastUpdated, ratesError, isLoadingRates, fetchExchangeRates } = useExchangeRates()

  // Get Grab rate values from form data (persists across navigation)
  const grabRateAmount = watch?.('grab_rate_amount') || ''
  const grabRateCurrency = watch?.('grab_rate_currency') || 'THB'

  // Helper functions to update form values
  const setGrabRateAmount = (value: string) => setValue?.('grab_rate_amount', value)
  const setGrabRateCurrency = (value: string) => setValue?.('grab_rate_currency', value)

  const [manualGrabRate, setManualGrabRate] = useState<RateResponse | null>(null)

  // Ref to track the last rate we set to prevent infinite loops
  const lastSetRateRef = useRef<string>('')

  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<'thb' | 'transit' | null>('thb')
  const [sortAsc, setSortAsc] = useState(true)
  const [selectedCarrier, setSelectedCarrier] = useState<string>('all')

  const getAvailableUniqueRates = (rates: RateResponse[]) => {
    const seen = new Set<string>()
    let availableRates = rates.filter(rate => {
      // Only include rates that are available (have total_charge and no error_message)
      if (rate.error_message || !rate.total_charge?.amount) {
        return false
      }

      // Create unique key combining shipper account and service type
      const uniqueKey = `${rate.shipper_account.id}-${rate.service_type}-${rate.transit_time || 'null'}-${rate.total_charge?.amount || 0}-${rate.total_charge?.currency || 'null'}`
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

  const getErrorRates = (rates: RateResponse[]) => {
    // Only return rates with actual errors, not just info messages
    return rates.filter(rate => rate.error_message)
  }

  // Generate unique rate ID for selection using the shared function from rateCalculationService
  const getRateUniqueId = (rate: RateResponse, _index: number) => {
    // Use the same function from rateCalculationService to ensure consistency
    return generateRateId(rate as any)
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

  // Auto-create and select Grab rate when amount is entered
  useEffect(() => {
    if (serviceOption === 'Grab' && grabRateAmount && parseFloat(grabRateAmount) > 0) {
      console.log('=== Grab rate useEffect triggered ===')
      console.log('grabRateAmount:', grabRateAmount, 'grabRateCurrency:', grabRateCurrency)
      console.log('setValue available:', !!setValue, 'watch available:', !!watch)

      // Create a unique key for this rate to prevent infinite loops
      const rateKey = `${grabRateAmount}-${grabRateCurrency}`

      // Check if the form already has this rate to prevent infinite loops
      if (watch) {
        const formData = watch()
        const currentRates = formData?.rates || []
        console.log('Current rates in form:', currentRates)

        const hasMatchingRate = currentRates.some((r: any) =>
          r.shipper_account_id === 'grab' &&
          parseFloat(r.total_charge_amount) === parseFloat(grabRateAmount) &&
          r.total_charge_currency === grabRateCurrency
        )

        // Skip if we've already set this exact rate AND it still exists in the form
        if (lastSetRateRef.current === rateKey && hasMatchingRate) {
          console.log('Skipping duplicate rate processing for:', rateKey, '- already exists in form')
          return
        }

        console.log('Processing Grab rate:', rateKey, '- hasMatchingRate:', hasMatchingRate)
      } else {
        console.log('watch not available, proceeding without duplicate check')
      }

      const newGrabRate: RateResponse = {
        shipper_account: {
          id: "grab",
          slug: "grab",
          description: "Grab"
        },
        service_type: "Grab",
        service_name: "Grab",
        pickup_deadline: null,
        booking_cut_off: null,
        delivery_date: null,
        transit_time: null,
        error_message: null,
        info_message: "",
        charge_weight: null,
        total_charge: {
          amount: parseFloat(grabRateAmount),
          currency: grabRateCurrency
        },
        detailed_charges: []
      }

      // Store the manual Grab rate
      setManualGrabRate(newGrabRate)

      // Auto-select this rate
      const rateId = getRateUniqueId(newGrabRate, 0)
      onSelectRate(rateId)

      // Also add the rate to the form's rates array if setValue and watch are available
      if (!setValue || !watch) {
        console.warn('setValue or watch not available - cannot update form rates')
        console.log('setValue:', !!setValue, 'watch:', !!watch)
        return
      }

      console.log('setValue and watch are available, updating form rates...')
      const formData = watch()
      console.log('Current form data:', {
        shipmentRequestID: formData.shipmentRequestID,
        service_options: formData.service_options,
        currentRates: formData.rates
      })

      // Calculate total charge weight from all parcels
      const totalWeight = formData.parcels?.reduce((sum: number, parcel: any) => {
        return sum + (Number(parcel.weight_value) || 0)
      }, 0) || 0

      // Get weight unit from first parcel (assuming all parcels use same unit)
      const weightUnit = formData.parcels?.[0]?.weight_unit || 'kg'

      // Create the rate object in the format expected by the form data structure
      const formGrabRate = {
        rateID: formData.shipmentRequestID || 0, // Use shipmentRequestID or 0 for new requests
        shipment_request_id: formData.shipmentRequestID || 0,
        shipper_account_id: 'grab',
        shipper_account_slug: 'grab',
        shipper_account_description: 'Grab',
        service_type: 'Grab',
        service_name: 'Grab',
        pickup_deadline: null,
        booking_cut_off: null,
        delivery_date: null,
        transit_time: '0',
        error_message: null,
        info_message: '',
        charge_weight_value: totalWeight,
        charge_weight_unit: weightUnit,
        total_charge_amount: parseFloat(grabRateAmount),
        total_charge_currency: grabRateCurrency,
        chosen: '1',
        unique_id: 'grab-Grab',
        detailed_charges: null,
        created_user_name: formData.created_user_name || '',
        past_chosen: '0'
      }

      // Update the rates array in form data
      setValue('rates', [formGrabRate], { shouldDirty: true, shouldValidate: true })
      console.log('Successfully set Grab rate in form:', formGrabRate)

      // Mark this rate as set
      lastSetRateRef.current = rateKey
    } else {
      // Reset when conditions are not met
      lastSetRateRef.current = ''
    }
    // Note: setValue and watch are intentionally not in deps - they're stable from react-hook-form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceOption, grabRateAmount, grabRateCurrency, onSelectRate])


  // Count carriers from available rates
  const carrierCounts = useMemo(() => {
    const availableRates = getAvailableUniqueRates(rates)
    const counts: Record<string, number> = {
      all: availableRates.length
    }

    availableRates.forEach(rate => {
      const slug = rate.shipper_account.slug.toLowerCase()

      // Group dhl-global-mail-asia with dhl
      if (slug === 'dhl-global-mail-asia') {
        counts['dhl'] = (counts['dhl'] || 0) + 1
      } else {
        counts[slug] = (counts[slug] || 0) + 1
      }
    })

    return counts
  }, [rates, exchangeRates, serviceOption])

  // Sorted and filtered rates using useMemo
  const sortedRates = useMemo(() => {
    // Combine API rates with manual Grab rate if it exists
    let allRates = [...rates]
    if (manualGrabRate && serviceOption === 'Grab') {
      allRates = [manualGrabRate, ...rates]
    }

    let ratesToSort = getAvailableUniqueRates(allRates).map(rate => ({
      ...rate,
      thbAmount: rate.total_charge
        ? rate.total_charge.amount * (exchangeRates[rate.total_charge.currency?.toUpperCase()] || 1)
        : 0
    }))

    // Filter by carrier
    if (selectedCarrier !== 'all') {
      ratesToSort = ratesToSort.filter(rate => {
        const slug = rate.shipper_account.slug.toLowerCase()

        // If DHL is selected, include both 'dhl' and 'dhl-global-mail-asia'
        if (selectedCarrier.toLowerCase() === 'dhl') {
          return slug === 'dhl' || slug === 'dhl-global-mail-asia'
        }

        return slug === selectedCarrier.toLowerCase()
      })
    }

    // Sort
    if (sortBy === 'thb') {
      return ratesToSort.sort((a, b) => sortAsc ? a.thbAmount - b.thbAmount : b.thbAmount - a.thbAmount)
    } else if (sortBy === 'transit') {
      return ratesToSort.sort((a, b) => {
        const aTime = a.transit_time ?? Infinity
        const bTime = b.transit_time ?? Infinity
        return sortAsc ? aTime - bTime : bTime - aTime
      })
    }
    return ratesToSort
  }, [rates, exchangeRates, sortBy, sortAsc, serviceOption, selectedCarrier, manualGrabRate])

  return (
    <>
      {/* Calculating Modal */}
      <Modal
        isOpen={isCalculating}
        hideCloseButton
        isDismissable={false}
        backdrop="blur"
        classNames={{
          backdrop: "backdrop-blur-md"
        }}
      >
        <ModalContent>
          <ModalBody className="py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Icon
                icon="solar:calculator-bold"
                className="text-6xl text-primary animate-pulse"
              />
              <h2 className="text-2xl font-bold text-blue-500">
                Calculating Rates
              </h2>
              <p className="text-gray-500 text-center">
                Please wait while we fetch the best shipping rates for you...
              </p>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Card shadow="none">
        {/* <Card shadow="none" className="py-0 px-4 m-0"> */}
        <CardHeader className="px-0 pt-0 pb-1 flex-row items-center justify-left gap-3 w-full">
        <div className="flex flex-col">
          {serviceOption !== 'Grab' && ratesError && (
            <p className="text-red-500 text-sm mt-1">
              <Icon icon="solar:info-circle-bold" className="inline mr-1" />
              {ratesError} - Using fallback rates
            </p>
          )}
          {serviceOption !== 'Grab' && lastUpdated && !ratesError && (
            <p className="text-gray-500 text-xs mt-1">
              <Icon icon="solar:clock-circle-bold" className="inline mr-1" />
              Exchange rates updated: {lastUpdated}
            </p>
          )}
        </div>
        {serviceOption !== 'Grab' && (
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
              className='hidden'
            >
              {isLoadingRates ? 'Updating...' : 'Refresh Rates'}
            </Button>
            <Button
              type="button"
              color="primary"
              size="sm"
              startContent={<Icon icon="solar:calculator-bold" />}
              onPress={onCalculateRates}
              isLoading={isCalculating}
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Calculate Rates'}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardBody className="px-0 pt-0 pb-0">
        {/* Manual Grab Rate Input - Only show when serviceOption is "Grab" */}
        {serviceOption === 'Grab' && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 mb-3">
              <Icon icon="solar:hand-money-bold" className="text-blue-600 text-xl mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 text-sm">
                  Manual Grab Rate Entry
                </h3>
                <p className="text-blue-700 text-xs">
                  Enter the Grab delivery charge manually
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <Input
                label="Total Charge Amount"
                placeholder="Enter amount"
                value={grabRateAmount}
                onValueChange={setGrabRateAmount}
                type="number"
                step="0.01"
                min="0"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">฿</span>
                  </div>
                }
                isRequired
              />
              <Select
                label="Currency"
                placeholder="Select currency"
                selectedKeys={[grabRateCurrency]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  if (selectedKey) setGrabRateCurrency(selectedKey)
                }}
                isRequired
              >
                <SelectItem key="THB" value="THB">THB</SelectItem>
                <SelectItem key="USD" value="USD">USD</SelectItem>
                <SelectItem key="EUR" value="EUR">EUR</SelectItem>
                <SelectItem key="GBP" value="GBP">GBP</SelectItem>
              </Select>
            </div>
          </div>
        )}

        {rates.length === 0 && !manualGrabRate && serviceOption !== 'Grab' ? (
          <div className="text-center py-8">
            {rateCalculationError ? (
              <div className="flex flex-col items-center gap-4">
                <Icon icon="solar:danger-circle-bold" className="text-6xl text-red-500 mb-2" />
                <div className="max-w-2xl">
                  <h3 className="text-xl font-bold text-red-600 mb-2">
                    Rate Calculation Failed
                  </h3>
                  <p className="text-red-500 mb-4">
                    {rateCalculationError.message}
                  </p>
                  {rateCalculationError.details && rateCalculationError.details.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                      <h4 className="font-semibold text-red-700 mb-2">Validation Errors:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rateCalculationError.details.map((detail, index) => (
                          <li key={index} className="text-red-600 text-sm">
                            <span className="font-medium">{detail.path}:</span> {detail.info}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    type="button"
                    color="danger"
                    variant="flat"
                    size="sm"
                    className="mt-4"
                    startContent={<Icon icon="solar:refresh-bold" />}
                    onPress={onCalculateRates}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <Icon icon="solar:calculator-bold" className="text-4xl mb-2 mx-auto" />
                <p>No rates calculated yet. Click "Calculate Rates" to get shipping quotes.</p>
              </div>
            )}
          </div>
        ) : serviceOption !== 'Grab' ? (
          <>
            {/* Carrier Filter Tabs */}
            <Tabs
              aria-label="Carrier filter"
              selectedKey={selectedCarrier}
              onSelectionChange={(key) => setSelectedCarrier(key as string)}
              className="mb-4"
              color="primary"
              variant="underlined"
            >
              <Tab
                key="all"
                title={
                  <div className="flex items-center gap-2">
                    <span>All</span>
                    <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                      {carrierCounts.all || 0}
                    </span>
                  </div>
                }
              />
              <Tab
                key="fedex"
                title={
                  <div className="flex items-center gap-2">
                    <span>FedEx</span>
                    <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                      {carrierCounts.fedex || 0}
                    </span>
                  </div>
                }
              />
              <Tab
                key="dhl"
                title={
                  <div className="flex items-center gap-2">
                    <span>DHL</span>
                    <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                      {carrierCounts.dhl || 0}
                    </span>
                  </div>
                }
              />
              <Tab
                key="ups"
                title={
                  <div className="flex items-center gap-2">
                    <span>UPS</span>
                    <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                      {carrierCounts.ups || 0}
                    </span>
                  </div>
                }
              />
              <Tab
                key="tnt"
                title={
                  <div className="flex items-center gap-2">
                    <span>TNT</span>
                    <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                      {carrierCounts.tnt || 0}
                    </span>
                  </div>
                }
              />
            </Tabs>

            {/* Error Rates Section - Only show when no available rates */}
            {sortedRates.length === 0 && getErrorRates(rates).length > 0 && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Icon icon="solar:danger-triangle-bold" className="text-yellow-600 text-xl mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 text-sm">
                      Some carriers returned errors
                    </h3>
                    <p className="text-yellow-700 text-xs">
                      The following carriers could not provide rates due to validation issues:
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {getErrorRates(rates).map((rate, index) => (
                    <div key={index} className="bg-white rounded p-3 border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-gray-800">
                            {rate.shipper_account.description}
                          </div>
                          <div className="text-red-600 text-xs mt-1">
                            <Icon icon="solar:close-circle-bold" className="inline mr-1" />
                            {rate.error_message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
        {serviceOption !== 'Grab' && (rates.length > 0 || manualGrabRate) && (
          <Table aria-label="Shipping Rates" removeWrapper className="min-w-full">
            <TableHeader>
              <TableColumn>Select</TableColumn>
              <TableColumn>Carrier</TableColumn>
              <TableColumn>Service</TableColumn>
              <TableColumn className="text-right flex items-center gap-1">
                Estimated THB
                <Button
                  className="h-5 w-5 min-w-0"
                  variant="light"
                  isIconOnly
                  onPress={() => {
                    if (sortBy === 'thb') setSortAsc(!sortAsc)
                    else { setSortBy('thb'); setSortAsc(true) }
                  }}
                >
                  <Icon
                    icon={sortBy === 'thb'
                      ? sortAsc
                        ? "solar:arrow-up-bold"   // lowest → highest
                        : "solar:arrow-down-bold" // highest → lowest
                      : "solar:arrow-up-bold" // default when not sorting by THB
                    }
                    className="w-3 h-3"
                  />
                </Button>
              </TableColumn>
              <TableColumn className="text-right">Total Charge</TableColumn>
              <TableColumn className="text-right">Charge Weight (kg)</TableColumn>
              {/* <TableColumn>Transit Time</TableColumn> */}
              <TableColumn className="flex items-center gap-1">
                Transit Time
                <Button
                  className="h-5 w-5 min-w-0"
                  variant="light"
                  isIconOnly
                  onPress={() => {
                    if (sortBy === 'transit') setSortAsc(!sortAsc)
                    else { setSortBy('transit'); setSortAsc(true) }
                  }}
                >
                  <Icon
                    icon={sortBy === 'transit'
                      ? sortAsc
                        ? "solar:arrow-up-bold"
                        : "solar:arrow-down-bold"
                      : "solar:arrow-up-bold"
                    }
                    className="w-3 h-3"
                  />
                </Button>
              </TableColumn>
              <TableColumn>Delivery Date</TableColumn>
              <TableColumn>Pickup Deadline</TableColumn>
              <TableColumn>Booking Cutoff</TableColumn>
            </TableHeader>
            <TableBody emptyContent={
              getErrorRates(rates).length > 0
                ? "No valid rates available. Please review the error messages above and correct the validation issues."
                : "No available rates found. Check or change your pick up date or expected delivery date or weight."
            }>
              {/* {getAvailableUniqueRates(rates).map((rate, index) => { */}
              {sortedRates.map((rate, index) => {
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
                        rate.total_charge?.currency ?? null,
                        exchangeRates
                      )} THB
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        rate.total_charge?.amount ?? null,
                        rate.total_charge?.currency ?? null
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {convertWeightToKg(rate.charge_weight)}
                    </TableCell>
                    <TableCell>
                      {rate.shipper_account.description === 'DHL eCommerce Asia'
                        ? '1-3(Working) day(s)'
                        : rate.transit_time ? `${rate.transit_time} day(s)` : '-'}
                    </TableCell>
                    <TableCell>{formatDateTime(rate.delivery_date)}</TableCell>
                    <TableCell>{formatDateTime(rate.pickup_deadline) || '-'}</TableCell>
                    <TableCell>{formatDateTime(rate.booking_cut_off) || '-'}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>

          </Table>
        )}
      </CardBody>
    </Card>
    </>
  )
}

export default RatesSection
