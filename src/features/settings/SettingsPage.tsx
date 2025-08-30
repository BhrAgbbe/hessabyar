import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { RootState } from "../../store/store";
import { setAllSettings } from "../../store/slices/settingsSlice";
import {type AppSettings } from '../../types/settings';

import { useToast } from "../../hooks/useToast";

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const savedSettings = useSelector((state: RootState) => state.settings);

  const [localSettings, setLocalSettings] = useState<AppSettings>(savedSettings);

  useEffect(() => {
    setLocalSettings(savedSettings);
  }, [savedSettings]);


  const writeSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocalSettings((prev) => {
      const next = { ...prev, [key]: value } as unknown as AppSettings;
      return next;
    });
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as keyof AppSettings;
    const checked = event.target.checked;
    writeSetting(name, checked as AppSettings[typeof name]);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as keyof AppSettings;
    const raw = event.target.value;
    if (raw === "") {
      writeSetting(name, 0 as AppSettings[typeof name]);
      return;
    }
    const numericValue = parseInt(raw, 10);
    if (!Number.isNaN(numericValue)) {
      writeSetting(name, numericValue as AppSettings[typeof name]);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const name = event.target.name as keyof AppSettings;
    const value = event.target.value as AppSettings[typeof name];
    writeSetting(name, value);
  };

  const handleSaveChanges = () => {
    dispatch(setAllSettings(localSettings));
    showToast("تنظیمات با موفقیت ذخیره شد!", "success");
  };

  const handleResetChanges = () => {
    setLocalSettings(savedSettings);
    showToast("تغییرات بازنشانی شد.", "info");
  };

  const SettingItem: React.FC<{
    name: keyof AppSettings;
    label: string;
    children?: React.ReactNode;
  }> = ({ name, label, children }) => (
    <Box>
      <FormControlLabel
        labelPlacement="start"
        sx={{
          width: "100%",
          justifyContent: "space-between",
          ml: 0,
          "& .MuiFormControlLabel-label": { fontSize: "0.9rem" },
        }}
        control={
          <Switch
            checked={Boolean(localSettings[name])}
            onChange={handleSwitchChange}
            name={String(name)}
            inputProps={{ "aria-label": label }}
            size="small"
          />
        }
        label={label}
      />
      {children}
    </Box>
  );

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: "800px", margin: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        تنظیمات برنامه
      </Typography>

      <Typography variant="h6" sx={{ mb: 2 }}>
        تنظیمات عمومی
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pl: 1 }}>
        <SettingItem name="checkReminderWarning" label="هشدار اعلام زمان باقی مانده چک">
          {localSettings.checkReminderWarning && (
            <TextField
              label="تعداد روز قبل از سررسید"
              name="checkReminderDays"
              type="number"
              value={localSettings.checkReminderDays ?? ""}
              onChange={handleTextChange}
              variant="outlined"
              size="small"
              sx={{ mt: 1.5, width: "100%", maxWidth: "250px" }}
              InputProps={{ inputProps: { min: 1 } }}
            />
          )}
        </SettingItem>
        <Divider />
        <SettingItem name="syncCustomersToContacts" label="ارتباط و افزودن اطلاعات مشتریان به دفترچه تلفن" />
        <Divider />
        <SettingItem name="autoBackupOnExit" label="انجام خودکار پشتیبان گیری هنگام بستن برنامه" />
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        تنظیمات فاکتور
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pl: 1 }}>
        <SettingItem name="allowUserDiscount" label="فعال کردن تخفیف ویژه برای کاربر عادی" />
        <Divider />
        <SettingItem name="autoAddQuantity" label="درج خودکار تعداد کالا در فاکتور فروش (پیش‌فرض ۱)" />
        <Divider />
        <SettingItem name="useBarcodeScanner" label="از دستگاه بارکدخوان استفاده می‌شود" />
        <Divider />
        <SettingItem name="checkStockOnHand" label="بررسی موجودی انبار در فروش (جلوگیری از فروش منفی)" />
        <Divider />
        <SettingItem name="showDebtOnInvoice" label="نمایش بدهی در چاپ فاکتور" />
        <Divider />
        <SettingItem name="showProfitOnInvoice" label="نمایش سود در فاکتور فروش (فقط مدیر)" />
        <Divider />
        <SettingItem name="quickPrintInvoice" label="چاپ سریع فاکتور" />
      </Box>

      <FormControl sx={{ mt: 3, width: { xs: "100%", sm: 250 } }} size="small">
        <InputLabel>اندازه چاپ فاکتور</InputLabel>
        <Select value={localSettings.invoicePrintSize ?? ""} label="اندازه چاپ فاکتور" name="invoicePrintSize" onChange={handleSelectChange}>
          <MenuItem value="A4">A4</MenuItem>
          <MenuItem value="A5">A5</MenuItem>
          <MenuItem value="Receipt">فیش پرینتر</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button variant="contained" onClick={handleSaveChanges}>
          ذخیره تغییرات
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleResetChanges}>
          بازنشانی
        </Button>
      </Box>
    </Paper>
  );
};

export default SettingsPage;
