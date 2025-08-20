import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, TextField, IconButton,
  Snackbar, Alert, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import {type RootState } from '../../store/store';
import { updateStock } from '../../store/slices/productsSlice';
import { ProductFormDialog } from '../products/ProductFormDialog';

const InventoryPage = () => {
  const dispatch = useDispatch();
  const { products, warehouses } = useSelector((state: RootState) => state);
  
  const [selectedWarehouse, setSelectedWarehouse] = useState<number>(warehouses[0]?.id || 0);
  const [editingRow, setEditingRow] = useState<{ [productId: number]: string }>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
  const [isProductFormOpen, setProductFormOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!selectedWarehouse) return [];
    return products.filter(product => product.warehouseId === selectedWarehouse);
  }, [products, selectedWarehouse]);

  const handleStockChange = (productId: number, value: string) => {
    setEditingRow(prev => ({ ...prev, [productId]: value }));
  };

  const handleSaveStock = (productId: number) => {
    const newQuantity = Number(editingRow[productId]);
    if (!isNaN(newQuantity) && selectedWarehouse) {
      dispatch(updateStock({ productId, warehouseId: selectedWarehouse, quantity: newQuantity }));
      setSnackbar({ open: true, message: 'موجودی با موفقیت به‌روز شد.', severity: 'success' });
      setEditingRow(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    } else {
      setSnackbar({ open: true, message: 'لطفا مقدار عددی معتبر وارد کنید.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center' ,display:'flex',justifyItems:'right', mb: 3 }}>
            <Button variant="contained" onClick={() => setProductFormOpen(true)}>
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
                <TableCell>نام کالا</TableCell>
                <TableCell align="center">قیمت فروش</TableCell>
                <TableCell align="center">موجودی فعلی</TableCell>
                <TableCell align="center">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => {
                const stock = product.stock?.[selectedWarehouse] || 0;
                const isEditing = editingRow[product.id] !== undefined;

                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="center">{(product.retailPrice || 0).toLocaleString()} تومان</TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editingRow[product.id]}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          sx={{ width: 80 }}
                        />
                      ) : (
                        stock
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <IconButton color="primary" onClick={() => handleSaveStock(product.id)}>
                          <SaveIcon />
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => setEditingRow({ [product.id]: String(stock) })}>
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
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
            <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default InventoryPage;