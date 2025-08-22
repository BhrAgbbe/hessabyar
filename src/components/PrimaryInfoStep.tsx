import React, { ChangeEvent } from 'react';
import { Box } from '@mui/material';
import CustomTextField from './TextField';
import { CompanyInfo } from '../store/slices/companySlice';

interface PrimaryInfoStepProps {
  formData: CompanyInfo;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: { [key: string]: string };
}

const PrimaryInfoStep: React.FC<PrimaryInfoStepProps> = ({ formData, handleChange, errors }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
      <CustomTextField
        name="name"
        label="نام شرکت"
        value={formData.name}
        onChange={handleChange}
        autoFocus
        required
        error={!!errors.name}
        helperText={errors.name}
        sx={{ width: '80%' }}
      />
      <CustomTextField
        name="managerName"
        label="نام مدیر"
        value={formData.managerName}
        onChange={handleChange}
        required
        error={!!errors.managerName}
        helperText={errors.managerName}
        sx={{ width: '80%' }}
      />
      <CustomTextField
        name="economicCode"
        label="کد اقتصادی"
        value={formData.economicCode}
        onChange={handleChange}
        required
        error={!!errors.economicCode}
        helperText={errors.economicCode}
        sx={{ width: '80%' }}
      />
    </Box>
  );
};

export default PrimaryInfoStep;