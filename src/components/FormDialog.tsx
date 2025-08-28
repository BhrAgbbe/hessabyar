import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave: () => void;
  saveText?: string;
}

const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  title,
  children,
  onSave,
  saveText = 'ذخیره',
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {title}

      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions sx={{ padding: '16px 24px', gap: '8px' }}>
        <Button onClick={onClose} variant="outlined">
          انصراف
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          {saveText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;