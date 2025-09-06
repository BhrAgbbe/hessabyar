import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Divider } from '@mui/material';
import {type Invoice } from '../../types/invoice';
import { type RootState } from '../../store/store';
import { toPersianDigits, toPersianDigitsString } from '../../utils/utils'; 

export const InvoicePrintView: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
    const { products, customers, suppliers } = useSelector((state: RootState) => state);
    
    const person = invoice.customerId 
        ? customers.find(c => c.id === invoice.customerId)
        : suppliers.find(s => s.id === invoice.supplierId);

    const personType = invoice.customerId ? 'مشتری' : 'فروشنده';
    
    const discount = invoice.discountAmount > 0 
        ? invoice.discountAmount 
        : (invoice.subtotal * invoice.discountPercent / 100);

    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                <Grid>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>فاکتور شماره: {toPersianDigits(invoice.invoiceNumber)}</Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>تاریخ: {new Date(invoice.issueDate).toLocaleDateString('fa-IR')}</Typography>
                </Grid>
                <Grid sx={{ textAlign: 'left' }}>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>{personType}: {person?.name || 'ناشناس'}</Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>تلفن: {toPersianDigitsString(person?.phone || '')}</Typography>
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
                                    <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{toPersianDigits(item.quantity)}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{toPersianDigits(item.unitPrice)}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{toPersianDigits(item.quantity * item.unitPrice)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ width: { xs: '100%', sm: 350 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>جمع کل:</Typography>
                        <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>{toPersianDigits(invoice.subtotal)} تومان</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>تخفیف:</Typography>
                        <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>{toPersianDigits(discount)} تومان</Typography>
                    </Box>
                    
                    <Divider sx={{ my: 0.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>مبلغ نهایی:</Typography>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{toPersianDigits(invoice.grandTotal)} تومان</Typography>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};