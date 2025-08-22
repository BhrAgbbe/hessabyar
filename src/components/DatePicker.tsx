import React from 'react';
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali'; 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';

interface ShamsiDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const ShamsiDatePicker: React.FC<ShamsiDatePickerProps> = ({ label, value, onChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        slots={{ textField: TextField }}
        slotProps={{
          textField: {
            fullWidth: true,
            variant: 'outlined',
            sx: {
              '& label': {
                right: 35,
                left: 'auto',
                transformOrigin: 'top right',
              },
              '& label.Mui-focused': {
                transform: 'translate(-14px, -9px) scale(0.75)',
              },
              '& .MuiOutlinedInput-root': {
                direction: 'rtl',
                '& fieldset': {
                  textAlign: 'right',
                },
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default ShamsiDatePicker;