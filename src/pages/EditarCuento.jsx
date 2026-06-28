import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";

export default function EditarCuento() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [nivel, setNivel] = useState(1);
  const [preguntas, setPreguntas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const snap = await getDoc(doc(db, "cuentos", id));
      if (snap.exists()) {
        const d = snap.data();
        setTitulo(d.titulo);
        setContenido(d.contenido);
        setNivel(d.nivel);
        setPreguntas(d.preguntas || []);
      }
      setCargando(false);
    };
    cargar();
  }, [id]);

  const agregarPregunta = () => {
    setPreguntas([...preguntas, { pregunta: "", opciones: ["", "", ""], correcta: 0 }]);
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
      await updateDoc(doc(db, "cuentos", id), {
        titulo,
        contenido,
        nivel: parseInt(nivel),
        preguntas: preguntas.filter((p) => p.pregunta.trim() !== ""),
        editadoEn: new Date(),
      });
      setExito(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (e) {
      alert("Error al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="agregar-cuento-page">
        <p style={{ padding: "2rem" }}>Cargando cuento...</p>
      </div>
    );
  }

  return (
    <div className="agregar-cuento-page">

      <div className="agregar-header">
        <button className="agregar-back-btn" onClick={() => navigate("/dashboard")}>←</button>
        <span>Editar cuento</span>
      </div>

      <div className="agregar-container">

        {exito && (
          <div className="success">✅ ¡Cambios guardados! Redirigiendo...</div>
        )}

        <form onSubmit={guardar}>

          <div className="card">
            <div className="section-title">Información del cuento</div>


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

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="section-title">Preguntas del quiz</div>
              <button type="button" className="btn-secondary" onClick={agregarPregunta}>
                + Agregar
              </button>
            </div>

            {preguntas.map((p, pi) => (
              <div key={pi} className="pregunta-card">
                <div className="pregunta-header">
                  <span className="pregunta-title">Pregunta {pi + 1}</span>
                  {preguntas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarPregunta(pi)}
                      style={{ background: "none", border: "none", color: "red", cursor: "pointer", fontSize: "12px" }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <input
                  className="input"
                  value={p.pregunta}
                  onChange={(e) => actualizarPregunta(pi, "pregunta", e.target.value)}
                  placeholder="Escribe la pregunta"
                />

                {p.opciones.map((op, oi) => (
                  <div key={oi} className="opcion-row">
                    <input
                      type="radio"
                      name={`correcta-${pi}`}
                      checked={p.correcta === oi}
                      onChange={() => actualizarPregunta(pi, "correcta", oi)}
                    />
                    <input
                      className="input"
                      value={op}
                      onChange={(e) => actualizarOpcion(pi, oi, e.target.value)}
                      placeholder={`Opción ${oi + 1}`}
                    />
                  </div>
                ))}

                <div className="small-text">Marca la opción correcta</div>
              </div>
            ))}
          </div>

          <button className="btn-primary" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios 📖"}
          </button>

        </form>
      </div>
    </div>
  );
}