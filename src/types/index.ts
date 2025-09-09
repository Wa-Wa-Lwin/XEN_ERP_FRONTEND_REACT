// Common Types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  status: number;
}

// export interface PaginationParams {
//   page: number;
//   limit: number;
//   sortBy?: string;
//   sortOrder?: 'asc' | 'desc';
// }

// export interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// User Types
// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   // role: UserRole;
//   avatar?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export enum UserRole {
//   ADMIN = 'admin',
//   MANAGER = 'manager',
//   USER = 'user',
// }

// // Shipment Types
// export interface Shipment {
//   id: string;
//   trackingNumber: string;
//   // status: ShipmentStatus;
//   origin: Address;
//   destination: Address;
//   weight: number;
//   dimensions: Dimensions;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Address {
//   street: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
// }

// export interface Dimensions {
//   length: number;
//   width: number;
//   height: number;
//   unit: 'cm' | 'in';
// }

// Shipment Request Supporting Types
export interface ShipmentRequestHistory {
  shipmentRequestHistoryID: number;
  shipment_request_created_date_time: string;
  user_id: string;
  user_name: string;
  user_role: string;
  status: string;
  remark: string | null;
  history_count: string;
  shipment_request_id: string;
  history_record_date_time: string;
}

export interface ParcelItem {
  parcelItemID: number;
  parcel_id: string;
  description: string;
  quantity: string;
  price_currency: string;
  price_amount: string;
  item_id: string;
  origin_country: string;
  weight_unit: string;
  weight_value: string;
  sku: string;
  hs_code: string;
  return_reason: string;
}

export interface Parcel {
  parcelID: number;
  shipment_request_id: string;
  box_type: string;
  width: string;
  height: string;
  depth: string;
  dimension_unit: string;
  weight_value: string;
  weight_unit: string;
  description: string;
  box_type_name: string;
  net_weight_value: string;
  items: ParcelItem[];
}

export interface ShippingAddress {
  shippingToAddressID?: number;
  shippingFromAddressID?: number;
  shipment_request_id: string;
  country: string;
  contact_name: string;
  phone: string;
  fax: string | null;
  email: string;
  company_name: string;
  company_url: string | null;
  street1: string;
  street2: string;
  street3: string | null;
  city: string;
  state: string;
  postal_code: string;
  tax_id: string | null;
  created_at: string | null;
  created_by_user_name: string | null;
}

export interface ShippingRate {
  rateID: number;
  shipment_request_id: string;
  shipper_account_id: string;
  shipper_account_slug: string;
  shipper_account_description: string;
  service_type: string;
  service_name: string;
  pickup_deadline: string | null;
  booking_cut_off: string | null;
  delivery_date: string;
  transit_time: string;
  error_message: string | null;
  info_message: string | null;
  charge_weight_value: string;
  charge_weight_unit: string;
  total_charge_amount: string;
  total_charge_currency: string;
  chosen: string;
  detailed_charges: string;
}

// Main Shipment Request Type
export interface ShipmentRequest {
  shipmentRequestID: number;
  service_options: string | null;
  rate_calculate_status: string | null;
  request_status: string;
  created_user_id: string;
  created_user_name: string;
  created_date_time: string;
  logistic_user_id: string | null;
  logistic_user_name: string | null;
  logistic_approved_date_time: string | null;
  remark: string | null;
  history_count: string;
  topic: string;
  due_date: string;
  pick_up_status: string | null;
  pick_up_date: string | null;
  pick_up_start_time: string | null;
  pick_up_end_time: string | null;
  picon_numbers: string | null;
  pick_up_created_id: string | null;
  shipment_scope: string | null;
  active: string | null;
  urgent_reason: string | null;
  po_number: string | null;
  other_topic: string | null;
  detailed_charges: string | null;
  created_user_mail: string;
  logistic_user_mail: string | null;
  customs_purpose: string;
  customs_terms_of_trade: string;
  label_status: string | null;
  tracking_numbers: string | null;
  error_msg: string | null;
  insurance_enabled: string | null;
  insurance_insured_value_amount: number | null;
  insurance_insured_value_currency: string | null;
  files_label_url: string | null;
  files_invoice_url: string | null;
  files_packing_slip: string | null;
  logistic_rejected_date_time: string | null;
  approver_user_id: string | null;
  approver_user_name: string | null;
  approver_user_mail: string | null;
  approver_approved_date_time: string | null;
  approver_rejected_date_time: string | null;
  label_id: string | null;
  pick_up_instructions: string | null;
  pick_up_created_status: string | null;
  pickup_confirmation_numbers: string | null;
  invoice_no: string | null;
  invoice_date: string | null;
  invoice_due_date: string | null;
  sales_person: string | null;
  shipment_date: string | null;
  po_date: string | null;
  shipment_scope_type: string | null;
  shipment_scope_edited: string;
  // Nested objects (optional for backward compatibility)
  shipment_request_histories?: ShipmentRequestHistory[];
  parcels?: Parcel[];
  ship_to?: ShippingAddress;
  ship_from?: ShippingAddress;
  rates?: ShippingRate[];
  invoice_datas?: any[];
}

export interface ShipmentRequestsResponse {
  shipment_requests_count: number;
  shipment_requests: ShipmentRequest[];
  shipment_requests_desc: ShipmentRequest[];
}
