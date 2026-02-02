"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BgRemover() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setOriginal(url);
    setResult(null);
    setLoading(true);
    setProgress(0);

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(url, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) setProgress(Math.round((current / total) * 100));
        },
      });
      const resultUrl = URL.createObjectURL(blob);
      setResult(resultUrl);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du traitement de l'image.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) processImage(file);
    },
    [processImage]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImage(file);
    },
    [processImage]
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="grain-overlay" />

      <motion.h1
        className="text-2xl font-extralight tracking-[0.3em] uppercase mb-12 text-white/60"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        BG Remover
      </motion.h1>

      {/* Drop zone */}
      <motion.div
        className={`relative w-full max-w-2xl aspect-video border border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-colors ${
          dragOver ? "border-white/40 bg-white/5" : "border-white/10 bg-white/[0.02]"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/50"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs tracking-[0.3em] text-white/30 font-mono">
                {progress}%
              </p>
            </motion.div>
          ) : result ? (
            <motion.img
              key="result"
              src={result}
              alt="Result"
              className="max-w-full max-h-full object-contain rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                backgroundImage:
                  "repeating-conic-gradient(#222 0% 25%, #1a1a1a 0% 50%)",
                backgroundSize: "16px 16px",
              }}
            />
          ) : original ? (
            <motion.img
              key="original"
              src={original}
              alt="Original"
              className="max-w-full max-h-full object-contain rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          ) : (
            <motion.p
              key="placeholder"
              className="text-xs tracking-[0.3em] text-white/20 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Glisser une image ici
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Actions */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="mt-8 flex gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <a
              href={result}
              download="bg-removed.png"
              className="px-6 py-2 text-xs tracking-[0.2em] uppercase border border-white/10 rounded-full hover:bg-white/5 transition-colors"
            >
              Telecharger
            </a>
            <button
              onClick={() => {
                setOriginal(null);
                setResult(null);
              }}
              className="px-6 py-2 text-xs tracking-[0.2em] uppercase border border-white/10 rounded-full hover:bg-white/5 transition-colors text-white/40"
            >
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
