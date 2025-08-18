import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import CheckManagementPage from '../../src/features/financials/CheckManagementPage';

export default function FinancialsChecks() {
  return (
    <MainLayout>
      <CheckManagementPage />
    </MainLayout>
  );
}
