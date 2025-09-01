import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';

interface SortOption {
  value: string;
  label: string;
}

interface SearchAndSortPanelProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOptions: SortOption[];
}

const SearchAndSortPanel: React.FC<SearchAndSortPanelProps> = ({
  searchTerm,
  onSearchTermChange,
  sortBy,
  onSortByChange,
  sortOptions,
}) => {
  const selectedSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || '';

  return (
    <Box
      className="no-print"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row-reverse' },
        alignItems: { md: 'center' },
        gap: 2,
        mb: 3,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >

      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          flexGrow: 1,
          flexDirection: 'row-reverse' 
        }}
      >
        <TextField
          placeholder={`جستجو در ${selectedSortLabel}...`}
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
        <Typography
          variant="body2"
          sx={{ fontWeight: 'medium', color: 'text.secondary' }}
        >
        جستجو 
        </Typography>
      </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexDirection: 'row-reverse' 
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography
              variant="body2"
              sx={{ fontWeight: 'medium', color: 'text.secondary', whiteSpace: 'nowrap' }}
            >
             مرتب‌سازی بر اساس
            </Typography>
          </Box>
    </Box>
  );
};

export default SearchAndSortPanel;