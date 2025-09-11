import { Card, CardHeader, CardBody, Input, Textarea } from '@heroui/react'
import type { FormSectionProps } from '../../types/shipment-form.types'

const PickupInformation = ({ register, errors, watch }: FormSectionProps) => {
  const watchPickupStatus = watch?.('pick_up_status')

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Pickup Information</h2>
      </CardHeader>
      <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              {...register('pick_up_status')}
              type="checkbox"
              className="rounded"
            />
            <span>Pickup Required</span>
          </label>
        </div>
        
        {watchPickupStatus && (
          <>
            <Input
              {...register('pick_up_date', { required: watchPickupStatus ? 'Pickup date is required' : false })}
              type="date"
              label="Pickup Date"
              errorMessage={errors.pick_up_date?.message}
              isInvalid={!!errors.pick_up_date}
            />
            <Input
              {...register('pick_up_start_time', { required: watchPickupStatus ? 'Start time is required' : false })}
              type="time"
              label="Start Time"
              errorMessage={errors.pick_up_start_time?.message}
              isInvalid={!!errors.pick_up_start_time}
            />
            <Input
              {...register('pick_up_end_time', { required: watchPickupStatus ? 'End time is required' : false })}
              type="time"
              label="End Time"
              errorMessage={errors.pick_up_end_time?.message}
              isInvalid={!!errors.pick_up_end_time}
            />
            <Textarea
              {...register('pick_up_instructions', { required: watchPickupStatus ? 'Instructions are required' : false })}
              label="Pickup Instructions"
              placeholder="Enter pickup instructions"
              errorMessage={errors.pick_up_instructions?.message}
              isInvalid={!!errors.pick_up_instructions}
            />
          </>
        )}
      </CardBody>
    </Card>
  )
}

export default PickupInformation