import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './src/screens/LandingPage';
import { ClinicLanding } from './src/screens/landing/ClinicLanding';
import { DoctorLanding } from './src/screens/landing/DoctorLanding';
import { AuthPage } from './src/screens/AuthPage';
import { DoctorDashboard } from './src/screens/DoctorDashboard';
import { PatientPortalRoutes } from './src/screens/PatientPortalRoutes';
import { PaymentCallbackScreen } from './src/screens/PaymentCallbackScreen';

import { AssistantDashboard } from './src/screens/AssistantDashboard';

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Doctor Login Route */}
      <Route path="/app/doctor/login" element={<AuthPage />} />

      {/* Payment Callback Route (for 3DS return) */}
      <Route path="/app/payment/callback" element={<PaymentCallbackScreen />} />

      {/* Patient Portal Routes */}
      <Route path="/app/patient/*" element={<PatientPortalRoutes />} />

      {/* Assistant Dashboard Routes */}
      <Route path="/app/assistant/*" element={<AssistantDashboard />} />

      {/* Doctor Dashboard Routes (Protected) */}
      <Route path="/app/*" element={<DoctorDashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

