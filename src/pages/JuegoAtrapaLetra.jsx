import { useEffect, useState, useCallback } from "react";
import "../styles/JuegoAtrapaLetra.css";

const PALABRAS = [
  { emoji: "🐷", palabra: "CERDITO" },
  { emoji: "🧜‍♀️", palabra: "SIRENITA" },
  { emoji: "🤥", palabra: "PINOCHO" },
  { emoji: "👧", palabra: "CAPERUCITA" },
  { emoji: "👸", palabra: "CENICIENTA" },
  { emoji: "🦆", palabra: "PATITO" },
  { emoji: "🐱", palabra: "GATO" },
  { emoji: "👱‍♀️", palabra: "RICITOS" },
  { emoji: "🧚", palabra: "PETER" },
  { emoji: "⭐", palabra: "PRINCIPITO" },
  { emoji: "🐢", palabra: "TORTUGA" },
  { emoji: "🐇", palabra: "LIEBRE" },
  { emoji: "🐺", palabra: "LOBO" },
  { emoji: "🍎", palabra: "MANZANA" },
  { emoji: "🏰", palabra: "CASTILLO" },
];

export default function JuegoAtrapaLetra({ onSalir }) {
  const [actual, setActual] = useState(null);
  const [mostrar, setMostrar] = useState([]); // Guardará objetos con coordenadas
  const [progreso, setProgreso] = useState([]);
  const [ganadas, setGanadas] = useState(0);
  const [fin, setFin] = useState(false);

  const cargar = useCallback(() => {
    const item = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
    setActual(item);
    setProgreso([]);

    // Separamos las letras en objetos con propiedades únicas de animación
    const letrasAnimadas = Array.from(item.palabra).map((letra, index) => ({
      id: `${letra}-${index}-${Math.random().toString(36).slice(2)}`,
      letra,
      posX: Math.floor(Math.random() * 80) + 10, // Posición aleatoria entre 10% y 90%
      retraso: (index * 0.6).toFixed(1), // Retraso escalonado para la caída
    }));

    // Mezclamos el orden inicial
    setMostrar([...letrasAnimadas].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const atrapar = (item) => {
    if (actual.palabra.includes(item.letra)) {
      setProgreso((prev) => {
        const nuevo = [...prev, item.letra];

        const completas = Array.from(actual.palabra).every((l) => nuevo.includes(l));

        if (completas) {
          const total = ganadas + 1;
          setGanadas(total);

          if (total === 5) {
            setFin(true);
          } else {
            setTimeout(() => cargar(), 1200);
          }
        }
        return nuevo;
      });
    }

    // Ocultar de la lluvia la letra seleccionada de forma inmediata
    setMostrar((prev) => prev.filter((l) => l.id !== item.id));
  };

  // Si una letra llega al fondo sin ser clickeada, reinicia su ciclo en la animación del CSS automáticamente

  if (fin) {
    return (
      <div className="fin">
        <h1 className="fin-icon">🏆</h1>
        <h2>¡Terminaste!</h2>
        <p>Completaste 5 palabras con éxito.</p>
        <button
          onClick={() => {
            setGanadas(0);
            setFin(false);
            cargar();
          }}
        >
          Jugar otra vez
        </button>
      </div>
    );
  }

  return (
    <div className="atrapa-page">
      <div className="header-atrapa">
        <button onClick={onSalir} className="btn-back">←</button>
        <h2>🎯 Atrapa la Letra</h2>
      </div>

      <div className="contador-palabras">
        Palabras completas: <strong>{ganadas}/5</strong>
      </div>

      <div className="emoji-central" translate="no">{actual?.emoji}</div>

      {/* Casillas de la palabra */}
      <div className="palabra-display">
        {actual && Array.from(actual.palabra).map((l, i) => (
          <div key={i} className="caja-letra" translate="no">
            {progreso.includes(l) ? l : ""}
          </div>
        ))}
      </div>

      {/* Contenedor del área de caída libre */}
      <div className="lluvia-contenedor">
        {mostrar.map((item) => (
          <button
            key={item.id}
            className="letra-cayendo"
            onClick={() => atrapar(item)}
            translate="no"
            style={{
              left: `${item.posX}%`,
              animationDelay: `${item.retraso}s`,
            }}
          >
            {item.letra}
          </button>
        ))}
      </div>
    </div>
  );
}