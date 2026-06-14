import { useState } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

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
      // Buscar el aula con ese código
      const aulasRef = collection(db, "docentes");
      const q = query(aulasRef, where("codigoAula", "==", codigo.toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("Código de aula incorrecto. Pídele el código a tu maestra.");
        setCargando(false);
        return;
      }

      const docenteDoc = snap.docs[0];
      const docenteId = docenteDoc.id;

      // Buscar si el estudiante ya existe en esa aula
      const estudiantesRef = collection(db, "docentes", docenteId, "estudiantes");
      const qEst = query(estudiantesRef, where("nombre", "==", nombre.trim()));
      const snapEst = await getDocs(qEst);

      let estudianteId;

      if (snapEst.empty) {
        // Crear el estudiante nuevo
        const nuevo = await addDoc(estudiantesRef, {
          nombre: nombre.trim(),
          nivelLector: 1,
          puntosTotal: 0,
          creadoEn: new Date(),
        });
        estudianteId = nuevo.id;
      } else {
        estudianteId = snapEst.docs[0].id;
      }

      // Guardar sesión en localStorage
      localStorage.setItem("estudiante", JSON.stringify({
        id: estudianteId,
        nombre: nombre.trim(),
        docenteId,
      }));

      navigate("/app-estudiante");
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"2.5rem", width:"100%", maxWidth:"400px", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize:"52px", marginBottom:"8px" }}>🧒</div>
        <h1 style={{ fontSize:"22px", fontWeight:"700", color:"#2d2d2d", marginBottom:"4px" }}>¡Hola!</h1>
        <p style={{ fontSize:"14px", color:"#888", marginBottom:"2rem" }}>Escribe tu nombre y el código de tu aula</p>

        <form onSubmit={handleEntrar} style={{ textAlign:"left" }}>
          <div style={{ marginBottom:"1rem" }}>
            <label style={{ fontSize:"13px", fontWeight:"600", color:"#555", display:"block", marginBottom:"6px" }}>Tu nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Valeria"
              style={{ width:"100%", padding:"12px 14px", fontSize:"14px", border:"1.5px solid #e0e0e0", borderRadius:"10px", outline:"none", boxSizing:"border-box" }}
              required
            />
          </div>

          <div style={{ marginBottom:"1rem" }}>
            <label style={{ fontSize:"13px", fontWeight:"600", color:"#555", display:"block", marginBottom:"6px" }}>Código de aula</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: ABC123"
              style={{ width:"100%", padding:"12px 14px", fontSize:"16px", border:"1.5px solid #e0e0e0", borderRadius:"10px", outline:"none", boxSizing:"border-box", textTransform:"uppercase", letterSpacing:"4px", fontWeight:"600", textAlign:"center" }}
              required
            />
          </div>

          {error && (
            <p style={{ background:"#fdecea", color:"#c0392b", padding:"10px", borderRadius:"8px", fontSize:"13px", marginBottom:"1rem" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{ width:"100%", padding:"13px", fontSize:"15px", fontWeight:"600", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"#fff", border:"none", borderRadius:"10px", cursor:"pointer" }}
          >
            {cargando ? "Entrando..." : "¡Entrar a leer! 📖"}
          </button>
        </form>

        <p style={{ fontSize:"13px", color:"#888", marginTop:"1.5rem", cursor:"pointer" }} onClick={() => window.history.back()}>
          ← Volver
        </p>
      </div>
    </div>
  );
}