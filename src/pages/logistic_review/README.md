# Logistic Review Feature

This feature allows users with logistic access to review and update specific fields of shipment requests that are under review.

## Components

### LogisticReviewPage
- Main page component for the logistic review interface
- Handles authentication and access control
- Fetches shipment data and displays summary information
- Route: `/shipment/logistic-review/:id`

### LogisticReviewForm
- Form component for updating shipment fields
- Allows editing of:
  - `customs_terms_of_trade` (Incoterms)
  - `customs_purpose`
  - `hs_code` (per parcel item)
  - `origin_country` (per parcel item)

### LogisticReviewButton
- Button component for the shipment table
- Only visible to users with logistic access
- Only shown for shipments with status "under_review"
- Navigates to the logistic review page

## Integration

### In Shipment Table Component:
```tsx
import { LogisticReviewButton } from '@pages/logistic_review'

// In your table row rendering:
<LogisticReviewButton
  shipmentId={shipment.shipmentRequestID}
  requestStatus={shipment.request_status}
/>
```

### Access Control
The feature uses role-based access control:
- Only users with `role === 'logistic'` or `role === 'admin'` can access
- Non-authorized users are redirected to `/shipment`

### API Endpoints Required
The feature expects these API endpoints:
- `GET /shipments/:id` - Fetch shipment data for review
- `PUT /shipments/:id/logistic-review` - Update shipment with review data

## Usage Flow
1. User sees "Update" button in shipment table (only for under review status)
2. Clicks button to navigate to logistic review page
3. Reviews shipment information and updates required fields
4. Submits form to update the shipment
5. Returns to shipment table

## Security
- Route protection through authentication check
- Role-based access control
- Server-side validation should be implemented for the update endpoint