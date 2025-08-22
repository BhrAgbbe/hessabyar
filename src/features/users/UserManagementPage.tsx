// 


import { useState, useEffect } from "react";
import { Button, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "../../store/store";
import {
  addUser,
  editUser,
  deleteUser,
  type User,
} from "../../store/slices/usersSlice";

import FormDialog from "../../components/FormDialog";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import EnhancedMuiTable, { type HeadCell, type Action } from '../../components/Table';
import UserForm from "../../components/UserForm"; 

type UserFormData = Omit<User, "id">;

const UserManagementPage = () => {
  const users = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    defaultValues: { username: "", role: "فروشنده", password: "" },
  });

  useEffect(() => {
    if (isFormOpen) {
      if (editingUser) {
        reset(editingUser);
      } else {
        reset({ username: "", role: "فروشنده", password: "" });
      }
    }
  }, [editingUser, isFormOpen, reset]);

  const handleOpenForm = (user: User | null = null) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingUser(null);
  };

  const handleDeleteConfirm = (user: User) => setUserToDelete(user);

  const handleDelete = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete.id));
      setUserToDelete(null);
    }
  };

  const handleDeleteSelected = (selectedIds: readonly (string | number)[]) => {
     selectedIds.forEach(id => dispatch(deleteUser(id as number)));
  };

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    if (editingUser) {
      dispatch(editUser({ ...data, id: editingUser.id }));
    } else {
      dispatch(addUser(data));
    }
    handleCloseForm();
  };

  const headCells: readonly HeadCell<User>[] = [
    { id: 'username', numeric: false, label: 'نام کاربری' },
    { id: 'role', numeric: false, label: 'سطح دسترسی' },
  ];

  const actions: readonly Action<User>[] = [
    {
      icon: <EditIcon />,
      tooltip: 'ویرایش',
      onClick: (user) => handleOpenForm(user),
    },
    {
      icon: <DeleteIcon color="error" />,
      tooltip: 'حذف',
      onClick: (user) => handleDeleteConfirm(user),
    }
  ];

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpenForm()}>
          افزودن کاربر جدید
        </Button>
      </Box>

      <EnhancedMuiTable
        title="مدیریت کاربران"
        rows={users}
        headCells={headCells}
        onDelete={handleDeleteSelected}
        actions={actions}
      />

      <FormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        title={editingUser ? "ویرایش کاربر" : "افزودن کاربر جدید"}
        onSave={handleSubmit(onSubmit)}
      >
        <UserForm control={control} errors={errors} />
      </FormDialog>

      <ConfirmationDialog
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="تایید حذف کاربر"
        message={`آیا از حذف کاربر "${userToDelete?.username}" اطمینان دارید؟`}
      />
    </>
  );
};

export default UserManagementPage;