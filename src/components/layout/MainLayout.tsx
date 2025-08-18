import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable,type DropResult } from '@hello-pangea/dnd';
import {
  AppBar, Toolbar, Drawer, List, ListItemButton,
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
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const drawerWidth = 240;

type NavChild = { text: string; path: string; id: string; iconName: string };
type NavItem = { text: string; icon: React.JSX.Element; path?: string; id?: string; iconName?: string; children?: NavChild[] };

const navItems: NavItem[] = [
    { text: 'داشبورد', icon: <DashboardIcon />, path: '/', id: '/', iconName: 'Dashboard' },
    {
      text: 'مدیریت', icon: <SettingsIcon />,
      children: [
        { text: 'تعریف کاربر', path: '/users', id: '/users', iconName: 'People' },
        { text: 'معرفی شرکت', path: '/company', id: '/company', iconName: 'Business' },
        { text: 'حساب شرکت', path: '/accounts', id: '/accounts', iconName: 'AccountBalanceWallet' },
        { text: 'اطلاعات فردی ', path: '/customers', id: '/customers', iconName: 'GroupAdd' },
        { text: 'اطلاعات پایه', path: '/basic-data', id: '/basic-data', iconName: 'Category' },
      ],
    },
    {
      text: 'عملیات', icon: <PointOfSaleIcon />,
      children: [
         { text: 'صدور فاکتور فروش', path: '/invoices/sale', id: '/invoices/sale', iconName: 'ReceiptLong' },
         { text: 'فاکتور خرید', path: '/invoices/purchase', id: '/invoices/purchase', iconName: 'ShoppingCart' },
         { text: 'صدور پیش فاکتور', path: '/invoices/proforma', id: '/invoices/proforma', iconName: 'FactCheck' },
         { text: 'برگشت از فروش', path: '/invoices/return', id: '/invoices/return', iconName: 'AssignmentReturn' },
         { text: 'موجودی انبار', path: '/inventory/stock', id: '/inventory/stock', iconName: 'Inventory2' },
         { text: 'انبارگردانی', path: '/inventory/stock-taking', id: '/inventory/stock-taking', iconName: 'Rule' },
         { text: 'ثبت ضایعات', path: '/inventory/wastage', id: '/inventory/wastage', iconName: 'DeleteSweep' },
         { text: 'مدیریت چک‌ها', path: '/financials/checks', id: '/financials/checks', iconName: 'Payments' },
         { text: 'حساب مشتریان فروش', path: '/reports/sales-ledger', id: '/reports/sales-ledger', iconName: 'AccountBalance' },
         { text: 'حساب مشتریان خرید', path: '/reports/purchase-ledger', id: '/reports/purchase-ledger', iconName: 'AccountBalance' },
      ],
    },
    {
      text: 'گزارشات', icon: <AssessmentIcon />,
      children: [
          { text: 'لیست مشتریان فروش', path: '/reports/sales-customers', id: '/reports/sales-customers', iconName: 'People' },
          { text: 'لیست مشتریان خرید', path: '/reports/purchase-customers', id: '/reports/purchase-customers', iconName: 'People' },
          { text: 'گردش حساب مشتریان', path: '/reports/customer-ledger', id: '/reports/customer-ledger', iconName: 'AccountBalance' },
          { text: 'مانده حساب مشتریان', path: '/reports/customer-balances', id: '/reports/customer-balances', iconName: 'AccountBalanceWallet' },
          { text: 'صورت چک‌های دریافتی', path: '/reports/received-checks', id: '/reports/received-checks', iconName: 'Payments' },
          { text: 'صورت چک‌های پرداختی', path: '/reports/issued-checks', id: '/reports/issued-checks', iconName: 'Payments' },
          { text: 'دریافت و پرداخت نقدی', path: '/reports/cash-flow', id: '/reports/cash-flow', iconName: 'AccountBalanceWallet' },
      ]
    },
    {
      text: 'امکانات', icon: <SettingsIcon />,
      children: [
          { text: 'تنظیمات عمومی', path: '/features/settings', id: '/features/settings', iconName: 'Tune' },
          { text: 'تنظیمات ظاهری', path: '/features/theme', id: '/features/theme', iconName: 'Palette' },
          { text: 'مدیریت داده‌ها', path: '/features/data', id: '/features/data', iconName: 'DataSaverOn' },
          { text: 'نسخه پشتیبان', path: '/features/backup', id: '/features/backup', iconName: 'Backup' },
          { text: 'تغییر کلمه عبور', path: '/features/change-password', id: '/features/change-password', iconName: 'Security' },
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
                  <ListItemText 
                    primary={item.text}
                    sx={{ textAlign: 'right' }}
                    primaryTypographyProps={{
                      style: {
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                      sx: {
                        fontSize: { xs: '0.9rem', md: '1rem' },
                      }
                    }}
                  />
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
                                sx={{
                                    '& .MuiListItemSecondaryAction-root': {
                                        right: 'auto',
                                        left: '16px',
                                    },
                                }}
                                secondaryAction={
                                  isMobile ? (
                                    <IconButton edge="end" aria-label="add shortcut" onClick={() => handleAddShortcut(child)}>
                                      <AddCircleOutlineIcon />
                                    </IconButton>
                                  ) : null
                                }
                              >
                                {/* ✅ تغییر اصلی اینجاست */}
                                <ListItemButton 
                                  sx={{ 
                                    pr: 4, 
                                    // اضافه کردن فاصله از سمت چپ برای آیکون "+"
                                    pl: isMobile ? 6 : 2 
                                  }} 
                                  selected={router.pathname === child.path} 
                                  onClick={() => router.push(child.path)}
                                >
                                  <ListItemText 
                                    primary={child.text} 
                                    sx={{ textAlign: 'right' }} 
                                    primaryTypographyProps={{
                                      style: {
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      },
                                      sx: {
                                        fontSize: { xs: '0.8rem', md: '0.9rem' },
                                      }
                                    }}
                                  />
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
            <ListItemButton key={item.text} selected={router.pathname === item.path} onClick={() => { if(isMobile) { handleDrawerToggle(); } router.push(item.path as string); }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ textAlign: 'right' }}
                primaryTypographyProps={{
                  style: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                  sx: {
                    fontSize: { xs: '0.9rem', md: '1rem' },
                  }
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex' }}>
        <AppBar 
          position="fixed" 
          sx={{ 
            width: { md: `calc(100% - ${drawerWidth}px)` }, 
            mr: { md: `${drawerWidth}px` }
          }}
        >
          <Toolbar>
            <IconButton 
              color="inherit" 
              aria-label="open drawer" 
              edge="start" 
              onClick={handleDrawerToggle} 
              sx={{ ml: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
           
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
              },
            }}
            anchor="right"
          >
            {drawerContent}
          </Drawer>
          
          <Drawer 
            variant="permanent" 
            sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} 
            open
            anchor="right"
          >
            {drawerContent}
          </Drawer>
        </Box>
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            width: { md: `calc(100% - ${drawerWidth}px)` }, 
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        >
          <Toolbar />
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </DragDropContext>
  );
};