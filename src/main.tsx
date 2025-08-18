import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; 
import { CssBaseline } from '@mui/material';

import App from './App';
import { store, persistor } from './store/store'; 
import DynamicThemeProvider from './components/DynamicThemeProvider';

import './styles/fonts.css';
import './styles/print.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <DynamicThemeProvider>
            <CssBaseline />
            <App />
          </DynamicThemeProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);