import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { type RootState } from "../../store/store";
import { PrintableReportLayout } from "../../components/layout/PrintableReportLayout";
import { deleteTransaction } from "../../store/slices/transactionsSlice";
import { deleteInvoice, type Invoice } from "../../store/slices/invoicesSlice";
import { InvoiceDetailDialog } from "../invoices/InvoiceDetailDialog";

const CustomerLedgerPage = () => {
  const dispatch = useDispatch();
  const { customers, invoices, transactions } = useSelector(
    (state: RootState) => state
  );
  const [selectedCustomer, setSelectedCustomer] = useState<number>(0);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const ledgerEntries = useMemo(() => {
    if (!selectedCustomer) return [];

    const sales = invoices.sales
      .filter((inv) => inv.customerId === selectedCustomer)
      .map((inv) => ({
        type: "sale",
        date: inv.issueDate,
        description: `فاکتور فروش شماره ${inv.invoiceNumber}`,
        debit: inv.grandTotal,
        credit: 0,
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
      }));

    const returns = invoices.salesReturns
      .filter((inv) => inv.customerId === selectedCustomer)
      .map((inv) => ({
        type: "return",
        date: inv.issueDate,
        description: `برگشت از فروش  ${inv.id}`,
        debit: 0,
        credit: inv.grandTotal,
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
      }));

    const payments = transactions
      .filter(
        (tx) => tx.customerId === selectedCustomer && tx.type === "receipt"
      )
      .map((tx) => ({
        type: "payment",
        date: tx.date,
        description: tx.description,
        debit: 0,
        credit: tx.amount,
        id: tx.id,
        invoiceNumber: null,
      }));

    const allEntries = [...sales, ...returns, ...payments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let balance = 0;
    return allEntries.map((entry) => {
      balance = balance + entry.debit - entry.credit;
      return { ...entry, balance };
    });
  }, [selectedCustomer, invoices, transactions]);

  const handleRowClick = (type: string, id: string) => {
    if (type === "sale") {
      const invoice = invoices.sales.find((inv) => inv.id === id);
      if (invoice) setSelectedInvoice(invoice);
    } else if (type === "return") {
      const invoice = invoices.salesReturns.find((inv) => inv.id === id);
      if (invoice) setSelectedInvoice(invoice);
    }
  };

  const handleDelete = (type: string, id: string) => {
    if (window.confirm("آیا از حذف این تراکنش اطمینان دارید؟")) {
      if (type === "payment") {
        dispatch(deleteTransaction(id));
      } else if (type === "sale") {
        dispatch(deleteInvoice(id));
      } else {
        alert(`حذف ${type} هنوز پشتیبانی نمی‌شود.`);
      }
    }
  };

  const finalBalance =
    ledgerEntries.length > 0
      ? ledgerEntries[ledgerEntries.length - 1].balance
      : 0;

  return (
    <>
      <Box
        sx={{ width: "100%", display: "flex", justifyContent: "center", mb: 3 }}
      >
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: "800",
            fontSize: { xs: "0.75rem", sm: "1.5rem" },
          }}
        >
          گردش حساب مشتریان فروش
        </Typography>
      </Box>
      <PrintableReportLayout>
        <FormControl fullWidth sx={{ mb: 3 }} className="no-print">
          <InputLabel>انتخاب مشتری</InputLabel>
          <Select
            value={selectedCustomer}
            label="انتخاب مشتری"
            onChange={(e) => setSelectedCustomer(e.target.value as number)}
          >
            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedCustomer > 0 && (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>شماره سند</TableCell>
                  <TableCell>تاریخ</TableCell>
                  <TableCell>شرح</TableCell>
                  <TableCell>بدهکار</TableCell>
                  <TableCell>بستانکار</TableCell>
                  <TableCell>مانده</TableCell>
                  <TableCell className="no-print">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ledgerEntries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    onClick={() => handleRowClick(entry.type, entry.id)}
                    sx={{
                      cursor:
                        entry.type === "sale" || entry.type === "return"
                          ? "pointer"
                          : "default",
                      "&:hover": {
                        backgroundColor:
                          entry.type === "sale" || entry.type === "return"
                            ? "action.hover"
                            : "transparent",
                      },
                    }}
                  >
                    <TableCell>{entry.invoiceNumber || "-"}</TableCell>
                    <TableCell>
                      {new Date(entry.date).toLocaleDateString("fa-IR")}
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      {entry.debit > 0 ? entry.debit.toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>
                      {entry.credit > 0 ? entry.credit.toLocaleString() : "-"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {entry.balance.toLocaleString()}
                    </TableCell>
                    <TableCell className="no-print">
                      <IconButton size="small" color="info">
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.type, entry.id);
                        }}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ p: 2, textAlign: "right", fontWeight: "bold" }}>
              <Typography variant="h6">
                مانده نهایی: {finalBalance.toLocaleString()} تومان
              </Typography>
            </Box>
          </TableContainer>
        )}
      </PrintableReportLayout>

      <InvoiceDetailDialog
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </>
  );
};
export default CustomerLedgerPage;
