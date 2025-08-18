import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import DataManagementPage from '../../src/features/settings/DataManagementPage';

export default function FeaturesData() {
  return (
    <MainLayout>
      <DataManagementPage />
    </MainLayout>
  );
}
