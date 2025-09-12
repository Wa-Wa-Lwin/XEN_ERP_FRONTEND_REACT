import { Card, CardBody, Button } from '@heroui/react'
import { useShipmentForm } from '../hooks/useShipmentForm'
import {
  BasicInformation,
  AddressSection,
  PickupInformation,
  // InsuranceInformation,
  ParcelsSection
} from './form-sections'

const ShipmentForm = () => {
  const { register, control, handleSubmit, watch, setValue, errors, onSubmit, isSubmitting, today } = useShipmentForm()

  return (
    <div className="mx-auto w-full">
      <Card className="w-full">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <BasicInformation register={register} errors={errors} today={today} />

            {/* <Divider /> */}

            <AddressSection register={register} errors={errors} control={control} title="Ship From Address" prefix="ship_from" />
            
            <AddressSection register={register} errors={errors} control={control} title="Ship To Address" prefix="ship_to" />
            
            {/* <PickupInformation register={register} errors={errors} watch={watch} /> */}
            <PickupInformation register={register} errors={errors} />

            {/* <InsuranceInformation register={register} errors={errors} /> */}

            <ParcelsSection register={register} errors={errors} control={control} setValue={setValue} />

            <div className="flex justify-end gap-4">
              <Button variant="bordered" type="button">
                Cancel
              </Button>
              <Button 
                color="primary" 
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Shipment Request'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}


export default ShipmentForm