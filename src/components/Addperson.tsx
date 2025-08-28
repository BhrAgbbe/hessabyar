import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Box, Button, RadioGroup, FormControlLabel, Radio, Typography, TextField } from '@mui/material';
import { type Customer, type MoeinCategory } from '../store/slices/customersSlice';
import { type Supplier } from '../store/slices/suppliersSlice';
import FormDialog from './FormDialog';
import Form, { type FormField } from './Form';
import SearchableSelect, { type SelectOption } from './SearchableSelect';

type Person = Customer | Supplier;
type PersonFormData = Omit<Person, 'id' | 'moein'>;

interface AddPersonProps {
  personType: 'customer' | 'supplier';
  onPersonTypeChange: (type: 'customer' | 'supplier') => void;
  onSave: (data: Omit<Person, 'id'>) => void;
  getNextId: () => number;
  moeinOptions: SelectOption[];
}

const formFields: FormField<PersonFormData>[] = [
  { name: 'name', label: 'نام کاربر', type: 'text', rules: { required: 'نام اجباری است' } },
  { name: 'phone', label: 'شماره همراه', type: 'text' },
  { name: 'city', label: 'نام شهر', type: 'text' },
  { name: 'address', label: 'آدرس', type: 'textarea', multiline: true, rows: 3 },
];

const AddPerson: React.FC<AddPersonProps> = ({
  personType,
  onPersonTypeChange,
  onSave,
  getNextId,
  moeinOptions,
}) => {
  const [open, setOpen] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<PersonFormData>();
  const [selectedMoein, setSelectedMoein] = useState<SelectOption | null>(moeinOptions[0] || null);

  const handleOpen = () => {
    reset({ name: '', phone: '', city: '', address: '' });
    setSelectedMoein(moeinOptions[0] || null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit: SubmitHandler<PersonFormData> = (formData) => {
    if (!selectedMoein) {
      console.error("Moein category is not selected.");
      return;
    }
    onSave({ ...formData, moein: selectedMoein.id as MoeinCategory });
    handleClose();
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        افزودن شخص جدید
      </Button>
      <FormDialog
        open={open}
        onClose={handleClose}
        onSave={handleSubmit(onSubmit)}
        title="افزودن شخص جدید"
      >
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, width: '100%', maxWidth: '400px', mx: 'auto' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography component="label" sx={{ fontWeight: 'medium' }}>نوع شخص:</Typography>
            <RadioGroup row value={personType} onChange={(e) => onPersonTypeChange(e.target.value as 'customer' | 'supplier')}>
              <FormControlLabel value="customer" control={<Radio size="small" />} label="مشتری فروش" />
              <FormControlLabel value="supplier" control={<Radio size="small" />} label="مشتری خرید" />
            </RadioGroup>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, width: '100%', flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="کد"
              value={getNextId()}
              disabled
              size="small"
              sx={{ flex: '1 1 45%' }}
            />
            <SearchableSelect
              options={moeinOptions}
              value={selectedMoein}
              onChange={(newValue) => setSelectedMoein(newValue)}
              label="معین"
              size="small"
              sx={{ flex: '1 1 45%' }}
            />
          </Box>
          
          <Form config={formFields} control={control} errors={errors} />
        </Box>
      </FormDialog>
    </>
  );
};

export default AddPerson;