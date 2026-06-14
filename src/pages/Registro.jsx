import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [grado, setGrado] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
    const credencial = await createUserWithEmailAndPassword(auth, email, password);

    // Generar código de aula único de 6 caracteres
    const codigoAula = Math.random().toString(36).substring(2, 8).toUpperCase();

    await setDoc(doc(db, "docentes", credencial.user.uid), {
      nombre,
      grado,
      email,
      codigoAula,
      creadoEn: new Date(),
    });
      navigate("/dashboard");
    } catch {
        setError("Error al crear la cuenta. Verifica los datos.");
    } finally {
        setCargando(false);
    }
    };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"2.5rem", width:"100%", maxWidth:"400px", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize:"48px" }}>👩‍🏫</div>
        <h1 style={{ fontSize:"22px", fontWeight:"700", color:"#2d2d2d", margin:"0 0 4px" }}>Crear cuenta</h1>
        <p style={{ fontSize:"14px", color:"#888", marginBottom:"2rem" }}>Regístrate como docente</p>

        <form onSubmit={handleRegistro} style={{ textAlign:"left" }}>
          <div style={{ marginBottom:"1rem" }}>
            <label style={{ fontSize:"13px", fontWeight:"600", color:"#555", display:"block", marginBottom:"6px" }}>Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ana García"
              style={{ width:"100%", padding:"12px 14px", fontSize:"14px", border:"1.5px solid #e0e0e0", borderRadius:"10px", outline:"none", boxSizing:"border-box" }}
              required
            />
          </div>

          <div style={{ marginBottom:"1rem" }}>
            <label style={{ fontSize:"13px", fontWeight:"600", color:"#555", display:"block", marginBottom:"6px" }}>Grado que imparte</label>
            <select
              value={grado}
              onChange={(e) => setGrado(e.target.value)}
              style={{ width:"100%", padding:"12px 14px", fontSize:"14px", border:"1.5px solid #e0e0e0", borderRadius:"10px", outline:"none", boxSizing:"border-box", background:"#fff" }}
              required
            >
              <option value="">Seleccionar grado...</option>
              <option>1° Grado</option>
              <option>2° Grado</option>
              <option>3° Grado</option>
              <option>4° Grado</option>
              <option>5° Grado</option>
            </select>
          </div>

          <div style={{ marginBottom:"1rem" }}>
            <label style={{ fontSize:"13px", fontWeight:"600", color:"#555", display:"block", marginBottom:"6px" }}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              style={{ width:"100%", padding:"12px 14px", fontSize:"14px", border:"1.5px solid #e0e0e0", borderRadius:"10px", outline:"none", boxSizing:"border-box" }}
              required
            />
          </div>

          <div style={{ marginBottom:"1rem" }}>
            <label style={{ fontSize:"13px", fontWeight:"600", color:"#555", display:"block", marginBottom:"6px" }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{ width:"100%", padding:"12px 14px", fontSize:"14px", border:"1.5px solid #e0e0e0", borderRadius:"10px", outline:"none", boxSizing:"border-box" }}
              required
              minLength={6}
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
            {cargando ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p style={{ fontSize:"13px", color:"#888", marginTop:"1.5rem" }}>
          ¿Ya tienes cuenta?{" "}
          <span style={{ color:"#667eea", cursor:"pointer", fontWeight:"600" }} onClick={() => navigate("/login")}>
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
}