import React, { useState } from 'react';
import { Box, Paper, Button, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store/store';
import { useToast } from '../../hooks/useToast'; 
import ConfirmationDialog from '../../components/ConfirmationDialog'; 

import { setAllSettings } from '../../store/slices/settingsSlice';
import { setAllUsers } from '../../store/slices/usersSlice';


const BackupPage = () => {
    const dispatch = useDispatch();
    const allState = useSelector((state: RootState) => state);
    const { showToast } = useToast();

    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [restoredState, setRestoredState] = useState<RootState | null>(null);

    const handleSaveBackup = () => {
        try {
            const jsonString = JSON.stringify(allState, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `hesabyar-backup-${new Date().toISOString().slice(0, 10)}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            showToast('فایل پشتیبان با موفقیت دانلود شد.', 'success');
        } catch (error) {
            showToast('خطا در ایجاد فایل پشتیبان.', 'error');
            console.error("Backup failed:", error);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = (e) => {
            try {
                if (!e.target?.result) throw new Error("فایل خالی است.");
                const parsedState = JSON.parse(e.target.result as string);
                
                setRestoredState(parsedState);
                setConfirmOpen(true);
            } catch {
                showToast('فایل پشتیبان نامعتبر یا خراب است.', 'error');
            }
        };
        event.target.value = '';
    };

    const handleConfirmRestore = () => {
        if (!restoredState) return;
        
        try {
            if (restoredState.settings) dispatch(setAllSettings(restoredState.settings));
            if (restoredState.users) dispatch(setAllUsers(restoredState.users));

            showToast('اطلاعات با موفقیت بازیابی شد. لطفاً صفحه را رفرش کنید.', 'success');
        } catch (error) {
            showToast('خطا در فرآیند بازیابی اطلاعات.', 'error');
            console.error("Restore failed:", error);
        } finally {
            setConfirmOpen(false);
            setRestoredState(null);
        }
    };

    return (
        <>
            <Box>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>پشتیبان‌گیری و بازیابی اطلاعات</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        از تمام اطلاعات برنامه یک نسخه پشتیبان تهیه کنید یا اطلاعات خود را از یک فایل پشتیبان بازیابی نمایید.
                    </Typography>

                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' } 
                    }}>
                        <Button variant="contained" onClick={handleSaveBackup}>
                            دانلود فایل پشتیبان
                        </Button>
                        <Button variant="outlined" component="label">
                            بازیابی از فایل پشتیبان
                            <input
                                type="file"
                                hidden
                                accept=".json"
                                onChange={handleFileSelect}
                            />
                        </Button>
                    </Box>
                </Paper>
            </Box>

            <ConfirmationDialog
                open={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmRestore}
                title="تایید بازیابی اطلاعات"
                message="آیا از بازیابی اطلاعات اطمینان دارید؟ تمام داده‌های فعلی شما با اطلاعات موجود در فایل پشتیبان جایگزین خواهند شد. این عمل غیرقابل بازگشت است."
            />
        </>
    );
};

export default BackupPage;