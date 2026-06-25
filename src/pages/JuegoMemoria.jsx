import { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/JuegoMemoria.css";

/* 
   JUEGO: MEMORIA — Emoji del personaje + cuento al que pertenece
    */

const PARES_FALLBACK = [
  { emoji: "🐷", label: "Cerdito",    cuento: "Los tres cerditos" },
  { emoji: "👸", label: "Cenicienta", cuento: "Cenicienta" },
  { emoji: "🐺", label: "Lobo feroz", cuento: "Caperucita Roja" },
  { emoji: "🦁", label: "Simba",      cuento: "El Rey León" },
  { emoji: "🧚", label: "Campanilla", cuento: "Peter Pan" },
  { emoji: "🤥", label: "Pinocho",    cuento: "Pinocho" },
  { emoji: "🧜", label: "Ariel",         cuento: "La Sirenita" },
  { emoji: "🐸", label: "Príncipe rana", cuento: "La rana encantada" },
  { emoji: "🍎", label: "Bruja",         cuento: "Blancanieves" },
  { emoji: "👰", label: "Rapunzel",      cuento: "Rapunzel" },
  { emoji: "🐻", label: "Oso mayor",     cuento: "Ricitos de Oro" },
  { emoji: "🦆", label: "Patito",        cuento: "El patito feo" },
  { emoji: "🧝", label: "Hada buena",    cuento: "La Bella Durmiente" },
  { emoji: "🐘", label: "Dumbo",         cuento: "Dumbo" },
  { emoji: "🦌", label: "Bambi",         cuento: "Bambi" },
  { emoji: "🧞", label: "Genio",         cuento: "Aladdin" },
  { emoji: "🐚", label: "Úrsula",        cuento: "La Sirenita" },
  { emoji: "🧙🏼‍♂️", label: "Mago",          cuento: "El mago de Oz" },
  { emoji: "🐈", label: "Gato con botas",cuento: "El gato con botas" },
];

function mezclar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function construirCartas(pares) {
  const items = [];
  pares.forEach((p, i) => {
    // carta del personaje
    items.push({ id: i * 2,     par: i, tipo: "personaje", emoji: p.emoji, label: p.label });
    // carta del cuento
    items.push({ id: i * 2 + 1, par: i, tipo: "cuento",    emoji: "📖",    label: p.cuento });
  });
  return mezclar(items);
}

export default function JuegoMemoria({ estudiante, onSalir }) {
  const [cartas, setCartas]           = useState([]);
  const [volteadas, setVolteadas]     = useState([]);
  const [encontradas, setEncontradas] = useState([]);
  const [errores, setErrores]         = useState([]);
  const [bloqueado, setBloqueado]     = useState(false);
  const [intentos, setIntentos]       = useState(0);
  const [segundos, setSegundos]       = useState(0);
  const [fase, setFase]               = useState("juego");
  const [cargando, setCargando]       = useState(true);
  const [totalPares, setTotalPares]   = useState(6);

  const timerRef = useRef(null);

  /* ---------- cargar pares desde Firebase ---------- */
  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDocs(collection(db, "parejasMemoria"));
        const desdeFirebase = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const pares = desdeFirebase.length >= 2 ? desdeFirebase : PARES_FALLBACK;
        const seleccionados = mezclar(pares).slice(0, 6);
        setTotalPares(seleccionados.length);
        setCartas(construirCartas(seleccionados));
      } catch {
        setTotalPares(PARES_FALLBACK.length);
        setCartas(construirCartas(PARES_FALLBACK));
      } finally {
        setCargando(false);
        iniciarTimer();
      }
    };
    cargar();
    return () => clearInterval(timerRef.current);
  }, []);

  const iniciarTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
  };

  /* ---------- voltear carta ---------- */
  const voltear = (idx) => {
    if (bloqueado) return;
    if (volteadas.includes(idx)) return;
    if (encontradas.includes(cartas[idx].id)) return;

    const nuevasVolteadas = [...volteadas, idx];
    setVolteadas(nuevasVolteadas);

    if (nuevasVolteadas.length === 2) {
      setBloqueado(true);
      const [a, b] = nuevasVolteadas;
      const ca = cartas[a];
      const cb = cartas[b];
      const esPareja = ca.par === cb.par && ca.tipo !== cb.tipo;

      setIntentos((i) => i + 1);

      if (esPareja) {
        setTimeout(() => {
          setEncontradas((prev) => [...prev, ca.id, cb.id]);
          setVolteadas([]);
          setBloqueado(false);
        }, 500);
      } else {
        setErrores([ca.id, cb.id]);
        setTimeout(() => {
          setErrores([]);
          setVolteadas([]);
          setBloqueado(false);
        }, 900);
      }
    }
  };

  /* ---------- detectar fin ---------- */
  useEffect(() => {
    if (cartas.length > 0 && encontradas.length === cartas.length) {
      clearInterval(timerRef.current);
      guardarResultado();
      setTimeout(() => setFase("fin"), 400);
    }
  }, [encontradas]);

  /* ---------- guardar en Firebase ---------- */
  const guardarResultado = async () => {
    if (!estudiante) return;
    try {
      await addDoc(collection(db, "resultadosJuegos"), {
        estudianteId: estudiante.id,
        nombre:       estudiante.nombre,
        juego:        "memoria",
        intentos,
        segundos,
        totalPares,
        fecha:        new Date(),
      });
    } catch (e) {
      console.error("Error guardando resultado:", e);
    }
  };

  /* ---------- reiniciar ---------- */
  const reiniciar = () => {
    setCartas(construirCartas(PARES_FALLBACK));
    setVolteadas([]);
    setEncontradas([]);
    setErrores([]);
    setBloqueado(false);
    setIntentos(0);
    setSegundos(0);
    setFase("juego");
    iniciarTimer();
  };

  /* ---------- helpers de clase ---------- */
  const clasesCarta = (carta, idx) => {
    const clases = ["mem-carta"];
    if (encontradas.includes(carta.id))  clases.push("encontrada");
    else if (errores.includes(carta.id)) clases.push("error");
    else if (volteadas.includes(idx))    clases.push("volteada");
    return clases.join(" ");
  };

  const estaVisible = (carta, idx) =>
    volteadas.includes(idx) ||
    encontradas.includes(carta.id) ||
    errores.includes(carta.id);

  const calcularEstrellas = () => {
    if (intentos <= 8)  return "⭐⭐⭐";
    if (intentos <= 12) return "⭐⭐";
    return "⭐";
  };

  /* ============================================================
     RENDER
     ============================================================ */

  if (cargando) {
    return <div className="mem-loading"><p>Cargando juego…</p></div>;
  }

  if (fase === "fin") {
    return (
      <div className="mem-page">
        <div className="mem-fin-card">
          <div className="mem-fin-emoji">🏆</div>
          <h2>¡Encontraste todas las parejas!</h2>
          <p>{intentos} intentos · {segundos} segundos</p>
          <p className="mem-estrellas">{calcularEstrellas()}</p>
          <div className="mem-fin-acciones">
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

  return (
    <div className="mem-page">
      {/* header */}
      <div className="mem-header">
        {onSalir && (
          <button className="mem-back" onClick={onSalir}>←</button>
        )}
        <span className="mem-titulo">🧩 Memoria</span>
      </div>

      {/* estadísticas */}
      <div className="mem-stats">
        <div className="mem-stat">
          <p className="mem-stat-label">Intentos</p>
          <p className="mem-stat-num">{intentos}</p>
        </div>
        <div className="mem-stat">
          <p className="mem-stat-label">Parejas</p>
          <p className="mem-stat-num">{encontradas.length / 2}/{totalPares}</p>
        </div>
        <div className="mem-stat">
          <p className="mem-stat-label">Tiempo</p>
          <p className="mem-stat-num">{segundos}s</p>
        </div>
      </div>

      {/* tablero */}
      <div className="mem-grid">
        {cartas.map((carta, idx) => (
          <div
            key={carta.id}
            className={clasesCarta(carta, idx)}
            onClick={() => voltear(idx)}
          >
            {estaVisible(carta, idx) ? (
              <>
                <span className="mem-carta-emoji">{carta.emoji}</span>
                <span className="mem-carta-label">{carta.label}</span>
              </>
            ) : (
              <span className="mem-dorso">⭐</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}