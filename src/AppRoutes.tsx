import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// LandingPage removed as it's now handled by Next.js
// import { LandingPage } from './screens/LandingPage';
// import { ClinicLanding } from './screens/landing/ClinicLanding';
// import { DoctorLanding } from './screens/landing/DoctorLanding';
import { AuthPage } from './screens/AuthPage';
import { DoctorDashboard } from './screens/DoctorDashboard';
import { PatientPortalRoutes } from './screens/PatientPortalRoutes';
import { PaymentCallbackScreen } from './screens/PaymentCallbackScreen';

import { AssistantDashboard } from './screens/AssistantDashboard';
// import CenlaePage from './screens/CenlaePage';
// import { DoctorProfilePage } from './screens/cenlae/DoctorProfilePage';

import { IPProtectedArea } from '../app/components/auth/IPProtectedArea';

const AppRoutes = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <Routes>
      {/* Public Routes - Landing is Next.js now, but we keep these just in case or for specific access */}
      {/* <Route path="/" element={<LandingPage />} /> */}
      <Route path="/auth" element={<AuthPage />} />
      {/* <Route path="/cenlae" element={<CenlaePage />} /> */}
      {/* <Route path="/perfil" element={<DoctorProfilePage />} /> */}

      {/* Doctor Login Route (Protected by IP) */}
      <Route
        path="/app/doctor/login"
        element={
          <IPProtectedArea>
            <AuthPage />
          </IPProtectedArea>
        }
      />

      {/* Payment Callback Route (for 3DS return) */}
      <Route path="/app/payment/callback" element={<PaymentCallbackScreen />} />

      {/* Patient Portal Routes (Public Entry) */}
      <Route path="/app/patient/*" element={<PatientPortalRoutes />} />

      {/* Assistant Dashboard Routes (Protected by IP) */}
      <Route
        path="/app/assistant/*"
        element={
          <IPProtectedArea>
            <AssistantDashboard />
          </IPProtectedArea>
        }
      />

      {/* Doctor Dashboard Routes (Protected by IP) */}
      <Route
        path="/app/*"
        element={
          <IPProtectedArea>
            <DoctorDashboard />
          </IPProtectedArea>
        }
      />

      {/* Fallback - Redirect to App Login or Root if not found */}
      <Route path="*" element={<Navigate to="/app/doctor/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

