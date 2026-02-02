"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

function useMousePosition() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

interface Star {
  x: number;
  y: number;
  size: number;
  layer: number; // 0=far, 1=mid, 2=close
  brightness: number;
  dx: number; // displacement offset from mouse push
  dy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: [number, number, number];
  opacity: number;
  layer: number;
}

function StarField({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const shootingRef = useRef<ShootingStar | null>(null);
  const frameRef = useRef<number>(0);
  const initedRef = useRef(false);
  const mouseRef = useRef({ x: mouseX, y: mouseY });

  mouseRef.current = { x: mouseX, y: mouseY };

  const init = useCallback((w: number, h: number) => {
    // Stars: 1000 total across 3 layers
    const stars: Star[] = [];
    const counts = [500, 350, 150]; // far, mid, close
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < counts[layer]; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: layer === 0 ? Math.random() * 1 + 0.3 : layer === 1 ? Math.random() * 1.5 + 0.5 : Math.random() * 2 + 1,
          layer,
          brightness: Math.random() * 0.5 + 0.5,
          dx: 0,
          dy: 0,
        });
      }
    }
    starsRef.current = stars;

    // Nebulae
    nebulaeRef.current = [
      { x: w * 0.2, y: h * 0.3, radius: 300, color: [100, 50, 180], opacity: 0.04, layer: 0 },
      { x: w * 0.75, y: h * 0.2, radius: 250, color: [30, 80, 200], opacity: 0.035, layer: 0 },
      { x: w * 0.5, y: h * 0.7, radius: 350, color: [0, 150, 200], opacity: 0.03, layer: 1 },
      { x: w * 0.85, y: h * 0.75, radius: 200, color: [120, 40, 160], opacity: 0.03, layer: 0 },
    ];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (!initedRef.current) {
        init(canvas.width, canvas.height);
        initedRef.current = true;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const parallaxStrength = [0.01, 0.025, 0.05]; // per layer

    let lastShootingCheck = 0;

    const draw = (time: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      // Normalized mouse offset from center (-1 to 1)
      const ox = (mx - w / 2) / (w / 2);
      const oy = (my - h / 2) / (h / 2);

      ctx.clearRect(0, 0, w, h);

      // Draw nebulae
      for (const n of nebulaeRef.current) {
        const p = parallaxStrength[n.layer];
        const nx = n.x - ox * p * w;
        const ny = n.y - oy * p * h;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.radius);
        grad.addColorStop(0, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${n.opacity})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(nx - n.radius, ny - n.radius, n.radius * 2, n.radius * 2);
      }

      // Draw WASP-76b planet
      const planetBaseX = w * 0.78;
      const planetBaseY = h * 0.35;
      const planetRadius = Math.min(w, h) * 0.12;
      const planetParallax = 0.015;
      const px = planetBaseX - ox * planetParallax * w;
      const py = planetBaseY - oy * planetParallax * h;
      const t = time * 0.001;

      ctx.save();

      // Outer atmosphere glow - deep blue/purple/cyan
      const outerGlow = ctx.createRadialGradient(px, py, planetRadius * 0.8, px, py, planetRadius * 2.8);
      outerGlow.addColorStop(0, "rgba(100,140,255,0.07)");
      outerGlow.addColorStop(0.3, "rgba(140,80,220,0.04)");
      outerGlow.addColorStop(0.6, "rgba(80,180,255,0.02)");
      outerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = outerGlow;
      ctx.fillRect(px - planetRadius * 3, py - planetRadius * 3, planetRadius * 6, planetRadius * 6);

      // Planet body - deep blues, teals, purples
      ctx.beginPath();
      ctx.arc(px, py, planetRadius, 0, Math.PI * 2);
      const bodyGrad = ctx.createRadialGradient(
        px - planetRadius * 0.35, py - planetRadius * 0.25, planetRadius * 0.05,
        px + planetRadius * 0.1, py + planetRadius * 0.1, planetRadius
      );
      bodyGrad.addColorStop(0, "rgba(80,120,180,0.95)");
      bodyGrad.addColorStop(0.25, "rgba(50,80,140,0.95)");
      bodyGrad.addColorStop(0.5, "rgba(35,50,100,0.95)");
      bodyGrad.addColorStop(0.75, "rgba(20,25,60,0.95)");
      bodyGrad.addColorStop(1, "rgba(8,8,25,0.95)");
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Subtle surface swirls (no hard bands)
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, planetRadius, 0, Math.PI * 2);
      ctx.clip();
      for (let i = 0; i < 5; i++) {
        const swY = py - planetRadius * 0.6 + (planetRadius * 1.2 * i) / 4;
        const swX = px + Math.sin(t * 0.03 + i * 2.1) * planetRadius * 0.15;
        const swR = planetRadius * (0.3 + i * 0.08);
        const swirl = ctx.createRadialGradient(swX, swY, 0, swX, swY, swR);
        const colors = [
          "rgba(60,100,160,0.08)", "rgba(80,50,140,0.06)", "rgba(40,140,160,0.07)",
          "rgba(100,70,180,0.06)", "rgba(50,120,140,0.07)"
        ];
        swirl.addColorStop(0, colors[i]);
        swirl.addColorStop(1, "transparent");
        ctx.fillStyle = swirl;
        ctx.fillRect(swX - swR, swY - swR, swR * 2, swR * 2);
      }
      // Molten glow on terminator line (where iron condenses)
      const moltenX = px + planetRadius * 0.15;
      const moltenGrad = ctx.createLinearGradient(moltenX - planetRadius * 0.15, py, moltenX + planetRadius * 0.15, py);
      moltenGrad.addColorStop(0, "transparent");
      moltenGrad.addColorStop(0.4, "rgba(255,160,60,0.06)");
      moltenGrad.addColorStop(0.6, "rgba(255,120,40,0.08)");
      moltenGrad.addColorStop(1, "transparent");
      ctx.fillStyle = moltenGrad;
      ctx.fillRect(px - planetRadius, py - planetRadius, planetRadius * 2, planetRadius * 2);
      ctx.restore();

      // Terminator shadow
      ctx.beginPath();
      ctx.arc(px, py, planetRadius, 0, Math.PI * 2);
      const shadowGrad = ctx.createLinearGradient(
        px - planetRadius * 0.3, py, px + planetRadius * 1.1, py
      );
      shadowGrad.addColorStop(0, "transparent");
      shadowGrad.addColorStop(0.45, "transparent");
      shadowGrad.addColorStop(0.75, "rgba(0,0,0,0.5)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = shadowGrad;
      ctx.fill();

      // Atmosphere rim - blue/cyan lit edge
      ctx.beginPath();
      ctx.arc(px, py, planetRadius, 0, Math.PI * 2);
      const rimGrad = ctx.createRadialGradient(px, py, planetRadius * 0.88, px, py, planetRadius * 1.02);
      rimGrad.addColorStop(0, "transparent");
      rimGrad.addColorStop(0.5, "transparent");
      rimGrad.addColorStop(0.8, "rgba(100,180,255,0.15)");
      rimGrad.addColorStop(1, "rgba(80,160,255,0.08)");
      ctx.fillStyle = rimGrad;
      ctx.fill();

      ctx.restore();

      // Iron rain from space - 3D perspective falling toward planet
      for (let i = 0; i < 25; i++) {
        const seed = i * 97.3 + 42;
        const angle = (seed % 360) * Math.PI / 180;
        const speed = 0.4 + (i % 7) * 0.12;
        // Each drop orbits from far away toward the planet
        const progress = ((t * speed + seed) % 8) / 8; // 0 to 1 = far to planet surface
        // Start far from planet, converge toward it
        const startDist = planetRadius * 4;
        const endDist = planetRadius * 0.3;
        const dist = startDist - progress * (startDist - endDist);
        // Spiral slightly inward
        const spiralAngle = angle + progress * 0.5;
        const rainX = px + Math.cos(spiralAngle) * dist * (0.6 + Math.sin(seed) * 0.4);
        const rainY = py + Math.sin(spiralAngle) * dist * (0.6 + Math.cos(seed) * 0.4);
        // Size: small far away, bigger as it approaches
        const size = 0.5 + progress * 2;
        // Brightness: faint far away, bright close
        const alpha = 0.05 + progress * 0.4;
        // Trail behind the drop (away from planet)
        const trailLen = (10 + progress * 30) * (1 - progress * 0.3);
        const trailDx = (rainX - px) / dist * trailLen;
        const trailDy = (rainY - py) / dist * trailLen;

        // Color: golden/orange iron glow
        const trailGrad = ctx.createLinearGradient(rainX, rainY, rainX + trailDx, rainY + trailDy);
        trailGrad.addColorStop(0, `rgba(255,180,80,${alpha})`);
        trailGrad.addColorStop(1, "transparent");
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = size * 0.7;
        ctx.beginPath();
        ctx.moveTo(rainX, rainY);
        ctx.lineTo(rainX + trailDx, rainY + trailDy);
        ctx.stroke();

        // Drop head - bright point
        ctx.beginPath();
        ctx.arc(rainX, rainY, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,200,120,${alpha * 0.8})`;
        ctx.fill();
      }

      // Draw 55 Cancri e (lava/diamond super-earth) - left side
      const p2BaseX = w * 0.18;
      const p2BaseY = h * 0.6;
      const p2Radius = Math.min(w, h) * 0.09;
      const p2x = p2BaseX - ox * 0.012 * w;
      const p2y = p2BaseY - oy * 0.012 * h;

      ctx.save();

      // Outer glow - warm amber/magenta
      const p2Glow = ctx.createRadialGradient(p2x, p2y, p2Radius * 0.8, p2x, p2y, p2Radius * 2.5);
      p2Glow.addColorStop(0, "rgba(255,140,60,0.06)");
      p2Glow.addColorStop(0.3, "rgba(220,80,180,0.03)");
      p2Glow.addColorStop(1, "transparent");
      ctx.fillStyle = p2Glow;
      ctx.fillRect(p2x - p2Radius * 3, p2y - p2Radius * 3, p2Radius * 6, p2Radius * 6);

      // Planet body - dark obsidian with magma veins
      ctx.beginPath();
      ctx.arc(p2x, p2y, p2Radius, 0, Math.PI * 2);
      const p2Body = ctx.createRadialGradient(
        p2x - p2Radius * 0.3, p2y - p2Radius * 0.3, p2Radius * 0.05,
        p2x + p2Radius * 0.1, p2y + p2Radius * 0.1, p2Radius
      );
      p2Body.addColorStop(0, "rgba(60,40,50,0.95)");
      p2Body.addColorStop(0.3, "rgba(40,25,35,0.95)");
      p2Body.addColorStop(0.6, "rgba(25,15,20,0.95)");
      p2Body.addColorStop(1, "rgba(8,4,8,0.95)");
      ctx.fillStyle = p2Body;
      ctx.fill();

      // Lava cracks / magma veins
      ctx.save();
      ctx.beginPath();
      ctx.arc(p2x, p2y, p2Radius, 0, Math.PI * 2);
      ctx.clip();
      for (let i = 0; i < 12; i++) {
        const seed = i * 53.7 + 17;
        const crackX = p2x - p2Radius * 0.7 + (Math.sin(seed * 1.3) * 0.5 + 0.5) * p2Radius * 1.4;
        const crackY = p2y - p2Radius * 0.7 + (Math.cos(seed * 0.7) * 0.5 + 0.5) * p2Radius * 1.4;
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.5 + seed);
        const crackR = p2Radius * (0.08 + (i % 4) * 0.03) * pulse;
        const lava = ctx.createRadialGradient(crackX, crackY, 0, crackX, crackY, crackR);
        lava.addColorStop(0, `rgba(255,${120 + (i % 3) * 40},${30 + (i % 2) * 30},${0.15 * pulse})`);
        lava.addColorStop(1, "transparent");
        ctx.fillStyle = lava;
        ctx.fillRect(crackX - crackR, crackY - crackR, crackR * 2, crackR * 2);
      }
      // Diamond-like specular highlights
      for (let i = 0; i < 6; i++) {
        const seed = i * 41.3 + 7;
        const hx = p2x - p2Radius * 0.5 + (Math.sin(seed * 2.1) * 0.5 + 0.5) * p2Radius;
        const hy = p2y - p2Radius * 0.5 + (Math.cos(seed * 1.7) * 0.5 + 0.5) * p2Radius;
        const sparkle = 0.5 + 0.5 * Math.sin(t * 1.5 + seed * 3);
        ctx.beginPath();
        ctx.arc(hx, hy, 1 + sparkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.1 * sparkle})`;
        ctx.fill();
      }
      ctx.restore();

      // Shadow (light from upper-left)
      ctx.beginPath();
      ctx.arc(p2x, p2y, p2Radius, 0, Math.PI * 2);
      const p2Shadow = ctx.createRadialGradient(
        p2x - p2Radius * 0.4, p2y - p2Radius * 0.3, p2Radius * 0.2,
        p2x, p2y, p2Radius
      );
      p2Shadow.addColorStop(0, "transparent");
      p2Shadow.addColorStop(0.5, "transparent");
      p2Shadow.addColorStop(0.8, "rgba(0,0,0,0.4)");
      p2Shadow.addColorStop(1, "rgba(0,0,0,0.8)");
      ctx.fillStyle = p2Shadow;
      ctx.fill();

      // Atmosphere rim - warm amber
      ctx.beginPath();
      ctx.arc(p2x, p2y, p2Radius, 0, Math.PI * 2);
      const p2Rim = ctx.createRadialGradient(p2x, p2y, p2Radius * 0.88, p2x, p2y, p2Radius * 1.02);
      p2Rim.addColorStop(0, "transparent");
      p2Rim.addColorStop(0.6, "transparent");
      p2Rim.addColorStop(0.85, "rgba(255,160,80,0.12)");
      p2Rim.addColorStop(1, "rgba(255,120,60,0.06)");
      ctx.fillStyle = p2Rim;
      ctx.fill();

      ctx.restore();

      // Draw stars with mouse repulsion
      const pushRadius = 150;
      const pushStrength = [20, 40, 70]; // per layer (close stars pushed more)
      const springBack = 0.08;

      for (const s of starsRef.current) {
        const p = parallaxStrength[s.layer];
        const sx = s.x - ox * p * w;
        const sy = s.y - oy * p * h;

        // Mouse repulsion
        const distX = sx + s.dx - mx;
        const distY = sy + s.dy - my;
        const dist = Math.sqrt(distX * distX + distY * distY);

        if (dist < pushRadius && dist > 0) {
          const force = (1 - dist / pushRadius) * pushStrength[s.layer];
          s.dx += (distX / dist) * force * 0.1;
          s.dy += (distY / dist) * force * 0.1;
        }

        // Spring back to origin
        s.dx *= 1 - springBack;
        s.dy *= 1 - springBack;

        // Wrap
        const wx = (((sx + s.dx) % w) + w) % w;
        const wy = (((sy + s.dy) % h) + h) % h;

        const alpha = s.brightness;

        ctx.beginPath();
        ctx.arc(wx, wy, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      // Shooting star logic
      if (time - lastShootingCheck > 2000) {
        lastShootingCheck = time;
        if (!shootingRef.current && Math.random() < 0.15) {
          const startX = Math.random() * w;
          const angle = Math.PI * 0.2 + Math.random() * 0.3;
          shootingRef.current = {
            x: startX,
            y: -10,
            vx: Math.cos(angle) * 12,
            vy: Math.sin(angle) * 12,
            life: 0,
            maxLife: 60 + Math.random() * 40,
            length: 80 + Math.random() * 60,
          };
        }
      }

      if (shootingRef.current) {
        const ss = shootingRef.current;
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;

        const alpha = 1 - ss.life / ss.maxLife;
        if (alpha <= 0 || ss.x > w + 100 || ss.y > h + 100) {
          shootingRef.current = null;
        } else {
          const tailX = ss.x - (ss.vx / 12) * ss.length;
          const tailY = ss.y - (ss.vy / 12) * ss.length;
          const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.9})`);
          grad.addColorStop(1, "transparent");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        }
      }

      // Translucent aura effects - slow drifting colored veils
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const auras = [
        { x: 0.15, y: 0.25, rx: 0.25, ry: 0.18, color: [80, 60, 180], speed: 0.15, phase: 0 },
        { x: 0.75, y: 0.7, rx: 0.2, ry: 0.25, color: [40, 140, 200], speed: 0.12, phase: 2 },
        { x: 0.5, y: 0.15, rx: 0.3, ry: 0.12, color: [120, 50, 160], speed: 0.1, phase: 4 },
        { x: 0.85, y: 0.4, rx: 0.15, ry: 0.2, color: [50, 180, 160], speed: 0.13, phase: 1.5 },
        { x: 0.3, y: 0.8, rx: 0.22, ry: 0.15, color: [100, 60, 200], speed: 0.11, phase: 3.5 },
      ];
      for (const a of auras) {
        const ax = a.x * w + Math.sin(t * a.speed + a.phase) * w * 0.04;
        const ay = a.y * h + Math.cos(t * a.speed * 0.8 + a.phase) * h * 0.03;
        const arx = a.rx * w;
        const ary = a.ry * h;
        const breath = 0.7 + 0.3 * Math.sin(t * a.speed * 0.5 + a.phase);
        const auraGrad = ctx.createRadialGradient(ax, ay, 0, ax, ay, Math.max(arx, ary) * breath);
        auraGrad.addColorStop(0, `rgba(${a.color[0]},${a.color[1]},${a.color[2]},0.025)`);
        auraGrad.addColorStop(0.5, `rgba(${a.color[0]},${a.color[1]},${a.color[2]},0.012)`);
        auraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(ax, ay, arx * breath, ary * breath, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

function LetterReveal({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 60, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.8 + i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export default function Home() {
  const mouse = useMousePosition();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden bg-[#050505]">
      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mouse.x, top: mouse.y }} />

      {/* Star field background */}
      <StarField mouseX={mouse.x} mouseY={mouse.y} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen px-6">
        {/* Top line */}
        <AnimatePresence>
          {loaded && (
            <motion.div
              className="absolute top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <motion.div
                className="w-[1px] h-[60px] bg-gradient-to-b from-transparent via-white/20 to-transparent"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <div className="text-center">
          <div className="overflow-hidden">
            <h1 className="text-[clamp(3rem,12vw,10rem)] font-extralight tracking-[0.2em] uppercase text-glow leading-none">
              <LetterReveal text="Loukoulele" />
            </h1>
          </div>

          {/* Underline */}
          <motion.div
            className="mx-auto mt-6 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ delay: 1.8, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Dynamic coordinates based on mouse */}
          <motion.p
            className="mt-6 text-[10px] tracking-[0.5em] uppercase text-white/15 font-mono tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 2 }}
          >
            {(() => {
              const w = typeof window !== "undefined" ? window.innerWidth : 1;
              const h = typeof window !== "undefined" ? window.innerHeight : 1;
              const lat = 48.8566 + ((mouse.y / (h || 1)) - 0.5) * 0.5;
              const lng = 2.3522 + ((mouse.x / (w || 1)) - 0.5) * 0.5;
              return `${lat.toFixed(4)}° N · ${lng.toFixed(4)}° E`;
            })()}
          </motion.p>
        </div>

      </div>
    </div>
  );
}
