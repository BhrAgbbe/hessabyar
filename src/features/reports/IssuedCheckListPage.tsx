import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EnhancedMuiTable, {
  type HeadCell,
  type Action,
} from "../../components/Table";
import FormDialog from "../../components/FormDialog";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import SearchAndSortPanel from "../../components/SearchAndSortPanel";
import ShamsiDatePicker from "../../components/DatePicker";
import { PrintableReportLayout } from "../../components/layout/PrintableReportLayout";
import { type RootState } from "../../store/store";
import {
  type CheckStatus,
  addCheck,
  editCheck,
  deleteCheck,
} from "../../store/slices/checksSlice";
import { type Check } from "../../types/check";
import { toPersianDigits } from "../../utils/utils";
import { useToast } from "../../hooks/useToast";

const getStatusChipColor = (status: CheckStatus) => {
  if (status === "پاس شده") return "success";
  if (status === "برگشتی") return "error";
  return "warning";
};

const IssuedCheckListPage = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const allChecks = useSelector((state: RootState) =>
    state.checks.filter((c) => c.type === "issued")
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<Check | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    ids: readonly (string | number)[];
  }>({ open: false, ids: [] });

  const filteredAndSortedChecks = useMemo(() => {
    let result = [...allChecks];

    if (searchTerm) {
      result = result.filter((c) =>
        c.payee.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "amountHigh":
          return b.amount - a.amount;
        case "amountLow":
          return a.amount - b.amount;
        case "payee":
          return a.payee.localeCompare(b.payee, "fa");
        case "dueDate":
        default:
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

    return result;
  }, [allChecks, searchTerm, sortBy]);

  const sortOptions = [
    { value: "dueDate", label: "تاریخ سررسید" },
    { value: "payee", label: "در وجه" },
    { value: "amountHigh", label: "بیشترین مبلغ" },
    { value: "amountLow", label: "کمترین مبلغ" },
  ];

  const headCells: readonly HeadCell<Check>[] = [
    {
      id: "serial",
      numeric: false,
      label: "سریال",
      align: "center",
      width: "20%",
    },
    {
      id: "payee",
      numeric: false,
      label: "در وجه",
      align: "center",
      width: "20%",
    },
    {
      id: "amount",
      numeric: true,
      label: "مبلغ (تومان)",
      align: "center",
      width: "20%",
      cell: (row) => toPersianDigits(row.amount),
    },
    {
      id: "dueDate",
      numeric: false,
      label: "تاریخ سررسید",
      align: "center",
      width: "20%",
      cell: (row) => new Date(row.dueDate).toLocaleDateString("fa-IR"),
    },
    {
      id: "status",
      numeric: false,
      label: "وضعیت",
      align: "center",
      width: "20%",
      cell: (row) => (
        <Chip
          label={row.status}
          color={getStatusChipColor(row.status)}
          size="small"
        />
      ),
    },
  ];

  const actions: readonly Action<Check>[] = [
    {
      icon: <EditIcon fontSize="small" />,
      tooltip: "ویرایش",
      onClick: (row) => handleOpenDialog(row),
    },
    {
      icon: <DeleteIcon color="error" fontSize="small" />,
      tooltip: "حذف",
      onClick: (row) => handleDeleteRequest([row.id]),
    },
  ];

  const handleOpenDialog = (check: Check | null = null) => {
    setEditingCheck(check);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCheck(null);
  };

  const handleSave = (formData: Omit<Check, "id" | "type">) => {
    if (editingCheck) {
      dispatch(editCheck({ ...formData, id: editingCheck.id, type: "issued" }));
      showToast("چک با موفقیت ویرایش شد.", "success");
    } else {
      dispatch(addCheck({ ...formData, type: "issued" }));
      showToast("چک جدید با موفقیت اضافه شد.", "success");
    }
    handleCloseDialog();
  };

  const confirmDelete = () => {
    deleteConfirm.ids.forEach((id) => dispatch(deleteCheck(String(id))));
    showToast(
      `${toPersianDigits(deleteConfirm.ids.length)} چک با موفقیت حذف شد.`,
      "success"
    );
    setDeleteConfirm({ open: false, ids: [] });
  };
  const handleDeleteRequest = (ids: readonly (string | number)[]) => {
    setDeleteConfirm({ open: true, ids });
  };

  return (
    <PrintableReportLayout
      primaryAction={
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          افزودن چک جدید
        </Button>
      }
    >
      <SearchAndSortPanel
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOptions={sortOptions}
      />

      <EnhancedMuiTable
        rows={filteredAndSortedChecks}
        headCells={headCells}
        title="لیست چک‌های صادر شده"
        actions={actions}
        onDelete={handleDeleteRequest}
      />

      {dialogOpen && (
        <CheckForm
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSave}
          check={editingCheck}
        />
      )}

      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, ids: [] })}
        onConfirm={confirmDelete}
        title="تایید حذف چک"
        message={`آیا از حذف ${toPersianDigits(
          deleteConfirm.ids.length
        )} مورد اطمینان دارید؟`}
      />
    </PrintableReportLayout>
  );
};

interface CheckFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Check, "id" | "type">) => void;
  check: Check | null;
}

const CheckForm: React.FC<CheckFormProps> = ({
  open,
  onClose,
  onSave,
  check,
}) => {
  const [formData, setFormData] = useState({
    serial: check?.serial || "",
    payee: check?.payee || "",
    amount: check?.amount || 0,
    dueDate: check ? new Date(check.dueDate) : new Date(),
    status: check?.status || "در جریان",
  });

  const handleChange = (
    field: string,
    value: string | number | Date | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveClick = () => {
    if (!formData.dueDate) {
      console.error("تاریخ سررسید نمی‌تواند خالی باشد.");
      return;
    }
    onSave({
      ...formData,
      amount: Number(formData.amount),
      dueDate: formData.dueDate.toISOString(),
    });
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSave={handleSaveClick}
      title={check ? "ویرایش چک صادر شده" : "افزودن چک صادر شده"}
    >
      <TextField
        label="سریال"
        value={formData.serial}
        onChange={(e) => handleChange("serial", e.target.value)}
        fullWidth
        margin="dense"
      />
      <TextField
        label="در وجه"
        value={formData.payee}
        onChange={(e) => handleChange("payee", e.target.value)}
        fullWidth
        margin="dense"
      />
      <TextField
        label="مبلغ"
        value={formData.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        type="number"
        fullWidth
        margin="dense"
      />
      <Box mt={2} mb={1}>
        <ShamsiDatePicker
          label="تاریخ سررسید"
          value={formData.dueDate}
          onChange={(date) => handleChange("dueDate", date)}
        />
      </Box>
      <FormControl fullWidth margin="dense">
        <InputLabel>وضعیت</InputLabel>
        <Select
          value={formData.status}
          label="وضعیت"
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <MenuItem value="در جریان">در جریان</MenuItem>
          <MenuItem value="پاس شده">پاس شده</MenuItem>
          <MenuItem value="برگشتی">برگشتی</MenuItem>
        </Select>
      </FormControl>
    </FormDialog>
  );
};

export default IssuedCheckListPage;
