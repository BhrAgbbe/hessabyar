import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import SalesReturnPage from '../../src/features/invoices/SalesReturnPage';

export default function SalesReturn() {
  return (
    <MainLayout>
      <SalesReturnPage />
    </MainLayout>
  );
}
