import React, { useState, useMemo } from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  TextField,
} from "@mui/material";
import type { Customer, MoeinCategory, Supplier } from "../types/person";

import {
  createPersonSchema,
  type PersonFormData,
} from "../schema/personSchema";

import FormDialog from "./FormDialog";
import Form, { type FormField } from "./Form";
import SearchableSelect, { type SelectOption } from "./SearchableSelect";

type Person = Customer | Supplier;

interface AddPersonProps {
  personType: "customer" | "supplier";
  onPersonTypeChange: (type: "customer" | "supplier") => void;
  onSave: (data: Omit<Person, "id">) => void;
  getNextId: () => number;
  moeinOptions: SelectOption[];
  existingPersons: Person[];
}

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

const AddPerson: React.FC<AddPersonProps> = ({
  personType,
  onPersonTypeChange,
  onSave,
  getNextId,
  moeinOptions,
  existingPersons,
}) => {
  const [open, setOpen] = useState(false);

  const activeSchema = useMemo(() => {
    const nameMessage =
      personType === "customer"
        ? "نام شخص الزامی است"
        : "نام تامین‌کننده الزامی است";
    return createPersonSchema(nameMessage, existingPersons);
  }, [personType, existingPersons]);

  const resolver = yupResolver(activeSchema) as unknown as Resolver<
    PersonFormData,
    unknown
  >;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonFormData>({
    resolver,
    defaultValues: {
      name: "",
      phone: "",
      city: "",
      address: "",
      debt: 0,
    },
  });

  const [selectedMoein, setSelectedMoein] = useState<SelectOption | null>(
    moeinOptions[0] || null
  );

  const handleOpen = () => {
    reset();
    setSelectedMoein(moeinOptions[0] || null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit: SubmitHandler<PersonFormData> = (formData) => {
    if (!selectedMoein) {
      console.error("معین انتخاب نشده است");
      return;
    }

    const payload = {
      ...formData,
      moein: selectedMoein.id as MoeinCategory,
    } as Omit<Person, "id">;

    onSave(payload);
    handleClose();
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        افزودن شخص جدید
      </Button>

      <FormDialog
        open={open}
        onClose={handleClose}
        onSave={handleSubmit(onSubmit)}
        title="افزودن شخص جدید"
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography component="label" sx={{ fontWeight: "medium", ml: 1 }}>
              نوع شخص:
            </Typography>
            <RadioGroup
              row
              value={personType}
              onChange={(e) =>
                onPersonTypeChange(e.target.value as "customer" | "supplier")
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

          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              label="کد"
              value={getNextId()}
              disabled
              size="small"
              sx={{ flex: "1 1 45%" }}
            />
            <SearchableSelect
              options={moeinOptions}
              value={selectedMoein}
              onChange={(newValue) => setSelectedMoein(newValue)}
              label="معین"
              size="small"
              sx={{ flex: "1 1 45%" }}
            />
          </Box>

          <Form config={formFields} control={control} errors={errors} />
        </Box>
      </FormDialog>
    </>
  );
};

export default AddPerson;
