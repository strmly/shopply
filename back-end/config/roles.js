export const ROLES = {
  GUEST: 'guest',
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
};

export const PERMISSIONS = {
  // Browsing
  PRODUCTS_READ: 'products:read',
  // Product management
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  // Cart & checkout
  CART_MANAGE: 'cart:manage',
  CHECKOUT: 'checkout',
  // Orders
  ORDERS_READ_OWN: 'orders:read:own',
  ORDERS_READ_ALL: 'orders:read:all',
  ORDERS_UPDATE_STATUS: 'orders:update:status',
  ORDERS_CANCEL_OWN: 'orders:cancel:own',
  // Profile
  PROFILE_READ_OWN: 'profile:read:own',
  PROFILE_UPDATE_OWN: 'profile:update:own',
  PROFILE_READ_ALL: 'profile:read:all',
  // Notifications
  NOTIFICATIONS_OWN: 'notifications:own',
  // Addresses & payments
  ADDRESSES_MANAGE: 'addresses:manage',
  PAYMENTS_MANAGE: 'payments:manage',
  // Reviews & returns
  REVIEWS_CREATE: 'reviews:create',
  RETURNS_CREATE: 'returns:create',
  // Vouchers
  VOUCHERS_USE: 'vouchers:use',
  // Seller
  SELLER_DASHBOARD: 'seller:dashboard',
  SELLER_PRODUCTS: 'seller:products',
  SELLER_ORDERS: 'seller:orders',
  SELLER_ANALYTICS: 'seller:analytics',
  SELLER_PROMOTIONS: 'seller:promotions',
  SELLER_STORE: 'seller:store',
  // Admin
  ADMIN_USERS: 'admin:users',
  ADMIN_PLATFORM: 'admin:platform',
  ADMIN_ALL_ORDERS: 'admin:orders',
  ADMIN_ALL_SELLERS: 'admin:sellers',
};

const BUYER_PERMISSIONS = [
  PERMISSIONS.PRODUCTS_READ,
  PERMISSIONS.CART_MANAGE,
  PERMISSIONS.CHECKOUT,
  PERMISSIONS.ORDERS_READ_OWN,
  PERMISSIONS.ORDERS_CANCEL_OWN,
  PERMISSIONS.PROFILE_READ_OWN,
  PERMISSIONS.PROFILE_UPDATE_OWN,
  PERMISSIONS.NOTIFICATIONS_OWN,
  PERMISSIONS.ADDRESSES_MANAGE,
  PERMISSIONS.PAYMENTS_MANAGE,
  PERMISSIONS.REVIEWS_CREATE,
  PERMISSIONS.RETURNS_CREATE,
  PERMISSIONS.VOUCHERS_USE,
];

const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: [PERMISSIONS.PRODUCTS_READ],
  [ROLES.BUYER]: BUYER_PERMISSIONS,
  [ROLES.SELLER]: [
    ...BUYER_PERMISSIONS,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.ORDERS_READ_ALL,
    PERMISSIONS.ORDERS_UPDATE_STATUS,
    PERMISSIONS.SELLER_DASHBOARD,
    PERMISSIONS.SELLER_PRODUCTS,
    PERMISSIONS.SELLER_ORDERS,
    PERMISSIONS.SELLER_ANALYTICS,
    PERMISSIONS.SELLER_PROMOTIONS,
    PERMISSIONS.SELLER_STORE,
  ],
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
};

export const ROLE_HIERARCHY = {
  [ROLES.GUEST]: 0,
  [ROLES.BUYER]: 1,
  [ROLES.SELLER]: 2,
  [ROLES.ADMIN]: 3,
};

export const can = (role, permission) => {
  const perms = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS[ROLES.GUEST];
  return perms.includes(permission);
};

export const hasMinimumRole = (userRole, requiredRole) =>
  (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);

export const getRolePermissions = (role) =>
  ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS[ROLES.GUEST];
