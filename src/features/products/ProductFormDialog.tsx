import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox
} from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { type RootState } from '../../store/store';
import { type Product, type ProductFormData, addProduct, editProduct } from '../../store/slices/productsSlice';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({ open, onClose, product }) => {
  const dispatch = useDispatch();
  const { groups, units, warehouses } = useSelector((state: RootState) => state);

  const { control, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: product || {
      name: '',
      model: '',
      purchasePrice: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      groupId: 0,
      unitId: 0,
      warehouseId: 0,
      barcode: '',
      allowDuplicate: false,
    }
  });

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    const processedData = {
        ...data,
        purchasePrice: Number(data.purchasePrice),
        retailPrice: Number(data.retailPrice),
        wholesalePrice: Number(data.wholesalePrice),
    };
    
    if (product) {
      dispatch(editProduct({ id: product.id, ...processedData }));
    } else {
      dispatch(addProduct(processedData));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{product ? 'ویرایش کالا' : 'افزودن کالای جدید'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            
            <Grid>
              <Controller name="name" control={control} rules={{ required: 'نام کالا اجباری است' }}
                render={({ field }) => <TextField {...field} label="نام کالا" fullWidth autoFocus error={!!errors.name} helperText={errors.name?.message} />}
              />
            </Grid>

            <Grid>
              <Controller name="model" control={control}
                render={({ field }) => <TextField {...field} label="مدل کالا" fullWidth />}
              />
            </Grid>
            <Grid >
              <Controller name="barcode" control={control}
                render={({ field }) => <TextField {...field} label="شماره بارکد" fullWidth />}
              />
            </Grid>
            <Grid >
              <FormControl fullWidth error={!!errors.groupId}>
                <InputLabel>گروه کالا</InputLabel>
                <Controller name="groupId" control={control} rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <Select {...field} label="گروه کالا">
                      {groups.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid >
              <FormControl fullWidth error={!!errors.unitId}>
                <InputLabel>واحد کالا</InputLabel>
                <Controller name="unitId" control={control} rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <Select {...field} label="واحد کالا">
                      {units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid >
              <FormControl fullWidth error={!!errors.warehouseId}>
                <InputLabel>انبار</InputLabel>
                <Controller name="warehouseId" control={control} rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <Select {...field} label="انبار">
                      {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid >
              <Controller name="purchasePrice" control={control} rules={{ required: true, min: 0 }}
                render={({ field }) => <TextField {...field} label="قیمت خرید" type="number" fullWidth />}
              />
            </Grid>
            <Grid>
              <Controller name="retailPrice" control={control} rules={{ required: true, min: 0 }}
                render={({ field }) => <TextField {...field} label="قیمت فروش" type="number" fullWidth />}
              />
            </Grid>
            <Grid >
              <Controller name="wholesalePrice" control={control}
                render={({ field }) => <TextField {...field} label="قیمت فروش عمده" type="number" fullWidth />}
              />
            </Grid>

            <Grid  >
              <Controller name="allowDuplicate" control={control}
                render={({ field }) => <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="امکان تکرار پذیری کالا در فاکتور" />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>انصراف</Button>
          <Button type="submit" variant="contained">ذخیره</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};