import React from 'react';
import { MainLayout } from '../src/components/layout/MainLayout';
import UserManagementPage from '../src/features/users/UserManagementPage';

export default function UsersPage() {
  return (
    <MainLayout>
      <UserManagementPage />
    </MainLayout>
  );
}
