import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import StockTakingPage from '../../src/features/inventory/StockTakingPage';

export default function StockTaking() {
  return (
    <MainLayout>
      <StockTakingPage />
    </MainLayout>
  );
}
