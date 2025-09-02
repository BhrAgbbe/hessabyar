import { Box, Paper, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import type { RootState, AppDispatch } from '../../store/store'; 
import { updateUser } from '../../store/slices/usersSlice'; 
import { useToast } from '../../hooks/useToast';
import Form, { type FormField } from '../../components/Form';
import { changePasswordSchema, type ChangePasswordFormData, getDefaultValues } from '../../schema/changePasswordSchema';

const ChangePasswordPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { showToast } = useToast();
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);

    const { control, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormData>({
        resolver: yupResolver(changePasswordSchema),
        defaultValues: getDefaultValues()
    });
    
    const formConfig: FormField<ChangePasswordFormData>[] = [
        {
            name: 'currentPassword',
            label: 'کلمه عبور فعلی',
            type: 'password'
        },
        {
            name: 'newPassword',
            label: 'کلمه عبور جدید',
            type: 'password'
        },
        {
            name: 'confirmPassword',
            label: 'تکرار کلمه عبور جدید',
            type: 'password'
        }
    ];
    
    // تابع onSubmit برای مدیریت عملیات آسنکرون بهینه شد
    const onSubmit = async (data: ChangePasswordFormData) => {
        if (!currentUser) {
            showToast('کاربر فعلی یافت نشد.', 'error');
            return;
        }

        if (data.currentPassword === currentUser.password) {
            try {
                // **اصلاح شد: از updateUser استفاده می‌شود**
                await dispatch(updateUser({ ...currentUser, password: data.newPassword as string })).unwrap();
                showToast('رمز عبور با موفقیت تغییر کرد.', 'success');
            } catch (error) {
                const err = error as { message: string };
                showToast(err.message || 'خطا در برقراری ارتباط با سرور', 'error');
            }
        } else {
            showToast('رمز عبور فعلی اشتباه است.', 'error');
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Paper sx={{ p: 3, width: '100%', maxWidth: 400 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Form
                        config={formConfig}
                        control={control}
                        errors={errors}
                    />
                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
                        تغییر کلمه عبور
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default ChangePasswordPage;