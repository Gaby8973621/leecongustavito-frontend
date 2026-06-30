import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/JuegoVerdaderoFalso.css";

const PREGUNTAS_FALLBACK = [
  { texto: "Caperucita Roja visita a su abuela en el bosque.", verdadero: true, cuento: "Caperucita Roja" },
  { texto: "El lobo en Caperucita Roja se disfraza de cazador.", verdadero: false, cuento: "Caperucita Roja" },
  { texto: "Cenicienta pierde un zapato al huir del baile.", verdadero: true, cuento: "Cenicienta" },
  { texto: "El hada madrina transforma una manzana en carroza.", verdadero: false, cuento: "Cenicienta" },
  { texto: "Los tres cerditos construyen casas de paja, madera y ladrillo.", verdadero: true, cuento: "Los tres cerditos" },
  { texto: "El lobo destruye la casa de ladrillo soplando.", verdadero: false, cuento: "Los tres cerditos" },
  { texto: "Pinocho es una marioneta de madera que cobra vida.", verdadero: true, cuento: "Pinocho" },
  { texto: "La nariz de Pinocho crece cuando dice la verdad.", verdadero: false, cuento: "Pinocho" },
  { texto: "La Sirenita vive bajo el mar con su padre el rey.", verdadero: true, cuento: "La Sirenita" },
  { texto: "Blancanieves vive con siete gigantes en el bosque.", verdadero: false, cuento: "Blancanieves" },
  { texto: "La Bella Durmiente se pincha el dedo con un huso.", verdadero: true, cuento: "La Bella Durmiente" },
  { texto: "El patito feo se convierte en un hermoso flamenco.", verdadero: false, cuento: "El patito feo" },
  { texto: "Ricitos de Oro entra a la casa de los tres osos.", verdadero: true, cuento: "Ricitos de Oro" },
  { texto: "El genio de la lámpara concede cinco deseos a Aladino.", verdadero: false, cuento: "Aladino" },
  { texto: "Peter Pan vive en el País de Nunca Jamás.", verdadero: true, cuento: "Peter Pan" },
];

function mezclar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function JuegoVerdaderoFalso({ estudiante, onSalir }) {
  const [preguntas, setPreguntas] = useState([]);
  const [actual, setActual]       = useState(0);
  const [puntos, setPuntos]       = useState(0);
  const [respondida, setRespondida] = useState(false);
  const [seleccion, setSeleccion] = useState(null);
  const [fase, setFase]           = useState("juego");
  const [cargando, setCargando]   = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDocs(collection(db, "preguntasVF"));
        const desdeFirebase = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const lista = desdeFirebase.length > 0 ? desdeFirebase : PREGUNTAS_FALLBACK;
        setPreguntas(mezclar(lista).slice(0, 5));
      } catch {
        setPreguntas(mezclar(PREGUNTAS_FALLBACK).slice(0, 5));
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const responder = (valor) => {
    if (respondida) return;
    setRespondida(true);
    setSeleccion(valor);
    if (valor === preguntas[actual].verdadero) setPuntos((p) => p + 1);
  };

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

  const guardarResultado = async () => {
    if (!estudiante) return;
    try {
      await addDoc(collection(db, "resultadosJuegos"), {
        estudianteId: estudiante.id,
        nombre:       estudiante.nombre,
        juego:        "verdadero-falso",
        puntaje:      puntos,
        total:        preguntas.length,
        porcentaje:   Math.round((puntos / preguntas.length) * 100),
        fecha:        new Date(),
      });
    } catch (e) {
      console.error("Error guardando resultado:", e);
    }
  };

  const reiniciar = () => {
    setPreguntas(mezclar(PREGUNTAS_FALLBACK).slice(0, 5));
    setActual(0);
    setPuntos(0);
    setRespondida(false);
    setSeleccion(null);
    setFase("juego");
  };

  if (cargando) {
    return <div className="vf-loading"><p>Cargando preguntas…</p></div>;
  }

  /* ── Fin ─────────────────────────────────────────── */
  if (fase === "fin") {
    const pct   = Math.round((puntos / preguntas.length) * 100);
    const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "⭐" : "📖";
    const msg   = pct >= 80 ? "¡Eres un experto!" : pct >= 50 ? "¡Muy bien!" : "¡Sigue practicando!";
    return (
      <div className="vf-page">
        <div className="vf-fin-card">
          <div className="vf-fin-emoji">{emoji}</div>
          <h2>¡Juego terminado!</h2>
          <p className="vf-fin-msg">{msg}</p>
          <p>Respondiste <strong>{puntos}</strong> de <strong>{preguntas.length}</strong> correctas</p>
          <div className="vf-fin-acciones">
            <button className="btn-principal" onClick={reiniciar}>Jugar de nuevo 🔁</button>
            {onSalir && <button className="btn-secundario" onClick={onSalir}>Volver a juegos</button>}
          </div>
        </div>
      </div>
    );
  }

  /* ── Juego ───────────────────────────────────────── */
  const pregunta = preguntas[actual];
  const pct      = Math.round((actual / preguntas.length) * 100);

  const claseBtnVerdadero = () => {
    if (!respondida) return "vf-btn";
    if (seleccion === true) return pregunta.verdadero ? "vf-btn correcto" : "vf-btn incorrecto";
    if (pregunta.verdadero) return "vf-btn correcto";
    return "vf-btn";
  };

  const claseBtnFalso = () => {
    if (!respondida) return "vf-btn";
    if (seleccion === false) return !pregunta.verdadero ? "vf-btn correcto" : "vf-btn incorrecto";
    if (!pregunta.verdadero) return "vf-btn correcto";
    return "vf-btn";
  };

  return (
    <div className="vf-page">
      <div className="vf-header">
        {onSalir && <button className="vf-back" onClick={onSalir}>←</button>}
        <span className="vf-titulo">🧠 Verdadero o Falso</span>
        <span className="vf-contador">{actual + 1} / {preguntas.length}</span>
      </div>

      <div className="vf-score-row">
        <div className="vf-score-card">
          <p className="vf-score-label">Puntos</p>
          <p className="vf-score-num">{puntos}</p>
        </div>
        <div className="vf-score-card">
          <p className="vf-score-label">Pregunta</p>
          <p className="vf-score-num">{actual + 1}/{preguntas.length}</p>
        </div>
      </div>

      <div className="vf-progress">
        <div className="vf-progress-inner" style={{ width: `${pct}%` }} />
      </div>

      {pregunta.cuento && <div className="vf-tag">📖 {pregunta.cuento}</div>}

      <div className="vf-card">
        <p>{pregunta.texto}</p>
      </div>

      <div className="vf-botones">
        <button className={claseBtnVerdadero()} onClick={() => responder(true)} disabled={respondida}>
          ✅ Verdadero
        </button>
        <button className={claseBtnFalso()} onClick={() => responder(false)} disabled={respondida}>
          ❌ Falso
        </button>
      </div>

      {respondida && (
        <p className={`vf-feedback ${seleccion === pregunta.verdadero ? "correcto" : "incorrecto"}`}>
          {seleccion === pregunta.verdadero
            ? "¡Correcto! 🎉"
            : `Incorrecto. Era ${pregunta.verdadero ? "Verdadero ✅" : "Falso ❌"}`}
        </p>
      )}

      {respondida && (
        <button className="btn-principal" onClick={siguiente}>
          {actual + 1 >= preguntas.length ? "Ver resultado 🏆" : "Siguiente ➡️"}
        </button>
      )}
    </div>
  );
}