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

// Default DHL eCommerce domestic rate slabs (fallback when API fails)
const DEFAULT_DHL_RATE_SLABS: DHLEcommerceRateSlab[] = [
  { dhlEcommerceDomesticRateListID: 1, min_weight_kg: '0',      max_weight_kg: '0.25',  bkk_charge_thb: '37',  upc_charge_thb: '47' },
  { dhlEcommerceDomesticRateListID: 2, min_weight_kg: '0.251',  max_weight_kg: '0.5',   bkk_charge_thb: '37',  upc_charge_thb: '47' },
  { dhlEcommerceDomesticRateListID: 3, min_weight_kg: '0.501',  max_weight_kg: '0.75',  bkk_charge_thb: '37',  upc_charge_thb: '57' },
  { dhlEcommerceDomesticRateListID: 4, min_weight_kg: '0.751',  max_weight_kg: '1',    bkk_charge_thb: '37',  upc_charge_thb: '62' },
  { dhlEcommerceDomesticRateListID: 5, min_weight_kg: '1.001',  max_weight_kg: '1.5',  bkk_charge_thb: '77',  upc_charge_thb: '87' },
  { dhlEcommerceDomesticRateListID: 6, min_weight_kg: '1.501',  max_weight_kg: '2',    bkk_charge_thb: '77',  upc_charge_thb: '97' },
  { dhlEcommerceDomesticRateListID: 7, min_weight_kg: '2.001',  max_weight_kg: '3',    bkk_charge_thb: '87',  upc_charge_thb: '122' },
  { dhlEcommerceDomesticRateListID: 8, min_weight_kg: '3.001',  max_weight_kg: '4',    bkk_charge_thb: '97',  upc_charge_thb: '132' },
  { dhlEcommerceDomesticRateListID: 9, min_weight_kg: '4.001',  max_weight_kg: '5',    bkk_charge_thb: '97',  upc_charge_thb: '142' },
  { dhlEcommerceDomesticRateListID: 10, min_weight_kg: '5.001', max_weight_kg: '6',    bkk_charge_thb: '128', upc_charge_thb: '142' },
  { dhlEcommerceDomesticRateListID: 11, min_weight_kg: '6.001', max_weight_kg: '7',    bkk_charge_thb: '128', upc_charge_thb: '142' },
  { dhlEcommerceDomesticRateListID: 12, min_weight_kg: '7.001', max_weight_kg: '8',    bkk_charge_thb: '128', upc_charge_thb: '153' },
  { dhlEcommerceDomesticRateListID: 13, min_weight_kg: '8.001', max_weight_kg: '9',    bkk_charge_thb: '140', upc_charge_thb: '182' },
  { dhlEcommerceDomesticRateListID: 14, min_weight_kg: '9.001', max_weight_kg: '10',   bkk_charge_thb: '149', upc_charge_thb: '197' },
  { dhlEcommerceDomesticRateListID: 15, min_weight_kg: '10.001',max_weight_kg: '11',   bkk_charge_thb: '169', upc_charge_thb: '187' },
  { dhlEcommerceDomesticRateListID: 16, min_weight_kg: '11.001',max_weight_kg: '12',   bkk_charge_thb: '169', upc_charge_thb: '187' },
  { dhlEcommerceDomesticRateListID: 17, min_weight_kg: '12.001',max_weight_kg: '13',   bkk_charge_thb: '169', upc_charge_thb: '187' },
  { dhlEcommerceDomesticRateListID: 18, min_weight_kg: '13.001',max_weight_kg: '14',   bkk_charge_thb: '169', upc_charge_thb: '187' },
  { dhlEcommerceDomesticRateListID: 19, min_weight_kg: '14.001',max_weight_kg: '15',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 20, min_weight_kg: '15.001',max_weight_kg: '16',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 21, min_weight_kg: '16.001',max_weight_kg: '17',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 22, min_weight_kg: '17.001',max_weight_kg: '18',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 23, min_weight_kg: '18.001',max_weight_kg: '19',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 24, min_weight_kg: '19.001',max_weight_kg: '20',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 25, min_weight_kg: '20.001',max_weight_kg: '21',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 26, min_weight_kg: '21.001',max_weight_kg: '22',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 27, min_weight_kg: '22.001',max_weight_kg: '23',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 28, min_weight_kg: '23.001',max_weight_kg: '24',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 29, min_weight_kg: '24.001',max_weight_kg: '25',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 30, min_weight_kg: '25.001',max_weight_kg: '26',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 31, min_weight_kg: '26.001',max_weight_kg: '27',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 32, min_weight_kg: '27.001',max_weight_kg: '28',   bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 33, min_weight_kg: '28.001',max_weight_kg: '29',   bkk_charge_thb: '325', upc_charge_thb: '359' },
  { dhlEcommerceDomesticRateListID: 34, min_weight_kg: '29.001',max_weight_kg: '30',   bkk_charge_thb: '325', upc_charge_thb: '359' },
  { dhlEcommerceDomesticRateListID: 35, min_weight_kg: '30.001',max_weight_kg: '31',   bkk_charge_thb: '325', upc_charge_thb: '359' },
  { dhlEcommerceDomesticRateListID: 36, min_weight_kg: '31.001',max_weight_kg: '32',   bkk_charge_thb: '350', upc_charge_thb: '384' },
  { dhlEcommerceDomesticRateListID: 37, min_weight_kg: '32.001',max_weight_kg: '33',   bkk_charge_thb: '375', upc_charge_thb: '409' },
  { dhlEcommerceDomesticRateListID: 38, min_weight_kg: '33.001',max_weight_kg: '34',   bkk_charge_thb: '400', upc_charge_thb: '434' },
  { dhlEcommerceDomesticRateListID: 39, min_weight_kg: '34.001',max_weight_kg: '35',   bkk_charge_thb: '425', upc_charge_thb: '459' }
]

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
  // Normalize and sort slabs by min weight
  const sorted = rateSlabs.slice().sort((a, b) => parseFloat(a.min_weight_kg) - parseFloat(b.min_weight_kg))

  // Find the rate slab that matches the weight
  const rateSlab = sorted.find(slab => {
    const minWeight = parseFloat(slab.min_weight_kg)
    const maxWeight = parseFloat(slab.max_weight_kg)
    return weight >= minWeight && weight <= maxWeight
  })

  if (rateSlab) {
    // Always use Upcountry rate for all domestic shipments
    return parseFloat(rateSlab.upc_charge_thb)
  }

  // No exact slab matched. Fall back to nearest boundary slab instead of a hardcoded number.
  if (sorted.length === 0) {
    console.warn('No rate slabs available to determine rate for weight', weight)
    return 62 // last resort (should not happen because DEFAULT_DHL_RATE_SLABS exists)
  }

  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const firstMin = parseFloat(first.min_weight_kg)
  const lastMax = parseFloat(last.max_weight_kg)

  if (weight < firstMin) {
    // below minimum - use first slab's upcountry rate
    return parseFloat(first.upc_charge_thb)
  }

  if (weight > lastMax) {
    // above maximum - use last slab's upcountry rate
    return parseFloat(last.upc_charge_thb)
  }

  // As a safe fallback use first slab upcountry rate
  console.warn(`Weight ${weight}kg did not match any slab, using first slab rate`)
  return parseFloat(first.upc_charge_thb)
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

        // Use fetched slabs if available, otherwise fall back to built-in default slabs
        const slabsToUse = (rateSlabs && rateSlabs.length > 0) ? rateSlabs : DEFAULT_DHL_RATE_SLABS
        if (!rateSlabs || rateSlabs.length === 0) {
          console.warn('Failed to fetch DHL eCommerce rate list, using default built-in slabs')
        }

        // Calculate the rate based on weight (always uses Upcountry rate)
        const totalAmount = findRateByWeight(chargeWeight, slabsToUse)
        console.log(`DHL eCommerce Asia rate for ${chargeWeight}kg: ${totalAmount} THB (Upcountry rate)`)

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