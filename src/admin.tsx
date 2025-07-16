import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './components/admin/AdminApp';
import { AdminProvider } from './context/AdminContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminProvider>
      <AdminApp />
    </AdminProvider>
  </React.StrictMode>
);