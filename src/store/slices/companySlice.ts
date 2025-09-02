import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CompanyInfo } from "../../types/company";

const initialState: CompanyInfo = {
  name: "",
  managerName: "",
  economicCode: "",
  phone: "",
  mobile: "",
  fax: "",
  address: "",
  promoMessage: "",
  logo: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    updateCompanyInfo: (_state, action: PayloadAction<CompanyInfo>) => {
      return action.payload;
    },
  },
});

export const { updateCompanyInfo } = companySlice.actions;

export default companySlice.reducer;
