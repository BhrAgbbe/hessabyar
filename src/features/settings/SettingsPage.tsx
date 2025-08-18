import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { setAllSettings, type AppSettings } from '../../store/slices/settingsSlice';
import {
  Box, Typography, Paper, FormGroup, FormControlLabel, Switch, Divider,
  FormControl, InputLabel, Select, MenuItem, TextField, Button, Snackbar, Alert
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

type InvoicePrintSize = 'A4' | 'A5' | 'Receipt';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const savedSettings = useSelector((state: RootState) => state.settings);
  
  // Local state to hold changes before saving
  const [localSettings, setLocalSettings] = useState<AppSettings>(savedSettings);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; } | null>(null);

  // Sync local state if Redux state changes (e.g., on initial load)
  useEffect(() => {
    setLocalSettings(savedSettings);
  }, [savedSettings]);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setLocalSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numericValue)) {
      setLocalSettings(prev => ({ ...prev, [name as keyof AppSettings]: numericValue }));
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<InvoicePrintSize>) => {
    const { name, value } = event.target;
    setLocalSettings(prev => ({ ...prev, [name as keyof AppSettings]: value }));
  };

  // Dispatch action to save all local changes to Redux
  const handleSaveChanges = () => {
    dispatch(setAllSettings(localSettings));
    setSnackbar({ open: true, message: 'تنظیمات با موفقیت ذخیره شد!' });
  };

  const handleResetChanges = () => {
    setLocalSettings(savedSettings);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom  sx={{textAlign:'center', fontSize: { xs: '0.75rem', sm: '1.5rem' } }}>تنظیمات برنامه</Typography>
       <Paper sx={{ p: 3, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        <Typography variant="h6">تنظیمات عمومی</Typography>
        <FormGroup>
          <FormControlLabel 
            control={<Switch checked={localSettings.checkReminderWarning} onChange={handleSwitchChange} name="checkReminderWarning" />} 
            label="هشدار اعلام زمان باقی مانده چک" 
          />
          {localSettings.checkReminderWarning && (
            <TextField
              label="تعداد روز قبل از سررسید برای هشدار"
              name="checkReminderDays"
              type="number"
              value={localSettings.checkReminderDays}
              onChange={handleTextChange}
              variant="outlined"
              size="small"
              sx={{ mt: 1, mb: 2, width: '250px' }}
              InputProps={{ inputProps: { min: 1 } }}
            />
          )}
          <FormControlLabel control={<Switch checked={localSettings.syncCustomersToContacts} onChange={handleSwitchChange} name="syncCustomersToContacts" />} label="ارتباط و افزودن اطلاعات مشتریان به دفترچه تلفن" />
          <FormControlLabel control={<Switch checked={localSettings.autoBackupOnExit} onChange={handleSwitchChange} name="autoBackupOnExit" />} label="انجام خودکار پشتیبان گیری هنگام بستن برنامه" />
        </FormGroup>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">تنظیمات فاکتور</Typography>
        <FormGroup>
          <FormControlLabel control={<Switch checked={localSettings.allowUserDiscount} onChange={handleSwitchChange} name="allowUserDiscount" />} label="فعال کردن تخفیف ویژه برای کاربر عادی" />
          <FormControlLabel control={<Switch checked={localSettings.autoAddQuantity} onChange={handleSwitchChange} name="autoAddQuantity" />} label="درج خودکار تعداد کالا در فاکتور فروش (پیش‌فرض ۱)" />
          <FormControlLabel control={<Switch checked={localSettings.useBarcodeScanner} onChange={handleSwitchChange} name="useBarcodeScanner" />} label="از دستگاه بارکدخوان استفاده می‌شود" />
          <FormControlLabel control={<Switch checked={localSettings.checkStockOnHand} onChange={handleSwitchChange} name="checkStockOnHand" />} label="بررسی موجودی انبار در فروش (جلوگیری از فروش منفی)" />
          <FormControlLabel control={<Switch checked={localSettings.showDebtOnInvoice} onChange={handleSwitchChange} name="showDebtOnInvoice" />} label="نمایش بدهی در چاپ فاکتور" />
          <FormControlLabel control={<Switch checked={localSettings.showProfitOnInvoice} onChange={handleSwitchChange} name="showProfitOnInvoice" />} label="نمایش سود در فاکتور فروش (فقط مدیر)" />
          <FormControlLabel control={<Switch checked={localSettings.quickPrintInvoice} onChange={handleSwitchChange} name="quickPrintInvoice" />} label="چاپ سریع فاکتور" />
        </FormGroup>
        
        <FormControl sx={{mt: 2, minWidth: 200}}>
          <InputLabel>اندازه چاپ فاکتور</InputLabel>
          <Select
            value={localSettings.invoicePrintSize}
            label="اندازه چاپ فاکتور"
            name="invoicePrintSize"
            onChange={handleSelectChange}
          >
            <MenuItem value="A4">A4</MenuItem>
            <MenuItem value="A5">A5</MenuItem>
            <MenuItem value="Receipt">فیش پرینتر</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveChanges}>
                ذخیره تغییرات
            </Button>
            <Button variant="outlined" startIcon={<RestoreIcon />} onClick={handleResetChanges}>
                بازنشانی
            </Button>
        </Box>
      </Paper>

      <Snackbar 
        open={snackbar?.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity="success" sx={{ width: '100%' }}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
