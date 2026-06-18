import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

export default function RutaDocente({ children }) {
  if (!auth.currentUser) {
    return <Navigate to="/seleccion" replace />;
  }
  return children;
}``