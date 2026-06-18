import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [estudiantes, setEstudiantes]                   = useState([]);
  const [codigoAula, setCodigoAula]                     = useState("");
  const [tab, setTab]                                   = useState("resumen");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [historialEstudiante, setHistorialEstudiante]   = useState([]);
  const [sesionesEstudiante, setSesionesEstudiante]     = useState([]);
  const [cargandoHistorial, setCargandoHistorial]       = useState(false);
  const [tabDetalle, setTabDetalle]                     = useState("quizzes");
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { navigate("/seleccion"); return; }

    const cargarDatos = async () => {
      const snap = await getDocs(collection(db, "docentes", user.uid, "estudiantes"));
      setEstudiantes(snap.docs.map(d => ({ id: d.id, ...d.data() })));

      const docenteSnap = await getDocs(collection(db, "docentes"));
      docenteSnap.forEach(d => {
        if (d.id === user.uid) setCodigoAula(d.data().codigoAula);
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
      // Cargar quizzes
      const qQuiz = query(
        collection(db, "resultados"),
        where("estudianteId", "==", estudiante.id),
        orderBy("fecha", "desc")
      );
      const snapQuiz = await getDocs(qQuiz);
      setHistorialEstudiante(snapQuiz.docs.map(d => ({ id: d.id, ...d.data() })));

      // Cargar sesiones
      const qSes = query(
        collection(db, "sesiones"),
        where("estudianteId", "==", estudiante.id),
        orderBy("entrada", "desc")
      );
      const snapSes = await getDocs(qSes);
      setSesionesEstudiante(snapSes.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error cargando detalle:", e);
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
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return d.toLocaleDateString("es-SV", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatearHora = (fecha) => {
    if (!fecha) return "";
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return d.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" });
  };

  const calcularDuracion = (entrada, salida) => {
    if (!entrada || !salida) return "En curso";
    const e = entrada.toDate ? entrada.toDate() : new Date(entrada);
    const s = salida.toDate   ? salida.toDate()  : new Date(salida);
    const mins = Math.round((s - e) / 60000);
    if (mins < 1)  return "Menos de 1 min";
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  };

  // ─── PANTALLA: DETALLE ESTUDIANTE ─────────────────────────────────
  if (estudianteSeleccionado) {
    const puntosTotal  = historialEstudiante.reduce((a, r) => a + r.puntaje, 0);
    const cuentosLeidos = historialEstudiante.length;
    const promedioPct  = cuentosLeidos
      ? Math.round(historialEstudiante.reduce((a, r) => a + r.porcentaje, 0) / cuentosLeidos)
      : 0;

    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <div style={{ background: "linear-gradient(135deg,#667eea,#764ba2)", padding: "1.5rem", color: "#fff" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={cerrarDetalle} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>←</button>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "700" }}>{estudianteSeleccionado.nombre}</div>
              <div style={{ fontSize: "12px", opacity: 0.85 }}>Nivel {estudianteSeleccionado.nivelLector}</div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
          {/* Métricas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {[
              { label: "Cuentos leídos",  val: cuentosLeidos,    color: "#2d2d2d" },
              { label: "Puntos totales",  val: `${puntosTotal} ⭐`, color: "#667eea" },
              { label: "Promedio",        val: `${promedioPct}%`, color: promedioPct >= 75 ? "#1D9E75" : promedioPct >= 50 ? "#f39c12" : "#e74c3c" },
            ].map(m => (
              <div key={m.label} style={{ background: "#fff", borderRadius: "12px", padding: "0.85rem", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>{m.label}</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: m.color }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Tabs quizzes / sesiones */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {["quizzes", "sesiones"].map(t => (
              <button key={t} onClick={() => setTabDetalle(t)} style={{ padding: "7px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: tabDetalle === t ? "600" : "400", background: tabDetalle === t ? "#667eea" : "#fff", color: tabDetalle === t ? "#fff" : "#555", fontSize: "13px" }}>
                {t === "quizzes" ? "📝 Quizzes" : "🕐 Sesiones"}
              </button>
            ))}
          </div>

          {/* Tab: Quizzes */}
          {tabDetalle === "quizzes" && (
            <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {cargandoHistorial ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#888", fontSize: "14px" }}>Cargando...</div>
              ) : historialEstudiante.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                  <div style={{ fontSize: "14px" }}>Este estudiante aún no ha respondido ningún quiz.</div>
                </div>
              ) : (
                historialEstudiante.map(r => {
                  const pct = r.porcentaje ?? Math.round((r.puntaje / r.total) * 100);
                  const colorBarra = pct === 100 ? "#1D9E75" : pct >= 75 ? "#667eea" : pct >= 50 ? "#f39c12" : "#e74c3c";
                  return (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ fontSize: "26px" }}>{r.emojiCuento || "📖"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#2d2d2d", marginBottom: "4px" }}>{r.tituloCuento}</div>
                        <div style={{ background: "#f0f0f0", borderRadius: "6px", height: "6px", marginBottom: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: "6px", width: `${pct}%`, background: colorBarra }} />
                        </div>
                        <div style={{ fontSize: "11px", color: "#888" }}>{r.puntaje}/{r.total} correctas · {formatearFecha(r.fecha)}</div>
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: colorBarra }}>{pct}%</div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab: Sesiones */}
          {tabDetalle === "sesiones" && (
            <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {cargandoHistorial ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#888", fontSize: "14px" }}>Cargando...</div>
              ) : sesionesEstudiante.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                  <div style={{ fontSize: "14px" }}>Este estudiante aún no ha iniciado sesión.</div>
                </div>
              ) : (
                sesionesEstudiante.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: s.salida ? "#EAF3DE" : "#fff8e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                      {s.salida ? "✅" : "🟡"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#2d2d2d" }}>
                        {formatearFecha(s.entrada)}
                      </div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        Entrada: {formatearHora(s.entrada)}
                        {s.salida && ` · Salida: ${formatearHora(s.salida)}`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: s.salida ? "#1D9E75" : "#f39c12" }}>
                        {calcularDuracion(s.entrada, s.salida)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── PANTALLA PRINCIPAL ───────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ background: "linear-gradient(135deg,#667eea,#764ba2)", padding: "1.5rem", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "600px", margin: "0 auto" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700" }}>Panel Docente</div>
            <div style={{ fontSize: "13px", opacity: 0.85 }}>LeeConGustavito</div>
          </div>
          <button onClick={cerrarSesion} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
            Salir
          </button>
        </div>

        <div style={{ maxWidth: "600px", margin: "0.5rem auto 0", textAlign: "right" }}>
          <button onClick={() => navigate("/agregar-cuento")} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
            + Agregar cuento
          </button>
        </div>

        {codigoAula && (
          <div style={{ maxWidth: "600px", margin: "1rem auto 0", background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ fontSize: "12px", opacity: 0.85, marginBottom: "4px" }}>Código de aula — compártelo con tus estudiantes</div>
            <div style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "6px" }}>{codigoAula}</div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
          {["resumen", "estudiantes"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: tab === t ? "600" : "400", background: tab === t ? "#667eea" : "#fff", color: tab === t ? "#fff" : "#555", fontSize: "14px" }}>
              {t === "resumen" ? "Resumen" : "Estudiantes"}
            </button>
          ))}
        </div>

        {tab === "resumen" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1rem" }}>
              {[
                { label: "Total estudiantes", val: estudiantes.length },
                { label: "Promedio puntos",   val: estudiantes.length ? Math.round(estudiantes.reduce((a, e) => a + (e.puntosTotal || 0), 0) / estudiantes.length) : 0 },
              ].map(m => (
                <div key={m.label} style={{ background: "#fff", borderRadius: "12px", padding: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{m.label}</div>
                  <div style={{ fontSize: "26px", fontWeight: "700", color: "#2d2d2d" }}>{m.val}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>Distribución por nivel</div>
              {[1, 2, 3].map(nivel => {
                const cantidad = estudiantes.filter(e => e.nivelLector === nivel).length;
                const pct = estudiantes.length ? Math.round((cantidad / estudiantes.length) * 100) : 0;
                return (
                  <div key={nivel} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#555", marginBottom: "4px" }}>
                      <span>Nivel {nivel}</span><span>{cantidad} estudiantes</span>
                    </div>
                    <div style={{ background: "#f0f0f0", borderRadius: "6px", height: "8px" }}>
                      <div style={{ width: `${pct}%`, height: "8px", borderRadius: "6px", background: nivel === 1 ? "#1D9E75" : nivel === 2 ? "#667eea" : "#EF9F27" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "estudiantes" && (
          <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            {estudiantes.length === 0 ? (
              <p style={{ color: "#888", fontSize: "14px", textAlign: "center", padding: "2rem 0" }}>
                Aún no hay estudiantes en tu aula.<br />Comparte el código con ellos.
              </p>
            ) : (
              estudiantes.map(e => (
                <div key={e.id} onClick={() => verDetalleEstudiante(e)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f0f0f0", cursor: "pointer" }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#EEEDFE", color: "#3C3489", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "13px" }}>
                    {e.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "500" }}>{e.nombre}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>Nivel {e.nivelLector} · {e.puntosTotal || 0} pts</div>
                  </div>
                  <span style={{ fontSize: "13px", color: "#aaa" }}>Ver detalle →</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}