import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AgregarCuento() {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [nivel, setNivel] = useState(1);
  const [emoji, setEmoji] = useState("📖");
  const [preguntas, setPreguntas] = useState([
    { pregunta: "", opciones: ["", "", ""], correcta: 0 }
  ]);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const navigate = useNavigate();

  const agregarPregunta = () => {
    setPreguntas([...preguntas, { pregunta: "", opciones: ["", "", ""], correcta: 0 }]);
  };

  const actualizarPregunta = (i, campo, valor) => {
    const nuevas = [...preguntas];
    nuevas[i][campo] = valor;
    setPreguntas(nuevas);
  };

  const actualizarOpcion = (pi, oi, valor) => {
    const nuevas = [...preguntas];
    nuevas[pi].opciones[oi] = valor;
    setPreguntas(nuevas);
  };

  const eliminarPregunta = (i) => {
    setPreguntas(preguntas.filter((_, idx) => idx !== i));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await addDoc(collection(db, "cuentos"), {
        titulo,
        contenido,
        nivel: parseInt(nivel),
        emoji,
        preguntas: preguntas.filter(p => p.pregunta.trim() !== ""),
        creadoEn: new Date(),
        creadoPor: auth.currentUser?.uid,
      });
      setExito(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch {
      alert("Error al guardar el cuento.");
    } finally {
      setGuardando(false);
    }
  };

  const inp = { width:"100%", padding:"10px 12px", fontSize:"14px", border:"1.5px solid #e0e0e0", borderRadius:"8px", outline:"none", boxSizing:"border-box", marginBottom:"12px" };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5" }}>
      <div style={{ background:"linear-gradient(135deg,#667eea,#764ba2)", padding:"1rem 1.5rem", color:"#fff", display:"flex", alignItems:"center", gap:"12px" }}>
        <button onClick={() => navigate("/dashboard")} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", padding:"6px 12px", borderRadius:"8px", cursor:"pointer" }}>←</button>
        <span style={{ fontWeight:"600", fontSize:"16px" }}>Agregar cuento</span>
      </div>

      <div style={{ maxWidth:"600px", margin:"0 auto", padding:"1.5rem" }}>
        {exito && (
          <div style={{ background:"#E1F5EE", color:"#085041", padding:"12px 16px", borderRadius:"10px", marginBottom:"1rem", fontSize:"14px", textAlign:"center" }}>
            ✅ ¡Cuento guardado! Redirigiendo...
          </div>
        )}

        <form onSubmit={guardar}>
          <div style={{ background:"#fff", borderRadius:"14px", padding:"1.25rem", marginBottom:"12px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:"14px", fontWeight:"600", marginBottom:"12px" }}>Información del cuento</div>

            <label style={{ fontSize:"13px", color:"#555", display:"block", marginBottom:"4px" }}>Emoji del cuento</label>
            <input style={inp} value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="📖" />

            <label style={{ fontSize:"13px", color:"#555", display:"block", marginBottom:"4px" }}>Título</label>
            <input style={inp} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="La tortuga y el conejo" required />

            <label style={{ fontSize:"13px", color:"#555", display:"block", marginBottom:"4px" }}>Nivel</label>
            <select style={inp} value={nivel} onChange={e => setNivel(e.target.value)}>
              <option value={1}>Nivel 1 — Fácil</option>
              <option value={2}>Nivel 2 — Medio</option>
              <option value={3}>Nivel 3 — Avanzado</option>
            </select>

            <label style={{ fontSize:"13px", color:"#555", display:"block", marginBottom:"4px" }}>Contenido del cuento</label>
            <textarea
              style={{ ...inp, height:"160px", resize:"vertical", fontFamily:"inherit" }}
              value={contenido}
              onChange={e => setContenido(e.target.value)}
              placeholder="Escribe aquí el cuento..."
              required
            />
          </div>

          <div style={{ background:"#fff", borderRadius:"14px", padding:"1.25rem", marginBottom:"12px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
              <div style={{ fontSize:"14px", fontWeight:"600" }}>Preguntas del quiz</div>
              <button type="button" onClick={agregarPregunta} style={{ fontSize:"13px", padding:"6px 12px", background:"#EEEDFE", color:"#3C3489", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"500" }}>
                + Agregar
              </button>
            </div>

            {preguntas.map((p, pi) => (
              <div key={pi} style={{ background:"#f9f9f9", borderRadius:"10px", padding:"12px", marginBottom:"10px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                  <span style={{ fontSize:"13px", fontWeight:"600", color:"#555" }}>Pregunta {pi + 1}</span>
                  {preguntas.length > 1 && (
                    <button type="button" onClick={() => eliminarPregunta(pi)} style={{ fontSize:"12px", color:"#e74c3c", background:"none", border:"none", cursor:"pointer" }}>
                      Eliminar
                    </button>
                  )}
                </div>
                <input
                  style={{ ...inp, marginBottom:"8px" }}
                  value={p.pregunta}
                  onChange={e => actualizarPregunta(pi, "pregunta", e.target.value)}
                  placeholder="¿Cuál es la pregunta?"
                />
                {p.opciones.map((op, oi) => (
                  <div key={oi} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                    <input
                      type="radio"
                      name={`correcta-${pi}`}
                      checked={p.correcta === oi}
                      onChange={() => actualizarPregunta(pi, "correcta", oi)}
                      title="Marcar como correcta"
                    />
                    <input
                      style={{ ...inp, marginBottom:"0", flex:1 }}
                      value={op}
                      onChange={e => actualizarOpcion(pi, oi, e.target.value)}
                      placeholder={`Opción ${oi + 1}`}
                    />
                  </div>
                ))}
                <div style={{ fontSize:"11px", color:"#888", marginTop:"4px" }}>
                  Selecciona el círculo de la opción correcta
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={guardando}
            style={{ width:"100%", padding:"13px", fontSize:"15px", fontWeight:"600", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"#fff", border:"none", borderRadius:"10px", cursor:"pointer" }}
          >
            {guardando ? "Guardando..." : "Guardar cuento 📖"}
          </button>
        </form>
      </div>
    </div>
  );
}