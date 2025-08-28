import React from 'react';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface PageHeaderProps {
  personType: 'customer' | 'supplier';
  onPersonTypeChange: (type: 'customer' | 'supplier') => void;
  actionButton: React.ReactNode; 
}

const PageHeader: React.FC<PageHeaderProps> = ({
  personType,
  onPersonTypeChange,
  actionButton,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleTitleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTypeChange = (type: 'customer' | 'supplier') => {
    onPersonTypeChange(type);
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        gap: 2,
      }}
    >
      
        <Button
          id="person-type-button"
          aria-controls={menuOpen ? 'person-type-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen ? 'true' : undefined}
          onClick={handleTitleClick}
          endIcon={<ArrowDropDownIcon />}
          sx={{ color: 'text.primary', textTransform: 'none' }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            لیست {personType === 'customer' ? 'مشتریان فروش' : 'مشتریان خرید'}
          </Typography>
        </Button>
        <Menu
          id="person-type-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          MenuListProps={{ 'aria-labelledby': 'person-type-button' }}
        >
          <MenuItem onClick={() => handleTypeChange('customer')}>
            مشتریان فروش
          </MenuItem>
          <MenuItem onClick={() => handleTypeChange('supplier')}>
            مشتریان خرید
          </MenuItem>
        </Menu>
      
      {actionButton}

    </Box>
  );
};

export default PageHeader;