import React, { useState } from 'react';
import { Box, Paper, Button, Typography } from '@mui/material';
import ConfirmationDialog from '../../components/ConfirmationDialog'; 
import { useToast } from '../../hooks/useToast'; 
import { persistor, store } from '../../store/store';

const DataManagementPage = () => {
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const { showToast } = useToast(); 

    const handleBackupAndPurge = async () => {
        setConfirmOpen(false);

        try {
            const currentState = store.getState();
            const jsonString = JSON.stringify(currentState, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const fileName = `hesabyar-backup-${new Date().toISOString().slice(0, 10)}.json`;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            showToast('فایل پشتیبان با موفقیت ایجاد شد.', 'success');

            await persistor.purge();

            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'یک خطای ناشناخته رخ داد';
            showToast(`فرآیند پشتیبان‌گیری با خطا مواجه شد: ${errorMessage}`, 'error');
            console.error("خطا در فرآیند پشتیبان‌گیری و پاکسازی:", error);
        }
    };

    return (
        <>
            <Box>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        پشتیبان‌گیری و پاکسازی داده‌ها
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        این عملیات یک نسخه پشتیبان از تمام اطلاعات برنامه دانلود کرده و سپس داده‌های فعلی را پاک می‌کند.
                    </Typography>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setConfirmOpen(true)}
                    >
                        شروع پشتیبان‌گیری و پاکسازی
                    </Button>
                </Paper>
            </Box>

            <ConfirmationDialog
                open={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleBackupAndPurge}
                title="تایید عملیات"
                message="آیا اطمینان دارید؟ ابتدا یک فایل پشتیبان دانلود و سپس تمام داده‌های برنامه پاک خواهند شد. این عمل غیرقابل بازگشت است."
            />
        </>
    );
};

export default DataManagementPage;