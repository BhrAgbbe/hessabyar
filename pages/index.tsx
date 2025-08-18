import React from 'react';
import DashboardPage from '../src/features/dashboard/DashboardPage';
import { MainLayout } from '../src/components/layout/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <DashboardPage />
    </MainLayout>
  );
}
