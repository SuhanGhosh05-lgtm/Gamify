import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import Register from './pages/signUp';
import Universe from './pages/universe';
import OnboardingForm from './pages/form';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/universe" element={<Universe />} />
      <Route path="/onboarding" element={<OnboardingForm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
