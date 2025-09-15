import { useState } from 'react'
import { Card, CardHeader, CardBody, Input, Textarea } from '@heroui/react'
import type { FormSectionProps } from '../../types/shipment-form.types'

const PickupInformation = ({ register, errors }: FormSectionProps) => {
  const [pickupRequired, setPickupRequired] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-xl font-semibold">Pickup Information</h2>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded"
                {...register('pick_up_status')}
                onChange={(e) => setPickupRequired(e.target.checked)}
              />
              <span>Pickup Required</span>
            </label>
          </div>
        </div>
      </CardHeader>

      <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pickupRequired && (
          <>
            <Input
              {...register('pick_up_date', {
                required: pickupRequired ? 'Pickup date is required' : false,
              })}
              type="date"
              label="Pickup Date"
              errorMessage={errors.pick_up_date?.message}
              isInvalid={!!errors.pick_up_date}
            />
            <div className="flex gap-2">
              <Input
              {...register('pick_up_start_time', {
                required: pickupRequired ? 'Start time is required' : false,
              })}
              type="time"
              label="Start Time"
              errorMessage={errors.pick_up_start_time?.message}
              isInvalid={!!errors.pick_up_start_time}
            />
            <Input
              {...register('pick_up_end_time', {
                required: pickupRequired ? 'End time is required' : false,
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
                required: pickupRequired ? 'Instructions are required' : false,
              })}
              label="Pickup Instructions"
              placeholder="Enter pickup instructions"
              errorMessage={errors.pick_up_instructions?.message}
              isInvalid={!!errors.pick_up_instructions}
            />

            </div>
            
           
          </>
        )}
      </CardBody>
    </Card>
  )
}

export default PickupInformation