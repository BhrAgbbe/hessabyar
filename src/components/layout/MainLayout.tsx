import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import {
  AppBar, Toolbar, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Box, Collapse, IconButton, Container, ListItem,
  useTheme, useMediaQuery, Menu, MenuItem,
} from "@mui/material";
import {
  DndContext, DragEndEvent, useDraggable, PointerSensor, KeyboardSensor, useSensor, useSensors
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import MenuIcon from "@mui/icons-material/Menu";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Link from 'next/link';
import type { RootState } from "../../store/store";
import { addShortcut, setShortcuts } from "../../store/slices/dashboardSlice";
import { logout } from "../../store/slices/authSlice";
import type { Shortcut } from "../../types/dashboard";
import { navItems, type NavChild } from "./menuItems";

const drawerWidth = 240;

const DraggableListItem: React.FC<{ item: NavChild }> = ({ item }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `menu-item-${item.id}`,
        data: {
            type: 'menu-item',
            item: {
                id: item.id,
                title: item.text,
                path: item.path,
                iconName: item.iconName,
            }
        },
    });
    const router = useRouter();

    const style = {
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
    };

    return (
        <ListItem
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            disablePadding
            sx={{ paddingRight: 2 }}
        >
            <ListItemButton
              onClick={() => router.push(item.path)}
              selected={router.pathname === item.path}
              sx={{ pr: 2, width: '100%' }}
            >
                <ListItemText primary={item.text} sx={{ textAlign: "right" }} />
            </ListItemButton>
        </ListItem>
    );
};

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const dashboardShortcuts = useSelector((state: RootState) => state.dashboard);
  const { isAuthenticated, currentUser } = useSelector((state: RootState) => state.auth);
  const { backgroundImage } = useSelector((state: RootState) => state.settings);
  const [nestedListOpen, setNestedListOpen] = useState<{ [key: string]: boolean }>({
    مدیریت: true, عملیات: true, گزارشات: true, امکانات: true,
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = !isMobile;

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
    handleClose();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeIsMenuItem = active.data.current?.type === 'menu-item';
    const activeIsShortcut = active.data.current?.type === 'shortcut';
    const overIsDashboard = over.id === 'dashboard-droppable-area';
    const overIsShortcut = over.data.current?.type === 'shortcut';

    if (activeIsMenuItem && (overIsDashboard || overIsShortcut)) {
        const item = active.data.current?.item as Shortcut;
        const isDuplicate = dashboardShortcuts.some((s) => s.id === item.id);
        if (!isDuplicate) {
            dispatch(addShortcut(item));
        }
        return;
    }

    if (activeIsShortcut && overIsShortcut && active.id !== over.id) {
        const oldIndex = dashboardShortcuts.findIndex((s) => s.id === active.id);
        const newIndex = dashboardShortcuts.findIndex((s) => s.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(dashboardShortcuts, oldIndex, newIndex);
            dispatch(setShortcuts(newOrder));
        }
    }
  };

  const handleAddShortcut = (item: NavChild) => {
    const isDuplicate = dashboardShortcuts.some((s) => s.id === item.id);
    if (!isDuplicate) {
      const newShortcut: Shortcut = {
        id: item.id, title: item.text, path: item.path, iconName: item.iconName,
      };
      dispatch(addShortcut(newShortcut));
    }
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNestedListToggle = (item: string) =>
    setNestedListOpen((prev) => ({ ...prev, [item]: !prev[item] }));

  const drawerContent = (
    <Box>
      <Toolbar />
      <List>
        {navItems.map((item) => {
          if (item.children) {
            return (
              <React.Fragment key={item.text}>
                <ListItemButton onClick={() => handleNestedListToggle(item.text)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ textAlign: "right" }} />
                  {nestedListOpen[item.text] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={nestedListOpen[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      isDesktop ? (
                        <DraggableListItem key={child.id} item={child} />
                      ) : (
                         <ListItem key={child.id} disablePadding sx={{ paddingRight: 2 }}>
                             <ListItemButton
                                 sx={{ pr: 2, display: 'flex', justifyContent: 'space-between', width: '100%' }}
                                 selected={router.pathname === child.path}
                                 onClick={() => {
                                     router.push(child.path);
                                     handleDrawerToggle();
                                 }}
                             >
                                 <ListItemText primary={child.text} sx={{ textAlign: "right" }} />
                                 <IconButton edge="end" onClick={(e) => { e.stopPropagation(); handleAddShortcut(child); }}>
                                     <AddCircleOutlineIcon />
                                 </IconButton>
                             </ListItemButton>
                         </ListItem>
                      )
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          return (
            <Link href={item.path as string} passHref legacyBehavior key={item.text}>
              <ListItemButton component="a" selected={router.pathname === item.path} onClick={() => isMobile && handleDrawerToggle()}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ textAlign: "right" }} />
              </ListItemButton>
            </Link>
          );
        })}
      </List>
    </Box>
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Box sx={{ display: "flex" }}>
        <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, mr: { md: `${drawerWidth}px` } }}>
            <Toolbar>
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ ml: 2, display: { md: "none" } }}>
                <MenuIcon />
            </IconButton>
            {isAuthenticated && (
                <div>
                <IconButton size="large" aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleMenu} color="inherit">
                    <AccountCircle />
                </IconButton>
                <Menu id="menu-appbar" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem disabled>{currentUser?.username}</MenuItem>
                    <MenuItem onClick={handleLogout}>خروج از حساب</MenuItem>
                </Menu>
                </div>
            )}
            </Toolbar>
        </AppBar>
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } }} anchor="right">
            {drawerContent}
            </Drawer>
            <Drawer variant="permanent" sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } }} open anchor="right">
            {drawerContent}
            </Drawer>
        </Box>
        <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}>
            <Toolbar />
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {children}
            </Container>
        </Box>
        </Box>
    </DndContext>
  );
};