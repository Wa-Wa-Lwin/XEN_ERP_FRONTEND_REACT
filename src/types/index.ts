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

// Shipment Request Types
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
  insurance_enabled: boolean | null;
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
}

export interface ShipmentRequestsResponse {
  shipment_requests_count: number;
  shipment_requests: ShipmentRequest[];
}
