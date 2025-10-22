import React, { useState } from 'react'
import { Button, Card, CardBody, Modal, ModalContent, ModalBody, Spinner } from '@heroui/react'
import axios from 'axios'
import { useShipmentForm } from '../hooks/useShipmentForm'
import { useNotification } from '@context/NotificationContext'
import { calculateAndTransformRates, calculateShippingRates, type RateCalculationFormData } from '@services/rateCalculationService'
// import { DEFAULT_FORM_VALUES } from '../constants/form-defaults'
import {
  BasicInformation,
  AddressSelector,
  PickupInformation,
  // InsuranceInformation,
  ParcelsSection,
  RatesSection,
  BasicInfoSummary,
  AddressesSummary,
  PickupInfoSummary,
  ParcelsSummary,
  RatesSummary
} from './form-sections'
import ShipmentPreviewModal from './ShipmentPreviewModal'
import ErrorModal from './ErrorModal'
import type { ShipmentFormData } from '../types/shipment-form.types'
import { Icon } from '@iconify/react/dist/iconify.js'

const ShipmentFormVersionTwo = () => {
  const { register, control, handleSubmit, setValue, errors, onSubmit, isSubmitting, today, getValues, trigger, watch, reset } = useShipmentForm()
  const { error: showError } = useNotification()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<ShipmentFormData | null>(null)
  const [isCalculatingRate, setIsCalculatingRate] = useState(false)
  const [calculatedRates, setCalculatedRates] = useState<any[]>([])
  const [transformedRates, setTransformedRates] = useState<any[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string>('')

  // Step/Section Management
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const steps = [
    { id: 0, name: 'Basic Information', icon: 'solar:box-bold' },
    { id: 1, name: 'Addresses', icon: 'solar:map-point-bold' },
    { id: 2, name: 'Pickup Information', icon: 'solar:calendar-bold' },
    { id: 3, name: 'Parcels & Items', icon: 'solar:box-minimalistic-bold' },
    { id: 4, name: 'Shipping Rates', icon: 'solar:dollar-bold' }
  ]

  // Watch for changes in critical fields that affect rates
  const watchedFields = watch([
    'ship_from_country', 'ship_from_postal_code', 'ship_from_city', 'ship_from_state', 'ship_from_street1', 'ship_from_company_name',
    'ship_to_country', 'ship_to_postal_code', 'ship_to_city', 'ship_to_state', 'ship_to_street1', 'ship_to_company_name',
    'parcels'
  ])

  // Store the form data snapshot when rates were calculated
  const [rateCalculationSnapshot, setRateCalculationSnapshot] = React.useState<any>(null)
  const handleRateSelection = (rateId: string) => {
    setSelectedRateId(rateId)
  }

  // Effect to clear rates when critical form data changes
  React.useEffect(() => {
    if (rateCalculationSnapshot && calculatedRates.length > 0) {
      // Check if any critical field has changed since rates were calculated
      const hasChanged = JSON.stringify(watchedFields) !== JSON.stringify(rateCalculationSnapshot)

      if (hasChanged) {
        console.log('Critical form data changed, clearing rates...')
        console.log('Previous:', rateCalculationSnapshot)
        console.log('Current:', watchedFields)
        handleClearRates()
      }
    }
  }, [watchedFields, rateCalculationSnapshot, calculatedRates.length])
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

  const calculateRates = async (formData: ShipmentFormData) => {
    try {
      setIsCalculatingRate(true)

      // Convert ShipmentFormData to RateCalculationFormData
      const serviceFormData: RateCalculationFormData = {
        ship_from_contact_name: formData.ship_from_contact_name,
        ship_from_company_name: formData.ship_from_company_name,
        ship_from_street1: formData.ship_from_street1,
        ship_from_city: formData.ship_from_city,
        ship_from_state: formData.ship_from_state,
        ship_from_postal_code: formData.ship_from_postal_code,
        ship_from_country: formData.ship_from_country,
        ship_from_phone: formData.ship_from_phone,
        ship_from_email: formData.ship_from_email,
        ship_to_contact_name: formData.ship_to_contact_name,
        ship_to_company_name: formData.ship_to_company_name,
        ship_to_street1: formData.ship_to_street1,
        ship_to_city: formData.ship_to_city,
        ship_to_state: formData.ship_to_state,
        ship_to_postal_code: formData.ship_to_postal_code,
        ship_to_country: formData.ship_to_country,
        ship_to_phone: formData.ship_to_phone,
        ship_to_email: formData.ship_to_email,
        parcels: formData.parcels,
        pick_up_date: formData.pick_up_date,
        expected_delivery_date: formData.due_date,
        customs_terms_of_trade: formData.customs_terms_of_trade
      }

      // Use the shared rate calculation service to get both original and transformed rates
      const originalRates = await calculateShippingRates(serviceFormData)
      const transformedRates = await calculateAndTransformRates(serviceFormData)

      // Store original rates in component state for display
      console.log('Setting calculated rates:', originalRates)
      setCalculatedRates(originalRates) // Keep original for RatesSection display
      setTransformedRates(transformedRates) // Store transformed rates to avoid recalculation

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

  const handleClearRates = () => {
    setCalculatedRates([])
    setTransformedRates([])
    setSelectedRateId('')
    setRateCalculationSnapshot(null)
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

  // Step Navigation Handlers
  const handleNextStep = async () => {
    const isValid = await trigger()
    if (isValid) {
      setCompletedSteps(prev => new Set(prev).add(currentStep))
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleEditStep = (stepId: number) => {
    setCurrentStep(stepId)
  }

  return (
    <>
      <Card shadow="none" className="p-5 m-0 bg-transparent">
        <CardBody className="p-0">
          <form
            onSubmit={handleSubmit(handlePreview, () => { })}
            className="space-y-4"
          >
            {/* Completed Sections Summary */}
            <div className="space-y-3">
              {currentStep > 0 && completedSteps.has(0) && (
                <BasicInfoSummary data={getValues()} onEdit={() => handleEditStep(0)} />
              )}
              {currentStep > 1 && completedSteps.has(1) && (
                <AddressesSummary data={getValues()} onEdit={() => handleEditStep(1)} />
              )}
              {currentStep > 2 && completedSteps.has(2) && (
                <PickupInfoSummary data={getValues()} onEdit={() => handleEditStep(2)} />
              )}
              {currentStep > 3 && completedSteps.has(3) && (
                <ParcelsSummary data={getValues()} onEdit={() => handleEditStep(3)} />
              )}
              {currentStep > 4 && completedSteps.has(4) && selectedRateId && (
                <RatesSummary data={getValues()} selectedRateId={selectedRateId} onEdit={() => handleEditStep(4)} />
              )}
            </div>

            {/* Current Active Section */}
            <Card className="border-2 border-primary shadow-lg">
              <CardBody className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon icon={steps[currentStep].icon} width={28} className="text-primary" />
                    <h2 className="text-xl font-bold text-primary">{steps[currentStep].name}</h2>
                  </div>
                  {/* Step - of - */}
                  <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
                </div>

                {/* Section Content */}
                <div className="mb-6">
                  {currentStep === 0 && (
                    <BasicInformation
                      register={register}
                      errors={errors}
                      control={control}
                      watch={watch}
                      setValue={setValue}
                      onClearRates={handleClearRates}
                    />
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-4">
                      {/* Grid layout with swap button centered on desktop */}
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                        {/* Ship From */}
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

                        {/* Swap Button */}
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
                              setCalculatedRates([]);
                              setTransformedRates([]);
                              setSelectedRateId('');
                              setRefreshCounter(prev => prev + 1);
                            }}
                          >
                            Swap
                          </Button>
                        </div>

                        {/* Ship To */}
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
                    </div>
                  )}


                  {currentStep === 2 && (
                    <PickupInformation
                      register={register}
                      control={control}
                      errors={errors}
                      today={today}
                      setValue={setValue}
                      watch={watch}
                      onClearRates={handleClearRates}
                    />
                  )}

                  {currentStep === 3 && (
                    <ParcelsSection
                      register={register}
                      errors={errors}
                      control={control}
                      setValue={setValue}
                      watch={watch}
                      onClearRates={handleClearRates}
                    />
                  )}

                  {currentStep === 4 && (
                    <RatesSection
                      rates={calculatedRates}
                      onCalculateRates={handleCalculateRate}
                      isCalculating={isCalculatingRate}
                      selectedRateId={selectedRateId}
                      onSelectRate={handleRateSelection}
                      register={register}
                      errors={errors}
                      serviceOption={watch('service_options')}
                    />
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex gap-2">
                    <Button
                      variant="bordered"
                      onPress={handlePreviousStep}
                      isDisabled={currentStep === 0}
                      startContent={<Icon icon="solar:arrow-left-linear" width={20} />}
                    >
                      Previous
                    </Button>
                  </div>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      color="primary"
                      onPress={handleNextStep}
                      endContent={<Icon icon="solar:arrow-right-linear" width={20} />}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      color="success"
                      type="submit"
                      startContent={<Icon icon="solar:eye-bold" width={20} />}
                      isDisabled={calculatedRates.length === 0 || !selectedRateId}
                    >
                      {calculatedRates.length === 0
                        ? 'Calculate Rates First'
                        : !selectedRateId
                          ? 'Select Rate First'
                          : 'Preview & Submit'}
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
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


export default ShipmentFormVersionTwo