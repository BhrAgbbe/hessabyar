import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store/store';
import { Box, Paper, TextField } from '@mui/material';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../hooks/useToast';
import {
  addCustomer,
  editCustomer,
  deleteCustomer,
} from '../../store/slices/customersSlice';
import {
  addSupplier,
  editSupplier,
  deleteSupplier,
} from '../../store/slices/suppliersSlice';
import type {  Customer, MoeinCategory , Supplier  } from '../../types/person';

import { createPersonSchema, type PersonFormData } from '../../schema/personSchema'; 
import SearchAndSortPanel from '../../components/SearchAndSortPanel';
import PageHeader from '../../components/PageHeader';
import EnhancedMuiTable, { type HeadCell, type Action } from '../../components/Table';
import FormDialog from '../../components/FormDialog';
import Form, { type FormField } from '../../components/Form';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchableSelect, { type SelectOption } from '../../components/SearchableSelect';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import AddPerson from '../../components/Addperson';

type Person = Customer | Supplier;

const moeinCategories: MoeinCategory[] = ["بدهکاران", "طلبکاران", "همکاران", " متفرقه", "ضایعات"];
const moeinOptions = moeinCategories.map(cat => ({ id: cat, label: cat }));
const customerSortOptions = [{ value: 'name', label: 'نام' }, { value: 'city', label: 'شهر' }];

const formFields: FormField<PersonFormData>[] = [
  { name: 'name', label: 'نام کاربر', type: 'text' },
  { name: 'phone', label: 'شماره همراه', type: 'text' },
  { name: 'city', label: 'نام شهر', type: 'text' },
  { name: 'address', label: 'آدرس', type: 'textarea', multiline: true, rows: 3 },
];

const CustomerManagementPage: React.FC = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [personType, setPersonType] = useState<'customer' | 'supplier'>('customer');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'city'>('name');

  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [selectedMoeinForEdit, setSelectedMoeinForEdit] = useState<SelectOption | null>(null);

  const { customers, suppliers } = useSelector((state: RootState) => state);
  const allPersons = useMemo(() => [...customers, ...suppliers], [customers, suppliers]);
  const editSchema = useMemo(() => {
    const nameMessage = personType === 'customer' ? 'نام شخص الزامی است' : 'نام تامین‌کننده الزامی است';
    const editingPersonId = editingPerson ? editingPerson.id : null;
    return createPersonSchema(nameMessage, allPersons, editingPersonId);
  }, [personType, allPersons, editingPerson]);

  const resolver = yupResolver(editSchema) as unknown as Resolver<PersonFormData, unknown>;

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<PersonFormData>({
    resolver,
    defaultValues: {
      name: '',
      phone: '',
      city: '',
      address: '',
      debt: 0,
      moein: undefined,
    } as Partial<PersonFormData>,
  });

  const data = useMemo(() => {
    const sourceData = personType === 'customer' ? customers : suppliers;
    const term = searchTerm.toLowerCase().trim();
    return sourceData
      .filter((p) => {
        if (!term) return true;
        const name = (p as Person & { name?: string }).name ?? '';
        const city = (p as Person & { city?: string }).city ?? '';
        return name.toLowerCase().includes(term) || city.toLowerCase().includes(term);
      })
      .sort((a, b) => ((a[sortBy] ?? '') as string).localeCompare((b[sortBy] ?? '') as string, 'fa'));
  }, [personType, customers, suppliers, searchTerm, sortBy]);

  const getNextId = () => {
    const sourceData = personType === 'customer' ? customers : suppliers;
    const maxId = sourceData.length > 0 ? Math.max(...sourceData.map((p) => p.id)) : 99;
    return maxId < 100 ? 100 : maxId + 1;
  };

  const handleSaveNewPerson = (personData: Partial<Omit<Person, 'id'>>) => {
    const defaultMoein = moeinOptions[0].id as MoeinCategory;

    if (personType === 'customer') {
      const custPayload: Omit<Customer, 'id'> = {
        name: personData.name!,
        phone: personData.phone,
        city: personData.city,
        address: personData.address,
        moein: (personData.moein ?? defaultMoein) as MoeinCategory,
        debt: (personData as Partial<Customer>).debt ?? 0,
      };
      dispatch(addCustomer(custPayload));
    } else {
      const supPayload: Omit<Supplier, 'id'> = {
        name: personData.name!,
        phone: personData.phone,
        city: personData.city,
        address: personData.address,
        moein: (personData.moein ?? defaultMoein) as MoeinCategory,
      };
      dispatch(addSupplier(supPayload));
    }
    showToast('شخص جدید با موفقیت اضافه شد', 'success');
  };

  const handleOpenEditForm = (person: Person) => {
    setEditingPerson(person);
    setSelectedMoeinForEdit(moeinOptions.find(opt => opt.id === person.moein) || null);
    resetEditForm(person as PersonFormData);
    setEditFormOpen(true);
  };
  
  const handleCloseEditForm = () => {
    setEditFormOpen(false);
    setEditingPerson(null);
  };
  
  const onEditSubmit: SubmitHandler<PersonFormData> = (formData) => {
    if (!editingPerson || !selectedMoeinForEdit) return;

    if (personType === 'customer') {
      const payload: Customer = {
        id: editingPerson.id,
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        moein: selectedMoeinForEdit.id as MoeinCategory,
        debt: formData.debt ?? 0,
      };
      dispatch(editCustomer(payload));
    } else {
      const payloadSupplier: Supplier = {
        id: editingPerson.id,
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        moein: selectedMoeinForEdit.id as MoeinCategory,
      } as Supplier;
      dispatch(editSupplier(payloadSupplier));
    }

    showToast('ویرایش با موفقیت انجام شد', 'success');
    handleCloseEditForm();
  };

  const handleOpenDeleteModal = (id: number) => setDeleteModal({ open: true, id });
  const handleCloseDeleteModal = () => setDeleteModal({ open: false, id: null });
  
  const handleConfirmDelete = () => {
    if (deleteModal.id === null) return;
    dispatch(personType === 'customer' ? deleteCustomer(deleteModal.id) : deleteSupplier(deleteModal.id));
    showToast('شخص با موفقیت حذف شد.', 'success');
    handleCloseDeleteModal();
  };

  const headCells: readonly HeadCell<Person>[] = [
    { id: 'id', numeric: true, label: 'کد' },
    { id: 'name', numeric: false, label: 'نام' },
    { id: 'phone', numeric: false, label: 'تلفن', cell: (row) => (row.phone ?? '-') },
    { id: 'city', numeric: false, label: 'شهر', cell: (row) => (row.city ?? '-') },
  ];

  const actions: readonly Action<Person>[] = [
    { icon: <EditIcon fontSize="small" />, tooltip: 'ویرایش', onClick: (row) => handleOpenEditForm(row) },
    { icon: <DeleteIcon color="error" fontSize="small" />, tooltip: 'حذف', onClick: (row) => handleOpenDeleteModal(row.id) },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <PageHeader
          personType={personType}
          onPersonTypeChange={setPersonType}
          actionButton={
            <AddPerson
              personType={personType}
              onPersonTypeChange={setPersonType}
              onSave={handleSaveNewPerson}
              getNextId={getNextId}
              moeinOptions={moeinOptions}
              existingPersons={allPersons} 
            />
          }
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

      {editingPerson && (
        <FormDialog
          open={editFormOpen}
          onClose={handleCloseEditForm}
          onSave={handleEditSubmit(onEditSubmit)}
          title="ویرایش شخص"
        >
          <Box component="form" onSubmit={handleEditSubmit(onEditSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, width: '100%', maxWidth: '400px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField label="کد" value={editingPerson.id} disabled size="small" sx={{ flex: 1 }}/>
              <SearchableSelect
                options={moeinOptions}
                value={selectedMoeinForEdit}
                onChange={setSelectedMoeinForEdit}
                label="معین"
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
            <Form config={formFields} control={editControl} errors={editErrors} />
          </Box>
        </FormDialog>
      )}

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