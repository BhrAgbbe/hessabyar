import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import CustomerLedgerPage from '../../src/features/reports/CustomerLedgerPage';

export default function ReportsCustomerLedger() {
  return (
    <MainLayout>
      <CustomerLedgerPage />
    </MainLayout>
  );
}
