import { useState, useEffect, useCallback } from "react";
import "../styles/JuegoAdivinaCuento.css";

const TOTAL_RONDAS = 5;

const PREGUNTAS = [
  {
    frase: "\"Soplé y soplé y la casa se cayó... pero la de ladrillos no pude tumbarla.\"",
    respuesta: "Los tres cerditos",
    opciones: ["Los tres cerditos", "Caperucita Roja", "El patito feo", "Ricitos de Oro"],
  },
  {
    frase: "\"Abuelita, qué ojos tan grandes tienes... Son para verte mejor.\"",
    respuesta: "Caperucita Roja",
    opciones: ["Blancanieves", "Caperucita Roja", "La Sirenita", "Cenicienta"],
  },
  {
    frase: "\"Espejito, espejito mágico, ¿quién es la más bella del reino?\"",
    respuesta: "Blancanieves",
    opciones: ["Blancanieves", "La Bella Durmiente", "Cenicienta", "Rapunzel"],
  },
  {
    frase: "\"A medianoche el hechizo se romperá y todo volverá a ser como antes.\"",
    respuesta: "Cenicienta",
    opciones: ["La Bella Durmiente", "Cenicienta", "Blancanieves", "La Sirenita"],
  },
  {
    frase: "\"Pinchó su dedo con el huso y cayó en un profundo sueño junto a todo el castillo.\"",
    respuesta: "La Bella Durmiente",
    opciones: ["Blancanieves", "Cenicienta", "La Bella Durmiente", "Rapunzel"],
  },
  {
    frase: "\"Quiero tener piernas para caminar en la tierra y conocer al príncipe.\"",
    respuesta: "La Sirenita",
    opciones: ["La Sirenita", "Cenicienta", "Rapunzel", "La Bella y la Bestia"],
  },
  {
    frase: "\"Deja que suba por tu largo cabello dorado.\"",
    respuesta: "Rapunzel",
    opciones: ["Rapunzel", "Blancanieves", "La Sirenita", "Cenicienta"],
  },
  {
    frase: "\"Cuando miento me crece la nariz y no puedo esconder la verdad.\"",
    respuesta: "Pinocho",
    opciones: ["Pinocho", "Peter Pan", "El gato con botas", "Aladino"],
  },
  {
    frase: "\"¡Si no quieres crecer nunca, ven conmigo al País de Nunca Jamás!\"",
    respuesta: "Peter Pan",
    opciones: ["Peter Pan", "Pinocho", "Aladino", "El mago de Oz"],
  },
  {
    frase: "\"Te concedo tres deseos, pero no puedo hacer que alguien te quiera.\"",
    respuesta: "Aladino",
    opciones: ["Aladino", "Peter Pan", "Pinocho", "El Rey León"],
  },
  {
    frase: "\"Ricitos probó la cama pequeña y era perfecta. Se quedó dormida enseguida.\"",
    respuesta: "Ricitos de Oro",
    opciones: ["Ricitos de Oro", "Caperucita Roja", "Blancanieves", "Cenicienta"],
  },
  {
    frase: "\"Nadie me quería porque era diferente... hasta que descubrí que era un hermoso cisne.\"",
    respuesta: "El patito feo",
    opciones: ["El patito feo", "Los tres cerditos", "Pinocho", "Bambi"],
  },
  {
    frase: "\"Con mis botas y mi sombrero engañé al ogro y salvé al reino entero.\"",
    respuesta: "El gato con botas",
    opciones: ["El gato con botas", "Pinocho", "Peter Pan", "Aladino"],
  },
  {
    frase: "\"La rosa estaba encantada. Si no encontraba amor antes de que cayera el último pétalo...\"",
    respuesta: "La Bella y la Bestia",
    opciones: ["La Bella y la Bestia", "Blancanieves", "La Sirenita", "Cenicienta"],
  },
  {
    frase: "\"Hakuna Matata significa que no hay problema. ¡Así vivimos sin preocupaciones!\"",
    respuesta: "El Rey León",
    opciones: ["El Rey León", "Bambi", "Aladino", "Peter Pan"],
  },
  {
    frase: "\"El lobo llegó al bosque y vio a la niña con su capa roja caminando sola.\"",
    respuesta: "Caperucita Roja",
    opciones: ["Caperucita Roja", "Blancanieves", "Los tres cerditos", "Ricitos de Oro"],
  },
  {
    frase: "\"Construí mi casa de paja muy rápido... pero el lobo la derribó de un soplido.\"",
    respuesta: "Los tres cerditos",
    opciones: ["Los tres cerditos", "Caperucita Roja", "El patito feo", "Pinocho"],
  },
  {
    frase: "\"El hada madrina agitó su varita y el zapato de cristal apareció en su pie.\"",
    respuesta: "Cenicienta",
    opciones: ["Cenicienta", "Blancanieves", "La Bella Durmiente", "Rapunzel"],
  },
  {
    frase: "\"Simba huyó del reino después de que su tío le mintió sobre la muerte de su padre.\"",
    respuesta: "El Rey León",
    opciones: ["El Rey León", "Aladino", "Peter Pan", "Bambi"],
  },
  {
    frase: "\"La bruja le ofreció una manzana roja y brillante... y ella la mordió sin saber el peligro.\"",
    respuesta: "Blancanieves",
    opciones: ["Blancanieves", "Caperucita Roja", "Cenicienta", "Rapunzel"],
  },
];

function seleccionarPreguntas() {
  return [...PREGUNTAS].sort(() => Math.random() - 0.5).slice(0, TOTAL_RONDAS);
}

export default function JuegoAdivinaCuento({ onSalir }) {
  const [cola, setCola]           = useState([]);
  const [ronda, setRonda]         = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [confirmado, setConfirmado] = useState(false);
  const [correctas, setCorrectas] = useState(0);
  const [fase, setFase]           = useState("juego");

  const iniciar = useCallback(() => {
    setCola(seleccionarPreguntas());
    setRonda(0);
    setCorrectas(0);
    setSeleccion(null);
    setConfirmado(false);
    setFase("juego");
  }, []);

  useEffect(() => { iniciar(); }, [iniciar]);

  const preguntaActual = cola[ronda];

  const elegir = (opcion) => {
    if (confirmado) return;
    setSeleccion(opcion);
  };

  const confirmar = () => {
    if (!seleccion || confirmado) return;
    setConfirmado(true);
    if (seleccion === preguntaActual.respuesta) {
      setCorrectas((prev) => prev + 1);
    }
  };

  const siguiente = () => {
    const sig = ronda + 1;
    if (sig >= TOTAL_RONDAS) {
      setFase("fin");
    } else {
      setRonda(sig);
      setSeleccion(null);
      setConfirmado(false);
    }
  };

  const claseOpcion = (opcion) => {
    if (!confirmado) return seleccion === opcion ? "opcion seleccionada" : "opcion";
    if (opcion === preguntaActual.respuesta) return "opcion correcta";
    if (opcion === seleccion) return "opcion incorrecta";
    return "opcion";
  };

  // ── Fin ─────────────────────────────────────────────────────────────
  if (fase === "fin") {
    const emoji = correctas === TOTAL_RONDAS ? "🏆" : correctas >= 3 ? "⭐" : "📖";
    const mensaje = correctas === TOTAL_RONDAS
      ? "¡Eres un experto en cuentos!"
      : correctas >= 3
      ? "¡Muy bien, conoces los cuentos!"
      : "¡Sigue leyendo y lo harás mejor!";
    return (
      <div className="ac-page">
        <div className="ac-card">
          <div className="ac-fin-emoji">{emoji}</div>
          <h2 className="ac-fin-titulo">¡Juego terminado!</h2>
          <p className="ac-fin-sub">{mensaje}</p>
          <p className="ac-fin-puntaje">
            Adivinaste <strong>{correctas} de {TOTAL_RONDAS}</strong> cuentos
          </p>
          <div className="ac-fin-btns">
            <button onClick={iniciar} className="btn-principal">Jugar de nuevo 🔁</button>
            {onSalir && <button onClick={onSalir} className="btn-secundario">Volver ←</button>}
          </div>
        </div>
      </div>
    );
  }

  if (!preguntaActual) return null;

  // ── Juego ────────────────────────────────────────────────────────────
  return (
    <div className="ac-page">
      <header className="ac-header">
        <button onClick={onSalir} className="btn-back" aria-label="Volver">←</button>
        <span className="ac-header-title">📖 ¿De qué cuento es?</span>
        <span className="ac-contador">{ronda + 1} / {TOTAL_RONDAS}</span>
      </header>

      <div className="ac-card">
        <div className="ac-frase-label">Lee la frase y adivina el cuento</div>
        <div className="ac-frase">
          {preguntaActual.frase}
        </div>

        <div className="ac-opciones">
          {preguntaActual.opciones.map((opcion) => (
            <button
              key={opcion}
              className={claseOpcion(opcion)}
              onClick={() => elegir(opcion)}
            >
              {opcion}
            </button>
          ))}
        </div>

        {!confirmado && seleccion && (
          <button className="btn-confirmar" onClick={confirmar}>
            Confirmar ✅
          </button>
        )}

        {confirmado && (
          <div className={`ac-feedback ${seleccion === preguntaActual.respuesta ? "ok" : "mal"}`}>
            {seleccion === preguntaActual.respuesta
              ? "🎉 ¡Correcto!"
              : `❌ Era: ${preguntaActual.respuesta}`}
            <button onClick={siguiente} className="btn-siguiente">
              {ronda + 1 < TOTAL_RONDAS ? "Siguiente →" : "Ver resultado 🏆"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}