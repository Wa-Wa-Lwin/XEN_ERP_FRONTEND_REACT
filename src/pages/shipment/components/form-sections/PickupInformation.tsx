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

  // Determine start time based on pickup date
  const getStartTimeForDate = (selectedDate: string) => {
    return selectedDate === todayDate ? '12:00' : '09:00'
  }

  // Handler to sync both date fields when one is changed
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    if (setValue) {
      setValue('pick_up_date', dateValue, { shouldValidate: true, shouldDirty: true })
      setValue('due_date', dateValue, { shouldValidate: true, shouldDirty: true })

      // Update start time based on selected date
      const newStartTime = getStartTimeForDate(dateValue)
      setValue('pick_up_start_time', newStartTime, { shouldValidate: true, shouldDirty: true })
    }
  }

  // Effect to set initial start time when component mounts or pickup date changes
  useEffect(() => {
    if (setValue && pickupDate) {
      const startTime = getStartTimeForDate(pickupDate)
      setValue('pick_up_start_time', startTime, { shouldValidate: false, shouldDirty: false })
    }
  }, [pickupDate, setValue])

  return (
    <Card shadow="none">
    {/* <Card shadow="none" className="py-0 px-4 m-0"> */}
      <CardHeader className="px-0 pt-0 pb-1">
        <h2 className="text-lg font-semibold">Pickup Information</h2>
      </CardHeader>

      <CardBody className="px-0 pt-0 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <>
          <Input
            {...register('pick_up_date', {
              required: 'Pickup/Due date is required',
              onChange: handleDateChange
            })}
            type="date"
            label={<span>Pickup Date <span className="text-red-500">*</span></span>}
            placeholder="Select pickup and due date"
            errorMessage={errors.pick_up_date?.message || errors.due_date?.message}
            isInvalid={!!errors.pick_up_date || !!errors.due_date}
            min={minDate}
            value={pickupDate || defaultPickupDate}
            onChange={handleDateChange}
          />

          {/* Hidden field to sync due_date with pick_up_date */}
          <input
            {...register('due_date')}
            type="hidden"
            defaultValue={defaultPickupDate}
          />
          <div className="flex gap-2">
            <Controller
              name="pick_up_start_time"
              control={control}
              rules={{ required: 'Start time is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="time"
                  label={<span>Start Time <span className="text-red-500">*</span></span>}
                  errorMessage={errors.pick_up_start_time?.message}
                  isInvalid={!!errors.pick_up_start_time}
                  value={field.value || pickupStartTime || getStartTimeForDate(pickupDate || defaultPickupDate)}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
            <Controller
              name="pick_up_end_time"
              control={control}
              rules={{ required: 'End time is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="time"
                  label={<span>End Time <span className="text-red-500">*</span></span>}
                  errorMessage={errors.pick_up_end_time?.message}
                  isInvalid={!!errors.pick_up_end_time}
                  value={field.value || pickupEndTime || '17:00'}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>
          <div className="col-span-2">
            <Textarea
              {...register('pick_up_instructions')}
              label={<span>Pickup Instructions</span>}
              placeholder="Enter pickup instructions"
              errorMessage={errors.pick_up_instructions?.message}
              isInvalid={!!errors.pick_up_instructions}
              rows={1}
              className="resize-none"
              minRows={1}
            />
          </div>
        </>
        </div>
      </CardBody>
    </Card>
  )
}

export default PickupInformation