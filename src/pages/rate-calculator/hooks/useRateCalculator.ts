import { useState } from 'react'
import axios from 'axios'
import { useNotification } from '@context/NotificationContext'
import type { RateCalculatorFormData, ShippingRate, ErrorModalState } from '../types/rate-calculator.types'

export const useRateCalculator = () => {
  const [isCalculating, setIsCalculating] = useState(false)
  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    isOpen: false,
    title: '',
    message: '',
    details: []
  })

  const { error: showError } = useNotification()

  const calculateRates = async (formData: RateCalculatorFormData): Promise<ShippingRate[]> => {
    try {
      setIsCalculating(true)

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
            hs_code: item.hs_code
          })),
          description: parcel.description,
          weight: {
            unit: parcel.weight_unit,
            value: parseFloat(String(parcel.weight_value)) || 0
          }
        })),
        delivery_instructions: "handle with care"
      }

      // Determine type based on countries
      let type: string

      if (formData.ship_from_country === "THA" && formData.ship_to_country === "THA") {
        type = "domestic"
      } else if (formData.ship_to_country === "THA" && formData.ship_from_country !== "THA") {
        type = "import"
      } else if (formData.ship_from_country === "THA" && formData.ship_to_country !== "THA") {
        type = "export"
      } else {
        type = "cross-border" // neither side is THA
      }

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

      console.log('Rate calculation successful:', apiRates)
      return apiRates

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

      throw error

    } finally {
      setIsCalculating(false)
    }
  }

  return {
    calculateRates,
    isCalculating,
    errorModal,
    setErrorModal
  }
}