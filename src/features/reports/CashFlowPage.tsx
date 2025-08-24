import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText,
  IconButton,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { type RootState } from "../../store/store";
import {
  addTransaction,
  editTransaction,
  deleteTransaction,
  type Transaction,
} from "../../store/slices/transactionsSlice";
import { type BankAccount } from "../../store/slices/accountsSlice";

type TransactionFormData = Omit<
  Transaction,
  "id" | "date" | "customerId" | "supplierId"
> & {
  personId?: number;
};

const CashFlowPage = () => {
  const dispatch = useDispatch();
  const { transactions, customers, suppliers, accounts } = useSelector(
    (state: RootState) => state
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { control, handleSubmit, reset } = useForm<TransactionFormData>();

  const receipts = transactions
    .filter((t) => t.type === "receipt")
    .reduce((sum, t) => sum + t.amount, 0);
  const payments = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

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

  const handleOpenForm = (tx: Transaction | null = null) => {
    setEditingTx(tx);
    if (tx) {
      const person = personList.find(
        (p) => p.id === (tx.customerId || tx.supplierId)
      );
      reset({
        ...tx,
        personId: person?.id,
        accountId: tx.accountId,
      });
    } else {
      reset({
        description: "",
        amount: 0,
        type: "receipt",
        personId: undefined,
        accountId: accounts.length > 0 ? accounts[0].id : "",
      });
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTx(null);
  };

  const onSubmit: SubmitHandler<TransactionFormData> = (data) => {
    const selectedPerson = personList.find((p) => p.id === data.personId);
    const transactionData = {
      description: data.description,
      amount: Number(data.amount),
      type: data.type,
      accountId: data.accountId,
      customerId:
        selectedPerson?.type === "customer" ? selectedPerson.id : undefined,
      supplierId:
        selectedPerson?.type === "supplier" ? selectedPerson.id : undefined,
    };

    if (editingTx) {
      dispatch(editTransaction({ ...editingTx, ...transactionData }));
      setSnackbar({
        open: true,
        message: "تراکنش با موفقیت ویرایش شد.",
        severity: "success",
      });
    } else {
      dispatch(
        addTransaction({
          ...transactionData,
          date: new Date().toISOString(),
        })
      );
      setSnackbar({
        open: true,
        message: "تراکنش جدید با موفقیت ثبت شد.",
        severity: "success",
      });
    }
    handleCloseForm();
  };

  const handleDeleteClick = (tx: Transaction) => {
    setTxToDelete(tx);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (txToDelete) {
      dispatch(deleteTransaction(txToDelete.id));
      setSnackbar({
        open: true,
        message: "تراکنش با موفقیت حذف شد.",
        severity: "success",
      });
    }
    setDeleteConfirmOpen(false);
    setTxToDelete(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          className="no-print"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            mb: 2,
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              justifyContent: "flex-start",
            }}
          >
            <Button
              variant="outlined"
              onClick={handlePrint}
              size={isMobile ? "small" : "medium"}
            >
              چاپ گزارش
            </Button>
            <Button
              variant="contained"
              onClick={() => handleOpenForm()}
              size={isMobile ? "small" : "medium"}
            >
              ثبت تراکنش جدید
            </Button>
          </Box>
        </Box>
        <Box className="printable-area">
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: "0.75rem",
                      p: 1,
                      textAlign: "center",
                      width: "15%",
                    }}
                  >
                    تاریخ
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.75rem",
                      p: 1,
                      textAlign: "center",
                      width: "15%",
                    }}
                  >
                    شرح
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.75rem",
                      p: 1,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      width: "30%",
                    }}
                  >
                    مبلغ دریافتی
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.75rem",
                      p: 1,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      width: "30%",
                    }}
                  >
                    مبلغ پرداختی
                  </TableCell>
                  <TableCell
                    className="no-print"
                    align="center"
                    sx={{ fontSize: "0.75rem", p: 1 }}
                  >
                    عملیات
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell
                      sx={{ fontSize: "0.4rem", p: 1, textAlign: "center" }}
                    >
                      {new Date(tx.date).toLocaleDateString("fa-IR")}
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.4rem", p: 1, wordBreak: "break-word" }}
                    >
                      {tx.description}
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.4rem", p: 1, textAlign: "center" }}
                    >
                      {tx.type === "receipt"
                        ? tx.amount.toLocaleString("fa-IR")
                        : "-"}
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.4rem", p: 1, textAlign: "center" }}
                    >
                      {tx.type === "payment"
                        ? tx.amount.toLocaleString("fa-IR")
                        : "-"}
                    </TableCell>
                    <TableCell className="no-print" align="center" sx={{ p: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(tx)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(tx)}
                      >
                        <DeleteIcon color="error" fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box
              sx={{
                p: 2,
                fontWeight: "bold",
                borderTop: "1px solid #eee",
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
                <Typography
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  جمع کل دریافتی‌ها: {receipts.toLocaleString("fa-IR")} تومان
                </Typography>
                <Typography
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  جمع کل پرداختی‌ها: {payments.toLocaleString("fa-IR")} تومان
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "0.9rem", sm: "1.05rem" } }}
                >
                  موجودی نقد: {(receipts - payments).toLocaleString("fa-IR")}{" "}
                  تومان
                </Typography>
              </Box>
            </Box>
          </TableContainer>
        </Box>
      </Paper>

      <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textAlign: "center" }}>
          {editingTx ? "ویرایش تراکنش" : "ثبت تراکنش نقدی جدید"}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box
              sx={{
                pt: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box sx={{ width: "90%" }}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>نوع تراکنش</InputLabel>
                      <Select {...field} label="نوع تراکنش">
                        <MenuItem value="receipt">دریافت</MenuItem>
                        <MenuItem value="payment">پرداخت</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
              
              <Box sx={{ width: "90%" }}>
                <Controller
                  name="accountId"
                  control={control}
                  rules={{ required: "انتخاب حساب بانکی الزامی است" }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth size="small" error={!!fieldState.error}>
                      <InputLabel>حساب بانکی</InputLabel>
                      <Select {...field} label="حساب بانکی">
                        {accountOptions.map(acc => (
                           <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                        ))}
                      </Select>
                       {fieldState.error && <Typography color="error" variant="caption">{fieldState.error.message}</Typography>}
                    </FormControl>
                  )}
                />
              </Box>

              <Box sx={{ width: "90%" }}>
                <Controller
                  name="personId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={personList}
                      getOptionLabel={(option) => option.name}
                      value={
                        personList.find((p) => p.id === field.value) || null
                      }
                      onChange={(_, newValue) => field.onChange(newValue?.id)}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      renderOption={(props, option) => (
                        <li {...props} style={{ fontSize: "0.6rem" }}>
                          {option.name}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="نام طرف حساب (اختیاری)"
                          variant="outlined"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  )}
                />
              </Box>

              <Box sx={{ width: "90%" }}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="مبلغ"
                      fullWidth
                      size="small"
                    />
                  )}
                />
              </Box>

              <Box sx={{ width: "90%" }}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="شرح تراکنش"
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      autoFocus
                    />
                  )}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button onClick={handleCloseForm}>انصراف</Button>
            <Button type="submit" variant="contained">
              ذخیره
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>تایید حذف</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا از حذف تراکنش "{txToDelete?.description}" اطمینان دارید؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>انصراف</Button>
          <Button onClick={confirmDelete} color="error">
            حذف
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default CashFlowPage;