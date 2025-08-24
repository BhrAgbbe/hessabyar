import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';

const CustomTextField: React.FC<TextFieldProps> = (props) => {
  return (
    <TextField
      {...props}
      variant="outlined"
      fullWidth
      sx={{
        direction: 'rtl',
        '& .MuiInputLabel-root': {
          transformOrigin: 'top right', 
          left: 'auto',                
        },
        '& .MuiOutlinedInput-root legend': {
          textAlign: 'right',         
        },
        ...props.sx,
      }}
    />
  );
};

export default CustomTextField;