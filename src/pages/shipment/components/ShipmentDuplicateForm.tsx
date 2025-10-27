import { useState } from 'react'
import { Button, Card, CardBody, Modal, ModalContent, ModalBody, Spinner } from '@heroui/react'
import { useShipmentDuplicateForm } from '../hooks/useShipmentDuplicateForm'
import { useShipmentRateCalculation } from '../hooks/useShipmentRateCalculation'
import { validateCalculateRatesData, validateWeights } from '../utils/shipment-validations'
import {
  BasicInformation,
  AddressSelector,
  PickupInformation,
  ParcelsSection,
  RatesSection
} from './form-sections'
import ShipmentPreviewModal from './ShipmentPreviewModal'
import ErrorModal from './ErrorModal'
import type { ShipmentFormData } from '../types/shipment-form.types'
import { Icon } from '@iconify/react/dist/iconify.js'

const ShipmentDuplicateForm = () => {
  const { register, control, handleSubmit, setValue, errors, onSubmit, isSubmitting, isLoading, today, getValues, watch, reset } = useShipmentDuplicateForm()

  // Watch for changes in critical fields that affect rates
  const watchedFields = watch([
    'ship_from_country', 'ship_from_postal_code', 'ship_from_city', 'ship_from_state', 'ship_from_street1', 'ship_from_company_name',
    'ship_to_country', 'ship_to_postal_code', 'ship_to_city', 'ship_to_state', 'ship_to_street1', 'ship_to_company_name',
    'parcels'
  ])

  // Use the shared rate calculation hook
  const {
    isCalculatingRate,
    calculatedRates,
    transformedRates,
    selectedRateId,
    rateCalculationError,
    calculateRates,
    handleRateSelection,
    handleClearRates,
    setRateCalculationSnapshot
  } = useShipmentRateCalculation({ watchedFields })

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<ShipmentFormData | null>(null)
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
  const [refreshCounter, setRefreshCounter] = useState(0)

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

    // Validate that rates have been calculated
    if (calculatedRates.length === 0) {
      setErrorModal({
        isOpen: true,
        title: 'Rate Calculation Required',
        message: 'Please calculate shipping rates before proceeding to preview.',
        details: [{ path: 'Rates', info: 'Click "Calculate Rates" button to get available shipping options' }]
      })
      return
    }

    // Validate that a rate is selected if rates are available
    if (calculatedRates.length > 0 && !selectedRateId) {
      setErrorModal({
        isOpen: true,
        title: 'Rate Selection Required',
        message: 'Please select a shipping rate before proceeding to preview.',
        details: [{ path: 'Rate Selection', info: 'Choose one of the calculated shipping rates from the rates section' }]
      })
      return
    }

    // Only calculate rates if they haven't been calculated yet
    let formDataWithRates = formData
    if (calculatedRates.length === 0) {
      formDataWithRates = await calculateRates(formData)
    } else {
      // Use already stored transformed rates to avoid recalculation
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

      // Convert weight values from scientific notation to decimal strings
      const normalizedParcels = previewData.parcels?.map(parcel => ({
        ...parcel,
        weight_value: Number(Number(parcel.weight_value).toFixed(5)),
        net_weight_value: Number(Number(parcel.net_weight_value || 0).toFixed(5)),
        parcel_weight_value: Number(Number(parcel.parcel_weight_value || 0).toFixed(5)),
        parcel_items: parcel.parcel_items?.map(item => ({
          ...item,
          weight_value: Number(Number(item.weight_value).toFixed(5)),
          price_amount: Number(Number(item.price_amount).toFixed(4))
        }))
      }))

      const finalData = {
        ...previewData,
        parcels: normalizedParcels,
        rates: updatedRates
      }

      setIsPreviewOpen(false)
      onSubmit(finalData)
    }
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
      // Store snapshot of form data when rates were calculated
      setRateCalculationSnapshot(watchedFields)
    } else {
      console.log("Rates calculated but no rates were returned.")
    }
  }

  const handleClearForm = () => {
    // Clear calculated rates and selected rate first
    handleClearRates()
    // Close any open modals
    setIsPreviewOpen(false)
    setErrorModal({
      isOpen: false,
      title: '',
      message: '',
      details: []
    })
    // Reset the form to initial values using react-hook-form's reset
    reset()
    setRefreshCounter(prev => prev + 1)
  }

  if (isLoading) {
    return (
      <Card shadow="none" className="p-5 m-0 bg-transparent">
        <CardBody className="flex justify-center items-center p-8">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading shipment data...</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card shadow="none" className="p-5 m-0 bg-transparent">
        <CardBody className="p-0">
          <form
            onSubmit={handleSubmit(handlePreview)}
            className="space-y-4"
          >
            {/* Form Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Duplicate Shipment Request</h2>
                <p className="text-sm text-gray-500">Create a new shipment based on an existing one</p>
              </div>
            </div>

            {/* Form Sections */}
            <BasicInformation
              register={register}
              errors={errors}
              control={control}
              watch={watch}
              setValue={setValue}
              onClearRates={handleClearRates}
            />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              <AddressSelector
                register={register}
                errors={errors}
                control={control}
                setValue={setValue}
                title="Ship From Address"
                prefix="ship_from"
                forceRefresh={refreshCounter}
                watch={watch}
                onClearRates={handleClearRates}
              />
              <div className="flex justify-center my-4 md:my-0">
                <Button
                  size="sm"
                  variant="bordered"
                  color="primary"
                  startContent={<Icon icon="solar:refresh-bold" />}
                  onPress={() => {
                    const currentValues = getValues();
                    const swappedValues = {
                      ...currentValues,
                      ship_from_company_name: currentValues.ship_to_company_name,
                      ship_from_contact_name: currentValues.ship_to_contact_name,
                      ship_from_phone: currentValues.ship_to_phone,
                      ship_from_email: currentValues.ship_to_email,
                      ship_from_country: currentValues.ship_to_country,
                      ship_from_city: currentValues.ship_to_city,
                      ship_from_state: currentValues.ship_to_state,
                      ship_from_postal_code: currentValues.ship_to_postal_code,
                      ship_from_street1: currentValues.ship_to_street1,
                      ship_from_street2: currentValues.ship_to_street2,
                      ship_from_tax_id: currentValues.ship_to_tax_id,
                      ship_from_eori_number: currentValues.ship_to_eori_number,
                      ship_to_company_name: currentValues.ship_from_company_name,
                      ship_to_contact_name: currentValues.ship_from_contact_name,
                      ship_to_phone: currentValues.ship_from_phone,
                      ship_to_email: currentValues.ship_from_email,
                      ship_to_country: currentValues.ship_from_country,
                      ship_to_city: currentValues.ship_from_city,
                      ship_to_state: currentValues.ship_from_state,
                      ship_to_postal_code: currentValues.ship_from_postal_code,
                      ship_to_street1: currentValues.ship_from_street1,
                      ship_to_street2: currentValues.ship_from_street2,
                      ship_to_tax_id: currentValues.ship_from_tax_id,
                      ship_to_eori_number: currentValues.ship_from_eori_number,
                    };
                    reset(swappedValues);
                    handleClearRates();
                    setRefreshCounter(prev => prev + 1);
                  }}
                >
                  Swap
                </Button>
              </div>
              <AddressSelector
                register={register}
                errors={errors}
                control={control}
                setValue={setValue}
                title="Ship To Address"
                prefix="ship_to"
                forceRefresh={refreshCounter}
                watch={watch}
                onClearRates={handleClearRates}
              />
            </div>

            <PickupInformation
              register={register}
              control={control}
              errors={errors}
              today={today}
              setValue={setValue}
              watch={watch}
              onClearRates={handleClearRates}
            />

            <ParcelsSection
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              watch={watch}
              onClearRates={handleClearRates}
            />

            <RatesSection
              rates={calculatedRates}
              onCalculateRates={handleCalculateRate}
              isCalculating={isCalculatingRate}
              selectedRateId={selectedRateId}
              onSelectRate={handleRateSelection}
              register={register}
              errors={errors}
              serviceOption={watch('service_options')}
              rateCalculationError={rateCalculationError}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="flat"
                color="default"
                onPress={handleClearForm}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                color="success"
                startContent={<Icon icon="solar:eye-bold" width={20} />}
                isDisabled={calculatedRates.length === 0 || !selectedRateId}
              >
                {calculatedRates.length === 0
                  ? 'Calculate Rates First'
                  : !selectedRateId
                    ? 'Select Rate First'
                    : 'Preview & Submit'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Preview Modal */}
      {previewData && (
        <ShipmentPreviewModal
          isOpen={isPreviewOpen}
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

      {/* Loading Modal */}
      <Modal
        isOpen={isSubmitting}
        hideCloseButton
        isDismissable={false}
        size="sm"
        backdrop="blur"
      >
        <ModalContent>
          <ModalBody className="flex flex-col items-center justify-center py-8 space-y-4">
            <Spinner
              size="lg"
              color="success"
              label="Submitting shipment..."
              labelColor="success"
            />
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-600">
                Please wait while we process your request...
              </p>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ShipmentDuplicateForm
