import { useState, useEffect, useCallback } from "react";
import "../styles/JuegoOrdenaPalabra.css";

const PALABRAS = [
  { emoji: "🐷", palabra: "CERDITO" },
  { emoji: "👠", palabra: "ZAPATO" },
  { emoji: "🐺", palabra: "LOBO" },
  { emoji: "🤥", palabra: "NARIZ" },
  { emoji: "🧜", palabra: "SIRENA" },
  { emoji: "🍎", palabra: "MANZANA" },
  { emoji: "🦁", palabra: "LEON" },
  { emoji: "🐸", palabra: "RANA" },
  { emoji: "🏰", palabra: "CASTILLO" },
  { emoji: "🧙", palabra: "MAGO" },
  { emoji: "🐉", palabra: "DRAGON" },
  { emoji: "👑", palabra: "CORONA" },
  { emoji: "🧞", palabra: "GENIO" },
  { emoji: "🥿", palabra: "ZAPATILLA" },
  { emoji: "🐻", palabra: "OSO" },
  { emoji: "🌹", palabra: "ROSA" },
];

const TOTAL_RONDAS = 5;

function splitSeguro(str) {
  return [...str.matchAll(/\p{L}|\p{N}/gu)].map(m => m[0]);
}

// Tomar 5 palabras aleatorias sin repetir
function seleccionarPalabras() {
  const mezcladas = [...PALABRAS].sort(() => Math.random() - 0.5);
  return mezcladas.slice(0, TOTAL_RONDAS);
}

export default function JuegoOrdenaPalabra({ onSalir }) {
  const [cola, setCola]             = useState([]);
  const [ronda, setRonda]           = useState(0);
  const [actual, setActual]         = useState(null);
  const [letras, setLetras]         = useState([]);
  const [respuesta, setRespuesta]   = useState([]);
  const [ganaste, setGanaste]       = useState(false);
  const [fase, setFase]             = useState("juego"); // "juego" | "fin"
  const [correctas, setCorrectas]   = useState(0);

  const cargarRonda = useCallback((listaCola, numRonda) => {
    const item = listaCola[numRonda];
    setActual(item);

    const letrasConId = splitSeguro(item.palabra).map((letra, index) => ({
      id: `${index}-${Math.random().toString(36).slice(2)}`,
      letra,
    }));

    const mezcladas = [...letrasConId];
    for (let i = mezcladas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
    }

    setLetras(mezcladas);
    setRespuesta([]);
    setGanaste(false);
  }, []);

  // Iniciar juego
  const iniciar = useCallback(() => {
    const nuevaCola = seleccionarPalabras();
    setCola(nuevaCola);
    setRonda(0);
    setCorrectas(0);
    setFase("juego");
    cargarRonda(nuevaCola, 0);
  }, [cargarRonda]);

  useEffect(() => { iniciar(); }, [iniciar]);

  const seleccionar = (item) => {
    if (ganaste) return;
    setRespuesta((prev) => [...prev, item]);
    setLetras((prev) => prev.filter((l) => l.id !== item.id));
  };

  const deseleccionar = (item) => {
    if (ganaste) return;
    setLetras((prev) => [...prev, item]);
    setRespuesta((prev) => prev.filter((r) => r.id !== item.id));
  };

  // Verificar victoria de la ronda
  useEffect(() => {
    if (!actual || respuesta.length === 0) return;
    const palabraFormada = respuesta.map((r) => r.letra).join("");
    if (palabraFormada === actual.palabra) {
      setGanaste(true);
      setCorrectas((prev) => prev + 1);
    }
  }, [respuesta, actual]);

  const siguienteRonda = () => {
    const siguienteNum = ronda + 1;
    if (siguienteNum >= TOTAL_RONDAS) {
      setFase("fin");
    } else {
      setRonda(siguienteNum);
      cargarRonda(cola, siguienteNum);
    }
  };

  const totalLetras = actual ? splitSeguro(actual.palabra).length : 0;

  // ── Pantalla de fin ──────────────────────────────────────────────────
  if (fase === "fin") {
    const emoji = correctas === TOTAL_RONDAS ? "🏆" : correctas >= 3 ? "⭐" : "📖";
    return (
      <div className="ord-page">
        <div className="ord-card">
          <div className="ord-emoji">{emoji}</div>
          <h2 className="victoria-titulo">¡Juego terminado!</h2>
          <p className="victoria-palabra">
            Ordenaste <strong>{correctas} de {TOTAL_RONDAS}</strong> palabras correctamente
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px", width: "100%" }}>
            <button onClick={iniciar} className="btn-siguiente">Jugar de nuevo 🔁</button>
            {onSalir && <button onClick={onSalir} className="btn-back" style={{ width: "100%", borderRadius: "12px" }}>Volver ←</button>}
          </div>
        </div>
      </div>
    );
  }

  // ── Juego ────────────────────────────────────────────────────────────
  return (
    <div className="ord-page">
      <header className="ord-header">
        <button onClick={onSalir} className="btn-back" aria-label="Volver">←</button>
        <span className="ord-header-title">🔤 Ordena la palabra</span>
        <span className="ord-header-title" style={{ marginLeft: "auto", fontSize: "1rem", color: "#7c3aed" }}>
          {ronda + 1} / {TOTAL_RONDAS}
        </span>
      </header>

      <div className="ord-card">
        <div className="ord-emoji" aria-hidden="true">{actual?.emoji}</div>
        <p className="ord-instruccion">Forma la palabra correcta</p>

        <div className="respuesta-container" role="group" aria-label="Letras seleccionadas">
          {respuesta.map((item) => (
            <button key={item.id} className="casilla" onClick={() => deseleccionar(item)} title="Quitar letra">
              {item.letra}
            </button>
          ))}
          {Array(totalLetras - respuesta.length).fill(null).map((_, i) => (
            <div key={`vacio-${i}`} className="casilla vacia" aria-hidden="true" />
          ))}
        </div>

        <div className="letras-disponibles" role="group" aria-label="Letras disponibles">
          {letras.map((item) => (
            <button key={item.id} className="letra-btn" onClick={() => seleccionar(item)}>
              {item.letra}
            </button>
          ))}
        </div>

        {ganaste && (
          <div className="victoria" role="status">
            <div className="victoria-icon">🎉</div>
            <h2 className="victoria-titulo">¡Muy bien!</h2>
            <p className="victoria-palabra">La palabra es: <strong>{actual.palabra}</strong></p>
            <button onClick={siguienteRonda} className="btn-siguiente">
              {ronda + 1 < TOTAL_RONDAS ? "Siguiente →" : "Ver resultado 🏆"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}