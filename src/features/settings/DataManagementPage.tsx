import React from 'react';
import { Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { persistor } from '../../store/store';

const DataManagementPage = () => {
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    const handleCompress = async () => {
        setConfirmOpen(false);
        await persistor.purge(); 
        window.location.reload();
    };

    return (
        <>
            <Box>
                <Typography variant="h4" gutterBottom  sx={{textAlign:'center', fontSize: { xs: '0.75rem', sm: '1.5rem' } }}>مدیریت داده‌ها</Typography>
                <Paper sx={{ p: 3 }}>
                    <Typography>
                        **هشدار:** این عمل تمام داده‌های ذخیره شده در حافظه مرورگر شما (شامل کاربران، فاکتورها، کالاها و...) را پاک می‌کند. این کار برای سبک‌سازی برنامه در مواقع ضروری است.
                    </Typography>
                    <Button variant="contained" color="error" sx={{mt: 2}} onClick={() => setConfirmOpen(true)}>
                        شروع فشرده‌سازی اطلاعات
                    </Button>
                </Paper>
            </Box>
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>تایید عملیات</DialogTitle>
                <DialogContent>
                    <DialogContentText>آیا از پاک کردن تمام داده‌ها اطمینان دارید؟ این عمل غیرقابل بازگشت است.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>انصراف</Button>
                    <Button onClick={handleCompress} color="error">بله، پاک کن</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DataManagementPage;
