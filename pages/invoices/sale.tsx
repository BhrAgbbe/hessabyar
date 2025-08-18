import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import SalesInvoicePage from '../../src/features/invoices/SalesInvoicePage';

export default function SalesInvoice() {
  return (
    <MainLayout>
      <SalesInvoicePage />
    </MainLayout>
  );
}
