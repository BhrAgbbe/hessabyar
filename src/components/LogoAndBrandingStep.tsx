import React, { ChangeEvent } from 'react';
import { Box, Avatar, Button } from '@mui/material';
import CustomTextField from './TextField';
import { CompanyInfo } from '../store/slices/companySlice';

interface LogoAndBrandingStepProps {
  formData: CompanyInfo;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleLogoChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const LogoAndBrandingStep: React.FC<LogoAndBrandingStepProps> = ({ formData, handleChange, handleLogoChange }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
        <Avatar src={formData.logo || undefined} sx={{ width: 100, height: 100, mb: 2 }} />
        <Button variant="outlined" component="label">
          آپلود لوگو
          <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
        </Button>
      </Box>
      <CustomTextField
        name="promoMessage"
        label="پیام تبلیغاتی"
        value={formData.promoMessage}
        onChange={handleChange}
        multiline
        rows={3}
        sx={{ width: '80%' }}
      />
    </Box>
  );
};

export default LogoAndBrandingStep;