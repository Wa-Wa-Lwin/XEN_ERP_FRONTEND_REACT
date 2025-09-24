export interface RateCalculatorFormData {
  // Ship From Address
  ship_from_country: string
  ship_from_contact_name: string
  ship_from_phone: string
  ship_from_email: string
  ship_from_company_name: string
  ship_from_street1: string
  ship_from_street2?: string
  ship_from_city: string
  ship_from_state: string
  ship_from_postal_code: string

  // Ship To Address
  ship_to_country: string
  ship_to_contact_name: string
  ship_to_phone: string
  ship_to_email: string
  ship_to_company_name: string
  ship_to_street1: string
  ship_to_street2?: string
  ship_to_city: string
  ship_to_state: string
  ship_to_postal_code: string

  // Parcels
  parcels: Array<{
    width: number
    height: number
    depth: number
    dimension_unit: string
    weight_value: number
    weight_unit: string
    description: string
    parcel_items: Array<{
      description: string
      quantity: number
      price_currency: string
      price_amount: number
      item_id: string
      origin_country: string
      weight_unit: string
      weight_value: number
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

export interface ErrorDetail {
  path: string
  info: string
}

export interface ErrorModalState {
  isOpen: boolean
  title: string
  message?: string
  details?: ErrorDetail[]
}