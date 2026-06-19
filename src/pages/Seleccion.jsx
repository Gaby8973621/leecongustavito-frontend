import { useNavigate } from "react-router-dom";
import "../styles/Seleccion.css";


export default function Seleccion() {
  const navigate = useNavigate();

  return (
    <div className="seleccion-container">
      <div className="contenido">


        <h1>Bienvenido a LeeConGustavito</h1>

        <p className="subtitulo">
          ¿Cómo quieres ingresar?
        </p>

        {/* Imagen de Gustavito */}
        <img
          src="/mascota.png"
          alt="Gustavito"
          className="mascota"
        />

        <div
          className="card docente"
          onClick={() => navigate("/login-docente")}
        >
          <div className="icono">👩‍🏫</div>

          <div>
            <h2>Soy docente</h2>
            <p>Accede al panel de gestión</p>
          </div>
        </div>

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