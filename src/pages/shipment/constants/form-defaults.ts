import type { ShipmentFormData } from '../types/shipment-form.types'

// Calculate default pickup date based on current time
export const getDefaultPickupValues = () => {
  const now = new Date()
  const currentHour = now.getHours()
  const isBeforeCutoff = currentHour < 10 // Before 10 AM
  const todayDate = new Date().toISOString().split('T')[0]

  const defaultPickupDate = isBeforeCutoff
    ? todayDate // Today if before 10 AM
    : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow if after 10 AM

  // Start time depends on pickup date: 12 PM for today, 9 AM for tomorrow+
  const defaultStartTime = defaultPickupDate === todayDate ? '12:00' : '09:00'

  return {
    pickupDate: defaultPickupDate,
    startTime: defaultStartTime,
    endTime: '17:00',   // 5 PM
    minDate: defaultPickupDate // Minimum selectable date
  }
}

const defaultPickupValues = getDefaultPickupValues()

export const DEFAULT_FORM_VALUES: ShipmentFormData = {
  shipmentRequestID: 0,
  shipment_scope: '',
  shipment_scope_type: '',
  request_status: '',
  service_options: 'Normal',
  urgent_reason: '',
  remark: '',
  topic: '',
  po_number: '',
  other_topic: '',
  due_date: defaultPickupValues.pickupDate, // Same as pickup date
  sales_person: '',
  po_date: new Date().toISOString().split('T')[0], // today
  send_to: 'Approver',

  // Nested ship_from and ship_to objects
  ship_from: {
    country: 'TH',
    contact_name: '',
    phone: '',
    fax: null,
    email: '',
    company_name: 'Xenoptics Limited',
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
  ship_from_country: 'TH',
  ship_from_contact_name: '',
  ship_from_phone: '',
  ship_from_email: '',
  ship_from_company_name: 'Xenoptics Limited',
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
  customs_purpose: 'sample',
  customs_terms_of_trade: 'exw',
  
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
      price_currency: 'THB',
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
    total_charge_currency: '',
    chosen: false,
    unique_id:'',
    detailed_charges: ''
  }],
  pick_up_status: false,
  pick_up_date: defaultPickupValues.pickupDate,
  pick_up_start_time: defaultPickupValues.startTime,
  pick_up_end_time: defaultPickupValues.endTime,
  pick_up_instructions: '',
  insurance_enabled: false,
  insurance_insured_value_amount: 0,
  insurance_insured_value_currency: '',

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
    price_currency: 'THB',
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
  price_currency: 'THB',
  price_amount: 0,
  item_id: '',
  origin_country: '',
  weight_unit: 'kg',
  weight_value: 0,
  sku: '',
  hs_code: '',
  return_reason: ''
}

// export const TOPIC_OPTIONS = [
//   { key: 'for_sales', value: 'for_sales', label: 'For Sales' },
//   { key: 'sample', value: 'sample', label: 'Sample' },
//   { key: 'demonstration', value: 'demonstration', label: 'Demonstration' },
//   { key: 'consign_parts', value: 'consign_parts', label: 'Consign Parts' },
//   { key: 'return', value: 'return', label: 'Return' },
//   { key: 'replacement', value: 'replacement', label: 'Replacement' },
//   { key: 'others', value: 'others', label: 'Others' }
// ]
export const TOPIC_OPTIONS = [
  { key: 'For Sales', value: 'For Sales', label: 'For Sales' },
  { key: 'Sample', value: 'Sample', label: 'Sample' },
  { key: 'Demonstration', value: 'Demonstration', label: 'Demonstration' },
  { key: 'Consign Parts', value: 'Consign Parts', label: 'Consign Parts' },
  { key: 'Return', value: 'Return', label: 'Return' },
  { key: 'Replacement', value: 'Replacement', label: 'Replacement' },
  { key: 'Others', value: 'Others', label: 'Others' }
];


export const SERVICE_OPTIONS = [
  { key: 'Normal', value: 'Normal', label: 'Normal' },
  { key: 'Urgent', value: 'Urgent', label: 'Urgent' },
]

// export const SALES_PERSON_OPTIONS = [
//   { key: 'personA', value: 'Person A', label: 'Person A' },
//   { key: 'personB', value: 'Person B', label: 'Person B' },
//   { key: 'personC', value: 'Person C', label: 'Person C' }
// ]
export const SALES_PERSON_OPTIONS = [
  { key: 'Solomon', value: 'Solomon', label: 'Solomon' },
  { key: 'Nati', value: 'Nati', label: 'Nati' },
  { key: 'Allen', value: 'Allen', label: 'Allen' }
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
  { key: 'merchandise', value: 'merchandise', label: 'Merchandise' },
  { key: 'gift', value: 'gift', label: 'Gift' },
  { key: 'sample', value: 'sample', label: 'Sample' },
  { key: 'return', value: 'return', label: 'Return' },
  { key: 'repair', value: 'repair', label: 'Repair' },
  { key: 'personal', value: 'personal', label: 'Personal' }
];

export const INCOTERMS = [
  { key: "dat", value: "DAT (Delivered at Terminal)" },
  { key: "ddu", value: "DDU (Delivered Duty Unpaid)" },
  { key: "ddp", value: "DDP (Delivered Duty Paid)" },
  { key: "dap", value: "DAP (Delivered at Place)" },
  { key: "exw", value: "EXW (Ex Works)" },
  { key: "fca", value: "FCA (Free Carrier)" },
  { key: "fob", value: "FOB (Free on Board)" },
  { key: "cip", value: "CIP (Carriage and Insurance Paid to)" },
  { key: "cif", value: "CIF (Cost, Insurance and Freight)" },
  { key: "cpt", value: "CPT (Carriage Paid To)" },
  { key: "cfr", value: "CFR (Cost and Freight)" },
  { key: "dpu", value: "DPU (Delivered at Place Unloaded)" }
];
