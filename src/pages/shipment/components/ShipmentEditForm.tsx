import React, { useState, useEffect } from 'react'
import { Button, Card, CardBody, Modal, ModalContent, ModalBody, Spinner } from '@heroui/react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@context/AuthContext'
import { useNotification } from '@context/NotificationContext'
import { calculateAndTransformRates, calculateShippingRates, type RateCalculationFormData } from '@services/rateCalculationService'
import { DEFAULT_FORM_VALUES } from '../constants/form-defaults'
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

const ShipmentEditForm = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>()
  const navigate = useNavigate()
  const { user, msLoginUser } = useAuth()
  const { success, error: showError } = useNotification()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<ShipmentFormData | null>(null)
  const [isCalculatingRate, setIsCalculatingRate] = useState(false)
  const [calculatedRates, setCalculatedRates] = useState<any[]>([])
  const [transformedRates, setTransformedRates] = useState<any[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string>('')
  const [refreshCounter, setRefreshCounter] = useState(0)
  const isInitialLoad = React.useRef(true)

  const formMethods = useForm<ShipmentFormData>({
    defaultValues: DEFAULT_FORM_VALUES
  })

  const { register, control, handleSubmit, watch, setValue, getValues, reset, formState: { errors } } = formMethods

  // Watch for changes in critical fields that affect rates
  const watchedFields = watch([
    'ship_from_country', 'ship_from_postal_code', 'ship_from_city', 'ship_from_state', 'ship_from_street1', 'ship_from_company_name',
    'ship_to_country', 'ship_to_postal_code', 'ship_to_city', 'ship_to_state', 'ship_to_street1', 'ship_to_company_name',
    'parcels'
  ])

  const [rateCalculationSnapshot, setRateCalculationSnapshot] = React.useState<any>(null)

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
            chosen: rate.chosen === 1 || rate.chosen === true,
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

        // Don't load existing rates - force users to recalculate rates in edit mode
        // This ensures rates are fresh and up-to-date when editing
        setCalculatedRates([])
        setTransformedRates([])
        setSelectedRateId('')
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

  // Effect to clear rates when critical form data changes
  React.useEffect(() => {
    // Skip clearing rates during initial load
    if (isInitialLoad.current) {
      return
    }

    if (rateCalculationSnapshot && calculatedRates.length > 0) {
      const hasChanged = JSON.stringify(watchedFields) !== JSON.stringify(rateCalculationSnapshot)

      if (hasChanged) {
        console.log('Critical form data changed, clearing rates...')
        console.log('Previous:', rateCalculationSnapshot)
        console.log('Current:', watchedFields)
        handleClearRates()
      }
    }
  }, [watchedFields, rateCalculationSnapshot, calculatedRates.length])

  const handleRateSelection = (rateId: string) => {
    setSelectedRateId(rateId)
  }

  const calculateRates = async (formData: ShipmentFormData) => {
    try {
      setIsCalculatingRate(true)

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

      const originalRates = await calculateShippingRates(serviceFormData)
      const transformedRates = await calculateAndTransformRates(serviceFormData)

      console.log('Setting calculated rates:', originalRates)
      setCalculatedRates(originalRates)
      setTransformedRates(transformedRates)

      const updatedFormData = {
        ...formData,
        rates: transformedRates
      }

      return updatedFormData
    } catch (error) {
      console.error('Error calculating rates:', error)

      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data

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

    if (!formData.ship_from_company_name?.trim()) {
      errors.push({ path: 'data.shipment.ship_from.company_name', info: 'Ship from company name is required' })
    }
    if (!formData.ship_to_company_name?.trim()) {
      errors.push({ path: 'data.shipment.ship_to.company_name', info: 'Ship to company name is required' })
    }

    if (!formData.parcels || formData.parcels.length === 0) {
      errors.push({ path: 'data.shipment.parcels', info: 'At least one parcel is required' })
    } else {
      formData.parcels.forEach((parcel, parcelIndex) => {
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

        if (!parcel.parcel_items || parcel.parcel_items.length === 0) {
          errors.push({
            path: `data.shipment.parcels.${parcelIndex}.items`,
            info: 'Each parcel must have at least one item'
          })
        } else {
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
        const totalItemWeight = parcel.parcel_items.reduce((sum, item) => {
          const itemWeight = parseFloat(String(item.weight_value)) || 0
          const quantity = parseInt(String(item.quantity)) || 1
          return sum + (itemWeight * quantity)
        }, 0)

        const parcelWeight = parseFloat(String(parcel.weight_value)) || 0

        if (parcelWeight < totalItemWeight) {
          errors.push({
            path: `Parcel ${parcelIndex + 1} – Weight`,
            info: `Parcel weight (${parcelWeight}kg) must be greater than or equal to the sum of item weights (${totalItemWeight.toFixed(2)}kg). Please increase the parcel weight or reduce item weights.`
          })
        }
      }

      const parcelWeight = parseFloat(String(parcel.weight_value)) || 0
      if (parcelWeight <= 0) {
        errors.push({
          path: `Parcel ${parcelIndex + 1} – Weight`,
          info: `Parcel weight must be greater than 0kg`
        })
      }

      parcel.parcel_items?.forEach((item, itemIndex) => {
        const itemWeight = parseFloat(String(item.weight_value)) || 0
        if (itemWeight <= 0) {
          errors.push({
            path: `Parcel ${parcelIndex + 1} – Item ${itemIndex + 1} Weight`,
            info: `Item weight must be greater than 0kg`
          })
        }
      })
    })

    return { isValid: errors.length === 0, errors }
  }

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

    if (calculatedRates.length === 0) {
      setErrorModal({
        isOpen: true,
        title: 'Rate Calculation Required',
        message: 'Please calculate shipping rates before proceeding to preview.',
        details: [{ path: 'Rates', info: 'Click "Calculate Rates" button to get available shipping options' }]
      })
      return
    }

    if (calculatedRates.length > 0 && !selectedRateId) {
      setErrorModal({
        isOpen: true,
        title: 'Rate Selection Required',
        message: 'Please select a shipping rate before proceeding to preview.',
        details: [{ path: 'Rate Selection', info: 'Choose one of the calculated shipping rates from the rates section' }]
      })
      return
    }

    let formDataWithRates = formData
    if (calculatedRates.length === 0) {
      formDataWithRates = await calculateRates(formData)
    } else {
      formDataWithRates = {
        ...formData,
        rates: transformedRates
      }
    }

    setPreviewData(formDataWithRates)
    setIsPreviewOpen(true)
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

      const updatedRates = previewData.rates?.map(rate => ({
        ...rate,
        // Ensure transit_time is a string
        transit_time: String(rate.transit_time || ''),
        // Truncate detailed_charges to 255 characters
        detailed_charges: rate.detailed_charges ? String(rate.detailed_charges).substring(0, 255) : '',
        chosen: rate.unique_id === selectedRateId ? true : false
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

      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data

        if (errorData.meta?.details && Array.isArray(errorData.meta.details)) {
          const errorMessages = errorData.meta.details.map((detail: any) =>
            `${detail.path}: ${detail.info}`
          ).join('\n')

          showError(`Update failed with validation errors:\n\n${errorMessages}`, 'Validation Error')
        } else if (errorData.meta?.message) {
          showError(`Update failed: ${errorData.meta.message}`, 'Update Failed')
        } else {
          showError('Error updating shipment request. Please check your form data and try again.', 'Update Error')
        }
      } else {
        showError('Error updating shipment request. Please check your internet connection and try again.', 'Connection Error')
      }
    } finally {
      setIsSubmitting(false)
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

    // Clear existing rates before calculating new ones
    // This prevents doubling of rates when recalculating
    setCalculatedRates([])
    setTransformedRates([])
    setSelectedRateId('')

    // Mark that we're done with initial load when user manually calculates rates
    isInitialLoad.current = false

    const updatedFormData = await calculateRates(formData)

    if (updatedFormData.rates && updatedFormData.rates.length > 0) {
      setRateCalculationSnapshot(watchedFields)
    }
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
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold px-5 pt-3">Edit Shipment Request ID - {shipmentId}</h1>
            <Button
              variant="bordered"
              onPress={() => navigate(`/shipment/${shipmentId}`)}
            >
              Cancel
            </Button>
          </div>

          <form
            onSubmit={handleSubmit(handlePreview)}
            className="space-y-1"
          >
            <div className="py-1 px-4">
              <BasicInformation register={register} errors={errors} control={control} watch={watch} setValue={setValue} onClearRates={handleClearRates} />
              <div className="pt-2 px-1">
                <hr />
              </div>
            </div>

            <div className="flex grid grid-cols-1 md:grid-cols-2 gap-3 py-1 px-4">
              <div className="flex gap-2 items-center">
                <AddressSelector register={register} errors={errors} control={control} setValue={setValue} title="Ship From Address" prefix="ship_from" forceRefresh={refreshCounter} watch={watch} onClearRates={handleClearRates} />
                <Button
                  size="sm"
                  variant="bordered"
                  color="primary"
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
                  <Icon icon="solar:refresh-bold" />
                </Button>
              </div>

              <div className="">
                <AddressSelector register={register} errors={errors} control={control} setValue={setValue} title="Ship To Address" prefix="ship_to" forceRefresh={refreshCounter} watch={watch} onClearRates={handleClearRates} />
              </div>
            </div>
            <div className="pt-2 px-1">
              <hr />
            </div>

            <div className="py-1 px-4">
              <PickupInformation register={register} control={control} errors={errors} today={today} setValue={setValue} watch={watch} onClearRates={handleClearRates} />
              <div className="pt-2 px-1">
                <hr />
              </div>
            </div>

            <div className="py-1 px-4">
              <ParcelsSection register={register} errors={errors} control={control} setValue={setValue} watch={watch} onClearRates={handleClearRates} />
              <div className="pt-2 px-1">
                <hr />
              </div>
            </div>

            <div className="py-1 px-4">
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
            </div>

            <div className="flex justify-start gap-4">
              <Button
                variant="bordered"
                type="button"
                onPress={() => navigate(`/shipment/${shipmentId}`)}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                startContent={<Icon icon="solar:eye-bold" />}
                isDisabled={calculatedRates.length === 0 || !selectedRateId}
              >
                {calculatedRates.length === 0
                  ? 'Calculate Rates First'
                  : !selectedRateId
                    ? 'Select Rate First'
                    : 'Preview & Update'}
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
          selectedRateId={selectedRateId}
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
