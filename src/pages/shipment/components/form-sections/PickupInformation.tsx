import { Card, CardHeader, CardBody, Input, Textarea } from '@heroui/react'
import type { FormSectionProps } from '../../types/shipment-form.types'

interface PickupInformationProps extends FormSectionProps {
  today: string
  setValue?: any
}

const PickupInformation = ({ register, errors, today, setValue }: PickupInformationProps) => {

  // Handler to sync both date fields when one is changed
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    if (setValue) {
      setValue('pick_up_date', dateValue, { shouldValidate: true, shouldDirty: true })
      setValue('due_date', dateValue, { shouldValidate: true, shouldDirty: true })
    }
  }

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
            label={<span>Pickup/Due Date <span className="text-red-500">*</span></span>}
            placeholder="Select pickup and due date"
            errorMessage={errors.pick_up_date?.message || errors.due_date?.message}
            isInvalid={!!errors.pick_up_date || !!errors.due_date}
            min={today}
            onChange={handleDateChange}
          />

          {/* Hidden field to sync due_date with pick_up_date */}
          <input
            {...register('due_date')}
            type="hidden"
          />
          <div className="flex gap-2">
            <Input
              {...register('pick_up_start_time', {
                required: 'Start time is required',
              })}
              type="time"
              label={<span>Start Time <span className="text-red-500">*</span></span>}
              errorMessage={errors.pick_up_start_time?.message}
              isInvalid={!!errors.pick_up_start_time}
            />
            <Input
              {...register('pick_up_end_time', {
                required: 'End time is required',
              })}
              type="time"
              label={<span>End Time <span className="text-red-500">*</span></span>}
              errorMessage={errors.pick_up_end_time?.message}
              isInvalid={!!errors.pick_up_end_time}
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