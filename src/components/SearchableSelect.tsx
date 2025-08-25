import React from 'react';
import { Autocomplete, CircularProgress, type SxProps, type Theme } from '@mui/material';
import CustomTextField from './TextField';

export interface SelectOption {
  id: number | string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: SelectOption | null;
  onChange: (value: SelectOption | null) => void;
  label: string;
  loading?: boolean;
  placeholder?: string;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>; // Accept the 'sx' prop
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  label,
  loading = false,
  placeholder,
  size,
  sx, // Get the sx prop
}) => {
  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      options={options}
      loading={loading}
      sx={sx} // Apply the sx prop here
      getOptionLabel={(option) => option.label || ''}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      noOptionsText="موردی یافت نشد"
      loadingText="در حال بارگذاری..."
      size={size}
      renderInput={(params) => (
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