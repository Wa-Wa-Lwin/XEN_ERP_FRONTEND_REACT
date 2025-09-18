import type { ShipmentFormData } from '../types/shipment-form.types'

export const DEFAULT_FORM_VALUES: ShipmentFormData = {
  shipmentRequestID: 0,
  shipment_scope: '',
  shipment_scope_type: '',
  request_status: 'draft',
  service_options: '',
  urgent_reason: '',
  remark: '',
  topic: '',
  po_number: '',
  other_topic: '',
  due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // tomorrow
  sales_person: '',
  po_date: new Date().toISOString().split('T')[0], // today
  send_to: 'Approver',

  // Nested ship_from and ship_to objects
  ship_from: {
    country: '',
    contact_name: '',
    phone: '',
    fax: null,
    email: '',
    company_name: '',
    company_url: null,
    street1: '',
    street2: null,
    street3: null,
    city: '',
    state: '',
    postal_code: '',
    tax_id: null
  },
  ship_to: {
    country: '',
    contact_name: '',
    phone: '',
    fax: null,
    email: '',
    company_name: '',
    company_url: null,
    street1: '',
    street2: null,
    street3: null,
    city: '',
    state: '',
    postal_code: '',
    tax_id: null
  },

  // Flattened ship_from properties
  ship_from_country: '',
  ship_from_contact_name: '',
  ship_from_phone: '',
  ship_from_email: '',
  ship_from_company_name: '',
  ship_from_street1: '',
  ship_from_street2: '',
  ship_from_street3: '',
  ship_from_city: '',
  ship_from_state: '',
  ship_from_postal_code: '',

  // Flattened ship_to properties
  ship_to_country: '',
  ship_to_contact_name: '',
  ship_to_phone: '',
  ship_to_email: '',
  ship_to_company_name: '',
  ship_to_street1: '',
  ship_to_street2: '',
  ship_to_street3: '',
  ship_to_city: '',
  ship_to_state: '',
  ship_to_postal_code: '',
  
  // Customs
  customs_purpose: '',
  customs_terms_of_trade: '',
  
  parcels: [{
    box_type: '',
    box_type_name: '',
    width: 0,
    height: 0,
    depth: 0,
    dimension_unit: 'cm',
    weight_value: 0,
    net_weight_value: 0,
    parcel_weight_value: 0,
    weight_unit: 'kg',
    description: '',
    parcel_items: [{
      description: '',
      quantity: 1,
      price_currency: 'USD',
      price_amount: 0,
      item_id: '',
      origin_country: '',
      weight_unit: 'kg',
      weight_value: 0,
      sku: '',
      hs_code: '',
      return_reason: ''
    }]
  }],
  rates: [{
    shipper_account_id: '',
    shipper_account_slug: '',
    shipper_account_description: '',
    service_type: '',
    service_name: '',
    pickup_deadline: new Date().toISOString().split('T')[0],
    booking_cut_off: new Date().toISOString().split('T')[0],
    delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // week from now
    transit_time: '',
    error_message: '',
    info_message: '',
    charge_weight_value: 0,
    charge_weight_unit: 'kg',
    total_charge_amount: 0,
    total_charge_currency: 'USD',
    chosen: false,
    detailed_charges: ''
  }],
  pick_up_status: false,
  pick_up_date: new Date().toISOString().split('T')[0],
  pick_up_start_time: '09:00',
  pick_up_end_time: '17:00',
  pick_up_instructions: '',
  insurance_enabled: false,
  insurance_insured_value_amount: 0,
  insurance_insured_value_currency: 'USD',

  created_user_id: '',
  created_user_name: '',
  created_user_mail: '',
  created_date_time: '',

  approver_user_id: null,
  approver_user_name: '',
  approver_user_mail: null,
  approver_approved_date_time: null,
  approver_rejected_date_time: null
}

export const DEFAULT_PARCEL = {
  box_type: '',
  box_type_name: '',
  width: 0,
  height: 0,
  depth: 0,
  dimension_unit: 'cm',
  weight_value: 0,
  net_weight_value: 0,
  parcel_weight_value: 0,
  weight_unit: 'kg',
  description: '',
  parcel_items: [{
    description: '',
    quantity: 1,
    price_currency: 'USD',
    price_amount: 0,
    item_id: '',
    origin_country: '',
    weight_unit: 'kg',
    weight_value: 0,
    sku: '',
    hs_code: '',
    return_reason: ''
  }]
}

export const DEFAULT_PARCEL_ITEM = {
  description: '',
  quantity: 1,
  price_currency: 'USD',
  price_amount: 0,
  item_id: '',
  origin_country: '',
  weight_unit: 'kg',
  weight_value: 0,
  sku: '',
  hs_code: '',
  return_reason: ''
}

export const TOPIC_OPTIONS = [
  { key: 'for_sales', value: 'for_sales', label: 'For Sales' },
  { key: 'sample', value: 'sample', label: 'Sample' },
  { key: 'demonstration', value: 'demonstration', label: 'Demonstration' },
  { key: 'consign_parts', value: 'consign_parts', label: 'Consign Parts' },
  { key: 'return', value: 'return', label: 'Return' },
  { key: 'replacement', value: 'replacement', label: 'Replacement' },
  { key: 'others', value: 'others', label: 'Others' }
]

export const SERVICE_OPTIONS = [
  { key: 'Normal', value: 'Normal', label: 'Normal' },
  { key: 'Urgent', value: 'Urgent', label: 'Urgent' },
]

export const SALES_PERSON_OPTIONS = [
  { key: 'personA', value: 'Person A', label: 'Person A' },
  { key: 'personB', value: 'Person B', label: 'Person B' },
  { key: 'personC', value: 'Person C', label: 'Person C' }
]

export const DIMENSION_UNITS = [
  { key: 'cm', value: 'cm', label: 'cm' },
  { key: 'in', value: 'in', label: 'in' },
  { key: 'mm', value: 'mm', label: 'mm' }
]

export const WEIGHT_UNITS = [
  { key: 'kg', value: 'kg', label: 'kg' },
  { key: 'lb', value: 'lb', label: 'lb' },
  { key: 'g', value: 'g', label: 'g' }
]

export const CUSTOM_PURPOSES = [
  { key: 'MERCHANDISE', value: 'merchandise', label: 'Merchandise' },
  { key: 'GIFT', value: 'gift', label: 'Gift' },
  { key: 'SAMPLE', value: 'sample', label: 'Sample' },
  { key: 'RETURN', value: 'return', label: 'Return' },
  { key: 'REPAIR', value: 'repair', label: 'Repair' },
  { key: 'PERSONAL', value: 'personal', label: 'Personal' }
];

export const INCOTERMS = [
  { key: "DAT", value: "DAT (Delivered at Terminal)" },
  { key: "DDU", value: "DDU (Delivered Duty Unpaid)" },
  { key: "DDP", value: "DDP (Delivered Duty Paid)" },
  { key: "DAP", value: "DAP (Delivered at Place)" },
  { key: "EXW", value: "EXW (Ex Works)" },
  { key: "FCA", value: "FCA (Free Carrier)" },
  { key: "FOB", value: "FOB (Free on Board)" },
  { key: "CIP", value: "CIP (Carriage and Insurance Paid to)" },
  { key: "CIF", value: "CIF (Cost, Insurance and Freight)" },
  { key: "CPT", value: "CPT (Carriage Paid To)" },
  { key: "CFR", value: "CFR (Cost and Freight)" },
  { key: "DPU", value: "DPU (Delivered at Place Unloaded)" }
];
