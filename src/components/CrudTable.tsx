import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import type { BaseEntity } from '../store/slices/groupsSlice';
import type { PayloadAction } from '@reduxjs/toolkit'; 

interface CrudTableProps {
  title: string;
  items: BaseEntity[];
  onAdd: (item: Omit<BaseEntity, 'id'>) => PayloadAction<Omit<BaseEntity, 'id'>>;
  onEdit: (item: BaseEntity) => PayloadAction<BaseEntity>;
  onDelete: (id: number) => PayloadAction<number>;
}

export const CrudTable: React.FC<CrudTableProps> = ({ title, items, onAdd, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BaseEntity | null>(null);
  const { control, handleSubmit, reset } = useForm<{ name: string }>();

  const handleOpen = (item: BaseEntity | null = null) => {
    setEditingItem(item);
    reset({ name: item ? item.name : '' });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const onSubmit = (data: { name: string }) => {
    if (editingItem) {
      dispatch(onEdit({ id: editingItem.id, ...data }));
    } else {
      dispatch(onAdd(data));
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    if (window.confirm(`آیا از حذف این مورد اطمینان دارید؟`)) {
      dispatch(onDelete(id));
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpen()}>افزودن {title}</Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ردیف</TableCell>
              <TableCell>نام</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpen(item)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(item.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingItem ? `ویرایش ${title}` : `افزودن ${title}`}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'نام اجباری است' }}
              render={({ field }) => <TextField {...field} autoFocus fullWidth label="نام" />}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>انصراف</Button>
            <Button type="submit" variant="contained">ذخیره</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Paper>
  );
};