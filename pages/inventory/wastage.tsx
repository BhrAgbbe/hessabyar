import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import WastagePage from '../../src/features/inventory/WastagePage';

export default function Wastage() {
  return (
    <MainLayout>
      <WastagePage />
    </MainLayout>
  );
}
