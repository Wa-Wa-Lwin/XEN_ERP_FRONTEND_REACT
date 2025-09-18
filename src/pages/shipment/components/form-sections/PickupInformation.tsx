import { Card, CardHeader, CardBody, Input, Textarea } from '@heroui/react'
import type { FormSectionProps } from '../../types/shipment-form.types'

const PickupInformation = ({ register, errors }: FormSectionProps) => {

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
              required: 'Pickup date is required',
            })}
            type="date"
            label={<span>Pickup Date <span className="text-red-500">*</span></span>}
            errorMessage={errors.pick_up_date?.message}
            isInvalid={!!errors.pick_up_date}
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