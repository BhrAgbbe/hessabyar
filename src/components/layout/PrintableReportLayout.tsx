import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface PrintableReportLayoutProps {
  title?: React.ReactNode; 
  children: React.ReactNode;
}

export const PrintableReportLayout: React.FC<PrintableReportLayoutProps> = ({ title, children }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }} className="no-print">
        <Typography variant="h4">{title}</Typography>
        <Button variant="contained" onClick={handlePrint}>
          چاپ گزارش
        </Button>
      </Box>
      <Box className="printable-area">
        {children}
      </Box>
    </Paper>
  );
};