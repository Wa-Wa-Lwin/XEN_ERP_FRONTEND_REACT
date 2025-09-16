import { useState } from 'react'
import { Card, CardBody, Button } from '@heroui/react'
import axios from 'axios'
import { useShipmentForm } from '../hooks/useShipmentForm'
import {
  BasicInformation,
  AddressSelector,
  PickupInformation,
  // InsuranceInformation,
  ParcelsSection,
  RatesSection
} from './form-sections'
import ShipmentPreviewModal from './ShipmentPreviewModal'
import type { ShipmentFormData } from '../types/shipment-form.types'

const ShipmentForm = () => {
  const { register, control, handleSubmit, setValue, errors, onSubmit, isSubmitting, today, getValues } = useShipmentForm()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<ShipmentFormData | null>(null)
  const [isCalculatingRate, setIsCalculatingRate] = useState(false)
  const [calculatedRates, setCalculatedRates] = useState<any[]>([])

  const calculateRates = async (formData: ShipmentFormData) => {
    try {
      setIsCalculatingRate(true)

      // Transform form data to match the backend API format
      const shipment = {
        ship_from: {
          contact_name: formData.ship_from_contact_name ,
          company_name: formData.ship_from_company_name ,
          street1: formData.ship_from_street1 ,
          city: formData.ship_from_city ,
          state: formData.ship_from_state ,
          postal_code: formData.ship_from_postal_code ,
          country: formData.ship_from_country ,
          phone: formData.ship_from_phone ,
          email: formData.ship_from_email 
        },
        ship_to: {
          contact_name: formData.ship_to_contact_name ,
          company_name: formData.ship_to_company_name ,
          street1: formData.ship_to_street1 ,
          city: formData.ship_to_city ,
          state: formData.ship_to_state ,
          postal_code: formData.ship_to_postal_code ,
          country: formData.ship_to_country ,
          phone: formData.ship_to_phone ,
          email: formData.ship_to_email 
        },
        parcels: formData.parcels?.map(parcel => ({
          box_type: "custom",
          dimension: {
            width: parcel.width ,
            height: parcel.height ,
            depth: parcel.depth ,
            unit: parcel.dimension_unit 
          },
          items: parcel.parcel_items?.map(item => ({
            description: item.description ,
            quantity: item.quantity ,
            price: {
              currency: item.price_currency ,
              amount: item.price_amount ,
            },
            item_id: item.item_id ,
            origin_country: item.origin_country ,
            weight: {
              unit: item.weight_unit ,
              value: item.weight_value ,
            },
            sku: item.sku ,
            hs_code: item.hs_code 
          })),
          description: parcel.description ,
          weight: {
            unit: parcel.weight_unit ,
            value: parcel.weight_value 
          }
        })),
        delivery_instructions: "handle with care"
      }

      // Determine type based on countries (you can modify this logic as needed)
      const type = formData.ship_from_country === formData.ship_to_country ? "domestic" : "export"

      // Backend API payload structure
      const backendPayload = {
        preparedata: {
          shipment: shipment
        },
        type: type
      }

      const response = await axios.post(
        import.meta.env.VITE_APP_CALCULATE_RATE,
        backendPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      )

      // Extract rates from the API response
      const rates = response.data?.data?.rates || []

      // Store rates in component state
      setCalculatedRates(rates)

      // Store the rates in the form data
      const updatedFormData = {
        ...formData,
        rates: rates
      }

      return updatedFormData
    } catch (error) {
      
      // console.error('Error calculating rates:', error)
      // alert('Error calculating shipping rates. Please try again.')
      // return formData

      if (axios.isAxiosError(error)) {
        console.error("API Error:", error.response?.data || error.message)
      } else {
        console.error("Unexpected Error:", error)
      }
      alert('Error calculating shipping rates. Please try again.')
      return formData

    } finally {
      setIsCalculatingRate(false)
    }
  }

  const handlePreview = async () => {
    const formData = getValues()

    // Calculate rates before showing preview
    const formDataWithRates = await calculateRates(formData)

    setPreviewData(formDataWithRates)
    setIsPreviewOpen(true)
  }

  const handleConfirmSubmit = () => {
    if (previewData) {
      setIsPreviewOpen(false)
      onSubmit(previewData)
    }
  }

  const handleCalculateRate = async () => {
    const formData = getValues()
    const updatedFormData = await calculateRates(formData)

    if (updatedFormData.rates && updatedFormData.rates.length > 0) {
      const validRates = updatedFormData.rates.filter((rate: any) => rate.total_charge?.amount > 0)
      console.log(`Rates calculated successfully! Found ${updatedFormData.rates.length} rate option(s), ${validRates.length} with valid pricing.`)
    } else {
      console.log("Rates calculated but no rates were returned.")
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

            <RatesSection
              rates={calculatedRates}
              onCalculateRates={handleCalculateRate}
              isCalculating={isCalculatingRate}
              register={register}
              errors={errors}
            />

            <div className="flex justify-end gap-4">
              <Button
                variant="bordered"
                type="button"
                onPress={() => {
                  console.log("❌ Cancel button clicked")
                }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"             
                startContent= '<Icon icon="solar:eye-bold" />'
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