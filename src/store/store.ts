import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import usersReducer from "./slices/usersSlice";
import companyReducer from "./slices/companySlice";
import accountsReducer from "./slices/accountsSlice";
import customersReducer from "./slices/customersSlice";
import suppliersReducer from "./slices/suppliersSlice";
import groupsReducer from "./slices/groupsSlice";
import unitsReducer from "./slices/unitsSlice";
import warehousesReducer from "./slices/warehousesSlice";
import productsReducer from "./slices/productsSlice";
import invoicesReducer from "./slices/invoicesSlice";
import wastageReducer from "./slices/wastageSlice";
import checksReducer from "./slices/checksSlice";
import transactionsReducer from "./slices/transactionsSlice";
import settingsReducer from "./slices/settingsSlice";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  users: usersReducer,
  company: companyReducer,
  accounts: accountsReducer,
  customers: customersReducer,
  suppliers: suppliersReducer,
  groups: groupsReducer,
  units: unitsReducer,
  warehouses: warehousesReducer,
  products: productsReducer,
  invoices: invoicesReducer,
  wastage: wastageReducer,
  checks: checksReducer,
  transactions: transactionsReducer,
  settings: settingsReducer,
  auth: authReducer,
});

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
