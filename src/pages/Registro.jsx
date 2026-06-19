import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/Registro.css";

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
      const credencial =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const codigoAula = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      await setDoc(
        doc(db, "docentes", credencial.user.uid),
        {
          nombre,
          grado,
          email,
          codigoAula,
          creadoEn: new Date(),
        }
      );

      navigate("/dashboard");
    } catch {
      setError(
        "Error al crear la cuenta. Verifica los datos."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">

        <button
          className="back-circle"
          onClick={() => navigate("/login-docente")}
        >
          ← 
        </button>

        <div className="registro-logo">
          👩‍🏫
        </div>

        <h1 className="registro-title">
          Crear cuenta
        </h1>

        <p className="registro-subtitle">
          Regístrate como docente
        </p>

        <form
          onSubmit={handleRegistro}
          className="registro-form"
        >
          <div className="form-group">
            <label>Nombre completo</label>

            <input
              type="text"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Ana García"
              required
            />
          </div>

          <div className="form-group">
            <label>Grado que imparte</label>

            <select
              value={grado}
              onChange={(e) =>
                setGrado(e.target.value)
              }
              required
            >
              <option value="">
                Seleccionar grado...
              </option>

              <option>
                1° Grado
              </option>

              <option>
                2° Grado
              </option>

              <option>
                3° Grado
              </option>

              <option>
                4° Grado
              </option>

              <option>
                5° Grado
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="registro-button"
          >
            {cargando
              ? "Creando cuenta..."
              : "Registrarse"}
          </button>
        </form>

        <p className="login-texto">
          ¿Ya tienes cuenta?

          <span
            className="login-link"
            onClick={() =>
              navigate("/login-docente")
            }
          >
            Inicia sesión
          </span>
        </p>

      </div>
    </div>
  );
}