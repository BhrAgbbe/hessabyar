import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { type RootState } from "../../store/store";
import {
  type Product,
  type ProductFormData,
  addProduct,
  editProduct,
  deleteProduct,
} from "../../store/slices/productsSlice";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [view, setView] = useState<"form" | "report">("form");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<"name" | "code">("name");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const { products } = useSelector((state: RootState) => state);
  const { control, handleSubmit, reset } = useForm<ProductFormData>();

  const getNextId = () => {
    const maxId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) : 14;
    return maxId < 15 ? 15 : maxId + 1;
  };

  const handleSetFormView = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      reset(product);
    } else {
      reset({
        name: "",
        unitId: 0,
        groupId: 0,
        model: "",
        purchasePrice: 0,
        wholesalePrice: 0,
        retailPrice: 0,
        warehouseId: 0,
        barcode: "",
        allowDuplicate: false,
      });
    }
    setView("form");
  };

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    const processedData = {
      ...data,
      purchasePrice: Number(data.purchasePrice),
      wholesalePrice: Number(data.wholesalePrice),
      retailPrice: Number(data.retailPrice),
    };
    if (editingProduct) {
      dispatch(editProduct({ ...processedData, id: editingProduct.id }));
      setSnackbar({
        open: true,
        message: "کالا با موفقیت ویرایش شد.",
        severity: "success",
      });
    } else {
      dispatch(addProduct(processedData));
      setSnackbar({
        open: true,
        message: "کالا با موفقیت ثبت شد.",
        severity: "success",
      });
    }
    handleSetFormView(null);
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete !== null) {
      dispatch(deleteProduct(productToDelete));
      setSnackbar({
        open: true,
        message: "کالا با موفقیت حذف شد.",
        severity: "success",
      });
    }
    setDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchBy === "name") {
        return p.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return String(p.id).includes(searchTerm);
    });
  }, [products, searchTerm, searchBy]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", fontSize: { xs: '0.75rem', sm: '1.5rem' } }}>
        اطلاعات پایه
      </Typography>

      {view === "form" ? (
        <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
          <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
            معرفی کالا
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} direction="column">
              <Grid sx={{ textAlign: "right" }}>
                <Typography>
                  کد کالا: {editingProduct ? editingProduct.id : getNextId()}
                </Typography>
              </Grid>
              <Grid>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField {...field} label="نام کالا" fullWidth />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="unitId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField {...field} label="واحد کالا" fullWidth />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="model"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="مدل کالا" fullWidth />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="purchasePrice"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="قیمت خرید"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="retailPrice"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="قیمت فروش"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="wholesalePrice"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="قیمت فروش عمده"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="warehouseId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="کد انبار"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="barcode"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="شماره بارکد" fullWidth />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="allowDuplicate"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="امکان تکرار پذیری کالا"
                    />
                  )}
                />
              </Grid>
              <Grid container spacing={1} justifyContent="center">
                <Grid>
                  <Button type="submit" variant="contained">
                    ثبت
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      editingProduct && handleDeleteClick(editingProduct.id)
                    }
                  >
                    حذف
                  </Button>
                </Grid>
                <Grid>
                  <Button variant="outlined" onClick={() => setView("report")}>
                    گزارش کالا
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
            لیست گزارش کالا
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
            <TextField
              label="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
            <RadioGroup
              row
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as "name" | "code")}
            >
              <FormControlLabel
                value="name"
                control={<Radio size="small" />}
                label="نام کالا"
              />
              <FormControlLabel
                value="code"
                control={<Radio size="small" />}
                label="کد کالا"
              />
            </RadioGroup>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>کد</TableCell>
                  <TableCell>نام کالا</TableCell>
                  <TableCell>قیمت فروش</TableCell>
                  <TableCell>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.retailPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleSetFormView(p)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(p.id)}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button variant="contained" onClick={() => handleSetFormView(null)}>
              ثبت کالای جدید
            </Button>
          </Box>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>تایید حذف</DialogTitle>
        <DialogContent>
          <Typography>آیا از حذف این کالا اطمینان دارید؟</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>انصراف</Button>
          <Button onClick={confirmDelete} color="error">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;
