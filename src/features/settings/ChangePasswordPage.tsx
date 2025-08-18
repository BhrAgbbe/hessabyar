import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Snackbar, Alert, InputAdornment, IconButton } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { editUser } from '../../store/slices/usersSlice';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type ChangePasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const ChangePasswordPage = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'} | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { control, handleSubmit, watch, formState: { errors } } = useForm<ChangePasswordFormData>({
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
    });
    const newPassword = watch('newPassword');
    const onSubmit = (data: ChangePasswordFormData) => {
        if (currentUser && data.currentPassword === currentUser.password) {
            dispatch(editUser({ ...currentUser, password: data.newPassword }));
            setSnackbar({open: true, message: 'رمز عبور با موفقیت تغییر کرد.', severity: 'success'});
        } else {
            setSnackbar({open: true, message: 'رمز عبور فعلی اشتباه است.', severity: 'error'});
        }
    };

    return (
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
            <Paper sx={{ p: 3, width: '100%', maxWidth: 400 }}>
                <Typography variant="h4" gutterBottom sx={{textAlign:'center', fontSize: { xs: '0.75rem', sm: '1.5rem' } }}>تغییر کلمه عبور</Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Controller name="currentPassword" control={control} rules={{required: true}}
                        render={({ field }) => (
                            <TextField {...field} label="کلمه عبور فعلی" type={showCurrentPassword ? 'text' : 'password'} fullWidth margin="normal" 
                                InputProps={{
                                    endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">{showCurrentPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                                }}
                            />
                        )}
                    />
                    <Controller name="newPassword" control={control} rules={{required: true, minLength: 4}}
                        render={({ field }) => (
                            <TextField {...field} label="کلمه عبور جدید" type={showNewPassword ? 'text' : 'password'} fullWidth margin="normal" error={!!errors.newPassword} helperText={errors.newPassword ? 'حداقل ۴ کاراکتر' : ''}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">{showNewPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                                }}
                            />
                        )}
                    />
                    <Controller name="confirmPassword" control={control} rules={{required: true, validate: value => value === newPassword || 'رمزهای عبور یکسان نیستند'}}
                        render={({ field }) => (
                            <TextField {...field} label="تکرار کلمه عبور جدید" type={showConfirmPassword ? 'text' : 'password'} fullWidth margin="normal" error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                                }}
                            />
                        )}
                    />
                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>تغییر کلمه عبور</Button>
                </form>
            </Paper>
            {snackbar && <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(null)}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>}
        </Box>
    );
};

export default ChangePasswordPage;