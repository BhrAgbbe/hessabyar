import React from "react";
import { Box, Typography, Paper, Button, Snackbar, Alert } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "../../store/store";
import { setAllSettings } from "../../store/slices/settingsSlice";
import { setAllUsers } from "../../store/slices/usersSlice";

const BackupPage = () => {
  const dispatch = useDispatch();
  const allState = useSelector((state: RootState) => state);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const handleSaveBackup = () => {
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(allState)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      setSnackbar({
        open: true,
        message: "فایل پشتیبان با موفقیت دانلود شد.",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "خطا در ایجاد فایل پشتیبان.",
        severity: "error",
      });
    }
  };

  const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (e.target?.result) {
          try {
            const restoredState = JSON.parse(e.target.result as string);
            dispatch(setAllSettings(restoredState.settings));
            dispatch(setAllUsers(restoredState.users));
            alert(
              "برای بازیابی کامل، باید تمام اکشن‌های setAll در Redux پیاده‌سازی شوند. این بخش به عنوان نمونه است."
            );
            setSnackbar({
              open: true,
              message: "اطلاعات با موفقیت بازیابی شد. لطفاً صفحه را رفرش کنید.",
              severity: "success",
            });
          } catch {
            setSnackbar({
              open: true,
              message: "فایل پشتیبان نامعتبر است.",
              severity: "error",
            });
          }
        }
      };
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", fontSize: { xs: "0.75rem", sm: "1.5rem" } }}
      >
        نسخه پشتیبان
      </Typography>
      <Paper sx={{ p: 3, display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handleSaveBackup}>
          ذخیره اطلاعات
        </Button>
        <Button variant="outlined" component="label">
          بازگرداندن اطلاعات
          <input
            type="file"
            hidden
            accept=".json"
            onChange={handleRestoreBackup}
          />
        </Button>
      </Paper>
      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(null)}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default BackupPage;
