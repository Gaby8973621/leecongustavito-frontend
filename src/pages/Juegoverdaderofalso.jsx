import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/JuegoVerdaderoFalso.css";

/*
   JUEGO: VERDADERO O FALSO
   */

const PREGUNTAS_FALLBACK = [
  {
    texto: "Caperucita Roja visita a su abuela en el bosque.",
    verdadero: true,
    cuento: "Caperucita Roja",
  },
  {
    texto: "El lobo en Caperucita Roja se disfraza de cazador.",
    verdadero: false,
    cuento: "Caperucita Roja",
  },
  {
    texto: "Cenicienta pierde un zapato al huir del baile.",
    verdadero: true,
    cuento: "Cenicienta",
  },
  {
    texto: "El hada madrina transforma una manzana en carroza.",
    verdadero: false,
    cuento: "Cenicienta",
  },
  {
    texto: "Los tres cerditos construyen casas de paja, madera y ladrillo.",
    verdadero: true,
    cuento: "Los tres cerditos",
  },
  {
    texto: "El lobo destruye la casa de ladrillo soplando.",
    verdadero: false,
    cuento: "Los tres cerditos",
  },
  {
    texto: "Pinocho es una marioneta de madera que cobra vida.",
    verdadero: true,
    cuento: "Pinocho",
  },
  {
    texto: "La nariz de Pinocho crece cuando dice la verdad.",
    verdadero: false,
    cuento: "Pinocho",
  },
];

function mezclar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function JuegoVerdaderoFalso({ estudiante, onSalir }) {
  /* ---------- estado ---------- */
  const [preguntas, setPreguntas] = useState([]);
  const [actual, setActual] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [respondida, setRespondida] = useState(false);
  const [seleccion, setSeleccion] = useState(null); // true | false
  const [fase, setFase] = useState("juego"); // "juego" | "fin"
  const [cargando, setCargando] = useState(true);

  /* ---------- cargar preguntas ---------- */
  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDocs(collection(db, "preguntasVF"));
        const desdeFirebase = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const lista =
          desdеFirebase.length > 0 ? desdеFirebase : PREGUNTAS_FALLBACK;

        setPreguntas(mezclar(lista).slice(0, 5));
      } catch {
        setPreguntas(mezclar(PREGUNTAS_FALLBACK).slice(0, 5));
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  /* ---------- responder ---------- */
  const responder = (valor) => {
    if (respondida) return;
    setRespondida(true);
    setSeleccion(valor);

    if (valor === preguntas[actual].verdadero) {
      setPuntos((p) => p + 1);
    }
  };

  /* ---------- siguiente ---------- */
  const siguiente = () => {
    if (actual + 1 >= preguntas.length) {
      guardarResultado();
      setFase("fin");
    } else {
      setActual((a) => a + 1);
      setRespondida(false);
      setSeleccion(null);
    }
  };

  /* ---------- guardar en Firebase ---------- */
  const guardarResultado = async () => {
    if (!estudiante) return;
    try {
      await addDoc(collection(db, "resultadosJuegos"), {
        estudianteId: estudiante.id,
        nombre: estudiante.nombre,
        juego: "verdadero-falso",
        puntaje: puntos,
        total: preguntas.length,
        porcentaje: Math.round((puntos / preguntas.length) * 100),
        fecha: new Date(),
      });
    } catch (e) {
      console.error("Error guardando resultado:", e);
    }
  };

  /* ---------- reiniciar ---------- */
  const reiniciar = () => {
    setPreguntas(mezclar(PREGUNTAS_FALLBACK).slice(0, 5));
    setActual(0);
    setPuntos(0);
    setRespondida(false);
    setSeleccion(null);
    setFase("juego");
  };

  /* ============================================================
     RENDER
     ============================================================ */

  if (cargando) {
    return (
      <div className="vf-loading">
        <p>Cargando preguntas…</p>
      </div>
    );
  }

  /* ---------- pantalla fin ---------- */
  if (fase === "fin") {
    const pct = Math.round((puntos / preguntas.length) * 100);
    const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "⭐" : "📖";

    return (
      <div className="vf-page">
        <div className="vf-fin-card">
          <div className="vf-fin-emoji">{emoji}</div>
          <h2>¡Juego terminado!</h2>
          <p>
            Respondiste <strong>{puntos}</strong> de{" "}
            <strong>{preguntas.length}</strong> correctas ({pct}%)
          </p>

          <div className="vf-fin-acciones">
            <button className="btn-principal" onClick={reiniciar}>
              Jugar de nuevo 🔁
            </button>
            {onSalir && (
              <button className="btn-secundario" onClick={onSalir}>
                Volver a juegos
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- pantalla de juego ---------- */
  const pregunta = preguntas[actual];
  const pct = Math.round((actual / preguntas.length) * 100);

  const claseBtnVerdadero = () => {
    if (!respondida) return "vf-btn";
    if (seleccion === true)
      return pregunta.verdadero ? "vf-btn correcto" : "vf-btn incorrecto";
    if (pregunta.verdadero) return "vf-btn correcto";
    return "vf-btn";
  };

  const claseBtnFalso = () => {
    if (!respondida) return "vf-btn";
    if (seleccion === false)
      return !pregunta.verdadero ? "vf-btn correcto" : "vf-btn incorrecto";
    if (!pregunta.verdadero) return "vf-btn correcto";
    return "vf-btn";
  };

  return (
    <div className="vf-page">
      {/* header */}
      <div className="vf-header">
        {onSalir && (
          <button className="vf-back" onClick={onSalir}>
            ←
          </button>
        )}
        <span className="vf-titulo">Verdadero o Falso</span>
      </div>

      {/* marcador */}
      <div className="vf-score-row">
        <div className="vf-score-card">
          <p className="vf-score-label">Puntos</p>
          <p className="vf-score-num">{puntos}</p>
        </div>
        <div className="vf-score-card">
          <p className="vf-score-label">Pregunta</p>
          <p className="vf-score-num">
            {actual + 1}/{preguntas.length}
          </p>
        </div>
      </div>

      {/* barra de progreso */}
      <div className="vf-progress">
        <div className="vf-progress-inner" style={{ width: `${pct}%` }} />
      </div>

      {/* etiqueta de cuento */}
      {pregunta.cuento && (
        <div className="vf-tag">{pregunta.cuento}</div>
      )}

      {/* tarjeta con la afirmación */}
      <div className="vf-card">
        <p>{pregunta.texto}</p>
      </div>

      {/* botones V / F */}
      <div className="vf-botones">
        <button
          className={claseBtnVerdadero()}
          onClick={() => responder(true)}
          disabled={respondida}
        >
          ✅ Verdadero
        </button>
        <button
          className={claseBtnFalso()}
          onClick={() => responder(false)}
          disabled={respondida}
        >
          ❌ Falso
        </button>
      </div>

      {/* feedback */}
      {respondida && (
        <p className={`vf-feedback ${seleccion === pregunta.verdadero ? "correcto" : "incorrecto"}`}>
          {seleccion === pregunta.verdadero
            ? "¡Correcto! 🎉"
            : `Incorrecto. La respuesta era ${pregunta.verdadero ? "Verdadero" : "Falso"}.`}
        </p>
      )}

      {/* botón siguiente */}
      {respondida && (
        <button className="btn-principal" onClick={siguiente}>
          {actual + 1 >= preguntas.length ? "Ver resultado 🏆" : "Siguiente ➡️"}
        </button>
      )}
    </div>
  );
}