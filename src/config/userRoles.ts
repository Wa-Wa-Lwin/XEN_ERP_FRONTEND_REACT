/**
 * User role configuration
 * Define users with restricted access to specific areas
 */

export const WAREHOUSE_ONLY_USERS = [
  'susu@xenoptics.com',
  'warehouse@xenoptics.com'
];

/**
 * Check if a user email is a warehouse-only user
 */
export const isWarehouseOnlyUser = (email?: string): boolean => {
  if (!email) return false;
  return WAREHOUSE_ONLY_USERS.includes(email.toLowerCase());
};
