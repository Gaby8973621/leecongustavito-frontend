import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Seleccion from "./pages/Seleccion";
import LoginDocente from "./pages/LoginDocente";
import Registro from "./pages/Registro";
import LoginEstudiante from "./pages/LoginEstudiante";
import Dashboard from "./pages/DashboardDocente";
import AppEstudiante from "./pages/AppEstudiante";
import AgregarCuento from "./pages/AgregarCuento";
import RutaDocente from "./components/RutaDocente";
import RutaEstudiante from "./components/RutaEstudiante";
import NotFound from "./pages/NotFound";
import EditarCuento from "./pages/EditarCuento";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Navigate to="/seleccion" />} />
        <Route path="/seleccion" element={<Seleccion />} />
        <Route path="/login-docente" element={<LoginDocente />} />
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

        <Route path="/editar-cuento/:id" element={
          <RutaDocente><EditarCuento /></RutaDocente>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}