import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Menu,
  RadioGroup,
  Radio,
  DialogContentText,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { type RootState } from "../../store/store";
import {
  type Customer,
  addCustomer,
  editCustomer,
  deleteCustomer,
  type MoeinCategory,
} from "../../store/slices/customersSlice";
import {
  type Supplier,
  addSupplier,
  editSupplier,
  deleteSupplier,
} from "../../store/slices/suppliersSlice";

type Person = Customer | Supplier;
type PersonFormData = Omit<Person, "id">;

const moeinCategories: MoeinCategory[] = [
  "بدهکاران",
  "طلبکاران",
  "همکاران",
  " متفرقه",
  "ضایعات",
];

const CustomerManagementPage = () => {
  const dispatch = useDispatch();
  const [personType, setPersonType] = useState<"customer" | "supplier">(
    "customer"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "city">("name");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [personIdToDelete, setPersonIdToDelete] = useState<number | null>(null);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const { customers, suppliers } = useSelector((state: RootState) => state);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonFormData>();

  const rtlStyles = {
    "& .MuiInputLabel-root": {
      transformOrigin: "top right",
      right: "1.75rem",
      left: "auto",
    },
    "& .MuiOutlinedInput-root": {
      "& legend": {
        textAlign: "right",
      },
      "& input": {
        textAlign: "right",
      },
    },
    "& .MuiSelect-select": {
      textAlign: "right",
    },
  };

  const handleTitleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePersonTypeChange = (type: "customer" | "supplier") => {
    setPersonType(type);
    handleMenuClose();
  };

  const data = useMemo(() => {
    const sourceData = personType === "customer" ? customers : suppliers;

    const filtered = sourceData.filter((p) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      if (sortBy === "name") {
        return p.name.toLowerCase().includes(term);
      }
      if (sortBy === "city") {
        return (p.city || "").toLowerCase().includes(term);
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const valueA = a[sortBy] || "";
      const valueB = b[sortBy] || "";
      return valueA.localeCompare(valueB, "fa");
    });
  }, [personType, customers, suppliers, searchTerm, sortBy]);

  const getNextId = () => {
    const sourceData = personType === "customer" ? customers : suppliers;
    const maxId =
      sourceData.length > 0 ? Math.max(...sourceData.map((p) => p.id)) : 99;
    return maxId < 100 ? 100 : maxId + 1;
  };

  const handleOpenForm = (person: Person | null = null) => {
    setEditingPerson(person);
    reset(
      person || {
        name: "",
        phone: "",
        city: "",
        address: "",
        moein: "بدهکاران",
      }
    );
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingPerson(null);
  };

  const onSubmit: SubmitHandler<PersonFormData> = (formData) => {
    if (formData.phone) {
      const allPersons = [...customers, ...suppliers];
      const existingPersonWithPhone = allPersons.find(
        (p) => p.phone === formData.phone && p.id !== editingPerson?.id
      );

      if (existingPersonWithPhone) {
        toast.error(
          `این شماره همراه قبلا برای کاربر با کد ${existingPersonWithPhone.id} ثبت شده است.`
        );
        return;
      }
    }

    if (personType === "customer") {
      if (editingPerson) {
        dispatch(
          editCustomer({ ...formData, id: editingPerson.id } as Customer)
        );
      } else {
        dispatch(addCustomer(formData as Omit<Customer, "id">));
      }
    } else {
      if (editingPerson) {
        dispatch(
          editSupplier({ ...formData, id: editingPerson.id } as Supplier)
        );
      } else {
        dispatch(addSupplier(formData as Omit<Supplier, "id">));
      }
    }
    toast.success(
      editingPerson
        ? "ویرایش با موفقیت انجام شد"
        : "شخص جدید با موفقیت اضافه شد"
    );
    handleCloseForm();
  };

  const handleOpenDeleteModal = (id: number) => {
    setPersonIdToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setPersonIdToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (personIdToDelete === null) return;

    if (personType === "customer") {
      dispatch(deleteCustomer(personIdToDelete));
    } else {
      dispatch(deleteSupplier(personIdToDelete));
    }
    toast.success("شخص با موفقیت حذف شد.");
    handleCloseDeleteModal();
  };

  const headerCellStyle = {
    textAlign: "center",
    color: "text.secondary",
    fontWeight: 600,
    borderBottom: "none",
    fontSize: { xs: "0.5rem", md: "0.875rem" }, 
    p: { xs: 1, md: 2 },
  };

  const bodyCellStyle = {
    textAlign: "center",
    borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
    fontSize: { xs: "0.5rem", md: "0.875rem" }, 
    p: { xs: 1, md: 2 },
    wordBreak: "break-word",
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, direction: "rtl" }}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
        }}
      />
      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            gap: 2,
          }}
        >
          <div>
            <Button
              id="person-type-button"
              aria-controls={menuOpen ? "person-type-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? "true" : undefined}
              onClick={handleTitleClick}
              endIcon={<ArrowDropDownIcon />}
              sx={{ color: "text.primary", textTransform: "none" }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                لیست{" "}
                {personType === "customer" ? "مشتریان فروش" : "مشتریان خرید"}
              </Typography>
            </Button>
            <Menu
              id="person-type-menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              MenuListProps={{ "aria-labelledby": "person-type-button" }}
            >
              <MenuItem onClick={() => handlePersonTypeChange("customer")}>
                مشتریان فروش
              </MenuItem>
              <MenuItem onClick={() => handlePersonTypeChange("supplier")}>
                مشتریان خرید
              </MenuItem>
            </Menu>
          </div>

          <Button
            variant="contained"
            onClick={() => handleOpenForm()}
            sx={{
              width: { xs: "100%", sm: "auto" },
            }}
          >
            افزودن شخص جدید
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "medium", color: "text.secondary" }}
          >
            مرتب‌سازی:
          </Typography>
          <FormControl size="small" variant="outlined" fullWidth>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "city")}
              sx={{ width: { xs: "100%", md: "200px" } }}
            >
              <MenuItem value="name">نام</MenuItem>
              <MenuItem value="city">شهر</MenuItem>
            </Select>
          </FormControl>
          
          <Typography
            variant="body2"
            sx={{ fontWeight: "medium", color: "text.secondary" }}
          >
            جستجو:
          </Typography>

          <TextField
            placeholder={`جستجو بر اساس ${
              sortBy === "name" ? "نام" : "شهر"
            }...`}
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: "100%", md: "1500px" } }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              width: { xs: "100%", md: "auto" },
            }}
          ></Box>
        </Box>

        <TableContainer>
          <Table sx={{ tableLayout: "fixed", width: "100%" }}>
            <TableHead>
              <TableRow sx={{ "& .MuiTableCell-root": { py: 1 } }}>
                <TableCell sx={{ ...headerCellStyle, width: "15%" }}>
                  کد
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, width: "30%" }}>
                  نام
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, width: "25%" }}>
                  تلفن
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, width: "15%" }}>
                  شهر
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, width: "15%" }}>
                  عملیات
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((person) => (
                <TableRow
                  key={person.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell sx={bodyCellStyle}>{person.id}</TableCell>
                  <TableCell sx={bodyCellStyle}>{person.name}</TableCell>
                  <TableCell sx={bodyCellStyle}>
                    {person.phone || "-"}
                  </TableCell>
                  <TableCell sx={bodyCellStyle}>{person.city || "-"}</TableCell>
                  <TableCell sx={bodyCellStyle}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenForm(person)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDeleteModal(person.id)}
                    >
                      <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

  <Dialog
    open={formOpen}
    onClose={handleCloseForm}
    dir="rtl"
>
    <DialogTitle sx={{ textAlign: "center", fontSize: "1.5rem" }}>
        {editingPerson ? "ویرایش شخص" : "افزودن شخص جدید"}
    </DialogTitle>
    <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2, 
                    pt: 1,
                    width: "100%",
                    maxWidth: "400px" 
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography component="label" sx={{ fontWeight: "medium" }}>
                        نوع شخص:
                    </Typography>
                    <RadioGroup
                        row
                        value={personType}
                        onChange={(e) =>
                            setPersonType(e.target.value as "customer" | "supplier")
                        }
                    >
                        <FormControlLabel
                            value="customer"
                            control={<Radio size="small" />}
                            label="مشتری فروش"
                        />
                        <FormControlLabel
                            value="supplier"
                            control={<Radio size="small" />}
                            label="مشتری خرید"
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ display: "flex", gap: 2, width: '100%' }}>
                    <TextField
                        label="کد"
                        value={editingPerson ? editingPerson.id : getNextId()}
                        disabled
                        size="small"
                        sx={{ ...rtlStyles, width: 100 }}
                    />
                    <Controller
                        name="moein"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth size="small" sx={rtlStyles}>
                                <InputLabel>معین</InputLabel>
                                <Select {...field} label="معین" defaultValue="بدهکاران">
                                    {moeinCategories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    />
                </Box>
                
                <Controller
                    name="name"
                    control={control}
                    rules={{ required: "نام اجباری است" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="نام کاربر"
                            fullWidth
                            size="small"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            sx={rtlStyles}
                        />
                    )}
                />

                <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="شماره همراه"
                            fullWidth
                            size="small"
                            sx={rtlStyles}
                        />
                    )}
                />

                <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="نام شهر"
                            fullWidth
                            size="small"
                            sx={rtlStyles}
                        />
                    )}
                />

                <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="آدرس"
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            sx={rtlStyles}
                        />
                    )}
                />
            </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", p: 2, px: 3, gap: 2 }}>
            <Button onClick={handleCloseForm} color="secondary" variant="outlined" sx={{width: '120px'}}>
                انصراف
            </Button>
            <Button type="submit" variant="contained" sx={{width: '120px'}}>
                ذخیره
            </Button>
        </DialogActions>
    </form>
</Dialog>
      <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal} dir="rtl">
        <DialogTitle>تایید حذف</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا از حذف این شخص اطمینان دارید؟ این عمل قابل بازگشت نیست.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="secondary">
            انصراف
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerManagementPage;