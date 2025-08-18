import React from 'react';
import { MainLayout } from '../../src/components/layout/MainLayout';
import ThemeSettingsPage from '../../src/features/settings/ThemeSettingsPage';

export default function FeaturesTheme() {
  return (
    <MainLayout>
      <ThemeSettingsPage />
    </MainLayout>
  );
}
