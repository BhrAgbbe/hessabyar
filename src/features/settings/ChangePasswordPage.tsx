import { Box, Paper, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { editUser } from '../../store/slices/usersSlice';
import { useToast } from '../../hooks/useToast'; 
import Form, { type FormField } from '../../components/Form'; 

type ChangePasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const ChangePasswordPage = () => {
    const dispatch = useDispatch();
    const { showToast } = useToast();
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);

    const { control, handleSubmit, watch, formState: { errors } } = useForm<ChangePasswordFormData>({
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
    });
    
    const newPassword = watch('newPassword');

    const formConfig: FormField<ChangePasswordFormData>[] = [
        {
            name: 'currentPassword',
            label: 'کلمه عبور فعلی',
            type: 'password',
            rules: { required: 'این فیلد الزامی است' }
        },
        {
            name: 'newPassword',
            label: 'کلمه عبور جدید',
            type: 'password',
            rules: { 
                required: 'این فیلد الزامی است',
                minLength: { value: 4, message: 'کلمه عبور باید حداقل ۴ کاراکتر باشد' }
            }
        },
        {
            name: 'confirmPassword',
            label: 'تکرار کلمه عبور جدید',
            type: 'password',
            rules: {
                required: 'این فیلد الزامی است',
                validate: value => value === newPassword || 'کلمه‌های عبور یکسان نیستند'
            }
        }
    ];
    
    const onSubmit = (data: ChangePasswordFormData) => {
        if (currentUser && data.currentPassword === currentUser.password) {
            dispatch(editUser({ ...currentUser, password: data.newPassword }));
            showToast('رمز عبور با موفقیت تغییر کرد.', 'success');
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