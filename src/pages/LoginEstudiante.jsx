import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/LoginEstudiante.css";

export default function LoginEstudiante() {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleEntrar = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      // 1. Buscar el aula por código
      const aulasRef = collection(db, "docentes");
      const q = query(
        aulasRef,
        where("codigoAula", "==", codigo.toUpperCase())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("Código de aula incorrecto. Pídele el código a tu maestra.");
        setCargando(false);
        return;
      }

      const docenteDoc = snap.docs[0];
      const docenteId = docenteDoc.id;

      // 2. Buscar estudiante por nombre normalizado
      const nombreNormalizado = nombre.trim().toLowerCase();
      const estudiantesRef = collection(db, "docentes", docenteId, "estudiantes");

      const qEst = query(
        estudiantesRef,
        where("nombreNormalizado", "==", nombreNormalizado)
      );
      const snapEst = await getDocs(qEst);

      let estudianteId;

      if (snapEst.empty) {
        // No existe, crear nuevo
        const nuevo = await addDoc(estudiantesRef, {
          nombre: nombre.trim(),
          nombreNormalizado: nombreNormalizado,
          nivelLector: 1,
          puntosTotal: 0,
          creadoEn: new Date(),
        });
        estudianteId = nuevo.id;
      } else {
        // Ya existe, reutilizar
        estudianteId = snapEst.docs[0].id;
      }

      // 3. Registrar sesión
      const sesionRef = await addDoc(collection(db, "sesiones"), {
        estudianteId,
        nombre: nombre.trim(),
        codigoAula: codigo.toUpperCase(),
        docenteId,
        entrada: serverTimestamp(),
        salida: null,
      });

      // 4. Guardar en localStorage
      localStorage.setItem(
        "estudiante",
        JSON.stringify({
          id: estudianteId,
          nombre: nombre.trim(),
          docenteId,
          sesionId: sesionRef.id,
          codigoAula: codigo.toUpperCase(),
        })
      );

      navigate("/app-estudiante");

    } catch (e) {
      console.error("Error al entrar:", e);
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="estudiante-container">

      <button className="back-circle" onClick={() => navigate("/")}>
        ←
      </button>

      <div className="estudiante-card">

        <div className="estudiante-logo">🧒</div>

        <h1 className="estudiante-title">¡Hola!</h1>

        <p className="estudiante-subtitle">
          Escribe tu nombre y el código de tu aula
        </p>

        <form onSubmit={handleEntrar} className="estudiante-form">

          <div className="form-group">
            <label>Tu nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Valeria"
              required
            />
          </div>

          <div className="form-group">
            <label>Código de aula</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: ABC123"
              className="codigo-input"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="estudiante-button"
          >
            {cargando ? "Entrando..." : "¡Entrar a leer! 📖"}
          </button>

        </form>
      </div>
    </div>
  );
}