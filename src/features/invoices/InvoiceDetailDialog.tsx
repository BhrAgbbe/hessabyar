import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Box, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Divider,
  Grid, IconButton, TextField, DialogContentText
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { type RootState } from '../../store/store';
import { type Invoice, updateInvoice } from '../../store/slices/invoicesSlice';

const toPersianDigits = (num: number | string) => {
    if (num === null || num === undefined || num === '') return '';
    return new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(Number(num));
};

const parseNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const str = String(value);
    const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let res = str;
    for (let i = 0; i < 10; i++) {
        res = res.replace(new RegExp(persian[i], 'g'), english[i]);
    }
    return parseFloat(res) || 0;
};

export const InvoiceDetailDialog: React.FC<{open: boolean; onClose: () => void; invoice: Invoice | null;}> = ({ open, onClose, invoice }) => {
  const dispatch = useDispatch();
  const { products, settings, auth, customers } = useSelector((state: RootState) => state);
  const [isEditing, setIsEditing] = useState(false);
  const [editableInvoice, setEditableInvoice] = useState<Invoice | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });

  const customer = customers.find(c => c.id === invoice?.customerId);
  const invoiceProfit = editableInvoice?.items.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      const purchasePrice = product?.purchasePrice || 0;
      return acc + (item.unitPrice - purchasePrice) * item.quantity;
  }, 0) || 0;

  const calculateTotals = (currentInvoice: Invoice): Partial<Invoice> => {
      const subtotal = currentInvoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      const discountValue = currentInvoice.discountAmount > 0 
          ? currentInvoice.discountAmount 
          : subtotal * (currentInvoice.discountPercent / 100);
      const grandTotal = subtotal - discountValue;
      return { subtotal, grandTotal };
  };

  useEffect(() => {
    if (invoice) {
      setEditableInvoice(JSON.parse(JSON.stringify(invoice)));
    }
    if (!open) {
        setIsEditing(false);
    }
  }, [invoice, open]);

  const handleItemChange = (index: number, field: 'quantity' | 'unitPrice', value: string) => {
    if (!editableInvoice) return;
    const newItems = [...editableInvoice.items];
    newItems[index] = { ...newItems[index], [field]: parseNumber(value) };
    const updatedTotals = calculateTotals({ ...editableInvoice, items: newItems });
    setEditableInvoice({ ...editableInvoice, items: newItems, ...updatedTotals });
  };
  
  const handleRemoveItem = (index: number) => {
    if (!editableInvoice) return;
    const newItems = editableInvoice.items.filter((_, i) => i !== index);
    const updatedTotals = calculateTotals({ ...editableInvoice, items: newItems });
    setEditableInvoice({ ...editableInvoice, items: newItems, ...updatedTotals });
  };
  
  const handleDiscountChange = (field: 'discountAmount' | 'discountPercent', value: string) => {
      if (!editableInvoice) return;
      const numericValue = parseNumber(value);
      const updatedInvoice = { ...editableInvoice };

      if (field === 'discountAmount') {
          updatedInvoice.discountAmount = numericValue;
          updatedInvoice.discountPercent = 0; 
      } else {
          updatedInvoice.discountPercent = numericValue;
          updatedInvoice.discountAmount = 0;
      }
      
      const updatedTotals = calculateTotals(updatedInvoice);
      setEditableInvoice({ ...updatedInvoice, ...updatedTotals });
  };

  const handleSave = () => {
    if (editableInvoice) {
      dispatch(updateInvoice(editableInvoice));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (invoice) {
        setEditableInvoice(JSON.parse(JSON.stringify(invoice)));
    }
    setIsEditing(false);
  };
  
  if (!editableInvoice) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptLongIcon sx={{ mr: 1 }} />
            <Typography variant="h5" component="div">
              جزئیات فاکتور شماره {toPersianDigits(editableInvoice.invoiceNumber)}
            </Typography>
          </Box>
          {!isEditing && (
            <IconButton onClick={() => setIsEditing(true)}>
              <EditIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: '#f9fafb', p: 3 }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f0f2f5' }}>
                <TableRow>
                  <TableCell>کالا</TableCell>
                  <TableCell align="right">تعداد</TableCell>
                  <TableCell align="right">قیمت واحد (تومان)</TableCell>
                  <TableCell align="right">قیمت کل (تومان)</TableCell>
                  {isEditing && <TableCell align="center">حذف</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {editableInvoice.items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <TableRow key={index}>
                      <TableCell>{product?.name || 'کالای حذف شده'}</TableCell>
                      <TableCell align="right">
                        {isEditing ? (
                          <TextField size="small" variant="outlined" value={toPersianDigits(item.quantity)}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} sx={{ width: '80px', direction: 'ltr' }} />
                        ) : ( toPersianDigits(item.quantity) )}
                      </TableCell>
                      <TableCell align="right">
                        {isEditing ? (
                          <TextField size="small" variant="outlined" value={toPersianDigits(item.unitPrice)}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} sx={{ width: '120px', direction: 'ltr' }} />
                        ) : ( new Intl.NumberFormat('fa-IR').format(item.unitPrice) )}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('fa-IR').format(item.quantity * item.unitPrice)}</TableCell>
                      {isEditing && (
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => setConfirmDelete({ open: true, index })}>
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ width: { xs: '100%', sm: 350 } }}>
                <Grid container spacing={1} justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Grid><Typography variant="body1">جمع کل:</Typography></Grid>
                    <Grid><Typography variant="body1" align="right" sx={{ fontWeight: 500 }}>{new Intl.NumberFormat('fa-IR').format(editableInvoice.subtotal)} تومان</Typography></Grid>
                </Grid>

                <Grid container spacing={1} justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Grid><Typography variant="body1">تخفیف (مبلغ):</Typography></Grid>
                    <Grid>
                        {isEditing ? (
                            <TextField size="small" variant="outlined" fullWidth sx={{direction: 'ltr'}}
                                value={toPersianDigits(editableInvoice.discountAmount)}
                                onChange={e => handleDiscountChange('discountAmount', e.target.value)}
                            />
                        ) : (
                            <Typography align="right">{new Intl.NumberFormat('fa-IR').format(editableInvoice.discountAmount)} تومان</Typography>
                        )}
                    </Grid>
                </Grid>

                <Grid container spacing={1} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Grid><Typography variant="body1">تخفیف (درصد):</Typography></Grid>
                    <Grid>
                        {isEditing ? (
                            <TextField size="small" variant="outlined" fullWidth sx={{direction: 'ltr'}}
                                value={toPersianDigits(editableInvoice.discountPercent)}
                                onChange={e => handleDiscountChange('discountPercent', e.target.value)}
                            />
                        ) : (
                            <Typography align="right">%{toPersianDigits(editableInvoice.discountPercent)}</Typography>
                        )}
                    </Grid>
                </Grid>

                <Divider />

                <Grid container spacing={1} justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                    <Grid><Typography variant="h6">مبلغ نهایی:</Typography></Grid>
                    <Grid><Typography variant="h6" align="right" color="primary" sx={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('fa-IR').format(editableInvoice.grandTotal)} تومان</Typography></Grid>
                </Grid>

                {settings.showProfitOnInvoice && auth.currentUser?.role === 'مدیر سیستم' && (
                    <Grid container spacing={1} justifyContent="space-between" alignItems="center" sx={{ mt: 1, color: 'success.main' }}>
                        <Grid><Typography variant="body1" sx={{display: 'flex', alignItems: 'center'}}><AttachMoneyIcon fontSize="small" sx={{mr: 0.5}}/> سود فاکتور:</Typography></Grid>
                        <Grid><Typography variant="body1" align="right" sx={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('fa-IR').format(invoiceProfit)} تومان</Typography></Grid>
                    </Grid>
                )}
                
                {settings.showDebtOnInvoice && customer && (
                    <Grid container spacing={1} justifyContent="space-between" alignItems="center" sx={{ mt: 1, color: 'error.main' }}>
                        <Grid><Typography variant="body1" sx={{display: 'flex', alignItems: 'center'}}><InfoIcon fontSize="small" sx={{mr: 0.5}}/> بدهی مشتری:</Typography></Grid>
                        <Grid><Typography variant="body1" align="right" sx={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('fa-IR').format(customer.debt || 0)} تومان</Typography></Grid>
                    </Grid>
                )}

            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: '16px 24px' }}>
          {isEditing ? (
            <>
              <Button onClick={handleCancel} color="error" startIcon={<CloseIcon />}>لغو</Button>
              <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>ذخیره تغییرات</Button>
            </>
          ) : ( <Button onClick={onClose}>بستن</Button> )}
        </DialogActions>
      </Dialog>
      
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, index: null })}>
          <DialogTitle>تایید حذف</DialogTitle>
          <DialogContent><DialogContentText>آیا از حذف این ردیف از فاکتور اطمینان دارید؟</DialogContentText></DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete({ open: false, index: null })}>انصراف</Button>
            <Button onClick={() => {
              if (confirmDelete.index !== null) { handleRemoveItem(confirmDelete.index); }
              setConfirmDelete({ open: false, index: null });
            }} color="error">حذف کن</Button>
          </DialogActions>
      </Dialog>
    </>
  );
};