import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Seleccion from "./pages/Seleccion";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import LoginEstudiante from "./pages/LoginEstudiante";
import Dashboard from "./pages/DashboardDocente";
import AppEstudiante from "./pages/AppEstudiante";
import AgregarCuento from "./pages/AgregarCuento";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/seleccion" />} />
        <Route path="/login" element={<Navigate to="/seleccion" />} />
        <Route path="/seleccion" element={<Seleccion />} />
        <Route path="/login-docente" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login-estudiante" element={<LoginEstudiante />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/app-estudiante" element={<AppEstudiante />} />
        <Route path="/agregar-cuento" element={<AgregarCuento />} />
      </Routes>
    </BrowserRouter>
  );
}