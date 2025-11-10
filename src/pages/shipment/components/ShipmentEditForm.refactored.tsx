import { Button, Card, CardBody, Modal, ModalContent, ModalBody, Spinner } from '@heroui/react'
import { useParams } from 'react-router-dom'
import { Icon } from '@iconify/react/dist/iconify.js'

// Hooks
import { useShipmentRateCalculation } from '../hooks/useShipmentRateCalculation'
import { useShipmentEditForm } from '../hooks/useShipmentEditForm'

// Handlers
import {
  handlePreview as createHandlePreview,
  handleConfirmSubmit as createHandleConfirmSubmit,
  handleCalculateRate as createHandleCalculateRate
} from '../handlers/shipmentEditHandlers'

// Components
import {
  BasicInformation,
  AddressSelector,
  PickupInformation,
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

// Constants
import { SHIPMENT_EDIT_STEPS, COMPLETED_STEPS } from '../constants/shipment-edit-steps'

const ShipmentEditForm = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>()
  const today = new Date().toISOString().split('T')[0]

  // Initialize rate calculation hook first to get watchedFields
  const {
    watchedFields,
    isCalculatingRate,
    calculatedRates,
    transformedRates,
    selectedRateId,
    rateCalculationError,
    calculateRates,
    handleRateSelection,
    handleClearRates,
    setRateCalculationSnapshot,
    rateCalculationSnapshot,
    setInitialLoadComplete
  } = useShipmentRateCalculation({
    watchedFields: [], // Will be set by watch() in the custom hook
    skipInitialClearOnEdit: true
  })

  // Use custom hook for form state management
  const {
    formMethods,
    isLoading,
    isSubmitting,
    setIsSubmitting,
    isPreviewOpen,
    setIsPreviewOpen,
    previewData,
    setPreviewData,
    refreshCounter,
    setRefreshCounter,
    currentStep,
    previouslyChosenRate,
    errorModal,
    setErrorModal,
    serviceOption,
    handleEditStep,
    handleDoneEditing,
    user,
    msLoginUser,
    navigate,
    success,
    showError
  } = useShipmentEditForm({
    shipmentId,
    watchedFields,
    setRateCalculationSnapshot,
    setInitialLoadComplete
  })

  const { register, control, handleSubmit, watch, setValue, getValues, reset, formState: { errors } } = formMethods

  // Create handler functions
  const handlePreview = async (data: any) => {
    await createHandlePreview({
      formData: data,
      today,
      rateCalculationSnapshot,
      watchedFields,
      calculatedRates,
      transformedRates,
      selectedRateId,
      previouslyChosenRate,
      setErrorModal,
      setPreviewData,
      setIsPreviewOpen
    })
  }

  const handleConfirmSubmit = async () => {
    await createHandleConfirmSubmit({
      previewData,
      shipmentId,
      msLoginUser,
      user,
      selectedRateId,
      previouslyChosenRate,
      setIsSubmitting,
      setIsPreviewOpen,
      success,
      showError
    })
  }

  const handleCalculateRate = async () => {
    await createHandleCalculateRate({
      getValues,
      calculateRates,
      watchedFields,
      setRateCalculationSnapshot,
      setErrorModal
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" label="Loading shipment data..." />
      </div>
    )
  }

  return (
    <>
      <Card shadow="none" className="p-0 m-0 bg-transparent">
        <CardBody className="p-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-0 p-2">
            <h1 className="text-2xl font-bold px-5">Edit Shipment Request ID - {shipmentId}</h1>
            <div className="flex gap-2">
              <Button
                className="bg-red-500 text-white hover:bg-red-700"
                variant="bordered"
                type="button"
                onPress={() => window.location.href = `/xeno-shipment/shipment/${shipmentId}`}
              >
                Cancel
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handlePreview)} className="space-y-4">
            <div className="space-y-3">
              {/* Step 0: Basic Information */}
              {currentStep === 0 ? (
                <Card className="border-2 border-primary shadow-lg m-1">
                  <CardBody className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon icon={SHIPMENT_EDIT_STEPS[0].icon} width={28} className="text-primary" />
                        <h2 className="text-xl font-bold text-primary">{SHIPMENT_EDIT_STEPS[0].name}</h2>
                      </div>
                      <p className="text-sm text-gray-500">Step 1 of {SHIPMENT_EDIT_STEPS.length}</p>
                    </div>
                    <div className="mb-6">
                      <BasicInformation
                        register={register}
                        errors={errors}
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        onClearRates={handleClearRates}
                      />
                    </div>
                    <div className="flex justify-left items-center border-t gap-2 pt-4">
                      <Button
                        color="primary"
                        type="button"
                        onPress={handleDoneEditing}
                        startContent={<Icon icon="solar:check-circle-bold" width={20} />}
                      >
                        Done
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : COMPLETED_STEPS.has(0) && (
                <BasicInfoSummary data={getValues()} onEdit={() => handleEditStep(0)} />
              )}

              {/* Step 1: Addresses */}
              {currentStep === 1 ? (
                <Card className="border-2 border-primary shadow-lg m-1">
                  <CardBody className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon icon={SHIPMENT_EDIT_STEPS[1].icon} width={28} className="text-primary" />
                        <h2 className="text-xl font-bold text-primary">{SHIPMENT_EDIT_STEPS[1].name}</h2>
                      </div>
                      <p className="text-sm text-gray-500">Step 2 of {SHIPMENT_EDIT_STEPS.length}</p>
                    </div>
                    <div className="mb-6">
                      <div className="space-y-4">
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
                      </div>
                    </div>
                    <div className="flex justify-left items-center border-t pt-4">
                      <Button
                        color="primary"
                        type="button"
                        onPress={handleDoneEditing}
                        startContent={<Icon icon="solar:check-circle-bold" width={20} />}
                      >
                        Done
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : COMPLETED_STEPS.has(1) && (
                <AddressesSummary data={getValues()} onEdit={() => handleEditStep(1)} />
              )}

              {/* Step 2: Pickup Information */}
              {currentStep === 2 ? (
                <Card className="border-2 border-primary shadow-lg m-1">
                  <CardBody className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon icon={SHIPMENT_EDIT_STEPS[2].icon} width={28} className="text-primary" />
                        <h2 className="text-xl font-bold text-primary">{SHIPMENT_EDIT_STEPS[2].name}</h2>
                      </div>
                      <p className="text-sm text-gray-500">Step 3 of {SHIPMENT_EDIT_STEPS.length}</p>
                    </div>
                    <div className="mb-6">
                      <PickupInformation
                        register={register}
                        control={control}
                        errors={errors}
                        today={today}
                        setValue={setValue}
                        watch={watch}
                        onClearRates={handleClearRates}
                      />
                    </div>
                    <div className="flex justify-left items-center border-t gap-2 pt-4">
                      <Button
                        color="primary"
                        type="button"
                        onPress={handleDoneEditing}
                        startContent={<Icon icon="solar:check-circle-bold" width={20} />}
                      >
                        Done
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : COMPLETED_STEPS.has(2) && (
                <PickupInfoSummary data={getValues()} onEdit={() => handleEditStep(2)} />
              )}

              {/* Step 3: Parcels & Items */}
              {currentStep === 3 ? (
                <Card className="border-2 border-primary shadow-lg m-1">
                  <CardBody className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon icon={SHIPMENT_EDIT_STEPS[3].icon} width={28} className="text-primary" />
                        <h2 className="text-xl font-bold text-primary">{SHIPMENT_EDIT_STEPS[3].name}</h2>
                      </div>
                      <p className="text-sm text-gray-500">Step 4 of {SHIPMENT_EDIT_STEPS.length}</p>
                    </div>
                    <div className="mb-6">
                      <ParcelsSection
                        register={register}
                        errors={errors}
                        control={control}
                        setValue={setValue}
                        watch={watch}
                        onClearRates={handleClearRates}
                      />
                    </div>
                    <div className="flex justify-left items-center border-t gap-2 pt-4">
                      <Button
                        color="primary"
                        type="button"
                        onPress={handleDoneEditing}
                        startContent={<Icon icon="solar:check-circle-bold" width={20} />}
                      >
                        Done
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : COMPLETED_STEPS.has(3) && (
                <div className="pb-1">
                  <ParcelsSummary data={getValues()} onEdit={() => handleEditStep(3)} />
                </div>
              )}

              {/* Step 4: Shipping Rates - Hidden for Supplier Pickup */}
              {serviceOption !== 'Supplier Pickup' && currentStep === 4 ? (
                <>
                  <Card className="border-2 border-primary shadow-lg m-1">
                    <CardBody className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon icon={SHIPMENT_EDIT_STEPS[4].icon} width={28} className="text-primary" />
                          <h2 className="text-xl font-bold text-primary">{SHIPMENT_EDIT_STEPS[4].name}</h2>
                        </div>
                        <p className="text-sm text-gray-500">Step 5 of {SHIPMENT_EDIT_STEPS.length} - Calculate shipping rates</p>
                      </div>
                      <div className="mb-4 p-4 bg-gray-50 rounded border">
                        <h3 className="font-semibold mb-2">
                          Previously Chosen Rate :
                          {(watch('service_options') === 'Grab' && watch('grab_rate_amount')) || previouslyChosenRate ?
                            <span className="text-green-600 font-semibold"> Found ✓</span> :
                            <span className="text-red-600 font-semibold"> Not Found ✗</span>
                          }
                        </h3>
                        {watch('service_options') === 'Grab' ? (
                          watch('grab_rate_amount') ? (
                            <div>
                              <p className="text-sm mb-1">
                                <strong>Grab</strong> (Manual Rate Entry)
                                <strong> | Amount:</strong> {parseFloat(watch('grab_rate_amount') || '0').toFixed(2)} {watch('grab_rate_currency') || 'THB'}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-red-600 mt-2">
                              No Grab rate found. Please enter the Grab delivery charge.
                            </p>
                          )
                        ) : previouslyChosenRate ? (
                          <div>
                            <p className="text-sm mb-1">
                              <strong>{previouslyChosenRate.vendor_name || 'Unknown'} - {previouslyChosenRate.service_name || 'Unknown Service'}</strong>
                              <strong> | Total:</strong> {parseFloat(previouslyChosenRate.total_charge || 0).toFixed(2)} {previouslyChosenRate.currency || 'THB'}
                              <strong> | Transit:</strong> {previouslyChosenRate.transit_time || 'N/A'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-red-600 mt-2">
                            No previous rate found. Please calculate new rates.
                          </p>
                        )}
                      </div>
                      <div className="mb-6">
                        <RatesSection
                          rates={calculatedRates}
                          onCalculateRates={handleCalculateRate}
                          isCalculating={isCalculatingRate}
                          selectedRateId={selectedRateId}
                          onSelectRate={handleRateSelection}
                          register={register}
                          control={control}
                          errors={errors}
                          serviceOption={watch('service_options')}
                          topic={watch('topic')}
                          rateCalculationError={rateCalculationError}
                          watch={watch}
                          setValue={setValue}
                        />
                      </div>
                      <div className="flex justify-left items-center border-t gap-2 pt-4">
                        <Button
                          color="primary"
                          type="button"
                          onPress={handleDoneEditing}
                          startContent={<Icon icon="solar:check-circle-bold" width={20} />}
                        >
                          Done
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </>
              ) :
                serviceOption !== 'Supplier Pickup' && COMPLETED_STEPS.has(3) && (selectedRateId || previouslyChosenRate) && (
                  <div className="pb-1">
                    <RatesSummary
                      data={getValues()}
                      selectedRateId={selectedRateId}
                      previouslyChosenRate={previouslyChosenRate}
                      transformedRates={transformedRates}
                      serviceType={watch('service_options')}
                      onEdit={() => handleEditStep(4)}
                    />
                  </div>
                )}
            </div>

            {/* Main Submit Button - Always visible */}
            <div className="mt-6 flex justify-center">
              <Button
                color="success"
                type="submit"
                size="lg"
                startContent={<Icon icon="solar:check-circle-bold" width={24} />}
                className="px-8 py-6 text-lg font-semibold"
              >
                Preview & Update Shipment
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {previewData && (
        <ShipmentPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onConfirm={handleConfirmSubmit}
          formData={previewData}
          isSubmitting={isSubmitting}
          selectedRateId={selectedRateId || previouslyChosenRate?.unique_id || ''}
        />
      )}

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
      />

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
              label="Updating shipment..."
              labelColor="success"
            />
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-600">
                Please wait while we process your update...
              </p>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ShipmentEditForm
