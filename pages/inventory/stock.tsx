import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import InventoryPage from '../../src/features/inventory/InventoryPage';

export default function InventoryStock() {
  return (
    <MainLayout>
      <InventoryPage />
    </MainLayout>
  );
}
