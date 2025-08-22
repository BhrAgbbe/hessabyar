import React, { ChangeEvent } from 'react';
import { Box } from '@mui/material';
import CustomTextField from './TextField';
import { CompanyInfo } from '../store/slices/companySlice';


interface ContactInfoStepProps {
  formData: CompanyInfo;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: { [key: string]: string };
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({ formData, handleChange, errors }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
      <CustomTextField
        name="phone"
        label="شماره تلفن"
        value={formData.phone}
        onChange={handleChange}
        autoFocus
        required
        error={!!errors.phone}
        helperText={errors.phone}
        sx={{ width: '80%' }}
      />
      <CustomTextField
        name="mobile"
        label="شماره همراه"
        value={formData.mobile}
        onChange={handleChange}
        required
        error={!!errors.mobile}
        helperText={errors.mobile}
        sx={{ width: '80%' }}
      />
      <CustomTextField
        name="fax"
        label="فکس"
        value={formData.fax}
        onChange={handleChange}
        sx={{ width: '80%' }}
      />
      <CustomTextField
        name="address"
        label="آدرس"
        value={formData.address}
        onChange={handleChange}
        multiline
        rows={3}
        required
        error={!!errors.address}
        helperText={errors.address}
        sx={{ width: '80%' }}
      />
    </Box>
  );
};

export default ContactInfoStep;