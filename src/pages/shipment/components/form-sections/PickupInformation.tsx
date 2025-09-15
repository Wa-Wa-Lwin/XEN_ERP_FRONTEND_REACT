import { Card, CardHeader, CardBody, Input, Textarea } from '@heroui/react'
import type { FormSectionProps } from '../../types/shipment-form.types'

const PickupInformation = ({ register, errors }: FormSectionProps) => {

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-xl font-semibold">Pickup Information</h2>
        </div>
      </CardHeader>

      <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <>
          <Input
            {...register('pick_up_date', {
              required: 'Pickup date is required',
            })}
            type="date"
            label="Pickup Date"
            errorMessage={errors.pick_up_date?.message}
            isInvalid={!!errors.pick_up_date}
          />
          <div className="flex gap-2">
            <Input
              {...register('pick_up_start_time', {
                required: 'Start time is required',
              })}
              type="time"
              label="Start Time"
              errorMessage={errors.pick_up_start_time?.message}
              isInvalid={!!errors.pick_up_start_time}
            />
            <Input
              {...register('pick_up_end_time', {
                required: 'End time is required',
              })}
              type="time"
              label="End Time"
              errorMessage={errors.pick_up_end_time?.message}
              isInvalid={!!errors.pick_up_end_time}
            />
          </div>
          <div className="col-span-2">
            <Textarea
              {...register('pick_up_instructions', {
                required: 'Instructions are required',
              })}
              label="Pickup Instructions"
              placeholder="Enter pickup instructions"
              errorMessage={errors.pick_up_instructions?.message}
              isInvalid={!!errors.pick_up_instructions}
              rows={1}
              className="resize-none"
            />
          </div>
        </>
      </CardBody>
    </Card>
  )
}

export default PickupInformation