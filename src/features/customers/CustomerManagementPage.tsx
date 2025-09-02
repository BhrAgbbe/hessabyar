import React, { useState, useMemo, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Box, Paper, TextField } from "@mui/material";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/useToast";
import type { Customer, MoeinCategory, Supplier } from "../../types/person";
import {
  createPersonSchema,
  type PersonFormData,
} from "../../schema/personSchema";
import { setCustomers } from "../../store/slices/customersSlice";
import { setSupplier } from "../../store/slices/suppliersSlice";
import apiClient from "../../lib/apiClient";

import SearchAndSortPanel from "../../components/SearchAndSortPanel";
import PageHeader from "../../components/PageHeader";
import EnhancedMuiTable, {
  type HeadCell,
  type Action,
} from "../../components/Table";
import FormDialog from "../../components/FormDialog";
import Form, { type FormField } from "../../components/Form";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchableSelect, {
  type SelectOption,
} from "../../components/SearchableSelect";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import AddPerson from "../../components/Addperson";

interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: {
    name: string;
    address: {
      address: string;
      city: string;
    };
  };
  isDeleted?: boolean;
}

interface ApiResponse {
  users: ApiUser[];
}

interface PersonsCache {
  customers: Customer[];
  suppliers: Supplier[];
}

type Person = Customer | Supplier;

const fetchPersons = async (): Promise<PersonsCache> => {
  const response = await apiClient.get<ApiResponse>("/users");
  const users = response.data.users;

  const customers: Customer[] = users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    phone: user.phone,
    city: user.company.address.city,
    address: user.company.address.address,
    moein: "بدهکاران",
  }));

  const suppliers: Supplier[] = users.map((user) => ({
    id: user.id,
    name: user.company.name,
    phone: user.phone,
    city: user.company.address.city,
    address: user.company.address.address,
    moein: "طلبکاران",
  }));

  return { customers, suppliers };
};

const addPerson = async ({
  data,
}: {
  data: PersonFormData;
}): Promise<ApiUser> => {
  const response = await apiClient.post("/users/add", {
    firstName: data.name.split(" ")[0],
    lastName: data.name.split(" ").slice(1).join(" ") || "N/A",
    phone: data.phone,
    city: data.city,
    address: data.address,
  });
  return response.data;
};

const editPerson = async (person: Person): Promise<ApiUser> => {
  const response = await apiClient.put(`/users/${person.id}`, {
    firstName: person.name.split(" ")[0],
    lastName: person.name.split(" ").slice(1).join(" ") || "N/A",
    phone: person.phone,
    city: person.city,
  });
  return response.data;
};

const deletePerson = async (id: number): Promise<ApiUser> => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

const moeinCategories: MoeinCategory[] = [
  "بدهکاران",
  "طلبکاران",
  "همکاران",
  " متفرقه",
  "ضایعات",
];
const moeinOptions = moeinCategories.map((cat) => ({ id: cat, label: cat }));
const customerSortOptions = [
  { value: "name", label: "نام" },
  { value: "city", label: "شهر" },
];

const formFields: FormField<PersonFormData>[] = [
  { name: "name", label: "نام کاربر", type: "text" },
  { name: "phone", label: "شماره همراه", type: "text" },
  { name: "city", label: "نام شهر", type: "text" },
  {
    name: "address",
    label: "آدرس",
    type: "textarea",
    multiline: true,
    rows: 3,
  },
];

const CustomerManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [personType, setPersonType] = useState<"customer" | "supplier">(
    "customer"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "city">("name");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const [selectedMoeinForEdit, setSelectedMoeinForEdit] =
    useState<SelectOption | null>(null);

  const { data: personsData, isLoading } = useQuery({
    queryKey: ["persons"],
    queryFn: fetchPersons,
  });

  const customers = useMemo(() => personsData?.customers ?? [], [personsData]);
  const suppliers = useMemo(() => personsData?.suppliers ?? [], [personsData]);

  useEffect(() => {
    if (customers.length) {
      dispatch(setCustomers(customers));
    }
  }, [customers, dispatch]);

  useEffect(() => {
    if (suppliers.length) {
      dispatch(setSupplier(suppliers));
    }
  }, [suppliers, dispatch]);

  const allPersons = useMemo(
    () => [...customers, ...suppliers],
    [customers, suppliers]
  );

  const editSchema = useMemo(() => {
    const nameMessage =
      personType === "customer"
        ? "نام شخص الزامی است"
        : "نام تامین‌کننده الزامی است";
    const editingPersonId = editingPerson ? editingPerson.id : null;
    return createPersonSchema(nameMessage, allPersons, editingPersonId);
  }, [personType, allPersons, editingPerson]);

  const resolver = yupResolver(editSchema) as unknown as Resolver<
    PersonFormData,
    unknown
  >;

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<PersonFormData>({ resolver });

  const addMutation = useMutation<ApiUser, Error, { data: PersonFormData }>({
    mutationFn: addPerson,
    onSuccess: (newUser, variables) => {
      showToast(`شخص "${newUser.firstName}" با موفقیت اضافه شد`, "success");
      queryClient.setQueryData<PersonsCache>(["persons"], (oldData) => {
        if (!oldData) return { customers: [], suppliers: [] };

        const newPersonAsCustomer: Customer = {
          id: newUser.id,
          name: `${newUser.firstName} ${newUser.lastName}`,
          phone: newUser.phone,
          city: newUser.company.address.city || variables.data.city,
          address: newUser.company.address.address || variables.data.address,
        };

        return {
          ...oldData,
          customers: [...oldData.customers, newPersonAsCustomer],
        };
      });
    },
    onError: (error) => {
      showToast(`خطا در افزودن شخص: ${error.message}`, "error");
    },
  });

  const editMutation = useMutation<ApiUser, Error, Person>({
    mutationFn: editPerson,
    onSuccess: (updatedUser, variables) => {
      showToast(`"${updatedUser.firstName}" با موفقیت ویرایش شد`, "success");
      handleCloseEditForm();
      queryClient.setQueryData<PersonsCache>(["persons"], (oldData) => {
        if (!oldData) return { customers: [], suppliers: [] };
        const isCustomer = oldData.customers.some(
          (c) => c.id === updatedUser.id
        );

        if (isCustomer) {
          return {
            ...oldData,
            customers: oldData.customers.map((c) =>
              c.id === updatedUser.id ? { ...c, ...variables } : c
            ),
          };
        } else {
          return {
            ...oldData,
            suppliers: oldData.suppliers.map((s) =>
              s.id === updatedUser.id ? { ...s, ...variables } : s
            ),
          };
        }
      });
    },
    onError: (error) => {
      showToast(`خطا در ویرایش: ${error.message}`, "error");
    },
  });

  const deleteMutation = useMutation<ApiUser, Error, number>({
    mutationFn: deletePerson,
    onSuccess: (deletedUser) => {
      showToast(`شخص "${deletedUser.firstName}" با موفقیت حذف شد.`, "success");
      handleCloseDeleteModal();
      queryClient.setQueryData<PersonsCache>(["persons"], (oldData) => {
        if (!oldData) return { customers: [], suppliers: [] };
        return {
          customers: oldData.customers.filter((c) => c.id !== deletedUser.id),
          suppliers: oldData.suppliers.filter((s) => s.id !== deletedUser.id),
        };
      });
    },
    onError: (error) => {
      showToast(`خطا در حذف: ${error.message}`, "error");
    },
  });

  const data = useMemo(() => {
    const sourceData = personType === "customer" ? customers : suppliers;
    const term = searchTerm.toLowerCase().trim();
    return sourceData
      .filter(
        (p) =>
          !term ||
          p.name.toLowerCase().includes(term) ||
          (p.city && p.city.toLowerCase().includes(term))
      )
      .sort((a, b) => (a[sortBy] ?? "").localeCompare(b[sortBy] ?? "", "fa"));
  }, [personType, customers, suppliers, searchTerm, sortBy]);

  const getNextId = () => {
    const maxId =
      allPersons.length > 0 ? Math.max(...allPersons.map((p) => p.id)) : 0;
    return maxId + 1;
  };

  const handleSaveNewPerson = (personData: PersonFormData) => {
    addMutation.mutate({ data: personData });
  };

  const handleOpenEditForm = (person: Person) => {
    setPersonType("debt" in person ? "customer" : "supplier");
    setEditingPerson(person);
    setSelectedMoeinForEdit(
      moeinOptions.find((opt) => opt.id === person.moein) || null
    );
    resetEditForm(person as PersonFormData);
    setEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setEditFormOpen(false);
    setEditingPerson(null);
  };

  const onEditSubmit: SubmitHandler<PersonFormData> = (formData) => {
    if (!editingPerson || !selectedMoeinForEdit) return;
    const payload = {
      ...editingPerson,
      ...formData,
      moein: selectedMoeinForEdit.id as MoeinCategory,
    };
    editMutation.mutate(payload);
  };

  const handleOpenDeleteModal = (id: number) =>
    setDeleteModal({ open: true, id });
  const handleCloseDeleteModal = () =>
    setDeleteModal({ open: false, id: null });

  const handleConfirmDelete = () => {
    if (deleteModal.id !== null) {
      deleteMutation.mutate(deleteModal.id);
    }
  };

  const headCells: readonly HeadCell<Person>[] = [
    { id: "id", numeric: true, label: "کد" },
    { id: "name", numeric: false, label: "نام" },
    {
      id: "phone",
      numeric: false,
      label: "تلفن",
      cell: (row) => row.phone ?? "-",
    },
    {
      id: "city",
      numeric: false,
      label: "شهر",
      cell: (row) => row.city ?? "-",
    },
  ];

  const actions: readonly Action<Person>[] = [
    {
      icon: <EditIcon fontSize="small" />,
      tooltip: "ویرایش",
      onClick: handleOpenEditForm,
    },
    {
      icon: <DeleteIcon color="error" fontSize="small" />,
      tooltip: "حذف",
      onClick: (row) => handleOpenDeleteModal(row.id),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
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
          onSortByChange={(value) => setSortBy(value as "name" | "city")}
          sortOptions={customerSortOptions}
        />
        <EnhancedMuiTable
          rows={data}
          headCells={headCells}
          title=""
          actions={actions}
          onDelete={(ids) =>
            ids.forEach((id) => handleOpenDeleteModal(Number(id)))
          }
          loading={isLoading}
        />
      </Paper>

      {editingPerson && (
        <FormDialog
          open={editFormOpen}
          onClose={handleCloseEditForm}
          onSave={handleEditSubmit(onEditSubmit)}
          title="ویرایش شخص"
        >
          <Box
            component="form"
            onSubmit={handleEditSubmit(onEditSubmit)}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: 1,
              width: "100%",
              maxWidth: "400px",
              mx: "auto",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                label="کد"
                value={editingPerson.id}
                disabled
                size="small"
                sx={{ flex: 1 }}
              />
              <SearchableSelect
                options={moeinOptions}
                value={selectedMoeinForEdit}
                onChange={setSelectedMoeinForEdit}
                label="معین"
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
            <Form
              config={formFields}
              control={editControl}
              errors={editErrors}
            />
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
