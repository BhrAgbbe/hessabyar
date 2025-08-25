import React from 'react';
import { Autocomplete, CircularProgress } from '@mui/material';
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
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  label,
  loading = false,
  placeholder,
}) => {
  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      options={options}
      loading={loading}
      sx={{ width: 300 }} 
      getOptionLabel={(option) => option.label || ''}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      noOptionsText="موردی یافت نشد"
      loadingText="در حال بارگذاری..."
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