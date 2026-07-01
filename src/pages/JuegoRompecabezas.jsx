import { useEffect, useState, useRef } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

import blancanieves from "../assets/rompecabezas/blancanieves.jpg";
import caperucita from "../assets/rompecabezas/caperucita.jpg";
import cenicienta from "../assets/rompecabezas/cenicienta.jpg";
import cerditos from "../assets/rompecabezas/cerditos.jpg";
import gato from "../assets/rompecabezas/gato.jpg";
import libreytortuga from "../assets/rompecabezas/libreytortuga.jpg";
import patito from "../assets/rompecabezas/patito.jpg";
import peter from "../assets/rompecabezas/peter.jpg";
import pinocho from "../assets/rompecabezas/pinocho.jpg";
import principito from "../assets/rompecabezas/principito.jpeg";
import ricitos from "../assets/rompecabezas/ricitos.jpg";
import sirenita from "../assets/rompecabezas/sirenita.jpg";

import "../styles/JuegoRompecabezas.css";

const NIVELES = [
  { src: caperucita, nombre: "Caperucita Roja", emoji: "🐺", cols: 3 },
  { src: cerditos, nombre: "Los tres cerditos", emoji: "🐷", cols: 3 },
  { src: cenicienta, nombre: "Cenicienta", emoji: "👸", cols: 4 },
  { src: blancanieves, nombre: "Blancanieves", emoji: "🍎", cols: 4 },
  { src: gato, nombre: "El gato con botas", emoji: "🐈", cols: 4 },
  { src: libreytortuga, nombre: "La liebre y la tortuga", emoji: "🐢", cols: 5 },
  { src: patito, nombre: "El patito feo", emoji: "🦆", cols: 5 },
  { src: peter, nombre: "Peter Pan", emoji: "🧚", cols: 5 },
  { src: pinocho, nombre: "Pinocho", emoji: "🤥", cols: 5 },
  { src: principito, nombre: "El Principito", emoji: "🌹", cols: 5 },
  { src: ricitos, nombre: "Ricitos de Oro", emoji: "🐻", cols: 5 },
  { src: sirenita, nombre: "La Sirenita", emoji: "🧜", cols: 5 },
];

function calcularEstrellas(movimientos, cols) {
  if (!movimientos) return 0;
  const total = cols * cols;
  if (movimientos <= total) return 3;
  if (movimientos <= total * 1.75) return 2;
  return 1;
}

function Estrellas({ n }) {
  return (
    <div className="cat-estrellas">
      {[1, 2, 3].map((i) => (
        <span key={i}>{i <= n ? "⭐" : "☆"}</span>
      ))}
    </div>
  );
}

function badgeNivel(cols) {
  if (cols === 3) return { texto: "⭐ Fácil", clase: "badge-facil" };
  if (cols === 4) return { texto: "🔥 Medio", clase: "badge-medio" };
  return { texto: "💥 Difícil", clase: "badge-dificil" };
}

export default function JuegoRompecabezas({ estudiante, onSalir }) {
  const [fase, setFase] = useState("catalogo");
  const [nivelActivo, setNivelActivo] = useState(null);
  const [progreso, setProgreso] = useState({});
  const [piezas, setPiezas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [movimientos, setMovimientos] = useState(0);
  const [movFin, setMovFin] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [tamPieza, setTamPieza] = useState(100);
  const gridRef = useRef(null);

  /* ---------- medir tamaño real del grid ---------- */
  useEffect(() => {
    if (fase !== "juego" || !nivelActivo || !gridRef.current) return;

    const medir = () => {
      if (!gridRef.current) return;
      const ancho = gridRef.current.offsetWidth;
      if (ancho > 0) {
        setTamPieza(Math.floor(ancho / nivelActivo.cols));
      }
    };

    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [fase, nivelActivo]);

  /* ---------- cargar progreso desde Firebase ---------- */
  useEffect(() => {
    const cargar = async () => {
      if (!estudiante) {
        setCargando(false);
        return;
      }
      try {
        const q = query(
          collection(db, "resultadosJuegos"),
          where("estudianteId", "==", estudiante.id),
          where("juego", "==", "rompecabezas")
        );
        const snap = await getDocs(q);
        const prog = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          const est = calcularEstrellas(data.movimientos, data.cols || 3);
          if (!prog[data.imagen] || est > prog[data.imagen]) {
            prog[data.imagen] = est;
          }
        });
        setProgreso(prog);
      } catch (e) {
        console.error("Error cargando progreso:", e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [estudiante]);

  const estaDesbloqueado = (idx) => {
    if (idx === 0) return true;
    return progreso[NIVELES[idx - 1].nombre] > 0;
  };

  /* ---------- iniciar puzzle ---------- */
  const iniciarNivel = (nivel) => {
    setNivelActivo(nivel);
    const total = nivel.cols * nivel.cols;
    const arr = Array.from({ length: total }, (_, i) => ({
      id: i,
      correcto: i,
    }));
    arr.sort(() => Math.random() - 0.5);
    setPiezas(arr);
    setMovimientos(0);
    setMovFin(0);
    setSeleccionada(null);
    setFase("juego");
  };

  /* ---------- click en pieza ---------- */
  const clickPieza = (index) => {
    if (fase !== "juego") return;
    if (seleccionada === null) {
      setSeleccionada(index);
      return;
    }
    if (seleccionada === index) {
      setSeleccionada(null);
      return;
    }

    const nuevas = [...piezas];
    [nuevas[seleccionada], nuevas[index]] = [nuevas[index], nuevas[seleccionada]];
    setPiezas(nuevas);
    setSeleccionada(null);

    const nuevosMov = movimientos + 1;
    setMovimientos(nuevosMov);

    const completo = nuevas.every((p, i) => p.correcto === i);
    if (completo) {
      const est = calcularEstrellas(nuevosMov, nivelActivo.cols);
      setMovFin(nuevosMov);
      
      setProgreso((prev) => ({
        ...prev,
        [nivelActivo.nombre]: Math.max(prev[nivelActivo.nombre] || 0, est),
      }));

      guardarResultado(nuevosMov, est).catch(console.error);
      setFase("fin");
    }
  };

  /* ---------- guardar resultado ---------- */
  const guardarResultado = async (totalMov, est) => {
    if (!estudiante || !nivelActivo) return;
    try {
      await addDoc(collection(db, "resultadosJuegos"), {
        estudianteId: estudiante.id,
        nombre: estudiante.nombre,
        juego: "rompecabezas",
        imagen: nivelActivo.nombre,
        cols: nivelActivo.cols,
        movimientos: totalMov,
        estrellas: est,
        fecha: new Date(),
      });
    } catch (e) {
      console.error("Error guardando resultado:", e);
    }
  };

  const bgPos = (correcto) => {
    if (!nivelActivo) return "0px 0px";
    const col = correcto % nivelActivo.cols;
    const row = Math.floor(correcto / nivelActivo.cols);
    return `-${col * tamPieza}px -${row * tamPieza}px`;
  };

  const tamTotal = tamPieza * (nivelActivo?.cols || 3);
  const completados = NIVELES.filter((n) => progreso[n.nombre] > 0).length;

  /* ============================================================
     RENDER — CATÁLOGO
     ============================================================ */
  if (fase === "catalogo") {
    return (
      <div className="rompe-page" key="fase-catalogo">
        <div className="rompe-header">
          <button className="rompe-back-btn" onClick={onSalir}>
            ←
          </button>
          <h2>🧩 Elige tu rompecabezas</h2>
        </div>

        <div className="cat-progreso">
          <span className="cat-prog-icono">🏆</span>
          <div className="cat-progreso-info-container" style={{ display: "inline-block", marginLeft: "10px" }}>
            <span className="cat-prog-texto">
              {completados} de {NIVELES.length} completados
            </span>
            <div className="cat-prog-bar">
              <div
                className="cat-prog-inner"
                style={{ width: `${(completados / NIVELES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {cargando ? (
          <p className="cat-cargando">Cargando tu progreso...</p>
        ) : (
          <div className="cat-grid">
            {NIVELES.map((nivel, i) => {
              const desbloqueado = estaDesbloqueado(i);
              const est = progreso[nivel.nombre] || 0;
              const esNuevo =
                desbloqueado &&
                est === 0 &&
                (i === 0 || progreso[NIVELES[i - 1].nombre] > 0);
              const badge = badgeNivel(nivel.cols);

              return (
                <div
                  key={`nivel-${i}-${nivel.nombre}`}
                  className={`cat-card ${desbloqueado ? "desbloqueado" : "bloqueado"} ${est > 0 ? "completado" : ""}`}
                  onClick={() => desbloqueado && iniciarNivel(nivel)}
                >
                  <div className="cat-img-wrap">
                    <img src={nivel.src} alt={nivel.nombre} className="cat-img" />
                    {!desbloqueado && <div className="cat-lock">🔒</div>}
                    {esNuevo && <div className="cat-badge">¡NUEVO!</div>}
                    <div className="cat-num">{i + 1}</div>
                    <div className={`cat-dificultad ${badge.clase}`}>{badge.texto}</div>
                  </div>
                  <div className="cat-info">
                    <div className="cat-nombre-container">
                      <span>{nivel.emoji}</span> <span>{nivel.nombre}</span>
                    </div>
                    <Estrellas n={est} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ============================================================
     RENDER — FIN
     ============================================================ */
  if (fase === "fin") {
    if (!nivelActivo) {
      return (
        <div className="rompe-page" key="fase-error">
          <div className="ganaste">
            <h2>Ocurrió un problema al cargar el nivel</h2>
            <button className="btn-principal" onClick={() => setFase("catalogo")}>
              Volver al catálogo
            </button>
          </div>
        </div>
      );
    }

    const est = calcularEstrellas(movFin, nivelActivo.cols);

    return (
      <div className="rompe-page" key="fase-fin">
        <div className="ganaste">
          <div className="ganaste-emoji">🏆</div>
          <h2>¡Lo lograste!</h2>
          <img src={nivelActivo.src} alt={nivelActivo.nombre} className="ganaste-img" />
          <p>{nivelActivo.nombre}</p>
          <Estrellas n={est} />
          <p className="ganaste-stats">{movFin} movimientos</p>
          <div className="ganaste-acciones">
            <button className="btn-principal" onClick={() => iniciarNivel(nivelActivo)}>
              Jugar de nuevo 🔁
            </button>
            <button className="btn-secundario" onClick={() => setFase("catalogo")}>
              Ver todos los niveles
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER — JUEGO
     ============================================================ */
  return (
    <div className="rompe-page" key="fase-juego">
      <div className="rompe-header">
        <button className="rompe-back-btn" onClick={() => setFase("catalogo")}>
          ←
        </button>
        <h2>
          <span>{nivelActivo?.emoji}</span> <span>{nivelActivo?.nombre}</span>
        </h2>
      </div>

      <div className="rompe-stats">
        <div className="rompe-stat">
          <p className="rompe-stat-label">Movimientos</p>
          <p className="rompe-stat-num">{movimientos}</p>
        </div>
        <div className="rompe-stat">
          <p className="rompe-stat-label">Nivel</p>
          <p className="rompe-stat-num">
            {nivelActivo?.cols}×{nivelActivo?.cols}
          </p>
        </div>
        <div className="rompe-stat">
          <p className="rompe-stat-label">Mejor</p>
          <div className="rompe-stat-num">
            <Estrellas n={progreso[nivelActivo?.nombre || ""] || 0} />
          </div>
        </div>
      </div>

      <div className="rompe-container">
        <div
          className="rompe-grid"
          ref={gridRef}
          style={{ gridTemplateColumns: `repeat(${nivelActivo?.cols || 3}, 1fr)` }}
        >
          {piezas.map((pieza, index) => (
            <div
              key={`pieza-${index}`}
              onClick={() => clickPieza(index)}
              className={`pieza ${seleccionada === index ? "activa" : ""} ${pieza.correcto === index ? "correcta" : ""}`}
              style={{
                width: tamPieza,
                height: tamPieza,
                backgroundImage: `url(${nivelActivo?.src})`,
                backgroundSize: `${tamTotal}px ${tamTotal}px`,
                backgroundPosition: bgPos(pieza.correcto),
              }}
            />
          ))}
        </div>

        <div className="rompe-guia-container">
          <h3>🎯 Arma esta imagen</h3>
          <img src={nivelActivo?.src} alt="Guía" className="rompe-guia" />
        </div>
      </div>
    </div>
  );
}