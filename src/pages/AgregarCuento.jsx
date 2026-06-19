import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/AgregarCuento.css";

export default function AgregarCuento() {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [nivel, setNivel] = useState(1);
  const [emoji, setEmoji] = useState("📖");
  const [preguntas, setPreguntas] = useState([
    { pregunta: "", opciones: ["", "", ""], correcta: 0 },
  ]);

  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  const navigate = useNavigate();

  const agregarPregunta = () => {
    setPreguntas([
      ...preguntas,
      { pregunta: "", opciones: ["", "", ""], correcta: 0 },
    ]);
  };

  const actualizarPregunta = (i, campo, valor) => {
    const nuevas = [...preguntas];
    nuevas[i][campo] = valor;
    setPreguntas(nuevas);
  };

  const actualizarOpcion = (pi, oi, valor) => {
    const nuevas = [...preguntas];
    nuevas[pi].opciones[oi] = valor;
    setPreguntas(nuevas);
  };

  const eliminarPregunta = (i) => {
    setPreguntas(preguntas.filter((_, idx) => idx !== i));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      await addDoc(collection(db, "cuentos"), {
        titulo,
        contenido,
        nivel: parseInt(nivel),
        emoji,
        preguntas: preguntas.filter((p) => p.pregunta.trim() !== ""),
        creadoEn: new Date(),
        creadoPor: auth.currentUser?.uid,
      });

      setExito(true);

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (e) {
      alert("Error al guardar el cuento.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="agregar-cuento-page">

      {/* HEADER */}
      <div className="agregar-header">
        <button
          className="agregar-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ←
        </button>
        <span>Agregar cuento</span>
      </div>

      {/* CONTENIDO */}
      <div className="agregar-container">

        {exito && (
          <div className="success">
            ✅ ¡Cuento guardado! Redirigiendo...
          </div>
        )}

        <form onSubmit={guardar}>

          {/* INFORMACIÓN */}
          <div className="card">
            <div className="section-title">
              Información del cuento
            </div>

            <input
              className="input"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="📖 Emoji"
            />

            <input
              className="input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título del cuento"
              required
            />

            <select
              className="input"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
            >
              <option value={1}>Nivel 1</option>
              <option value={2}>Nivel 2</option>
              <option value={3}>Nivel 3</option>
            </select>

            <textarea
              className="input textarea"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe el cuento..."
              required
            />
          </div>

          {/* PREGUNTAS */}
          <div className="card">

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="section-title">
                Preguntas del quiz
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={agregarPregunta}
              >
                + Agregar
              </button>
            </div>

            {preguntas.map((p, pi) => (
              <div key={pi} className="pregunta-card">

                <div className="pregunta-header">
                  <span className="pregunta-title">
                    Pregunta {pi + 1}
                  </span>

                  {preguntas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarPregunta(pi)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "red",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <input
                  className="input"
                  value={p.pregunta}
                  onChange={(e) =>
                    actualizarPregunta(
                      pi,
                      "pregunta",
                      e.target.value
                    )
                  }
                  placeholder="Escribe la pregunta"
                />

                {p.opciones.map((op, oi) => (
                  <div key={oi} className="opcion-row">

                    <input
                      type="radio"
                      name={`correcta-${pi}`}
                      checked={p.correcta === oi}
                      onChange={() =>
                        actualizarPregunta(pi, "correcta", oi)
                      }
                    />

                    <input
                      className="input"
                      value={op}
                      onChange={(e) =>
                        actualizarOpcion(
                          pi,
                          oi,
                          e.target.value
                        )
                      }
                      placeholder={`Opción ${oi + 1}`}
                    />
                  </div>
                ))}

                <div className="small-text">
                  Marca la opción correcta
                </div>

              </div>
            ))}
          </div>

          {/* BOTÓN GUARDAR */}
          <button
            className="btn-primary"
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : "Guardar cuento 📖"}
          </button>

        </form>

      </div>
    </div>
  );
}