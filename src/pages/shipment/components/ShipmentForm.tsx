import { useState } from 'react'
import { Button, Card, CardBody } from '@heroui/react'
import axios from 'axios'
import { useShipmentForm } from '../hooks/useShipmentForm'
import { useNotification } from '@context/NotificationContext'
// import { DEFAULT_FORM_VALUES } from '../constants/form-defaults'
import {
  BasicInformation,
  AddressSelector,
  PickupInformation,
  // InsuranceInformation,
  ParcelsSection,
  RatesSection
} from './form-sections'
import ShipmentPreviewModal from './ShipmentPreviewModal'
import ErrorModal from './ErrorModal'
import type { ShipmentFormData } from '../types/shipment-form.types'
import { Icon } from '@iconify/react/dist/iconify.js'

const ShipmentForm = () => {
  const { register, control, handleSubmit, setValue, errors, onSubmit, isSubmitting, today, getValues, trigger, watch, reset } = useShipmentForm()
  const { error: showError } = useNotification()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<ShipmentFormData | null>(null)
  const [isCalculatingRate, setIsCalculatingRate] = useState(false)
  const [calculatedRates, setCalculatedRates] = useState<any[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string>('')

  const handleRateSelection = (rateId: string) => {
    setSelectedRateId(rateId)
  }
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean
    title: string
    message?: string
    details?: Array<{ path: string; info: string }>
  }>({
    isOpen: false,
    title: '',
    message: '',
    details: []
  })

  const calculateRates = async (formData: ShipmentFormData) => {
    try {
      setIsCalculatingRate(true)

      // Transform form data to match the backend API format
      const shipment = {
        ship_from: {
          contact_name: formData.ship_from_contact_name,
          company_name: formData.ship_from_company_name,
          street1: formData.ship_from_street1,
          city: formData.ship_from_city,
          state: formData.ship_from_state,
          postal_code: formData.ship_from_postal_code,
          country: formData.ship_from_country,
          phone: formData.ship_from_phone,
          email: formData.ship_from_email
        },
        ship_to: {
          contact_name: formData.ship_to_contact_name,
          company_name: formData.ship_to_company_name,
          street1: formData.ship_to_street1,
          city: formData.ship_to_city,
          state: formData.ship_to_state,
          postal_code: formData.ship_to_postal_code,
          country: formData.ship_to_country,
          phone: formData.ship_to_phone,
          email: formData.ship_to_email
        },
        parcels: formData.parcels?.map(parcel => ({
          box_type: "custom",
          dimension: {
            width: parseFloat(String(parcel.width)) || 0,
            height: parseFloat(String(parcel.height)) || 0,
            depth: parseFloat(String(parcel.depth)) || 0,
            unit: parcel.dimension_unit
          },
          items: parcel.parcel_items?.map(item => ({
            description: item.description,
            quantity: parseInt(String(item.quantity)) || 1,
            price: {
              currency: item.price_currency,
              amount: parseFloat(String(item.price_amount)) || 0,
            },
            item_id: item.item_id,
            origin_country: item.origin_country,
            weight: {
              unit: item.weight_unit,
              value: parseFloat(String(item.weight_value)) || 0,
            },
            sku: item.sku,
            hs_code: item.hscode
          })),
          description: parcel.description,
          weight: {
            unit: parcel.weight_unit,
            value: parseFloat(String(parcel.weight_value)) || 0
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
      const apiRates = response.data?.data?.rates || []

      // Helper function to generate unique rate ID
      const getRateUniqueId = (rate: any, index: number) => {
        return `${rate.shipper_account.id}-${rate.service_type}-${index}`
      }

      // Transform API rates to match our interface
      const transformedRates = apiRates.map((rate: any, index: number) => ({
        shipper_account_id: rate.shipper_account.id,
        shipper_account_slug: rate.shipper_account.slug,
        shipper_account_description: rate.shipper_account.description,
        service_type: rate.service_type,
        service_name: rate.service_name,
        pickup_deadline: rate.pickup_deadline,
        booking_cut_off: rate.booking_cut_off,
        delivery_date: rate.delivery_date,
        transit_time: rate.transit_time?.toString() || '',
        error_message: rate.error_message || '',
        info_message: rate.info_message || '',
        charge_weight_value: rate.charge_weight?.value || 0,
        charge_weight_unit: rate.charge_weight?.unit || '',
        total_charge_amount: rate.total_charge?.amount || 0,
        total_charge_currency: rate.total_charge?.currency || '',
        unique_id: getRateUniqueId(rate, index), // Add unique ID for selection
        chosen: false,
        detailed_charges: JSON.stringify(rate.detailed_charges) || ''
      }))

      // Store rates in component state
      setCalculatedRates(apiRates) // Keep original for display

      // Store the rates in the form data
      const updatedFormData = {
        ...formData,
        rates: transformedRates
      }

      return updatedFormData
    } catch (error) {
      console.error('Error calculating rates:', error)

      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data

        // Handle API validation errors
        if (errorData.meta?.details && Array.isArray(errorData.meta.details)) {
          setErrorModal({
            isOpen: true,
            title: 'Rate Calculation Failed',
            message: errorData.meta?.message || 'The following validation errors need to be fixed:',
            details: errorData.meta.details.map((detail: any) => ({
              path: detail.path,
              info: detail.info
            }))
          })
        } else if (errorData.meta?.message) {
          setErrorModal({
            isOpen: true,
            title: 'Rate Calculation Failed',
            message: errorData.meta.message,
            details: []
          })
        } else {
          showError('Error calculating shipping rates. Please check your form data and try again.', 'Rate Calculation Error')
        }
      } else {
        showError('Error calculating shipping rates. Please check your internet connection and try again.', 'Connection Error')
      }
      return formData

    } finally {
      setIsCalculatingRate(false)
    }
  }

  const validateCalculateRatesData = (formData: ShipmentFormData): { isValid: boolean; errors: Array<{ path: string; info: string }> } => {
    const errors: Array<{ path: string; info: string }> = []

    // Validate address fields
    if (!formData.ship_from_company_name?.trim()) {
      errors.push({ path: 'data.shipment.ship_from.company_name', info: 'Ship from company name is required' })
    }
    if (!formData.ship_to_company_name?.trim()) {
      errors.push({ path: 'data.shipment.ship_to.company_name', info: 'Ship to company name is required' })
    }

    // Validate parcels
    if (!formData.parcels || formData.parcels.length === 0) {
      errors.push({ path: 'data.shipment.parcels', info: 'At least one parcel is required' })
    } else {
      formData.parcels.forEach((parcel, parcelIndex) => {
        // Validate parcel dimensions
        if (!parcel.width || parseFloat(String(parcel.width)) <= 0) {
          errors.push({
            path: `data.shipment.parcels.${parcelIndex}.dimension.width`,
            info: 'data.shipment.parcels.' + parcelIndex + '.dimension.width should be > 0'
          })
        }
        if (!parcel.height || parseFloat(String(parcel.height)) <= 0) {
          errors.push({
            path: `data.shipment.parcels.${parcelIndex}.dimension.height`,
            info: 'data.shipment.parcels.' + parcelIndex + '.dimension.height should be > 0'
          })
        }
        if (!parcel.depth || parseFloat(String(parcel.depth)) <= 0) {
          errors.push({
            path: `data.shipment.parcels.${parcelIndex}.dimension.depth`,
            info: 'data.shipment.parcels.' + parcelIndex + '.dimension.depth should be > 0'
          })
        }

        // Validate parcel has items
        if (!parcel.parcel_items || parcel.parcel_items.length === 0) {
          errors.push({
            path: `data.shipment.parcels.${parcelIndex}.items`,
            info: 'Each parcel must have at least one item'
          })
        } else {
          // Validate items
          parcel.parcel_items.forEach((item, itemIndex) => {
            if (!item.description?.trim()) {
              errors.push({
                path: `data.shipment.parcels.${parcelIndex}.items.${itemIndex}.description`,
                info: 'data.shipment.parcels.' + parcelIndex + '.items.' + itemIndex + '.description is a required property'
              })
            }
            if (!item.quantity || parseInt(String(item.quantity)) < 1) {
              errors.push({
                path: `data.shipment.parcels.${parcelIndex}.items.${itemIndex}.quantity`,
                info: 'Item quantity must be at least 1'
              })
            }
            if (!item.weight_value || parseFloat(String(item.weight_value)) <= 0) {
              errors.push({
                path: `data.shipment.parcels.${parcelIndex}.items.${itemIndex}.weight.value`,
                info: 'Item weight must be greater than 0'
              })
            }
            if (!item.price_amount || parseFloat(String(item.price_amount)) <= 0) {
              errors.push({
                path: `data.shipment.parcels.${parcelIndex}.items.${itemIndex}.price.amount`,
                info: 'Item price must be greater than 0'
              })
            }
          })
        }
      })
    }

    return { isValid: errors.length === 0, errors }
  }

  const validateWeights = (formData: ShipmentFormData): { isValid: boolean; errors: Array<{ path: string; info: string }> } => {
    const errors: Array<{ path: string; info: string }> = []

    formData.parcels?.forEach((parcel, parcelIndex) => {
      if (parcel.parcel_items && parcel.parcel_items.length > 0) {
        // Calculate total item weight
        const totalItemWeight = parcel.parcel_items.reduce((sum, item) => {
          const itemWeight = parseFloat(String(item.weight_value)) || 0
          const quantity = parseInt(String(item.quantity)) || 1
          return sum + (itemWeight * quantity)
        }, 0)

        const parcelWeight = parseFloat(String(parcel.weight_value)) || 0

        if (parcelWeight < totalItemWeight) {
          errors.push({
            path: `Parcel ${parcelIndex + 1} – Weight`, // `parcels.${parcelIndex}.weight_value`,
            info: `Parcel weight (${parcelWeight}kg) must be greater than or equal to the sum of item weights (${totalItemWeight.toFixed(2)}kg). Please increase the parcel weight or reduce item weights.`
          })
        }
      }

      // Check for invalid weights
      const parcelWeight = parseFloat(String(parcel.weight_value)) || 0
      if (parcelWeight <= 0) {
        errors.push({
          path: `Parcel ${parcelIndex + 1} – Weight`, // `parcels.${parcelIndex}.weight_value`,
          info: `Parcel weight must be greater than 0kg`
        })
      }

      // Check item weights
      parcel.parcel_items?.forEach((item, itemIndex) => {
        const itemWeight = parseFloat(String(item.weight_value)) || 0
        if (itemWeight <= 0) {
          errors.push({
            path: `Parcel ${parcelIndex + 1} – Item ${itemIndex + 1} Weight`, // `parcels.${parcelIndex}.items.${itemIndex}.weight_value`,
            info: `Item weight must be greater than 0kg`
          })
        }
      })
    })

    return { isValid: errors.length === 0, errors }
  }

  const handlePreview = async (data: ShipmentFormData) => {
    // Use the data from form submission instead of getValues()
    const formData = data

    // Validate weights first
    const weightValidation = validateWeights(formData)
    if (!weightValidation.isValid) {
      setErrorModal({
        isOpen: true,
        title: 'Weight Validation Failed',
        message: 'Please fix the weight issues below before proceeding.',
        details: weightValidation.errors
      })
      return
    }

    // Validate that a rate is selected if rates are available
    if (calculatedRates.length > 0 && !selectedRateId) {
      setErrorModal({
        isOpen: true,
        title: 'Selection Required',
        message: 'Please select a shipping rate before proceeding to preview.',
        details: []
      })
      return
    }

    // Only calculate rates if they haven't been calculated yet
    let formDataWithRates = formData
    if (calculatedRates.length === 0) {
      formDataWithRates = await calculateRates(formData)
    } else {
      // Helper function to generate unique rate ID (same as in calculateRates)
      const getRateUniqueId = (rate: any, index: number) => {
        const shipperAccountId = rate.shipper_account?.id || rate.shipper_account_id
        return `${shipperAccountId}-${rate.service_type}-${index}`
      }

      // Use existing rates data
      const transformedRates = calculatedRates.map((rate: any, index: number) => ({
        shipper_account_id: rate.shipper_account?.id || rate.shipper_account_id,
        shipper_account_slug: rate.shipper_account?.slug || rate.shipper_account_slug,
        shipper_account_description: rate.shipper_account?.description || rate.shipper_account_description,
        service_type: rate.service_type,
        service_name: rate.service_name,
        pickup_deadline: rate.pickup_deadline,
        booking_cut_off: rate.booking_cut_off,
        delivery_date: rate.delivery_date,
        transit_time: rate.transit_time?.toString() || '',
        error_message: rate.error_message || '',
        info_message: rate.info_message || '',
        charge_weight_value: rate.charge_weight?.value || rate.charge_weight_value || 0,
        charge_weight_unit: rate.charge_weight?.unit || rate.charge_weight_unit || '',
        total_charge_amount: rate.total_charge?.amount || rate.total_charge_amount || 0,
        total_charge_currency: rate.total_charge?.currency || rate.total_charge_currency || '',
        unique_id: getRateUniqueId(rate, index), // Add unique ID for selection
        chosen: false,
        detailed_charges: typeof rate.detailed_charges === 'string' ? rate.detailed_charges : JSON.stringify(rate.detailed_charges) || ''
      }))

      formDataWithRates = {
        ...formData,
        rates: transformedRates
      }
    }

    setPreviewData(formDataWithRates)
    setIsPreviewOpen(true)
  }

  const handleConfirmSubmit = () => {
    if (previewData) {
      // Mark selected rate as chosen using unique ID, ensure only one rate is chosen
      const updatedRates = previewData.rates?.map(rate => ({
        ...rate,
        chosen: rate.unique_id === selectedRateId ? true : false
      })) || []

      const finalData = {
        ...previewData,
        rates: updatedRates
      }

      setIsPreviewOpen(false)
      onSubmit(finalData)
    }
  }

  const handleClearForm = () => {
    // Clear calculated rates and selected rate first
    setCalculatedRates([])
    setSelectedRateId('')
    // Close any open modals
    setIsPreviewOpen(false)
    setErrorModal({
      isOpen: false,
      title: '',
      message: '',
      details: []
    })

    // Reset the form to default values
    reset()

    // Force trigger a re-render by updating watched fields that are used in controlled components
    // This ensures Select components with selectedKeys and controlled inputs update properly
    setTimeout(() => {
      trigger() // Trigger validation to ensure all form state is synchronized
    }, 0)

    // Log the form values after reset to debug
    setTimeout(() => {
      const values = getValues()
      console.log('Form values after reset:', values)
    }, 100)
  }

  const handleCalculateRate = async () => {
    const formData = getValues()

    // Validate form data before calculating rates
    const formValidation = validateCalculateRatesData(formData)
    if (!formValidation.isValid) {
      setErrorModal({
        isOpen: true,
        title: 'Rate Calculation Failed - Validation Errors',
        message: 'Please fix the following issues before calculating rates:',
        details: formValidation.errors
      })
      return
    }

    // Validate weights before calculating rates
    const weightValidation = validateWeights(formData)
    if (!weightValidation.isValid) {
      setErrorModal({
        isOpen: true,
        title: 'Weight Validation Failed',
        message: 'Please fix the weight issues below before calculating rates.',
        details: weightValidation.errors
      })
      return
    }

    const updatedFormData = await calculateRates(formData)

    if (updatedFormData.rates && updatedFormData.rates.length > 0) {

    } else {
      console.log("Rates calculated but no rates were returned.")
    }
  }

  return (
    <>
      <Card shadow="none" className="p-0 m-0 bg-transparent">
        <CardBody className="p-0">
          <form
            onSubmit={handleSubmit(handlePreview, () => {

            })}
            className="space-y-1"
          >
            <div className="py-1 px-4">
              <BasicInformation register={register} errors={errors} control={control} watch={watch} setValue={setValue} />
              <div className="pt-2 px-1">
                <hr />
              </div>              
            </div>
            <div className="py-1 px-4">
              <AddressSelector register={register} errors={errors} control={control} setValue={setValue} title="Ship From Address" prefix="ship_from" />
              <div className="pt-2 px-1">
                <hr />
              </div>
            </div>
            <div className="py-1 px-4">
              <AddressSelector register={register} errors={errors} control={control} setValue={setValue} title="Ship To Address" prefix="ship_to" />
              <div className="pt-2 px-1">
                <hr />
              </div>
            </div>
            <div className="py-1 px-4">
              <PickupInformation register={register} control={control} errors={errors} today={today} setValue={setValue} watch={watch} />
              <div className="pt-2 px-1">
                <hr />
              </div>
            </div>

            <div className="py-1 px-4">
              <ParcelsSection register={register} errors={errors} control={control} setValue={setValue} watch={watch} />
              <div className="pt-2 px-1">
                <hr />
              </div>
            </div>

            {/* <Divider className="my-6" /> */}
            <div className="py-1 px-4">
            <RatesSection
              rates={calculatedRates}
              onCalculateRates={handleCalculateRate}
              isCalculating={isCalculatingRate}
              selectedRateId={selectedRateId}
              onSelectRate={handleRateSelection}
              register={register}
              errors={errors}
            />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="bordered"
                type="button"
                onPress={handleClearForm}
              >
                Clear
              </Button>
              <Button
                color="primary"
                type="submit"
                startContent={<Icon icon="solar:eye-bold" />}
                onPress={() => {
                  console.log("Preview & Submit button clicked")
                  // Also log current form state for debugging
                  const currentValues = getValues()
                  console.log("Current form values:", currentValues)

                  // Manually trigger validation to see errors
                  trigger().then(isValid => {
                    console.log("Manual validation result:", isValid)
                    if (!isValid) {
                      console.log("Current form errors:", errors)
                    }
                  })
                }}
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
          selectedRateId={selectedRateId}
        />
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
      />
    </>
  )
}


export default ShipmentForm