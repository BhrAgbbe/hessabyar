import { useState, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { type Product, type ProductFormData } from "../../types/product";
import { productSchema } from "../../schema/productSchema";
import {
  fetchProducts,
  addProduct,
  editProduct,
  deleteProduct,
} from "../../mocks/productsApi";
import { useToast } from "../../hooks/useToast";

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [view, setView] = useState<"form" | "report">("report");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<"name" | "code">("name");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    defaultValues: {
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
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      if (editingProduct) {
        return editProduct({
          ...data,
          id: editingProduct.id,
          stock: editingProduct.stock,
        });
      }
      return addProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast(
        editingProduct ? "کالا با موفقیت ویرایش شد." : "کالا با موفقیت ثبت شد.",
        "success"
      );
      setView("report");
      setEditingProduct(null);
    },
    onError: () => {
      showToast("عملیات با خطا مواجه شد.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("کالا با موفقیت حذف شد.", "success");
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      showToast("حذف با خطا مواجه شد.", "error");
    },
  });

  const getNextId = () => {
    const maxId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) : 14;
    return maxId < 15 ? 15 : maxId + 1;
  };

  const handleSetFormView = (product: Product | null = null) => {
    setEditingProduct(product);
    reset(
      product || {
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
      }
    );
    setView("form");
  };

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    mutation.mutate(data);
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete !== null) {
      deleteMutation.mutate(productToDelete);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchBy === "name") {
        return p.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return String(p.id).includes(searchTerm);
    });
  }, [products, searchTerm, searchBy]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography color="error" sx={{ p: 4 }}>
        خطا در دریافت اطلاعات محصولات.
      </Typography>
    );
  }

  return (
    <Box>
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
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="نام کالا"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="unitId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="واحد کالا"
                      type="number"
                      fullWidth
                      error={!!errors.unitId}
                      helperText={errors.unitId?.message}
                    />
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
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="قیمت خرید"
                      fullWidth
                      error={!!errors.purchasePrice}
                      helperText={errors.purchasePrice?.message}
                    />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="retailPrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="قیمت فروش"
                      fullWidth
                      error={!!errors.retailPrice}
                      helperText={errors.retailPrice?.message}
                    />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="wholesalePrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="قیمت فروش عمده"
                      fullWidth
                      error={!!errors.wholesalePrice}
                      helperText={errors.wholesalePrice?.message}
                    />
                  )}
                />
              </Grid>
              <Grid>
                <Controller
                  name="warehouseId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="کد انبار"
                      fullWidth
                      error={!!errors.warehouseId}
                      helperText={errors.warehouseId?.message}
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
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "در حال ذخیره..." : "ثبت"}
                  </Button>
                </Grid>
                {editingProduct && (
                  <Grid>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteClick(editingProduct.id)}
                    >
                      حذف
                    </Button>
                  </Grid>
                )}
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
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "در حال حذف..." : "حذف"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;
