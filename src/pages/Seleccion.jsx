import { useNavigate } from "react-router-dom";

export default function Seleccion() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"2.5rem", width:"100%", maxWidth:"400px", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize:"52px", marginBottom:"8px" }}>📖</div>
        <h1 style={{ fontSize:"22px", fontWeight:"700", color:"#2d2d2d", marginBottom:"4px" }}>LeeConGustavito</h1>
        <p style={{ fontSize:"14px", color:"#888", marginBottom:"2rem" }}>¿Cómo quieres entrar?</p>

        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div
            onClick={() => navigate("/login-docente")}
            style={{ border:"1.5px solid #e0e0e0", borderRadius:"14px", padding:"1.2rem", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:"14px", transition:"all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor="#667eea"}
            onMouseLeave={e => e.currentTarget.style.borderColor="#e0e0e0"}
          >
            <div style={{ fontSize:"36px" }}>👩‍🏫</div>
            <div>
              <div style={{ fontSize:"15px", fontWeight:"600", color:"#2d2d2d" }}>Soy docente</div>
              <div style={{ fontSize:"13px", color:"#888" }}>Accede al panel de gestión</div>
            </div>
          </div>

          <div
            onClick={() => navigate("/login-estudiante")}
            style={{ border:"1.5px solid #e0e0e0", borderRadius:"14px", padding:"1.2rem", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:"14px", transition:"all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor="#667eea"}
            onMouseLeave={e => e.currentTarget.style.borderColor="#e0e0e0"}
          >
            <div style={{ fontSize:"36px" }}>🧒</div>
            <div>
              <div style={{ fontSize:"15px", fontWeight:"600", color:"#2d2d2d" }}>Soy estudiante</div>
              <div style={{ fontSize:"13px", color:"#888" }}>Entra con tu código de aula</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}