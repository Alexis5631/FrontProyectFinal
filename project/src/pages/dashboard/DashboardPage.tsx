import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { MechanicDashboard } from './MechanicDashboard';
import { ReceptionistDashboard } from './ReceptionistDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'mechanic':
        return <MechanicDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <Layout title="Dashboard">
      {renderDashboard()}
    </Layout>
  );
};