import React from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import {
  Grid,
  Typography,
  Paper,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { RootState } from "../../store/store";
import { removeShortcut } from "../../store/slices/dashboardSlice";
import type { Shortcut } from "../../types/dashboard";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  PointOfSale as PointOfSaleIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  GroupAdd as GroupAddIcon,
  Category as CategoryIcon,
  ReceiptLong as ReceiptLongIcon,
  ShoppingCart as ShoppingCartIcon,
  FactCheck as FactCheckIcon,
  AssignmentReturn as AssignmentReturnIcon,
  Inventory2 as Inventory2Icon,
  Rule as RuleIcon,
  DeleteSweep as DeleteSweepIcon,
  Payments as PaymentsIcon,
  AccountBalance as AccountBalanceIcon,
  Tune as TuneIcon,
  Palette as PaletteIcon,
  DataSaverOn as DataSaverOnIcon,
  Backup as BackupIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";

const iconMap: { [key: string]: React.ReactNode } = {
  Dashboard: <DashboardIcon fontSize="large" />,
  Settings: <SettingsIcon fontSize="large" />,
  PointOfSale: <PointOfSaleIcon fontSize="large" />,
  Assessment: <AssessmentIcon fontSize="large" />,
  People: <PeopleIcon fontSize="large" />,
  Business: <BusinessIcon fontSize="large" />,
  AccountBalanceWallet: <AccountBalanceWalletIcon fontSize="large" />,
  GroupAdd: <GroupAddIcon fontSize="large" />,
  Category: <CategoryIcon fontSize="large" />,
  ReceiptLong: <ReceiptLongIcon fontSize="large" />,
  ShoppingCart: <ShoppingCartIcon fontSize="large" />,
  FactCheck: <FactCheckIcon fontSize="large" />,
  AssignmentReturn: <AssignmentReturnIcon fontSize="large" />,
  Inventory2: <Inventory2Icon fontSize="large" />,
  Rule: <RuleIcon fontSize="large" />,
  DeleteSweep: <DeleteSweepIcon fontSize="large" />,
  Payments: <PaymentsIcon fontSize="large" />,
  AccountBalance: <AccountBalanceIcon fontSize="large" />,
  Tune: <TuneIcon fontSize="large" />,
  Palette: <PaletteIcon fontSize="large" />,
  DataSaverOn: <DataSaverOnIcon fontSize="large" />,
  Backup: <BackupIcon fontSize="large" />,
  Security: <SecurityIcon fontSize="large" />,
};

const ShortcutCard: React.FC<{
  shortcut: Shortcut;
  onRemove: (id: string) => void;
}> = ({ shortcut, onRemove }) => {
  const router = useRouter();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        textAlign: "center",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      <IconButton
        aria-label="delete shortcut"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(shortcut.id)}
        sx={{ position: "absolute", top: 4, right: 4 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <Box
        onClick={() => router.push(shortcut.path)}
        sx={{ cursor: "pointer", flexGrow: 1 }}
      >
        <Box sx={{ fontSize: 48, color: "primary.main", mb: 1, mt: 2 }}>
          {iconMap[shortcut.iconName] || <DashboardIcon fontSize="large" />}
        </Box>
        <Typography variant="h6" gutterBottom>
          {shortcut.title}
        </Typography>
      </Box>
      <Button
        onClick={() => router.push(shortcut.path)}
        variant="contained"
        fullWidth
        sx={{ mt: 1 }}
      >
        برو به صفحه
      </Button>
    </Paper>
  );
};

const SortableShortcutCard: React.FC<{
  shortcut: Shortcut;
  onRemove: (id: string) => void;
}> = ({ shortcut, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: shortcut.id,
    data: { type: "shortcut" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <Grid ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ShortcutCard shortcut={shortcut} onRemove={onRemove} />
    </Grid>
  );
};

const DashboardPage = () => {
  const shortcuts = useSelector(
    (state: RootState) => state.dashboard.shortcuts
  );
  const dispatch = useDispatch();

  const { setNodeRef, isOver } = useDroppable({
    id: "dashboard-droppable-area",
  });

  const handleRemoveShortcut = (id: string) => {
    dispatch(removeShortcut(id));
  };

  const dropZoneStyle = {
    backgroundColor: isOver ? "rgba(0, 128, 0, 0.1)" : "transparent",
    borderRadius: "8px",
    transition: "background-color 0.2s ease-in-out",
  };

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", fontSize: { xs: "1.25rem", sm: "1.75rem" } }}
      >
        داشبورد دسترسی سریع
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
        برای افزودن، آیتم مورد نظر را از منو بکشید و در این قسمت رها کنید.
      </Typography>

      <SortableContext
        items={(shortcuts || []).map((s) => s.id)}
        strategy={rectSortingStrategy}
      >
        <Grid
          ref={setNodeRef}
          container
          spacing={3}
          sx={{
            ...dropZoneStyle,
            p: 2,
            minHeight: 400,
            alignContent: "flex-start",
          }}
        >
          {(shortcuts || []).map((shortcut) => (
            <SortableShortcutCard
              key={shortcut.id}
              shortcut={shortcut}
              onRemove={handleRemoveShortcut}
            />
          ))}
        </Grid>
      </SortableContext>
    </>
  );
};

export default DashboardPage;
