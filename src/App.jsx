import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import CalcPage from './pages/CalcPage';
import MapPage from './pages/MapPage';
import FormPage from './pages/FormPage';
import SoundPage from './pages/SoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/calc" element={<CalcPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/form" element={<FormPage />} />
      <Route path="/sound" element={<SoundPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
