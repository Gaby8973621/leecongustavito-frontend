import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/JuegoCompletarPalabra.css";

/* ============================================================
   JUEGO: COMPLETA LA PALABRA
   ============================================================ */

const PALABRAS_FALLBACK = [
  { emoji: "🐷", pista: "Animal del cuento Los tres cerditos", palabra: "CERDITO", huecos: [2, 4] },
  { emoji: "👸", pista: "Princesa que perdió su zapato", palabra: "ZAPATO", huecos: [1, 4] },
  { emoji: "🐺", pista: "Animal que sopla las casas", palabra: "LOBO", huecos: [1, 3] },
  { emoji: "🧚", pista: "Hada pequeña de Peter Pan", palabra: "HADA", huecos: [0, 2] },
  { emoji: "🤥", pista: "Le crece la nariz cuando miente", palabra: "NARIZ", huecos: [1, 3] },
  { emoji: "🧜", pista: "Princesa que vive bajo el mar", palabra: "SIRENA", huecos: [2, 5] },
  { emoji: "🍎", pista: "Fruta envenenada de Blancanieves", palabra: "MANZANA", huecos: [1, 4] },
  { emoji: "🦁", pista: "Rey de la selva en El Rey León", palabra: "LEON", huecos: [0, 3] },
  { emoji: "🐸", pista: "Animal en que se convierte el príncipe", palabra: "RANA", huecos: [1, 3] },
  { emoji: "🏰", pista: "Lugar donde viven muchos reyes", palabra: "CASTILLO", huecos: [2, 6] },

  { emoji: "🧙🏼‍♀️", pista: "Objeto mágico de las hadas", palabra: "VARITA", huecos: [1, 4] },
  { emoji: "🧙", pista: "Persona que hace magia", palabra: "MAGO", huecos: [0, 2] },
  { emoji: "🐉", pista: "Criatura fantástica que escupe fuego", palabra: "DRAGON", huecos: [2, 5] },
  { emoji: "👑", pista: "La usa un rey en la cabeza", palabra: "CORONA", huecos: [1, 4] },
  { emoji: "🧞", pista: "Ser mágico que concede deseos", palabra: "GENIO", huecos: [1, 3] },
  { emoji: "💇🏼‍♀️", pista: "Objeto mágico de Blancanieves", palabra: "ESPEJO", huecos: [2, 5] },
  { emoji: "🥿", pista: "Calzado de Cenicienta", palabra: "ZAPATILLA", huecos: [2, 6] },
  { emoji: "🛏️", pista: "Mueble donde durmió la Bella Durmiente", palabra: "CAMA", huecos: [1, 2] },
  { emoji: "🐻", pista: "Animal del cuento Ricitos de Oro", palabra: "OSO", huecos: [0, 2] },
  { emoji: "🌹", pista: "Flor encantada de La Bella y la Bestia", palabra: "ROSA", huecos: [1, 3] },

  { emoji: "🐰", pista: "Animal que corre muy rápido", palabra: "CONEJO", huecos: [2, 5] },
  { emoji: "🦆", pista: "Ave del cuento El Patito Feo", palabra: "PATITO", huecos: [1, 4] },
  { emoji: "🦢", pista: "En lo que se convierte el patito feo", palabra: "CISNE", huecos: [1, 3] },
  { emoji: "🐱", pista: "Personaje de El gato con botas", palabra: "GATO", huecos: [1, 2] },
  { emoji: "👢", pista: "Calzado del gato con botas", palabra: "BOTAS", huecos: [1, 4] },
  { emoji: "🐭", pista: "Animal pequeño amigo de Cenicienta", palabra: "RATON", huecos: [1, 4] },
  { emoji: "✨", pista: "Polvo mágico de las hadas", palabra: "ESTRELLA", huecos: [2, 6] },
  { emoji: "🌳", pista: "Lugar donde viven muchos animales", palabra: "BOSQUE", huecos: [1, 4] },
  { emoji: "🚪", pista: "Se abre para entrar a una casa", palabra: "PUERTA", huecos: [2, 5] },
  { emoji: "🌙", pista: "Aparece en el cielo por la noche", palabra: "LUNA", huecos: [1, 3] }
];

const ABECEDARIO = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","R","S","T","U","V","X"];

function mezclar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generarLetras(palabra, huecos) {
  // letras correctas (las que faltan)
  const correctas = huecos.map((i) => palabra[i]);

  // letras extra aleatorias distintas a las correctas
  const extras = [];
  const disponibles = ABECEDARIO.filter((l) => !correctas.includes(l));
  const mezcladas = mezclar(disponibles);
  for (let i = 0; i < 4 && i < mezcladas.length; i++) {
    extras.push(mezcladas[i]);
  }

  // mezclar todas juntas
  return mezclar([...correctas, ...extras]);
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function JuegoCompletarPalabra({ estudiante, onSalir }) {
  const [palabras, setPalabras]         = useState([]);
  const [actual, setActual]             = useState(0);
  const [correctas, setCorrectas]       = useState(0);
  const [fase, setFase]                 = useState("juego");
  const [cargando, setCargando]         = useState(true);

  const [letras, setLetras]             = useState([]);
  const [colocadas, setColocadas]       = useState({});
  const [letrasUsadas, setLetrasUsadas] = useState([]);
  const [letraSel, setLetraSel]         = useState(null);
  const [estados, setEstados]           = useState({});
  const [feedback, setFeedback]         = useState("");
  const [feedbackTipo, setFeedbackTipo] = useState("");

  /* ---------- cargar palabras ---------- */
  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDocs(collection(db, "palabrasCompletar"));
        const desdeFirebase = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const lista = desdeFirebase.length >= 2 ? desdeFirebase : PALABRAS_FALLBACK;
        setPalabras(mezclar(lista));
      } catch {
        setPalabras(mezclar(PALABRAS_FALLBACK));
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  /* ---------- preparar nueva palabra ---------- */
  useEffect(() => {
    if (palabras.length === 0) return;
    const p = palabras[actual];
    setLetras(generarLetras(p.palabra, p.huecos));
    setColocadas({});
    setLetrasUsadas([]);
    setLetraSel(null);
    setEstados({});
    setFeedback("");
  }, [actual, palabras]);

  const palabraActual = palabras[actual];

  /* ---------- tocar letra ---------- */
  const clickLetra = (letra, idx) => {
    if (letrasUsadas.includes(idx)) return;
    // colocar en primer hueco vacío automáticamente
    const primerVacio = palabraActual.huecos.find((h) => !colocadas[h]);
    if (primerVacio !== undefined) {
      colocarLetra(primerVacio, letra, idx);
    } else {
      // todos llenos, solo seleccionar
      setLetraSel({ letra, idx });
    }
  };

  /* ---------- tocar hueco ---------- */
  const clickHueco = (hueco) => {
    if (letraSel) {
      colocarLetra(hueco, letraSel.letra, letraSel.idx);
    } else if (colocadas[hueco]) {
      // quitar letra del hueco y devolverla
      const letraAnterior = colocadas[hueco];
      const idxAnterior = letras.indexOf(letraAnterior);
      setLetrasUsadas((prev) => prev.filter((i) => i !== idxAnterior));
      setColocadas((prev) => { const n = { ...prev }; delete n[hueco]; return n; });
      setEstados({});
      setFeedback("");
    }
  };

  const colocarLetra = (hueco, letra, idxLetra) => {
    // si el hueco ya tiene letra, devolverla primero
    if (colocadas[hueco]) {
      const letraAnterior = colocadas[hueco];
      const idxAnterior = letras.indexOf(letraAnterior);
      setLetrasUsadas((prev) => prev.filter((i) => i !== idxAnterior));
    }
    setColocadas((prev) => ({ ...prev, [hueco]: letra }));
    setLetrasUsadas((prev) => [...prev, idxLetra]);
    setLetraSel(null);
    setEstados({});
    setFeedback("");
  };

  /* ---------- limpiar ---------- */
  const limpiar = () => {
    setColocadas({});
    setLetrasUsadas([]);
    setLetraSel(null);
    setEstados({});
    setFeedback("");
  };

  /* ---------- verificar ---------- */
  const verificar = () => {
    const p = palabraActual;
    const nuevosEstados = {};
    let todoCorrecto = true;

    p.huecos.forEach((h) => {
      if (colocadas[h] === p.palabra[h]) {
        nuevosEstados[h] = "correcto";
      } else {
        nuevosEstados[h] = "incorrecto";
        todoCorrecto = false;
      }
    });

    setEstados(nuevosEstados);

    if (todoCorrecto) {
      setFeedback("¡Correcto! 🎉");
      setFeedbackTipo("ok");
      const nuevasCorrectas = correctas + 1;
      setCorrectas(nuevasCorrectas);
      setTimeout(() => {
        if (actual + 1 >= palabras.length) {
          guardarResultado(nuevasCorrectas);
          setFase("fin");
        } else {
          setActual((a) => a + 1);
        }
      }, 1200);
    } else {
      setFeedback("Alguna letra no es correcta, ¡inténtalo de nuevo!");
      setFeedbackTipo("mal");
    }
  };

  /* ---------- guardar en Firebase ---------- */
  const guardarResultado = async (totalCorrectas) => {
    if (!estudiante) return;
    try {
      await addDoc(collection(db, "resultadosJuegos"), {
        estudianteId: estudiante.id,
        nombre:       estudiante.nombre,
        juego:        "completar-palabra",
        correctas:    totalCorrectas,
        total:        palabras.length,
        porcentaje:   Math.round((totalCorrectas / palabras.length) * 100),
        fecha:        new Date(),
      });
    } catch (e) {
      console.error("Error guardando resultado:", e);
    }
  };

  /* ---------- reiniciar ---------- */
  const reiniciar = () => {
    setPalabras(mezclar(PALABRAS_FALLBACK));
    setActual(0);
    setCorrectas(0);
    setFase("juego");
  };

  const claseHueco = (hueco) => {
    const clases = ["cp-celda", "hueco"];
    if (estados[hueco] === "correcto")      clases.push("correcto");
    else if (estados[hueco] === "incorrecto") clases.push("incorrecto");
    else if (colocadas[hueco])              clases.push("lleno");
    return clases.join(" ");
  };

  const todoLleno = palabraActual?.huecos.every((h) => colocadas[h]);

  /* ============================================================
     RENDER
     ============================================================ */

  if (cargando) {
    return <div className="cp-loading"><p>Cargando juego…</p></div>;
  }

  /* ---------- fin ---------- */
  if (fase === "fin") {
    const emoji = correctas === palabras.length ? "🏆" : correctas >= palabras.length / 2 ? "⭐" : "📖";
    return (
      <div className="cp-page">
        <div className="cp-fin-card">
          <div className="cp-fin-emoji">{emoji}</div>
          <h2>¡Juego terminado!</h2>
          <p>Completaste {correctas} de {palabras.length} palabras correctamente</p>
          <div className="cp-fin-acciones">
            <button className="btn-principal" onClick={reiniciar}>Jugar de nuevo 🔁</button>
            {onSalir && (
              <button className="btn-secundario" onClick={onSalir}>Volver a juegos</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const p = palabraActual;

  /* ---------- juego ---------- */
  return (
    <div className="cp-page">
      <div className="cp-header">
        {onSalir && <button className="cp-back" onClick={onSalir}>←</button>}
        <span className="cp-titulo">✏️ Completa la Palabra</span>
      </div>

      <div className="cp-stats">
        <div className="cp-stat">
          <p className="cp-stat-label">Puntos</p>
          <p className="cp-stat-num">{correctas}</p>
        </div>
        <div className="cp-stat">
          <p className="cp-stat-label">Palabra</p>
          <p className="cp-stat-num">{actual + 1}/{palabras.length}</p>
        </div>
      </div>

      <div className="cp-progreso">
        {palabras.map((_, i) => (
          <div key={i} className={`cp-punto ${i < actual ? "hecho" : i === actual ? "actual" : ""}`} />
        ))}
      </div>

      <div className="cp-personaje">
        <div className="cp-personaje-emoji">{p.emoji}</div>
        <div className="cp-pista">{p.pista}</div>
      </div>

      {/* palabra */}
      <div className="cp-palabra">
        {p.palabra.split("").map((letra, i) =>
          !p.huecos.includes(i) ? (
            <div key={i} className="cp-celda fija">{letra}</div>
          ) : (
            <div key={i} className={claseHueco(i)} onClick={() => clickHueco(i)}>
              {colocadas[i] || ""}
            </div>
          )
        )}
      </div>

      {/* letras disponibles */}
      <p className="cp-letras-titulo">Toca una letra para colocarla</p>
      <div className="cp-letras">
        {letras.map((l, i) => (
          <div
            key={i}
            className={`cp-letra${letrasUsadas.includes(i) ? " usada" : ""}${letraSel?.idx === i ? " seleccionada" : ""}`}
            onClick={() => clickLetra(l, i)}
          >
            {l}
          </div>
        ))}
      </div>

      {feedback && (
        <p className={`cp-feedback ${feedbackTipo}`}>{feedback}</p>
      )}

      {todoLleno && (
        <button className="btn-principal" onClick={verificar}>Verificar ✅</button>
      )}
      <button className="btn-secundario" onClick={limpiar}>Limpiar 🔄</button>
    </div>
  );
}