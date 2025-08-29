import React from "react";
import {
  Controller,
  type FieldValues,
  type Control,
  type FieldErrors,
  type Path,
} from "react-hook-form";
import { Box } from "@mui/material";
import CustomTextField from "./TextField";
import SearchableSelect, { type SelectOption } from "./SearchableSelect";
import ShamsiDatePicker from "./DatePicker";

export interface FormField<T extends FieldValues> {
  name: keyof T;
  label: string;
  type:
    | "text"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "radio"
    | "date";
  rules?: object;
  options?: SelectOption[];
  multiline?: boolean;
  rows?: number;
}

interface GenericFormProps<T extends FieldValues> {
  config: FormField<T>[];
  control: Control<T>;
  errors: FieldErrors<T>;
}

const Form = <T extends FieldValues>({
  config,
  control,
  errors,
}: GenericFormProps<T>) => {
  const renderField = (fieldConfig: FormField<T>) => {
    const { name, label, type, rules, options, rows } = fieldConfig;

    return (
      <Controller
        key={name as string}
        name={name as Path<T>}
        control={control}
        rules={rules}
        render={({ field }) => {
          const commonProps = {
            ...field,
            label,
            error: !!errors[name],
            helperText: errors[name]?.message as string,
          };

          switch (type) {
            case "select":
              return (
                <SearchableSelect
                  options={options || []}
                  value={options?.find((opt) => opt.id === field.value) || null}
                  onChange={(val) => field.onChange(val ? val.id : "")}
                  label={label}
                />
              );
            case "date":
              return (
                <ShamsiDatePicker
                  label={label}
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : null)
                  }
                />
              );
            case "textarea":
              return (
                <CustomTextField
                  {...commonProps}
                  value={field.value || ""}
                  multiline
                  rows={rows || 3}
                />
              );
            default: 
              return (
                <CustomTextField
                  {...commonProps}
                  value={field.value || ""}
                  type={type}
                />
              );
          }
        }}
      />
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
      {config.map(renderField)}
    </Box>
  );
};

export default Form;