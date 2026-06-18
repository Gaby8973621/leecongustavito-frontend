import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Seleccion from "./pages/Seleccion";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import LoginEstudiante from "./pages/LoginEstudiante";
import Dashboard from "./pages/DashboardDocente";
import AppEstudiante from "./pages/AppEstudiante";
import AgregarCuento from "./pages/AgregarCuento";
import RutaDocente from "./components/RutaDocente";
import RutaEstudiante from "./components/RutaEstudiante";
import NotFound from "./pages/NotFound";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Navigate to="/seleccion" />} />
        <Route path="/seleccion" element={<Seleccion />} />
        <Route path="/login-docente" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login-estudiante" element={<LoginEstudiante />} />

        {/* Solo docente autenticado */}
        <Route path="/dashboard" element={
          <RutaDocente><Dashboard /></RutaDocente>
        } />
        <Route path="/agregar-cuento" element={
          <RutaDocente><AgregarCuento /></RutaDocente>
        } />

        {/* Solo estudiante autenticado */}
        <Route path="/app-estudiante" element={
          <RutaEstudiante><AppEstudiante /></RutaEstudiante>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}