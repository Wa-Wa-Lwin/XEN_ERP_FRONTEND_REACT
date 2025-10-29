import { useState, useEffect } from 'react'
import { Button, Card, CardBody, Modal, ModalContent, ModalBody, Spinner } from '@heroui/react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@context/AuthContext'
import { useNotification } from '@context/NotificationContext'
import { useShipmentRateCalculation } from '../hooks/useShipmentRateCalculation'
import { validateCalculateRatesData, validateWeights, validateShipmentScope } from '../utils/shipment-validations'
import { DEFAULT_FORM_VALUES } from '../constants/form-defaults'
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
import type { ShipmentFormData } from '../types/shipment-form.types'
import { Icon } from '@iconify/react/dist/iconify.js'

const ShipmentEditForm = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>()
  const navigate = useNavigate()
  const { user, msLoginUser } = useAuth()
  const { success, error: showError } = useNotification()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<ShipmentFormData | null>(null)
  const [refreshCounter, setRefreshCounter] = useState(0)

  const formMethods = useForm<ShipmentFormData>({
    defaultValues: DEFAULT_FORM_VALUES
  })

  const { register, control, handleSubmit, watch, setValue, getValues, reset, trigger, formState: { errors } } = formMethods

  // Watch for changes in critical fields that affect rates
  const watchedFields = watch([
    'ship_from_country', 'ship_from_postal_code', 'ship_from_city', 'ship_from_state', 'ship_from_street1', 'ship_from_company_name',
    'ship_to_country', 'ship_to_postal_code', 'ship_to_city', 'ship_to_state', 'ship_to_street1', 'ship_to_company_name',
    'parcels'
  ])

  // Use the shared rate calculation hook (with skipInitialClearOnEdit enabled)
  const {
    isCalculatingRate,
    calculatedRates,
    transformedRates,
    selectedRateId,
    rateCalculationError,
    calculateRates,
    handleRateSelection,
    handleClearRates,
    setRateCalculationSnapshot,
    setInitialLoadComplete
  } = useShipmentRateCalculation({ watchedFields, skipInitialClearOnEdit: true })

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

  // Step/Section Management - Start at last step in edit mode
  const [currentStep, setCurrentStep] = useState<number>(4)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([0, 1, 2, 3]))
  const [previouslyChosenRate, setPreviouslyChosenRate] = useState<any>(null)

  const steps = [
    { id: 0, name: 'Basic Information', icon: 'solar:box-bold' },
    { id: 1, name: 'Addresses', icon: 'solar:map-point-bold' },
    { id: 2, name: 'Pickup Information', icon: 'solar:calendar-bold' },
    { id: 3, name: 'Parcels & Items', icon: 'solar:box-minimalistic-bold' },
    { id: 4, name: 'Shipping Rates', icon: 'solar:dollar-bold' }
  ]

  const today = new Date().toISOString().split('T')[0]

  // Load existing shipment data
  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setIsLoading(true)

        if (!shipmentId) {
          throw new Error('Invalid shipment ID')
        }

        const baseUrl = import.meta.env.VITE_APP_GET_SHIPMENT_REQUEST_BY_ID
        if (!baseUrl) {
          throw new Error('API URL not configured')
        }

        const apiUrl = `${baseUrl}${shipmentId}`
        const response = await axios.get(apiUrl)
        const shipmentData = response.data.shipment_request

        // Transform shipment data to form format
        const formData: ShipmentFormData = {
          shipmentRequestID: shipmentData.shipmentRequestID,
          shipment_scope_type: shipmentData.shipment_scope_type || '',

          // Basic shipment info
          service_options: shipmentData.service_options || '',
          urgent_reason: shipmentData.urgent_reason || '',
          request_status: shipmentData.request_status || '',
          remark: shipmentData.remark || '',
          topic: shipmentData.topic || '',
          po_number: shipmentData.po_number || '',
          other_topic: shipmentData.other_topic || '',
          due_date: shipmentData.due_date || '',
          sales_person: shipmentData.sales_person || '',
          po_date: shipmentData.po_date || '',
          send_to: shipmentData.send_to || '',

          // Ship From Address
          ship_from_contact_name: shipmentData.ship_from_contact_name || shipmentData.ship_from?.contact_name || '',
          ship_from_company_name: shipmentData.ship_from_company_name || shipmentData.ship_from?.company_name || '',
          ship_from_street1: shipmentData.ship_from_street1 || shipmentData.ship_from?.street1 || '',
          ship_from_street2: shipmentData.ship_from_street2 || shipmentData.ship_from?.street2 || '',
          ship_from_street3: shipmentData.ship_from_street3 || shipmentData.ship_from?.street3 || '',
          ship_from_city: shipmentData.ship_from_city || shipmentData.ship_from?.city || '',
          ship_from_state: shipmentData.ship_from_state || shipmentData.ship_from?.state || '',
          ship_from_postal_code: shipmentData.ship_from_postal_code || shipmentData.ship_from?.postal_code || '',
          ship_from_country: shipmentData.ship_from_country || shipmentData.ship_from?.country || '',
          ship_from_phone: shipmentData.ship_from_phone || shipmentData.ship_from?.phone || '',
          ship_from_email: shipmentData.ship_from_email || shipmentData.ship_from?.email || '',
          ship_from_tax_id: shipmentData.ship_from_tax_id || shipmentData.ship_from?.tax_id || '',
          ship_from_eori_number: shipmentData.ship_from_eori_number || shipmentData.ship_from?.eori_number || '',

          // Ship To Address
          ship_to_contact_name: shipmentData.ship_to_contact_name || shipmentData.ship_to?.contact_name || '',
          ship_to_company_name: shipmentData.ship_to_company_name || shipmentData.ship_to?.company_name || '',
          ship_to_street1: shipmentData.ship_to_street1 || shipmentData.ship_to?.street1 || '',
          ship_to_street2: shipmentData.ship_to_street2 || shipmentData.ship_to?.street2 || '',
          ship_to_street3: shipmentData.ship_to_street3 || shipmentData.ship_to?.street3 || '',
          ship_to_city: shipmentData.ship_to_city || shipmentData.ship_to?.city || '',
          ship_to_state: shipmentData.ship_to_state || shipmentData.ship_to?.state || '',
          ship_to_postal_code: shipmentData.ship_to_postal_code || shipmentData.ship_to?.postal_code || '',
          ship_to_country: shipmentData.ship_to_country || shipmentData.ship_to?.country || '',
          ship_to_phone: shipmentData.ship_to_phone || shipmentData.ship_to?.phone || '',
          ship_to_email: shipmentData.ship_to_email || shipmentData.ship_to?.email || '',
          ship_to_tax_id: shipmentData.ship_to_tax_id || shipmentData.ship_to?.tax_id || '',
          ship_to_eori_number: shipmentData.ship_to_eori_number || shipmentData.ship_to?.eori_number || '',

          // Parcels data
          parcels: shipmentData.parcels?.map((parcel: any) => ({
            box_type_name: parcel.box_type_name || '',
            width: parseFloat(String(parcel.width)) || 0,
            height: parseFloat(String(parcel.height)) || 0,
            depth: parseFloat(String(parcel.depth)) || 0,
            dimension_unit: parcel.dimension_unit || 'cm',
            weight_value: parseFloat(String(parcel.weight_value)) || 0,
            net_weight_value: parseFloat(String(parcel.net_weight_value)) || 0,
            parcel_weight_value: parseFloat(String(parcel.parcel_weight_value)) || 0,
            weight_unit: parcel.weight_unit || 'kg',
            description: parcel.description || '',
            parcel_items: parcel.items?.map((item: any) => ({
              description: item.description || '',
              quantity: parseInt(String(item.quantity)) || 1,
              price_amount: parseFloat(String(item.price_amount)) || 0,
              price_currency: item.price_currency || 'THB',
              weight_value: parseFloat(String(item.weight_value)) || 0,
              weight_unit: item.weight_unit || 'kg',
              origin_country: item.origin_country || '',
              sku: item.sku || '',
              material_code: item.material_code || '',
              hs_code: item.hs_code || '',
              item_id: item.item_id || '',
              return_reason: item.return_reason || ''
            })) || []
          })) || [],

          // Pickup info
          pick_up_status: shipmentData.pick_up_status || true,
          pick_up_date: shipmentData.pick_up_date || '',
          pick_up_start_time: shipmentData.pick_up_start_time || '',
          pick_up_end_time: shipmentData.pick_up_end_time || '',
          pick_up_instructions: shipmentData.pick_up_instructions || '',

          // Insurance
          insurance_enabled: shipmentData.insurance_enabled || false,
          insurance_insured_value_amount: shipmentData.insurance_insured_value_amount || 0,
          insurance_insured_value_currency: shipmentData.insurance_insured_value_currency || 'THB',

          // Customs
          customs_purpose: shipmentData.customs_purpose || '',
          customs_terms_of_trade: shipmentData.customs_terms_of_trade || '',
          payment_terms: shipmentData.payment_terms || '',

          // Rates
          rates: shipmentData.rates?.map((rate: any) => ({
            shipper_account_id: rate.shipper_account_id || '',
            shipper_account_slug: rate.shipper_account_slug || '',
            shipper_account_description: rate.shipper_account_description || '',
            service_type: rate.service_type || '',
            service_name: rate.service_name || '',
            pickup_deadline: rate.pickup_deadline || '',
            booking_cut_off: rate.booking_cut_off || '',
            delivery_date: rate.delivery_date || '',
            transit_time: rate.transit_time || '',
            error_message: rate.error_message || '',
            info_message: rate.info_message || '',
            charge_weight_value: parseFloat(String(rate.charge_weight_value)) || 0,
            charge_weight_unit: rate.charge_weight_unit || '',
            total_charge_amount: parseFloat(String(rate.total_charge_amount)) || 0,
            total_charge_currency: rate.total_charge_currency || '',
            unique_id: rate.unique_id || `${rate.shipper_account_id}-${rate.service_type}`,
            chosen: String(rate.chosen).trim() === "1" || Number(rate.chosen) === 1 || rate.chosen === true,
            past_chosen: String(rate.past_chosen).trim() === "1" || Number(rate.past_chosen) === 1 || rate.past_chosen === true,
            detailed_charges: rate.detailed_charges || ''
          })) || [],

          // User info
          created_user_id: shipmentData.created_user_id || '',
          created_user_name: shipmentData.created_user_name || '',
          created_user_mail: shipmentData.created_user_mail || '',
          created_date_time: shipmentData.created_date_time || '',

          approver_user_id: shipmentData.approver_user_id || null,
          approver_user_name: shipmentData.approver_user_name || '',
          approver_user_mail: shipmentData.approver_user_mail || null,
          approver_approved_date_time: shipmentData.approver_approved_date_time || null,
          approver_rejected_date_time: shipmentData.approver_rejected_date_time || null,

          label_status: shipmentData.label_status || null,
          pick_up_created_status: shipmentData.pick_up_created_status || null
        }

        reset(formData)

        // Store the previously chosen rate for display only
        console.log('Raw API rates:', shipmentData.rates)
        console.log('Transformed rates:', formData.rates)
        console.log('Rates with chosen status:', formData.rates?.map(r => ({
          service: r.service_name,
          chosen: r.chosen,
          unique_id: r.unique_id
        })))

        const chosenRate = formData.rates?.find(rate => rate.chosen)
        console.log('Found chosen rate:', chosenRate)

        if (chosenRate) {
          setPreviouslyChosenRate(chosenRate)
          console.log('Set previouslyChosenRate:', chosenRate)
        } else {
          console.warn('No chosen rate found in shipment data')
          console.warn('All rates chosen values:', formData.rates?.map(r => r.chosen))
        }

        // Don't clear rates in edit mode - we want to show the previously selected rate
        setInitialLoadComplete()
      } catch (error) {
        console.error('Error fetching shipment:', error)
        showError('Failed to load shipment data', 'Loading Error')
        navigate('/shipment')
      } finally {
        setIsLoading(false)
      }
    }

    fetchShipment()
  }, [shipmentId])

  const handlePreview = async (data: ShipmentFormData) => {
    const formData = data

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

    // Check if user has recalculated rates and selected a new one
    if (calculatedRates.length > 0) {
      // User recalculated rates - validate they selected one
      if (!selectedRateId) {
        setErrorModal({
          isOpen: true,
          title: 'Rate Selection Required',
          message: 'Please select a shipping rate before proceeding to preview.',
          details: [{ path: 'Rate Selection', info: 'Choose one of the calculated shipping rates from the rates section' }]
        })
        return
      }

      // Use the newly calculated and selected rate
      const formDataWithRates = {
        ...formData,
        rates: transformedRates
      }
      setPreviewData(formDataWithRates)
      setIsPreviewOpen(true)
    } else {
      // No new rates calculated - use the previously chosen rate
      if (!previouslyChosenRate) {
        setErrorModal({
          isOpen: true,
          title: 'Rate Not Found',
          message: 'No rate available for this shipment. Please calculate rates or contact support.',
          details: [{ path: 'Rate', info: 'Cannot update shipment without a rate' }]
        })
        return
      }

      // Attach the previously chosen rate to the form data
      const formDataWithRates = {
        ...formData,
        rates: [previouslyChosenRate]
      }
      setPreviewData(formDataWithRates)
      setIsPreviewOpen(true)
    }
  }

  const handleConfirmSubmit = async () => {
    if (!previewData || !msLoginUser) {
      showError('Missing required data', 'Submission Error')
      return
    }

    setIsSubmitting(true)
    try {
      const formatTimeForAPI = (timeString: string) => {
        if (!timeString) return ''
        const time = timeString.trim()
        let cleanTime = time

        if (time.includes(':')) {
          const parts = time.split(':')
          if (parts.length >= 2) {
            const hours = parts[0].padStart(2, '0')
            const minutes = parts[1].padStart(2, '0')
            cleanTime = `${hours}:${minutes}`
          }
        }

        if (cleanTime.match(/^\d{2}:\d{2}$/)) {
          return cleanTime
        }

        return ''
      }

      // Determine send_status based on current request_status
      let sendStatus: string = ""
        
      if(msLoginUser.email === previewData.approver_user_mail?.toLowerCase()) {
        sendStatus = 'approver_edited'
      } else if(user?.logisticRole === "1" ) {
        sendStatus = 'logistic_edited'
      } else {
        sendStatus = 'logistic_edited' // 'fallback_error'
      }

      // Determine which rate ID to mark as chosen
      const chosenRateId = selectedRateId || previouslyChosenRate?.unique_id

      const updatedRates = previewData.rates?.map(rate => ({
        ...rate,
        // Ensure transit_time is a string
        transit_time: String(rate.transit_time || ''),
        // Truncate detailed_charges to 255 characters
        detailed_charges: rate.detailed_charges ? String(rate.detailed_charges).substring(0, 255) : '',
        // Mark the selected rate as chosen (either newly selected or previously chosen)
        chosen: rate.unique_id === chosenRateId ? true : false
      })) || []

      // Convert weight values from scientific notation to decimal strings
      const normalizedParcels = previewData.parcels?.map(parcel => ({
        ...parcel,
        weight_value: Number(parcel.weight_value).toFixed(5),
        net_weight_value: Number(parcel.net_weight_value || 0).toFixed(5),
        parcel_weight_value: Number(parcel.parcel_weight_value || 0).toFixed(5),
        parcel_items: parcel.parcel_items?.map(item => ({
          ...item,
          weight_value: Number(item.weight_value).toFixed(5),
          price_amount: Number(item.price_amount).toFixed(4)
        }))
      }))

      const finalData = {
        ...previewData,
        parcels: normalizedParcels,
        send_status: sendStatus,
        login_user_id: user?.userID || 0,
        login_user_name: msLoginUser.name,
        login_user_mail: msLoginUser.email,
        rates: updatedRates,
        pick_up_start_time: formatTimeForAPI(previewData.pick_up_start_time || ''),
        pick_up_end_time: formatTimeForAPI(previewData.pick_up_end_time || ''),
      }

      const editUrl = import.meta.env.VITE_APP_ANYONE_EDIT_REQUEST
      if (!editUrl) {
        throw new Error('Edit API URL not configured')
      }

      const apiUrl = `${editUrl}${shipmentId}`

      const response = await axios.put(apiUrl, finalData, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.status === 200) {
        success('Shipment request updated successfully!', 'Success')
        setIsPreviewOpen(false)
        setTimeout(() => {
          navigate(`/shipment/${shipmentId}`)
        }, 100)
      }
    } catch (error) {
      console.error('Error updating shipment:', error)

      // Check for response data (handles both AxiosError and custom errors with response attached)
      const errorResponse = (error as any).response?.data

      if (errorResponse) {
        if (errorResponse.meta?.details && Array.isArray(errorResponse.meta.details)) {
          const errorMessages = errorResponse.meta.details.map((detail: any) =>
            `${detail.path}: ${detail.info}`
          ).join('\n')

          showError(`Update failed with validation errors:\n\n${errorMessages}`, 'Validation Error')
        } else if (errorResponse.meta?.message) {
          showError(`Update failed: ${errorResponse.meta.message}`, 'Update Failed')
        } else {
          showError('Error updating shipment request. Please check your form data and try again.', 'Update Error')
        }
      } else if (axios.isAxiosError(error)) {
        // Handle network errors without response data
        showError('Error updating shipment request. Please check your internet connection and try again.', 'Connection Error')
      } else {
        // Handle other unexpected errors
        showError(error instanceof Error ? error.message : 'An unexpected error occurred while updating the shipment.', 'Update Error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCalculateRate = async () => {
    const formData = getValues()

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
      setRateCalculationSnapshot(watchedFields)
    }
  }

  // Helper function to get the highest completed step
  const getHighestCompletedStep = (): { stepNumber: number; stepName: string } | null => {
    if (completedSteps.size === 0) return null
    const maxStep = Math.max(...Array.from(completedSteps))+1
    return {
      stepNumber: maxStep,
      stepName: steps[maxStep]?.name || ''
    }
  }

  // Step Navigation Handlers
  const handleNextStep = async () => {
    const isValid = await trigger()
    if (isValid) {
      // Additional validation: Check shipment scope when leaving step 1 (Addresses)
      if (currentStep === 1) {
        const formData = getValues()
        const scopeValidation = validateShipmentScope(formData)

        if (!scopeValidation.isValid && scopeValidation.error) {
          setErrorModal({
            isOpen: true,
            title: scopeValidation.error.title,
            message: scopeValidation.error.message,
            details: scopeValidation.error.details
          })
          return
        }
      }

      setCompletedSteps(prev => new Set(prev).add(currentStep))

      // If we're editing a previous step, return to the highest completed step
      // Otherwise, proceed to the next sequential step
      const highestCompleted = getHighestCompletedStep()
      if (highestCompleted && currentStep < highestCompleted.stepNumber) {
        setCurrentStep(highestCompleted.stepNumber)
      } else {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
      }
    }
  }

  const handlePreviousStep = () => {
    // If we're editing a previous step, return to the highest completed step
    // Otherwise, go to the previous sequential step
    const highestCompleted = getHighestCompletedStep()
    if (highestCompleted && currentStep < highestCompleted.stepNumber) {
      setCurrentStep(highestCompleted.stepNumber)
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 0))
    }
  }

  const handleEditStep = (stepId: number) => {
    // Navigate to the step to edit
    setCurrentStep(stepId)
  }

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
          <div className="flex justify-left items-center mb-4 gap-6 p-2">
            <Button
              color="warning"
              variant="bordered"
              onPress={() => navigate(`/shipment/${shipmentId}`)}
            >
              Back
            </Button>
            <h1 className="text-2xl font-bold px-5">Edit Shipment Request ID - {shipmentId}</h1>
          </div>

          <form
            onSubmit={handleSubmit(handlePreview)}
            className="space-y-4"
          >
            {/* All Sections with Active Section Inline */}
            <div className="space-y-3">
              {/* Step 0: Basic Information */}
              {currentStep === 0 ? (
                <Card className="border-2 border-primary shadow-lg m-1">
                  <CardBody className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon icon={steps[0].icon} width={28} className="text-primary" />
                        <h2 className="text-xl font-bold text-primary">{steps[0].name}</h2>
                      </div>
                      <p className="text-sm text-gray-500">Step 1 of {steps.length}</p>
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
                      <Button
                        color="primary"
                        onPress={handleNextStep}
                        endContent={<Icon icon="solar:arrow-right-linear" width={20} />}
                      >
                        {(() => {
                          const highestCompleted = getHighestCompletedStep()
                          return highestCompleted && currentStep < highestCompleted.stepNumber
                            ? `Return to ${highestCompleted.stepName}`
                            : 'Next Step'
                        })()}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : completedSteps.has(0) && (
                <BasicInfoSummary data={getValues()} onEdit={() => handleEditStep(0)} />
              )}

              {/* Step 1: Addresses */}
              {currentStep === 1 ? (
                <Card className="border-2 border-primary shadow-lg m-1">
                  <CardBody className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon icon={steps[1].icon} width={28} className="text-primary" />
                        <h2 className="text-xl font-bold text-primary">{steps[1].name}</h2>
                      </div>
                      <p className="text-sm text-gray-500">Step 2 of {steps.length}</p>
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
                    <div className="flex justify-between items-center border-t pt-4">
                      <div className="flex gap-2">
                        <Button
                          variant="bordered"
                          onPress={handlePreviousStep}
                          startContent={<Icon icon="solar:arrow-left-linear" width={20} />}
                        >
                          Previous
                        </Button>
                      </div>
                      <Button
                        color="primary"
                        onPress={handleNextStep}
                        endContent={<Icon icon="solar:arrow-right-linear" width={20} />}
                      >
                        {(() => {
                          const highestCompleted = getHighestCompletedStep()
                          return highestCompleted && currentStep < highestCompleted.stepNumber
                            ? `Return to ${highestCompleted.stepName}`
                            : 'Next Step'
                        })()}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : completedSteps.has(1) && (
                <AddressesSummary data={getValues()} onEdit={() => handleEditStep(1)} />
              )}

              {/* Step 2: Pickup Information */}
              {currentStep === 2 ? (
                <Card className="border-2 border-primary shadow-lg m-1">
                  <CardBody className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon icon={steps[2].icon} width={28} className="text-primary" />
                        <h2 className="text-xl font-bold text-primary">{steps[2].name}</h2>
                      </div>
                      <p className="text-sm text-gray-500">Step 3 of {steps.length}</p>
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
                      <div className="flex gap-2">
                        <Button
                          variant="bordered"
                          onPress={handlePreviousStep}
                          startContent={<Icon icon="solar:arrow-left-linear" width={20} />}
                        >
                          Previous
                        </Button>
                      </div>
                      <Button
                        color="primary"
                        onPress={handleNextStep}
                        endContent={<Icon icon="solar:arrow-right-linear" width={20} />}
                      >
                        {(() => {
                          const highestCompleted = getHighestCompletedStep()
                          return highestCompleted && currentStep < highestCompleted.stepNumber
                            ? `Return to ${highestCompleted.stepName}`
                            : 'Next Step'
                        })()}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : completedSteps.has(2) && (
                <PickupInfoSummary data={getValues()} onEdit={() => handleEditStep(2)} />
              )}

              {/* Step 3: Parcels & Items */}
              {currentStep === 3 ? (
                <Card className="border-2 border-primary shadow-lg m-1">
                  <CardBody className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon icon={steps[3].icon} width={28} className="text-primary" />
                        <h2 className="text-xl font-bold text-primary">{steps[3].name}</h2>
                      </div>
                      <p className="text-sm text-gray-500">Step 4 of {steps.length}</p>
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
                      <div className="flex gap-2">
                        <Button
                          variant="bordered"
                          onPress={handlePreviousStep}
                          startContent={<Icon icon="solar:arrow-left-linear" width={20} />}
                        >
                          Previous
                        </Button>
                      </div>
                      <Button
                        color="primary"
                        onPress={handleNextStep}
                        endContent={<Icon icon="solar:arrow-right-linear" width={20} />}
                      >
                        {(() => {
                          const highestCompleted = getHighestCompletedStep()
                          return highestCompleted && currentStep < highestCompleted.stepNumber
                            ? `Return to ${highestCompleted.stepName}`
                            : 'Next Step'
                        })()}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : completedSteps.has(3) && (
                <div className="pb-1">
                  <ParcelsSummary data={getValues()} onEdit={() => handleEditStep(3)} />
                </div>
              )}

              {/* Step 4: Shipping Rates */}
              {currentStep === 4 ? (
                <>
                  {/* Rate Calculation Section */}
                  <Card className="border-2 border-primary shadow-lg m-1">
                    <CardBody className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon icon={steps[4].icon} width={28} className="text-primary" />
                          <h2 className="text-xl font-bold text-primary">{steps[4].name}</h2>
                        </div>
                        <p className="text-sm text-gray-500">Step 5 of {steps.length} - Calculate shipping rates</p>
                      </div>
                      <div className="mb-4 p-4 bg-gray-50 rounded border">
                        <h3 className="font-semibold mb-2">
                          Previously Chosen Rate : 
                          {previouslyChosenRate ?
                            <span className="text-green-600 font-semibold"> Found ✓</span> :
                            <span className="text-red-600 font-semibold"> Not Found ✗</span>
                          }
                        </h3>                      
                        {previouslyChosenRate ? (
                          <div>
                            <p className="text-sm mb-1">
                              <strong>{previouslyChosenRate.shipper_account_description} </strong> ({previouslyChosenRate.service_name})
                              <strong> | Amount:</strong> {previouslyChosenRate.total_charge_amount} {previouslyChosenRate.total_charge_currency}
                              <strong> | Charged Weight:</strong> {previouslyChosenRate.charge_weight_value} {previouslyChosenRate.charge_weight_unit}
                              <strong> | Transit Time:</strong> {previouslyChosenRate.shipper_account_description === 'DHL eCommerce Asia' ? '1-3(Working) Days' : `${previouslyChosenRate.transit_time} (days)`}
                            </p>
                            {/* <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-blue-600">Show full details</summary>
                              <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(previouslyChosenRate, null, 2)}</pre>
                            </details> */}
                          </div>
                        ) : (
                          <p className="text-sm text-red-600 mt-2">
                            No previously chosen rate found. Check browser console for debugging info.
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
                          errors={errors}
                          serviceOption={watch('service_options')}
                          rateCalculationError={rateCalculationError}
                        />
                      </div>
                      <div className="flex justify-left items-center border-t gap-2 pt-4">
                        <div className="flex gap-2">
                          <Button
                            variant="bordered"
                            type="button"
                            onPress={() => navigate(`/shipment/${shipmentId}`)}
                          >
                            Cancel
                          </Button>
                        </div>
                        <Button
                          color="success"
                          type="submit"
                          startContent={<Icon icon="solar:check-circle-bold" width={20} />}
                          isDisabled={!previouslyChosenRate && calculatedRates.length === 0}
                        >
                          {calculatedRates.length === 0 && !previouslyChosenRate
                            ? 'Calculate Rates First'
                            : calculatedRates.length > 0 && !selectedRateId
                              ? 'Select Rate First'
                              : 'Preview & Update Shipment'}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </>
              ) :
               completedSteps.has(3) && (selectedRateId || previouslyChosenRate) && (
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
