import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import CustomerBalancesPage from '../../src/features/reports/CustomerBalancesPage';

export default function ReportsCustomerBalances() {
  return (
    <MainLayout>
      <CustomerBalancesPage />
    </MainLayout>
  );
}
