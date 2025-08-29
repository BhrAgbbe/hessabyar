import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import {
    Box, Paper, Typography, TextField, Button, Snackbar, Alert,
    InputAdornment, IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { RootState } from '../../store/store';
import { loginSuccess } from '../../store/slices/authSlice';
import { type Check } from '../../store/slices/checksSlice';

type LoginFormData = {
    username: string;
    password: string;
};

const LoginPage = () => {
    const dispatch = useDispatch();
    const users = useSelector((state: RootState) => state.users);
    const settings = useSelector((state: RootState) => state.settings);
    const checks = useSelector((state: RootState) => state.checks);

    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; severity: 'info' | 'warning' } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit } = useForm<LoginFormData>({
        defaultValues: { username: '', password: '' }
    });

    const checkForDueChecks = (userRole: string) => {
        if (settings.checkReminderWarning && (userRole === 'admin' || userRole === 'accountant')) {
            const today = new Date();
            const reminderLimit = new Date();
            reminderLimit.setDate(today.getDate() + settings.checkReminderDays);

            const upcomingChecks = checks.filter((check: Check) => {
                const dueDate = new Date(check.dueDate);
                return dueDate > today && dueDate <= reminderLimit;
            });

            if (upcomingChecks.length > 0) {
                setToast({
                    message: `شما ${upcomingChecks.length} چک نزدیک به سررسید دارید.`,
                    severity: 'warning'
                });
            }
        }
    };

    const onSubmit = (data: LoginFormData) => {
        const user = users?.find(u => u.username === data.username && u.password === data.password);
        if (user) {
            dispatch(loginSuccess(user));
            checkForDueChecks(user.role);
        } else {
            setError('نام کاربری یا رمز عبور اشتباه است.');
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <Paper sx={{ p: 4, width: 400, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>ورود به سیستم</Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Controller name="username" control={control} render={({ field }) => <TextField {...field} label="نام کاربری" fullWidth margin="normal" autoFocus />} />
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="رمز عبور"
                                type={showPassword ? 'text' : 'password'}
                                fullWidth
                                margin="normal"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                onMouseDown={(e) => e.preventDefault()}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )}
                    />
                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>ورود</Button>
                </form>
            </Paper>
            <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
                <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
            </Snackbar>
            <Snackbar open={!!toast} autoHideDuration={8000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={toast?.severity || 'info'} onClose={() => setToast(null)} sx={{ width: '100%' }}>
                    {toast?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LoginPage;