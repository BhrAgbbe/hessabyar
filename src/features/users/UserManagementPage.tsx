import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "../../store/store";
import {
  addUser,
  editUser,
  deleteUser,
  type User,
} from "../../store/slices/usersSlice";

type UserFormData = Omit<User, "id">;

const userRoles: User["role"][] = [
  "مدیر سیستم",
  "فروشنده",
  "حسابدار",
  "انباردار",
];

const UserManagementPage = () => {
  const users = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch();

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>();

  const rtlStyles = {
    '& .MuiInputLabel-root': {
        transformOrigin: 'top right',
        right: '1.75rem',
        left: 'auto'
    },
    '& .MuiOutlinedInput-root': {
        '& legend': {
            textAlign: 'right',
        },
        '& input': {
            textAlign: 'right',
        },
    },    '& .MuiSelect-select': {
        textAlign: 'right',
    },
  };


  useEffect(() => {
    if (editingUser) {
      reset(editingUser);
    } else {
      reset({ username: "", role: "فروشنده", password: "" });
    }
  }, [editingUser, reset]);

  const handleOpenForm = (user: User | null = null) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingUser(null);
  };

  const handleDeleteConfirm = (user: User) => {
    setUserToDelete(user);
  };

  const handleDelete = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete.id));
      setUserToDelete(null);
    }
  };

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    if (editingUser) {
      dispatch(editUser({ ...data, id: editingUser.id }));
    } else {
      dispatch(addUser(data));
    }
    handleCloseForm();
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          onClick={() => handleOpenForm()}
        >
          افزودن کاربر جدید
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">نام کاربری</TableCell>
              <TableCell align="center">سطح دسترسی</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell align="center">{user.username}</TableCell>
                <TableCell align="center">{user.role}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenForm(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteConfirm(user)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isFormOpen} onClose={handleCloseForm}>
        <DialogTitle>
          {editingUser ? "ویرایش کاربر" : "افزودن کاربر جدید"}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ direction: 'rtl' }}>
          <DialogContent sx={{ pt: 1 }}>
            <Controller
              name="username"
              control={control}
              rules={{ required: "نام کاربری اجباری است" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  margin="dense"
                  label="نام کاربری"
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  sx={rtlStyles}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              rules={{
                required: "رمز عبور اجباری است",
                minLength: {
                  value: 4,
                  message: "رمز عبور باید حداقل ۴ حرف باشد",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="password"
                  margin="dense"
                  label="رمز عبور"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={rtlStyles}
                />
              )}
            />
            <FormControl fullWidth margin="dense" error={!!errors.role} sx={rtlStyles}>
              <InputLabel>نقش کاربر</InputLabel>
              <Controller
                name="role"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select {...field} label="نقش کاربر">
                    {userRoles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>انصراف</Button>
            <Button type="submit" variant="contained">
              ذخیره
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={!!userToDelete} onClose={() => setUserToDelete(null)}>
        <DialogTitle>تایید حذف کاربر</DialogTitle>
        <DialogContent>
          <Typography>
            آیا از حذف کاربر "{userToDelete?.username}" اطمینان دارید؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserToDelete(null)}>انصراف</Button>
          <Button onClick={handleDelete} color="error">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserManagementPage;