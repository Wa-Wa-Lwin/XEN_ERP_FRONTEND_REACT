export interface ParcelItem {
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
  return_reason: string
}

export interface Parcel {
  box_type: string
  box_type_name: string
  width: number
  height: number
  depth: number
  dimension_unit: string
  weight_value: number
  net_weight_value: number
  parcel_weight_value: number
  weight_unit: string
  description: string
  parcel_items: ParcelItem[]
}

export interface Rate {
  shipper_account_id: string
  shipper_account_slug: string
  shipper_account_description: string
  service_type: string
  service_name: string
  pickup_deadline: string
  booking_cut_off: string
  delivery_date: string
  transit_time: string
  error_message: string
  info_message: string
  charge_weight_value: number
  charge_weight_unit: string
  total_charge_amount: number
  total_charge_currency: string
  chosen: boolean
  detailed_charges: string
}

interface ShippingAddress {
  country: string
  contact_name: string
  phone: string
  fax: string | null
  email: string
  company_name: string
  company_url: string | null
  street1: string
  street2: string | null
  street3: string | null
  city: string
  state: string
  postal_code: string
  tax_id: string | null
}

export interface ShipmentFormData {
  shipmentRequestID: number
  shipment_scope: string
  shipment_scope_type: string

  // Basic shipment info
  service_options: string
  urgent_reason: string
  request_status: string
  remark: string
  topic: string
  po_number: string
  other_topic: string
  due_date: string
  sales_person: string
  po_date: string
  
  // Ship to and Ship from as nested objects
  ship_to: ShippingAddress
  ship_from: ShippingAddress
  
  // Dynamic arrays
  parcels: Parcel[]
  rates: Rate[]
  
  // Pickup info
  pick_up_status: boolean
  pick_up_date: string
  pick_up_start_time: string
  pick_up_end_time: string
  pick_up_instructions: string
  
  // Insurance
  insurance_enabled: boolean
  insurance_insured_value_amount: number
  insurance_insured_value_currency: string
  
  // Customs
  customs_purpose: string
  customs_terms_of_trade: string

  created_user_id: string;
  created_user_name: string;
  created_user_mail: string;
  created_date_time: string;

  approver_user_id: string | null;
  approver_user_name: string;
  approver_user_mail: string | null;
  approver_approved_date_time: string | null;
  approver_rejected_date_time: string | null;
}

export interface FormSectionProps {
  register: any
  errors: any
  control?: any
  setValue?: any
}

export interface ParcelItemsProps {
  parcelIndex: number
  control: any
  register: any
  errors: any
}

export interface ShipmentRequestsResponse {
  shipment_requests_count: number;
  shipment_requests: ShipmentFormData[];
  shipment_requests_desc: ShipmentFormData[];
}