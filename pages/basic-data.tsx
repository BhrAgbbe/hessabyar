import React from 'react';
import { MainLayout } from '../src/components/layout/MainLayout';
import BasicDataPage from '../src/features/basic-data/BasicDataPage';

export default function BasicData() {
  return (
    <MainLayout>
      <BasicDataPage />
    </MainLayout>
  );
}
