import { useState, useEffect, useMemo } from "react";
import { Button, Box, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { type RootState, type AppDispatch } from "../../store/store";
import {
  fetchUsers,
  addNewUser,
  updateUser,
  removeUser,
} from "../../store/slices/usersSlice";
import { type User } from "../../types/user";
import {
  createUserSchema,
  editUserSchema,
  type UserFormData,
} from "../../schema/userSchema";
import FormDialog from "../../components/FormDialog";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import EnhancedMuiTable, {
  type HeadCell,
  type Action,
} from "../../components/Table";
import Form, { type FormField } from "../../components/Form";
import { useToast } from "../../hooks/useToast";

const UserManagementPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const users = useSelector((state: RootState) => state.users.users);
  const userStatus = useSelector((state: RootState) => state.users.status);

  const canManageUsers = currentUser?.role === "مدیر سیستم";

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const activeSchema = editingUser ? editUserSchema : createUserSchema;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: { username: "", role: "فروشنده", password: "" },
    resolver: yupResolver(activeSchema),
  });

  const userRoles: User["role"][] = [
    "مدیر سیستم",
    "فروشنده",
    "حسابدار",
    "انباردار",
  ];

  const userFormConfig = useMemo<FormField<UserFormData>[]>(
    () => [
      { name: "username", label: "نام کاربری", type: "text" },
      { name: "password", label: "رمز عبور", type: "password" },
      {
        name: "role",
        label: "نقش کاربر",
        type: "select",
        options: userRoles.map((role) => ({ id: role, label: role })),
      },
    ],
    []
  );

  useEffect(() => {
    if (userStatus === "idle") {
      dispatch(fetchUsers());
    }
  }, [userStatus, dispatch]);

  useEffect(() => {
    if (isFormOpen) {
      if (editingUser) {
        reset({ ...editingUser, password: editingUser.password });
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
      dispatch(removeUser(userToDelete.id))
        .unwrap()
        .then(() => showToast("کاربر با موفقیت حذف شد", "success"))
        .catch((error) => showToast(error.message, "error"));
      setUserToDelete(null);
    }
  };

  const handleDeleteSelected = (selectedIds: readonly (string | number)[]) => {
    selectedIds.forEach((id) => {
      if (id !== 1) {
        dispatch(removeUser(id as number));
      }
    });
    showToast("عملیات حذف برای کاربران انتخاب شده انجام شد", "success");
  };

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    const submissionData = { ...data };
    if (!submissionData.password) {
      delete submissionData.password;
    }

    if (editingUser) {
      dispatch(updateUser({ ...editingUser, ...submissionData }))
        .unwrap()
        .then(() => showToast("کاربر با موفقیت ویرایش شد", "success"))
        .catch((error) =>
          showToast(`خطا در ویرایش: ${error.message}`, "error")
        );
    } else {
      dispatch(addNewUser(submissionData as Omit<User, "id">))
        .unwrap()
        .then(() => showToast("کاربر با موفقیت اضافه شد", "success"))
        .catch((error) =>
          showToast(`خطا در افزودن: ${error.message}`, "error")
        );
    }
    handleCloseForm();
  };

  const headCells: readonly HeadCell<User>[] = [
    { id: "username", numeric: false, label: "نام کاربری", align: "center" },
    { id: "role", numeric: false, label: "سطح دسترسی", align: "center" },
  ];

  const actions: readonly Action<User>[] = canManageUsers
    ? [
        {
          icon: <EditIcon />,
          tooltip: "ویرایش",
          onClick: (user) => handleOpenForm(user),
        },
        {
          icon: <DeleteIcon color="error" />,
          tooltip: "حذف",
          onClick: (user) => handleDeleteConfirm(user),
        },
      ]
    : [];

  if (userStatus === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {canManageUsers && (
          <Button variant="contained" onClick={() => handleOpenForm()}>
            افزودن کاربر جدید
          </Button>
        )}
      </Box>

      <EnhancedMuiTable
        title="مدیریت کاربران"
        rows={users}
        headCells={headCells}
        onDelete={canManageUsers ? handleDeleteSelected : undefined}
        actions={actions}
      />

      <FormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        title={editingUser ? "ویرایش کاربر" : "افزودن کاربر جدید"}
        onSave={handleSubmit(onSubmit)}
      >
        <Form config={userFormConfig} control={control} errors={errors} />
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
