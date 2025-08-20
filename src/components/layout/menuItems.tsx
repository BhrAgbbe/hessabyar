
import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AssessmentIcon from "@mui/icons-material/Assessment";

export type NavChild = { text: string; path: string; id: string; iconName: string };
export type NavItem = {
  text: string;
  icon: React.JSX.Element;
  path?: string;
  id?: string;
  iconName?: string;
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  {
    text: "داشبورد",
    icon: <DashboardIcon />,
    path: "/",
    id: "/",
    iconName: "Dashboard",
  },
  {
    text: "مدیریت",
    icon: <SettingsIcon />,
    children: [
      { text: "تعریف کاربر", path: "/users", id: "/users", iconName: "People" },
      { text: "معرفی شرکت", path: "/company", id: "/company", iconName: "Business" },
      { text: "حساب شرکت", path: "/accounts", id: "/accounts", iconName: "AccountBalanceWallet" },
      { text: "اطلاعات فردی ", path: "/customers", id: "/customers", iconName: "GroupAdd" },
      { text: "اطلاعات پایه", path: "/basic-data", id: "/basic-data", iconName: "Category" },
    ],
  },
  {
    text: "عملیات",
    icon: <PointOfSaleIcon />,
    children: [
      { text: "صدور فاکتور فروش", path: "/invoices/sale", id: "/invoices/sale", iconName: "ReceiptLong" },
      { text: "فاکتور خرید", path: "/invoices/purchase", id: "/invoices/purchase", iconName: "ShoppingCart" },
      { text: "صدور پیش فاکتور", path: "/invoices/proforma", id: "/invoices/proforma", iconName: "FactCheck" },
      { text: "برگشت از فروش", path: "/invoices/return", id: "/invoices/return", iconName: "AssignmentReturn" },
      { text: "موجودی انبار", path: "/inventory/stock", id: "/inventory/stock", iconName: "Inventory2" },
      { text: "انبارگردانی", path: "/inventory/stock-taking", id: "/inventory/stock-taking", iconName: "Rule" },
      { text: "ثبت ضایعات", path: "/inventory/wastage", id: "/inventory/wastage", iconName: "DeleteSweep" },
      { text: "مدیریت چک‌ها", path: "/financials/checks", id: "/financials/checks", iconName: "Payments" },
      { text: "حساب مشتریان فروش", path: "/reports/sales-ledger", id: "/reports/sales-ledger", iconName: "AccountBalance" },
      { text: "حساب مشتریان خرید", path: "/reports/purchase-ledger", id: "/reports/purchase-ledger", iconName: "AccountBalance" },
    ],
  },
    {
    text: "گزارشات",
    icon: <AssessmentIcon />,
    children: [
      { text: "لیست مشتریان فروش", path: "/reports/sales-customers", id: "/reports/sales-customers", iconName: "People" },
      { text: "لیست مشتریان خرید", path: "/reports/purchase-customers", id: "/reports/purchase-customers", iconName: "People" },
      { text: "گردش حساب مشتریان", path: "/reports/customer-ledger", id: "/reports/customer-ledger", iconName: "AccountBalance" },
      { text: "مانده حساب مشتریان", path: "/reports/customer-balances", id: "/reports/customer-balances", iconName: "AccountBalanceWallet" },
      { text: "صورت چک‌های دریافتی", path: "/reports/received-checks", id: "/reports/received-checks", iconName: "Payments" },
      { text: "صورت چک‌های پرداختی", path: "/reports/issued-checks", id: "/reports/issued-checks", iconName: "Payments" },
      { text: "دریافت و پرداخت نقدی", path: "/reports/cash-flow", id: "/reports/cash-flow", iconName: "AccountBalanceWallet" },
    ],
  },
  {
    text: "امکانات",
    icon: <SettingsIcon />,
    children: [
      { text: "تنظیمات عمومی", path: "/features/settings", id: "/features/settings", iconName: "Tune" },
      { text: "تنظیمات ظاهری", path: "/features/theme", id: "/features/theme", iconName: "Palette" },
      { text: "مدیریت داده‌ها", path: "/features/data", id: "/features/data", iconName: "DataSaverOn" },
      { text: "نسخه پشتیبان", path: "/features/backup", id: "/features/backup", iconName: "Backup" },
      { text: "تغییر کلمه عبور", path: "/features/change-password", id: "/features/change-password", iconName: "Security" },
    ],
  },
];

export const allDraggableItems = navItems.flatMap(
  (item) =>
    item.children || (item.path !== "/" && item.path ? [item as NavChild] : [])
) as NavChild[];