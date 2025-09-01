import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Button, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import { useForm, type SubmitHandler, useWatch, Controller, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { wastageSchema, type WastageFormData } from '../../schema/wastageSchema'; 

import { type RootState } from '../../store/store';
import { addWastage } from '../../store/slices/wastageSlice';
import { updateStock } from '../../store/slices/productsSlice';
import {type Product } from '../../types/product';
import { useToast } from '../../hooks/useToast';

import EnhancedMuiTable, { type HeadCell } from '../../components/Table'; 

const WastagePage = () => {
  const dispatch = useDispatch();
  const { products, warehouses, wastage } = useSelector((state: RootState) => state);
  const { showToast } = useToast(); 

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'form' | 'report'>('form');

const { control, handleSubmit, formState: { errors }, setValue, reset, trigger } = useForm<WastageFormData>({
    resolver: yupResolver(wastageSchema) as Resolver<WastageFormData>, 
    defaultValues: { productId: 0, quantity: 1, reason: '' }
});

  const watchedProductId = useWatch({ control, name: 'productId' });

  useEffect(() => {
    if (watchedProductId) {
      const product = products.find(p => p.id === watchedProductId);
      setSelectedProduct(product || null);
      trigger('quantity');
    } else {
      setSelectedProduct(null);
    }
  }, [watchedProductId, products, trigger]);

  const filteredProducts = useMemo(() => {
    if (!selectedWarehouseId) return [];
    return products.filter(p => p.warehouseId === selectedWarehouseId);
  }, [selectedWarehouseId, products]);

  const onSubmit: SubmitHandler<WastageFormData> = (data) => {
    const wastageQuantity = Number(data.quantity);
    if (!selectedProduct || !selectedWarehouseId || wastageQuantity <= 0) return;

    const currentStock = selectedProduct.stock?.[selectedWarehouseId] || 0;
    if (wastageQuantity > currentStock) {
        showToast('تعداد ضایعات از موجودی بیشتر است.', 'error');
        return;
    }
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

    showToast('ضایعات با موفقیت ثبت شد.', 'success'); 
    reset({ productId: 0, quantity: 1, reason: '' });
    setSelectedWarehouseId(0);
  };

  const today = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const reportHeadCells: HeadCell<typeof wastage[0]>[] = [
    {
      id: 'productId',
      label: 'کالا',
      numeric: false,
      cell: (row) => products.find(p => p.id === row.productId)?.name || 'یافت نشد'
    },
    {
      id: 'warehouseId',
      label: 'انبار',
      numeric: false,
      cell: (row) => warehouses.find(w => w.id === row.warehouseId)?.name || 'یافت نشد'
    },
    { id: 'quantity', label: 'تعداد', numeric: true },
    { 
      id: 'date',
      label: 'تاریخ',
      numeric: false,
      cell: (row) => new Date(row.date).toLocaleDateString('fa-IR')
    },
    { id: 'reason', label: 'علت', numeric: false },
  ];

  if (viewMode === 'report') {
    return (
      <Paper sx={{ p: 2}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>گزارش ضایعات</Typography>
          <Button variant="contained" onClick={() => setViewMode('form')}>ثبت ضایعات جدید</Button>
        </Box>
        <EnhancedMuiTable
          rows={wastage}
          headCells={reportHeadCells}
          title=""
        />
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Paper sx={{ p: 2, flexGrow: 1, border: '1px solid #e0e0e0', borderRadius: '12px' }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ mb: 2 }}>
              <Typography>تاریخ صدور: {today}</Typography>
          </Box>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>انتخاب انبار</InputLabel>
              <Select
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
          
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
                name="productId"
                control={control}
                render={({ field }) => (
                    <FormControl fullWidth error={!!errors.productId}>
                        <InputLabel>نام کالا</InputLabel>
                        <Select {...field} label="نام کالا" disabled={!selectedWarehouseId}>
                            <MenuItem value={0} disabled><em>یک کالا انتخاب کنید</em></MenuItem>
                            {filteredProducts.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                        </Select>
                        {errors.productId && <FormHelperText>{errors.productId.message}</FormHelperText>}
                    </FormControl>
                )}
            />

            <TextField
                label="موجودی انبار"
                value={selectedProduct?.stock?.[selectedWarehouseId] || 0}
                fullWidth
                disabled
                size="small"
                InputLabelProps={{ shrink: true }}
            />

            <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        type="number"
                        label="تعداد"
                        error={!!errors.quantity}
                        helperText={errors.quantity?.message}
                    />
                )}
            />
            
            <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="علت کسری"
                        multiline
                        rows={4}
                        error={!!errors.reason}
                        helperText={errors.reason?.message}
                    />
                )}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              pt: 2,
              mt: 'auto',
            }}
          >
            <Button type="submit" variant="contained">ثبت</Button>
            <Button variant="outlined" color="secondary" onClick={() => setViewMode('report')}>گزارش</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default WastagePage;