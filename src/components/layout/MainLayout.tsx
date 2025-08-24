import React, { useState } from "react";
import Link from "next/link"; 
import { useRouter } from "next/router"; 
import { useSelector, useDispatch } from "react-redux";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Collapse,
  IconButton,
  Container,
  ListItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import type { RootState } from "../../store/store";
import { addShortcut, setShortcuts } from "../../store/slices/dashboardSlice";
import type { Shortcut } from "../../store/slices/dashboardSlice";
import { navItems, allDraggableItems, type NavChild } from "./menuItems";

const drawerWidth = 240;

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const router = useRouter(); 
  const dashboardShortcuts = useSelector((state: RootState) => state.dashboard);
  const { backgroundImage } = useSelector((state: RootState) => state.settings);
  const [nestedListOpen, setNestedListOpen] = useState<{
    [key: string]: boolean;
  }>({ مدیریت: true });
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleAddShortcut = (item: NavChild) => {
    const isDuplicate = dashboardShortcuts.some((s) => s.id === item.id);
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
    if (
      source.droppableId === "dashboard" &&
      destination.droppableId === "dashboard"
    ) {
      const items = Array.from(dashboardShortcuts);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      dispatch(setShortcuts(items));
    }
    if (
      source.droppableId.startsWith("sidebar-") &&
      destination.droppableId === "dashboard"
    ) {
      const draggedItem = allDraggableItems.find(
        (item) => item.id === draggableId
      );
      if (draggedItem) {
        handleAddShortcut(draggedItem);
      }
    }
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNestedListToggle = (item: string) =>
    setNestedListOpen((prev) => ({ ...prev, [item]: !prev[item] }));

  const drawerContent = (
    <div>
      <Toolbar />
      <List>
        {navItems.map((item) => {
          if (item.children) {
            return (
              <React.Fragment key={item.text}>
                <ListItemButton
                  onClick={() => handleNestedListToggle(item.text)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ textAlign: "right" }}
                  />
                  {nestedListOpen[item.text] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse
                  in={nestedListOpen[item.text]}
                  timeout="auto"
                  unmountOnExit
                >
                  <Droppable droppableId={`sidebar-${item.text}`}>
                    {(provided) => (
                      <List
                        component="div"
                        disablePadding
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {item.children.map((child, index) => (
                          <Draggable
                            key={child.id}
                            draggableId={child.id}
                            index={index}
                            isDragDisabled={isMobile}
                          >
                            {(provided) => (
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                disablePadding
                              >
                                <Link href={child.path} passHref legacyBehavior>
                                  <ListItemButton
                                    component="a"
                                    sx={{
                                      pr: 4,
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      width: "100%",
                                    }}
                                    selected={router.pathname === child.path} 
                                    onClick={() => {
                                      if (isMobile) {
                                        handleDrawerToggle();
                                      }
                                    }}
                                  >
                                    <ListItemText
                                      primary={child.text}
                                      sx={{ textAlign: "right" }}
                                    />
                                    {isMobile && (
                                      <IconButton
                                        edge="end"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleAddShortcut(child);
                                        }}
                                      >
                                        <AddCircleOutlineIcon />
                                      </IconButton>
                                    )}
                                  </ListItemButton>
                                </Link>
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
            <Link
              href={item.path as string}
              passHref
              legacyBehavior
              key={item.text}
            >
              <ListItemButton
                component="a"
                selected={router.pathname === item.path} 
                onClick={() => {
                  if (isMobile) {
                    handleDrawerToggle();
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ textAlign: "right" }} />
              </ListItemButton>
            </Link>
          );
        })}
      </List>
    </div>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mr: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            anchor="right"
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
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
            backgroundImage: backgroundImage
              ? `url(${backgroundImage})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
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