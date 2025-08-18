import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import PurchaseInvoicePage from '../../src/features/invoices/PurchaseInvoicePage';

export default function PurchaseInvoice() {
  return (
    <MainLayout>
      <PurchaseInvoicePage />
    </MainLayout>
  );
}
