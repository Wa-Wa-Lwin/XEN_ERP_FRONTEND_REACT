import { Card, CardHeader, CardBody, Input, Textarea } from '@heroui/react'
import { Controller } from 'react-hook-form'
import type { FormSectionProps } from '../../types/shipment-form.types'
import { getDefaultPickupValues } from '../../constants/form-defaults'
import { useEffect } from 'react'

interface PickupInformationProps extends FormSectionProps {
  today: string
  setValue?: any
  watch?: any
}

const PickupInformation = ({ register, errors, control, setValue, watch }: PickupInformationProps) => {

  // Get default pickup values based on current time
  const { pickupDate: defaultPickupDate, minDate } = getDefaultPickupValues()

  // Watch pickup date to adjust start time
  const pickupDate = watch ? watch('pick_up_date') : defaultPickupDate
  const pickupStartTime = watch ? watch('pick_up_start_time') : ''
  const pickupEndTime = watch ? watch('pick_up_end_time') : ''
  const todayDate = new Date().toISOString().split('T')[0]

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
              onChange={handleDateChange('due_date')}
              errorMessage={errors.due_date?.message}
              isInvalid={!!errors.due_date}
            />

            <Controller
              name="pick_up_start_time"
              control={control}
              rules={{ required: 'Pickup start time is required' }}
              render={({ field }) => (
                <Input
                  isRequired
                  {...field}
                  type="time"
                  label={<span>Start Time</span>}
                  errorMessage={errors.pick_up_start_time?.message}
                  isInvalid={!!errors.pick_up_start_time}
                  value={getPickUpStartTime(pickupDate || defaultPickupDate)}
                  onChange={(e) => field.onChange(e.target.value)}
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
                  onChange={(e) => field.onChange(e.target.value)}
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