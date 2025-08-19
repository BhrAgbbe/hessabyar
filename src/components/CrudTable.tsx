import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Box,
  TablePagination // ۱. کامپوننت صفحه‌بندی ایمپورت شد
} from '@mui/material';
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
  
  // ۲. State برای مدیریت صفحه‌بندی
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  // ۳. توابع برای مدیریت تغییر صفحه و تعداد ردیف‌ها
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // بازگشت به صفحه اول بعد از تغییر تعداد ردیف‌ها
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpen()}>افزودن {title}</Button>
      </Box>
      <TableContainer>
        <Table 
          // ۴. حذف خط اضافی از آخرین ردیف جدول
          sx={{
            '& .MuiTableRow-root:last-child td, & .MuiTableRow-root:last-child th': {
              border: 0,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>ردیف</TableCell>
              <TableCell>نام</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* ۵. برش دادن آرایه آیتم‌ها برای نمایش صفحه فعلی */}
            {items
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
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

      {/* ۶. افزودن کامپوننت صفحه‌بندی به جدول */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={items.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="تعداد در صفحه:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} از ${count}`
        }
      />

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