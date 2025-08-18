import React from 'react';
import { MainLayout } from '../src/components/layout/MainLayout';
import CompanyAccountPage from '../src/features/accounts/CompanyAccountPage';

export default function AccountsPage() {
  return (
    <MainLayout>
      <CompanyAccountPage />
    </MainLayout>
  );
}
