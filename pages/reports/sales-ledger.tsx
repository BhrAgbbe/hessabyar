import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import CustomerAccountPage from '../../src/features/financials/CustomerAccountPage';

export default function ReportsSalesLedger() {
  return (
    <MainLayout>
      <CustomerAccountPage accountType="sales" />
    </MainLayout>
  );
}
