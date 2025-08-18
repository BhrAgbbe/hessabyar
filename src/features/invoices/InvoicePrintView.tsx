import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Divider } from '@mui/material';
import { type Invoice } from '../../store/slices/invoicesSlice';
import { type RootState } from '../../store/store';

export const InvoicePrintView: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
    const { products, customers, suppliers } = useSelector((state: RootState) => state);
    
    const person = invoice.customerId 
        ? customers.find(c => c.id === invoice.customerId)
        : suppliers.find(s => s.id === invoice.supplierId);

    const personType = invoice.customerId ? 'مشتری' : 'فروشنده';

    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, direction: 'rtl' }}>
            <Grid container justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                <Grid>
                    <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                        فاکتور
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>شماره: {invoice.invoiceNumber}</Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>تاریخ: {new Date(invoice.issueDate).toLocaleDateString('fa-IR')}</Typography>
                </Grid>
                <Grid sx={{ textAlign: 'left' }}>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>{personType}: {person?.name || 'ناشناس'}</Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>تلفن: {person?.phone || ''}</Typography>
                </Grid>
            </Grid>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>کالا</TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>تعداد</TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>قیمت واحد (تومان)</TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}>قیمت کل (تومان)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoice.items.map((item, index) => {
                            const product = products.find(p => p.id === item.productId);
                            return (
                                <TableRow key={index}>
                                    <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{product?.name || 'کالای حذف شده'}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{item.quantity.toLocaleString('fa-IR')}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{item.unitPrice.toLocaleString('fa-IR')}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{(item.quantity * item.unitPrice).toLocaleString('fa-IR')}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start ' }}>
                <Box sx={{ width: { xs: '100%', sm: 350 }, textAlign: 'right' }}>
                    <Grid container spacing={1} justifyContent="space-between" alignItems="center">
                        <Grid><Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>جمع کل:</Typography></Grid>
                        <Grid><Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>{invoice.subtotal.toLocaleString('fa-IR')} تومان</Typography></Grid>
                        
                        <Grid><Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>تخفیف:</Typography></Grid>
                        <Grid><Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>{invoice.discountAmount > 0 ? invoice.discountAmount.toLocaleString('fa-IR') : (invoice.subtotal * invoice.discountPercent / 100).toLocaleString('fa-IR')} تومان</Typography></Grid>
                        
                        <Grid><Divider sx={{ my: 1 }} /></Grid>

                        <Grid><Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>مبلغ نهایی:</Typography></Grid>
                        <Grid><Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{invoice.grandTotal.toLocaleString('fa-IR')} تومان</Typography></Grid>
                    </Grid>
                </Box>
            </Box>
        </Paper>
    );
};