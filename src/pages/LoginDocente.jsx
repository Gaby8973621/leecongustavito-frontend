import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/LoginDocente.css";

export default function LoginDocente() {
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
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/dashboard");
    } catch {
      setError("Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <button
            className="back-circle"
            onClick={() => navigate("/")}
          >
            ← 
        </button>

        <div className="login-logo">
          📖
        </div>

        <h1 className="login-title">
          LeeConGustavito
        </h1>

        <p className="login-subtitle">
          Inicia sesión para continuar
        </p>

        <form
          onSubmit={handleLogin}
          className="login-form"
        >
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
              placeholder="••••••••"
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
            className="login-button"
          >
            {cargando
              ? "Entrando..."
              : "Iniciar sesión"}
          </button>
        </form>

        <p className="registro-texto">
          ¿No tienes cuenta?

          <span
            className="registro-link"
            onClick={() =>
              navigate("/registro")
            }
          >
            Regístrate aquí
          </span>
        </p>

      </div>
    </div>
  );
}