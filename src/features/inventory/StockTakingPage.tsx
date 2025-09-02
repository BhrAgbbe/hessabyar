import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { type RootState } from "../../store/store";
import { updateStock } from "../../store/slices/productsSlice";
import { ProductFormDialog } from "../../components/ProductFormDialog";
import { useToast } from "../../hooks/useToast";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import CustomTextField from "../../components/TextField";
import { toPersianDigits } from "../../utils/utils";

const StockTakingPage = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { products, warehouses } = useSelector((state: RootState) => state);

  const [selectedWarehouse, setSelectedWarehouse] = useState<number>(
    warehouses[0]?.id || 0
  );
  const [stockCounts, setStockCounts] = useState<{
    [productId: number]: string;
  }>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isProductFormOpen, setProductFormOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!selectedWarehouse) return [];
    return products.filter(
      (product) => product.warehouseId === selectedWarehouse
    );
  }, [products, selectedWarehouse]);

  useEffect(() => {
    const initialCounts: { [productId: number]: string } = {};
    filteredProducts.forEach((p) => {
      initialCounts[p.id] = String(p.stock?.[selectedWarehouse] || 0);
    });
    setStockCounts(initialCounts);
  }, [selectedWarehouse, filteredProducts]);

  const handleCountChange = (productId: number, count: string) => {
    setStockCounts((prev) => ({ ...prev, [productId]: count }));
  };

  const handleApplyChanges = () => {
    for (const productId in stockCounts) {
      dispatch(
        updateStock({
          productId: Number(productId),
          warehouseId: selectedWarehouse,
          quantity: Number(stockCounts[productId]),
        })
      );
    }
    showToast("موجودی انبار با موفقیت به‌روزرسانی شد.", "success");
    setConfirmOpen(false);
  };

  const warehouseName =
    warehouses.find((w) => w.id === selectedWarehouse)?.name || "";

  return (
    <Box>
      <Box mb={3}>
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
          {warehouses.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">نام کالا</TableCell>
                <TableCell align="center">قیمت فروش</TableCell>
                <TableCell align="center">موجودی شمارش شده</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell align="center">{product.name}</TableCell>
                  <TableCell align="center">
                    {toPersianDigits(product.retailPrice || 0)} تومان
                  </TableCell>
                  <TableCell align="center">
                    <CustomTextField
                      size="small"
                      type="number"
                      value={stockCounts[product.id] || ""}
                      onChange={(e) =>
                        handleCountChange(product.id, e.target.value)
                      }
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setConfirmOpen(true)}
        >
          ثبت نهایی و به‌روزرسانی موجودی انبار
        </Button>
      </Box>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleApplyChanges}
        title="تایید عملیات"
        message={`آیا از ثبت موجودی جدید برای انبار "${warehouseName}" اطمینان دارید؟`}
      />

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

export default StockTakingPage;
