import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import './index.css'
const firebaseConfig = {
  apiKey: "AIzaSyAX4FP-FriGeTh2onTt95uCFUt-oSREUG0",
  authDomain: "teslcope.firebaseapp.com",
  databaseURL: "https://teslcope-default-rtdb.firebaseio.com",
  projectId: "teslcope",
  storageBucket: "teslcope.firebasestorage.app",
  messagingSenderId: "220058305878",
  appId: "1:220058305878:web:e89ce6bd46b8c63032c2f7",
};
 
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
 
const NAMED_STARS = [
  { id: "sirius",     name: "Sirius",     nameAr: "سيريوس",      constellation: "Canis Major",   x: 0.38, y: 0.22, magnitude: -1.46, type: "A1V",     color: "#b8d4ff", distance: "8.6 ly",  temp: "9940 K",  gamma: { flux: 0.0, detected: false },                    desc: "The brightest star in the night sky, located 8.6 light-years away." },
  { id: "canopus",    name: "Canopus",    nameAr: "سهيل",         constellation: "Carina",        x: 0.28, y: 0.72, magnitude: -0.74, type: "F0II",    color: "#fff8e0", distance: "310 ly",  temp: "7350 K",  gamma: { flux: 0.3, detected: true,  energy: "0.1–10 GeV"  }, desc: "The second-brightest star, used as a navigation reference by spacecraft." },
  { id: "aldebaran",  name: "Aldebaran",  nameAr: "الدبران",      constellation: "Taurus",        x: 0.52, y: 0.35, magnitude:  0.86, type: "K5III",   color: "#ffaa44", distance: "65 ly",   temp: "3910 K",  gamma: { flux: 0.8, detected: true,  energy: "0.3–3 GeV"   }, desc: "An orange giant marking the eye of the Bull in the constellation Taurus." },
  { id: "rigel",      name: "Rigel",      nameAr: "رجل الجبار",   constellation: "Orion",         x: 0.44, y: 0.28, magnitude:  0.13, type: "B8Ia",    color: "#cce0ff", distance: "860 ly",  temp: "12130 K", gamma: { flux: 1.4, detected: true,  energy: "1–100 GeV"   }, desc: "A blue supergiant in Orion, roughly 120,000× more luminous than the Sun." },
  { id: "betelgeuse", name: "Betelgeuse", nameAr: "إبط الجوزاء",  constellation: "Orion",         x: 0.47, y: 0.25, magnitude:  0.5,  type: "M2Ib",    color: "#ff6633", distance: "700 ly",  temp: "3500 K",  gamma: { flux: 0.5, detected: true,  energy: "0.5–5 GeV"   }, desc: "A red supergiant nearing the end of its life — a future supernova candidate." },
  { id: "vega",       name: "Vega",       nameAr: "النسر الواقع", constellation: "Lyra",          x: 0.72, y: 0.18, magnitude:  0.03, type: "A0Va",    color: "#ddeeff", distance: "25 ly",   temp: "9600 K",  gamma: { flux: 0.0, detected: false },                    desc: "The magnitude reference star; it was Earth's north pole star 14,000 years ago." },
  { id: "capella",    name: "Capella",    nameAr: "العيوق",        constellation: "Auriga",        x: 0.50, y: 0.42, magnitude:  0.08, type: "G5+G0",   color: "#ffe888", distance: "43 ly",   temp: "4940 K",  gamma: { flux: 1.9, detected: true,  energy: "0.1–50 GeV"  }, desc: "A binary system of two yellow giants orbiting each other in Auriga." },
  { id: "arcturus",   name: "Arcturus",   nameAr: "السماك الرامح", constellation: "Boötes",       x: 0.78, y: 0.55, magnitude: -0.05, type: "K1.5III", color: "#ffbb66", distance: "37 ly",   temp: "4290 K",  gamma: { flux: 0.2, detected: false },                    desc: "An orange giant in Boötes; the fourth-brightest star in the night sky." },
  { id: "procyon",    name: "Procyon",    nameAr: "الشعرى الشامية", constellation: "Canis Minor", x: 0.58, y: 0.30, magnitude:  0.34, type: "F5IV",    color: "#ffe4b0", distance: "11.5 ly", temp: "6530 K",  gamma: { flux: 0.0, detected: false },                    desc: "The eighth-brightest star in the night sky." },
  { id: "antares",    name: "Antares",    nameAr: "قلب العقرب",   constellation: "Scorpius",      x: 0.65, y: 0.70, magnitude:  1.0,  type: "M1.5Iab", color: "#ff4422", distance: "550 ly",  temp: "3400 K",  gamma: { flux: 2.1, detected: true,  energy: "0.1–300 GeV" }, desc: "A red supergiant marking the heart of the Scorpion constellation." },
];
 
const BG_STARS = Array.from({ length: 280 }, (_, i) => ({
  id: i, x: Math.random(), y: Math.random(),
  r: Math.random() * 1.2 + 0.3, op: Math.random() * 0.6 + 0.2,
}));
 
// ── hooks ─────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}
 
// ── GammaBar ──────────────────────────────────────────────────────────────────
function GammaBar({ flux, detected }) {
  const pct = Math.min(flux / 2.5, 1);
  const color = pct > 0.7 ? "#ff3366" : pct > 0.4 ? "#ffaa00" : "#44ffaa";
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "#8899bb", fontFamily: "monospace" }}>γ flux</span>
        <span style={{ fontSize: 11, color, fontFamily: "monospace" }}>
          {detected ? `${flux.toFixed(1)} × 10⁻⁸ ph/cm²/s` : "not detected"}
        </span>
      </div>
      <div style={{ height: 4, background: "#0d1a2e", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct * 100}%`,
          background: detected ? `linear-gradient(90deg,${color}88,${color})` : "#1a2a3a",
          borderRadius: 2, transition: "width .6s ease",
          boxShadow: detected ? `0 0 6px ${color}88` : "none",
        }} />
      </div>
    </div>
  );
}
 
// ── StarPanel ─────────────────────────────────────────────────────────────────
function StarPanel({ star, onClose, isMobile }) {
  if (!star) return null;
  const gd = star.gamma.detected;
  return (
    <div style={isMobile ? {
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(5,10,22,0.98)",
      border: `1px solid ${gd ? "#d4af3755" : "#1e3a5a"}`,
      borderRadius: "16px 16px 0 0",
      padding: "16px 20px 36px",
      backdropFilter: "blur(16px)",
      zIndex: 50,
      boxShadow: gd ? "0 -4px 40px #d4af3722" : "0 -4px 30px #00000099",
      animation: "slideUp .3s ease",
      maxHeight: "72vh", overflowY: "auto",
    } : {
      position: "absolute", top: 16, right: 16, width: 275,
      background: "rgba(5,10,22,0.96)",
      border: `1px solid ${gd ? "#d4af3744" : "#1e3a5a"}`,
      borderRadius: 12, padding: "16px 18px",
      backdropFilter: "blur(12px)",
      zIndex: 30,
      boxShadow: gd ? "0 0 24px #d4af3722,0 4px 24px #00000088" : "0 4px 24px #00000088",
      animation: "fadeIn .3s ease",
    }}>
      {isMobile && <div style={{ width: 36, height: 4, background: "#2a3a4a", borderRadius: 2, margin: "0 auto 14px" }} />}
 
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ color: "#d4af37", fontSize: isMobile ? 18 : 16, fontWeight: 700, letterSpacing: "0.02em" }}>{star.name}</div>
          <div style={{ color: "#6688aa", fontSize: 11, fontFamily: "monospace" }}>{star.nameAr} · {star.constellation}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#446688", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>×</button>
      </div>
 
      <div style={{ color: "#8899bb", fontSize: 13, marginBottom: 12, lineHeight: 1.7 }}>{star.desc}</div>
 
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 12 }}>
        {[
          ["Magnitude",  star.magnitude],
          ["Spec. Type", star.type],
          ["Temperature", star.temp],
          ["Distance",   star.distance],
        ].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 10, color: "#445566", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
            <div style={{ fontSize: 12, color: "#aaccee", fontFamily: "monospace" }}>{v}</div>
          </div>
        ))}
      </div>
 
      <div style={{ borderTop: "1px solid #1a2a3a", paddingTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: gd ? "#ff3366" : "#334455", boxShadow: gd ? "0 0 8px #ff3366" : "none", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: gd ? "#ff6688" : "#556677", fontWeight: gd ? 600 : 400 }}>
            {gd ? "✦ Gamma-ray detection confirmed" : "No gamma-ray detection"}
          </span>
        </div>
        {gd && <div style={{ fontSize: 11, color: "#cc8844", fontFamily: "monospace", marginBottom: 4 }}>Energy range: {star.gamma.energy}</div>}
        <GammaBar flux={star.gamma.flux} detected={gd} />
      </div>
    </div>
  );
}
 
// ── Desktop gamma sidebar ──────────────────────────────────────────────────────
function GammaSidebar({ detectedStars }) {
  return (
    <div style={{ position: "absolute", top: 16, left: 16, width: 190, background: "rgba(5,8,18,0.92)", border: "1px solid #1a2a4a", borderRadius: 10, padding: "12px 14px", zIndex: 20 }}>
      <div style={{ color: "#d4af37", fontSize: 12, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff3366", display: "inline-block", boxShadow: "0 0 6px #ff3366" }} />
        Gamma-Ray Monitor
      </div>
      {detectedStars.length === 0
        ? <div style={{ color: "#334455", fontSize: 11 }}>Hover over stars to scan</div>
        : detectedStars.map((s) => (
          <div key={s.id} style={{ marginBottom: 8, borderBottom: "1px solid #0d1a2e", paddingBottom: 6 }}>
            <div style={{ color: "#aaccee", fontSize: 12 }}>{s.name}</div>
            <div style={{ color: "#ff6688", fontSize: 10, fontFamily: "monospace" }}>{s.gamma.flux.toFixed(1)} ×10⁻⁸ ph/cm²/s</div>
            <GammaBar flux={s.gamma.flux} detected={s.gamma.detected} />
          </div>
        ))
      }
    </div>
  );
}
 
// ── Mobile bottom gamma strip ──────────────────────────────────────────────────
function MobileGammaStrip({ detectedStars }) {
  if (!detectedStars.length) return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", gap: 8, padding: "8px 12px 20px", background: "linear-gradient(transparent,rgba(2,5,15,.95))", overflowX: "auto", zIndex: 20 }}>
      {detectedStars.map((s) => (
        <div key={s.id} style={{ flexShrink: 0, background: "rgba(5,10,22,0.9)", border: "1px solid #ff336644", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff3366", display: "inline-block", boxShadow: "0 0 5px #ff3366" }} />
          <span style={{ fontSize: 12, color: "#aaccee", whiteSpace: "nowrap" }}>{s.name}</span>
          <span style={{ fontSize: 10, color: "#ff6688", fontFamily: "monospace" }}>{s.gamma.flux.toFixed(1)}γ</span>
        </div>
      ))}
    </div>
  );
}
 
// ── UserRegistration ───────────────────────────────────────────────────────────
function UserRegistration({ onRegister }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
 
  const handleSubmit = async () => {
    if (!name.trim()) { setError("Please enter your name"); return; }
    setSaving(true); setError("");
    try {
      await set(push(ref(db, "observers")), {
        name: name.trim(),
        joinedAt: new Date().toISOString(),
        location: "Amman",
      });
      onRegister(name.trim());
    } catch {
      setError("Connection error. Please try again.");
      setSaving(false);
    }
  };
 
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,5,15,.97)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "0 16px" }}>
      <div style={{ background: "rgba(8,14,30,.98)", border: "1px solid #d4af3733", borderRadius: 16, padding: "32px 28px", width: "100%", maxWidth: 360, boxShadow: "0 0 60px #d4af3711,0 20px 60px #00000088", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔭</div>
        <div style={{ color: "#d4af37", fontSize: 22, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 6 }}>
          Star Observatory
        </div>
        <div style={{ color: "#446688", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Enter your name to begin observing stars and gamma-ray signals
        </div>
        <input
          type="text"
          placeholder="Your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{ width: "100%", background: "#0d1a2e", border: "1px solid #1e3a5a", borderRadius: 8, padding: "12px 14px", color: "#cce4ff", fontSize: 16, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
        />
        {error && <div style={{ color: "#ff6644", fontSize: 13, marginBottom: 10 }}>{error}</div>}
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ width: "100%", background: saving ? "#1a2a3a" : "linear-gradient(135deg,#b8960c,#d4af37)", border: "none", borderRadius: 8, padding: "13px", color: saving ? "#446688" : "#0a0e18", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", transition: "all .2s", letterSpacing: "0.04em" }}
        >
          {saving ? "Saving..." : "Begin Observation ✦"}
        </button>
        <div style={{ marginTop: 14, fontSize: 11, color: "#2a3a4a" }}>
          Your data is stored in Firebase Realtime DB
        </div>
      </div>
    </div>
  );
}
 
// ── Main ───────────────────────────────────────────────────────────────────────
export default function StarMap() {
  const canvasRef = useRef(null);
  const isMobile = useIsMobile();
  const [user, setUser] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [selectedStar, setSelectedStar] = useState(null);
  const [detectedList, setDetectedList] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const touchStartedOnCanvas = useRef(false);
  const ignoreTouchUntil = useRef(0);
 
  // sync canvas resolution to viewport
  useEffect(() => {
    if (!user) return;
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, [user]);
 
  const drawCanvas = useCallback((ctx, w, h, t, hovered) => {
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = w / dpr;
    h = h / dpr;
    ctx.clearRect(0, 0, w, h);
 
    // deep space background
    const bg = ctx.createRadialGradient(w * .5, h * .4, 0, w * .5, h * .4, w * .7);
    bg.addColorStop(0, "#060d1e"); bg.addColorStop(.5, "#040810"); bg.addColorStop(1, "#020508");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
 
    for (let i = 0; i < 3; i++) {
      const gx = ctx.createRadialGradient(w * (.2 + i * .3), h * (.3 + i * .2), 0, w * (.2 + i * .3), h * (.3 + i * .2), w * .25);
      gx.addColorStop(0, `rgba(20,40,80,${.08 + i * .02})`); gx.addColorStop(1, "transparent");
      ctx.fillStyle = gx; ctx.fillRect(0, 0, w, h);
    }
 
    // background star field
    BG_STARS.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${Math.max(.1, Math.min(.9, s.op + Math.sin(t * .8 + s.id) * .12))})`;
      ctx.fill();
    });
 
    // named stars
    NAMED_STARS.forEach((star) => {
      const sx = star.x * w, sy = star.y * h;
      const isHov = hovered?.id === star.id;
      const r = Math.max(isMobile ? 3 : 2, (4 - star.magnitude) * (isMobile ? 1.9 : 1.4));
 
      // glow
      if (isHov || star.gamma.detected) {
        const glowR = isHov ? r * 5 : r * 3;
        const gc = star.gamma.detected ? "#ff3366" : star.color;
        const gg = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        gg.addColorStop(0, `${gc}44`); gg.addColorStop(1, "transparent");
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(sx, sy, glowR, 0, Math.PI * 2); ctx.fill();
      }
 
      // star body
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = star.color; ctx.fill();
 
      // hover ring
      if (isHov) {
        ctx.beginPath(); ctx.arc(sx, sy, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = `${star.color}88`; ctx.lineWidth = 1; ctx.stroke();
      }
 
      // gamma pulse ring
      if (star.gamma.detected) {
        const p = Math.sin(t * 2 + star.id.length) * .5 + .5;
        ctx.beginPath(); ctx.arc(sx, sy, r + 6 + p * 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,51,102,${.3 + p * .3})`; ctx.lineWidth = .5; ctx.stroke();
      }
 
      // star labels
      if (!isMobile || r > 4.5) {
        ctx.font = `${isHov ? "bold " : ""}${isMobile ? 10 : isHov ? 13 : 11}px 'Inter',sans-serif`;
        ctx.fillStyle = isHov ? "#d4af37" : "#7799bb";
        ctx.textAlign = "center";
        ctx.fillText(star.name, sx, sy - (r + 8));
      }
    });
  }, [isMobile]);
 
  useEffect(() => {
    if (!user) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const loop = (ts) => {
      timeRef.current = ts / 1000;
      drawCanvas(ctx, canvas.width, canvas.height, timeRef.current, hoveredStar);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [user, hoveredStar, drawCanvas]);
 
  const findNearest = useCallback((mx, my) => {
    const threshold = isMobile ? 0.07 : 0.04;
    let nearest = null, minD = Infinity;
    NAMED_STARS.forEach((s) => {
      const d = Math.hypot(s.x - mx, s.y - my);
      if (d < threshold && d < minD) { minD = d; nearest = s; }
    });
    return nearest;
  }, [isMobile]);
 
  const trackDetected = useCallback((star) => {
    if (!star?.gamma.detected) return;
    setDetectedList((p) => p.find((s) => s.id === star.id) ? p : [star, ...p].slice(0, 5));
  }, []);
 
  // mouse (desktop)
  const onMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    const n = findNearest(mx, my);
    setHoveredStar(n); trackDetected(n);
  }, [findNearest, trackDetected]);
 
  const onClick = useCallback(() => {
    if (hoveredStar) setSelectedStar(hoveredStar);
  }, [hoveredStar]);
 
  // touch (mobile)
  const onTouchStart = useCallback(() => {
    touchStartedOnCanvas.current = true;
  }, []);

  const onTouchEnd = useCallback((e) => {
    e.preventDefault();
    if (!touchStartedOnCanvas.current || Date.now() < ignoreTouchUntil.current) {
      touchStartedOnCanvas.current = false;
      return;
    }
    touchStartedOnCanvas.current = false;
    const touch = e.changedTouches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (touch.clientX - rect.left) / rect.width;
    const my = (touch.clientY - rect.top) / rect.height;
    const n = findNearest(mx, my);
    if (n) { setSelectedStar(n); trackDetected(n); }
    else setSelectedStar(null);
  }, [findNearest, trackDetected]);
 
  const handleRegister = useCallback((name) => {
    ignoreTouchUntil.current = Date.now() + 800;
    touchStartedOnCanvas.current = false;
    setSelectedStar(null);
    setHoveredStar(null);
    setUser(name);
  }, []);

  if (!user) return <UserRegistration onRegister={handleRegister} />;
 
  return (
    <div style={{ width: "100%", height: "100vh", background: "#020508", position: "relative", overflow: "hidden", touchAction: "none" }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        @keyframes slideUp { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:none} }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        canvas { display: block; }
      `}</style>
 
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", cursor: hoveredStar ? "pointer" : "crosshair" }}
        onMouseMove={!isMobile ? onMouseMove : undefined}
        onClick={!isMobile ? onClick : undefined}
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
      />
 
      {/* header bar */}
      <div style={{
        position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
        background: "rgba(5,10,22,.88)", border: "1px solid #1e3a5a",
        borderRadius: 20, padding: isMobile ? "5px 14px" : "6px 20px",
        color: "#7799bb", fontSize: isMobile ? 11 : 12,
        zIndex: 20, whiteSpace: "nowrap",
        maxWidth: "calc(100% - 24px)", overflow: "hidden", textOverflow: "ellipsis",
        letterSpacing: "0.02em",
      }}>
        <span style={{ color: "#d4af37" }}>✦ {user}</span>
        {isMobile
          ? <> · <span style={{ color: "#ff6688" }}>● γ</span></>
          : <> · Star Observatory · <span style={{ color: "#ff6688" }}>● gamma</span> marks active stars</>
        }
      </div>
 
      {/* desktop sidebar */}
      {!isMobile && <GammaSidebar detectedStars={detectedList} />}
 
      {/* desktop star panel */}
      {!isMobile && <StarPanel star={selectedStar} onClose={() => setSelectedStar(null)} isMobile={false} />}
 
      {/* mobile bottom sheet */}
      {isMobile && selectedStar && <StarPanel star={selectedStar} onClose={() => setSelectedStar(null)} isMobile={true} />}
 
      {/* mobile gamma strip */}
      {isMobile && !selectedStar && <MobileGammaStrip detectedStars={detectedList} />}
 
      {/* desktop hover tooltip */}
      {!isMobile && hoveredStar && !selectedStar && (
        <div style={{ position: "absolute", left: mousePos.x + 14, top: mousePos.y - 30, background: "rgba(5,10,22,.9)", border: "1px solid #1e3a5a", borderRadius: 6, padding: "4px 10px", color: "#aaccee", fontSize: 12, pointerEvents: "none", zIndex: 25, whiteSpace: "nowrap" }}>
          {hoveredStar.name}
          {hoveredStar.gamma.detected && <span style={{ color: "#ff3366", marginLeft: 6 }}>γ</span>}
        </div>
      )}
 
      {/* compass */}
      <div style={{ position: "absolute", bottom: isMobile ? 68 : 16, right: 16, display: "flex", gap: 8, alignItems: "center" }}>
        {["W", "N", "E"].map((d) => (
          <div key={d} style={{ color: "#cc4444", fontSize: 11, fontWeight: 700, width: 20, height: 20, borderRadius: "50%", border: "1px solid #cc444466", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>{d}</div>
        ))}
      </div>
 
      {/* mobile first-use hint */}
      {isMobile && !selectedStar && detectedList.length === 0 && (
        <div style={{ position: "absolute", bottom: 76, left: "50%", transform: "translateX(-50%)", background: "rgba(5,10,22,.8)", border: "1px solid #1e3a5a", borderRadius: 20, padding: "6px 16px", color: "#556677", fontSize: 12, whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none" }}>
          Tap any star to view details
        </div>
      )}
    </div>
  );
}
