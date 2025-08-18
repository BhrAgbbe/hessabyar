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
import { Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { type RootState } from "../../store/store";
import {
  addTransaction,
  editTransaction,
  deleteTransaction,
  type Transaction,
} from "../../store/slices/transactionsSlice";

type TransactionFormData = Omit<
  Transaction,
  "id" | "date" | "customerId" | "supplierId"
> & {
  personId?: number;
};

const CashFlowPage = () => {
  const dispatch = useDispatch();
  const { transactions, customers, suppliers } = useSelector(
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

  const handleOpenForm = (tx: Transaction | null = null) => {
    setEditingTx(tx);
    if (tx) {
      const person = personList.find(
        (p) => p.id === (tx.customerId || tx.supplierId)
      );
      reset({
        ...tx,
        personId: person?.id,
      });
    } else {
      reset({
        description: "",
        amount: 0,
        type: "receipt",
        personId: undefined,
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
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              fontSize: { xs: "0.75rem", sm: "1.5rem" },
              mb: 2,
            }}
          >
            صورت دریافت و پرداخت نقدی
          </Typography>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          className="no-print"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 2,
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              size={isMobile ? "small" : "medium"}
            >
              چاپ گزارش
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              size={isMobile ? "small" : "medium"}
            >
              ثبت تراکنش جدید
            </Button>
          </Box>
        </Box>
        <Box className="printable-area">
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>تاریخ</TableCell>
                  <TableCell>شرح</TableCell>
                  <TableCell>مبلغ دریافتی</TableCell>
                  <TableCell>مبلغ پرداختی</TableCell>
                  <TableCell className="no-print" align="right">
                    عملیات
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.date).toLocaleDateString("fa-IR")}
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>
                      {tx.type === "receipt"
                        ? tx.amount.toLocaleString("fa-IR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {tx.type === "payment"
                        ? tx.amount.toLocaleString("fa-IR")
                        : "-"}
                    </TableCell>
                    <TableCell className="no-print" align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(tx)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(tx)}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ p: 2, textAlign: "right", fontWeight: "bold" }}>
              <Typography>
                جمع کل دریافتی‌ها: {receipts.toLocaleString("fa-IR")} تومان
              </Typography>
              <Typography>
                جمع کل پرداختی‌ها: {payments.toLocaleString("fa-IR")} تومان
              </Typography>
              <Typography variant="h6">
                موجودی نقد: {(receipts - payments).toLocaleString("fa-IR")}{" "}
                تومان
              </Typography>
            </Box>
          </TableContainer>
        </Box>
      </Paper>

      <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingTx ? "ویرایش تراکنش" : "ثبت تراکنش نقدی جدید"}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>نوع تراکنش</InputLabel>
                      <Select {...field} label="نوع تراکنش">
                        <MenuItem value="receipt">دریافت</MenuItem>
                        <MenuItem value="payment">پرداخت</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid>
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="شخص"
                          variant="outlined"
                          sx={{ width: "100%" }}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid>
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
                    />
                  )}
                />
              </Grid>

              <Grid>
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
                      rows={4}
                      autoFocus
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
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
