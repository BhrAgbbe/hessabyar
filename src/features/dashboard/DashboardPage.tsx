import React from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Grid, Typography, Paper, Button, Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import type { RootState } from '../../store/store';
import { removeShortcut } from '../../store/slices/dashboardSlice';
import type { Shortcut } from '../../store/slices/dashboardSlice';
import CloseIcon from '@mui/icons-material/Close';
import {
    Dashboard as DashboardIcon, Settings as SettingsIcon, PointOfSale as PointOfSaleIcon,
    Assessment as AssessmentIcon, People as PeopleIcon, Business as BusinessIcon,
    AccountBalanceWallet as AccountBalanceWalletIcon, GroupAdd as GroupAddIcon, Category as CategoryIcon,
    ReceiptLong as ReceiptLongIcon, ShoppingCart as ShoppingCartIcon, FactCheck as FactCheckIcon,
    AssignmentReturn as AssignmentReturnIcon, Inventory2 as Inventory2Icon, Rule as RuleIcon,
    DeleteSweep as DeleteSweepIcon, Payments as PaymentsIcon, AccountBalance as AccountBalanceIcon,
    Tune as TuneIcon, Palette as PaletteIcon, DataSaverOn as DataSaverOnIcon,
    Backup as BackupIcon, Security as SecurityIcon
} from '@mui/icons-material';
import TouchAppIcon from '@mui/icons-material/TouchApp';

const iconMap: { [key: string]: React.ReactNode } = {
  Dashboard: <DashboardIcon fontSize="large" />, Settings: <SettingsIcon fontSize="large" />,
  PointOfSale: <PointOfSaleIcon fontSize="large" />, Assessment: <AssessmentIcon fontSize="large" />,
  People: <PeopleIcon fontSize="large" />, Business: <BusinessIcon fontSize="large" />,
  AccountBalanceWallet: <AccountBalanceWalletIcon fontSize="large" />, GroupAdd: <GroupAddIcon fontSize="large" />,
  Category: <CategoryIcon fontSize="large" />, ReceiptLong: <ReceiptLongIcon fontSize="large" />,
  ShoppingCart: <ShoppingCartIcon fontSize="large" />, FactCheck: <FactCheckIcon fontSize="large" />,
  AssignmentReturn: <AssignmentReturnIcon fontSize="large" />, Inventory2: <Inventory2Icon fontSize="large" />,
  Rule: <RuleIcon fontSize="large" />, DeleteSweep: <DeleteSweepIcon fontSize="large" />,
  Payments: <PaymentsIcon fontSize="large" />, AccountBalance: <AccountBalanceIcon fontSize="large" />,
  Tune: <TuneIcon fontSize="large" />, Palette: <PaletteIcon fontSize="large" />,
  DataSaverOn: <DataSaverOnIcon fontSize="large" />, Backup: <BackupIcon fontSize="large" />,
  Security: <SecurityIcon fontSize="large" />,
};

const ShortcutCard: React.FC<{ shortcut: Shortcut, index: number, onRemove: (id: string) => void, isDragDisabled: boolean }> = ({ shortcut, index, onRemove, isDragDisabled }) => {
  const router = useRouter();

  return (
    <Draggable draggableId={shortcut.id} index={index} isDragDisabled={isDragDisabled}>
      {(provided) => (
        <Grid
        
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
            <IconButton
              aria-label="delete shortcut"
              onClick={() => onRemove(shortcut.id)}
              sx={{ position: 'absolute', top: 4, right: 4 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <Box>
              <Box sx={{ fontSize: 48, color: 'primary.main', mb: 1, mt: 2 }}>
                {iconMap[shortcut.iconName] || <DashboardIcon fontSize="large" />}
              </Box>
              <Typography variant="h6" gutterBottom>{shortcut.title}</Typography>
            </Box>
            <Button onClick={() => router.push(shortcut.path)} variant="contained" fullWidth sx={{ mt: 1 }}>
              برو به صفحه
            </Button>
          </Paper>
        </Grid>
      )}
    </Draggable>
  );
};

const DashboardPage = () => {
  const shortcuts = useSelector((state: RootState) => state.dashboard);
  const dispatch = useDispatch();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleRemoveShortcut = (id: string) => {
    dispatch(removeShortcut(id));
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{textAlign:'center', fontSize: { xs: '1.25rem', sm: '1.75rem' } }}>داشبورد دسترسی سریع</Typography>
      {!isMobile && (
        <Typography color="text.secondary" sx={{ mb: 3 , textAlign: 'center'}}>
          برای مرتب‌سازی، میانبرها را جابجا کنید. برای افزودن، آیتم‌ها را از منو بکشید و اینجا رها کنید.
        </Typography>
      )}

      <Droppable droppableId="dashboard" isDropDisabled={isMobile}>
        {(provided, snapshot) => (
          <Grid 
            container 
            spacing={3} 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            sx={{ 
              backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
              borderRadius: 1,
              p: 2, // Add some padding
              minHeight: 400, // Increase min height
              transition: 'background-color 0.2s ease',
              alignContent: 'flex-start' // Align items to the top
            }}
          >
            {shortcuts.map((shortcut, index) => (
              <ShortcutCard key={shortcut.id} shortcut={shortcut} index={index} onRemove={handleRemoveShortcut} isDragDisabled={isMobile} />
            ))}
            {provided.placeholder}
            {shortcuts.length === 0 && (
              <Grid sx={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
                  <TouchAppIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    داشبورد شما خالی است!
                  </Typography>
                  <Typography color="text.secondary">
                    برای افزودن میانبر، یک آیتم را از منوی کناری بکشید و در این قسمت رها کنید.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Droppable>
    </>
  );
};

export default DashboardPage;