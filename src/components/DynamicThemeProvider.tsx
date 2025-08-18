import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {type RootState } from '../store/store';
import { theme as baseTheme } from '../styles/theme'; 

interface DynamicThemeProviderProps {
  children: React.ReactNode;
}

const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({ children }) => {
  const settings = useSelector((state: RootState) => state.settings);

  const dynamicTheme = useMemo(() => {
    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        background: {
          ...baseTheme.palette.background,
          default: settings.backgroundColor, 
        },
      },
    });
  }, [settings.backgroundColor]);

  return (
    <ThemeProvider theme={dynamicTheme}>
      {children}
    </ThemeProvider>
  );
};

export default DynamicThemeProvider;