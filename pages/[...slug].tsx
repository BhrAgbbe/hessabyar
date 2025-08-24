import React from 'react';


import DashboardPage from '../src/features/dashboard/DashboardPage';
import UserManagementPage from '../src/features/users/UserManagementPage';
import CompanyInfoPage from '../src/features/company/CompanyInfoPage';
import CompanyAccountPage from '../src/features/accounts/CompanyAccountPage';
import CustomerManagementPage from '../src/features/customers/CustomerManagementPage';
import BasicDataPage from '../src/features/basic-data/BasicDataPage';
import ProductsPage from '../src/features/products/ProductsPage';
import SalesInvoicePage from '../src/features/invoices/SalesInvoicePage';
import PurchaseInvoicePage from '../src/features/invoices/PurchaseInvoicePage';
import ProformaInvoicePage from '../src/features/invoices/ProformaInvoicePage';
import SalesReturnPage from '../src/features/invoices/SalesReturnPage';
import InventoryPage from '../src/features/inventory/InventoryPage';
import StockTakingPage from '../src/features/inventory/StockTakingPage';
import WastagePage from '../src/features/inventory/WastagePage';
import CheckManagementPage from '../src/features/financials/CheckManagementPage';
import CustomerAccountPage from '../src/features/financials/CustomerAccountPage';
import CustomerListPage from '../src/features/reports/CustomerListPage';
import SupplierListPage from '../src/features/reports/SupplierListPage';
import CustomerLedgerPage from '../src/features/reports/CustomerLedgerPage';
import CustomerBalancesPage from '../src/features/reports/CustomerBalancesPage';
import CheckListPage from '../src/features/reports/CheckListPage';
import IssuedCheckListPage from '../src/features/reports/IssuedCheckListPage';
import CashFlowPage from '../src/features/reports/CashFlowPage';
import SettingsPage from '../src/features/settings/SettingsPage';
import ThemeSettingsPage from '../src/features/settings/ThemeSettingsPage';
import DataManagementPage from '../src/features/settings/DataManagementPage';
import BackupPage from '../src/features/settings/BackupPage';
import ChangePasswordPage from '../src/features/settings/ChangePasswordPage';
import LoginPage from '../src/features/auth/LoginPage';

const routeMap: Record<string, React.ComponentType<any>> = {
  '/': DashboardPage,
  '/users': UserManagementPage,
  '/company': CompanyInfoPage,
  '/accounts': CompanyAccountPage,
  '/customers': CustomerManagementPage,
  '/basic-data': BasicDataPage,
  '/products': ProductsPage,
  '/invoices/sale': SalesInvoicePage,
  '/invoices/purchase': PurchaseInvoicePage,
  '/invoices/proforma': ProformaInvoicePage,
  '/invoices/return': SalesReturnPage,
  '/inventory/stock': InventoryPage,
  '/inventory/stock-taking': StockTakingPage,
  '/inventory/wastage': WastagePage,
  '/financials/checks': CheckManagementPage,
  '/reports/sales-ledger': (props: any) => <CustomerAccountPage {...props} accountType="sales" />,
  '/reports/purchase-ledger': (props: any) => <CustomerAccountPage {...props} accountType="purchases" />,
  '/reports/sales-customers': CustomerListPage,
  '/reports/purchase-customers': SupplierListPage,
  '/reports/customer-ledger': CustomerLedgerPage,
  '/reports/customer-balances': CustomerBalancesPage,
  '/reports/received-checks': CheckListPage,
  '/reports/issued-checks': IssuedCheckListPage,
  '/reports/cash-flow': CashFlowPage,
  '/features/settings': SettingsPage,
  '/features/theme': ThemeSettingsPage,
  '/features/data': DataManagementPage,
  '/features/backup': BackupPage,
  '/features/change-password': ChangePasswordPage,
};

export default function DummyPage() {
  return null;
}
