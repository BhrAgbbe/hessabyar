import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Typography,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import EnhancedMuiTable, {
  type HeadCell,
  type Action,
} from "../../components/Table";
import FormDialog from "../../components/FormDialog";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import SearchAndSortPanel from "../../components/SearchAndSortPanel";
import { PrintableReportLayout } from "../../components/layout/PrintableReportLayout";

import { type RootState } from "../../store/store";
import {
  addTransaction,
  editTransaction,
  deleteTransaction,
} from "../../store/slices/transactionsSlice";
import type { Transaction } from "../../types/transaction";

import { toPersianDigits } from "../../utils/utils";
import { useToast } from "../../hooks/useToast";
import type { BankAccount } from "../../types/account";

const CashFlowPage = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { transactions, customers, suppliers, accounts } = useSelector(
    (state: RootState) => state
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    ids: readonly (string | number)[];
  }>({ open: false, ids: [] });

  const personList = useMemo(
    () => [
      ...customers.map((c) => ({
        id: c.id,
        name: `${c.name} (مشتری)`,
        type: "customer",
      })),
      ...suppliers.map((s) => ({
        id: s.id,
        name: `${s.name} (فروشنده)`,
        type: "supplier",
      })),
    ],
    [customers, suppliers]
  );

  const accountOptions = useMemo(
    () =>
      accounts.map((acc: BankAccount) => ({
        id: acc.id,
        name: `${acc.bankName} - ${acc.accountNumber}`,
      })),
    [accounts]
  );

  const filteredAndSortedTxs = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      result = result.filter((tx) =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortBy === "amount") {
        return b.amount - a.amount;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return result;
  }, [transactions, searchTerm, sortBy]);

  const sortOptions = [
    { value: "date", label: "تاریخ" },
    { value: "amount", label: "مبلغ" },
  ];

  const headCells: readonly HeadCell<Transaction>[] = [
    {
      id: "date",
      numeric: false,
      label: "تاریخ",
      cell: (row) => new Date(row.date).toLocaleDateString("fa-IR"),
    },
    { id: "description", numeric: false, label: "شرح" },
    {
      id: "amount",
      numeric: true,
      label: "دریافتی",
      align: "center",
      cell: (row) =>
        row.type === "receipt" ? toPersianDigits(row.amount) : "-",
    },
    {
      id: "amount",
      numeric: true,
      label: "پرداختی",
      align: "center",
      cell: (row) =>
        row.type === "payment" ? toPersianDigits(row.amount) : "-",
    },
  ];

  const actions: readonly Action<Transaction>[] = [
    {
      icon: <EditIcon fontSize="small" />,
      tooltip: "ویرایش",
      onClick: (row) => handleOpenDialog(row),
    },
    {
      icon: <DeleteIcon color="error" fontSize="small" />,
      tooltip: "حذف",
      onClick: (row) => handleDeleteRequest([row.id]),
    },
  ];

  const handleOpenDialog = (tx: Transaction | null = null) => {
    setEditingTx(tx);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTx(null);
  };

  const handleSave = (formData: Omit<Transaction, "id" | "date">) => {
    if (editingTx) {
      dispatch(editTransaction({ ...editingTx, ...formData }));
      showToast("تراکنش با موفقیت ویرایش شد.", "success");
    } else {
      dispatch(addTransaction({ ...formData, date: new Date().toISOString() }));
      showToast("تراکنش جدید با موفقیت ثبت شد.", "success");
    }
    handleCloseDialog();
  };

  const handleDeleteRequest = (ids: readonly (string | number)[]) => {
    setDeleteConfirm({ open: true, ids });
  };

  const confirmDelete = () => {
    deleteConfirm.ids.forEach((id) => dispatch(deleteTransaction(String(id))));
    showToast(
      `${toPersianDigits(deleteConfirm.ids.length)} تراکنش با موفقیت حذف شد.`,
      "success"
    );
    setDeleteConfirm({ open: false, ids: [] });
  };

  const receipts = transactions
    .filter((t) => t.type === "receipt")
    .reduce((sum, t) => sum + t.amount, 0);
  const payments = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <PrintableReportLayout
      primaryAction={
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          ثبت تراکنش جدید
        </Button>
      }
    >
      <SearchAndSortPanel
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOptions={sortOptions}
      />

      <EnhancedMuiTable
        rows={filteredAndSortedTxs}
        headCells={headCells}
        title="گردش حساب"
        actions={actions}
        onDelete={handleDeleteRequest}
      />

      <Paper sx={{ p: 2, mt: 2, border: "1px solid", borderColor: "divider" }}>
        <Box
          sx={{
            p: 2,
            fontWeight: "bold",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography>
              جمع کل دریافتی‌ها: {toPersianDigits(receipts)} تومان
            </Typography>
            <Typography>
              جمع کل پرداختی‌ها: {toPersianDigits(payments)} تومان
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Typography variant="h6">
              موجودی نقد: {toPersianDigits(receipts - payments)} تومان
            </Typography>
          </Box>
        </Box>
      </Paper>

      {dialogOpen && (
        <TransactionForm
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSave}
          transaction={editingTx}
          personList={personList}
          accountOptions={accountOptions}
        />
      )}

      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, ids: [] })}
        onConfirm={confirmDelete}
        title="تایید حذف تراکنش"
        message={`آیا از حذف ${toPersianDigits(
          deleteConfirm.ids.length
        )} مورد اطمینان دارید؟`}
      />
    </PrintableReportLayout>
  );
};

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, "id" | "date">) => void;
  transaction: Transaction | null;
  personList: { id: number; name: string; type: string }[];
  accountOptions: { id: string | number; name: string }[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  open,
  onClose,
  onSave,
  transaction,
  personList,
  accountOptions,
}) => {
  const [formData, setFormData] = useState({
    description: transaction?.description || "",
    amount: transaction?.amount || 0,
    type: transaction?.type || "receipt",
    accountId:
      transaction?.accountId ||
      (accountOptions.length > 0 ? String(accountOptions[0].id) : ""),
    personId: transaction?.customerId || transaction?.supplierId || undefined,
  });

  const handleChange = (
    field: string,
    value: string | number | null | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveClick = () => {
    const selectedPerson = personList.find((p) => p.id === formData.personId);
    onSave({
      description: formData.description,
      amount: Number(formData.amount),
      type: formData.type as "receipt" | "payment",
      accountId: formData.accountId,
      customerId:
        selectedPerson?.type === "customer" ? selectedPerson.id : undefined,
      supplierId:
        selectedPerson?.type === "supplier" ? selectedPerson.id : undefined,
    });
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSave={handleSaveClick}
      title={transaction ? "ویرایش تراکنش" : "ثبت تراکنش جدید"}
    >
      <FormControl fullWidth margin="dense">
        <InputLabel>نوع تراکنش</InputLabel>
        <Select
          value={formData.type}
          label="نوع تراکنش"
          onChange={(e) => handleChange("type", e.target.value)}
        >
          <MenuItem value="receipt">دریافت</MenuItem>
          <MenuItem value="payment">پرداخت</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="dense" required>
        <InputLabel>حساب بانکی</InputLabel>
        <Select
          value={formData.accountId}
          label="حساب بانکی"
          onChange={(e) => handleChange("accountId", e.target.value)}
        >
          {accountOptions.map((acc) => (
            <MenuItem key={acc.id} value={acc.id}>
              {acc.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Autocomplete
        options={personList}
        getOptionLabel={(option) => option.name}
        value={personList.find((p) => p.id === formData.personId) || null}
        onChange={(_, newValue) => handleChange("personId", newValue?.id)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="طرف حساب"
            margin="dense"
            fullWidth
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {option.name}
          </li>
        )}
      />

      <TextField
        label="مبلغ"
        type="number"
        value={formData.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        fullWidth
        margin="dense"
        required
      />
      <TextField
        label="شرح تراکنش"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        fullWidth
        multiline
        rows={3}
        margin="dense"
        required
      />
    </FormDialog>
  );
};

export default CashFlowPage;
