export interface DetailRowProps {
  label: string
  value: React.ReactNode | null | undefined
}

export interface ShipmentData {
  send_to?: string
  due_date?: string 
  shipmentRequestID: number
  service_options: string
  request_status: string
  created_user_name: string
  created_user_mail: string
  created_date_time: string
  topic: string
  po_number: string
  po_date: string
  sales_person?: string
  other_topic?: string
  approver_user_name: string
  approver_user_mail: string
  approver_approved_date_time?: string
  approver_rejected_date_time?: string
  remark?: string
  shipment_scope_type: string
  customs_purpose: string
  customs_terms_of_trade: string
  urgent_reason?: string
  label_id?: string
  label_status?: string
  files_label_url?: string
  tracking_numbers?: string
  pick_up_date?: string
  pick_up_created_status?: string
  pickup_confirmation_numbers?: string
  invoice_no?: string
  files_invoice_url?: string
  invoice_date?: string
  invoice_due_date?: string
  files_packing_slip?: string
  error_msg?: string
  ship_from?: {
    company_name: string
    contact_name: string
    street1: string
    city: string
    country: string
    phone: string
    email: string
  }
  ship_to?: {
    company_name: string
    contact_name: string
    street1: string
    city: string
    country: string
    phone: string
    email: string
  }
  rates?: Array<{
    chosen: number
    shipper_account_description: string
    service_name: string
    transit_time: string
    total_charge_amount: string
    total_charge_currency: string
  }>
  parcels?: Array<{
    description: string
    box_type: string
    width: string
    height: string
    depth: string
    dimension_unit: string
    weight_value: string
    weight_unit: string
    items?: Array<{
      description: string
      quantity: string
      price_currency: string
      price_amount: string
      weight_value: string
      weight_unit: string
      sku: string
      hs_code: string
      origin_country: string
      parcelItemID: string
    }>
  }>
  shipment_request_histories?: Array<{
    shipmentRequestHistoryID: number
    user_name: string
    user_role: string
    status: string
    remark?: string
    history_record_date_time?: string
    shipment_request_created_date_time?: string
  }>
}