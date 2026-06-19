import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [codigoAula, setCodigoAula] = useState("");
  const [tab, setTab] = useState("resumen");
  const [estudianteSeleccionado, setEstudianteSeleccionado] =
    useState(null);
  const [historialEstudiante, setHistorialEstudiante] =
    useState([]);
  const [sesionesEstudiante, setSesionesEstudiante] =
    useState([]);
  const [cargandoHistorial, setCargandoHistorial] =
    useState(false);
  const [tabDetalle, setTabDetalle] = useState("quizzes");

  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/seleccion");
      return;
    }

    const cargarDatos = async () => {
      const snap = await getDocs(
        collection(db, "docentes", user.uid, "estudiantes")
      );

      setEstudiantes(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

      const docenteSnap = await getDocs(
        collection(db, "docentes")
      );

      docenteSnap.forEach((d) => {
        if (d.id === user.uid) {
          setCodigoAula(d.data().codigoAula);
        }
      });
    };

    cargarDatos();
  }, [navigate]);

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate("/seleccion");
  };

  const verDetalleEstudiante = async (estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setTabDetalle("quizzes");
    setCargandoHistorial(true);

    try {
      const qQuiz = query(
        collection(db, "resultados"),
        where("estudianteId", "==", estudiante.id),
        orderBy("fecha", "desc")
      );

      const snapQuiz = await getDocs(qQuiz);

      setHistorialEstudiante(
        snapQuiz.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

      const qSes = query(
        collection(db, "sesiones"),
        where("estudianteId", "==", estudiante.id),
        orderBy("entrada", "desc")
      );

      const snapSes = await getDocs(qSes);

      setSesionesEstudiante(
        snapSes.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const cerrarDetalle = () => {
    setEstudianteSeleccionado(null);
    setHistorialEstudiante([]);
    setSesionesEstudiante([]);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const d = fecha.toDate
      ? fecha.toDate()
      : new Date(fecha);

    return d.toLocaleDateString("es-SV", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatearHora = (fecha) => {
    if (!fecha) return "";

    const d = fecha.toDate
      ? fecha.toDate()
      : new Date(fecha);

    return d.toLocaleTimeString("es-SV", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularDuracion = (entrada, salida) => {
    if (!entrada || !salida) return "En curso";

    const e = entrada.toDate
      ? entrada.toDate()
      : new Date(entrada);

    const s = salida.toDate
      ? salida.toDate()
      : new Date(salida);

    const mins = Math.round((s - e) / 60000);

    if (mins < 1) return "Menos de 1 min";
    if (mins < 60) return `${mins} min`;

    return `${Math.floor(mins / 60)}h ${
      mins % 60
    }min`;
  };

  // =============================
  // DETALLE DEL ESTUDIANTE
  // =============================

  if (estudianteSeleccionado) {
    const puntosTotal = historialEstudiante.reduce(
      (a, r) => a + r.puntaje,
      0
    );

    const cuentosLeidos =
      historialEstudiante.length;

    const promedioPct = cuentosLeidos
      ? Math.round(
          historialEstudiante.reduce(
            (a, r) => a + r.porcentaje,
            0
          ) / cuentosLeidos
        )
      : 0;

    return (
      <div className="dashboard-container">
        <div className="detalle-header">
          <button
            className="volver-btn"
            onClick={cerrarDetalle}
          >
            ← Volver
          </button>

          <h2>{estudianteSeleccionado.nombre}</h2>

          <p>
            Nivel{" "}
            {estudianteSeleccionado.nivelLector}
          </p>
        </div>

        <div className="metricas-grid">
          <div className="card-metrica">
            <h4>Cuentos leídos</h4>
            <p>{cuentosLeidos}</p>
          </div>

          <div className="card-metrica">
            <h4>Puntos totales</h4>
            <p>{puntosTotal}</p>
          </div>

          <div className="card-metrica">
            <h4>Promedio</h4>
            <p>{promedioPct}%</p>
          </div>
        </div>

        <div className="tabs">
          <button
            className={
              tabDetalle === "quizzes"
                ? "tab-active"
                : ""
            }
            onClick={() =>
              setTabDetalle("quizzes")
            }
          >
            Quizzes
          </button>

          <button
            className={
              tabDetalle === "sesiones"
                ? "tab-active"
                : ""
            }
            onClick={() =>
              setTabDetalle("sesiones")
            }
          >
            Sesiones
          </button>
        </div>

        {tabDetalle === "quizzes" && (
          <div className="contenido-card">
            {cargandoHistorial ? (
              <p>Cargando...</p>
            ) : historialEstudiante.length ===
              0 ? (
              <p>No hay quizzes realizados.</p>
            ) : (
              historialEstudiante.map((r) => {
                const pct =
                  r.porcentaje ??
                  Math.round(
                    (r.puntaje / r.total) * 100
                  );

                return (
                  <div
                    key={r.id}
                    className="item-card"
                  >
                    <h4>{r.tituloCuento}</h4>

                    <p>
                      {r.puntaje}/{r.total}{" "}
                      correctas
                    </p>

                    <p>{pct}%</p>

                    <p>
                      {formatearFecha(
                        r.fecha
                      )}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tabDetalle === "sesiones" && (
          <div className="contenido-card">
            {cargandoHistorial ? (
              <p>Cargando...</p>
            ) : sesionesEstudiante.length ===
              0 ? (
              <p>
                No hay sesiones registradas.
              </p>
            ) : (
              sesionesEstudiante.map((s) => (
                <div
                  key={s.id}
                  className="item-card"
                >
                  <p>
                    Fecha:{" "}
                    {formatearFecha(
                      s.entrada
                    )}
                  </p>

                  <p>
                    Entrada:{" "}
                    {formatearHora(
                      s.entrada
                    )}
                  </p>

                  {s.salida && (
                    <p>
                      Salida:{" "}
                      {formatearHora(
                        s.salida
                      )}
                    </p>
                  )}

                  <p>
                    Duración:{" "}
                    {calcularDuracion(
                      s.entrada,
                      s.salida
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // =============================
  // PANEL PRINCIPAL
  // =============================

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Panel Docente</h1>
          <p>LeeConGustavito</p>
        </div>

        <div className="header-buttons">
          <button onClick={cerrarSesion}>
            Salir
          </button>

          <button
            onClick={() =>
              navigate("/agregar-cuento")
            }
          >
            Agregar cuento
          </button>
        </div>
      </header>

      {codigoAula && (
        <div className="codigo-card">
          <p>Código de aula</p>
          <h2>{codigoAula}</h2>
        </div>
      )}

      <div className="tabs">
        <button
          className={
            tab === "resumen"
              ? "tab-active"
              : ""
          }
          onClick={() => setTab("resumen")}
        >
          Resumen
        </button>

        <button
          className={
            tab === "estudiantes"
              ? "tab-active"
              : ""
          }
          onClick={() =>
            setTab("estudiantes")
          }
        >
          Estudiantes
        </button>
      </div>

      {tab === "resumen" && (
        <div className="contenido-card">
          <div className="metricas-grid">
            <div className="card-metrica">
              <h4>Total estudiantes</h4>
              <p>{estudiantes.length}</p>
            </div>

            <div className="card-metrica">
              <h4>Promedio puntos</h4>

              <p>
                {estudiantes.length
                  ? Math.round(
                      estudiantes.reduce(
                        (a, e) =>
                          a +
                          (e.puntosTotal || 0),
                        0
                      ) /
                        estudiantes.length
                    )
                  : 0}
              </p>
            </div>
          </div>

          <h3>Distribución por nivel</h3>

          {[1, 2, 3].map((nivel) => {
            const cantidad =
              estudiantes.filter(
                (e) =>
                  e.nivelLector === nivel
              ).length;

            return (
              <div
                key={nivel}
                className="nivel-item"
              >
                Nivel {nivel}: {cantidad}{" "}
                estudiantes
              </div>
            );
          })}
        </div>
      )}

      {tab === "estudiantes" && (
        <div className="contenido-card">
          {estudiantes.length === 0 ? (
            <p>
              Aún no hay estudiantes en tu
              aula.
            </p>
          ) : (
            estudiantes.map((e) => (
              <div
                key={e.id}
                className="estudiante-item"
                onClick={() =>
                  verDetalleEstudiante(e)
                }
              >
                <h4>{e.nombre}</h4>

                <p>
                  Nivel {e.nivelLector} ·{" "}
                  {e.puntosTotal || 0} pts
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}