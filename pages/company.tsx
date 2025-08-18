import React from 'react';
import { MainLayout } from '../src/components/layout/MainLayout';
import CompanyInfoPage from '../src/features/company/CompanyInfoPage';

export default function Company() {
  return (
    <MainLayout>
      <CompanyInfoPage />
    </MainLayout>
  );
}
