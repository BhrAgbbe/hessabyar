import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import CustomerListPage from '../../src/features/reports/CustomerListPage';

export default function ReportsSalesCustomers() {
  return (
    <MainLayout>
      <CustomerListPage />
    </MainLayout>
  );
}
