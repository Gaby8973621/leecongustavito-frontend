import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AppEstudiante() {
  const [tab, setTab] = useState("leer");
  const [cuentos, setCuentos] = useState([]);
  const [cuentoActivo, setCuentoActivo] = useState(null);
  const [fase, setFase] = useState("lista"); // lista | leer | quiz
  const [respuesta, setRespuesta] = useState(null);
  const navigate = useNavigate();

  const estudiante = JSON.parse(localStorage.getItem("estudiante") || "null");

  useEffect(() => {
    if (!estudiante) { navigate("/seleccion"); return; }
    const cargar = async () => {
      const snap = await getDocs(collection(db, "cuentos"));
      setCuentos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    cargar();
  }, []);

  const salir = () => {
    localStorage.removeItem("estudiante");
    navigate("/seleccion");
  };

  if (fase === "leer" && cuentoActivo) {
    return (
      <div style={{ minHeight:"100vh", background:"#f5f5f5" }}>
        <div style={{ background:"linear-gradient(135deg,#667eea,#764ba2)", padding:"1rem 1.5rem", color:"#fff", display:"flex", alignItems:"center", gap:"12px" }}>
          <button onClick={() => { setFase("lista"); setCuentoActivo(null); }} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", padding:"6px 12px", borderRadius:"8px", cursor:"pointer" }}>←</button>
          <span style={{ fontWeight:"600", fontSize:"16px" }}>{cuentoActivo.titulo}</span>
        </div>
        <div style={{ maxWidth:"600px", margin:"0 auto", padding:"1.5rem" }}>
          <div style={{ textAlign:"center", fontSize:"52px", marginBottom:"12px" }}>{cuentoActivo.emoji || "📖"}</div>
          <div style={{ background:"#fff", borderRadius:"14px", padding:"1.5rem", fontSize:"15px", lineHeight:"1.9", color:"#2d2d2d", marginBottom:"1rem", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            {cuentoActivo.contenido}
          </div>
          <button
            onClick={() => setFase("quiz")}
            style={{ width:"100%", padding:"13px", fontSize:"15px", fontWeight:"600", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"#fff", border:"none", borderRadius:"10px", cursor:"pointer" }}
          >
            ¡Responder preguntas! ❓
          </button>
        </div>
      </div>
    );
  }

  if (fase === "quiz" && cuentoActivo) {
    const preguntas = cuentoActivo.preguntas || [];
    return (
      <div style={{ minHeight:"100vh", background:"#f5f5f5" }}>
        <div style={{ background:"linear-gradient(135deg,#667eea,#764ba2)", padding:"1rem 1.5rem", color:"#fff", display:"flex", alignItems:"center", gap:"12px" }}>
          <button onClick={() => setFase("leer")} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", padding:"6px 12px", borderRadius:"8px", cursor:"pointer" }}>←</button>
          <span style={{ fontWeight:"600" }}>Quiz — {cuentoActivo.titulo}</span>
        </div>
        <div style={{ maxWidth:"600px", margin:"0 auto", padding:"1.5rem" }}>
          {preguntas.length === 0 ? (
            <div style={{ background:"#fff", borderRadius:"14px", padding:"2rem", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:"48px", marginBottom:"12px" }}>🎉</div>
              <div style={{ fontSize:"16px", fontWeight:"600", marginBottom:"8px" }}>¡Terminaste el cuento!</div>
              <div style={{ fontSize:"14px", color:"#888", marginBottom:"1.5rem" }}>Este cuento aún no tiene preguntas.</div>
              <button onClick={() => { setFase("lista"); setCuentoActivo(null); setRespuesta(null); }} style={{ padding:"10px 24px", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"#fff", border:"none", borderRadius:"10px", cursor:"pointer", fontSize:"14px", fontWeight:"600" }}>
                Volver a cuentos
              </button>
            </div>
          ) : (
            preguntas.map((p, i) => (
              <div key={i} style={{ background:"#fff", borderRadius:"14px", padding:"1.25rem", marginBottom:"12px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:"15px", fontWeight:"600", marginBottom:"12px" }}>{i+1}. {p.pregunta}</div>
                {p.opciones.map((op, j) => (
                  <button
                    key={j}
                    onClick={() => setRespuesta({ pregunta: i, opcion: j })}
                    style={{
                      width:"100%", textAlign:"left", padding:"10px 14px", marginBottom:"8px",
                      fontSize:"14px", borderRadius:"8px", cursor:"pointer",
                      border: respuesta?.pregunta === i && respuesta?.opcion === j
                        ? (j === p.correcta ? "2px solid #1D9E75" : "2px solid #e74c3c")
                        : "1.5px solid #e0e0e0",
                      background: respuesta?.pregunta === i && respuesta?.opcion === j
                        ? (j === p.correcta ? "#E1F5EE" : "#fdecea")
                        : "#fff",
                      color: respuesta?.pregunta === i && respuesta?.opcion === j
                        ? (j === p.correcta ? "#085041" : "#c0392b")
                        : "#2d2d2d",
                    }}
                  >
                    {op}
                  </button>
                ))}
              </div>
            ))
          )}
          {preguntas.length > 0 && (
            <button onClick={() => { setFase("lista"); setCuentoActivo(null); setRespuesta(null); }} style={{ width:"100%", padding:"13px", fontSize:"15px", fontWeight:"600", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"#fff", border:"none", borderRadius:"10px", cursor:"pointer" }}>
              ¡Listo! Volver a cuentos 🎉
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5" }}>
      <div style={{ background:"linear-gradient(135deg,#667eea,#764ba2)", padding:"1.2rem 1.5rem", color:"#fff" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:"18px", fontWeight:"700" }}>¡Hola, {estudiante?.nombre}! 👋</div>
            <div style={{ fontSize:"13px", opacity:0.85 }}>¿Qué quieres leer hoy?</div>
          </div>
          <button onClick={salir} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", padding:"8px 14px", borderRadius:"8px", cursor:"pointer", fontSize:"13px" }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ display:"flex", gap:"8px", padding:"12px 16px", background:"#fff", borderBottom:"1px solid #f0f0f0" }}>
        {["leer","progreso"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"7px 16px", borderRadius:"8px", border:"none", cursor:"pointer", fontWeight: tab===t ? "600":"400", background: tab===t ? "#667eea":"#f5f5f5", color: tab===t ? "#fff":"#555", fontSize:"13px" }}>
            {t === "leer" ? "📚 Leer" : "⭐ Mi progreso"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:"600px", margin:"0 auto", padding:"1rem" }}>
        {tab === "leer" && (
          <div>
            {cuentos.length === 0 ? (
              <div style={{ textAlign:"center", padding:"3rem 1rem", color:"#888" }}>
                <div style={{ fontSize:"48px", marginBottom:"12px" }}>📭</div>
                <div style={{ fontSize:"15px" }}>Aún no hay cuentos disponibles.</div>
                <div style={{ fontSize:"13px", marginTop:"6px" }}>Tu maestra los agregará pronto.</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                {cuentos.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setCuentoActivo(c); setFase("leer"); }}
                    style={{ background:"#fff", borderRadius:"14px", padding:"1rem", cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", textAlign:"center" }}
                  >
                    <div style={{ fontSize:"36px", marginBottom:"6px" }}>{c.emoji || "📖"}</div>
                    <div style={{ fontSize:"13px", fontWeight:"600", color:"#2d2d2d", marginBottom:"6px" }}>{c.titulo}</div>
                    <span style={{ fontSize:"11px", padding:"3px 10px", borderRadius:"20px", background: c.nivel===1?"#EAF3DE":c.nivel===2?"#EEEDFE":"#FAEEDA", color: c.nivel===1?"#27500A":c.nivel===2?"#3C3489":"#633806", fontWeight:"500" }}>
                      Nivel {c.nivel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "progreso" && (
          <div style={{ background:"#fff", borderRadius:"14px", padding:"1.5rem", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", textAlign:"center" }}>
            <div style={{ fontSize:"48px", marginBottom:"12px" }}>🌟</div>
            <div style={{ fontSize:"16px", fontWeight:"600", marginBottom:"6px" }}>{estudiante?.nombre}</div>
            <div style={{ fontSize:"13px", color:"#888", marginBottom:"1.5rem" }}>¡Sigue leyendo para ganar más puntos!</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              <div style={{ background:"#f5f5f5", borderRadius:"10px", padding:"1rem" }}>
                <div style={{ fontSize:"11px", color:"#888", marginBottom:"4px" }}>Cuentos leídos</div>
                <div style={{ fontSize:"24px", fontWeight:"700", color:"#2d2d2d" }}>0</div>
              </div>
              <div style={{ background:"#f5f5f5", borderRadius:"10px", padding:"1rem" }}>
                <div style={{ fontSize:"11px", color:"#888", marginBottom:"4px" }}>Puntos totales</div>
                <div style={{ fontSize:"24px", fontWeight:"700", color:"#667eea" }}>0</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}