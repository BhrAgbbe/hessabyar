import React from 'react';
import { Box, Paper, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
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
                <Paper sx={{ p: 3 }}>

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
