import { useState } from 'react'
import axios from 'axios'
import { useNotification } from '@context/NotificationContext'
import { calculateShippingRates, type RateCalculationFormData } from '@services/rateCalculationService'
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

      // Convert RateCalculatorFormData to RateCalculationFormData
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
        parcels: formData.parcels
      }

      // Use the shared rate calculation service
      const apiRates = await calculateShippingRates(serviceFormData)
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