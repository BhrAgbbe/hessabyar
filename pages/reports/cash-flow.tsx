import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import CashFlowPage from '../../src/features/reports/CashFlowPage';

export default function ReportsCashFlow() {
  return (
    <MainLayout>
      <CashFlowPage />
    </MainLayout>
  );
}
