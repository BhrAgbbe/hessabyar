import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

export interface BankAccount {
    id: string;
    bankName: string;
    branchName: string;
    branchCode: string;
    accountNumber: string;
    balance: number;
}

const initialState: BankAccount[] = [];

const accountsSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        addAccount: (state, action: PayloadAction<Omit<BankAccount, 'id'>>) => {
            const newAccount: BankAccount = { id: `ACC-${Date.now()}`, ...action.payload };
            state.push(newAccount);
        },
        editAccount: (state, action: PayloadAction<BankAccount>) => {
            const index = state.findIndex(acc => acc.id === action.payload.id);
            if (index !== -1) {
                state[index] = action.payload;
            }
        },
        deleteAccount: (state, action: PayloadAction<string>) => {
            return state.filter(acc => acc.id !== action.payload);
        },
        updateBalance: (state, action: PayloadAction<{id: string, amount: number}>) => {
            const account = state.find(acc => acc.id === action.payload.id);
            if(account) {
                account.balance += action.payload.amount;
            }
        }
    }
});

export const { addAccount, editAccount, deleteAccount, updateBalance } = accountsSlice.actions;
export default accountsSlice.reducer;
