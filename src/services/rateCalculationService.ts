import axios from 'axios'

// Interface for DHL eCommerce rate slab
interface DHLEcommerceRateSlab {
  dhlEcommerceDomesticRateListID: number
  min_weight_kg: string
  max_weight_kg: string
  bkk_charge_thb: string
  upc_charge_thb: string
}

// Interface for DHL eCommerce rate list API response
interface DHLEcommerceRateListResponse {
  data: DHLEcommerceRateSlab[]
  count: number
}

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
  expected_delivery_date: string
  customs_terms_of_trade?: string
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
 * Fetch DHL eCommerce domestic rate list from API
 */
const fetchDHLEcommerceRateList = async (): Promise<DHLEcommerceRateSlab[]> => {
  try {
    const apiUrl = import.meta.env.VITE_APP_GET_ALL_DHL_ECOMMERCE_DOMESTIC_RATE_LIST
    if (!apiUrl) {
      console.error('DHL eCommerce rate list API URL not configured')
      return []
    }

    const response = await axios.get<DHLEcommerceRateListResponse>(apiUrl)
    return response.data?.data || []
  } catch (error) {
    console.error('Failed to fetch DHL eCommerce rate list:', error)
    return []
  }
}

/**
 * Find the appropriate rate based on weight
 * Always uses upc_charge_thb (Upcountry rate) for all domestic shipments
 */
const findRateByWeight = (weight: number, rateSlabs: DHLEcommerceRateSlab[]): number => {
  // Find the rate slab that matches the weight
  const rateSlab = rateSlabs.find(slab => {
    const minWeight = parseFloat(slab.min_weight_kg)
    const maxWeight = parseFloat(slab.max_weight_kg)
    return weight >= minWeight && weight <= maxWeight
  })

  if (!rateSlab) {
    console.warn(`No rate slab found for weight ${weight}kg`)
    return 62 // Fallback to default rate
  }

  // Always use Upcountry rate for all domestic shipments
  const rate = parseFloat(rateSlab.upc_charge_thb)
  return rate
}

/**
 * Calculate total charge weight from parcels
 */
const calculateChargeWeightThailandDomesticRate = (formData: RateCalculationFormData): number => {
  if (!formData.parcels || formData.parcels.length === 0) {
    return 1 // Default to 1kg if no parcels
  }

  return formData.parcels.reduce((total, parcel) => {
    const weight = parseFloat(String(parcel.weight_value)) || 0
    return total + weight
  }, 0) || 1 // Default to 1kg if total is 0
}

/**
 * Create manual domestic rate for Thailand
 * @param chargeWeight - Weight in kg
 * @param totalAmount - Calculated total amount in THB
 */
const createThailandDomesticRate = (chargeWeight: number, totalAmount: number): ShippingRate => {
  return {
    shipper_account: {
      id: "fb842bff60154a2f8c84584a74d0cf69",
      slug: "dhl-global-mail-asia",
      description: "DHL eCommerce Asia"
    },
    service_type: "dhl-global-mail-asia_parcel_domestic",
    service_name: "Parcel Domestic",
    pickup_deadline: "",
    booking_cut_off: "",
    delivery_date: "",
    transit_time: undefined,
    error_message: undefined,
    info_message: "Rate will be calculated and received in billing cycle.",
    charge_weight: {
      value: chargeWeight,
      unit: "kg"
    },
    total_charge: {
      amount: totalAmount,
      currency: "THB"
    }
  }
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

  // Check if the response contains an error in the meta field
  if (response.data?.meta?.code && response.data.meta.code !== 200) {
    // API returned an error - throw it so it can be caught by the form
    const error: any = new Error(response.data.meta.message || 'Rate calculation failed')
    error.response = response
    throw error
  }

  // Extract rates from the API response
  let apiRates = response.data?.data?.rates || []
  console.log('Rate calculation successful:', apiRates)

  // Add manual domestic rate for Thailand if both countries are THA
  const isDomesticThailand = formData.ship_from_country === "THA" && formData.ship_to_country === "THA"
  if (isDomesticThailand) {
    // Calculate total weight first
    const chargeWeight = calculateChargeWeightThailandDomesticRate(formData)

    // Only show DHL eCommerce Asia if weight is 35kg or less
    if (chargeWeight <= 35) {
      // Check if DHL eCommerce Asia rate already exists
      const hasDHLRate = apiRates.some((rate: ShippingRate) =>
        rate.shipper_account?.slug === "dhl-global-mail-asia"
      )

      // Only add manual rate if DHL eCommerce Asia is not in the response
      if (!hasDHLRate) {
        // Fetch DHL eCommerce rate list
        const rateSlabs = await fetchDHLEcommerceRateList()

        // Calculate the rate based on weight (always uses Upcountry rate)
        let totalAmount = 62 // Default fallback
        if (rateSlabs.length > 0) {
          totalAmount = findRateByWeight(chargeWeight, rateSlabs)
          console.log(`DHL eCommerce Asia rate for ${chargeWeight}kg: ${totalAmount} THB (Upcountry rate)`)
        } else {
          console.warn('Failed to fetch DHL eCommerce rate list, using fallback rate of 62 THB')
        }

        const manualRate = createThailandDomesticRate(chargeWeight, totalAmount)
        apiRates = [manualRate, ...apiRates] // Add at the beginning
        console.log('Added manual Thailand domestic rate:', manualRate)
      }
    } else {
      console.log('Skipping DHL eCommerce Asia rate - weight exceeds 35kg:', chargeWeight)
    }
  }

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