import { Navigate } from "react-router-dom";

export default function RutaEstudiante({ children }) {
  const estudiante = JSON.parse(localStorage.getItem("estudiante") || "null");
  if (!estudiante) {
    return <Navigate to="/seleccion" replace />;
  }
  return children;
}