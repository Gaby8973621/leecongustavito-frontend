import { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/JuegoOrdenaHistoria.css";

/* JUEGO: ORDENA LA HISTORIA*/

const HISTORIAS_FALLBACK = [
  {
    titulo: "Caperucita Roja",
    emoji: "🐺",
    pasos: [
      "Caperucita sale de su casa con una canasta para su abuela.",
      "En el bosque, el lobo le pregunta a dónde va.",
      "El lobo llega primero a casa de la abuela y se disfraza.",
      "El cazador rescata a Caperucita y a su abuela del lobo.",
    ],
  },
  {
    titulo: "Los tres cerditos",
    emoji: "🐷",
    pasos: [
      "Los tres cerditos se van de casa para construir la suya.",
      "El primer cerdito construye su casa de paja.",
      "El lobo sopla y derrumba las casas de paja y madera.",
      "Los cerditos se refugian en la casa de ladrillo y el lobo no puede derribarla.",
    ],
  },
  {
    titulo: "Cenicienta",
    emoji: "👸",
    pasos: [
      "Cenicienta limpia la casa mientras sus hermanastras se van al baile.",
      "El hada madrina convierte la calabaza en una carroza.",
      "Cenicienta baila con el príncipe en el palacio.",
      "El príncipe encuentra a Cenicienta con el zapato de cristal.",
    ],
  },
  {
    titulo: "Pinocho",
    emoji: "🤥",
    pasos: [
      "Geppetto talla una marioneta de madera llamada Pinocho.",
      "El hada azul le da vida a Pinocho.",
      "Pinocho miente y su nariz crece.",
      "Pinocho demuestra ser valiente y se convierte en un niño de verdad.",
    ],
  },
  {
    titulo: "Blancanieves",
    emoji: "🍎",
    pasos: [
      "La reina ordena matar a Blancanieves.",
      "Blancanieves huye al bosque y encuentra a los siete enanitos.",
      "La reina la engaña con una manzana envenenada.",
      "El príncipe la despierta con un beso de amor verdadero.",
    ],
  },
  {
    titulo: "La Sirenita",
    emoji: "🧜",
    pasos: [
      "Ariel vive en el fondo del mar con su familia.",
      "Ariel salva a un príncipe humano y se enamora.",
      "La bruja Úrsula le quita la voz a cambio de piernas.",
      "Ariel logra romper el hechizo y vivir en la superficie.",
    ],
  },
  {
    titulo: "El Patito Feo",
    emoji: "🦆",
    pasos: [
      "Un patito es rechazado por ser diferente.",
      "El patito huye y vive solo durante el invierno.",
      "El patito crece y se transforma en un cisne.",
      "Descubre que siempre fue un cisne hermoso.",
    ],
  },
  {
    titulo: "Aladino",
    emoji: "🪔",
    pasos: [
      "Aladino encuentra una lámpara mágica.",
      "El genio le concede deseos.",
      "El villano intenta robar la lámpara.",
      "Aladino salva el reino y se queda con la princesa.",
    ],
  },
];

function mezclar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/*
   COMPONENTE PRINCIPAL
 */
export default function JuegoOrdenaHistoria({ estudiante, onSalir }) {
  const [historias, setHistorias]     = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [fase, setFase]               = useState("seleccion"); // seleccion | juego | fin
  const [historiaActiva, setHistoriaActiva] = useState(null);
  const [orden, setOrden]             = useState([]);
  const [estados, setEstados]         = useState([]); // "correcta" | "incorrecta" | ""
  const [intentos, setIntentos]       = useState(0);
  const [correctas, setCorrectas]     = useState(0);
  const [feedback, setFeedback]       = useState("");
  const [feedbackTipo, setFeedbackTipo] = useState(""); // "ok" | "mal"
  const dragIdx = useRef(null);

  const obtenerAleatorias = (lista, cantidad = 2) => {
  return [...lista]
    .sort(() => Math.random() - 0.5)
    .slice(0, cantidad);
};
  /* ---------- cargar historias ---------- */
  useEffect(() => {
  const cargar = async () => {
    try {
      const snap = await getDocs(collection(db, "historiasOrden"));
      const desdeFirebase = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const base =
        desdeFirebase.length > 0
          ? desdeFirebase
          : HISTORIAS_FALLBACK;

      setHistorias(obtenerAleatorias(base, 2));
    } catch {
      setHistorias(obtenerAleatorias(HISTORIAS_FALLBACK, 2));
    } finally {
      setCargando(false);
    }
  };

  cargar();
}, []);

  /* ---------- elegir historia ---------- */
  const elegir = (historia) => {
    setHistoriaActiva(historia);
    setOrden(mezclar([...Array(historia.pasos.length).keys()]));
    setEstados(Array(historia.pasos.length).fill(""));
    setIntentos(0);
    setCorrectas(0);
    setFeedback("");
    setFase("juego");
  };

  /* ---------- drag & drop ---------- */
  const onDragStart = (idx) => { dragIdx.current = idx; };

  const onDrop = (idx) => {
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const nuevo = [...orden];
    [nuevo[dragIdx.current], nuevo[idx]] = [nuevo[idx], nuevo[dragIdx.current]];
    setOrden(nuevo);
    setEstados(Array(historiaActiva.pasos.length).fill(""));
    setFeedback("");
    dragIdx.current = null;
  };

  /* ---------- verificar ---------- */
  const verificar = () => {
    const nuevosEstados = orden.map((pasoIdx, pos) =>
      pasoIdx === pos ? "correcta" : "incorrecta"
    );
    const numCorrectas = nuevosEstados.filter((e) => e === "correcta").length;
    const total = historiaActiva.pasos.length;

    setEstados(nuevosEstados);
    setIntentos((i) => i + 1);
    setCorrectas(numCorrectas);

    if (numCorrectas === total) {
      setFeedback("¡Perfecto! Ordenaste todo correctamente 🎉");
      setFeedbackTipo("ok");
      guardarResultado(intentos + 1);
      setTimeout(() => setFase("fin"), 1200);
    } else {
      setFeedback(`${numCorrectas} de ${total} en el lugar correcto. ¡Sigue intentando!`);
      setFeedbackTipo("mal");
    }
  };

  /* ---------- guardar en Firebase ---------- */
  const guardarResultado = async (totalIntentos) => {
    if (!estudiante) return;
    try {
      await addDoc(collection(db, "resultadosJuegos"), {
        estudianteId:  estudiante.id,
        nombre:        estudiante.nombre,
        juego:         "ordena-historia",
        tituloCuento:  historiaActiva.titulo,
        intentos:      totalIntentos,
        fecha:         new Date(),
      });
    } catch (e) {
      console.error("Error guardando resultado:", e);
    }
  };

  /* RENDER */

  if (cargando) {
    return <div className="oh-loading"><p>Cargando historias…</p></div>;
  }

  /* ---------- pantalla selección ---------- */
  if (fase === "seleccion") {
    return (
      <div className="oh-page">
        <div className="oh-header">
          {onSalir && (
            <button className="oh-back" onClick={onSalir}>←</button>
          )}
          <span className="oh-titulo">📖 Ordena la Historia</span>
        </div>
        <p className="oh-instruccion">Elige un cuento para ordenar</p>
        <div className="oh-sel-grid">
          {historias.map((h, i) => (
            <div key={i} className="oh-sel-card" onClick={() => elegir(h)}>
              <div className="oh-sel-emoji">{h.emoji}</div>
              <div className="oh-sel-titulo">{h.titulo}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- pantalla fin ---------- */
  if (fase === "fin") {
    const emoji = intentos === 1 ? "🏆" : intentos <= 3 ? "⭐" : "📖";
    return (
      <div className="oh-page">
        <div className="oh-fin-card">
          <div className="oh-fin-emoji">{emoji}</div>
          <h2>¡Historia ordenada!</h2>
          <p>
            Lo lograste en {intentos} {intentos === 1 ? "intento" : "intentos"}
          </p>
          <div className="oh-fin-acciones">
            <button className="btn-principal" onClick={() => elegir(historiaActiva)}>
              Jugar de nuevo 🔁
            </button>
            <button className="btn-secundario" onClick={() => setFase("seleccion")}>
              Elegir otro cuento
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

  /* ---------- pantalla juego ---------- */
  return (
    <div className="oh-page">
      <div className="oh-header">
        <button className="oh-back" onClick={() => setFase("seleccion")}>←</button>
        <span className="oh-titulo">📖 Ordena la Historia</span>
      </div>

      <div className="oh-cuento-tag">
        {historiaActiva.emoji} {historiaActiva.titulo}
      </div>

      <div className="oh-stats">
        <div className="oh-stat">
          <p className="oh-stat-label">Intentos</p>
          <p className="oh-stat-num">{intentos}</p>
        </div>
        <div className="oh-stat">
          <p className="oh-stat-label">Correctas</p>
          <p className="oh-stat-num">{correctas}/{historiaActiva.pasos.length}</p>
        </div>
      </div>

      <p className="oh-instruccion">Arrastra las oraciones en el orden correcto</p>

      <div className="oh-zona">
        {orden.map((pasoIdx, pos) => (
          <div
            key={pos}
            className={`oh-carta ${estados[pos] || ""}`}
            draggable
            onDragStart={() => onDragStart(pos)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(pos)}
          >
            <div className="oh-num">{pos + 1}</div>
            <div className="oh-texto">{historiaActiva.pasos[pasoIdx]}</div>
            <div className="oh-handle">⠿</div>
          </div>
        ))}
      </div>

      {feedback && (
        <p className={`oh-feedback ${feedbackTipo}`}>{feedback}</p>
      )}

      <button className="btn-principal" onClick={verificar}>
        Verificar orden ✅
      </button>
    </div>
  );
}