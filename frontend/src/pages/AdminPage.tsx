import React from 'react';
import { AdminDashboard } from '@components/admin/AdminDashboard';
import './AdminPage.css';

export const AdminPage: React.FC = () => {
  return (
    <div className="admin-page">
      <AdminDashboard />
    </div>
  );
};