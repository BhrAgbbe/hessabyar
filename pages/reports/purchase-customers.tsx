import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import SupplierListPage from '../../src/features/reports/SupplierListPage';

export default function ReportsPurchaseCustomers() {
  return (
    <MainLayout>
      <SupplierListPage />
    </MainLayout>
  );
}
