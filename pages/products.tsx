import React from 'react';
import { MainLayout } from '../src/components/layout/MainLayout';
import ProductsPage from '../src/features/products/ProductsPage';

export default function Products() {
  return (
    <MainLayout>
      <ProductsPage />
    </MainLayout>
  );
}
