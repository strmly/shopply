import React from 'react';
import { ProductListPage } from './products';

// Re-export ProductListPage as ProductManagement for backward compatibility
export function ProductManagement({ location }) {
  return <ProductListPage location={location} />;
}

