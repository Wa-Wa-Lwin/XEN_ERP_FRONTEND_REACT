import axios from 'axios'

export interface RateCalculationFormData {
  ship_from_contact_name: string
  ship_from_company_name: string
  ship_from_street1: string
  ship_from_city: string
  ship_from_state: string
  ship_from_postal_code: string
  ship_from_country: string
  ship_from_phone: string
  ship_from_email: string
  ship_to_contact_name: string
  ship_to_company_name: string
  ship_to_street1: string
  ship_to_city: string
  ship_to_state: string
  ship_to_postal_code: string
  ship_to_country: string
  ship_to_phone: string
  ship_to_email: string
  pick_up_date: string
  expected_delivery_date?: string
  parcels?: Array<{
    width: number | string
    height: number | string
    depth: number | string
    dimension_unit: string
    weight_value: number | string
    weight_unit: string
    description: string
    parcel_items?: Array<{
      description: string
      quantity: number | string
      price_currency: string
      price_amount: number | string
      item_id: string
      origin_country: string
      weight_unit: string
      weight_value: number | string
      sku: string
      hs_code: string
    }>
  }>
}

export interface ShippingRate {
  shipper_account: {
    id: string
    slug: string
    description: string
  }
  service_type: string
  service_name: string
  pickup_deadline: string
  booking_cut_off: string
  delivery_date: string
  transit_time?: number
  error_message?: string
  info_message?: string
  charge_weight?: {
    value: number
    unit: string
  }
  total_charge?: {
    amount: number
    currency: string
  }
  detailed_charges?: any[]
}

export interface RateCalculationOptions {
  transformRates?: boolean
  includeUniqueId?: boolean
}

/**
 * Transforms form data into the format expected by the backend API
 */
const transformFormDataToShipment = (formData: RateCalculationFormData) => {
  return {
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
}

/**
 * Determines shipment type based on origin and destination countries
 */
const determineShipmentType = (fromCountry: string, toCountry: string): string => {
  if (fromCountry === "THA" && toCountry === "THA") {
    return "domestic"
  } else if (toCountry === "THA" && fromCountry !== "THA") {
    return "import"
  } else if (fromCountry === "THA" && toCountry !== "THA") {
    return "export"
  } else {
    return "cross-border" // neither side is THA
  }
}

/**
 * Generates a unique ID for a shipping rate
 */
const getRateUniqueId = (rate: ShippingRate): string => {
  const shipperAccountId = rate.shipper_account?.id || ''
  const totalChargeAmount = rate.total_charge?.amount || 0
  const totalChargeCurrency = rate.total_charge?.currency || 'null'
  const transitTime = rate.transit_time || 'null'
  return `${shipperAccountId}-${rate.service_type}-${transitTime}-${totalChargeAmount}-${totalChargeCurrency}`
}

/**
 * Transforms API rates into the format used by ShipmentForm
 */
const transformRatesForShipmentForm = (apiRates: ShippingRate[]) => {
  return apiRates.map((rate: ShippingRate) => ({
    shipper_account_id: rate.shipper_account.id,
    shipper_account_slug: rate.shipper_account.slug,
    shipper_account_description: rate.shipper_account.description,
    service_type: rate.service_type,
    service_name: rate.service_name,
    pickup_deadline: rate.pickup_deadline,
    booking_cut_off: rate.booking_cut_off,
    delivery_date: rate.delivery_date,
    transit_time: rate.transit_time || 0,
    error_message: rate.error_message || '',
    info_message: rate.info_message || '',
    charge_weight_value: rate.charge_weight?.value || 0,
    charge_weight_unit: rate.charge_weight?.unit || '',
    total_charge_amount: rate.total_charge?.amount || 0,
    total_charge_currency: rate.total_charge?.currency || '',
    unique_id: getRateUniqueId(rate),
    chosen: false,
    detailed_charges: JSON.stringify(rate.detailed_charges) || ''
  }))
}

/**
 * Calculate shipping rates using the backend API
 * @param formData - The form data containing shipment details
 * @param options - Optional configuration for rate transformation
 * @returns Promise<ShippingRate[]> - Array of shipping rates
 */
export const calculateShippingRates = async (
  formData: RateCalculationFormData,
  _options: RateCalculationOptions = {}
): Promise<ShippingRate[]> => {
  const shipment = transformFormDataToShipment(formData)
  const type = determineShipmentType(formData.ship_from_country, formData.ship_to_country)

  // Backend API payload structure
  const backendPayload = {
    preparedata: {
      shipment: shipment,
      pick_up_date: formData.pick_up_date,
      expected_delivery_date: formData.expected_delivery_date 
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
}

/**
 * Calculate shipping rates and transform them for ShipmentForm usage
 * @param formData - The form data containing shipment details
 * @returns Promise<any[]> - Array of transformed shipping rates
 */
export const calculateAndTransformRates = async (formData: RateCalculationFormData): Promise<any[]> => {
  const apiRates = await calculateShippingRates(formData)
  return transformRatesForShipmentForm(apiRates)
}

/**
 * Export utility functions for reuse
 */
export {
  transformFormDataToShipment,
  determineShipmentType,
  getRateUniqueId,
  transformRatesForShipmentForm
}