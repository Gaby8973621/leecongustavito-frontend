import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch {
      setError("Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"2.5rem", width:"100%", maxWidth:"400px", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize:"56px" }}>📖</div>
        <h1 style={{ fontSize:"24px", fontWeight:"700", color:"#2d2d2d", margin:"0 0 4px" }}>LeeConGustavito</h1>
        <p style={{ fontSize:"14px", color:"#888", marginBottom:"2rem" }}>Inicia sesión para continuar</p>

        <form onSubmit={handleLogin} style={{ textAlign:"left" }}>
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
              placeholder="••••••••"
              style={{ width:"100%", padding:"12px 14px", fontSize:"14px", border:"1.5px solid #e0e0e0", borderRadius:"10px", outline:"none", boxSizing:"border-box" }}
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
            {cargando ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <p style={{ fontSize:"13px", color:"#888", marginTop:"1.5rem" }}>
          ¿No tienes cuenta?{" "}
          <span style={{ color:"#667eea", cursor:"pointer", fontWeight:"600" }} onClick={() => navigate("/registro")}>
            Regístrate aquí
          </span>
        </p>
      </div>
    </div>
  ); 
}