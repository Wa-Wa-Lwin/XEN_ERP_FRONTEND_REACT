# Warehouse Test User

A hardcoded test user has been implemented for warehouse-only access without requiring database setup.

## Test Credentials

- **Email**: `warehouse@xenoptics.com`
- **Password**: `warehouse12345`

## How It Works

The login logic checks for these specific credentials and bypasses the backend authentication API:

1. User enters `warehouse@xenoptics.com` and `warehouse12345`
2. Login form validates the email domain (@xenoptics.com)
3. Instead of calling the backend API, the app creates a mock user object
4. User is automatically logged in and redirected to `/warehouse`
5. User can only access the Warehouse page (all other routes are restricted)

## Implementation Details

### Login Logic
Location: `src/pages/login/Login.tsx` (lines 32-46)

The login handler checks for exact match of email and password before making API calls.

### Access Control
Location: `src/config/userRoles.ts`

The email `warehouse@xenoptics.com` is listed in `WAREHOUSE_ONLY_USERS` array, which:
- Filters sidebar items to show only Warehouse tab
- Redirects attempts to access other pages back to `/warehouse`
- Enforces warehouse-only navigation

## Security Notes

⚠️ **Important**: This is a test-only feature for development/demo purposes.

- The credentials are hardcoded in the frontend code
- No backend authentication occurs for this user
- In production, consider:
  - Removing this hardcoded login
  - Using environment variables to enable/disable test users
  - Implementing proper authentication even for test users

## Usage

1. Navigate to the login page
2. Enter email: `warehouse@xenoptics.com`
3. Enter password: `warehouse12345`
4. Click "Log In"
5. You'll be redirected to the Warehouse page
6. Only the Warehouse tab will be visible in the sidebar
7. A blue notification banner will display: "This is testing purpose for Warehouse Dashboard"

## User Experience

When logged in as the warehouse test user, you'll see:
- **Blue notification banner** (instead of the yellow warning shown to other users without database data)
- **Message**: "This is testing purpose for Warehouse Dashboard"
- **Icon**: Test tube icon indicating this is a test/demo account
- **Access**: Restricted to Warehouse page and Packing Slip view only

## Features Available

### Warehouse Dashboard
- View approved shipments with created labels
- Filter by "All" or "Upcoming" shipments
- Pagination controls
- View shipment details

### Actions
- **View Label**: Opens shipping label in new tab
- **View Packing Slip**: Navigate to frontend-generated packing slip page with print/download capability
- **Shipment Details**: Click any row to view detailed shipment information

## Allowed Routes for Warehouse Users

Warehouse-only users can access:
- `/warehouse` - Warehouse dashboard (main page)
- `/warehouse/:id` - Shipment detail view
- `/shipment/packing-slip/:id` - Packing slip view (can print/download as PDF)

All other routes will redirect to `/warehouse`
