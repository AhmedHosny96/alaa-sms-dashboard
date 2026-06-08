import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import AppProvider from 'providers/AppProvider';
import { router } from 'routes';
import 'helpers/initFA';

// Self-host Poppins so the app renders in the right font without relying on
// fonts.googleapis.com / fonts.gstatic.com. Vite bundles these and serves them
// from the same origin — no CSP holes needed, and offline-capable.
import '@fontsource/poppins/100.css';
import '@fontsource/poppins/200.css';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/900.css';

const container = document.getElementById('main');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </React.StrictMode>
);
