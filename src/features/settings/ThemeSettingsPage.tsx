import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Paper, TextField, InputAdornment, Button } from '@mui/material';
import type { RootState } from '../../store/store';
import { updateSetting } from '../../store/slices/settingsSlice';
import type { AppSettings } from '../../store/slices/settingsSlice';

const ThemeSettingsPage = () => {
    const dispatch = useDispatch();
    const settings = useSelector((state: RootState) => state.settings);

    const handleSettingChange = (key: keyof AppSettings, value: string) => {
        dispatch(updateSetting({ key, value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    dispatch(updateSetting({ key: 'backgroundImage', value: event.target.result as string }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
            }}
        >

            <Paper sx={{p: 3, maxWidth: 600, width: '100%' }}>
                <Typography variant="h6">رنگ پس‌زمینه</Typography>
                <TextField
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                    label="انتخاب رنگ"
                    fullWidth
                    InputProps={{
                        startAdornment: <InputAdornment position="start">Color</InputAdornment>,
                    }}
                    sx={{mt: 2}}
                />

                <Typography variant="h6" sx={{mt: 4}}>تصویر پس‌زمینه</Typography>
                <Button variant="outlined" component="label" sx={{mt: 2}}>
                    انتخاب تصویر از سیستم
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
                {settings.backgroundImage && (
                    <Button variant="text" color="error" sx={{mt: 2, ml: 2}} onClick={() => handleSettingChange('backgroundImage', '')}>
                        حذف تصویر
                    </Button>
                )}
            </Paper>
        </Box>
    );
};

export default ThemeSettingsPage;