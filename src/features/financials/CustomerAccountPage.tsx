import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FormControl, InputLabel, Select, MenuItem, TableContainer, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Typography, Box, IconButton, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { type RootState } from '../../store/store';
import { PrintableReportLayout } from '../../components/layout/PrintableReportLayout';
import { deleteTransaction } from '../../store/slices/transactionsSlice';
import { deleteInvoice, deletePurchase, deleteSalesReturn, deletePurchaseReturn, type Invoice } from '../../store/slices/invoicesSlice';
import { InvoiceDetailDialog } from '../../components/InvoiceDetailDialog';

interface CustomerAccountPageProps {
  accountType: 'sales' | 'purchases';
}

const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({ accountType }) => {
    const dispatch = useDispatch();
    const { customers, suppliers, invoices, transactions } = useSelector((state: RootState) => state);
    const [selectedPerson, setSelectedPerson] = useState<number | ''>('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);

    const personList = accountType === 'sales' ? customers : suppliers;
    const title = `${accountType === 'sales' ? 'مشتریان فروش' : 'تامین کنندگان'}`;

    const ledgerEntries = useMemo(() => {
        if (!selectedPerson) return [];
        
        const mainInvoices = (accountType === 'sales' ? invoices.sales : invoices.purchases)
            ?.filter(inv => inv.customerId === selectedPerson)
            .map(inv => ({
                type: accountType === 'sales' ? 'sale' : 'purchase',
                date: inv.issueDate,
                description: `فاکتور ${accountType === 'sales' ? 'فروش' : 'خرید'} شماره ${inv.invoiceNumber}`,
                debit: accountType === 'sales' ? inv.grandTotal : 0,
                credit: accountType === 'sales' ? 0 : inv.grandTotal,
                id: inv.id,
                invoiceNumber: inv.invoiceNumber
            })) || [];
        
        const returnInvoices = (accountType === 'sales' ? invoices.salesReturns : invoices.purchaseReturns)
            ?.filter(inv => inv.customerId === selectedPerson)
            .map(inv => ({
                type: accountType === 'sales' ? 'return' : 'purchaseReturn',
                date: inv.issueDate,
                description: `برگشت از ${accountType === 'sales' ? 'فروش' : 'خرید'} - سند ${inv.id}`,
                debit: accountType === 'sales' ? 0 : inv.grandTotal,
                credit: accountType === 'sales' ? inv.grandTotal : 0,
                id: inv.id,
                invoiceNumber: inv.invoiceNumber
            })) || [];
        
        const payments = transactions
            ?.filter(tx => (accountType === 'sales' ? tx.customerId : tx.supplierId) === selectedPerson)
            .map(tx => ({
                type: 'payment',
                date: tx.date,
                description: tx.description,
                debit: tx.type === 'payment' ? tx.amount : 0,
                credit: tx.type === 'receipt' ? tx.amount : 0,
                id: tx.id,
                invoiceNumber: null
            })) || [];

        const allEntries = [...mainInvoices, ...returnInvoices, ...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let balance = 0;
        return allEntries.map(entry => {
            balance = balance + entry.debit - entry.credit;
            return { ...entry, balance };
        });

    }, [selectedPerson, invoices, transactions, accountType]);

    const handleRowClick = (type: string, id: string) => {
        const invoiceLists = [invoices.sales, invoices.purchases, invoices.salesReturns, invoices.purchaseReturns];
        if (type.includes('sale') || type.includes('purchase') || type.includes('return')) {
            for (const list of invoiceLists) {
                const invoice = list?.find(inv => inv.id === id);
                if (invoice) {
                    setSelectedInvoice(invoice);
                    return;
                }
            }
        }
    };
    
    const handleDelete = (type: string, id: string) => {
        setItemToDelete({ type, id });
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        const { type, id } = itemToDelete;
        switch (type) {
            case 'payment':
                dispatch(deleteTransaction(id));
                break;
            case 'sale':
                dispatch(deleteInvoice(id));
                break;
            case 'purchase':
                dispatch(deletePurchase(id));
                break;
            case 'return':
                dispatch(deleteSalesReturn(id));
                break;
            case 'purchaseReturn':
                dispatch(deletePurchaseReturn(id));
                break;
            default:
                break;
        }
        setConfirmOpen(false);
        setItemToDelete(null);
    };


    const finalBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;

    return (
        <>
            <PrintableReportLayout  title={
        <Typography sx={{ textAlign: 'center',fontWeight:'800' ,fontSize: { xs: '0.75rem', sm: '1.5rem' } }}>
            {title}
        </Typography>
    }
>
                <FormControl fullWidth sx={{ mb: 3 }} className="no-print">
                    <InputLabel>انتخاب {accountType === 'sales' ? 'مشتری' : 'فروشنده'}</InputLabel>
                    <Select value={selectedPerson} label={`انتخاب ${accountType === 'sales' ? 'مشتری' : 'فروشنده'}`} onChange={(e) => setSelectedPerson(e.target.value as number)}>
                        {personList.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                    </Select>
                </FormControl>

                {selectedPerson && (
                     <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead><TableRow><TableCell>شماره سند</TableCell><TableCell>تاریخ</TableCell><TableCell>شرح</TableCell><TableCell>بدهکار</TableCell><TableCell>بستانکار</TableCell><TableCell>مانده</TableCell><TableCell className="no-print">عملیات</TableCell></TableRow></TableHead>
                            <TableBody>
                                {ledgerEntries.map((entry) => (
                                    <TableRow
                                        key={entry.id}
                                        onClick={() => handleRowClick(entry.type, entry.id)}
                                        sx={{ cursor: entry.invoiceNumber != null ? 'pointer' : 'default', '&:hover': { backgroundColor: entry.invoiceNumber != null ? 'action.hover' : 'transparent' } }}
                                    >
                                        <TableCell>{entry.invoiceNumber || '-'}</TableCell>
                                        <TableCell>{new Date(entry.date).toLocaleDateString('fa-IR')}</TableCell>
                                        <TableCell>{entry.description}</TableCell>
                                        <TableCell>{entry.debit > 0 ? entry.debit.toLocaleString('fa-IR') : '-'}</TableCell>
                                        <TableCell>{entry.credit > 0 ? entry.credit.toLocaleString('fa-IR') : '-'}</TableCell>
                                        <TableCell sx={{fontWeight: 'bold'}}>{entry.balance.toLocaleString('fa-IR')}</TableCell>
                                        <TableCell className="no-print">
                                            <IconButton size="small" color="info"><EditIcon fontSize="inherit"/></IconButton>
                                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(entry.type, entry.id); }}><DeleteIcon fontSize="inherit"/></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box sx={{ p: 2, textAlign: 'right', fontWeight: 'bold' }}>
                            <Typography variant="h6">مانده نهایی: {finalBalance.toLocaleString('fa-IR')} تومان</Typography>
                        </Box>
                    </TableContainer>
                )}
            </PrintableReportLayout>
            
            <InvoiceDetailDialog
                open={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                invoice={selectedInvoice}
            />

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>تایید حذف</DialogTitle>
                <DialogContent>
                    <DialogContentText>آیا از حذف این سند اطمینان دارید؟</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>انصراف</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        حذف
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
export default CustomerAccountPage;