import { Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from './auth/AuthRoutes';
import { AppShell } from './layouts/AppShell';
import { LoginPage } from './pages/auth/LoginPage';

function App() {
  return <Routes>
    <Route element={<GuestRoute />}><Route path="/login" element={<LoginPage />} /></Route>
    <Route element={<ProtectedRoute />}><Route path="/*" element={<AppShell />} /></Route>
  </Routes>;
}

export default App;
