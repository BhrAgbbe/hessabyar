import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

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
        <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
          چاپ گزارش
        </Button>
      </Box>
      <Box className="printable-area">
        <Box sx={{ display: 'none', '@media print': { display: 'block', textAlign: 'center', mb: 3 } }}>
            <Typography variant="h5">نرم‌افزار یکپارچه حسابداری و فروش</Typography>
            <Typography variant="h6">{title}</Typography>
            <hr/>
        </Box>
        {children}
      </Box>
    </Paper>
  );
};