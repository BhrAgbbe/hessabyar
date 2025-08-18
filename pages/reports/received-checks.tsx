import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import CheckListPage from '../../src/features/reports/CheckListPage';

export default function ReportsReceivedChecks() {
  return (
    <MainLayout>
      <CheckListPage />
    </MainLayout>
  );
}
