import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store/store';
import { Box, Paper, RadioGroup, FormControlLabel, Radio, Typography, TextField } from '@mui/material';
import { useForm, type SubmitHandler } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import {
  type Customer,
  addCustomer,
  editCustomer,
  deleteCustomer,
  type MoeinCategory,
} from '../../store/slices/customersSlice';
import {
  type Supplier,
  addSupplier,
  editSupplier,
  deleteSupplier,
} from '../../store/slices/suppliersSlice';
import SearchAndSortPanel from '../../components/SearchAndSortPanel';
import PageHeader from '../../components/PageHeader';
import EnhancedMuiTable, { type HeadCell, type Action } from '../../components/Table';
import FormDialog from '../../components/FormDialog';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Form, { type FormField } from '../../components/Form';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

type Person = Customer | Supplier;
type PersonFormData = Omit<Person, 'id'>;

const moeinCategories: MoeinCategory[] = [
  "بدهکاران",
  "طلبکاران",
  "همکاران",
  " متفرقه",
  "ضایعات",
];

const CustomerManagementPage = () => {
  const dispatch = useDispatch();
  const [personType, setPersonType] = useState<'customer' | 'supplier'>('customer');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'city'>('name');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const { customers, suppliers } = useSelector((state: RootState) => state);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<PersonFormData>();

  const data = useMemo(() => {
    const sourceData = personType === 'customer' ? customers : suppliers;
    const filtered = sourceData.filter((p) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      if (sortBy === 'name') return p.name.toLowerCase().includes(term);
      if (sortBy === 'city') return (p.city || '').toLowerCase().includes(term);
      return true;
    });
    return [...filtered].sort((a, b) => (a[sortBy] || '').localeCompare(b[sortBy] || '', 'fa'));
  }, [personType, customers, suppliers, searchTerm, sortBy]);

  const getNextId = () => {
    const sourceData = personType === 'customer' ? customers : suppliers;
    const maxId = sourceData.length > 0 ? Math.max(...sourceData.map((p) => p.id)) : 99;
    return maxId < 100 ? 100 : maxId + 1;
  };

  const handleOpenForm = (person: Person | null = null) => {
    setEditingPerson(person);
    reset(person || { name: '', phone: '', city: '', address: '', moein: 'بدهکاران' });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingPerson(null);
  };

  const onSubmit: SubmitHandler<PersonFormData> = (formData) => {
    if (formData.phone) {
      const allPersons = [...customers, ...suppliers];
      const existing = allPersons.find(p => p.phone === formData.phone && p.id !== editingPerson?.id);
      if (existing) {
        toast.error(`این شماره همراه قبلا برای کاربر با کد ${existing.id} ثبت شده است.`);
        return;
      }
    }
    
    if (editingPerson) {
      const payload = { ...formData, id: editingPerson.id };
      if (personType === 'customer') {
        dispatch(editCustomer(payload));
      } else {
        dispatch(editSupplier(payload));
      }
      toast.success('ویرایش با موفقیت انجام شد');
    } else {
      const payload = formData;
      if (personType === 'customer') {
        dispatch(addCustomer(payload));
      } else {
        dispatch(addSupplier(payload));
      }
      toast.success('شخص جدید با موفقیت اضافه شد');
    }
    
    handleCloseForm();
  };

  const handleOpenDeleteModal = (id: number) => setDeleteModal({ open: true, id });
  const handleCloseDeleteModal = () => setDeleteModal({ open: false, id: null });

  const handleConfirmDelete = () => {
    if (deleteModal.id === null) return;
    dispatch(personType === 'customer' ? deleteCustomer(deleteModal.id) : deleteSupplier(deleteModal.id));
    toast.success('شخص با موفقیت حذف شد.');
    handleCloseDeleteModal();
  };
  
  const headCells: readonly HeadCell<Person>[] = [
    { id: 'id', numeric: true, label: 'کد' },
    { id: 'name', numeric: false, label: 'نام' },
    { id: 'phone', numeric: false, label: 'تلفن', cell: (row) => row.phone || '-' },
    { id: 'city', numeric: false, label: 'شهر', cell: (row) => row.city || '-' },
  ];

  const actions: readonly Action<Person>[] = [
    { icon: <EditIcon fontSize="small" />, tooltip: 'ویرایش', onClick: (row) => handleOpenForm(row) },
    { icon: <DeleteIcon color="error" fontSize="small" />, tooltip: 'حذف', onClick: (row) => handleOpenDeleteModal(row.id) },
  ];

  const customerSortOptions = [{ value: 'name', label: 'نام' }, { value: 'city', label: 'شهر' }];

  const formFields: FormField<PersonFormData>[] = [
    { name: 'name', label: 'نام کاربر', type: 'text', rules: { required: 'نام اجباری است' } },
    { name: 'phone', label: 'شماره همراه', type: 'text' },
    { name: 'city', label: 'نام شهر', type: 'text' },
    { name: 'address', label: 'آدرس', type: 'textarea', multiline: true, rows: 3 },
  ];
  
  const moeinField: FormField<PersonFormData>[] = [
      { name: 'moein', label: 'معین', type: 'select', options: moeinCategories.map(cat => ({ id: cat, label: cat }))}
  ]

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, direction: 'rtl' }}>
      <Toaster position="top-center" reverseOrder={false} />
      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <PageHeader
          personType={personType}
          onPersonTypeChange={setPersonType}
          onAddNew={() => handleOpenForm()}
        />
        <SearchAndSortPanel
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          sortBy={sortBy}
          onSortByChange={(value) => setSortBy(value as 'name' | 'city')}
          sortOptions={customerSortOptions}
        />
        <EnhancedMuiTable
          rows={data}
          headCells={headCells}
          title=""
          actions={actions}
          onDelete={(ids) => ids.forEach(id => handleOpenDeleteModal(Number(id)))}
        />
      </Paper>

      <FormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSubmit(onSubmit)}
        title={editingPerson ? 'ویرایش شخص' : 'افزودن شخص جدید'}
      >
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, width: '100%', maxWidth: '400px', mx: 'auto' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography component="label" sx={{ fontWeight: 'medium' }}>نوع شخص:</Typography>
            <RadioGroup row value={personType} onChange={(e) => setPersonType(e.target.value as 'customer' | 'supplier')}>
              <FormControlLabel value="customer" control={<Radio size="small" />} label="مشتری فروش" />
              <FormControlLabel value="supplier" control={<Radio size="small" />} label="مشتری خرید" />
            </RadioGroup>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <TextField label="کد" value={editingPerson ? editingPerson.id : getNextId()} disabled size="small" sx={{ width: 100 }} />
            <Form config={moeinField} control={control} errors={errors} />
          </Box>
          
          <Form config={formFields} control={control} errors={errors} />
        </Box>
      </FormDialog>

      <ConfirmationDialog
        open={deleteModal.open}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="تایید حذف"
        message="آیا از حذف این شخص اطمینان دارید؟ این عمل قابل بازگشت نیست."
      />
    </Box>
  );
};

export default CustomerManagementPage;