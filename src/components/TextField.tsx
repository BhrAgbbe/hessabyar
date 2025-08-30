import { TextField, TextFieldProps, InputAdornment, IconButton } from '@mui/material';
import React, { useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const CustomTextField: React.FC<TextFieldProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  const commonSx = {
    input: {
      textAlign: 'right',
      '&::placeholder': {
        textAlign: 'right',
      },
    },
    ...props.sx,
  };

  if (props.type === 'password') {
    return (
      <TextField
        {...props}
        variant="outlined"
        fullWidth
        type={showPassword ? 'text' : 'password'}
        sx={commonSx}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
          ...props.InputProps,
        }}
      />
    );
  }

  return (
    <TextField
      {...props}
      variant="outlined"
      fullWidth
      sx={commonSx}
    />
  );
};

export default CustomTextField;
