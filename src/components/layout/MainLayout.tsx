import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable,type DropResult } from '@hello-pangea/dnd';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, Collapse, IconButton, Container,
  ListItem, useTheme, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import type { RootState } from '../../store/store';
import { addShortcut, setShortcuts } from '../../store/slices/dashboardSlice';
import type { Shortcut } from '../../store/slices/dashboardSlice';

import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import RuleIcon from '@mui/icons-material/Rule';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TuneIcon from '@mui/icons-material/Tune';
import PaletteIcon from '@mui/icons-material/Palette';
import DataSaverOnIcon from '@mui/icons-material/DataSaverOn';
import BackupIcon from '@mui/icons-material/Backup';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const drawerWidth = 240;

type NavChild = { text: string; icon: React.JSX.Element; path: string; id: string; iconName: string };
type NavItem = { text: string; icon: React.JSX.Element; path?: string; id?: string; iconName?: string; children?: NavChild[] };

const navItems: NavItem[] = [
    { text: 'داشبورد', icon: <DashboardIcon />, path: '/', id: '/', iconName: 'Dashboard' },
    {
      text: 'مدیریت', icon: <SettingsIcon />,
      children: [
        { text: 'تعریف کاربر', icon: <PeopleIcon />, path: '/users', id: '/users', iconName: 'People' },
        { text: 'معرفی شرکت', icon: <BusinessIcon />, path: '/company', id: '/company', iconName: 'Business' },
        { text: 'حساب شرکت', icon: <AccountBalanceWalletIcon />, path: '/accounts', id: '/accounts', iconName: 'AccountBalanceWallet' },
        { text: 'اطلاعات فردی ', icon: <GroupAddIcon />, path: '/customers', id: '/customers', iconName: 'GroupAdd' },
        { text: 'اطلاعات پایه', icon: <CategoryIcon />, path: '/basic-data', id: '/basic-data', iconName: 'Category' },
      ],
    },
    {
      text: 'عملیات', icon: <PointOfSaleIcon />,
      children: [
         { text: 'صدور فاکتور فروش', icon: <ReceiptLongIcon />, path: '/invoices/sale', id: '/invoices/sale', iconName: 'ReceiptLong' },
         { text: 'فاکتور خرید', icon: <ShoppingCartIcon />, path: '/invoices/purchase', id: '/invoices/purchase', iconName: 'ShoppingCart' },
         { text: 'صدور پیش فاکتور', icon: <FactCheckIcon />, path: '/invoices/proforma', id: '/invoices/proforma', iconName: 'FactCheck' },
         { text: 'برگشت از فروش', icon: <AssignmentReturnIcon />, path: '/invoices/return', id: '/invoices/return', iconName: 'AssignmentReturn' },
         { text: 'موجودی انبار', icon: <Inventory2Icon />, path: '/inventory/stock', id: '/inventory/stock', iconName: 'Inventory2' },
         { text: 'انبارگردانی', icon: <RuleIcon />, path: '/inventory/stock-taking', id: '/inventory/stock-taking', iconName: 'Rule' },
         { text: 'ثبت ضایعات', icon: <DeleteSweepIcon />, path: '/inventory/wastage', id: '/inventory/wastage', iconName: 'DeleteSweep' },
         { text: 'مدیریت چک‌ها', icon: <PaymentsIcon />, path: '/financials/checks', id: '/financials/checks', iconName: 'Payments' },
         { text: 'حساب مشتریان فروش', icon: <AccountBalanceIcon />, path: '/reports/sales-ledger', id: '/reports/sales-ledger', iconName: 'AccountBalance' },
         { text: 'حساب مشتریان خرید', icon: <AccountBalanceIcon />, path: '/reports/purchase-ledger', id: '/reports/purchase-ledger', iconName: 'AccountBalance' },
      ],
    },
    {
      text: 'گزارشات', icon: <AssessmentIcon />,
      children: [
          { text: 'لیست مشتریان فروش', icon: <PeopleIcon />, path: '/reports/sales-customers', id: '/reports/sales-customers', iconName: 'People' },
          { text: 'لیست مشتریان خرید', icon: <PeopleIcon />, path: '/reports/purchase-customers', id: '/reports/purchase-customers', iconName: 'People' },
          { text: 'گردش حساب مشتریان', icon: <AccountBalanceIcon />, path: '/reports/customer-ledger', id: '/reports/customer-ledger', iconName: 'AccountBalance' },
          { text: 'مانده حساب مشتریان', icon: <AccountBalanceWalletIcon />, path: '/reports/customer-balances', id: '/reports/customer-balances', iconName: 'AccountBalanceWallet' },
          { text: 'صورت چک‌های دریافتی', icon: <PaymentsIcon />, path: '/reports/received-checks', id: '/reports/received-checks', iconName: 'Payments' },
          { text: 'صورت چک‌های پرداختی', icon: <PaymentsIcon />, path: '/reports/issued-checks', id: '/reports/issued-checks', iconName: 'Payments' },
          { text: 'دریافت و پرداخت نقدی', icon: <AccountBalanceWalletIcon />, path: '/reports/cash-flow', id: '/reports/cash-flow', iconName: 'AccountBalanceWallet' },
      ]
    },
    {
      text: 'امکانات', icon: <SettingsIcon />,
      children: [
          { text: 'تنظیمات عمومی', icon: <TuneIcon />, path: '/features/settings', id: '/features/settings', iconName: 'Tune' },
          { text: 'تنظیمات ظاهری', icon: <PaletteIcon />, path: '/features/theme', id: '/features/theme', iconName: 'Palette' },
          { text: 'مدیریت داده‌ها', icon: <DataSaverOnIcon />, path: '/features/data', id: '/features/data', iconName: 'DataSaverOn' },
          { text: 'نسخه پشتیبان', icon: <BackupIcon />, path: '/features/backup', id: '/features/backup', iconName: 'Backup' },
          { text: 'تغییر کلمه عبور', icon: <SecurityIcon />, path: '/features/change-password', id: '/features/change-password', iconName: 'Security' },
      ]
    },
];

const allDraggableItems = (navItems.flatMap(item => item.children || (item.path !== '/' && item.path ? [item as NavChild] : [])) as NavChild[]);

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const dashboardShortcuts = useSelector((state: RootState) => state.dashboard);
  const { backgroundImage } = useSelector((state: RootState) => state.settings);
  const [nestedListOpen, setNestedListOpen] = useState<{ [key: string]: boolean }>({ "مدیریت": true});
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleAddShortcut = (item: { id: string; text: string; path: string; iconName: string; }) => {
    const isDuplicate = dashboardShortcuts.some(s => s.id === item.id);
    if (!isDuplicate) {
        const newShortcut: Shortcut = {
            id: item.id,
            title: item.text,
            path: item.path,
            iconName: item.iconName,
        };
        dispatch(addShortcut(newShortcut));
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === 'dashboard' && destination.droppableId === 'dashboard') {
      const items = Array.from(dashboardShortcuts);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      dispatch(setShortcuts(items));
    }
    if (source.droppableId.startsWith('sidebar-') && destination.droppableId === 'dashboard') {
      const draggedItem = allDraggableItems.find(item => item.id === draggableId);
      if (draggedItem) {
        handleAddShortcut(draggedItem);
      }
    }
  };
  
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNestedListToggle = (item: string) => setNestedListOpen(prev => ({ ...prev, [item]: !prev[item] }));

  const drawerContent = (
    <div>
      <Toolbar />
      <List>
        {navItems.map((item) => {
          if (item.children) {
            return (
              <React.Fragment key={item.text}>
                <ListItemButton onClick={() => handleNestedListToggle(item.text)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {nestedListOpen[item.text] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={nestedListOpen[item.text]} timeout="auto" unmountOnExit>
                  <Droppable droppableId={`sidebar-${item.text}`} isDropDisabled={true}>
                    {(provided) => (
                      <List component="div" disablePadding ref={provided.innerRef} {...provided.droppableProps}>
                        {item.children.map((child, index) => (
                          <Draggable key={child.id} draggableId={child.id} index={index} isDragDisabled={isMobile}>
                            {(provided) => (
                              <ListItem
                                disablePadding
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                secondaryAction={
                                  isMobile ? (
                                    <IconButton edge="end" aria-label="add shortcut" onClick={() => handleAddShortcut(child)}>
                                      <AddCircleOutlineIcon />
                                    </IconButton>
                                  ) : null
                                }
                              >
                                <ListItemButton sx={{ pl: 4 }} selected={router.pathname === child.path} onClick={() => router.push(child.path)}>
                                  <ListItemIcon>{child.icon}</ListItemIcon>
                                  <ListItemText primary={child.text} />
                                </ListItemButton>
                              </ListItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </List>
                    )}
                  </Droppable>
                </Collapse>
              </React.Fragment>
            );
          }
          return (
            <ListItemButton key={item.text} selected={router.pathname === item.path} onClick={() => { handleDrawerToggle(); router.push(item.path); }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px}` } }}>
          <Toolbar>
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ ml: 2, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, textAlign: 'right' }}>
              نرم‌افزار یکپارچه حسابداری و فروش
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                direction: 'rtl', 
              },
            }}
            anchor="left"
          >
            {drawerContent}
          </Drawer>
          
          <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} open>
            {drawerContent}
          </Drawer>
        </Box>
        
        <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <Toolbar />
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </DragDropContext>
  );
};