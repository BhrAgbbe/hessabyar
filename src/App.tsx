import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type{ RootState } from './store/store';
import { MainLayout } from './components/layout/MainLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import UserManagementPage from './features/users/UserManagementPage';
import CompanyInfoPage from './features/company/CompanyInfoPage';
import CompanyAccountPage from './features/accounts/CompanyAccountPage';
import CustomerManagementPage from './features/customers/CustomerManagementPage';
import BasicDataPage from './features/basic-data/BasicDataPage';
import ProductsPage from './features/products/ProductsPage';
import SalesInvoicePage from './features/invoices/SalesInvoicePage';
import PurchaseInvoicePage from './features/invoices/PurchaseInvoicePage';
import ProformaInvoicePage from './features/invoices/ProformaInvoicePage';
import SalesReturnPage from './features/invoices/SalesReturnPage';
import InventoryPage from './features/inventory/InventoryPage';
import StockTakingPage from './features/inventory/StockTakingPage';
import WastagePage from './features/inventory/WastagePage';
import CheckManagementPage from './features/financials/CheckManagementPage';
import CustomerAccountPage from './features/financials/CustomerAccountPage';
import CustomerListPage from './features/reports/CustomerListPage';
import SupplierListPage from './features/reports/SupplierListPage';
import CustomerLedgerPage from './features/reports/CustomerLedgerPage';
import CustomerBalancesPage from './features/reports/CustomerBalancesPage';
import CheckListPage from './features/reports/CheckListPage';
import IssuedCheckListPage from './features/reports/IssuedCheckListPage';
import CashFlowPage from './features/reports/CashFlowPage';
import SettingsPage from './features/settings/SettingsPage';
import ThemeSettingsPage from './features/settings/ThemeSettingsPage';
import DataManagementPage from './features/settings/DataManagementPage';
import BackupPage from './features/settings/BackupPage';
import ChangePasswordPage from './features/settings/ChangePasswordPage';
import TransactionReportPage from './features/reports/TransactionReportPage';
import type { JSX } from 'react';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      <Route 
        path="/*" 
        element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/company" element={<CompanyInfoPage />} />
                <Route path="/accounts" element={<CompanyAccountPage />} />
                <Route path="/customers" element={<CustomerManagementPage />} />
                <Route path="/basic-data" element={<BasicDataPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/invoices/sale" element={<SalesInvoicePage />} />
                <Route path="/invoices/purchase" element={<PurchaseInvoicePage />} />
                <Route path="/invoices/proforma" element={<ProformaInvoicePage />} />
                <Route path="/invoices/return" element={<SalesReturnPage />} />
                <Route path="/inventory/stock" element={<InventoryPage />} />
                <Route path="/inventory/stock-taking" element={<StockTakingPage />} />
                <Route path="/inventory/wastage" element={<WastagePage />} />
                <Route path="/financials/checks" element={<CheckManagementPage />} />
                <Route path="/reports/sales-ledger" element={<CustomerAccountPage accountType="sales" />} />
                <Route path="/reports/purchase-ledger" element={<CustomerAccountPage accountType="purchases" />} />
                <Route path="/reports/sales-customers" element={<CustomerListPage />} />
                <Route path="/reports/purchase-customers" element={<SupplierListPage />} />
                <Route path="/reports/customer-ledger" element={<CustomerLedgerPage />} />
                <Route path="/reports/customer-balances" element={<CustomerBalancesPage />} />
                <Route path="/reports/received-checks" element={<CheckListPage />} />
                <Route path="/reports/issued-checks" element={<IssuedCheckListPage />} />
                <Route path="/reports/cash-flow" element={<CashFlowPage />} />
                <Route path="/reports/miscellaneous-transactions" element={<TransactionReportPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/theme" element={<ThemeSettingsPage />} />
                <Route path="/data" element={<DataManagementPage />} />
                <Route path="/backup" element={<BackupPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;