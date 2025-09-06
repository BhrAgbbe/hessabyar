import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { type RootState } from "../../store/store";
import {
  type ProductFormData,
  addProduct,
  editProduct,
} from "../../store/slices/productsSlice";
import { type Product } from "../../types/product";
import { Result } from "@zxing/library";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(() => import("react-qr-barcode-scanner"), {
  ssr: false,
});

import CustomTextField from "../../components/TextField";
import FormDialog from "../../components/FormDialog";
import { useToast } from "../../hooks/useToast";

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onClose,
  product,
}) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { groups, units, warehouses } = useSelector(
    (state: RootState) => state
  );
  const [scannerOpen, setScannerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    defaultValues: product || {
      name: "",
      model: "",
      purchasePrice: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      groupId: 0,
      unitId: 0,
      warehouseId: 0,
      barcode: "",
      allowDuplicate: false,
    },
  });

  const handleScan = (err: unknown, result?: Result) => {
    if (result) {
      setValue("barcode", result.getText());
      setScannerOpen(false);
    }
  };

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    const processedData = {
      ...data,
      purchasePrice: Number(data.purchasePrice),
      retailPrice: Number(data.retailPrice),
      wholesalePrice: Number(data.wholesalePrice),
    };

    if (product) {
      dispatch(editProduct({ id: product.id, ...processedData }));
      showToast("کالا با موفقیت ویرایش شد.", "success");
    } else {
      dispatch(addProduct(processedData));
      showToast("کالای جدید با موفقیت اضافه شد.", "success");
    }
    onClose();
  };

  return (
    <>
      <FormDialog
        open={open}
        onClose={onClose}
        onSave={handleSubmit(onSubmit)}
        title={product ? "ویرایش کالا" : "افزودن کالای جدید"}
      >
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid size={{xs:12}}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "نام کالا اجباری است" }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label="نام کالا"
                  fullWidth
                  autoFocus
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{xs:12}}>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} label="مدل کالا" fullWidth />
              )}
            />
          </Grid>
          <Grid size={{xs:12}} container spacing={1} alignItems="center">
            <Grid size={{xs:8}}>
              <Controller
                name="barcode"
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} label="شماره بارکد" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{xs:4}}>
              <Button
                variant="contained"
                onClick={() => setScannerOpen(true)}
                fullWidth
                sx={{ height: "56px" }}
              >
                اسکن
              </Button>
            </Grid>
          </Grid>
          <Grid size={{xs:12}}>
            <Controller
              name="groupId"
              control={control}
              rules={{
                validate: (value) => value > 0 || "گروه کالا الزامی است",
              }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!errors.groupId}
                  sx={{ minWidth: 160 }}
                >
                  <InputLabel>گروه کالا</InputLabel>
                  <Select {...field} label="گروه کالا">
                    {groups.map((g) => (
                      <MenuItem key={g.id} value={g.id}>
                        {g.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={{xs:12}}>
            <Controller
              name="unitId"
              control={control}
              rules={{
                validate: (value) => value > 0 || "واحد کالا الزامی است",
              }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!errors.unitId}
                  sx={{ minWidth: 160 }}
                >
                  <InputLabel>واحد کالا</InputLabel>
                  <Select {...field} label="واحد کالا">
                    {units.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={{xs:12}}>
            <Controller
              name="warehouseId"
              control={control}
              rules={{ validate: (value) => value > 0 || "انبار الزامی است" }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!errors.warehouseId}
                  sx={{ minWidth: 160 }}
                >
                  <InputLabel>انبار</InputLabel>
                  <Select {...field} label="انبار">
                    {warehouses.map((w) => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={{xs:12}}>
            <Controller
              name="purchasePrice"
              control={control}
              rules={{ required: "قیمت خرید الزامی است", min: 0 }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label="قیمت خرید"
                  type="number"
                  fullWidth
                  error={!!errors.purchasePrice}
                  helperText={errors.purchasePrice?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{xs:12}}>
            <Controller
              name="retailPrice"
              control={control}
              rules={{ required: "قیمت فروش الزامی است", min: 0 }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label="قیمت فروش"
                  type="number"
                  fullWidth
                  error={!!errors.retailPrice}
                  helperText={errors.retailPrice?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{xs:12}}>
            <Controller
              name="wholesalePrice"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label="قیمت فروش عمده"
                  type="number"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{xs:12}}>
            <Controller
              name="allowDuplicate"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="امکان تکرار پذیری کالا در فاکتور"
                />
              )}
            />
          </Grid>
        </Grid>
      </FormDialog>
      {scannerOpen && (
        <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)}>
          <DialogContent>
            <BarcodeScanner onUpdate={handleScan} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScannerOpen(false)}>بستن</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
