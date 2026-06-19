import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/AppEstudiante.css";

/* ================= MEDALLAS ================= */

const MEDALLAS = [
  { id: "primera_lectura", emoji: "🌱", nombre: "Primera lectura", desc: "Completaste tu primer cuento", tipo: "cuentos", meta: 1 },
  { id: "lector_activo", emoji: "📚", nombre: "Lector activo", desc: "Leíste 5 cuentos", tipo: "cuentos", meta: 5 },
  { id: "gran_lector", emoji: "🏅", nombre: "Gran lector", desc: "Leíste 10 cuentos", tipo: "cuentos", meta: 10 },

  { id: "primeras_estrellas", emoji: "⭐", nombre: "Primeras estrellas", desc: "Acumulaste 10 puntos", tipo: "puntos", meta: 10 },
  { id: "en_racha", emoji: "🔥", nombre: "En racha", desc: "Acumulaste 50 puntos", tipo: "puntos", meta: 50 },
  { id: "campeon_lector", emoji: "🏆", nombre: "Campeón lector", desc: "Acumulaste 100 puntos", tipo: "puntos", meta: 100 },
];

function calcularMedallas(historial) {
  const cuentosLeidos = historial.length;
  const puntosTotal = historial.reduce((a, r) => a + r.puntaje, 0);

  return MEDALLAS.map((m) => ({
    ...m,
    ganada:
      m.tipo === "cuentos"
        ? cuentosLeidos >= m.meta
        : puntosTotal >= m.meta,
    progreso:
      m.tipo === "cuentos"
        ? Math.min(cuentosLeidos, m.meta)
        : Math.min(puntosTotal, m.meta),
  }));
}

/* ================= COMPONENTE ================= */

export default function AppEstudiante() {
  const navigate = useNavigate();
  const estudiante = JSON.parse(localStorage.getItem("estudiante") || "null");

  const [tab, setTab] = useState("leer");
  const [cuentos, setCuentos] = useState([]);
  const [cuentoActivo, setCuentoActivo] = useState(null);
  const [fase, setFase] = useState("lista");
  const [respuestas, setRespuestas] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [resultadoActual, setResultadoActual] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoProgreso, setCargandoProgreso] = useState(false);
  const [medallaReciente, setMedallaReciente] = useState(null);

  /* ================= LOAD CUENTOS ================= */

  useEffect(() => {
    if (!estudiante) return navigate("/seleccion");

    const cargar = async () => {
      const snap = await getDocs(collection(db, "cuentos"));
      setCuentos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    cargar();
  }, []);

  /* ================= PROGRESO ================= */

  useEffect(() => {
    if (tab === "progreso") cargarProgreso();
  }, [tab]);

  const cargarProgreso = async () => {
    setCargandoProgreso(true);
    const q = query(
      collection(db, "resultados"),
      where("estudianteId", "==", estudiante.id),
      orderBy("fecha", "desc")
    );

    const snap = await getDocs(q);
    setHistorial(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setCargandoProgreso(false);
  };

  /* ================= SALIR ================= */

  const salir = async () => {
    if (estudiante?.sesionId) {
      await updateDoc(doc(db, "sesiones", estudiante.sesionId), {
        salida: new Date(),
      });
    }

    localStorage.removeItem("estudiante");
    navigate("/seleccion");
  };

  /* ================= QUIZ ================= */

  const handleResponder = (i, j) => {
    if (respuestas[i] !== undefined) return;
    setRespuestas((p) => ({ ...p, [i]: j }));
  };

  const todasRespondidas = () => {
    return cuentoActivo?.preguntas?.every(
      (_, i) => respuestas[i] !== undefined
    );
  };

  const calcularPuntaje = () => {
    return cuentoActivo.preguntas.reduce(
      (acc, p, i) => acc + (respuestas[i] === p.correcta ? 1 : 0),
      0
    );
  };

  const terminarQuiz = async () => {
    setGuardando(true);

    const puntaje = calcularPuntaje();
    const total = cuentoActivo.preguntas.length;

    const medallasAntes = calcularMedallas(historial);

    await addDoc(collection(db, "resultados"), {
      estudianteId: estudiante.id,
      nombre: estudiante.nombre,
      cuentoId: cuentoActivo.id,
      tituloCuento: cuentoActivo.titulo,
      emojiCuento: cuentoActivo.emoji,
      puntaje,
      total,
      porcentaje: Math.round((puntaje / total) * 100),
      fecha: new Date(),
    });

    const nuevoHistorial = [
      { puntaje, total, tituloCuento: cuentoActivo.titulo },
      ...historial,
    ];

    const medallasDespues = calcularMedallas(nuevoHistorial);

    const nueva = medallasDespues.find(
      (m, i) => m.ganada && !medallasAntes[i].ganada
    );

    if (nueva) setMedallaReciente(nueva);

    setHistorial(nuevoHistorial);
    setResultadoActual({ puntaje, total });
    setFase("resultado");
    setGuardando(false);
  };

  /* ================= RENDER ================= */

  if (fase === "leer" && cuentoActivo) {
    return (
      <div className="leer-page">
        <div className="leer-header">
          <button onClick={() => setFase("lista")}>←</button>
          <span>{cuentoActivo.titulo}</span>
        </div>

        <div className="leer-content">
          <div className="cuento-emoji">
            {cuentoActivo.emoji}
          </div>

          <div className="cuento-texto">
            {cuentoActivo.contenido}
          </div>

          <button
            className="btn-principal"
            onClick={() => setFase("quiz")}
          >
            ¡Responder preguntas! ❓
          </button>
        </div>
      </div>
    );
  }

  if (fase === "quiz") {
    return (
      <div className="quiz-page">
        {cuentoActivo.preguntas.map((p, i) => (
          <div key={i} className="pregunta-card">
            <h4>{p.pregunta}</h4>

            {p.opciones.map((op, j) => (
              <button
                key={j}
                onClick={() => handleResponder(i, j)}
                className={`opcion ${
                  respuestas[i] === j ? "active" : ""
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        ))}

        <button
          className="btn-principal"
          disabled={!todasRespondidas()}
          onClick={terminarQuiz}
        >
          Ver resultado 🏆
        </button>
      </div>
    );
  }

  if (fase === "resultado") {
    return (
      <div className="resultado-page">
        <div className="resultado-card">
          <h1>🎉 Resultado</h1>

          <p>
            {resultadoActual.puntaje} / {resultadoActual.total}
          </p>

          <button
            onClick={() => {
              setFase("lista");
              setCuentoActivo(null);
              setRespuestas({});
            }}
          >
            Seguir leyendo 📚
          </button>
        </div>
      </div>
    );
  }

  /* ================= LISTA PRINCIPAL ================= */

  const medallas = calcularMedallas(historial);

  return (
    <div className="app-estudiante">
      <div className="header">
        <h2>¡Hola {estudiante?.nombre} 👋</h2>
        <button onClick={salir}>Salir</button>
      </div>

      <div className="tabs">
        <button onClick={() => setTab("leer")}>Leer</button>
        <button onClick={() => setTab("progreso")}>Progreso</button>
      </div>

      {tab === "leer" && (
        <div className="grid-cuentos">
          {cuentos.map((c) => (
            <div
              key={c.id}
              className="cuento-card"
              onClick={() => {
                setCuentoActivo(c);
                setFase("leer");
              }}
            >
              <div>{c.emoji}</div>
              <h4>{c.titulo}</h4>
            </div>
          ))}
        </div>
      )}

      {tab === "progreso" && (
        <div className="progreso">
          <h3>Medallas</h3>
          <div className="medallas">
            {medallas.map((m) => (
              <div key={m.id} className="medalla">
                <div>{m.emoji}</div>
                <p>{m.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}