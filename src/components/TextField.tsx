import { TextField, TextFieldProps, InputAdornment, IconButton } from '@mui/material';
import React, { useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const CustomTextField: React.FC<TextFieldProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  if (props.type === 'password') {
    return (
      <TextField
        {...props} 
        variant="outlined"
        fullWidth
        type={showPassword ? 'text' : 'password'}
        sx={{ input: { textAlign: 'right' }, ...props.sx }}
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
      sx={{ input: { textAlign: 'right' }, ...props.sx }}
    />
  );
};

export default CustomTextField;