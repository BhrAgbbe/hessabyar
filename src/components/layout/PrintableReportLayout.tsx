import React from 'react';
import { Box, Typography, Button, Paper, GlobalStyles } from '@mui/material';

interface PrintableReportLayoutProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  primaryAction?: React.ReactNode;
}

const printGlobalStyles = {
  '@media print': {
    '.no-print': {
      display: 'none !important',
    },
    'body *': {
      visibility: 'hidden',
    },
    '.printable-area, .printable-area *': {
      visibility: 'visible',
    },
    '.printable-area': {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      padding: '1cm',
      boxSizing: 'border-box',
    },
  },
};

export const PrintableReportLayout: React.FC<PrintableReportLayoutProps> = ({ title, children, primaryAction }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <GlobalStyles styles={printGlobalStyles} />

      <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            '@media print': {
              display: 'none',
            },
          }}
        >
          <Typography variant="h4" sx={{ mr: 'auto' }}>
            {title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {primaryAction}
            <Button
              variant="contained"
              onClick={handlePrint}
              sx={{
                fontSize: { xs: '0.6rem', sm: '0.8rem' },
                px: { xs: 2 },
                py: { xs: 1 },
              }}
            >
              چاپ گزارش
            </Button>
          </Box>
        </Box>
        <Box className="printable-area">
          {children}
        </Box>
      </Paper>
    </>
  );
};