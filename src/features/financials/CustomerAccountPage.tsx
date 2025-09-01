import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EnhancedMuiTable, { type HeadCell, type Action } from '../../components/Table';
import SearchableSelect, { type SelectOption } from '../../components/SearchableSelect';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import SearchAndSortPanel from '../../components/SearchAndSortPanel';
import { InvoiceDetailDialog } from '../../components/InvoiceDetailDialog';
import { PrintableReportLayout } from '../../components/layout/PrintableReportLayout';
import { useToast } from "../../hooks/useToast";
import { toPersianDigits, toPersianDigitsString } from '../../utils/utils'; 
import { type RootState } from '../../store/store';
import { deleteTransaction } from '../../store/slices/transactionsSlice';
import {
  deleteInvoice,
  deletePurchase,
  deleteSalesReturn,
  deletePurchaseReturn,

} from '../../store/slices/invoicesSlice';
import {type Invoice } from '../../types/invoice';

interface CustomerAccountPageProps {
  accountType: 'sales' | 'purchases';
}
interface LedgerEntry {
    id: string;
    type: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    invoiceNumber: string | number | null;
}

const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({ accountType }) => {
    const dispatch = useDispatch();
  const { showToast } = useToast();
    const { customers, suppliers, invoices, transactions } = useSelector((state: RootState) => state);
    const [selectedPerson, setSelectedPerson] = useState<SelectOption | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; items: LedgerEntry[] }>({ open: false, items: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const personList = accountType === 'sales' ? customers : suppliers;
    const personOptions: SelectOption[] = personList.map(p => ({ id: p.id, label: p.name }));
    const title = `گزارش حساب ${accountType === 'sales' ? 'مشتریان' : 'تامین کنندگان'}`;

    const ledgerEntries = useMemo(() => {
        if (!selectedPerson) return [];

        const personId = selectedPerson.id;
        
        const mainInvoices = (accountType === 'sales' ? invoices.sales : invoices.purchases)
            ?.filter(inv => inv.customerId === personId)
            .map(inv => ({
                type: accountType === 'sales' ? 'sale' : 'purchase',
                date: inv.issueDate,
                description: `فاکتور ${accountType === 'sales' ? 'فروش' : 'خرید'} شماره ${toPersianDigitsString(inv.invoiceNumber)}`,
                debit: accountType === 'sales' ? inv.grandTotal : 0,
                credit: accountType === 'sales' ? 0 : inv.grandTotal,
                id: inv.id,
                invoiceNumber: inv.invoiceNumber
            })) || [];
        
        const returnInvoices = (accountType === 'sales' ? invoices.salesReturns : invoices.purchaseReturns)
            ?.filter(inv => inv.customerId === personId)
            .map(inv => ({
                type: accountType === 'sales' ? 'return' : 'purchaseReturn',
                date: inv.issueDate,
                description: `برگشت از ${accountType === 'sales' ? 'فروش' : 'خرید'} - سند ${toPersianDigitsString(inv.id)}`,
                debit: accountType === 'sales' ? 0 : inv.grandTotal,
                credit: accountType === 'sales' ? inv.grandTotal : 0,
                id: inv.id,
                invoiceNumber: inv.invoiceNumber
            })) || [];
        
        const payments = transactions
            ?.filter(tx => (accountType === 'sales' ? tx.customerId : tx.supplierId) === personId)
            .map(tx => ({
                type: 'payment',
                date: tx.date,
                description: tx.description,
                debit: tx.type === 'payment' ? tx.amount : 0,
                credit: tx.type === 'receipt' ? tx.amount : 0,
                id: tx.id,
                invoiceNumber: null
            })) || [];

        const allEntries = [...mainInvoices, ...returnInvoices, ...payments]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let balance = 0;
        return allEntries.map(entry => {
            balance = balance + entry.debit - entry.credit;
            return { ...entry, balance };
        });

    }, [selectedPerson, invoices, transactions, accountType]);
    
    const filteredAndSortedEntries = useMemo(() => {
      let result = [...ledgerEntries];
      if (searchTerm) {
        result = result.filter(entry => 
            entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(entry.invoiceNumber).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return result;
    }, [ledgerEntries, searchTerm]);

    const finalBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;
    
    const handleRowClick = (row: LedgerEntry) => {
        if (!row.invoiceNumber) return;

        const invoiceLists = [invoices.sales, invoices.purchases, invoices.salesReturns, invoices.purchaseReturns];
        for (const list of invoiceLists) {
            const invoice = list?.find(inv => inv.id === row.id);
            if (invoice) {
                setSelectedInvoice(invoice);
                return;
            }
        }
    };
    
    const handleDeleteRequest = (ids: readonly (string | number)[]) => {
      const itemsToDelete = ledgerEntries.filter(entry => ids.includes(entry.id));
      if (itemsToDelete.length > 0) {
        setDeleteConfirm({ open: true, items: itemsToDelete });
      }
    };

    const confirmDelete = () => {
        if (deleteConfirm.items.length === 0) return;

        deleteConfirm.items.forEach(item => {
          switch (item.type) {
              case 'payment':
                  dispatch(deleteTransaction(item.id));
                  break;
              case 'sale':
                  dispatch(deleteInvoice(item.id));
                  break;
              case 'purchase':
                  dispatch(deletePurchase(item.id));
                  break;
              case 'return':
                  dispatch(deleteSalesReturn(item.id));
                  break;
              case 'purchaseReturn':
                  dispatch(deletePurchaseReturn(item.id));
                  break;
              default:
                  break;
          }
        });

        showToast(`${toPersianDigitsString(deleteConfirm.items.length)} مورد با موفقیت حذف شد.`, 'success');
        setDeleteConfirm({ open: false, items: [] });
    };

    const headCells: readonly HeadCell<LedgerEntry>[] = [
        { id: 'invoiceNumber', numeric: true, label: 'شماره سند', cell: (row) => toPersianDigitsString(row.invoiceNumber) || '-' },
        { id: 'date', numeric: false, label: 'تاریخ', cell: (row) => new Date(row.date).toLocaleDateString('fa-IR') },
        { id: 'description', numeric: false, label: 'شرح' },
        { id: 'balance', numeric: true, label: 'مانده', cell: (row) => <Typography sx={{fontWeight: 'bold'}}>{toPersianDigits(row.balance)}</Typography> },
    ];

    const actions: readonly Action<LedgerEntry>[] = [
        { icon: <EditIcon fontSize="small" />, tooltip: 'ویرایش', onClick: (row) => { console.log('Edit:', row); showToast('امکان ویرایش در حال حاضر وجود ندارد.', 'info'); } },
        { icon: <DeleteIcon color="error" fontSize="small" />, tooltip: 'حذف', onClick: (row) => handleDeleteRequest([row.id]) },
    ];
    
    const sortOptions = [
      { value: 'description', label: 'شرح' },
      { value: 'invoiceNumber', label: 'شماره سند' },
      { value: 'date', label: 'تاریخ' },
    ];

    return (
        <>
            <PrintableReportLayout title={<Typography variant="h5" sx={{textAlign: 'center', fontWeight: 800}}>{title}</Typography>}>
                <Box className="no-print" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    <SearchableSelect
                      label={`انتخاب ${accountType === 'sales' ? 'مشتری' : 'فروشنده'}`}
                      options={personOptions}
                      value={selectedPerson}
                      onChange={(newValue) => setSelectedPerson(newValue)}
                      sx={{ maxWidth: { md: 400 } }}
                    />
                    
                    {selectedPerson && (
                      <SearchAndSortPanel
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        sortBy={sortBy}
                        onSortByChange={setSortBy}
                        sortOptions={sortOptions}
                      />
                    )}
                </Box>
                
                {selectedPerson && (
                     <>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <EnhancedMuiTable
                                rows={filteredAndSortedEntries}
                                headCells={headCells}
                                title={`${selectedPerson.label}`}
                                actions={actions}
                                onDelete={handleDeleteRequest}
                                onRowClick={handleRowClick}
                            />
                        </Box>
                        <Box sx={{ p: 2, textAlign: 'right', fontWeight: 'bold', borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6">مانده نهایی: {toPersianDigits(finalBalance)} تومان</Typography>
                        </Box>
                     </>
                )}
            </PrintableReportLayout>
            
            <InvoiceDetailDialog
                open={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                invoice={selectedInvoice}
            />

            <ConfirmationDialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, items: [] })}
                onConfirm={confirmDelete}
                title="تایید حذف"
                message={`آیا از حذف ${toPersianDigitsString(deleteConfirm.items.length)} سند اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
            />
        </>
    );
};

export default CustomerAccountPage;