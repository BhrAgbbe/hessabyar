import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import IssuedCheckListPage from '../../src/features/reports/IssuedCheckListPage';

export default function ReportsIssuedChecks() {
  return (
    <MainLayout>
      <IssuedCheckListPage />
    </MainLayout>
  );
}
