import { useState, useEffect } from "react";
import "../styles/JuegoEscuchaResponde.css";

// Banco de preguntas ampliado
const BANCO_PREGUNTAS = [
  { texto: "¿Quién perdió su zapato?", respuesta: 1, opciones: ["Caperucita", "Cenicienta", "Blancanieves"] },
  { texto: "¿Quién construyó una casa de ladrillos?", respuesta: 2, opciones: ["Lobo", "Patito", "Cerdito"] },
  { texto: "¿Quién tenía una nariz muy larga?", respuesta: 0, opciones: ["Pinocho", "Peter Pan", "Ricitos"] },
  { texto: "¿Quién vivía con siete enanitos?", respuesta: 1, opciones: ["Sirenita", "Blancanieves", "Cenicienta"] },
  { texto: "¿Quién visitó a su abuelita?", respuesta: 0, opciones: ["Caperucita", "Ricitos", "Sirenita"] },
  { texto: "¿Quién volaba con polvo de hadas hacia Nunca Jamás?", respuesta: 1, opciones: ["Aladdín", "Peter Pan", "Pinocho"] },
  { texto: "¿Quién cambió su voz por unas piernas para caminar?", respuesta: 2, opciones: ["Bella", "Rapunzel", "Sirenita"] },
  { texto: "¿A quién le gustaba mucho comer miel y vivir en el bosque?", respuesta: 0, opciones: ["Winnie Pooh", "El Lobo Feroz", "El Gato con Botas"] },
  { texto: "¿Qué personaje usaba unas botas mágicas para ayudar a su dueño?", respuesta: 1, opciones: ["El Patito Feo", "El Gato con Botas", "El Principito"] },
  { texto: "¿Quién probó la sopa y se durmió en la cama de los osos?", respuesta: 2, opciones: ["Cenicienta", "Caperucita", "Ricitos de Oro"] },
  { texto: "¿Quién tenía un cabello larguísimo y vivía atrapada en una torre?", respuesta: 0, opciones: ["Rapunzel", "Blancanieves", "Mulan"] },
  { texto: "¿Quién viajaba de planeta en planeta con su amigo el zorro?", respuesta: 1, opciones: ["Peter Pan", "El Principito", "Pinocho"] }
];

export default function JuegoEscuchaResponde({ onSalir }) {
  const [partidaPreguntas, setPartidaPreguntas] = useState([]); // Guardará las 5 preguntas seleccionadas
  const [indiceActual, setIndiceActual] = useState(0); // Controla en qué pregunta vamos (0 a 4)
  const [correctas, setCorrectas] = useState(0);
  const [respondida, setRespondida] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  // Iniciar una nueva partida con 5 preguntas aleatorias sin repetir
  const iniciarJuego = () => {
    const mezcladas = [...BANCO_PREGUNTAS].sort(() => Math.random() - 0.5);
    const seleccionadas = mezcladas.slice(0, 5); // Tomamos exactamente 5
    
    setPartidaPreguntas(seleccionadas);
    setIndiceActual(0);
    setCorrectas(0);
    setRespondida(false);
    setOpcionSeleccionada(null);
    setJuegoTerminado(false);

    // Reproducir la primera pregunta
    setTimeout(() => {
      hablar(seleccionadas[0].texto);
    }, 500);
  };

  useEffect(() => {
    iniciarJuego();
  }, []);

  const hablar = (texto) => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-ES";
    voz.rate = 0.9;
    speechSynthesis.speak(voz);
  };

  const responder = (i) => {
    if (respondida || juegoTerminado) return;
    
    setRespondida(true);
    setOpcionSeleccionada(i);
    
    const preguntaActual = partidaPreguntas[indiceActual];

    if (i === preguntaActual.respuesta) {
      setCorrectas((c) => c + 1);
    }

    // Avanzar después de 2 segundos
    setTimeout(() => {
      if (indiceActual < 4) {
        const siguienteIndice = indiceActual + 1;
        setIndiceActual(siguienteIndice);
        setRespondida(false);
        setOpcionSeleccionada(null);
        hablar(partidaPreguntas[siguienteIndice].texto);
      } else {
        setJuegoTerminado(true);
        speechSynthesis.cancel();
      }
    }, 2000);
  };

  // Esperar a que las preguntas se carguen inicialmente
  if (partidaPreguntas.length === 0) return null;

  const preguntaActual = partidaPreguntas[indiceActual];

  return (
    <div className="esc-page">
      <div className="esc-header">
        <button onClick={onSalir} className="btn-back">←</button>
        <h2>🎧 Escucha y Responde</h2>
      </div>

      <div className="esc-card">
        {!juegoTerminado ? (
          <>
            <div className="esc-progreso">Pregunta {indiceActual + 1} de 5</div>
            <div className="esc-icon">🎤</div>
            <p className="esc-indicacion">Escucha la pregunta con atención</p>

            <button className="btn-audio" onClick={() => hablar(preguntaActual.texto)}>
              🔊 Escuchar otra vez
            </button>

            <div className="opciones">
              {preguntaActual.opciones.map((op, i) => {
                // Estilos visuales dinámicos por si responde bien o mal
                let claseBoton = "";
                if (respondida) {
                  if (i === preguntaActual.respuesta) claseBoton = "correcta";
                  else if (i === opcionSeleccionada) claseBoton = "incorrecta";
                  else claseBoton = "desactivada";
                }

                return (
                  <button 
                    key={i} 
                    onClick={() => responder(i)}
                    className={claseBoton}
                    disabled={respondida}
                  >
                    {op}
                  </button>
                );
              })}
            </div>

            <div className="puntaje-en-vivo">Estrellas: ⭐ {correctas}</div>
          </>
        ) : (
          /* Pantalla de Fin de Juego */
          <div className="pantalla-victoria">
            <h2>🎉 ¡Terminaste el juego!</h2>
            <p className="resultado-texto">
              Lograste juntar <strong>{correctas} de 5</strong> estrellas mágicas.
            </p>
            <div className="estrellas-finales">
              {Array(correctas).fill("⭐").join(" ")}
            </div>
            <div className="botones-finales">
              <button onClick={iniciarJuego} className="btn-reiniciar">Volver a jugar</button>
              <button onClick={onSalir} className="btn-salir-menu">Salir al menú</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}