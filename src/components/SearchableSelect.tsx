import React from "react";
import Autocomplete, { type AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import { CircularProgress, type SxProps, type Theme } from "@mui/material";
import CustomTextField from "./TextField";

export interface SelectOption {
  id: number | string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value?: SelectOption | null;
  defaultValue?: SelectOption | null;
  onChange: (value: SelectOption | null) => void;
  label: string;
  loading?: boolean;
  placeholder?: string;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
  clearable?: boolean; 
  freeSolo?: boolean; 
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  label,
  loading = false,
  placeholder,
  size,
  sx,
  clearable = true,
  freeSolo = false,
}) => {
  return (
    <Autocomplete
      value={value ?? null}
      defaultValue={defaultValue ?? null}
      onChange={(_event, newValue) => {
        if (typeof newValue === "string") {
          onChange(null);
        } else {
          onChange(newValue);
        }
      }}
      options={options}
      loading={loading}
      sx={sx}
      size={size}
      disableClearable={!clearable}
      freeSolo={freeSolo}
      getOptionLabel={(option) => {
        if (!option) return "";
        return typeof option === "string" ? option : option.label ?? "";
      }}
      isOptionEqualToValue={(option, val) => {
        if (!val) return false;
        if (typeof val === "string") {
          return option.label === val;
        }
        return option.id === val.id;
      }}
      noOptionsText="موردی یافت نشد"
      loadingText="در حال بارگذاری..."
      renderInput={(params: AutocompleteRenderInputParams) => (
        <CustomTextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default SearchableSelect;
