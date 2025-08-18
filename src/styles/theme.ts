import { createTheme } from '@mui/material/styles';

const palette = {
  primary: {
    main: '#7367F0',
    light: '#9e95f5',
    dark: '#5e54d6',
  },
  secondary: {
    main: '#82868B',
  },
  background: {
    default: '#F8F7FA',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#5E5873',
    secondary: '#6E6B7B',
  },
  error: {
    main: '#EA5455',
  },
  warning: {
    main: '#FF9F43',
  },
  info: {
    main: '#00CFE8',
  },
  success: {
    main: '#28C76F',
  }
};

export const theme = createTheme({
  direction: 'ltr', 
  
  palette: palette,

  typography: {
    fontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
    h4: {
        fontWeight: 600,
        fontSize: '1.75rem',
        color: palette.text.primary,
    },
    h6: {
        fontWeight: 600,
        color: palette.text.primary,
    }
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        },
        elevation1: {
            boxShadow: '0px 2px 10px 0px rgba(94, 88, 115, 0.07)',
        },
      }
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                backgroundColor: palette.background.paper,
                borderRight: 'none', 
            }
        }
    },
    MuiListItemButton: {
        styleOverrides: {
            root: {
                color: palette.text.primary,
                margin: '0 12px',
                borderRadius: 8,
                '&.Mui-selected': {
                    backgroundColor: palette.primary.main,
                    color: '#FFFFFF',
                    '& .MuiListItemIcon-root': {
                        color: '#FFFFFF',
                    },
                    '&:hover': {
                        backgroundColor: palette.primary.dark,
                    }
                },
            },
        },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: palette.background.paper,
                color: palette.text.primary,
                boxShadow: '0px 2px 10px 0px rgba(94, 88, 115, 0.07)',
            }
        }
    }
  },
});
