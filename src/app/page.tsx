"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

function useMousePosition() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

function GridBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
  }));

  return (
    <div className="fixed inset-0 z-[1]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function HorizontalLines() {
  const lines = [20, 40, 60, 80];
  return (
    <div className="fixed inset-0 z-[1] overflow-hidden">
      {lines.map((top, i) => (
        <motion.div
          key={i}
          className="absolute h-[1px] w-[200px]"
          style={{
            top: `${top}%`,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
          }}
          animate={{ x: ["-200px", "100vw"] }}
          transition={{
            duration: 12 + i * 3,
            repeat: Infinity,
            ease: "linear",
            delay: i * 2,
          }}
        />
      ))}
    </div>
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

function MorphingShape() {
  const paths = [
    "M 100 50 Q 150 0 200 50 Q 250 100 200 150 Q 150 200 100 150 Q 50 100 100 50",
    "M 120 30 Q 180 10 210 70 Q 240 130 180 170 Q 120 210 80 150 Q 40 90 120 30",
    "M 90 60 Q 160 20 210 80 Q 260 140 190 180 Q 120 220 70 140 Q 20 60 90 60",
  ];

  return (
    <motion.svg
      viewBox="0 0 300 220"
      className="absolute w-[500px] h-[400px] opacity-[0.03]"
      style={{ top: "20%", right: "5%" }}
    >
      <motion.path
        d={paths[0]}
        fill="none"
        stroke="white"
        strokeWidth="1"
        animate={{ d: paths }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

export default function Home() {
  const mouse = useMousePosition();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[200vh] bg-[#050505]">
      {/* Grain */}
      <div className="grain-overlay" />

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mouse.x, top: mouse.y }} />

      {/* Background layers */}
      <GridBackground />
      <FloatingParticles />
      <HorizontalLines />

      {/* Aurora blobs */}
      <div className="aurora-blob w-[600px] h-[600px] bg-white/10 top-[-10%] left-[-10%]" />
      <div
        className="aurora-blob w-[400px] h-[400px] bg-white/5 bottom-[10%] right-[-5%]"
        style={{ animationDelay: "-7s" }}
      />

      <MorphingShape />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
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
        <motion.div style={{ y: titleY }} className="text-center">
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

          {/* Subtle coordinates / decorative text */}
          <motion.p
            className="mt-6 text-[10px] tracking-[0.5em] uppercase text-white/15 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 2 }}
          >
            48.8566&deg; N &middot; 2.3522&deg; E
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
        >
          <motion.div
            className="w-[1px] h-[40px] bg-gradient-to-b from-white/20 to-transparent"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Second section - just visual continuity */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 2 }}
        >
          <p className="text-[clamp(1rem,3vw,2rem)] font-extralight tracking-[0.3em] uppercase text-white/10">
            &mdash;
          </p>
        </motion.div>
      </div>
    </div>
  );
}
