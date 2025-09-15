import { useState } from 'react'
import axios from 'axios'
import type { RateCalculatorFormData, RateCalculationRequest, RateCalculationResponse, Rate } from '../types'
import { DEFAULT_SHIPPER_ACCOUNTS } from '../types'

export const useRateCalculator = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [rates, setRates] = useState<Rate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [calculationId, setCalculationId] = useState<string | null>(null)

  const transformFormDataToRequest = (formData: RateCalculatorFormData): RateCalculationRequest => {
    return {
      shipper_accounts: DEFAULT_SHIPPER_ACCOUNTS,
      shipment: {
        ship_from: {
          contact_name: formData.ship_from_contact_name,
          company_name: formData.ship_from_company_name,
          street1: formData.ship_from_street1,
          street2: formData.ship_from_street2,
          city: formData.ship_from_city,
          state: formData.ship_from_state,
          postal_code: formData.ship_from_postal_code,
          country: formData.ship_from_country,
          phone: formData.ship_from_phone,
          email: formData.ship_from_email,
          type: formData.ship_from_type
        },
        ship_to: {
          contact_name: formData.ship_to_contact_name,
          company_name: formData.ship_to_company_name,
          street1: formData.ship_to_street1,
          street2: formData.ship_to_street2,
          city: formData.ship_to_city,
          state: formData.ship_to_state,
          postal_code: formData.ship_to_postal_code,
          country: formData.ship_to_country,
          phone: formData.ship_to_phone,
          email: formData.ship_to_email,
          type: formData.ship_to_type
        },
        parcels: [
          {
            box_type: formData.box_type,
            dimension: {
              width: formData.dimension_width,
              height: formData.dimension_height,
              depth: formData.dimension_depth,
              unit: formData.dimension_unit
            },
            items: [
              {
                description: formData.item_description,
                quantity: formData.item_quantity,
                price: {
                  currency: formData.item_price_currency,
                  amount: formData.item_price_amount
                },
                item_id: formData.item_id,
                origin_country: formData.item_origin_country,
                weight: {
                  unit: formData.item_weight_unit,
                  value: formData.item_weight_value
                },
                sku: formData.item_sku,
                hs_code: formData.item_hs_code
              }
            ],
            description: formData.parcel_description,
            weight: {
              unit: formData.parcel_weight_unit,
              value: formData.parcel_weight_value
            }
          }
        ],
        ...(formData.include_return_address && formData.return_to_contact_name && {
          return_to: {
            contact_name: formData.return_to_contact_name,
            company_name: formData.return_to_company_name || '',
            street1: formData.return_to_street1 || '',
            street2: formData.return_to_street2,
            city: formData.return_to_city || '',
            state: formData.return_to_state || '',
            postal_code: formData.return_to_postal_code || '',
            country: formData.return_to_country || '',
            phone: formData.return_to_phone || '',
            email: formData.return_to_email || '',
            type: formData.return_to_type
          }
        }),
        ...(formData.delivery_instructions && {
          delivery_instructions: formData.delivery_instructions
        })
      }
    }
  }

  const calculateRates = async (formData: RateCalculatorFormData) => {
    setIsLoading(true)
    setError(null)
    setRates([])
    setCalculationId(null)

    try {
      const requestData = transformFormDataToRequest(formData)

      const response = await axios.post<RateCalculationResponse>(
        'https://api.aftership.com/postmen/v3/rates',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            // Note: In a real application, you would need to add proper API key authentication
            // 'postmen-api-key': 'your-api-key-here'
          }
        }
      )

      if (response.data.meta.code === 200) {
        setRates(response.data.data.rates)
        setCalculationId(response.data.data.id)
      } else {
        setError(response.data.meta.message || 'Failed to calculate rates')
      }
    } catch (err: unknown) {
      console.error('Rate calculation error:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { meta?: { message?: string } } } }
        if (axiosError.response?.data?.meta?.message) {
          setError(axiosError.response.data.meta.message)
        } else {
          setError('Failed to calculate rates. Please check your inputs and try again.')
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        const errorWithMessage = err as { message: string }
        setError(errorWithMessage.message)
      } else {
        setError('Failed to calculate rates. Please check your inputs and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setRates([])
    setError(null)
    setCalculationId(null)
  }

  return {
    isLoading,
    rates,
    error,
    calculationId,
    calculateRates,
    clearResults
  }
}