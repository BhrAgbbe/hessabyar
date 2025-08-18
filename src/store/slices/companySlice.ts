import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CompanyInfo {
  name: string;
  managerName: string;
  economicCode: string;
  phone: string;
  mobile: string;
  fax: string;
  address: string;
  promoMessage: string;
  logo: string | null; 
}

const initialState: CompanyInfo = {
  name: '',
  managerName: '',
  economicCode: '',
  phone: '',
  mobile: '',
  fax: '',
  address: '',
  promoMessage: '',
  logo: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {

    updateCompanyInfo: (_state, action: PayloadAction<CompanyInfo>) => {
      return action.payload;
    },
  },
});

export const { updateCompanyInfo } = companySlice.actions;

export default companySlice.reducer;