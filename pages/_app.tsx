import type { AppProps } from "next/app";
import React, { useState, useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../src/store/store";
import { MainLayout } from "../src/components/layout/MainLayout";
import { useRouter } from "next/router";
import { ToastProvider } from "../src/components/ToastProvider";
import DynamicThemeProvider from "../src/components/DynamicThemeProvider";
import type { RootState } from "../src/store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import CssBaseline from "@mui/material/CssBaseline";

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

type AppWrapperProps = {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
};

const AppWrapper = ({ Component, pageProps }: AppWrapperProps) => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(router.pathname);

  useEffect(() => {
    if (!isAuthenticated && !isPublicPage) {
      router.push('/login');
    }
    
    if (isAuthenticated && isPublicPage) {
      router.push('/');
    }
  }, [isAuthenticated, isPublicPage, router]);
  
  if ((!isAuthenticated && !isPublicPage) || (isAuthenticated && isPublicPage)) {
    return null; 
  }

  if (isPublicPage) {
    return <Component {...pageProps} />;
  }

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <CacheProvider value={cacheRtl}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <DynamicThemeProvider>
              <CssBaseline />
              <ToastProvider>
                <AppWrapper Component={Component} pageProps={pageProps} />
              </ToastProvider>
            </DynamicThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </CacheProvider>
  );
}

export default MyApp;
