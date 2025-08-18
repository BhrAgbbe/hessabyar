import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Snackbar, Alert
} from '@mui/material';
import {type RootState } from '../../store/store';
import { updateStock } from '../../store/slices/productsSlice';
import { ProductFormDialog } from '../products/ProductFormDialog';

const StockTakingPage = () => {
  const dispatch = useDispatch();
  const { products, warehouses } = useSelector((state: RootState) => state);
  
  const [selectedWarehouse, setSelectedWarehouse] = useState<number>(warehouses[0]?.id || 0);
  const [stockCounts, setStockCounts] = useState<{ [productId: number]: string }>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; } | null>(null);
  const [isProductFormOpen, setProductFormOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!selectedWarehouse) return [];
    return products.filter(product => product.warehouseId === selectedWarehouse);
  }, [products, selectedWarehouse]);

  useEffect(() => {
    const initialCounts: { [productId: number]: string } = {};
    filteredProducts.forEach(p => {
      initialCounts[p.id] = String(p.stock?.[selectedWarehouse] || 0);
    });
    setStockCounts(initialCounts);
  }, [selectedWarehouse, filteredProducts]);
  
  const handleCountChange = (productId: number, count: string) => {
    setStockCounts(prev => ({...prev, [productId]: count}));
  };

  const handleApplyChanges = () => {
    for (const productId in stockCounts) {
        dispatch(updateStock({
            productId: Number(productId),
            warehouseId: selectedWarehouse,
            quantity: Number(stockCounts[productId])
        }));
    }
    setSnackbar({ open: true, message: 'موجودی انبار با موفقیت به‌روزرسانی شد.' });
    setConfirmOpen(false);
  };

  return (
    <Box>
        <Box mb={3}>
          <Button variant="contained"  onClick={() => setProductFormOpen(true)}>
            افزودن کالا
          </Button>
        </Box>
      

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>انتخاب انبار</InputLabel>
        <Select
          value={selectedWarehouse}
          label="انتخاب انبار"
          onChange={(e) => setSelectedWarehouse(e.target.value as number)}
        >
          {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
        </Select>
      </FormControl>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="right">نام کالا</TableCell>
                <TableCell align="center">قیمت فروش</TableCell>
                <TableCell align="center">موجودی شمارش شده</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell align="right">{product.name}</TableCell>
                  <TableCell align="center">{(product.retailPrice || 0).toLocaleString()} تومان</TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      value={stockCounts[product.id] || ''}
                      onChange={(e) => handleCountChange(product.id, e.target.value)}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={() => setConfirmOpen(true)}>
            ثبت نهایی و به‌روزرسانی موجودی انبار
        </Button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ textAlign: 'right' }}>تایید عملیات</DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ textAlign: 'right' }}>
                آیا از ثبت موجودی جدید برای انبار "{warehouses.find(w=>w.id === selectedWarehouse)?.name}" اطمینان دارید؟ 
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>انصراف</Button>
            <Button onClick={handleApplyChanges} color="primary" variant="contained">
                تایید و ثبت
            </Button>
        </DialogActions>
      </Dialog>

      {isProductFormOpen && (
        <ProductFormDialog 
            open={isProductFormOpen} 
            onClose={() => setProductFormOpen(false)} 
            product={null} 
        />
      )}

      {snackbar && (
        <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={() => setSnackbar(null)} severity="success" sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default StockTakingPage;