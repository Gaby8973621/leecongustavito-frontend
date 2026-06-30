import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

import blancanieves from "../assets/rompecabezas/blancanieves.jpg";
import caperucita from "../assets/rompecabezas/caperucita.jpg";
import cenicienta from "../assets/rompecabezas/cenicienta.jpeg";
import cerditos from "../assets/rompecabezas/cerditos.jpeg";
import gato from "../assets/rompecabezas/gato.jpg";
import libreytortuga from "../assets/rompecabezas/libreytortuga.jpg";
import patito from "../assets/rompecabezas/patito.jpg";
import peter from "../assets/rompecabezas/peter.jpg";
import pinocho from "../assets/rompecabezas/pinocho.jpg";
import principito from "../assets/rompecabezas/principito.jpg";
import ricitos from "../assets/rompecabezas/ricitos.jpg";
import sirenita from "../assets/rompecabezas/sirenita.jpg";

import "../styles/JuegoRompecabezas.css";

const IMAGENES = [
  blancanieves,
  caperucita,
  cenicienta,
  cerditos,
  gato,
  libreytortuga,
  patito,
  peter,
  pinocho,
  principito,
  ricitos,
  sirenita,
];

export default function JuegoRompecabezas({ estudiante, onSalir }) {
  const [imagen, setImagen] = useState(null);
  const [piezas, setPiezas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [movimientos, setMovimientos] = useState(0);
  const [completo, setCompleto] = useState(false);

  const crearPuzzle = () => {
    const img = IMAGENES[Math.floor(Math.random() * IMAGENES.length)];
    setImagen(img);

    let arr = [];
    for (let i = 0; i < 9; i++) {
      arr.push({
        id: i,
        correcto: i,
      });
    }

    arr.sort(() => Math.random() - 0.5);
    setPiezas(arr);
    setMovimientos(0);
    setCompleto(false);
  };

  useEffect(() => {
    crearPuzzle();
  }, []);

  const clickPieza = (index) => {
    if (seleccionada === null) {
      setSeleccionada(index);
      return;
    }
    const nuevas = [...piezas];
    [nuevas[seleccionada], nuevas[index]] = [
      nuevas[index],
      nuevas[seleccionada],
    ];

    setPiezas(nuevas);
    setSeleccionada(null);
    setMovimientos((m) => m + 1);
    verificar(nuevas);
  };

  const verificar = async (lista) => {
    const bien = lista.every((p, i) => p.correcto === i);
    if (bien) {
      setCompleto(true);
      guardarResultado();
    }
  };

  const guardarResultado = async () => {
    if (!estudiante) return;
    await addDoc(collection(db, "resultadosJuegos"), {
      estudianteId: estudiante.id,
      nombre: estudiante.nombre,
      juego: "rompecabezas",
      movimientos,
      fecha: new Date(),
    });
  };

  return (
    <div className="rompe-page">
      <div className="rompe-header">
        <button onClick={onSalir}>←</button>
        <h2>🧩 Rompecabezas</h2>
      </div>

      <p>Movimientos: {movimientos}</p>

      {/* Contenedor principal que envuelve el juego y la referencia */}
      <div className="rompe-container">
        
        {/* El tablero del rompecabezas */}
        <div className="rompe-grid">
          {piezas.map((pieza, index) => (
            <div
              key={index}
              onClick={() => clickPieza(index)}
              className={`pieza ${seleccionada === index ? "activa" : ""}`}
              style={{
                backgroundImage: `url(${imagen})`,
                backgroundPosition: `
                  ${-(pieza.correcto % 3) * 120}px
                  ${-Math.floor(pieza.correcto / 3) * 120}px
                `,
              }}
            ></div>
          ))}
        </div>

        {/* Imagen de referencia (Guía para el estudiante) */}
        {imagen && (
          <div className="rompe-guia-container">
            <h3>Imagen de referencia:</h3>
            <img src={imagen} alt="Guía del rompecabezas" className="rompe-guia" />
          </div>
        )}
      </div>

      {completo && (
        <div className="ganaste">
          <h2>🎉 ¡Completaste el rompecabezas!</h2>
          <button onClick={crearPuzzle}>Jugar otra vez</button>
        </div>
      )}
    </div>
  );
}