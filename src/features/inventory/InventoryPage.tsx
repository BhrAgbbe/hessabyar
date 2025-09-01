import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, IconButton, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { type RootState } from '../../store/store';
import { updateStock } from '../../store/slices/productsSlice';
import { ProductFormDialog } from '../../components/ProductFormDialog';
import { useToast } from '../../hooks/useToast';
import CustomTextField from '../../components/TextField';
import { toPersianDigits } from '../../utils/utils';

const InventoryPage = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { products, warehouses } = useSelector((state: RootState) => state);
  
  const [selectedWarehouse, setSelectedWarehouse] = useState<number>(warehouses[0]?.id || 0);
  const [editingRow, setEditingRow] = useState<{ [productId: number]: string }>({});
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
      showToast('موجودی با موفقیت به‌روز شد.', 'success');
      setEditingRow(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    } else {
      showToast('لطفا مقدار عددی معتبر وارد کنید.', 'error');
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
                <TableCell align="center">نام کالا</TableCell>
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
                    <TableCell align="center">{product.name}</TableCell>
                    <TableCell align="center">{toPersianDigits(product.retailPrice || 0)} تومان</TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <CustomTextField
                          size="small"
                          type="number"
                          value={editingRow[product.id]}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          sx={{ width: 80 }}
                        />
                      ) : (
                        toPersianDigits(stock)
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
    </Box>
  );
};

export default InventoryPage;