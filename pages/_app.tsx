import type { AppProps } from "next/app";
import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { store, persistor } from "../src/store/store";
import { theme } from "../src/styles/theme";
import { MainLayout } from "../src/components/layout/MainLayout";
import "../src/styles/fonts.css";
import { useRouter } from "next/router";
import { ToastProvider } from "../src/components/ToastProvider"; 

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("SW registered:", registration);
          })
          .catch((err) => {
            console.warn("SW registration failed:", err);
          });
      });
    }
  }, []);

  if (router.pathname === '/login') {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <ToastProvider>
              <CssBaseline />
              <Component {...pageProps} />
            </ToastProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <ToastProvider>
            <CssBaseline />
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </ToastProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;