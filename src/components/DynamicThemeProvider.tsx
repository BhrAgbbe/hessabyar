import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import type { RootState } from '../store/store';
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
        primary: {
          main: settings.primaryColor || baseTheme.palette.primary.main,
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: settings.backgroundColor,
              backgroundImage: settings.backgroundImage
                ? `url(${settings.backgroundImage})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
            },
          },
        },
      },
    });
  }, [settings.backgroundColor, settings.backgroundImage, settings.primaryColor]);

  return (
    <ThemeProvider theme={dynamicTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default DynamicThemeProvider;