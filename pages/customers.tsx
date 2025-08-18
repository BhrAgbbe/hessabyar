import React from 'react';
import { MainLayout } from '../src/components/layout/MainLayout';
import CustomerManagementPage from '../src/features/customers/CustomerManagementPage';

export default function Customers() {
  return (
    <MainLayout>
      <CustomerManagementPage />
    </MainLayout>
  );
}
