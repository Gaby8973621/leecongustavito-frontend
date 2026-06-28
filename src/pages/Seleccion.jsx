import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Seleccion.css";

export default function Seleccion() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="seleccion-container">

      {/* BOTÓN HAMBURGUESA  */}
      <div className="menu-docente-wrapper">
        <button
          className="menu-docente-btn"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          ☰
        </button>

        {menuAbierto && (
          <div className="menu-docente-dropdown">
            <p className="menu-docente-titulo">🔒 Acceso Docente</p>
            <p className="menu-docente-sub">Solo para profesores</p>
            <button
              className="btn-panel"
              onClick={() => navigate("/login-docente")}
            >
              Ir al panel de gestión ◇
            </button>
          </div>
        )}
      </div>

      {/* HEADER con logo del colegio */}
      <div className="header-colegio">
        <img src="/logo-colegio.png" alt="Logo colegio" className="logo-colegio" />
        <span className="nombre-colegio">Colegio Horizonte del Saber</span>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="contenido">
        <h1>Bienvenido a LeeConGustavito</h1>
        <p className="subtitulo">Ingresa para comenzar tu aprendizaje</p>

        <img
          src="/mascota.png"
          alt="Gustavito"
          className="mascota"
        />

        <div
          className="card estudiante"
          onClick={() => navigate("/login-estudiante")}
        >
          <div className="icono">🧒</div>
          <div>
            <h2>Soy estudiante</h2>
            <p>Entra con tu código de aula</p>
          </div>
        </div>
      </div>

    </div>
  );
}