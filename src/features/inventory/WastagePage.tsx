import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Button, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useForm, type SubmitHandler, useWatch } from 'react-hook-form';

import { type RootState } from '../../store/store';
import { addWastage } from '../../store/slices/wastageSlice';
import { type Product, updateStock } from '../../store/slices/productsSlice';
import { useToast } from '../../hooks/useToast';

import Form, { type FormField } from '../../components/Form'; 
import EnhancedMuiTable, { type HeadCell } from '../../components/Table'; 

type WastageFormData = {
  productId: number;
  quantity: number;
  reason: string;
};

const WastagePage = () => {
  const dispatch = useDispatch();
  const { products, warehouses, wastage } = useSelector((state: RootState) => state);
  const { showToast } = useToast(); 

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'form' | 'report'>('form');

  const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm<WastageFormData>({
    defaultValues: { productId: 0, quantity: 1, reason: '' }
  });

  const watchedProductId = useWatch({ control, name: 'productId' });

  useEffect(() => {
    if (watchedProductId) {
      const product = products.find(p => p.id === watchedProductId);
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

    showToast('ضایعات با موفقیت ثبت شد.', 'success'); 
    reset({ productId: 0, quantity: 1, reason: '' });
    setSelectedWarehouseId(0);
  };

  const today = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const formConfig: FormField<WastageFormData>[] = [
    {
      name: 'productId',
      label: 'نام کالا',
      type: 'select',
      rules: { required: true, min: 1 },
      options: filteredProducts.map(p => ({ id: p.id, label: p.name }))
    },
    {
      name: 'quantity',
      label: 'تعداد',
      type: 'number',
      rules: {
        required: 'تعداد اجباری است',
        min: { value: 1, message: 'تعداد باید مثبت باشد' },
        validate: value => (selectedProduct && (selectedProduct.stock?.[selectedWarehouseId] || 0) >= value) || 'تعداد ضایعات از موجودی بیشتر است'
      }
    },
    {
      name: 'reason',
      label: 'علت کسری',
      type: 'textarea',
      rules: { required: 'علت کسری اجباری است' },
      rows: 4
    }
  ];

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
      <Paper sx={{ p: 2, direction: 'rtl' }}>
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
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', direction: 'rtl' }}>
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

           <TextField
             label="موجودی انبار"
             value={selectedProduct?.stock?.[selectedWarehouseId] || 0}
             fullWidth
             disabled
             size="small"
             InputLabelProps={{ shrink: true }}
             sx={{ mb: 2 }}
           />
          
          <Box sx={{ flexGrow: 1 }}>
            <Form config={formConfig} control={control} errors={errors} />
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
            <Button variant="outlined" color="error">حذف</Button>
            <Button variant="outlined" color="secondary" onClick={() => setViewMode('report')}>گزارش</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default WastagePage;