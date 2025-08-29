import React, { useState } from 'react';
import FormDialog from './FormDialog';
import CustomTextField from './TextField';

interface NewBankDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (bankName: string) => void;
}

const NewBankDialog: React.FC<NewBankDialogProps> = ({ open, onClose, onSave }) => {
  const [bankName, setBankName] = useState('');

  const handleSave = () => {
    if (bankName.trim()) {
      onSave(bankName.trim());
      setBankName(''); 
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="افزودن نام بانک جدید"
      saveText="افزودن"
    >
      <CustomTextField
        autoFocus
        margin="dense"
        label="نام بانک"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
      />
    </FormDialog>
  );
};

export default NewBankDialog;