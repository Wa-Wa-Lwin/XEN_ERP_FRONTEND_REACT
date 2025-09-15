import { useState } from 'react'
import { Card, CardBody, Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useShipmentForm } from '../hooks/useShipmentForm'
import {
  BasicInformation,
  AddressSelector,
  PickupInformation,
  // InsuranceInformation,
  ParcelsSection
} from './form-sections'
import ShipmentPreviewModal from './ShipmentPreviewModal'
import type { ShipmentFormData } from '../types/shipment-form.types'

const ShipmentForm = () => {
  const { register, control, handleSubmit, setValue, errors, onSubmit, isSubmitting, today, getValues } = useShipmentForm()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<ShipmentFormData | null>(null)

  const handlePreview = () => {
    // alert("clicked preview and submit."); 
    // console.log("clicked preview and submit."); 
    const formData = getValues()
    setPreviewData(formData)
    setIsPreviewOpen(true)
  }

  const handleConfirmSubmit = () => {
    if (previewData) {
      setIsPreviewOpen(false)
      onSubmit(previewData)
    }
  }

  return (
    <div className="mx-auto w-full">
      <Card className="w-full">
        <CardBody>        
          <form 
            onSubmit={handleSubmit(handlePreview)}
            className="space-y-8"
          >

            <BasicInformation register={register} errors={errors} today={today} />

            {/* <Divider /> */}

            <AddressSelector register={register} errors={errors} control={control} setValue={setValue} title="Ship From Address" prefix="ship_from" />

            <AddressSelector register={register} errors={errors} control={control} setValue={setValue} title="Ship To Address" prefix="ship_to" />
            
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
                startContent={<Icon icon="solar:eye-bold" />}
              >
                Preview & Submit
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>      
      {/* Preview Modal */}
      {previewData && (
        <ShipmentPreviewModal
          isOpen={isPreviewOpen}
          // isOpen={true}
          onClose={() => setIsPreviewOpen(false)}
          onConfirm={handleConfirmSubmit}
          formData={previewData}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}


export default ShipmentForm