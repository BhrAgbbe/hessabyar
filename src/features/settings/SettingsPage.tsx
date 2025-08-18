import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import {
  setAllSettings,
  type AppSettings,
} from "../../store/slices/settingsSlice";
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";


type InvoicePrintSize = "A4" | "A5" | "Receipt";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const savedSettings = useSelector((state: RootState) => state.settings);

  const [localSettings, setLocalSettings] =
    useState<AppSettings>(savedSettings);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    setLocalSettings(savedSettings);
  }, [savedSettings]);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setLocalSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numericValue = value === "" ? 0 : parseInt(value, 10);
    if (!isNaN(numericValue)) {
      setLocalSettings((prev) => ({
        ...prev,
        [name as keyof AppSettings]: numericValue,
      }));
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<InvoicePrintSize>) => {
    const { name, value } = event.target;
    setLocalSettings((prev) => ({
      ...prev,
      [name as keyof AppSettings]: value,
    }));
  };

  const handleSaveChanges = () => {
    dispatch(setAllSettings(localSettings));
    setSnackbar({ open: true, message: "تنظیمات با موفقیت ذخیره شد!" });
  };

  const handleResetChanges = () => {
    setLocalSettings(savedSettings);
  };

  const SettingItem: React.FC<{
    name: keyof AppSettings;
    label: string;
    children?: React.ReactNode;
  }> = ({ name, label, children }) => (
    <Box>
      <Box>
        <FormControlLabel
          labelPlacement="start"
          sx={{
            width: "100%",
            justifyContent: "space-between",
            ml: 0,
            "& .MuiFormControlLabel-label": {
              fontSize: "0.8rem",
              lineHeight: "1.4",
              textAlign: "right",
            },
          }}
          control={
            <Switch
              checked={localSettings[name] as boolean}
              onChange={handleSwitchChange}
              name={name}
            />
          }
          label={label}
        />
      </Box>
      {children}
    </Box>
  );

  return (
    <Box>
      <Paper sx={{ p: 3, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          تنظیمات عمومی
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <SettingItem
            name="checkReminderWarning"
            label="هشدار اعلام زمان باقی مانده چک"
          >
            {localSettings.checkReminderWarning && (
              <TextField
                label="تعداد روز قبل از سررسید"
                name="checkReminderDays"
                type="number"
                value={localSettings.checkReminderDays}
                onChange={handleTextChange}
                variant="outlined"
                size="small"
                sx={{ mt: 1.5, width: "100%", maxWidth: "250px" }}
                InputProps={{ inputProps: { min: 1 } }}
              />
            )}
          </SettingItem>
          <Divider />
          <SettingItem
            name="syncCustomersToContacts"
            label="ارتباط و افزودن اطلاعات مشتریان به دفترچه تلفن"
          />
          <Divider />
          <SettingItem
            name="autoBackupOnExit"
            label="انجام خودکار پشتیبان گیری هنگام بستن برنامه"
          />
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          تنظیمات فاکتور
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <SettingItem
            name="allowUserDiscount"
            label="فعال کردن تخفیف ویژه برای کاربر عادی"
          />
          <Divider />
          <SettingItem
            name="autoAddQuantity"
            label="درج خودکار تعداد کالا در فاکتور فروش (پیش‌فرض ۱)"
          />
          <Divider />
          <SettingItem
            name="useBarcodeScanner"
            label="از دستگاه بارکدخوان استفاده می‌شود"
          />
          <Divider />
          <SettingItem
            name="checkStockOnHand"
            label="بررسی موجودی انبار در فروش (جلوگیری از فروش منفی)"
          />
          <Divider />
          <SettingItem
            name="showDebtOnInvoice"
            label="نمایش بدهی در چاپ فاکتور"
          />
          <Divider />
          <SettingItem
            name="showProfitOnInvoice"
            label="نمایش سود در فاکتور فروش (فقط مدیر)"
          />
          <Divider />
          <SettingItem name="quickPrintInvoice" label="چاپ سریع فاکتور" />
        </Box>

        <FormControl
          sx={{ mt: 3, width: { xs: "100%", sm: 250 } }}
          size="small"
        >
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

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, 
            gap: 2,
            width: "100%", 
          }}
        >
          <Button
            variant="contained"
            onClick={handleSaveChanges}
          >
            ذخیره تغییرات
          </Button>
          <Button
            variant="outlined"
            onClick={handleResetChanges}
          >
            بازنشانی
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar?.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
