import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, TextField, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { type PayloadAction, type ActionCreatorWithOptionalPayload } from '@reduxjs/toolkit';

import EnhancedMuiTable, { type HeadCell, type Action } from './Table';
import FormDialog from './FormDialog';
import ConfirmationDialog from './ConfirmationDialog';

interface CrudItem {
  id: number;
  name: string;
}

interface GenericCrudPanelProps {
  title: string;
  items: readonly CrudItem[];
  add_action: (payload: { name: string }) => PayloadAction<{ name: string }>;
  edit_action: (payload: CrudItem) => PayloadAction<CrudItem>;
  delete_action: ActionCreatorWithOptionalPayload<number, string>;
  showToast: (message: string, severity: 'success' | 'error') => void;
}

const GenericCrudPanel: React.FC<GenericCrudPanelProps> = ({ 
  title, 
  items, 
  add_action, 
  edit_action, 
  delete_action,
  showToast
}) => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrudItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; ids: readonly (string | number)[] }>({ open: false, ids: [] });

  const handleOpenDialog = (item: CrudItem | null = null) => {
    setEditingItem(item);
    setItemName(item ? item.name : '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setItemName('');
  };

  const handleSave = () => {
    if (!itemName.trim()) {
      showToast('نام نمی‌تواند خالی باشد.', 'error');
      return;
    }

    if (editingItem) {
      dispatch(edit_action({ ...editingItem, name: itemName }));
      showToast(`${title} با موفقیت ویرایش شد.`, 'success');
    } else {
      dispatch(add_action({ name: itemName }));
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
        onSave={handleSave}
        title={editingItem ? `ویرایش ${title}` : `افزودن ${title} جدید`}
      >
        <TextField
          autoFocus
          margin="dense"
          label={`نام ${title}`}
          fullWidth
          variant="outlined"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
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