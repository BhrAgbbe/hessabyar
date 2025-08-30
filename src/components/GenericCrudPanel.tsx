import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { type PayloadAction, type ActionCreatorWithOptionalPayload } from '@reduxjs/toolkit';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import EnhancedMuiTable, { type HeadCell, type Action } from './Table';
import FormDialog from './FormDialog';
import ConfirmationDialog from './ConfirmationDialog';
import CustomTextField from './TextField';

interface CrudItem {
  id: number;
  name: string;
}

type CrudFormData = {
  name: string;
};

interface GenericCrudPanelProps {
  title: string;
  items: readonly CrudItem[];
  add_action: (payload: { name: string }) => PayloadAction<{ name: string }>;
  edit_action: (payload: CrudItem) => PayloadAction<CrudItem>;
  delete_action: ActionCreatorWithOptionalPayload<number, string>;
  showToast: (message: string, severity: 'success' | 'error') => void;
  schema: yup.ObjectSchema<{ name: string }>; 
}

const GenericCrudPanel: React.FC<GenericCrudPanelProps> = ({
  title,
  items,
  add_action,
  edit_action,
  delete_action,
  showToast,
  schema 
}) => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrudItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; ids: readonly (string | number)[] }>({ open: false, ids: [] });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CrudFormData>({
    resolver: yupResolver(schema), 
    defaultValues: { name: '' }
  });

  useEffect(() => {
    if (dialogOpen) {
      reset({ name: editingItem ? editingItem.name : '' });
    }
  }, [dialogOpen, editingItem, reset]);

  const handleOpenDialog = (item: CrudItem | null = null) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const onValidSubmit: (data: CrudFormData) => void = (data) => {
    if (editingItem) {
      dispatch(edit_action({ ...editingItem, name: data.name }));
      showToast(`${title} با موفقیت ویرایش شد.`, 'success');
    } else {
      dispatch(add_action({ name: data.name }));
      showToast(`${title} با موفقیت اضافه شد.`, 'success');
    }
    handleCloseDialog();
  };

  const handleDeleteRequest = (ids: readonly (string | number)[]) => {
    setDeleteConfirm({ open: true, ids });
  };

  const confirmDelete = () => {
    deleteConfirm.ids.forEach(id => {
      dispatch(delete_action(Number(id)));
    });

    showToast(`${title}(ها) با موفقیت حذف شدند.`, 'success');
    setDeleteConfirm({ open: false, ids: [] });
  };

  const headCells: readonly HeadCell<CrudItem>[] = [
    { id: 'id', numeric: true, label: 'کد' },
    { id: 'name', numeric: false, label: 'نام' },
  ];

  const actions: readonly Action<CrudItem>[] = [
    { icon: <EditIcon fontSize="small" />, tooltip: 'ویرایش', onClick: (row) => handleOpenDialog(row) },
    { icon: <DeleteIcon color="error" fontSize="small" />, tooltip: 'حذف', onClick: (row) => handleDeleteRequest([row.id]) },
  ];

  return (
    <Box>
      <Button variant="contained" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        افزودن {title} جدید
      </Button>
      <Paper sx={{ boxShadow: 'none' }}>
        <EnhancedMuiTable
          rows={items}
          headCells={headCells}
          title={``}
          actions={actions}
          onDelete={handleDeleteRequest}
        />
      </Paper>
      <FormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSubmit(onValidSubmit)} 
        title={editingItem ? `ویرایش ${title}` : `افزودن ${title} جدید`}
      >
        <form onSubmit={handleSubmit(onValidSubmit)}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                autoFocus
                margin="dense"
                label={`نام ${title}`}
                fullWidth
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(onValidSubmit)(); }}
              />
            )}
          />
        </form>
      </FormDialog>
      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, ids: [] })}
        onConfirm={confirmDelete}
        title={`تایید حذف ${title}`}
        message={`آیا از حذف ${deleteConfirm.ids.length} مورد اطمینان دارید؟`}
      />
    </Box>
  );
};

export default GenericCrudPanel;