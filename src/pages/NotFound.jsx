import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "2.5rem 2rem", textAlign: "center", maxWidth: "340px", width: "100%" , boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize: "72px", marginBottom: "8px" }}>📭</div>
        <div style={{ fontSize: "28px", fontWeight: "800", color: "#2d2d2d", marginBottom: "6px" }}>¡Ups!</div>
        <div style={{ fontSize: "15px", color: "#888", marginBottom: "2rem" }}>
          Esta página no existe.<br />Puede que la dirección esté mal escrita.
        </div>
        <button
          onClick={() => navigate("/seleccion")}
          style={{ width: "100%", padding: "13px", fontSize: "15px", fontWeight: "600", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer" }}
        >
          Volver al inicio 🏠
        </button>
      </div>
    </div>
  );
}