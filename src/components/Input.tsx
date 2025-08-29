import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

type CustomInputProps = TextFieldProps & {
};

const CustomInput: React.FC<CustomInputProps> = (props) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      {...props}
    />
  );
};

export default CustomInput;