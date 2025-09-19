export interface LogisticReviewUpdateData {
  customs_terms_of_trade: string
  customs_purpose: string
  hscode: string
  origin_country: string
}

export interface LogisticReviewFormData extends LogisticReviewUpdateData {
  shipmentRequestID: number
}

export interface ShipmentForReview {
  shipmentRequestID: number
  po_number: string
  po_date: string
  send_to: string
  request_status: string
  customs_terms_of_trade: string
  customs_purpose: string
  // Include any other fields needed for display
  parcels?: Array<{
    parcel_items?: Array<{
      hscode: string
      origin_country: string
      description: string
      quantity: number
    }>
  }>
}