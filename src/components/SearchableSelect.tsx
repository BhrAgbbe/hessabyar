import React from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';

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
      getOptionLabel={(option) => option.label || ''}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      noOptionsText="موردی یافت نشد"
      loadingText="در حال بارگذاری..."
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant="outlined"
          sx={{
            '& label': {
              right: 35,
              left: 'auto',
              transformOrigin: 'top right',
            },
            '& label.Mui-focused': {
              transform: 'translate(-14px, -9px) scale(0.75)',
            },
            '& .MuiOutlinedInput-root': {
              direction: 'rtl',
              '& fieldset': {
                textAlign: 'right',
              },
            },
          }}
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