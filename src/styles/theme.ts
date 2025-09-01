import { createTheme, type ThemeOptions } from '@mui/material/styles';

const palette = {
  primary: {
    main: "#7367F0",
    light: "#9e95f5",
    dark: "#5e54d6",
  },
  secondary: {
    main: "#82868B",
  },
  background: {
    default: "#F8F7FA",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#5E5873",
    secondary: "#6E6B7B",
  },
  error: { main: "#EA5455" },
  warning: { main: "#FF9F43" },
  info: { main: "#00CFE8" },
  success: { main: "#28C76F" },
};

const themeOptions: ThemeOptions = {
  direction: 'rtl',
  palette: palette,
  typography: {
    fontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          
          '& .MuiInputLabel-root': {
            transformOrigin: 'top right',
            right: '1.75rem',
            left: 'auto',
          },
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);