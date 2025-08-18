import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Button, Paper, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem, Table, TableContainer,
  TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import toast, { Toaster } from 'react-hot-toast';
import { useForm, Controller, type SubmitHandler, useWatch } from 'react-hook-form';
import { type RootState } from '../../store/store';
import { addWastage } from '../../store/slices/wastageSlice';
import {type Product, updateStock } from '../../store/slices/productsSlice';

type WastageFormData = {
  productId: number;
  quantity: number;
  reason: string;
};

type ProductWithDetails = Product & {
  code?: string;
};

const WastagePage = () => {
  const dispatch = useDispatch();
  const { products, warehouses, wastage } = useSelector((state: RootState) => state); // Added wastage
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'form' | 'report'>('form'); // State for view mode

  const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm<WastageFormData>({
    defaultValues: { productId: 0, quantity: 1, reason: '' }
  });

  const watchedProductId = useWatch({ control, name: 'productId' });

  useEffect(() => {
    if (watchedProductId) {
      const product = products.find(p => p.id === watchedProductId) as ProductWithDetails;
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [watchedProductId, products]);

  const filteredProducts = useMemo(() => {
    if (!selectedWarehouseId) return [];
    return products.filter(p => p.warehouseId === selectedWarehouseId);
  }, [selectedWarehouseId, products]);

  const onSubmit: SubmitHandler<WastageFormData> = (data) => {
    const wastageQuantity = Number(data.quantity);
    if (!selectedProduct || !selectedWarehouseId || wastageQuantity <= 0) return;

    const currentStock = selectedProduct.stock?.[selectedWarehouseId] || 0;
    const newStock = currentStock - wastageQuantity;

    dispatch(updateStock({
      productId: data.productId,
      warehouseId: selectedWarehouseId,
      quantity: newStock,
    }));

    dispatch(addWastage({
      productId: data.productId,
      quantity: wastageQuantity,
      reason: data.reason,
      warehouseId: selectedWarehouseId,
      date: new Date().toISOString(),
    }));
    
    toast.success('ضایعات با موفقیت ثبت شد.');
    reset({ productId: 0, quantity: 1, reason: '' });
    setSelectedWarehouseId(0);
  };

  const today = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  if (viewMode === 'report') {
    return (
      <Paper sx={{ p: 2, direction: 'rtl' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>گزارش ضایعات</Typography>
          <Button variant="contained" onClick={() => setViewMode('form')}>ثبت ضایعات جدید</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="right">کالا</TableCell>
                <TableCell align="right">انبار</TableCell>
                <TableCell align="center">تعداد</TableCell>
                <TableCell align="right">تاریخ</TableCell>
                <TableCell align="right">علت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wastage.map(entry => {
                const product = products.find(p => p.id === entry.productId);
                const warehouse = warehouses.find(w => w.id === entry.warehouseId);
                return (
                  <TableRow key={entry.id}>
                    <TableCell align="right">{product?.name || 'یافت نشد'}</TableCell>
                    <TableCell align="right">{warehouse?.name || 'یافت نشد'}</TableCell>
                    <TableCell align="center">{entry.quantity}</TableCell>
                    <TableCell align="right">{new Date(entry.date).toLocaleDateString('fa-IR')}</TableCell>
                    <TableCell align="right">{entry.reason}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', direction: 'rtl' }}>
      <Toaster position="top-center" />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}>
          ضایعات انبار
        </Typography>
      </Box>

      <Paper sx={{ p: 2, flexGrow: 1, border: '1px solid #e0e0e0', borderRadius: '12px' }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid>
              <Typography>تاریخ صدور: {today}</Typography>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px' }}>
            <Grid container spacing={1}>
              <Grid>
                <FormControl fullWidth size="small">
                    <InputLabel>انتخاب انبار</InputLabel>
                    <Select
                    sx={{ minHeight: 55 }}
                      value={selectedWarehouseId}
                      label="انتخاب انبار"
                      onChange={(e) => {
                        setSelectedWarehouseId(e.target.value as number);
                        setValue('productId', 0); 
                      }}
                    >
                      <MenuItem value={0} disabled><em>یک انبار انتخاب کنید</em></MenuItem>
                      {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                    </Select>
                </FormControl>
              </Grid>
              <Grid>
                <FormControl fullWidth error={!!errors.productId}>
                  <InputLabel shrink>نام کالا</InputLabel>
                  <Controller
                    name="productId"
                    control={control}
                    rules={{ required: true, min: 1 }}
                    render={({ field }) => (
                      <Select
                      sx={{ minWidth: 120 }}
                        {...field}
                        label="نام کالا"
                        notched
                        disabled={!selectedWarehouseId}
                        renderValue={(selectedId) => {
                          const product = products.find(p => p.id === selectedId);
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {product?.name || ''}
                            </Box>
                          );
                        }}
                      >
                        <MenuItem value={0} disabled><em>یک کالا انتخاب کنید</em></MenuItem>
                        {filteredProducts.map(p => (
                          <MenuItem key={p.id} value={p.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Inventory2Icon fontSize="small" />
                              {p.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid>
                 <TextField
                   label="موجودی انبار"
                   value={selectedProduct?.stock?.[selectedWarehouseId] || 0}
                   fullWidth
                   disabled
                   InputLabelProps={{ shrink: true }}
                 />
              </Grid>
              <Grid >
                 <Controller
                  name="quantity"
                  control={control}
                  rules={{
                    required: 'تعداد اجباری است',
                    min: {value: 1, message: 'تعداد باید مثبت باشد'},
                    validate: value => (selectedProduct && (selectedProduct.stock?.[selectedWarehouseId] || 0) >= value) || 'تعداد ضایعات از موجودی بیشتر است'
                  }}
                  render={({ field }) => (
                    <TextField {...field} label="تعداد" type="number" fullWidth error={!!errors.quantity} helperText={errors.quantity?.message} InputLabelProps={{ shrink: true }}/>
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ mt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ mb: 1 }}>علت کسری</Typography>
            <Controller
              name="reason"
              control={control}
              rules={{ required: 'علت کسری اجباری است' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.reason}
                  helperText={errors.reason?.message}
                  sx={{ flexGrow: 1 }}
                />
              )}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, pt: 2, mt: 'auto' }}>
            <Button type="submit" variant="contained">ثبت</Button>
            <Button variant="outlined" color="error">حذف</Button>
            <Button variant="outlined" color="secondary" onClick={() => setViewMode('report')}>گزارش</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default WastagePage;