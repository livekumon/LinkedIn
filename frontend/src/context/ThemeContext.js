import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Get saved preference from localStorage or default to 'light'
    return localStorage.getItem('themeMode') || 'light';
  });

  useEffect(() => {
    // Save preference to localStorage whenever it changes
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#0077B5',
            light: '#00A3E0',
            dark: '#005885',
          },
          secondary: {
            main: '#00A3E0',
            light: '#33B5E8',
            dark: '#00729E',
          },
          warning: {
            main: '#F9A826',
            light: '#FAB851',
            dark: '#E09620',
          },
          ...(mode === 'light'
            ? {
                background: {
                  default: '#F4F6F8',
                  paper: '#FFFFFF',
                },
                text: {
                  primary: '#1C1C1C',
                  secondary: '#5F6B7A',
                },
                divider: '#E0E0E0',
              }
            : {
                background: {
                  default: '#121212',
                  paper: '#1E1E1E',
                },
                text: {
                  primary: '#FFFFFF',
                  secondary: '#B0B0B0',
                },
                divider: '#424242',
              }),
        },
        typography: {
          fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
          },
          h2: {
            fontWeight: 700,
            fontSize: '2rem',
          },
          h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
          },
          h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
          },
          h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
          },
          h6: {
            fontWeight: 600,
            fontSize: '1rem',
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 10,
        },
        shadows: [
          'none',
          mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.08)' : '0 2px 4px rgba(0, 0, 0, 0.4)',
          mode === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
          mode === 'light' ? '0 8px 24px rgba(0, 0, 0, 0.12)' : '0 8px 24px rgba(0, 0, 0, 0.6)',
          mode === 'light' ? '0 12px 32px rgba(0, 0, 0, 0.14)' : '0 12px 32px rgba(0, 0, 0, 0.7)',
          mode === 'light' ? '0 16px 40px rgba(0, 0, 0, 0.16)' : '0 16px 40px rgba(0, 0, 0, 0.8)',
          mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.08)' : '0 2px 4px rgba(0, 0, 0, 0.4)',
          mode === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
          mode === 'light' ? '0 8px 24px rgba(0, 0, 0, 0.12)' : '0 8px 24px rgba(0, 0, 0, 0.6)',
          mode === 'light' ? '0 12px 32px rgba(0, 0, 0, 0.14)' : '0 12px 32px rgba(0, 0, 0, 0.7)',
          mode === 'light' ? '0 16px 40px rgba(0, 0, 0, 0.16)' : '0 16px 40px rgba(0, 0, 0, 0.8)',
          mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.08)' : '0 2px 4px rgba(0, 0, 0, 0.4)',
          mode === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
          mode === 'light' ? '0 8px 24px rgba(0, 0, 0, 0.12)' : '0 8px 24px rgba(0, 0, 0, 0.6)',
          mode === 'light' ? '0 12px 32px rgba(0, 0, 0, 0.14)' : '0 12px 32px rgba(0, 0, 0, 0.7)',
          mode === 'light' ? '0 16px 40px rgba(0, 0, 0, 0.16)' : '0 16px 40px rgba(0, 0, 0, 0.8)',
          mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.08)' : '0 2px 4px rgba(0, 0, 0, 0.4)',
          mode === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
          mode === 'light' ? '0 8px 24px rgba(0, 0, 0, 0.12)' : '0 8px 24px rgba(0, 0, 0, 0.6)',
          mode === 'light' ? '0 12px 32px rgba(0, 0, 0, 0.14)' : '0 12px 32px rgba(0, 0, 0, 0.7)',
          mode === 'light' ? '0 16px 40px rgba(0, 0, 0, 0.16)' : '0 16px 40px rgba(0, 0, 0, 0.8)',
          mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.08)' : '0 2px 4px rgba(0, 0, 0, 0.4)',
          mode === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
          mode === 'light' ? '0 8px 24px rgba(0, 0, 0, 0.12)' : '0 8px 24px rgba(0, 0, 0, 0.6)',
          mode === 'light' ? '0 12px 32px rgba(0, 0, 0, 0.14)' : '0 12px 32px rgba(0, 0, 0, 0.7)',
        ],
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                padding: '10px 24px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.6)',
                },
              },
              contained: {
                boxShadow: mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.08)' : '0 2px 4px rgba(0, 0, 0, 0.4)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 10,
              },
              elevation3: {
                boxShadow: mode === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 10,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#00A3E0',
                    },
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0077B5',
                      borderWidth: 2,
                    },
                  },
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: 500,
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

