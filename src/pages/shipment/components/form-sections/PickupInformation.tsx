import { Card, CardHeader, CardBody, Input, Textarea, Alert, Select, SelectItem } from '@heroui/react'
import { Controller } from 'react-hook-form'
import type { FormSectionProps } from '../../types/shipment-form.types'
import { getDefaultPickupValues } from '../../constants/form-defaults'
import { useEffect, useState } from 'react'

// Common timezones
const TIMEZONES = [
  { key: 'UTC', label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  { key: 'America/New_York', label: 'EST/EDT (Eastern Time)', value: 'America/New_York' },
  { key: 'America/Chicago', label: 'CST/CDT (Central Time)', value: 'America/Chicago' },
  { key: 'America/Denver', label: 'MST/MDT (Mountain Time)', value: 'America/Denver' },
  { key: 'America/Los_Angeles', label: 'PST/PDT (Pacific Time)', value: 'America/Los_Angeles' },
  { key: 'Europe/London', label: 'GMT/BST (London)', value: 'Europe/London' },
  { key: 'Europe/Paris', label: 'CET/CEST (Central European)', value: 'Europe/Paris' },
  { key: 'Asia/Dubai', label: 'GST (Gulf Standard Time)', value: 'Asia/Dubai' },
  { key: 'Asia/Bangkok', label: 'ICT (Indochina Time)', value: 'Asia/Bangkok' },
  { key: 'Asia/Singapore', label: 'SGT (Singapore Time)', value: 'Asia/Singapore' },
  { key: 'Asia/Tokyo', label: 'JST (Japan Standard Time)', value: 'Asia/Tokyo' },
  { key: 'Asia/Shanghai', label: 'CST (China Standard Time)', value: 'Asia/Shanghai' },
  { key: 'Australia/Sydney', label: 'AEDT/AEST (Sydney)', value: 'Australia/Sydney' },
]

interface PickupInformationProps extends FormSectionProps {
  today: string
  setValue?: any
  watch?: any
  onClearRates?: () => void
}

const PickupInformation = ({ register, errors, control, setValue, watch, onClearRates }: PickupInformationProps) => {

  // Get default pickup values based on current time
  const { pickupDate: defaultPickupDate, minDate, expectedDeliveryDate: defaultExpectedDeliveryDate } = getDefaultPickupValues()

  // Watch pickup date to adjust start time
  const pickupDate = watch ? watch('pick_up_date') : defaultPickupDate
  const expectedDeliveryDate = watch ? watch('due_date') : defaultExpectedDeliveryDate
  const pickupStartTime = watch ? watch('pick_up_start_time') : ''
  const pickupEndTime = watch ? watch('pick_up_end_time') : ''
  const todayDate = new Date().toISOString().split('T')[0]

  // State to track if pickup date is on weekend
  const [isWeekend, setIsWeekend] = useState(false)
  const [isDeliveryBeforePickup, setIsDeliveryBeforePickup] = useState(false)

  // Check if a date is weekend (Saturday = 6, Sunday = 0)
  const checkIfWeekend = (dateString: string) => {
    if (!dateString) return false
    const date = new Date(dateString + 'T00:00:00')
    const day = date.getDay()
    return day === 0 || day === 6
  }

  // Check if delivery date is before pickup date
  const checkDeliveryBeforePickup = (pickup: string, delivery: string) => {
    if (!pickup || !delivery) return false
    const pickupDate = new Date(pickup + 'T00:00:00')
    const deliveryDate = new Date(delivery + 'T00:00:00')
    return deliveryDate < pickupDate
  }

  // Update weekend status when pickup date changes
  useEffect(() => {
    if (pickupDate) {
      setIsWeekend(checkIfWeekend(pickupDate))
    }
  }, [pickupDate])

  // Update delivery date validation when either date changes
  useEffect(() => {
    if (pickupDate && expectedDeliveryDate) {
      setIsDeliveryBeforePickup(checkDeliveryBeforePickup(pickupDate, expectedDeliveryDate))
    }
  }, [pickupDate, expectedDeliveryDate])

  const normalizeTime = (timeString?: string) => {
    if (!timeString) return ""
    return timeString.split(":").slice(0, 2).join(":") // take first 2 parts (HH:mm)
  }

  // Determine start time based on pickup date
  const getPickUpStartTime = (selectedDate: string) => {
    if (pickupStartTime) {
      return normalizeTime(pickupStartTime)
    }
    return selectedDate === todayDate ? '12:00' : '09:00'
  }

  const getPickUpEndTime = (): string => {
    if (pickupStartTime) {
      return normalizeTime(pickupEndTime)
    }
    return '17:00'
  }

  // Handler to sync both date fields when one is changed
  const handleDateChange = (fieldName: "pick_up_date" | "due_date") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateValue = e.target.value
      if (setValue) {
        setValue(fieldName, dateValue, { shouldValidate: true, shouldDirty: true })

        if (fieldName === "pick_up_date") {
          // Only adjust pickup times if pickup date is changed
          const newStartTime = getPickUpStartTime(dateValue)
          setValue('pick_up_start_time', newStartTime, { shouldValidate: true, shouldDirty: true })
        }
      }

      // Clear rates when pickup or delivery date changes
      if (onClearRates) {
        console.log(`${fieldName} changed, clearing rates...`)
        onClearRates()
      }
    }

  // Effect to set initial start time when component mounts or pickup date changes
  useEffect(() => {
    if (setValue && pickupDate && !pickupStartTime) {
      const startTime = getPickUpStartTime(pickupDate)
      setValue('pick_up_start_time', startTime, { shouldValidate: false, shouldDirty: false })
    }
  }, [pickupDate, setValue, pickupStartTime])

  return (
    <Card shadow="none">
      {/* <Card shadow="none" className="py-0 px-4 m-0"> */}
      <CardHeader className="px-0 pt-0 pb-1">
        <h2 className="text-lg font-semibold">Pickup Information</h2>
      </CardHeader>

      <CardBody className="px-0 pt-0 pb-0">
        {isWeekend && (
          <Alert
            color="danger"
            variant="flat"
            title="Weekend Pickup"
            description="The selected pickup date falls on a weekend. Please confirm this is intentional as most carriers have limited or no weekend service."
            className="mb-3"
          />
        )}
        {isDeliveryBeforePickup && (
          <Alert
            color="danger"
            variant="flat"
            title="Invalid Delivery Date"
            description="The expected delivery date cannot be earlier than the pickup date. Please adjust the dates."
            className="mb-3"
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-2">
          <>
            <Input
              {...register('pick_up_date', {
                required: 'Pickup date is required',
                onChange: handleDateChange('pick_up_date')
              })}
              isRequired
              type="date"
              label={<span>Pickup Date</span>}
              min={minDate}
              value={pickupDate || defaultPickupDate}
              onChange={handleDateChange('pick_up_date')}
              errorMessage={errors.pick_up_date?.message}
              isInvalid={!!errors.pick_up_date}
            />

            <Input
              {...register('due_date', {
                required: 'Expected delivery date is required',
                onChange: handleDateChange('due_date')
              })}
              isRequired
              type="date"
              label={<span>Expected Delivery Date</span>}
              min={minDate}
              value={expectedDeliveryDate}
              onChange={handleDateChange('due_date')}
              errorMessage={errors.due_date?.message}
              isInvalid={!!errors.due_date}
            />

            <Controller
              name="pick_up_timezone"
              control={control}
              rules={{ required: 'Timezone is required' }}
              defaultValue="Asia/Bangkok"
              render={({ field }) => (
                <Select
                  {...field}
                  isRequired
                  label={<span>Timezone</span>}
                  placeholder="Select timezone"
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string
                    field.onChange(selected)
                  }}
                  errorMessage={errors.pick_up_timezone?.message}
                  isInvalid={!!errors.pick_up_timezone}
                  color={!watch('pick_up_timezone') ? "warning" : "default"}
                >
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.key} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              name="pick_up_start_time"
              control={control}
              rules={{ required: 'Pickup start time is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  isRequired
                  type="time"
                  label={<span>Start Time</span>}
                  errorMessage={errors.pick_up_start_time?.message}
                  isInvalid={!!errors.pick_up_start_time}
                  value={getPickUpStartTime(pickupDate || defaultPickupDate)}
                  // value={field.value || getPickUpStartTime(pickupDate || defaultPickupDate)}
                  onChange={(e) => {
                    field.onChange(e.target.value) // updates RHF
                    if (onClearRates) {
                      console.log('Pickup start time changed, clearing rates...')
                      onClearRates()
                    }
                  }}
                  color={!watch('pick_up_start_time') ? "warning" : "default"}
                />
              )}
            />

            <Controller
              name="pick_up_end_time"
              control={control}
              rules={{ required: 'Pickup end time is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  isRequired
                  type="time"
                  label={<span>End Time</span>}
                  errorMessage={errors.pick_up_end_time?.message}
                  isInvalid={!!errors.pick_up_end_time}
                  value={getPickUpEndTime()}
                  // value={field.value || getPickUpEndTime()}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    // Clear rates when pickup end time changes
                    if (onClearRates) {
                      console.log('Pickup end time changed, clearing rates...')
                      onClearRates()
                    }
                  }}
                  color={!watch('pick_up_end_time') ? "warning" : "default"}
                />
              )}
            />
            <div className="col-span-4">
              <Textarea
                {...register('pick_up_instructions')}
                label={<span>Pickup Instructions</span>}
                placeholder="Enter pickup instructions"
                errorMessage={errors.pick_up_instructions?.message}
                isInvalid={!!errors.pick_up_instructions}
                rows={1}
                className="resize-none"
                minRows={1}
              // color={!watch('pick_up_instructions') ? "warning" : "default"}
              />
            </div>
          </>
        </div>
      </CardBody>
    </Card>
  )
}

export default PickupInformation