import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppSettings } from '../../types/settings'; 

const initialState: AppSettings = {
  checkReminderWarning: true,
  checkReminderDays: 1, 
  invoicePrintSize: 'A4',
  syncCustomersToContacts: false,
  autoBackupOnExit: true,
  allowUserDiscount: false,
  autoAddQuantity: true,
  useBarcodeScanner: true,
  checkStockOnHand: true,
  showDebtOnInvoice: true,
  showProfitOnInvoice: false,
  quickPrintInvoice: false,
  backgroundColor: '#F8F7FA', 
  backgroundImage: '',
  primaryColor: '#7367F0', 
};

type SettingValue = AppSettings[keyof AppSettings];

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSetting: (state, action: PayloadAction<{ key: keyof AppSettings; value: SettingValue }>) => {
      const { key, value } = action.payload;
      if (key in state) {
        state[key] = value as never;
      }
    },
    setAllSettings: (_state, action: PayloadAction<AppSettings>) => {
      return action.payload;
    },
  },
});

export const { updateSetting, setAllSettings } = settingsSlice.actions;
export default settingsSlice.reducer;