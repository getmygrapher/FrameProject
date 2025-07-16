import { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
}