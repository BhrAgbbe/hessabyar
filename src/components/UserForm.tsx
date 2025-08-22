import React from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CustomTextField from './TextField';
import { User } from '../store/slices/usersSlice';

type UserFormData = Omit<User, "id">;

interface UserFormProps {
  control: Control<UserFormData>;
  errors: FieldErrors<UserFormData>;
}

const userRoles: User['role'][] = ["مدیر سیستم", "فروشنده", "حسابدار", "انباردار"];

const UserForm: React.FC<UserFormProps> = ({ control, errors }) => {
  return (
    <Box component="form" sx={{ direction: 'rtl', pt: 1 }} noValidate>
      <Controller
        name="username"
        control={control}
        rules={{ required: 'نام کاربری اجاری است' }}
        render={({ field }) => (
          <CustomTextField
            {...field}
            autoFocus
            margin="dense"
            label="نام کاربری"
            error={!!errors.username}
            helperText={errors.username?.message}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        rules={{
          required: 'رمز عبور اجباری است',
          minLength: { value: 4, message: 'رمز عبور باید حداقل ۴ حرف باشد' },
        }}
        render={({ field }) => (
          <CustomTextField
            {...field}
            type="password"
            margin="dense"
            label="رمز عبور"
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        )}
      />
      <FormControl fullWidth margin="dense" error={!!errors.role}>
        <InputLabel>نقش کاربر</InputLabel>
        <Controller
          name="role"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select {...field} label="نقش کاربر">
              {userRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>
    </Box>
  );
};

export default UserForm;