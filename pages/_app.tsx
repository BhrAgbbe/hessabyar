import type { AppProps } from "next/app";
import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../src/store/store";
import { MainLayout } from "../src/components/layout/MainLayout";
import "../src/styles/fonts.css";
import { useRouter } from "next/router";
import { ToastProvider } from "../src/components/ToastProvider";
import DynamicThemeProvider from "../src/components/DynamicThemeProvider";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  if (router.pathname === '/login') {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <DynamicThemeProvider>
            <ToastProvider>
              <Component {...pageProps} />
            </ToastProvider>
          </DynamicThemeProvider>
        </PersistGate>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <DynamicThemeProvider>
          <ToastProvider>
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </ToastProvider>
        </DynamicThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;