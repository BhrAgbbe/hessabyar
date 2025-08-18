import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import ProformaInvoicePage from '../../src/features/invoices/ProformaInvoicePage';

export default function ProformaInvoice() {
  return (
    <MainLayout>
      <ProformaInvoicePage />
    </MainLayout>
  );
}
