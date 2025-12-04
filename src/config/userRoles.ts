/**
 * User role configuration
 * Define users with restricted access to specific areas
 */

export const WAREHOUSE_ONLY_USERS = [
  'warehouse@xenoptics.com',
  'orrawan@xenoptics.com',
  'kitthanat@xenoptics.com',
];

/**
 * Check if a user email is a warehouse-only user
 */
export const isWarehouseOnlyUser = (email?: string): boolean => {
  if (!email) return false;
  return WAREHOUSE_ONLY_USERS.includes(email.toLowerCase());
};
