import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Typography, Box, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import EnhancedMuiTable, { type HeadCell } from "../../components/Table";
import { PrintableReportLayout } from "../../components/layout/PrintableReportLayout";
import { InvoiceDetailDialog } from "../../components/InvoiceDetailDialog";
import SearchableSelect, { type SelectOption } from "../../components/SearchableSelect";
import ShamsiDatePicker from "../../components/DatePicker";
import FormDialog from "../../components/FormDialog";
import Form, { type FormField } from "../../components/Form";
import ConfirmationDialog from "../../components/ConfirmationDialog";

import { type RootState } from "../../store/store";
import { addTransaction, deleteTransaction, type Transaction } from "../../store/slices/transactionsSlice";
import { deleteInvoice, type Invoice } from "../../store/slices/invoicesSlice";
import { toPersianDigits } from "../../utils/utils";

type TransactionFormData = {
  date: string;
  amount: number;
  description: string;
  accountId: number;
};

const CustomerLedgerPage = () => {
  const dispatch = useDispatch();
  const { customers, invoices, transactions, accounts } = useSelector(
    (state: RootState) => state
  );

  const [selectedCustomer, setSelectedCustomer] = useState<SelectOption | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, item?: { type: string, id: string }}>({ open: false });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>();

  const customerOptions = useMemo(() =>
    customers.map(c => ({ id: c.id, label: `${c.id} - ${c.name}` })),
    [customers]
  );

  const accountOptions = useMemo(() =>
    accounts.map(acc => ({ id: acc.id, label: acc.accountNumber })),
    [accounts]
  );

  const ledgerEntries = useMemo(() => {
    if (!selectedCustomer) return [];

    const customerId = Number(selectedCustomer.id);

    const sales = invoices.sales.filter(inv => inv.customerId === customerId).map(inv => ({ ...inv, type: "sale", description: `فاکتور فروش شماره ${inv.invoiceNumber}` }));
    const returns = invoices.salesReturns.filter(inv => inv.customerId === customerId).map(inv => ({ ...inv, type: "return", description: `برگشت از فروش فاکتور ${inv.invoiceNumber}` }));
    const payments = transactions.filter(tx => tx.customerId === customerId && tx.type === "receipt").map(tx => ({ ...tx, type: "payment" }));

    const combined = [
      ...sales.map(inv => ({ id: inv.id, date: inv.issueDate, description: inv.description, debit: inv.grandTotal, credit: 0, type: inv.type, invoiceNumber: inv.invoiceNumber })),
      ...returns.map(inv => ({ id: inv.id, date: inv.issueDate, description: inv.description, debit: 0, credit: inv.grandTotal, type: inv.type, invoiceNumber: inv.invoiceNumber })),
      ...payments.map(tx => ({ id: tx.id, date: tx.date, description: tx.description, debit: 0, credit: tx.amount, type: tx.type, invoiceNumber: null })),
    ];

    const filteredByDate = combined.filter(entry => {
        const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : -Infinity;
        const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : Infinity;
        return entryDate >= start && entryDate <= end;
    });

    const sorted = filteredByDate.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = 0;
    return sorted.map(entry => {
      balance += (entry.debit || 0) - (entry.credit || 0);
      return { ...entry, balance };
    });
  }, [selectedCustomer, invoices, transactions, startDate, endDate]);

  const headCells: readonly HeadCell<typeof ledgerEntries[0]>[] = [
    { id: 'invoiceNumber', numeric: true, label: 'شماره سند', align: 'center', width: '10%' },
    { id: 'date', numeric: false, label: 'تاریخ', cell: (row) => new Date(row.date).toLocaleDateString("fa-IR"), align: 'center', width: '15%' },
    { id: 'description', numeric: false, label: 'شرح', align: 'right', width: '35%' },
    { id: 'debit', numeric: true, label: 'بدهکار', cell: (row) => toPersianDigits(row.debit || 0), align: 'center', width: '15%' },
    { id: 'credit', numeric: true, label: 'بستانکار', cell: (row) => toPersianDigits(row.credit || 0), align: 'center', width: '15%' },
    { id: 'balance', numeric: true, label: 'مانده', cell: (row) => toPersianDigits(row.balance || 0), align: 'center', width: '15%' },
  ];

  const formFields: FormField<TransactionFormData>[] = [
      { name: 'date', label: 'تاریخ', type: 'date', rules: { required: 'تاریخ الزامی است' } },
      { name: 'accountId', label: 'انتخاب حساب', type: 'select', options: accountOptions, rules: { required: 'انتخاب حساب الزامی است' } },
      { name: 'amount', label: 'مبلغ', type: 'number', rules: { required: 'مبلغ الزامی است', valueAsNumber: true } },
      { name: 'description', label: 'شرح', type: 'textarea', rows: 3 },
  ];

  const handleRowClick = (row: typeof ledgerEntries[0]) => {
    if (row.type === "sale") setSelectedInvoice(invoices.sales.find(inv => inv.id === row.id) || null);
    else if (row.type === "return") setSelectedInvoice(invoices.salesReturns.find(inv => inv.id === row.id) || null);
  };

  const handleOpenDeleteDialog = (item: { type: string, id: string }) => {
    setDeleteConfirm({ open: true, item });
  };

  const handleConfirmDelete = () => {
    const { item } = deleteConfirm;
    if (!item) return;

    if (item.type === "payment") dispatch(deleteTransaction(item.id));
    else if (item.type === "sale" || item.type === "return") dispatch(deleteInvoice(item.id));

    setDeleteConfirm({ open: false });
  };

  const onSaveTransaction: SubmitHandler<TransactionFormData> = (data) => {
      if (!selectedCustomer) return;

      const transactionPayload: Omit<Transaction, 'id'> = {
          date: data.date,
          amount: data.amount,
          description: data.description,
          accountId: String(data.accountId),
          customerId: Number(selectedCustomer.id),
          type: 'receipt',
      };

      dispatch(addTransaction(transactionPayload));
      setFormOpen(false);
      reset();
  };

  const finalBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;

  return (
    <>
      <PrintableReportLayout
        primaryAction={
          <Button variant="contained" onClick={() => setFormOpen(true)} disabled={!selectedCustomer}>
            ثبت دریافت جدید
          </Button>
        }
      >
        <Box display="flex" gap={2} mb={3} className="no-print" sx={{ flexDirection: { xs: 'column', md: 'row' }}}>
          <SearchableSelect
              label="انتخاب مشتری"
              options={customerOptions}
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              sx={{ flex: 2 , minWidth: '180px'}}
          />
          <ShamsiDatePicker
            label="از تاریخ"
            value={startDate}
            onChange={setStartDate}
            sx={{ flex: 1, minWidth: '180px' }}
          />
          <ShamsiDatePicker
            label="تا تاریخ"
            value={endDate}
            onChange={setEndDate}
            sx={{ flex: 1, minWidth: '180px' }}
          />
        </Box>

        {selectedCustomer && (
          <>
            <EnhancedMuiTable
              rows={ledgerEntries}
              headCells={headCells}
              title=""
              onRowClick={handleRowClick}
              actions={[
                { icon: <EditIcon fontSize="small" />, tooltip: 'ویرایش', onClick: () => {/* Implement Edit *},
                { icon: <DeleteIcon color="error" fontSize="small" />, tooltip: 'حذف', onClick: (row) => handleOpenDeleteDialog(row) },
              ]}
            />
            <Box sx={{ p: 2, textAlign: "right", fontWeight: "bold" }}>
              <Typography variant="h6">
                مانده نهایی: {toPersianDigits(finalBalance)} تومان
              </Typography>
            </Box>
          </>
        )}
      </PrintableReportLayout>

      <FormDialog
        open={isFormOpen}
        onClose={() => setFormOpen(false)}
        title="ثبت دریافت جدید از مشتری"
        onSave={handleSubmit(onSaveTransaction)}
      >
          <Form config={formFields} control={control} errors={errors} />
      </FormDialog>

      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false })}
        onConfirm={handleConfirmDelete}
        title="تایید حذف"
        message="آیا از حذف این آیتم اطمینان دارید؟ این عمل قابل بازگشت نیست."
      />

      <InvoiceDetailDialog
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </>
  );
};

export default CustomerLedgerPage;