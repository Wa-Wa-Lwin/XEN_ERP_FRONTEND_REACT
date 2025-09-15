export interface ShipperAccount {
  id: string
  slug?: string
  description?: string
}

export interface Address {
  contact_name: string
  company_name: string
  street1: string
  street2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  email: string
  type?: 'residential' | 'commercial'
}

export interface Dimension {
  width: number
  height: number
  depth: number
  unit: 'cm' | 'in'
}

export interface Weight {
  value: number
  unit: 'kg' | 'lb'
}

export interface Price {
  amount: number
  currency: string
}

export interface ParcelItem {
  description: string
  quantity: number
  price: Price
  item_id: string
  origin_country: string
  weight: Weight
  sku?: string
  hs_code?: string
}

export interface Parcel {
  box_type: string
  dimension: Dimension
  items: ParcelItem[]
  description: string
  weight: Weight
}

export interface RateCalculationRequest {
  shipper_accounts: ShipperAccount[]
  shipment: {
    ship_from: Address
    ship_to: Address
    parcels: Parcel[]
    return_to?: Address
    delivery_instructions?: string
  }
}

export interface DetailedCharge {
  type: string
  charge: Price
}

export interface Rate {
  shipper_account: ShipperAccount
  service_type: string
  service_name: string
  pickup_deadline?: string
  booking_cut_off?: string
  delivery_date?: string
  transit_time?: number
  error_message?: string
  info_message?: string
  charge_weight: Weight
  total_charge: Price
  detailed_charges: DetailedCharge[]
}

export interface RateCalculationResponse {
  meta: {
    code: number
    message: string
    details: string[]
  }
  data: {
    created_at: string
    id: string
    updated_at: string
    service_options?: unknown
    status: string
    rates: Rate[]
  }
}

export interface RateCalculatorFormData {
  // Ship From
  ship_from_contact_name: string
  ship_from_company_name: string
  ship_from_street1: string
  ship_from_street2?: string
  ship_from_city: string
  ship_from_state: string
  ship_from_postal_code: string
  ship_from_country: string
  ship_from_phone: string
  ship_from_email: string
  ship_from_type?: 'residential' | 'commercial'

  // Ship To
  ship_to_contact_name: string
  ship_to_company_name: string
  ship_to_street1: string
  ship_to_street2?: string
  ship_to_city: string
  ship_to_state: string
  ship_to_postal_code: string
  ship_to_country: string
  ship_to_phone: string
  ship_to_email: string
  ship_to_type?: 'residential' | 'commercial'

  // Parcel
  box_type: string
  dimension_width: number
  dimension_height: number
  dimension_depth: number
  dimension_unit: 'cm' | 'in'
  parcel_weight_value: number
  parcel_weight_unit: 'kg' | 'lb'
  parcel_description: string

  // Item
  item_description: string
  item_quantity: number
  item_price_amount: number
  item_price_currency: string
  item_id: string
  item_origin_country: string
  item_weight_value: number
  item_weight_unit: 'kg' | 'lb'
  item_sku?: string
  item_hs_code?: string

  // Return To (optional)
  include_return_address: boolean
  return_to_contact_name?: string
  return_to_company_name?: string
  return_to_street1?: string
  return_to_street2?: string
  return_to_city?: string
  return_to_state?: string
  return_to_postal_code?: string
  return_to_country?: string
  return_to_phone?: string
  return_to_email?: string
  return_to_type?: 'residential' | 'commercial'

  // Options
  delivery_instructions?: string
}

export const DEFAULT_SHIPPER_ACCOUNTS: ShipperAccount[] = [
  { id: "ddf178238347473cbb9c496d05f852ec" },
  { id: "cb9b8f9a1214447193ead90036de4aec" },
  { id: "927836f5-fb9f-456c-be0e-ad97d7c15b5a" },
  { id: "f2d341a82daa43079e6e4daa849f8b5e" },
  { id: "f535473ba8f3493aa07aad9339f0a439" },
  { id: "fb842bff60154a2f8c84584a74d0cf69" }
]

export const COUNTRIES = [
  'USA', 'CAN', 'GBR', 'CHN', 'JPN', 'DEU', 'FRA', 'ITA', 'ESP', 'AUS'
]

export const BOX_TYPES = [
  'custom',
  'small_box',
  'medium_box',
  'large_box',
  'extra_large_box',
  'envelope',
  'pak',
  'tube'
]