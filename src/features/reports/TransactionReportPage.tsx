import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Snackbar, Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, type SubmitHandler } from "react-hook-form";

import EnhancedMuiTable, {
  type HeadCell,
  type Action,
} from "../../components/Table";
import FormDialog from "../../components/FormDialog";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import Form, { type FormField } from "../../components/Form";
import { type SelectOption } from "../../components/SearchableSelect";
import { type RootState } from "../../store/store";
import { updateBalance } from "../../store/slices/accountsSlice";
import {
  editTransaction,
  deleteTransaction,
} from "../../store/slices/transactionsSlice";
import type { Transaction } from "../../types/transaction";

import { toPersianDigits } from "../../utils/utils";

type TransactionFormData = {
  accountId: string;
  date: string;
  type: "receipt" | "payment";
  amount: number;
  description: string;
};

const TransactionReportPage = () => {
  const dispatch = useDispatch();
  const accounts = useSelector((state: RootState) => state.accounts);
  const transactions = useSelector((state: RootState) => state.transactions);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    ids: string[];
  }>({ open: false, ids: [] });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>();

  useEffect(() => {
    if (editingTransaction) {
      reset(editingTransaction);
    } else {
      reset();
    }
  }, [editingTransaction, reset]);

  const handleOpenForm = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  }, []);

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTransaction(null);
  };

  const onSubmit: SubmitHandler<TransactionFormData> = (data) => {
    if (!editingTransaction) return;

    const originalTransaction = transactions.find(
      (t) => t.id === editingTransaction.id
    );
    if (!originalTransaction) return;

    const amount = Number(data.amount);
    const balanceChange = data.type === "receipt" ? amount : -amount;
    const originalAmount = Number(originalTransaction.amount);
    const originalBalanceChange =
      originalTransaction.type === "receipt" ? originalAmount : -originalAmount;
    const balanceDelta = balanceChange - originalBalanceChange;

    if (originalTransaction.accountId !== data.accountId) {
      dispatch(
        updateBalance({
          id: originalTransaction.accountId,
          amount: -originalBalanceChange,
        })
      );
      dispatch(updateBalance({ id: data.accountId, amount: balanceChange }));
    } else {
      dispatch(updateBalance({ id: data.accountId, amount: balanceDelta }));
    }

    dispatch(editTransaction({ ...data, id: editingTransaction.id }));
    setSnackbar({
      open: true,
      message: "تراکنش با موفقیت ویرایش شد.",
      severity: "success",
    });

    handleCloseForm();
  };

  const handleDeleteRequest = useCallback((ids: readonly string[]) => {
    setDeleteConfirm({ open: true, ids: [...ids] });
  }, []);

  const confirmDelete = () => {
    deleteConfirm.ids.forEach((id) => {
      const transactionToDelete = transactions.find((t) => t.id === id);
      if (transactionToDelete) {
        const balanceChange =
          transactionToDelete.type === "receipt"
            ? -Number(transactionToDelete.amount)
            : Number(transactionToDelete.amount);
        dispatch(
          updateBalance({
            id: transactionToDelete.accountId,
            amount: balanceChange,
          })
        );
        dispatch(deleteTransaction(id));
      }
    });
    setDeleteConfirm({ open: false, ids: [] });
    setSnackbar({
      open: true,
      message: "تراکنش‌های انتخاب شده حذف شدند.",
      severity: "success",
    });
  };

  const headCells = useMemo<readonly HeadCell<Transaction>[]>(() => {
    const accountMap = new Map(
      accounts.map((acc) => [acc.id, `${acc.bankName} - ${acc.accountNumber}`])
    );
    return [
      {
        id: "date",
        numeric: false,
        label: "تاریخ",
        cell: (row) => new Date(row.date).toLocaleDateString("fa-IR"),
      },
      {
        id: "accountId",
        numeric: false,
        label: "حساب",
        cell: (row) =>
          toPersianDigits(accountMap.get(row.accountId) || "نامشخص"),
      },
      { id: "description", numeric: false, label: "توضیحات" },
      {
        id: "type",
        numeric: false,
        label: "نوع",
        cell: (row) => (row.type === "receipt" ? "واریز" : "برداشت"),
      },
      {
        id: "amount",
        numeric: true,
        label: "مبلغ (تومان)",
        cell: (row) => toPersianDigits(row.amount.toLocaleString()),
      },
    ];
  }, [accounts]);

  const actions = useMemo<readonly Action<Transaction>[]>(
    () => [
      {
        icon: <EditIcon fontSize="small" />,
        tooltip: "ویرایش",
        onClick: (row) => handleOpenForm(row),
      },
      {
        icon: <DeleteIcon color="error" fontSize="small" />,
        tooltip: "حذف",
        onClick: (row) => handleDeleteRequest([row.id]),
      },
    ],
    [handleOpenForm, handleDeleteRequest]
  );

  const formConfig: FormField<TransactionFormData>[] = useMemo(() => {
    const accountOptions: SelectOption[] = accounts.map((acc) => ({
      id: acc.id,
      label: `${acc.bankName} - ${toPersianDigits(acc.accountNumber)}`,
    }));
    const transactionTypeOptions: SelectOption[] = [
      { id: "receipt", label: "واریز" },
      { id: "payment", label: "برداشت" },
    ];
    return [
      {
        name: "accountId",
        label: "حساب بانکی",
        type: "select",
        options: accountOptions,
        rules: { required: "انتخاب حساب بانکی الزامی است" },
      },
      {
        name: "date",
        label: "تاریخ تراکنش",
        type: "date",
        rules: { required: "انتخاب تاریخ الزامی است" },
      },
      {
        name: "type",
        label: "نوع تراکنش",
        type: "select",
        options: transactionTypeOptions,
        rules: { required: "انتخاب نوع تراکنش الزامی است" },
      },
      {
        name: "amount",
        label: "مبلغ (تومان)",
        type: "number",
        rules: {
          required: "وارد کردن مبلغ الزامی است",
          valueAsNumber: true,
          validate: (value: number) =>
            value > 0 || "مبلغ باید بزرگتر از صفر باشد",
        },
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        rows: 3,
        rules: { required: "ارائه توضیحات الزامی است" },
      },
    ];
  }, [accounts]);

  return (
    <Box>
      <EnhancedMuiTable
        rows={transactions}
        headCells={headCells}
        title="گزارش واریز و برداشت‌های متفرقه"
        actions={actions}
        onDelete={(selectedIds) => handleDeleteRequest(selectedIds as string[])}
      />

      <FormDialog
        open={formOpen}
        onClose={handleCloseForm}
        title="ویرایش تراکنش"
        onSave={handleSubmit(onSubmit)}
        saveText="ذخیره تغییرات"
      >
        <Form config={formConfig} control={control} errors={errors} />
      </FormDialog>

      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
        onConfirm={confirmDelete}
        title="تایید حذف تراکنش"
        message={`آیا از حذف ${toPersianDigits(
          deleteConfirm.ids.length
        )} تراکنش اطمینان دارید؟`}
      />

      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar(null)}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default TransactionReportPage;
