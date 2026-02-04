"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import BattleScene, { BattleAPI } from "./BattleScene";

export default function WandIdle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);
  const [battleAPI, setBattleAPI] = useState<BattleAPI | null>(null);

  // Expose battle API globally for the inline script
  useEffect(() => {
    if (battleAPI) {
      (window as any).battleAPI = battleAPI;
    }
  }, [battleAPI]);

  const handleBattleReady = useCallback((api: BattleAPI) => {
    setBattleAPI(api);
  }, []);

  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

:root {
  --gold: #d4a843;
  --gold-dark: #a07830;
  --gold-glow: rgba(212,168,67,0.4);
  --parchment: #e8e2d6;
  --text-dim: #8a8a9a;
  --dark: #1e2028;
  --darker: #161820;
  --darkest: #0d0e12;
  --panel-bg: rgba(30,32,40,0.85);
  --panel-border: rgba(80,85,100,0.4);
  --red: #e74c3c;
  --red-dark: #c0392b;
  --green: #27ae60;
  --green-glow: rgba(39,174,96,0.4);
  --blue: #3498db;
  --purple: #9b59b6;
  --accent: #f39c12;
  --hp-gradient: linear-gradient(90deg, #c0392b, #e74c3c);
  --mana-gradient: linear-gradient(90deg, #2980b9, #3498db);
  --xp-gradient: linear-gradient(90deg, #27ae60, #2ecc71);
}

* { margin:0; padding:0; box-sizing:border-box; }

html {
  -webkit-text-size-adjust: 100%;
  touch-action: manipulation;
}

body {
  font-family:'Crimson Text',serif;
  background: var(--darkest);
  background-image:
    radial-gradient(ellipse at 20% 30%, rgba(106,27,154,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(212,168,67,0.05) 0%, transparent 50%),
    linear-gradient(180deg, var(--darkest) 0%, #0a0b0f 100%);
  background-attachment: fixed;
  color:var(--parchment);
  min-height:100vh;
  min-height:100dvh;
  overflow-x:hidden;
  user-select:none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

/* ============ MELVOR-STYLE TOP BAR ============ */
.top-bar {
  background: linear-gradient(180deg, rgba(30,32,40,0.98), rgba(22,24,32,0.98));
  border-bottom: 1px solid var(--panel-border);
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}

.game-logo {
  font-family: 'Cinzel', serif;
  color: var(--gold);
  font-size: 1.15em;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 0 20px var(--gold-glow);
}
.game-logo .logo-icon {
  font-size: 1.4em;
  animation: wandFloat 3s ease-in-out infinite;
}
@keyframes wandFloat { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-3px) rotate(5deg);} }

.patch-note-btn { background:none; border:none; font-size:1.1em; cursor:pointer; position:relative; opacity:0.6; transition:all 0.2s; }
.patch-note-btn:hover { opacity:1; transform:scale(1.1); }
.patch-note-btn.has-new::after { content:''; position:absolute; top:-2px; right:-2px; width:8px; height:8px; background:var(--red); border-radius:50%; animation:pulse-dot 1.5s infinite; }
@keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.3);opacity:0.7;} }
.patch-modal { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:1000; justify-content:center; align-items:center; backdrop-filter:blur(4px); }
.patch-modal.show { display:flex; }
.patch-content { background:linear-gradient(180deg,var(--dark),var(--darker)); border:1px solid var(--panel-border); border-radius:12px; max-width:450px; width:90%; max-height:80vh; overflow-y:auto; box-shadow:0 10px 50px rgba(0,0,0,0.5); }
.patch-header { padding:15px 20px; border-bottom:1px solid var(--panel-border); display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); }
.patch-header h2 { font-family:'Cinzel',serif; color:var(--gold); font-size:1.1em; margin:0; }
.patch-close { background:none; border:none; color:var(--text-dim); font-size:1.5em; cursor:pointer; transition:color 0.2s; }
.patch-close:hover { color:var(--parchment); }
.patch-body { padding:20px; }
.patch-version { color:var(--gold); font-family:'Cinzel',serif; font-size:0.9em; margin-bottom:15px; }
.patch-section { margin-bottom:15px; }
.patch-section h3 { color:var(--accent); font-size:0.9em; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
.patch-section ul { list-style:none; padding-left:5px; }
.patch-section li { color:var(--parchment); font-size:0.85em; margin-bottom:6px; padding-left:15px; position:relative; opacity:0.9; }
.patch-section li::before { content:'•'; position:absolute; left:0; color:var(--gold-dark); }

/* Currency Bar - Style Melvor */
.currency-bar { display:flex; gap:8px; align-items:center; }
.currency {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 6px 12px;
  transition: all 0.2s;
}
.currency:hover {
  background: rgba(0,0,0,0.4);
  border-color: rgba(212,168,67,0.3);
}
.currency .c-icon { font-size: 1.1em; }
.currency .c-val { color: var(--gold); font-weight: 700; font-family: 'Cinzel', serif; }
.currency .c-ps { color: var(--text-dim); font-size: 0.75em; margin-left: 2px; }

/* ============ LAYOUT WRAPPER ============ */
.game-layout {
  display: flex;
  min-height: calc(100vh - 48px);
}

/* ============ SIDEBAR NAVIGATION - MELVOR STYLE ============ */
.sidebar {
  position: fixed;
  left: 0;
  top: 48px;
  bottom: 0;
  width: 70px;
  background: linear-gradient(180deg, rgba(22,24,32,0.98), rgba(16,18,26,0.98));
  border-right: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  z-index: 99;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.sidebar::-webkit-scrollbar { display: none; }

.nav-btn {
  width: 100%;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-left: 3px solid transparent;
  color: var(--text-dim);
  font-family: 'Cinzel', serif;
  font-size: 0.65em;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}
.nav-btn .nav-icon {
  font-size: 1.6em;
  transition: transform 0.2s, filter 0.2s;
}
.nav-btn .nav-label {
  font-size: 0.9em;
  letter-spacing: 0.2px;
  white-space: nowrap;
  text-align: center;
}
.nav-btn:hover {
  color: var(--parchment);
  background: rgba(255,255,255,0.03);
}
.nav-btn:hover .nav-icon { transform: scale(1.1); }
.nav-btn.active {
  color: var(--green);
  background: rgba(39,174,96,0.1);
  border-left-color: var(--green);
}
.nav-btn.active .nav-icon {
  filter: drop-shadow(0 0 6px var(--green-glow));
}
.nav-notif {
  position: absolute;
  top: 6px;
  right: 8px;
  background: var(--red);
  color: #fff;
  font-size: 0.55em;
  font-weight: bold;
  min-width: 14px;
  height: 14px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-dot 1.5s infinite;
}

.sidebar-divider {
  height: 1px;
  background: var(--panel-border);
  margin: 8px 10px;
}

/* ============ MAIN CONTENT AREA ============ */
.main-content {
  flex: 1;
  margin-left: 70px;
  min-height: calc(100vh - 48px);
}

.main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 15px 20px;
}
.panel { display: none; }
.panel.active { display: block; padding-bottom: 100px; }

/* ============ ZONE HEADER - MELVOR STYLE ============ */
.zone-header {
  text-align: center;
  padding: 15px 20px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
}
.zone-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--purple), transparent);
}
.zone-name {
  font-family: 'Cinzel', serif;
  color: var(--gold);
  font-size: 1.4em;
  font-weight: 700;
  text-shadow: 0 0 20px var(--gold-glow);
}
.zone-desc {
  color: var(--text-dim);
  font-size: 0.9em;
  margin-top: 4px;
}
.zone-progress {
  font-size: 0.8em;
  color: var(--green);
  margin-top: 8px;
  padding: 6px 12px;
  background: rgba(39,174,96,0.1);
  border-radius: 20px;
  display: inline-block;
}

/* ============ BATTLE AREA - MELVOR STYLE ============ */
.battle-area {
  position: relative;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

/* Mini Battle Mode - flottant en bas à gauche */
.battle-area.mini-mode {
  position: fixed !important;
  bottom: 15px;
  left: 15px;
  width: 220px !important;
  height: auto;
  z-index: 500;
  border: 2px solid var(--gold-dark);
  box-shadow: 0 5px 25px rgba(0,0,0,0.6);
  cursor: pointer;
  margin: 0;
}
.battle-area.mini-mode:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 30px rgba(212,168,67,0.4);
}
.battle-area.mini-mode #battleSceneContainer {
  height: 120px;
  overflow: hidden;
}
.battle-area.mini-mode #battleSceneContainer canvas {
  width: 100% !important;
  height: 120px !important;
  object-fit: cover;
}
.battle-area.mini-mode .mob-info-bar {
  padding: 5px;
}
.battle-area.mini-mode .mob-name {
  font-size: 0.8em;
}
.battle-area.mini-mode .mob-hp-bar {
  width: 100%;
  height: 8px;
}
.battle-area.mini-mode .mob-hp-text {
  font-size: 0.65em;
}

#battleSceneContainer { display:flex; justify-content:center; }
/* Mob Info Bar - Melvor Style */
.mob-info-bar {
  text-align: center;
  padding: 12px 15px;
  background: linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6));
  border-top: 1px solid var(--panel-border);
}
.mob-info-bar .mob-name {
  font-family: 'Cinzel', serif;
  color: var(--parchment);
  font-size: 1.05em;
  margin-bottom: 8px;
  font-weight: 600;
}
.mob-info-bar .mob-hp-bar {
  width: 250px;
  height: 20px;
  background: rgba(0,0,0,0.5);
  border-radius: 10px;
  margin: 0 auto;
  border: 1px solid rgba(231,76,60,0.4);
  overflow: hidden;
  position: relative;
}
.mob-info-bar .mob-hp-fill {
  height: 100%;
  background: var(--hp-gradient);
  transition: width 0.15s ease-out;
  box-shadow: 0 0 10px rgba(231,76,60,0.4);
}
.mob-info-bar .mob-hp-text {
  font-size: 0.85em;
  color: var(--parchment);
  margin-top: 6px;
  font-family: 'Cinzel', serif;
}

.dmg-number { position:absolute; font-family:'Cinzel',serif; font-weight:900; font-size:1.2em; color:#ff6b6b; pointer-events:none; animation:dmgFly 0.8s ease-out forwards; text-shadow:0 0 6px rgba(255,0,0,0.5); z-index:10; }
.dmg-number.crit { font-size:1.6em; color:#ffd740; text-shadow:0 0 10px rgba(255,215,0,0.7); }
.dmg-number.gold-drop { color:var(--gold); font-size:0.9em; text-shadow:0 0 6px rgba(212,168,67,0.5); }
@keyframes dmgFly { 0%{opacity:1;transform:translateY(0) scale(1);} 100%{opacity:0;transform:translateY(-60px) scale(0.5);} }

/* ============ SPELL BAR - MELVOR ACTION BAR ============ */
.spell-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 15px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
}

.spell-slot {
  width:72px; height:72px; position:relative; cursor:default;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
}

.spell-slot .spell-circle {
  width:60px; height:60px; border-radius:50%; position:relative;
  display:flex; align-items:center; justify-content:center;
  background:radial-gradient(circle at 30% 30%, rgba(40,40,70,1), rgba(20,20,40,1));
  border:3px solid rgba(100,100,140,0.5);
  box-shadow:inset 0 2px 8px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4);
  transition:all 0.2s ease;
}

/* Spell-specific colors */
.spell-slot[data-spell="stupefix"] .spell-circle { border-color:rgba(100,180,255,0.6); }
.spell-slot[data-spell="stupefix"].ready .spell-circle { border-color:#4fc3f7; box-shadow:0 0 15px rgba(79,195,247,0.5), inset 0 0 10px rgba(79,195,247,0.2); }
.spell-slot[data-spell="patronus"] .spell-circle { border-color:rgba(200,200,220,0.6); }
.spell-slot[data-spell="patronus"].ready .spell-circle { border-color:#e0e0e0; box-shadow:0 0 15px rgba(255,255,255,0.5), inset 0 0 10px rgba(255,255,255,0.2); }
.spell-slot[data-spell="confringo"] .spell-circle { border-color:rgba(255,140,60,0.6); }
.spell-slot[data-spell="confringo"].ready .spell-circle { border-color:#ff9800; box-shadow:0 0 15px rgba(255,152,0,0.5), inset 0 0 10px rgba(255,152,0,0.2); }
.spell-slot[data-spell="avada"] .spell-circle { border-color:rgba(100,255,100,0.6); }
.spell-slot[data-spell="avada"].ready .spell-circle { border-color:#4caf50; box-shadow:0 0 20px rgba(76,175,80,0.6), inset 0 0 10px rgba(76,175,80,0.3); }

.spell-slot .s-icon { font-size:1.8em; z-index:2; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.5)); transition:transform 0.15s; }
.spell-slot.ready .s-icon { animation:spellPulse 1.5s ease-in-out infinite; }
.spell-slot.casting .s-icon { transform:scale(1.3); }

@keyframes spellPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.1);} }

/* Radial cooldown overlay */
.spell-cd-radial {
  position:absolute; top:0; left:0; width:60px; height:60px; border-radius:50%;
  background:conic-gradient(rgba(0,0,0,0.75) var(--cd-percent, 0%), transparent var(--cd-percent, 0%));
  pointer-events:none; z-index:3;
}

.spell-slot .s-info {
  position:absolute; bottom:-2px; left:50%; transform:translateX(-50%);
  background:rgba(0,0,0,0.85); border:1px solid rgba(212,168,67,0.3);
  border-radius:6px; padding:2px 6px; white-space:nowrap;
  font-size:0.6em; color:var(--gold); font-family:'Cinzel',serif;
}

.spell-slot .s-cd-text {
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  font-family:'Cinzel',serif; font-size:1em; font-weight:bold;
  color:#fff; text-shadow:0 0 5px rgba(0,0,0,0.8); z-index:4;
}

/* Casting animation */
.spell-slot.casting .spell-circle {
  animation:castFlash 0.2s ease-out;
}
@keyframes castFlash {
  0% { transform:scale(1); filter:brightness(1); }
  50% { transform:scale(1.15); filter:brightness(1.5); }
  100% { transform:scale(1); filter:brightness(1); }
}

/* On cooldown state */
.spell-slot.on-cd .spell-circle { filter:saturate(0.3) brightness(0.7); }
.spell-slot.on-cd .s-icon { filter:grayscale(0.5) drop-shadow(0 2px 3px rgba(0,0,0,0.5)); animation:none; }

/* Tooltip on hover */
.spell-slot .spell-tooltip {
  position:absolute; bottom:80px; left:50%; transform:translateX(-50%);
  background:rgba(20,18,35,0.98); border:1px solid var(--gold-dark);
  border-radius:8px; padding:8px 12px; min-width:120px; text-align:center;
  opacity:0; pointer-events:none; transition:opacity 0.2s; z-index:100;
  box-shadow:0 4px 15px rgba(0,0,0,0.5);
}
.spell-slot:hover .spell-tooltip { opacity:1; }
.spell-tooltip .tt-name { font-family:'Cinzel',serif; color:var(--gold); font-size:0.85em; margin-bottom:4px; }
.spell-tooltip .tt-dmg { color:#ff6b6b; font-size:0.8em; }
.spell-tooltip .tt-cd { color:#888; font-size:0.75em; }

/* Kill Counter */
.kill-counter {
  text-align: center;
  font-size: 0.85em;
  color: var(--text-dim);
  margin-bottom: 10px;
  padding: 8px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
}

/* ============ HERO RECAP BAR ============ */
.hero-recap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(180deg, rgba(22,24,32,0.98), rgba(18,20,28,0.98));
  border-bottom: 1px solid var(--panel-border);
  padding: 10px 20px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 98;
}
.hero-recap .hr-section {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0,0,0,0.25);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
}
.hero-recap .hr-label {
  font-family: 'Cinzel', serif;
  font-size: 0.65em;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.hero-recap .hr-icon { font-size: 1.3em; }
.hero-recap .hr-val {
  font-size: 0.8em;
  color: var(--parchment);
}
.hero-recap .hr-val span {
  color: var(--green);
  font-family: 'Cinzel', serif;
  font-weight: 600;
}
.hero-recap .hr-divider {
  width: 1px;
  height: 25px;
  background: var(--panel-border);
}
.hero-recap .hr-pet {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(155,89,182,0.1);
  border: 1px solid rgba(155,89,182,0.3);
  border-radius: 8px;
  padding: 6px 10px;
}
.hero-recap .hr-pet .pet-icon {
  font-size: 1.3em;
  animation: petBounce 1.5s ease-in-out infinite;
}
.hero-recap .hr-pet .pet-name {
  font-size: 0.75em;
  color: var(--purple);
  font-family: 'Cinzel', serif;
  font-weight: 600;
}
.hero-recap .hr-pet .pet-bonus {
  font-size: 0.65em;
  color: var(--text-dim);
}
@keyframes petBounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-3px);} }

/* ============ GATES - MELVOR SELECTION STYLE ============ */
.gate-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 12px 15px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}
.gate-item:hover {
  background: rgba(0,0,0,0.3);
  border-color: rgba(255,255,255,0.1);
}
.gate-item.unlocked {
  border-left: 3px solid var(--green);
  opacity: 0.7;
}
.gate-item.current {
  border-left: 3px solid var(--gold);
  background: rgba(212,168,67,0.08);
  box-shadow: 0 0 15px var(--gold-glow);
}
.gate-item.locked {
  opacity: 0.4;
  border-left: 3px solid var(--red);
}
.gate-item.prestige-wall {
  border-left: 3px solid var(--purple);
  background: rgba(155,89,182,0.1);
}
.gate-info { flex: 1; }
.gate-zone {
  font-family: 'Cinzel', serif;
  color: var(--parchment);
  font-size: 0.95em;
  font-weight: 600;
}
.gate-cost {
  font-size: 0.8em;
  color: var(--text-dim);
  margin-top: 4px;
}
.gate-mob {
  font-size: 0.8em;
  color: var(--purple);
}
.gate-time {
  font-size: 0.75em;
  color: var(--text-dim);
  font-style: italic;
}

/* ============ BUTTONS - MELVOR STYLE ============ */
.btn {
  padding: 10px 18px;
  border: none;
  background: var(--green);
  color: #fff;
  font-family: 'Cinzel', serif;
  font-size: 0.85em;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(39,174,96,0.3);
}
.btn:hover {
  background: #2ecc71;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39,174,96,0.4);
}
.btn:active {
  transform: translateY(0);
}
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.btn-sm {
  padding: 6px 12px;
  font-size: 0.75em;
}
.btn-gold {
  background: linear-gradient(145deg, var(--gold), var(--gold-dark));
  box-shadow: 0 2px 8px var(--gold-glow);
}
.btn-gold:hover {
  background: linear-gradient(145deg, #e0b84a, var(--gold));
}
.btn-purple {
  background: var(--purple);
  box-shadow: 0 2px 8px rgba(155,89,182,0.3);
}
.btn-purple:hover {
  background: #a569bd;
}
.btn-red {
  background: var(--red);
  box-shadow: 0 2px 8px rgba(231,76,60,0.3);
}
.btn-red:hover {
  background: #ec7063;
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--panel-border);
  color: var(--text-dim);
  box-shadow: none;
}
.btn-outline:hover {
  background: rgba(255,255,255,0.05);
  border-color: var(--green);
  color: var(--green);
}

/* ============ SPELL UPGRADE CARDS ============ */
.spell-upgrade-card {
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.2s ease;
}
.spell-upgrade-card:hover {
  background: rgba(0,0,0,0.3);
  border-color: rgba(255,255,255,0.1);
}
.spell-upgrade-card .su-icon {
  font-size: 2.5em;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  border-radius: 12px;
  border: 1px solid var(--panel-border);
}
.spell-upgrade-card .su-info { flex: 1; }
.spell-upgrade-card .su-name {
  font-family: 'Cinzel', serif;
  color: var(--parchment);
  font-size: 1em;
  font-weight: 600;
}
.spell-upgrade-card .su-desc {
  font-size: 0.8em;
  color: var(--text-dim);
  margin-top: 2px;
}
.spell-upgrade-card .su-stats {
  display: flex;
  gap: 15px;
  margin-top: 8px;
  font-size: 0.8em;
  flex-wrap: wrap;
}
.spell-upgrade-card .su-stat { color: var(--text-dim); }
.spell-upgrade-card .su-stat span {
  color: var(--green);
  font-family: 'Cinzel', serif;
}
.spell-upgrade-card .su-actions { text-align: right; }
.spell-upgrade-card .su-level {
  font-family: 'Cinzel', serif;
  color: var(--gold);
  font-size: 1.1em;
  margin-bottom: 8px;
}
.spell-upgrade-card .su-cost {
  font-size: 0.75em;
  color: var(--accent);
  margin-top: 5px;
}

/* ============ TALENTS - MELVOR GRID ============ */
.talent-section { margin-bottom: 20px; }
.talent-section-title {
  font-family: 'Cinzel', serif;
  color: var(--parchment);
  font-size: 0.95em;
  font-weight: 600;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  border-left: 3px solid var(--green);
}
.talent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.talent-node {
  background: rgba(0,0,0,0.25);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.talent-node:hover {
  background: rgba(0,0,0,0.35);
  border-color: var(--green);
  transform: translateY(-2px);
}
.talent-node .t-icon {
  font-size: 1.6em;
  margin-bottom: 4px;
}
.talent-node .t-name {
  font-family: 'Cinzel', serif;
  font-size: 0.8em;
  color: var(--parchment);
  margin: 4px 0;
  font-weight: 600;
}
.talent-node .t-level {
  font-size: 0.75em;
  color: var(--green);
  background: rgba(39,174,96,0.15);
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}
.talent-node .t-desc {
  font-size: 0.7em;
  color: var(--text-dim);
  margin: 6px 0;
}
.talent-node .t-cost {
  font-size: 0.75em;
  color: var(--accent);
  font-weight: 600;
}
.talent-node.maxed {
  border-color: var(--green);
  background: rgba(39,174,96,0.1);
}
.talent-node.maxed .t-level {
  background: var(--green);
  color: #fff;
}

/* ============ PRESTIGE - MELVOR STYLE ============ */
.prestige-box {
  text-align: center;
  padding: 25px;
  background: linear-gradient(145deg, rgba(155,89,182,0.1), rgba(100,50,150,0.05));
  border: 1px solid rgba(155,89,182,0.3);
  border-radius: 12px;
  margin-bottom: 20px;
}
.prestige-box .p-icon {
  font-size: 4em;
  animation: wandFloat 3s ease-in-out infinite;
}
.prestige-box .p-title {
  font-family: 'Cinzel', serif;
  color: var(--gold);
  font-size: 1.4em;
  margin: 12px 0;
  font-weight: 700;
}
.prestige-box .p-desc {
  color: var(--text-dim);
  font-size: 0.9em;
  margin-bottom: 15px;
}
.prestige-box .p-mult {
  font-family: 'Cinzel', serif;
  color: var(--purple);
  font-size: 1.3em;
  margin: 12px 0;
  padding: 10px 20px;
  background: rgba(155,89,182,0.15);
  border-radius: 8px;
  display: inline-block;
}

.prestige-tier {
  background: rgba(0,0,0,0.25);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  text-align: center;
  transition: all 0.2s ease;
}
.prestige-tier.done {
  border-left: 3px solid var(--green);
  opacity: 0.7;
}
.prestige-tier.available {
  border-left: 3px solid var(--purple);
  background: rgba(155,89,182,0.08);
  box-shadow: 0 0 15px rgba(155,89,182,0.2);
}
.prestige-tier .pt-name {
  font-family: 'Cinzel', serif;
  color: var(--parchment);
  font-weight: 600;
}
.prestige-tier .pt-req {
  font-size: 0.8em;
  color: var(--text-dim);
  margin-top: 4px;
}
.prestige-tier .pt-reward {
  font-size: 0.85em;
  color: var(--purple);
  margin: 8px 0;
  font-weight: 600;
}

/* ============ STATS - MELVOR STYLE ============ */
.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 0.9em;
  transition: background 0.2s;
}
.stat-row:hover {
  background: rgba(255,255,255,0.02);
}
.stat-row .stat-label { color: var(--text-dim); }
.stat-row .stat-value {
  color: var(--green);
  font-family: 'Cinzel', serif;
  font-weight: 600;
}

/* ============ CARDS - MELVOR STYLE PANELS ============ */
.card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 0;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.card-title {
  font-family: 'Cinzel', serif;
  color: var(--parchment);
  font-size: 1em;
  font-weight: 600;
  padding: 12px 15px;
  margin: 0;
  background: rgba(0,0,0,0.3);
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: var(--green);
  border-radius: 2px;
}
.card > *:not(.card-title) { padding: 15px; }
.card > .card-title + * { padding-top: 15px; }

/* ============ TOAST NOTIFICATIONS ============ */
.toast {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--panel-bg);
  border: 1px solid var(--green);
  border-radius: 10px;
  padding: 12px 24px;
  color: var(--parchment);
  font-family: 'Cinzel', serif;
  font-size: 0.9em;
  z-index: 500;
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 20px var(--green-glow);
}
.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

/* ============ BOTTOM PROGRESS BAR - MELVOR STYLE ============ */
.bottom-progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(25,27,35,0.98), rgba(18,20,28,0.98));
  border-top: 1px solid var(--panel-border);
  padding: 8px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 400;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.4);
}
.bottom-progress-bar .bp-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85em;
}
.bottom-progress-bar .bp-label {
  color: var(--text-dim);
}
.bottom-progress-bar .bp-value {
  color: var(--green);
  font-family: 'Cinzel', serif;
  font-weight: 600;
}
.bottom-progress-bar .bp-divider {
  width: 1px;
  height: 20px;
  background: var(--panel-border);
}

/* Active Buffs Bar */
.active-buffs-bar {
  position: fixed;
  bottom: 45px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 10px 15px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  z-index: 399;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.active-buffs-bar:empty {
  display: none;
}
.buff-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--green);
  border-radius: 8px;
  padding: 8px 12px;
  animation: buffPulse 2s ease-in-out infinite;
}
@keyframes buffPulse {
  0%, 100% { box-shadow: 0 0 5px var(--green-glow); }
  50% { box-shadow: 0 0 15px var(--green-glow); }
}
.buff-item .buff-icon {
  font-size: 1.6em;
}
.buff-item .buff-info {
  display: flex;
  flex-direction: column;
}
.buff-item .buff-name {
  font-family: 'Cinzel', serif;
  font-size: 0.8em;
  color: var(--parchment);
}
.buff-item .buff-timer {
  font-size: 1em;
  font-weight: bold;
  color: var(--green);
  font-family: 'Cinzel', serif;
}
.buff-item.expiring {
  border-color: var(--red);
  animation: buffExpiring 0.5s ease-in-out infinite;
}
@keyframes buffExpiring {
  0%, 100% { box-shadow: 0 0 10px rgba(231,76,60,0.4); }
  50% { box-shadow: 0 0 20px rgba(231,76,60,0.6); }
}

/* ========== MOBILE RESPONSIVE ========== */
@media (max-width:768px) {
  /* Game Layout - mobile */
  .game-layout {
    flex-direction: column;
  }

  /* Sidebar becomes bottom nav on mobile */
  .sidebar {
    position: fixed;
    left: 0;
    right: 0;
    top: auto;
    bottom: 0;
    width: 100%;
    height: 60px;
    flex-direction: row;
    padding: 0;
    border-right: none;
    border-top: 1px solid var(--panel-border);
    overflow-x: auto;
    overflow-y: hidden;
    z-index: 500;
  }
  .sidebar-divider {
    width: 1px;
    height: 100%;
    margin: 0 2px;
  }
  .nav-btn {
    min-width: 55px;
    padding: 6px 4px;
    border-left: none;
    border-top: 3px solid transparent;
  }
  .nav-btn.active {
    border-left-color: transparent;
    border-top-color: var(--green);
  }
  .nav-btn .nav-icon { font-size: 1.4em; }
  .nav-btn .nav-label { font-size: 0.6em; }

  .main-content {
    margin-left: 0;
    padding-bottom: 70px;
  }

  /* Bottom progress bar - above mobile nav */
  .bottom-progress-bar {
    bottom: 60px;
  }

  /* Buffs bar - above bottom bar */
  .active-buffs-bar {
    bottom: 105px;
  }

  /* Toast - above bottom bar */
  .toast {
    bottom: 130px;
  }
}

@media (max-width:600px) {
  /* Top Bar - plus compact */
  .top-bar {
    padding: 6px 10px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .game-logo { font-size: 0.85em; gap: 6px; }
  .game-logo .logo-icon { font-size: 1.2em; }
  .currency-bar {
    gap: 4px;
    flex-wrap: wrap;
    justify-content: center;
    order: 3;
    width: 100%;
  }
  .currency {
    padding: 4px 8px;
    font-size: 0.75em;
    border-radius: 6px;
  }
  .currency .c-icon { font-size: 0.9em; }
  .currency .c-ps { display: none; }
  #userZone { order: 2; }

  /* Main content */
  .main { padding: 8px; }
  .panel.active { padding-bottom: 120px; }

  /* Zone header */
  .zone-header { padding: 10px; margin-bottom: 10px; }
  .zone-name { font-size: 1.15em; }
  .zone-desc { font-size: 0.8em; }
  .zone-progress { font-size: 0.75em; padding: 4px 10px; }

  /* Battle area */
  .battle-area { border-radius: 10px; margin-bottom: 10px; }
  #battleSceneContainer canvas { max-height: 180px; }
  .mob-info-bar { padding: 10px; }
  .mob-info-bar .mob-name { font-size: 0.9em; }
  .mob-info-bar .mob-hp-bar { width: 180px; height: 16px; }
  .mob-info-bar .mob-hp-text { font-size: 0.75em; }

  /* Mini mode sur mobile */
  .battle-area.mini-mode {
    width: calc(100% - 20px) !important;
    left: 10px;
    bottom: 130px;
  }
  .battle-area.mini-mode #battleSceneContainer { height: 80px; }

  /* Spell bar */
  .spell-bar { gap: 6px; padding: 10px 8px; flex-wrap: wrap; }
  .spell-slot { width: 56px; height: 56px; }
  .spell-slot .spell-circle { width: 46px; height: 46px; border-width: 2px; }
  .spell-slot .s-icon { font-size: 1.4em; }
  .spell-cd-radial { width: 46px; height: 46px; }
  .spell-slot .s-info { font-size: 0.55em; padding: 1px 4px; bottom: -4px; }
  .spell-slot .s-cd-text { font-size: 0.85em; }
  .spell-slot .spell-tooltip { display: none; }

  /* Hero recap */
  .hero-recap {
    padding: 6px 10px;
    top: 0;
    gap: 6px;
  }
  .hero-recap .hr-section {
    gap: 4px;
    padding: 4px 8px;
  }
  .hero-recap .hr-label { font-size: 0.55em; }
  .hero-recap .hr-icon { font-size: 1em; }
  .hero-recap .hr-val { font-size: 0.7em; }
  .hero-recap .hr-divider { height: 18px; }
  .hero-recap .hr-pet { padding: 4px 6px; }
  .hero-recap .hr-pet .pet-icon { font-size: 1em; }
  .hero-recap .hr-pet .pet-name { font-size: 0.65em; }
  .hero-recap .hr-pet .pet-bonus { display: none; }

  /* Cards */
  .card { margin-bottom: 10px; border-radius: 10px; }
  .card-title { font-size: 0.9em; padding: 10px 12px; }
  .card > *:not(.card-title) { padding: 12px; }

  /* Spell upgrade cards */
  .spell-upgrade-card {
    flex-direction: column;
    text-align: center;
    padding: 12px;
    gap: 10px;
  }
  .spell-upgrade-card .su-icon { width: 50px; height: 50px; font-size: 1.8em; }
  .spell-upgrade-card .su-name { font-size: 0.9em; }
  .spell-upgrade-card .su-desc { font-size: 0.75em; }
  .spell-upgrade-card .su-stats { justify-content: center; gap: 10px; font-size: 0.75em; }
  .spell-upgrade-card .su-actions { text-align: center; margin-top: 8px; }
  .spell-upgrade-card .su-level { font-size: 1em; }

  /* Talents */
  .talent-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .talent-section-title { font-size: 0.85em; padding: 6px 10px; }
  .talent-node { padding: 10px; }
  .talent-node .t-icon { font-size: 1.4em; }
  .talent-node .t-name { font-size: 0.75em; }
  .talent-node .t-level { font-size: 0.65em; }
  .talent-node .t-desc { font-size: 0.65em; }

  /* Gates */
  .gate-item { padding: 10px 12px; border-radius: 8px; }
  .gate-zone { font-size: 0.85em; }
  .gate-cost { font-size: 0.75em; }
  .gate-mob { font-size: 0.75em; }

  /* Prestige */
  .prestige-box { padding: 20px 15px; }
  .prestige-box .p-icon { font-size: 3em; }
  .prestige-box .p-title { font-size: 1.15em; }
  .prestige-box .p-desc { font-size: 0.8em; }
  .prestige-box .p-mult { font-size: 1.1em; padding: 8px 15px; }
  .prestige-tier { padding: 12px; }
  .prestige-tier .pt-name { font-size: 0.9em; }

  /* Buttons - tactile friendly */
  .btn { padding: 12px 18px; font-size: 0.85em; min-height: 44px; }
  .btn-sm { padding: 8px 14px; font-size: 0.75em; min-height: 38px; }

  /* Stats */
  .stat-row { font-size: 0.8em; padding: 8px 10px; }

  /* Bottom progress bar */
  .bottom-progress-bar {
    padding: 6px 10px;
    gap: 10px;
  }
  .bottom-progress-bar .bp-item { font-size: 0.75em; gap: 4px; }
  .bottom-progress-bar .bp-divider { height: 15px; }

  /* Buffs bar */
  .active-buffs-bar {
    bottom: 40px;
    padding: 8px 10px;
    gap: 6px;
    max-width: calc(100% - 20px);
    flex-wrap: wrap;
    justify-content: center;
  }
  .buff-item { padding: 6px 8px; gap: 6px; }
  .buff-item .buff-icon { font-size: 1.3em; }
  .buff-item .buff-name { font-size: 0.7em; }
  .buff-item .buff-timer { font-size: 0.9em; }

  /* Toast */
  .toast { font-size: 0.8em; padding: 10px 16px; bottom: 80px; }

  /* Kill counter */
  .kill-counter { font-size:0.75em; }

  /* Patch modal */
  .patch-content { width:95%; max-height:85vh; }
  .patch-header { padding:12px 15px; }
  .patch-header h2 { font-size:1em; }
  .patch-body { padding:15px; }
  .patch-section h3 { font-size:0.85em; }
  .patch-section li { font-size:0.8em; }
}

/* Extra small phones */
@media (max-width:380px) {
  .nav-btn .nav-label { display:none; }
  .nav-btn .nav-icon { font-size:1.6em; }
  .nav-btn { padding:10px 4px; }

  .spell-bar { gap:2px; }
  .spell-slot { width:48px; height:48px; }
  .spell-slot .spell-circle { width:40px; height:40px; }
  .spell-slot .s-icon { font-size:1.2em; }
  .spell-cd-radial { width:40px; height:40px; }

  .currency { padding:3px 6px; }
  .currency .c-icon { font-size:0.9em; }

  .talent-grid { grid-template-columns:1fr 1fr; gap:4px; }

  .hero-recap { flex-wrap:wrap; justify-content:center; }
  .hero-recap .hr-divider { display:none; }
}

/* ========== SHINY PETS ========== */
.pet-card.shiny {
  position: relative;
  border: 2px solid transparent;
  background: linear-gradient(145deg, rgba(255,215,0,0.15), rgba(255,180,0,0.05));
  animation: shinyGlow 2s ease-in-out infinite;
}

@keyframes shinyGlow {
  0%, 100% {
    border-color: rgba(255, 215, 0, 0.6);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3), inset 0 0 15px rgba(255, 215, 0, 0.1);
  }
  50% {
    border-color: rgba(255, 180, 0, 0.9);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 25px rgba(255, 215, 0, 0.2);
  }
}

.shiny-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ffd700, #ffab00);
  color: #000;
  font-size: 0.6em;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 8px;
  font-family: 'Cinzel', serif;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
  animation: shinyBadgePulse 1.5s ease-in-out infinite;
}

@keyframes shinyBadgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.shiny-sparkle {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.shiny-sparkle::before,
.shiny-sparkle::after {
  content: '✨';
  position: absolute;
  font-size: 0.8em;
  animation: sparkleFloat 2s ease-in-out infinite;
}

.shiny-sparkle::before { top: 10%; left: 10%; animation-delay: 0s; }
.shiny-sparkle::after { bottom: 10%; right: 10%; animation-delay: 1s; }

@keyframes sparkleFloat {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
  50% { opacity: 1; transform: translateY(-5px) scale(1); }
}

/* ========== PET RARITIES ========== */
.pet-card.rare {
  background: linear-gradient(145deg, rgba(33,150,243,0.1), rgba(33,150,243,0.02)) !important;
}
.pet-card.epic {
  background: linear-gradient(145deg, rgba(156,39,176,0.15), rgba(156,39,176,0.05)) !important;
}
.pet-card.secret {
  background: linear-gradient(145deg, rgba(255,152,0,0.15), rgba(255,152,0,0.05)) !important;
  animation: secretGlow 3s ease-in-out infinite;
}
.pet-card.legendary {
  background: linear-gradient(145deg, rgba(255,215,0,0.2), rgba(255,180,0,0.1)) !important;
  animation: legendaryGlow 2s ease-in-out infinite;
}

@keyframes secretGlow {
  0%, 100% { box-shadow: 0 0 10px rgba(255,152,0,0.3); }
  50% { box-shadow: 0 0 20px rgba(255,152,0,0.5); }
}

@keyframes legendaryGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(255,215,0,0.4), 0 0 30px rgba(255,180,0,0.2);
  }
  50% {
    box-shadow: 0 0 25px rgba(255,215,0,0.6), 0 0 50px rgba(255,180,0,0.3);
  }
}

/* ========== ACHIEVEMENTS - MELVOR STYLE ========== */
.achievement-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  margin-bottom: 8px;
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  transition: all 0.2s;
}
.achievement-card:hover {
  background: rgba(0,0,0,0.3);
}

.achievement-card.unlocked {
  background: linear-gradient(145deg, rgba(39,174,96,0.15), rgba(39,174,96,0.05));
  border-left: 3px solid var(--green);
}
.achievement-card.unlocked .achievement-icon {
  filter: drop-shadow(0 0 6px var(--green-glow));
}

.achievement-card.locked {
  opacity: 0.5;
}

.achievement-icon {
  font-size: 2em;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.25);
  border-radius: 10px;
  border: 1px solid var(--panel-border);
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-family: 'Cinzel', serif;
  color: var(--parchment);
  font-size: 0.95em;
  font-weight: 600;
}

.achievement-desc {
  font-size: 0.8em;
  color: var(--text-dim);
  margin-top: 2px;
}

.achievement-progress {
  margin-top: 6px;
  height: 8px;
  background: rgba(0,0,0,0.4);
  border-radius: 4px;
  overflow: hidden;
}

.achievement-progress-fill {
  height: 100%;
  background: var(--xp-gradient);
  transition: width 0.3s;
}

.achievement-reward {
  display: flex;
  gap: 8px;
  font-size: 0.75em;
  color: var(--text-dim);
  margin-top: 6px;
}
.achievement-reward span {
  background: rgba(0,0,0,0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.category-complete-bonus {
  background: linear-gradient(145deg, rgba(155,89,182,0.15), rgba(155,89,182,0.05));
  border: 1px solid rgba(155,89,182,0.4);
  border-radius: 10px;
  padding: 12px 15px;
  margin-bottom: 15px;
  text-align: center;
}

/* Achievement Category Tabs */
.achievement-category-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  margin: 0 4px 8px 0;
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  color: var(--text-dim);
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s;
}
.achievement-category-tab:hover {
  background: rgba(0,0,0,0.3);
  color: var(--parchment);
}
.achievement-category-tab.active {
  background: rgba(39,174,96,0.15);
  border-color: var(--green);
  color: var(--green);
}
.achievement-category-tab .tab-count {
  background: rgba(0,0,0,0.3);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.85em;
}

/* ========== ETERNALS (Relics & Star Dust) - MELVOR STYLE ========== */
.stardust-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1.2em;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: linear-gradient(145deg, rgba(155,89,182,0.15), rgba(100,50,150,0.08));
  border: 1px solid rgba(155,89,182,0.35);
  border-radius: 12px;
}

.stardust-icon {
  font-size: 1.6em;
  animation: stardustGlow 2s ease-in-out infinite;
}

@keyframes stardustGlow {
  0%, 100% { filter: drop-shadow(0 0 5px rgba(155,89,182,0.5)); }
  50% { filter: drop-shadow(0 0 15px rgba(155,89,182,0.8)); }
}

.relic-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  margin-bottom: 10px;
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  transition: all 0.2s;
}

.relic-card:hover {
  background: rgba(0,0,0,0.3);
  border-color: var(--purple);
}

.relic-card.maxed {
  border-left: 3px solid var(--green);
  background: linear-gradient(145deg, rgba(39,174,96,0.1), rgba(0,0,0,0.2));
}

.relic-icon {
  font-size: 2.2em;
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(155,89,182,0.15);
  border-radius: 10px;
  border: 1px solid rgba(155,89,182,0.3);
}

.relic-info {
  flex: 1;
}

.relic-name {
  font-family: 'Cinzel', serif;
  color: var(--parchment);
  font-size: 1em;
  font-weight: 600;
}

.relic-desc {
  font-size: 0.8em;
  color: var(--text-dim);
  margin-top: 2px;
}

.relic-level {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.relic-pip {
  width: 22px;
  height: 8px;
  background: rgba(0,0,0,0.4);
  border-radius: 4px;
  border: 1px solid var(--panel-border);
}

.relic-pip.filled {
  background: var(--purple);
  border-color: transparent;
  box-shadow: 0 0 6px rgba(155,89,182,0.4);
}

/* ========== SPELL EVOLUTIONS ========== */
.spell-evolution-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 0.7em;
  padding: 2px 4px;
  border-radius: 4px;
  background: rgba(0,0,0,0.8);
  border: 1px solid;
}

.spell-slot.evolved-1 .spell-circle { border-width: 4px; }
.spell-slot.evolved-2 .spell-circle { border-width: 5px; }
.spell-slot.evolved-3 .spell-circle { border-width: 6px; box-shadow: 0 0 25px currentColor !important; }

/* ========== INFINITY PRESTIGE ========== */
.infinity-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #1a1a2e, #2d1f4e);
  border: 2px solid #9c27b0;
  border-radius: 20px;
  padding: 4px 12px;
  font-family: 'Cinzel', serif;
  color: #ce93d8;
  font-size: 0.8em;
  animation: infinityPulse 3s ease-in-out infinite;
}

@keyframes infinityPulse {
  0%, 100% { box-shadow: 0 0 10px rgba(156,39,176,0.3); }
  50% { box-shadow: 0 0 25px rgba(156,39,176,0.6); }
}

/* ========== DAILY CHALLENGES ========== */
.daily-challenge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(212,168,67,0.15);
  border-radius: 10px;
}

.daily-challenge.completed {
  background: linear-gradient(145deg, rgba(46,125,50,0.15), rgba(0,0,0,0.25));
  border-color: var(--green);
  opacity: 0.7;
}

.daily-icon {
  font-size: 1.8em;
}

.daily-info {
  flex: 1;
}

.daily-name {
  font-family: 'Cinzel', serif;
  color: var(--gold);
  font-size: 0.9em;
}

.daily-progress-bar {
  margin-top: 4px;
  height: 8px;
  background: rgba(0,0,0,0.4);
  border-radius: 4px;
  overflow: hidden;
}

.daily-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold-dark), var(--gold));
  transition: width 0.3s;
}

.daily-reward {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: 0.75em;
  color: #888;
}

/* ========== PET SYNERGIES ========== */
.synergy-active {
  background: linear-gradient(145deg, rgba(255,152,0,0.15), rgba(0,0,0,0.25));
  border: 1px solid var(--accent);
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.synergy-icon {
  font-size: 1.5em;
}

.synergy-info {
  flex: 1;
}

.synergy-name {
  font-family: 'Cinzel', serif;
  color: var(--accent);
  font-size: 0.9em;
}

.synergy-desc {
  font-size: 0.75em;
  color: #aaa;
}

/* Multi-pet slots */
.pet-slots {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  justify-content: center;
}

.pet-slot {
  width: 60px;
  height: 60px;
  border: 2px dashed rgba(212,168,67,0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8em;
  background: rgba(0,0,0,0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.pet-slot:hover {
  border-color: var(--gold);
  background: rgba(212,168,67,0.1);
}

.pet-slot.filled {
  border-style: solid;
  border-color: var(--purple);
  background: rgba(106,27,154,0.15);
}

.pet-slot.locked {
  opacity: 0.5;
  cursor: not-allowed;
  flex-direction: column;
}

.pet-slot.empty {
  flex-direction: column;
  border-color: rgba(212,168,67,0.2);
}

.pet-slot.filled {
  position: relative;
}

.slot-remove-hint {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: var(--red);
  color: #fff;
  border-radius: 50%;
  font-size: 0.7em;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  font-weight: bold;
}

.pet-slot.filled:hover .slot-remove-hint {
  opacity: 1;
}

.pet-slot.filled:hover {
  border-color: var(--red);
  background: rgba(198,40,40,0.15);
}

/* World Boss Styles */
#bossAttackBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

#bossAttackBtn:not(:disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255,68,68,0.5);
}

@keyframes bossShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.boss-hit {
  animation: bossShake 0.1s ease-in-out;
}

@keyframes bossPulse {
  0%, 100% { box-shadow: 0 0 10px rgba(198, 40, 40, 0.3); }
  50% { box-shadow: 0 0 25px rgba(198, 40, 40, 0.6); }
}

.boss-card-active {
  animation: bossPulse 2s ease-in-out infinite;
}

.boss-leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 4px;
  background: rgba(0,0,0,0.25);
  border-radius: 6px;
  font-size: 0.85em;
}

.boss-leaderboard-entry.me {
  background: rgba(106,27,154,0.3);
  border: 1px solid var(--purple);
}

.boss-leaderboard-entry .rank {
  font-family: 'Cinzel', serif;
  color: var(--gold);
  min-width: 30px;
}

.boss-leaderboard-entry .name {
  flex: 1;
  color: var(--parchment);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.boss-leaderboard-entry .damage {
  color: #ff6b6b;
  font-family: 'Cinzel', serif;
}

/* Boss Battle Arena - Canvas Based */
.boss-arena {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 15px;
  border: 1px solid rgba(212,168,67,0.2);
}

.boss-arena canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.boss-player-labels {
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0 10px;
  pointer-events: none;
}

.boss-player-label {
  font-size: 0.6em;
  color: var(--gold);
  font-family: 'Cinzel', serif;
  background: rgba(0,0,0,0.7);
  padding: 2px 6px;
  border-radius: 4px;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.boss-player-label.me {
  color: #ce93d8;
  border: 1px solid var(--purple);
}

.boss-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: playerAppear 0.3s ease-out;
  flex-shrink: 0;
}

@keyframes playerAppear {
  0% { opacity: 0; transform: scale(0) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.boss-player-name {
  font-size: 0.55em;
  color: var(--gold);
  font-family: 'Cinzel', serif;
  background: rgba(0,0,0,0.7);
  padding: 1px 4px;
  border-radius: 3px;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}

.boss-player-name.me {
  color: #ce93d8;
  border: 1px solid var(--purple);
}

.boss-player-sprite {
  font-size: 1.8em;
  animation: playerIdle 1s ease-in-out infinite;
}

@keyframes playerIdle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.boss-player-sprite.attacking {
  animation: playerAttack 0.3s ease-out;
}

@keyframes playerAttack {
  0% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-10px) translateX(10px); }
  100% { transform: translateY(0) translateX(0); }
}

.boss-damage-number {
  position: absolute;
  font-family: 'Cinzel', serif;
  font-weight: 900;
  font-size: 1em;
  color: #ff6b6b;
  pointer-events: none;
  animation: bossDmgFly 1s ease-out forwards;
  text-shadow: 0 0 6px rgba(255,0,0,0.8), 2px 2px 2px rgba(0,0,0,0.8);
  z-index: 20;
}

@keyframes bossDmgFly {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-50px) scale(0.6); }
}

.boss-player-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.7em;
  color: #888;
}

/* Boss Alert Banner - Non-blocking notification style */
.boss-alert-overlay {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-150%);
  width: auto;
  max-width: 90%;
  background: linear-gradient(180deg, rgba(30, 20, 50, 0.98), rgba(15, 10, 30, 0.98));
  border: 2px solid var(--red);
  border-radius: 16px;
  z-index: 9999;
  padding: 15px 25px;
  box-shadow: 0 10px 40px rgba(198, 40, 40, 0.5), 0 0 60px rgba(198, 40, 40, 0.3);
  pointer-events: auto;
  opacity: 0;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
}

.boss-alert-overlay.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.boss-alert-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.boss-alert-icon {
  font-size: 3em;
  animation: bossAlertPulse 0.8s ease-in-out infinite alternate;
}

@keyframes bossAlertPulse {
  0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.6)); }
  100% { transform: scale(1.1); filter: drop-shadow(0 0 20px rgba(255, 0, 0, 0.9)); }
}

.boss-alert-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.boss-alert-title {
  font-family: 'Cinzel', serif;
  font-size: 1em;
  color: var(--red);
  text-shadow: 0 0 10px rgba(198, 40, 40, 0.5);
  margin: 0;
}

.boss-alert-name {
  font-family: 'Cinzel', serif;
  font-size: 1.3em;
  color: var(--gold);
  text-shadow: 0 0 10px rgba(212, 168, 67, 0.5);
  margin: 0;
}

.boss-alert-btn {
  font-size: 0.9em;
  padding: 10px 20px;
  margin-left: 10px;
  white-space: nowrap;
}

.boss-alert-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  color: #888;
  font-size: 1.2em;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.boss-alert-close:hover { color: #fff; }
`;
    document.head.appendChild(style);

    // Load Firebase SDK from CDN
    const firebaseScript1 = document.createElement('script');
    firebaseScript1.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
    document.head.appendChild(firebaseScript1);

    const firebaseScript2 = document.createElement('script');
    firebaseScript2.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
    document.head.appendChild(firebaseScript2);

    const firebaseScript3 = document.createElement('script');
    firebaseScript3.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
    document.head.appendChild(firebaseScript3);

    // Inject Firebase config (from env variables)
    const configScript = document.createElement('script');
    configScript.textContent = 'window.__FIREBASE_CONFIG__ = ' + JSON.stringify({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''
    }) + ';';
    document.head.appendChild(configScript);

    // Inject HTML
    container.innerHTML = `

<div class="top-bar">
  <div class="game-logo">
    <span class="logo-icon">🪄</span>
    <span>Wand Idle</span>
    <button class="patch-note-btn" id="patchNoteBtn" onclick="togglePatchModal(true)" title="Patch Notes">📜</button>
  </div>
  <div class="currency-bar">
    <div class="currency" title="Or"><span class="c-icon">🪙</span><span class="c-val" id="goldVal">0</span><span class="c-ps" id="goldPs"></span></div>
    <div class="currency" title="Gemmes"><span class="c-icon">💎</span><span class="c-val" id="gemsVal">0</span></div>
    <div class="currency" title="Points de Talent"><span class="c-icon">📖</span><span class="c-val" id="tpVal">0</span></div>
    <div class="currency" title="Star Dust"><span class="c-icon">⭐</span><span class="c-val" id="starDustTopVal">0</span></div>
    <div class="currency" title="Prestige"><span class="c-icon">🔮</span><span class="c-val" id="prestigeVal">0</span></div>
  </div>
  <div id="userZone" style="display:flex;align-items:center;gap:10px;">
    <img id="userAvatar" src="" style="width:32px;height:32px;border-radius:50%;display:none;border:2px solid var(--green);cursor:pointer;" onclick="promptChangeAvatar()" title="Changer l'avatar" />
    <span id="userName" style="font-size:0.85em;color:var(--text-dim);cursor:pointer;" onclick="promptChangeName()" title="Changer le pseudo"></span>
    <button id="loginBtn" class="btn btn-sm" onclick="handleLogin()">🎮 Discord</button>
  </div>
</div>

<div class="game-layout">
  <!-- Sidebar Navigation -->
  <nav class="sidebar">
    <button class="nav-btn active" onclick="switchPanel('zone',this)"><span class="nav-icon">⚔️</span><span class="nav-label">Combat</span></button>
    <button class="nav-btn" onclick="switchPanel('gates',this)"><span class="nav-icon">🚪</span><span class="nav-label">Portes</span></button>
    <button class="nav-btn" onclick="switchPanel('spells',this)"><span class="nav-icon">✨</span><span class="nav-label">Sorts</span></button>
    <button class="nav-btn" onclick="switchPanel('talents',this)"><span class="nav-icon">📖</span><span class="nav-label">Talents</span></button>
    <button class="nav-btn" onclick="switchPanel('shop',this)"><span class="nav-icon">🏪</span><span class="nav-label">Shop</span></button>
    <div class="sidebar-divider"></div>
    <button class="nav-btn" onclick="switchPanel('pets',this)"><span class="nav-icon">🐾</span><span class="nav-label">Pets</span><span id="petNotif" class="nav-notif" style="display:none;">!</span></button>
    <button class="nav-btn" onclick="switchPanel('boss',this)"><span class="nav-icon" id="bossNavIcon">👹</span><span class="nav-label">Boss</span><span id="bossNotif" style="display:none;position:absolute;top:4px;right:4px;background:var(--red);color:#fff;font-size:0.5em;padding:2px 4px;border-radius:6px;animation:pulse-dot 1.5s infinite;">LIVE</span></button>
    <div class="sidebar-divider"></div>
    <button class="nav-btn" onclick="switchPanel('prestige',this)"><span class="nav-icon">🔮</span><span class="nav-label">Prestige</span></button>
    <button class="nav-btn" onclick="switchPanel('eternals',this)"><span class="nav-icon">⭐</span><span class="nav-label">Eternals</span><span id="eternalsNotif" class="nav-notif" style="display:none;">!</span></button>
    <button class="nav-btn" onclick="switchPanel('achievements',this)"><span class="nav-icon">🏆</span><span class="nav-label">Hauts Faits</span><span id="achieveNotif" class="nav-notif" style="display:none;">!</span></button>
    <button class="nav-btn" onclick="switchPanel('stats',this)"><span class="nav-icon">📊</span><span class="nav-label">Stats</span></button>
  </nav>

  <!-- Main Content Area -->
  <div class="main-content">
    <div class="hero-recap" id="heroRecap"></div>

    <!-- Battle Area - en dehors des panels pour pouvoir flotter -->
    <div class="battle-area" id="battleArea">
      <div id="battleSceneContainer"></div>
      <div class="mob-info-bar">
        <div class="mob-name" id="mobName">—</div>
        <div class="mob-hp-bar"><div class="mob-hp-fill" id="mobHpFill" style="width:100%"></div></div>
        <div class="mob-hp-text" id="mobHpText">0/0</div>
      </div>
    </div>

    <div class="main">
  <div id="panel-zone" class="panel active">
    <div class="zone-header">
      <div class="zone-name" id="zoneName">Zone 1</div>
      <div class="zone-desc" id="zoneDesc">...</div>
      <div class="zone-progress" id="zoneProgress"></div>
    </div>
    <!-- battleAreaPlaceholder pour quand on est sur l'onglet zone -->
    <div id="battleAreaPlaceholder"></div>
    <div class="kill-counter" id="killCounter">Kills : 0</div>
    <div class="spell-bar" id="spellBar"></div>
  </div>

  <div id="panel-gates" class="panel">
    <div class="card"><div class="card-title">🚪 Portes des Zones</div><div id="gatesList"></div></div>
  </div>

  <div id="panel-spells" class="panel">
    <div class="card">
      <div class="card-title">⚡ Amélioration des Sorts</div>
      <p style="font-size:0.8em;color:#888;margin-bottom:12px;">Améliore tes sorts pour augmenter les dégâts. Le coût augmente à chaque niveau.</p>
      <div id="spellUpgradeList"></div>
    </div>
  </div>

  <div id="panel-talents" class="panel">
    <div class="card">
      <div class="card-title">🌟 Arbre de Talents</div>
      <div style="font-size:0.8em;color:#888;margin-bottom:10px;">Points de talent (1 tous les 5 kills) : <span style="color:var(--gold)" id="tpAvailable">0</span></div>
      <div id="talentSections"></div>
    </div>
  </div>

  <div id="panel-shop" class="panel">
    <div class="card">
      <div class="card-title">🛒 Shop</div>
      <div style="font-size:0.8em;color:#888;margin-bottom:12px;">Améliorations uniques et consommables. Les unlocks survivent au rebirth mais pas au prestige.</div>
      <div id="shopList"></div>
    </div>
  </div>

  <div id="panel-pets" class="panel">
    <div class="card">
      <div class="card-title">🐾 Pets</div>
      <div style="font-size:0.8em;color:#888;margin-bottom:10px;">Les pets drop en tuant des mobs. Équipe un pet pour un bonus passif.</div>
      <div id="petsList"></div>
    </div>
  </div>

  <div id="panel-prestige" class="panel">
    <div class="card">
      <div class="card-title">⏳ Prestiges</div>
      <div id="prestigeContent"></div>
    </div>
  </div>

  <div id="panel-stats" class="panel">
    <div class="card"><div class="card-title">📊 Statistiques</div><div id="statsContent"></div></div>
  </div>

  <div id="panel-eternals" class="panel">
    <div class="card">
      <div class="card-title">⭐ Eternals — Progression Permanente</div>
      <div style="font-size:0.8em;color:#888;margin-bottom:15px;">Le Star Dust et les reliques persistent à travers les prestiges !</div>
      <div class="stardust-display">
        <span class="stardust-icon">⭐</span>
        <span style="font-family:'Cinzel',serif;color:#ce93d8;">Star Dust : <span id="starDustVal" style="color:var(--gold);">0</span></span>
      </div>
      <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:0.95em;margin-bottom:10px;">🏛️ Reliques</div>
      <div id="relicsList"></div>
      <div id="infinityPrestigeBox" style="margin-top:20px;"></div>
      <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:0.95em;margin:20px 0 10px;">📅 Défis Quotidiens</div>
      <div id="dailyChallengesList"></div>
    </div>
  </div>

  <div id="panel-achievements" class="panel">
    <div class="card">
      <div class="card-title">🏆 Hauts Faits</div>
      <div style="font-size:0.8em;color:#888;margin-bottom:15px;">Complète des achievements pour gagner des gemmes et du Star Dust !</div>
      <div id="achievementCategories"></div>
    </div>
  </div>

  <div id="panel-boss" class="panel">
    <!-- En attente -->
    <div id="bossWaiting" class="card" style="text-align:center;padding:40px 20px;">
      <div style="font-size:3em;margin-bottom:15px;">⏳</div>
      <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:1.2em;">Prochain World Boss</div>
      <div id="bossCountdown" style="font-size:2em;color:#fff;margin:15px 0;">--:--</div>
      <div style="font-size:0.8em;color:#666;">Connecte-toi avec Discord pour participer !</div>
      <div id="bossLoginPrompt" style="margin-top:15px;">
        <button class="btn" onclick="handleLogin()">🎮 Se connecter avec Discord</button>
      </div>
    </div>

    <!-- Boss actif -->
    <div id="bossActive" class="card boss-card-active" style="display:none;">
      <!-- Arène de combat Canvas -->
      <div class="boss-arena" id="bossArena">
        <canvas id="bossCanvas" width="400" height="220"></canvas>
        <div class="boss-player-labels" id="bossPlayerLabels"></div>
      </div>

      <!-- Info boss -->
      <div style="text-align:center;padding:10px 20px 20px;">
        <div id="bossName" style="font-family:'Cinzel',serif;color:var(--red);font-size:1.5em;">Lord Voldemort</div>
        <div style="margin:10px 0;">
          <div style="background:rgba(0,0,0,0.5);border-radius:10px;height:30px;overflow:hidden;border:1px solid var(--red);">
            <div id="bossHpBar" style="height:100%;background:linear-gradient(90deg,#8b0000,#ff4444);width:100%;transition:width 0.3s;"></div>
          </div>
          <div id="bossHpText" style="font-size:0.9em;margin-top:5px;color:#ff6666;">500M / 500M</div>
        </div>
        <div id="bossTimer" style="color:var(--gold);font-size:1.1em;margin-bottom:10px;">⏱️ 4:59</div>
        <div id="bossPlayerCount" style="font-size:0.85em;color:#888;">👥 0 joueurs</div>
      </div>

      <!-- Ancien bossIcon caché, pour compatibilité -->
      <div id="bossIcon" style="display:none;">🐍</div>

      <!-- Stats joueur -->
      <div style="background:rgba(106,27,154,0.2);border:1px solid var(--purple);border-radius:10px;padding:15px;margin:0 15px 15px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:0.8em;color:#888;">Tes dégâts</div>
            <div id="myBossDmg" style="font-size:1.3em;color:var(--gold);">0</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:0.8em;color:#888;">Contribution</div>
            <div id="myBossPercent" style="font-size:1.3em;color:#ce93d8;">0%</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.8em;color:#888;">Classement</div>
            <div id="myBossRank" style="font-size:1.3em;color:var(--green);">#--</div>
          </div>
        </div>
      </div>

      <!-- Auto-attaque info -->
      <div style="text-align:center;margin-bottom:20px;">
        <div style="background:rgba(46,125,50,0.2);border:1px solid var(--green);border-radius:10px;padding:12px;display:inline-block;">
          <div style="font-size:0.8em;color:#888;">⚔️ Auto-attaque active</div>
          <div id="bossDpsDisplay" style="font-size:1.2em;color:var(--green);font-family:'Cinzel',serif;">0 DPS</div>
        </div>
        <div id="bossNotLoggedIn" style="display:none;font-size:0.8em;color:var(--red);margin-top:8px;">
          Connecte-toi pour attaquer !
        </div>
      </div>

      <!-- Leaderboard -->
      <div style="padding:0 15px 15px;">
        <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:0.9em;margin-bottom:8px;">🏆 Top Contributeurs</div>
        <div id="bossLeaderboard" style="font-size:0.85em;"></div>
      </div>
    </div>

    <!-- Victoire -->
    <div id="bossVictory" class="card" style="display:none;text-align:center;padding:40px 20px;">
      <div style="font-size:4em;margin-bottom:15px;">🎉</div>
      <div style="font-family:'Cinzel',serif;color:var(--green);font-size:1.5em;">Victoire !</div>
      <div id="bossRewardText" style="margin:20px 0;font-size:1.1em;"></div>
      <button id="bossClaimBtn" class="btn btn-green" onclick="claimBossReward()" style="display:none;font-size:1.1em;padding:12px 30px;">
        🎁 Récupérer les récompenses
      </button>
      <div id="bossAlreadyClaimed" style="display:none;color:#888;font-size:0.9em;">✅ Récompenses déjà récupérées</div>
      <div id="bossNextCountdown" style="color:#888;margin-top:15px;"></div>
    </div>

    <!-- Boss expiré -->
    <div id="bossExpired" class="card" style="display:none;text-align:center;padding:40px 20px;">
      <div style="font-size:4em;margin-bottom:15px;">💀</div>
      <div style="font-family:'Cinzel',serif;color:var(--red);font-size:1.5em;">Boss échappé !</div>
      <div style="margin:20px 0;font-size:0.9em;color:#888;">Le boss s'est enfui... mais tes dégâts comptent quand même !</div>
      <div id="bossExpiredRewardText" style="margin:15px 0;font-size:1em;color:var(--gold);"></div>
      <button id="bossExpiredClaimBtn" class="btn" onclick="claimBossReward()" style="display:none;font-size:1.1em;padding:12px 30px;">
        🎁 Récupérer les récompenses
      </button>
      <div id="bossExpiredAlreadyClaimed" style="display:none;color:#888;font-size:0.9em;">✅ Récompenses récupérées</div>
      <div id="bossExpiredCountdown" style="color:var(--gold);margin-top:15px;"></div>
    </div>
  </div>
</div>
  </div><!-- /main-content -->
</div><!-- /game-layout -->

<!-- Active Buffs Bar -->
<div id="activeBuffsBar" class="active-buffs-bar"></div>

<!-- Bottom Progress Bar - Melvor Style -->
<div class="bottom-progress-bar" id="bottomProgressBar">
  <div class="bp-item">
    <span class="bp-label">⚔️ Zone</span>
    <span class="bp-value" id="bpZone">1</span>
  </div>
  <div class="bp-divider"></div>
  <div class="bp-item">
    <span class="bp-label">💀 Kills</span>
    <span class="bp-value" id="bpKills">0</span>
  </div>
  <div class="bp-divider"></div>
  <div class="bp-item">
    <span class="bp-label">⚡ DPS</span>
    <span class="bp-value" id="bpDps">0</span>
  </div>
  <div class="bp-divider"></div>
  <div class="bp-item">
    <span class="bp-label">🪙 Or/s</span>
    <span class="bp-value" id="bpGoldPs">0</span>
  </div>
</div>

<div id="toast" class="toast"></div>

<div id="bossAlertOverlay" class="boss-alert-overlay">
  <button class="boss-alert-close" onclick="closeBossAlert()" title="Fermer">✕</button>
  <div class="boss-alert-content">
    <div class="boss-alert-icon" id="bossAlertIcon">🐍</div>
    <div class="boss-alert-text">
      <div class="boss-alert-title">⚔️ WORLD BOSS</div>
      <div class="boss-alert-name" id="bossAlertName">Lord Voldemort</div>
    </div>
    <button class="btn boss-alert-btn" onclick="goToBossPanel(event)">Combattre</button>
  </div>
</div>

<div class="patch-modal" id="patchModal">
  <div class="patch-content">
    <div class="patch-header">
      <h2>📜 Patch Notes</h2>
      <button class="patch-close" onclick="togglePatchModal(false)">&times;</button>
    </div>
    <div class="patch-body">
      <div class="patch-version">Version 3.2.0 — Interface Melvor</div>
      <div class="patch-section">
        <h3>🎨 Refonte UI Complète</h3>
        <ul>
          <li>Nouveau design inspiré de <b>Melvor Idle 2</b></li>
          <li><b>Sidebar latérale</b> sur desktop (barre en bas sur mobile)</li>
          <li>Thème sombre modernisé avec accents verts</li>
          <li>Panneaux semi-transparents style Melvor</li>
          <li>Nouveaux boutons colorés (vert, or, violet, rouge)</li>
        </ul>
      </div>
      <div class="patch-section">
        <h3>📊 Barre de Progression</h3>
        <ul>
          <li>Nouvelle <b>bottom bar</b> avec stats en temps réel</li>
          <li>Affichage Zone, Kills, DPS, Or/s</li>
          <li>Visible sur tous les onglets</li>
        </ul>
      </div>
      <div class="patch-section">
        <h3>🏆 82 Hauts Faits</h3>
        <ul>
          <li>9 catégories : Combat, Progression, Collection, Sorts, Économie, Talents, Shop, Temps, Daily</li>
          <li>Nouveaux trackings : crits, talents, consommables, temps de jeu</li>
          <li>Icône talents changée (📖 au lieu de ⭐)</li>
        </ul>
      </div>
      <div class="patch-section">
        <h3>✨ Améliorations Visuelles</h3>
        <ul>
          <li>Barres HP/XP plus grandes et colorées</li>
          <li>Cards avec header et bordure verte</li>
          <li>Gates avec indicateur coloré à gauche</li>
          <li>Achievements et Reliques redesignés</li>
        </ul>
      </div>
      <div class="patch-section" style="border-top:1px solid rgba(212,168,67,0.2);margin-top:15px;padding-top:15px;">
        <h3>📜 Historique</h3>
        <details style="margin-bottom:8px;">
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v3.1.0 — Collection Ultimate</summary>
          <ul style="margin-top:5px;"><li>63 pets à collecter</li><li>5 raretés avec pets permanents</li><li>Pets Secrets & Légendaires</li><li>20+ synergies</li></ul>
        </details>
        <details style="margin-bottom:8px;">
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v3.0.0 — Eternals</summary>
          <ul style="margin-top:5px;"><li>Star Dust & Reliques permanentes</li><li>Pets Shiny & Multi-Pets</li><li>20+ Achievements</li><li>Évolutions de Sorts</li><li>Défis quotidiens</li></ul>
        </details>
        <details style="margin-bottom:8px;">
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v2.1.0 — Interface</summary>
          <ul style="margin-top:5px;"><li>Nouvelles animations de sorts uniques</li><li>Barre de sorts style MMO</li><li>Mini-aperçu du combat flottant</li><li>Barre des buffs actifs</li></ul>
        </details>
        <details style="margin-bottom:8px;">
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v2.0.0 — World Boss</summary>
          <ul style="margin-top:5px;"><li>World Boss multijoueur toutes les 20 min</li><li>Connexion Discord</li><li>Leaderboard temps réel</li><li>Récompenses selon contribution</li></ul>
        </details>
        <details style="margin-bottom:8px;">
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v1.7.0 — Auto-Avance</summary>
          <ul style="margin-top:5px;"><li>Toggle ON/OFF pour Auto-Avance dans la boutique</li></ul>
        </details>
        <details style="margin-bottom:8px;">
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v1.6.0 — Interface</summary>
          <ul style="margin-top:5px;"><li>Affichage multiplicateur prestige (⏳)</li><li>Bouton MAX pets auto-refresh</li></ul>
        </details>
        <details style="margin-bottom:8px;">
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v1.5.0 — Équilibrage Avada</summary>
          <ul style="margin-top:5px;"><li>Buff Avada Kedavra (100 dmg, 2.0s CD)</li><li>Réorganisation des sorts</li><li>Historique des patch notes</li></ul>
        </details>
        <details style="margin-bottom:8px;">
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v1.4.0 — Talents Avada</summary>
          <ul style="margin-top:5px;"><li>Talents Avada Kedavra (+25% dmg, -5% CD)</li><li>Boutons MAX et Aller pour pets</li></ul>
        </details>
        <details style="margin-bottom:8px;">
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v1.3.0 — Combat Visuel</summary>
          <ul style="margin-top:5px;"><li>Système de combat pixel art Castlevania</li><li>25 sprites de monstres uniques</li><li>Système de Patch Notes</li></ul>
        </details>
        <details style="margin-bottom:8px;">
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v1.2.0 — Corrections</summary>
          <ul style="margin-top:5px;"><li>Fix bug NaN après rebirth</li><li>Initialisation correcte d'Avada Kedavra</li></ul>
        </details>
        <details>
          <summary style="cursor:pointer;color:var(--gold);font-size:0.85em;">v1.0.0 — Lancement</summary>
          <ul style="margin-top:5px;"><li>25 zones avec progression</li><li>4 sorts magiques</li><li>Système de talents et pets</li><li>Rebirth et Prestige</li></ul>
        </details>
      </div>
    </div>
  </div>
</div>

`;

    // Execute game script
    const script = document.createElement('script');
    script.textContent = `
// ============ PATCH NOTES SYSTEM ============
const PATCH_VERSION = '3.2.0';

function togglePatchModal(show) {
  const modal = document.getElementById('patchModal');
  const btn = document.getElementById('patchNoteBtn');
  if (show) {
    modal.classList.add('show');
    // Mark as read
    localStorage.setItem('wandidle_patch_read', PATCH_VERSION);
    if (btn) btn.classList.remove('has-new');
  } else {
    modal.classList.remove('show');
  }
}

function checkPatchNotes() {
  const lastRead = localStorage.getItem('wandidle_patch_read');
  const btn = document.getElementById('patchNoteBtn');
  if (lastRead !== PATCH_VERSION) {
    // New patch notes available!
    if (btn) btn.classList.add('has-new');
    // Auto-show modal on first visit
    setTimeout(() => togglePatchModal(true), 500);
  }
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('patchModal');
  if (e.target === modal) togglePatchModal(false);
});

// ============ NUMBER FORMAT ============
const SUFFIXES = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','UDc','DDc','TDc','QaDc','QiDc','SxDc','SpDc','OcDc','NoDc','Vg'];
function fmt(n) {
  if (n < 0) return '-' + fmt(-n);
  if (n < 1000) return Math.floor(n).toString();
  let tier = Math.floor(Math.log10(n) / 3);
  if (tier >= SUFFIXES.length) tier = SUFFIXES.length - 1;
  return (n / Math.pow(10, tier * 3)).toFixed(2).replace(/\\.?0+\$/, '') + SUFFIXES[tier];
}

// ============ 25 ZONES ============
// Timing targets (cumulative from zone start):
// Z1→Z2: 30s | Z2→Z3: 1m | Z3→Z4: 2m | Z4→Z5: 3m | Z5→Z6: 4m
// Z6→Z7: 5m | Z7→Z8: 7m | Z8→Z9: 9m | Z9→Z10: 12m
// Z10 = PRESTIGE WALL 1 (~45min total)
// Z11-Z20 with x1.5 boost, similar pacing
// Z20 = PRESTIGE WALL 2 (~2.5h total)
// Z21-Z25 endgame with x3 boost

const ZONES = [
  // Zone 1-3: TUTORIAL (fast, learn mechanics)
  { name: 'Prairie Calme',        mob: { name: 'Lutin',           icon: '🧚', hp: 12,       gold: 8 }},
  { name: 'Sentier Ombragé',      mob: { name: 'Araignée',        icon: '🕷️', hp: 35,       gold: 20 }},
  { name: 'Forêt Dense',          mob: { name: 'Loup',            icon: '🐺', hp: 100,      gold: 55 }},
  // Zone 4-6: EARLY GAME (getting hooked)
  { name: 'Clairière Maudite',    mob: { name: 'Troll',           icon: '🧌', hp: 280,      gold: 140 }},
  { name: 'Grotte Humide',        mob: { name: 'Strangulot',      icon: '🐙', hp: 700,      gold: 320 }},
  { name: 'Marécage Noir',        mob: { name: 'Goule',           icon: '🧟', hp: 1600,     gold: 700 }},
  // Zone 7-9: MID GAME (investment pays off)
  { name: 'Ruines Anciennes',     mob: { name: 'Spectre',         icon: '👻', hp: 4000,     gold: 1600 }},
  { name: 'Donjon Oublié',        mob: { name: 'Squelette',       icon: '💀', hp: 10000,    gold: 3800 }},
  { name: 'Crypte des Ombres',    mob: { name: 'Vampire',         icon: '🧛', hp: 25000,    gold: 9000 }},
  // Zone 10: PRESTIGE WALL 1
  { name: '🔒 Seuil du Destin',   mob: { name: 'Gardien',         icon: '⚔️', hp: 60000,    gold: 20000 }, prestigeWall: true },
  // Zone 11-13: POST-PRESTIGE 1 (x1.5 — feels fast again)
  { name: 'Plaine de Cendres',    mob: { name: 'Golem de Pierre', icon: '🗿', hp: 150e3,    gold: 50e3 }, reqRebirth: 1 },
  { name: 'Volcan Dormant',       mob: { name: 'Salamandre',      icon: '🦎', hp: 400e3,    gold: 120e3 }, reqRebirth: 1 },
  { name: 'Lac de Lave',          mob: { name: 'Dragon de Feu',   icon: '🐉', hp: 1e6,      gold: 300e3 }, reqRebirth: 1 },
  // Zone 14-16: MID-LATE
  { name: 'Glacier Éternel',      mob: { name: 'Géant de Glace',  icon: '🏔️', hp: 2.5e6,    gold: 700e3 }, reqRebirth: 1 },
  { name: 'Désert des Esprits',   mob: { name: 'Djinn',           icon: '🌪️', hp: 6e6,      gold: 1.6e6 }, reqRebirth: 1 },
  { name: 'Forteresse Noire',     mob: { name: 'Chevalier Noir',  icon: '🖤', hp: 15e6,     gold: 4e6 }, reqRebirth: 1 },
  // Zone 17-19: LATE
  { name: 'Cimetière Maudit',     mob: { name: 'Liche',           icon: '☠️', hp: 40e6,     gold: 10e6 }, reqRebirth: 1 },
  { name: 'Tour du Nécromant',    mob: { name: 'Nécromant',       icon: '🧙‍♂️', hp: 100e6,    gold: 25e6 }, reqRebirth: 1 },
  { name: 'Portail des Abysses',  mob: { name: 'Démon',           icon: '😈', hp: 250e6,    gold: 60e6 }, reqRebirth: 1 },
  // Zone 20: PRESTIGE WALL 2
  { name: '🔒 Jugement Final',    mob: { name: 'Archange Déchu',  icon: '👁️', hp: 600e6,    gold: 150e6 }, prestigeWall: true, reqRebirth: 1 },
  // Zone 21-25: ENDGAME (x3 boost)
  { name: 'Dimension Alpha',      mob: { name: 'Entité Alpha',    icon: '🌀', hp: 2e9,      gold: 400e6 }, reqRebirth: 2 },
  { name: 'Faille Temporelle',    mob: { name: 'Chrono-Bête',     icon: '⏳', hp: 6e9,      gold: 1.2e9 }, reqRebirth: 2 },
  { name: 'Néant Absolu',         mob: { name: 'Vide Incarné',    icon: '⚫', hp: 20e9,     gold: 4e9 }, reqRebirth: 2 },
  { name: 'Cœur du Chaos',        mob: { name: 'Titan du Chaos',  icon: '💥', hp: 70e9,     gold: 14e9 }, reqRebirth: 2 },
  { name: 'Éternité',             mob: { name: 'L\\'Éternel',      icon: '✨', hp: 250e9,    gold: 50e9 }, reqRebirth: 2 },
];

// Gate costs calibrated to timing targets
const GATE_COSTS = [
  0,        // Z1 free
  60,       // Z2 — ~30s farm
  350,      // Z3 — ~1min
  1200,     // Z4 — ~2min
  4000,     // Z5 — ~3min
  12000,    // Z6 — ~4min
  35000,    // Z7 — ~5min
  90000,    // Z8 — ~7min
  220000,   // Z9 — ~9min
  500000,   // Z10 — ~12min (prestige wall)
  // Post-prestige 1
  800e3,    // Z11
  2e6,      // Z12
  5e6,      // Z13
  12e6,     // Z14
  30e6,     // Z15
  70e6,     // Z16
  160e6,    // Z17
  400e6,    // Z18
  900e6,    // Z19
  2e9,      // Z20 (prestige wall 2)
  // Post-prestige 2
  5e9,      // Z21
  15e9,     // Z22
  50e9,     // Z23
  150e9,    // Z24
  500e9,    // Z25
];

function getGateCost(zoneId) {
  if (zoneId < GATE_COSTS.length) return GATE_COSTS[zoneId];
  return GATE_COSTS[GATE_COSTS.length - 1] * Math.pow(5, zoneId - GATE_COSTS.length + 1);
}

// ============ REBIRTH & PRESTIGE ============
// Rebirth = soft reset (gold + sorts), keep talents. Required to progress.
const REBIRTH_TIERS = [
  { id: 1, name: 'Rebirth I — Éveil',      reqZone: 10, mult: 1.5, desc: 'Reset gold & sorts. Garde talents. Débloque zones 11-20.' },
  { id: 2, name: 'Rebirth II — Ascension',  reqZone: 20, mult: 3.0, desc: 'Reset gold & sorts. Garde talents. Débloque zones 21-25.' },
];
// Prestige = hard reset (everything). +0.3 mult per prestige. Infinite loop.
// Requires zone 25. Resets rebirths too.
const PRESTIGE_MULT_PER = 0.3;

// ============ SPELLS ============
// Ordre logique de puissance : Stupefix < Patronus < Confringo < Avada
const BASE_SPELLS = [
  { id: 'stupefix',  name: 'Stupefix',  icon: '⚡', baseDmg: 10, baseCD: 1.2, desc: 'Éclair rapide.' },
  { id: 'patronus',  name: 'Patronus',  icon: '🦌', baseDmg: 15, baseCD: 1.5, desc: 'Lumière sacrée.' },
  { id: 'confringo', name: 'Confringo', icon: '🔥', baseDmg: 24, baseCD: 2.0, desc: 'Explosion puissante.' },
];
const SPELL4 = { id: 'avada', name: 'Avada Kedavra', icon: '💀', baseDmg: 100, baseCD: 2.0, desc: 'Le sort interdit.' };
function getSpells() { return hasShop('spell4') ? [...BASE_SPELLS, SPELL4] : BASE_SPELLS; }
// Keep SPELLS as a getter for backward compat
let SPELLS = BASE_SPELLS;

function spellUpgradeCost(level) {
  return Math.floor(5 * Math.pow(1.07, level - 1));
}

// ============ TALENTS ============
const TALENTS = [
  { id: 'stupefix_dmg',  spell: 'stupefix',  name: 'Puissance Stupefix',  icon: '⚡', desc: '+20% dmg', maxLvl: 20, costBase: 1, effect: { type: 'spell_dmg', spell: 'stupefix',  perLevel: 0.2 }},
  { id: 'stupefix_cd',   spell: 'stupefix',  name: 'Vélocité Stupefix',   icon: '💨', desc: '-5% CD',   maxLvl: 15, costBase: 2, effect: { type: 'spell_cd',  spell: 'stupefix',  perLevel: 0.05 }},
  { id: 'confringo_dmg', spell: 'confringo', name: 'Puissance Confringo', icon: '🔥', desc: '+20% dmg', maxLvl: 20, costBase: 1, effect: { type: 'spell_dmg', spell: 'confringo', perLevel: 0.2 }},
  { id: 'confringo_cd',  spell: 'confringo', name: 'Vélocité Confringo',  icon: '💨', desc: '-5% CD',   maxLvl: 15, costBase: 2, effect: { type: 'spell_cd',  spell: 'confringo', perLevel: 0.05 }},
  { id: 'patronus_dmg',  spell: 'patronus',  name: 'Puissance Patronus',  icon: '🦌', desc: '+20% dmg', maxLvl: 20, costBase: 1, effect: { type: 'spell_dmg', spell: 'patronus',  perLevel: 0.2 }},
  { id: 'patronus_cd',   spell: 'patronus',  name: 'Vélocité Patronus',   icon: '💨', desc: '-5% CD',   maxLvl: 15, costBase: 2, effect: { type: 'spell_cd',  spell: 'patronus',  perLevel: 0.05 }},
  { id: 'avada_dmg',     spell: 'avada',     name: 'Puissance Avada',     icon: '💀', desc: '+25% dmg', maxLvl: 20, costBase: 3, effect: { type: 'spell_dmg', spell: 'avada',     perLevel: 0.25 }},
  { id: 'avada_cd',      spell: 'avada',     name: 'Vélocité Avada',      icon: '💨', desc: '-5% CD',   maxLvl: 15, costBase: 3, effect: { type: 'spell_cd',  spell: 'avada',     perLevel: 0.05 }},
  { id: 'crit_chance', spell: null, name: 'Chance Critique',   icon: '🎯', desc: '+2% crit',       maxLvl: 25, costBase: 2, effect: { type: 'crit_chance', perLevel: 0.02 }},
  { id: 'crit_dmg',    spell: null, name: 'Dégâts Critiques', icon: '💥', desc: '+15% dmg crit',  maxLvl: 20, costBase: 2, effect: { type: 'crit_dmg',    perLevel: 0.15 }},
  { id: 'gold_bonus',  spell: null, name: 'Cupidité',         icon: '🪙', desc: '+10% gold/kill', maxLvl: 30, costBase: 1, effect: { type: 'gold_bonus',  perLevel: 0.10 }},
  { id: 'multi_hit',   spell: null, name: 'Frappe Multiple',  icon: '✨', desc: '+5% double hit', maxLvl: 15, costBase: 3, effect: { type: 'multi_hit',   perLevel: 0.05 }},
  { id: 'all_dmg',     spell: null, name: 'Maîtrise Absolue', icon: '🌟', desc: '+10% tous dmg',  maxLvl: 50, costBase: 3, effect: { type: 'all_dmg',     perLevel: 0.10 }},
  { id: 'auto_speed',  spell: null, name: 'Rapidité',         icon: '⏩', desc: '-3% tous CD',    maxLvl: 20, costBase: 2, effect: { type: 'all_cd',      perLevel: 0.03 }},
];

// ============ PETS ============
// One pet per zone, % drop on kill, passive bonus. Only one active at a time.
// ============ PETS (Zone-based + Secrets + Legendaries) ============
// Rarity: common (zones 0-9), rare (zones 10-17), epic (zones 18-24), secret, legendary
const PETS = [
  // === COMMON (Zones 0-9) ===
  { id: 'fairy',     zone: 0,  icon: '🧚', name: 'Fée',            dropRate: 0.05,  rarity: 'common', desc: '+5% gold',        effect: { type: 'gold', val: 0.05 }},
  { id: 'cat',       zone: 0,  icon: '🐱', name: 'Chat',           dropRate: 0.04,  rarity: 'common', desc: '+3% crit chance', effect: { type: 'crit', val: 0.03 }},
  { id: 'spider',    zone: 1,  icon: '🕷️', name: 'Araignée',       dropRate: 0.04,  rarity: 'common', desc: '+8% Stupefix dmg', effect: { type: 'spell_dmg', spell: 'stupefix', val: 0.08 }},
  { id: 'rat',       zone: 1,  icon: '🐀', name: 'Rat',            dropRate: 0.045, rarity: 'common', desc: '+6% gold',        effect: { type: 'gold', val: 0.06 }},
  { id: 'wolf',      zone: 2,  icon: '🐺', name: 'Loup',           dropRate: 0.035, rarity: 'common', desc: '-5% tous CD',     effect: { type: 'all_cd', val: 0.05 }},
  { id: 'owl',       zone: 2,  icon: '🦉', name: 'Hibou',          dropRate: 0.038, rarity: 'common', desc: '+5% XP',          effect: { type: 'xp', val: 0.05 }},
  { id: 'troll',     zone: 3,  icon: '🧌', name: 'Troll',          dropRate: 0.03,  rarity: 'common', desc: '+10% tous dmg',   effect: { type: 'all_dmg', val: 0.10 }},
  { id: 'bat',       zone: 3,  icon: '🦇', name: 'Chauve-souris',  dropRate: 0.032, rarity: 'common', desc: '-4% tous CD',     effect: { type: 'all_cd', val: 0.04 }},
  { id: 'kraken',    zone: 4,  icon: '🐙', name: 'Strangulot',     dropRate: 0.025, rarity: 'common', desc: '+8% Confringo dmg', effect: { type: 'spell_dmg', spell: 'confringo', val: 0.08 }},
  { id: 'snake',     zone: 4,  icon: '🐍', name: 'Serpent',        dropRate: 0.028, rarity: 'common', desc: '+7% tous dmg',    effect: { type: 'all_dmg', val: 0.07 }},
  { id: 'ghoul',     zone: 5,  icon: '🧟', name: 'Goule',          dropRate: 0.02,  rarity: 'common', desc: '+12% gold',       effect: { type: 'gold', val: 0.12 }},
  { id: 'frog',      zone: 5,  icon: '🐸', name: 'Crapaud',        dropRate: 0.022, rarity: 'common', desc: '+8% XP',          effect: { type: 'xp', val: 0.08 }},
  { id: 'ghost',     zone: 6,  icon: '👻', name: 'Spectre',        dropRate: 0.018, rarity: 'common', desc: '+8% Patronus dmg', effect: { type: 'spell_dmg', spell: 'patronus', val: 0.08 }},
  { id: 'raven',     zone: 6,  icon: '🐦‍⬛', name: 'Corbeau',        dropRate: 0.019, rarity: 'common', desc: '+6% crit chance', effect: { type: 'crit', val: 0.06 }},
  { id: 'skeleton',  zone: 7,  icon: '💀', name: 'Squelette',      dropRate: 0.015, rarity: 'common', desc: '+5% crit chance', effect: { type: 'crit', val: 0.05 }},
  { id: 'fox',       zone: 7,  icon: '🦊', name: 'Renard',         dropRate: 0.016, rarity: 'common', desc: '+10% gold',       effect: { type: 'gold', val: 0.10 }},
  { id: 'vampire',   zone: 8,  icon: '🧛', name: 'Vampire',        dropRate: 0.012, rarity: 'common', desc: '+15% tous dmg',   effect: { type: 'all_dmg', val: 0.15 }},
  { id: 'scorpion',  zone: 8,  icon: '🦂', name: 'Scorpion',       dropRate: 0.013, rarity: 'common', desc: '+10% Stupefix dmg', effect: { type: 'spell_dmg', spell: 'stupefix', val: 0.10 }},
  { id: 'guardian',  zone: 9,  icon: '⚔️', name: 'Gardien',        dropRate: 0.01,  rarity: 'common', desc: '-8% tous CD',     effect: { type: 'all_cd', val: 0.08 }},
  { id: 'boar',      zone: 9,  icon: '🐗', name: 'Sanglier',       dropRate: 0.011, rarity: 'common', desc: '+12% tous dmg',   effect: { type: 'all_dmg', val: 0.12 }},

  // === RARE (Zones 10-17) ===
  { id: 'golem',     zone: 10, icon: '🗿', name: 'Golem',          dropRate: 0.009, rarity: 'rare', desc: '+20% gold',       effect: { type: 'gold', val: 0.20 }},
  { id: 'unicorn',   zone: 10, icon: '🦄', name: 'Licorne',        dropRate: 0.008, rarity: 'rare', desc: '+15% XP',         effect: { type: 'xp', val: 0.15 }},
  { id: 'salamander',zone: 11, icon: '🦎', name: 'Salamandre',     dropRate: 0.008, rarity: 'rare', desc: '+12% Confringo',  effect: { type: 'spell_dmg', spell: 'confringo', val: 0.12 }},
  { id: 'eagle',     zone: 11, icon: '🦅', name: 'Aigle',          dropRate: 0.007, rarity: 'rare', desc: '+10% crit chance', effect: { type: 'crit', val: 0.10 }},
  { id: 'dragon',    zone: 12, icon: '🐉', name: 'Dragon',         dropRate: 0.007, rarity: 'rare', desc: '+20% tous dmg',   effect: { type: 'all_dmg', val: 0.20 }},
  { id: 'tiger',     zone: 12, icon: '🐅', name: 'Tigre',          dropRate: 0.006, rarity: 'rare', desc: '-10% tous CD',    effect: { type: 'all_cd', val: 0.10 }},
  { id: 'giant',     zone: 13, icon: '🏔️', name: 'Géant de Glace', dropRate: 0.006, rarity: 'rare', desc: '+8% crit chance', effect: { type: 'crit', val: 0.08 }},
  { id: 'lion',      zone: 13, icon: '🦁', name: 'Lion',           dropRate: 0.0055,rarity: 'rare', desc: '+18% tous dmg',   effect: { type: 'all_dmg', val: 0.18 }},
  { id: 'djinn',     zone: 14, icon: '🌪️', name: 'Djinn',          dropRate: 0.005, rarity: 'rare', desc: '-10% tous CD',    effect: { type: 'all_cd', val: 0.10 }},
  { id: 'hippogriff',zone: 14, icon: '🪽', name: 'Hippogriffe',    dropRate: 0.0045,rarity: 'rare', desc: '+25% gold',       effect: { type: 'gold', val: 0.25 }},
  { id: 'knight',    zone: 15, icon: '🖤', name: 'Chevalier Noir', dropRate: 0.005, rarity: 'rare', desc: '+25% tous dmg',   effect: { type: 'all_dmg', val: 0.25 }},
  { id: 'griffin',   zone: 15, icon: '🦅', name: 'Griffon',        dropRate: 0.004, rarity: 'rare', desc: '+15% Patronus dmg', effect: { type: 'spell_dmg', spell: 'patronus', val: 0.15 }},
  { id: 'lich',      zone: 16, icon: '☠️', name: 'Liche',          dropRate: 0.004, rarity: 'rare', desc: '+30% gold',       effect: { type: 'gold', val: 0.30 }},
  { id: 'manticore', zone: 16, icon: '🦁', name: 'Manticore',      dropRate: 0.0035,rarity: 'rare', desc: '+22% tous dmg',   effect: { type: 'all_dmg', val: 0.22 }},
  { id: 'necro',     zone: 17, icon: '🧙', name: 'Nécromant',      dropRate: 0.004, rarity: 'rare', desc: '+12% crit chance', effect: { type: 'crit', val: 0.12 }},
  { id: 'cerberus',  zone: 17, icon: '🐕', name: 'Cerbère',        dropRate: 0.003, rarity: 'rare', desc: '-12% tous CD',    effect: { type: 'all_cd', val: 0.12 }},

  // === EPIC (Zones 18-24) ===
  { id: 'demon',     zone: 18, icon: '😈', name: 'Démon',          dropRate: 0.003, rarity: 'epic', desc: '+30% tous dmg',   effect: { type: 'all_dmg', val: 0.30 }},
  { id: 'hydra',     zone: 18, icon: '🐲', name: 'Hydre',          dropRate: 0.0025,rarity: 'epic', desc: '+20% Confringo dmg', effect: { type: 'spell_dmg', spell: 'confringo', val: 0.20 }},
  { id: 'archangel', zone: 19, icon: '👁️', name: 'Archange',       dropRate: 0.003, rarity: 'epic', desc: '-12% tous CD',    effect: { type: 'all_cd', val: 0.12 }},
  { id: 'chimera',   zone: 19, icon: '🔥', name: 'Chimère',        dropRate: 0.0022,rarity: 'epic', desc: '+35% tous dmg',   effect: { type: 'all_dmg', val: 0.35 }},
  { id: 'alpha',     zone: 20, icon: '🌀', name: 'Entité Alpha',   dropRate: 0.002, rarity: 'epic', desc: '+40% tous dmg',   effect: { type: 'all_dmg', val: 0.40 }},
  { id: 'leviathan', zone: 20, icon: '🌊', name: 'Léviathan',      dropRate: 0.0018,rarity: 'epic', desc: '+50% gold',       effect: { type: 'gold', val: 0.50 }},
  { id: 'chrono',    zone: 21, icon: '⏳', name: 'Chrono-Bête',    dropRate: 0.002, rarity: 'epic', desc: '-15% tous CD',    effect: { type: 'all_cd', val: 0.15 }},
  { id: 'sphinx',    zone: 21, icon: '🦁', name: 'Sphinx',         dropRate: 0.0015,rarity: 'epic', desc: '+20% XP',         effect: { type: 'xp', val: 0.20 }},
  { id: 'void',      zone: 22, icon: '⚫', name: 'Vide Incarné',   dropRate: 0.0015,rarity: 'epic', desc: '+50% gold',       effect: { type: 'gold', val: 0.50 }},
  { id: 'behemoth',  zone: 22, icon: '🦣', name: 'Béhémoth',       dropRate: 0.0012,rarity: 'epic', desc: '+45% tous dmg',   effect: { type: 'all_dmg', val: 0.45 }},
  { id: 'titan',     zone: 23, icon: '💥', name: 'Titan du Chaos', dropRate: 0.001, rarity: 'epic', desc: '+50% tous dmg',   effect: { type: 'all_dmg', val: 0.50 }},
  { id: 'seraph',    zone: 23, icon: '👼', name: 'Séraphin',       dropRate: 0.0008,rarity: 'epic', desc: '-18% tous CD',    effect: { type: 'all_cd', val: 0.18 }},
  { id: 'eternal',   zone: 24, icon: '✨', name: "L'Éternel",      dropRate: 0.0005,rarity: 'epic', desc: '+100% tous dmg',  effect: { type: 'all_dmg', val: 1.00 }},
  { id: 'omega',     zone: 24, icon: '🔮', name: 'Omega',          dropRate: 0.0004,rarity: 'epic', desc: '+75% tous dmg +25% gold', effect: { type: 'all', val: 0.75, gold: 0.25 }},

  // === SECRET PETS (Special unlock conditions, no zone drop) ===
  // hidden: true = condition cachée jusqu'à obtention (comme trophées PSN cachés)
  { id: 'phoenix',   zone: -1, icon: '🔥', name: 'Phoenix',        dropRate: 0, rarity: 'secret', desc: '+60% tous dmg, résurrection', effect: { type: 'all_dmg', val: 0.60 },
    unlock: { type: 'rebirth', target: 50, desc: '50 Rebirths', hidden: true }},
  { id: 'basilisk',  zone: -1, icon: '🐍', name: 'Basilic',        dropRate: 0, rarity: 'secret', desc: '+80% tous dmg', effect: { type: 'all_dmg', val: 0.80 },
    unlock: { type: 'kills', target: 100000, desc: '100K kills', hidden: true }},
  { id: 'thestral',  zone: -1, icon: '🦓', name: 'Sombral',        dropRate: 0, rarity: 'secret', desc: '+20% crit chance', effect: { type: 'crit', val: 0.20 },
    unlock: { type: 'prestige', target: 1, desc: '1 Prestige', hidden: true }},
  { id: 'niffler',   zone: -1, icon: '🦡', name: 'Niffleur',       dropRate: 0, rarity: 'secret', desc: '+100% gold', effect: { type: 'gold', val: 1.00 },
    unlock: { type: 'gold_total', target: 1e12, desc: '1T or total', hidden: true }},
  { id: 'acromantula',zone: -1,icon: '🕸️', name: 'Acromantule',    dropRate: 0, rarity: 'secret', desc: '-25% tous CD', effect: { type: 'all_cd', val: 0.25 },
    unlock: { type: 'zone_clear', target: 24, desc: 'Clear Zone 25' }},  // VISIBLE
  { id: 'dementor',  zone: -1, icon: '🖤', name: 'Détraqueur',     dropRate: 0, rarity: 'secret', desc: '+40% tous dmg, -10% CD', effect: { type: 'all', val: 0.40, cd: 0.10 },
    unlock: { type: 'world_boss_dmg', target: 1e12, desc: '1T dmg World Boss', hidden: true }},
  { id: 'boggart',   zone: -1, icon: '👤', name: 'Épouvantard',    dropRate: 0, rarity: 'secret', desc: '+30% XP', effect: { type: 'xp', val: 0.30 },
    unlock: { type: 'spells_cast', target: 10000, desc: '10K sorts lancés', hidden: true }},
  { id: 'house_elf', zone: -1, icon: '🧝', name: 'Elfe de Maison', dropRate: 0, rarity: 'secret', desc: '+50% gold, +20% XP', effect: { type: 'gold', val: 0.50, xp: 0.20 },
    unlock: { type: 'all_common_pets', target: 1, desc: 'Tous pets communs' }},  // VISIBLE

  // === LEGENDARY PETS (Ultra rare conditions) ===
  { id: 'merlin',    zone: -1, icon: '🧙‍♂️', name: 'Merlin',         dropRate: 0, rarity: 'legendary', desc: '+150% tous dmg', effect: { type: 'all_dmg', val: 1.50 },
    unlock: { type: 'all_rare_pets', target: 1, desc: 'Tous pets rares' }},  // VISIBLE
  { id: 'death',     zone: -1, icon: '💀', name: 'La Mort',        dropRate: 0, rarity: 'legendary', desc: '+200% tous dmg', effect: { type: 'all_dmg', val: 2.00 },
    unlock: { type: 'all_epic_pets', target: 1, desc: 'Tous pets épiques' }},  // VISIBLE
  { id: 'godlike',   zone: -1, icon: '👑', name: 'Entité Divine',  dropRate: 0, rarity: 'legendary', desc: '+300% tous dmg, +100% gold', effect: { type: 'all', val: 3.00, gold: 1.00 },
    unlock: { type: 'all_pets', target: 1, desc: 'TOUS les pets', hidden: true }},
  { id: 'timekeeper',zone: -1, icon: '⌛', name: 'Gardien du Temps',dropRate: 0, rarity: 'legendary', desc: '-50% tous CD', effect: { type: 'all_cd', val: 0.50 },
    unlock: { type: 'infinity_prestige', target: 1, desc: 'Infinity Prestige', hidden: true }},
  { id: 'worldeater',zone: -1, icon: '🌍', name: 'Dévoreur de Mondes',dropRate: 0, rarity: 'legendary', desc: '+500% tous dmg en World Boss', effect: { type: 'boss_dmg', val: 5.00 },
    unlock: { type: 'world_boss_kills', target: 10, desc: '10 World Boss tués', hidden: true }},
];

// Pet rarity colors and multipliers
const PET_RARITIES = {
  common:    { color: '#9e9e9e', name: 'Commun',    mult: 1.0 },
  rare:      { color: '#2196f3', name: 'Rare',      mult: 1.5 },
  epic:      { color: '#9c27b0', name: 'Épique',    mult: 2.0 },
  secret:    { color: '#ff9800', name: 'Secret',    mult: 2.5 },
  legendary: { color: '#ffd700', name: 'Légendaire', mult: 3.0 },
};

// ============ SHINY PETS CONFIG ============
const SHINY_RATE = 0.02;  // 2% chance on pet drop
const SHINY_MULT = 2.5;   // x2.5 bonus for shiny pets
// Special shiny conditions (guaranteed shiny if condition met)
const SHINY_SPECIAL = {
  dragon: { condition: 'all_zones_fast', desc: 'Toutes zones en -10s' },
  guardian: { condition: 'world_boss', desc: 'Obtenu pendant World Boss' },
  vampire: { condition: 'rebirths_1000', desc: 'Après 1000 rebirths totaux' },
  phoenix: { condition: 'always', desc: 'Toujours shiny' },  // Secret pets are always shiny!
  basilisk: { condition: 'always', desc: 'Toujours shiny' },
  thestral: { condition: 'always', desc: 'Toujours shiny' },
  niffler: { condition: 'always', desc: 'Toujours shiny' },
  acromantula: { condition: 'always', desc: 'Toujours shiny' },
  dementor: { condition: 'always', desc: 'Toujours shiny' },
  boggart: { condition: 'always', desc: 'Toujours shiny' },
  house_elf: { condition: 'always', desc: 'Toujours shiny' },
  // Legendary pets are ALWAYS shiny
  merlin: { condition: 'always', desc: 'Toujours shiny' },
  death: { condition: 'always', desc: 'Toujours shiny' },
  godlike: { condition: 'always', desc: 'Toujours shiny' },
  timekeeper: { condition: 'always', desc: 'Toujours shiny' },
  worldeater: { condition: 'always', desc: 'Toujours shiny' },
};

// ============ PET SYNERGIES ============
const PET_SYNERGIES = [
  // Fire synergies
  { pets: ['dragon', 'salamander'], name: 'Feu Infernal', icon: '🔥', desc: '+25% dégâts de feu', effect: { type: 'spell_dmg', spell: 'confringo', val: 0.25 }},
  { pets: ['phoenix', 'dragon'], name: 'Flamme Éternelle', icon: '🌋', desc: '+40% Confringo, résurrection', effect: { type: 'spell_dmg', spell: 'confringo', val: 0.40 }},
  { pets: ['hydra', 'chimera'], name: 'Multi-Tête', icon: '🐲', desc: '+50% tous dégâts', effect: { type: 'all_dmg', val: 0.50 }},
  // Dark synergies
  { pets: ['vampire', 'spider'], name: 'Venin Mortel', icon: '☠️', desc: '+30% dégâts poison', effect: { type: 'all_dmg', val: 0.30 }},
  { pets: ['lich', 'necro'], name: 'Maître des Morts', icon: '💀', desc: '+35% tous dmg, +25% gold', effect: { type: 'all_dmg', val: 0.35 }},
  { pets: ['demon', 'dementor'], name: 'Ténèbres Absolues', icon: '🖤', desc: '+60% tous dégâts', effect: { type: 'all_dmg', val: 0.60 }},
  // Light synergies
  { pets: ['ghost', 'fairy'], name: 'Esprit Chanceux', icon: '🍀', desc: '+20% XP et or', effect: { type: 'gold', val: 0.20 }},
  { pets: ['guardian', 'archangel'], name: 'Résurrection', icon: '💫', desc: 'Auto-résurrection 1x/zone', effect: { type: 'resurrection', val: 1 }},
  { pets: ['unicorn', 'griffin'], name: 'Magie Pure', icon: '✨', desc: '+30% Patronus dmg', effect: { type: 'spell_dmg', spell: 'patronus', val: 0.30 }},
  { pets: ['seraph', 'archangel'], name: 'Lumière Divine', icon: '👼', desc: '+45% tous dmg, -15% CD', effect: { type: 'all_dmg', val: 0.45 }},
  // Power synergies
  { pets: ['titan', 'eternal'], name: 'Puissance Absolue', icon: '⚡', desc: '+50% tous dégâts', effect: { type: 'all_dmg', val: 0.50 }},
  { pets: ['alpha', 'omega'], name: 'Alpha & Omega', icon: '🌀', desc: '+80% tous dmg, +50% gold', effect: { type: 'all_dmg', val: 0.80 }},
  { pets: ['behemoth', 'leviathan'], name: 'Colosses', icon: '🦣', desc: '+70% tous dégâts', effect: { type: 'all_dmg', val: 0.70 }},
  // Time synergies
  { pets: ['chrono', 'djinn'], name: 'Maître du Temps', icon: '⏰', desc: '-20% tous CD', effect: { type: 'all_cd', val: 0.20 }},
  { pets: ['timekeeper', 'chrono'], name: 'Paradoxe Temporel', icon: '⌛', desc: '-40% tous CD', effect: { type: 'all_cd', val: 0.40 }},
  // Beast synergies
  { pets: ['wolf', 'lion'], name: 'Meute Alpha', icon: '🐺', desc: '+25% tous dmg', effect: { type: 'all_dmg', val: 0.25 }},
  { pets: ['cat', 'owl'], name: 'Familiers', icon: '🐱', desc: '+15% XP, +15% gold', effect: { type: 'gold', val: 0.15 }},
  { pets: ['tiger', 'cerberus'], name: 'Gardiens Féroces', icon: '🐅', desc: '-18% CD, +20% dmg', effect: { type: 'all_cd', val: 0.18 }},
  // HP creatures synergies
  { pets: ['basilisk', 'acromantula'], name: 'Chambre des Secrets', icon: '🕸️', desc: '+50% tous dmg', effect: { type: 'all_dmg', val: 0.50 }},
  { pets: ['thestral', 'hippogriff'], name: 'Cavaliers Ailés', icon: '🪽', desc: '+35% tous dmg, +30% gold', effect: { type: 'all_dmg', val: 0.35 }},
  { pets: ['niffler', 'house_elf'], name: 'Serviteurs Fidèles', icon: '🧝', desc: '+150% gold', effect: { type: 'gold', val: 1.50 }},
  // Legendary synergies
  { pets: ['merlin', 'death'], name: 'Maîtres de la Mort', icon: '💀', desc: '+300% tous dégâts', effect: { type: 'all_dmg', val: 3.00 }},
  { pets: ['godlike', 'worldeater'], name: 'Divinité', icon: '👑', desc: '+500% tous dmg, +200% gold', effect: { type: 'all_dmg', val: 5.00 }},
];

// ============ RELICS (Eternals) ============
const RELICS = [
  { id: 'ancient_wand',   name: 'Baguette Ancienne',   icon: '🪄', desc: '+5% DPS permanent par niveau', maxLvl: 5, costs: [100, 250, 500, 1000, 2000], effect: { type: 'all_dmg', perLevel: 0.05 }},
  { id: 'mana_crystal',   name: 'Cristal de Mana',     icon: '💎', desc: '+10% mana max par niveau',     maxLvl: 5, costs: [150, 350, 700, 1400, 2800], effect: { type: 'mana', perLevel: 0.10 }},
  { id: 'broken_hourglass', name: 'Sablier Brisé',     icon: '⏳', desc: '-2% cooldown sorts par niveau', maxLvl: 5, costs: [200, 450, 900, 1800, 3600], effect: { type: 'all_cd', perLevel: 0.02 }},
  { id: 'phoenix_amulet', name: 'Amulette du Phoenix', icon: '🔥', desc: '+1% chance critique par niveau', maxLvl: 5, costs: [250, 550, 1100, 2200, 4400], effect: { type: 'crit', perLevel: 0.01 }},
  { id: 'lost_grimoire',  name: 'Grimoire Oublié',     icon: '📖', desc: '+3% XP par niveau',             maxLvl: 5, costs: [120, 300, 600, 1200, 2400], effect: { type: 'xp', perLevel: 0.03 }},
  { id: 'eternity_orb',   name: "Orbe d'Éternité",     icon: '🌟', desc: '+5% Star Dust gagné par niveau', maxLvl: 5, costs: [500, 1000, 2000, 4000, 8000], effect: { type: 'stardust', perLevel: 0.05 }},
];

// ============ ACHIEVEMENTS (50+) ============
const ACHIEVEMENTS = [
  // ===== COMBAT (12) =====
  { id: 'first_blood',    category: 'combat', name: 'Premier Sang',      icon: '🗡️', desc: 'Vaincre 100 monstres',          target: 100,      reward: { gems: 10 }},
  { id: 'slayer',         category: 'combat', name: 'Tueur',             icon: '⚔️', desc: 'Vaincre 1,000 monstres',        target: 1000,     reward: { gems: 15 }},
  { id: 'hunter',         category: 'combat', name: 'Chasseur',          icon: '🏹', desc: 'Vaincre 10,000 monstres',       target: 10000,    reward: { gems: 25 }},
  { id: 'destroyer',      category: 'combat', name: 'Destructeur',       icon: '💣', desc: 'Vaincre 100,000 monstres',      target: 100000,   reward: { gems: 50 }},
  { id: 'exterminator',   category: 'combat', name: 'Exterminateur',     icon: '💀', desc: 'Vaincre 1,000,000 monstres',    target: 1000000,  reward: { gems: 100, starDust: 100 }},
  { id: 'genocide',       category: 'combat', name: 'Génocidaire',       icon: '☠️', desc: 'Vaincre 10,000,000 monstres',   target: 10000000, reward: { gems: 250, starDust: 500 }},
  { id: 'boss_slayer',    category: 'combat', name: 'Tueur de Boss',     icon: '👹', desc: 'Vaincre 50 boss de zone',       target: 50,       reward: { gems: 50 }},
  { id: 'boss_hunter',    category: 'combat', name: 'Chasseur de Boss',  icon: '🐲', desc: 'Vaincre 200 boss de zone',      target: 200,      reward: { gems: 100, starDust: 50 }},
  { id: 'world_champion', category: 'combat', name: 'Champion du Monde', icon: '🏆', desc: 'Participer à 10 World Boss',    target: 10,       reward: { gems: 100, starDust: 50 }},
  { id: 'world_legend',   category: 'combat', name: 'Légende Mondiale',  icon: '🌍', desc: 'Participer à 50 World Boss',    target: 50,       reward: { gems: 300, starDust: 200 }},
  { id: 'crit_king',      category: 'combat', name: 'Roi des Crits',     icon: '💥', desc: 'Infliger 1000 coups critiques', target: 1000,     reward: { gems: 30 }},
  { id: 'crit_god',       category: 'combat', name: 'Dieu des Crits',    icon: '⚡', desc: 'Infliger 100,000 coups critiques', target: 100000, reward: { gems: 150, starDust: 100 }},

  // ===== PROGRESSION (15) =====
  { id: 'beginner',       category: 'progression', name: 'Débutant',        icon: '🌱', desc: 'Atteindre la zone 2',     target: 2,   reward: { gems: 5 }},
  { id: 'apprentice',     category: 'progression', name: 'Apprenti',        icon: '📚', desc: 'Atteindre la zone 5',     target: 5,   reward: { gems: 10 }},
  { id: 'student',        category: 'progression', name: 'Étudiant',        icon: '🎒', desc: 'Atteindre la zone 10',    target: 10,  reward: { gems: 20 }},
  { id: 'adventurer',     category: 'progression', name: 'Aventurier',      icon: '🗺️', desc: 'Atteindre la zone 15',    target: 15,  reward: { gems: 25 }},
  { id: 'explorer',       category: 'progression', name: 'Explorateur',     icon: '🧭', desc: 'Atteindre la zone 20',    target: 20,  reward: { gems: 35 }},
  { id: 'master',         category: 'progression', name: 'Maître',          icon: '🎓', desc: 'Atteindre la zone 25',    target: 25,  reward: { gems: 50, starDust: 100 }},
  { id: 'rebirth_1',      category: 'progression', name: 'Première Renaissance', icon: '🔄', desc: 'Effectuer 1 rebirth',   target: 1,   reward: { gems: 20 }},
  { id: 'rebirth_5',      category: 'progression', name: 'Cycle Infini',     icon: '🔁', desc: 'Effectuer 5 rebirths',   target: 5,   reward: { gems: 35 }},
  { id: 'rebirthed',      category: 'progression', name: 'Renaissance',      icon: '♻️', desc: 'Effectuer 10 rebirths',  target: 10,  reward: { gems: 50 }},
  { id: 'rebirth_25',     category: 'progression', name: 'Éternel Retour',   icon: '🌀', desc: 'Effectuer 25 rebirths',  target: 25,  reward: { gems: 75, starDust: 50 }},
  { id: 'rebirth_50',     category: 'progression', name: 'Phénix',           icon: '🔥', desc: 'Effectuer 50 rebirths',  target: 50,  reward: { gems: 100, starDust: 100 }},
  { id: 'rebirth_100',    category: 'progression', name: 'Immortel',         icon: '👼', desc: 'Effectuer 100 rebirths', target: 100, reward: { gems: 200, starDust: 300 }},
  { id: 'transcended',    category: 'progression', name: 'Transcendance',    icon: '⏳', desc: 'Effectuer 1 prestige',   target: 1,   reward: { gems: 100, starDust: 200 }},
  { id: 'prestige_5',     category: 'progression', name: 'Ascension',        icon: '🚀', desc: 'Effectuer 5 prestiges',  target: 5,   reward: { gems: 250, starDust: 500 }},
  { id: 'prestige_10',    category: 'progression', name: 'Divinité',         icon: '👑', desc: 'Effectuer 10 prestiges', target: 10,  reward: { gems: 500, starDust: 1000 }},

  // ===== COLLECTION (12) =====
  { id: 'pet_friend',     category: 'collection', name: 'Ami des Bêtes',         icon: '🐾', desc: 'Débloquer 10 pets',            target: 10, reward: { gems: 25 }},
  { id: 'pet_collector',  category: 'collection', name: 'Collectionneur',        icon: '📦', desc: 'Débloquer 25 pets',            target: 25, reward: { gems: 50 }},
  { id: 'pet_hoarder',    category: 'collection', name: 'Accumulateur',          icon: '🏛️', desc: 'Débloquer 40 pets',            target: 40, reward: { gems: 100 }},
  { id: 'common_master',  category: 'collection', name: 'Maître des Communs',    icon: '⚪', desc: 'Tous pets communs (20)',       target: 20, reward: { gems: 75, starDust: 50 }},
  { id: 'rare_hunter',    category: 'collection', name: 'Chasseur de Rares',     icon: '🔵', desc: 'Tous pets rares (16)',         target: 16, reward: { gems: 100, starDust: 100 }},
  { id: 'epic_seeker',    category: 'collection', name: 'Chercheur Épique',      icon: '🟣', desc: 'Tous pets épiques (14)',       target: 14, reward: { gems: 150, starDust: 200 }},
  { id: 'secret_finder',  category: 'collection', name: 'Découvreur de Secrets', icon: '🟠', desc: 'Tous pets secrets (8)',        target: 8,  reward: { gems: 200, starDust: 300 }},
  { id: 'legendary_one',  category: 'collection', name: 'Le Légendaire',         icon: '🟡', desc: 'Tous pets légendaires (5)',    target: 5,  reward: { gems: 500, starDust: 1000 }},
  { id: 'menagerie',      category: 'collection', name: 'Ménagerie Complète',    icon: '🏠', desc: 'Débloquer TOUS les pets (63)', target: 63, reward: { gems: 1000, starDust: 2000 }},
  { id: 'shiny_hunter',   category: 'collection', name: 'Chasseur de Brillants', icon: '✨', desc: 'Obtenir un pet shiny',         target: 1,  reward: { gems: 50, starDust: 50 }},
  { id: 'shiny_collector',category: 'collection', name: 'Brillant Amateur',      icon: '💫', desc: 'Obtenir 10 pets shiny',        target: 10, reward: { gems: 150, starDust: 200 }},
  { id: 'shiny_master',   category: 'collection', name: 'Maître Brillant',       icon: '🌟', desc: 'Obtenir 25 pets shiny',        target: 25, reward: { gems: 500, starDust: 1000 }},

  // ===== SPELLS (10) =====
  { id: 'first_spell',    category: 'spells', name: 'Premier Sort',      icon: '🪄', desc: 'Lancer 100 sorts',              target: 100,    reward: { gems: 10 }},
  { id: 'spellcaster',    category: 'spells', name: 'Lanceur de Sorts',  icon: '✨', desc: 'Lancer 1,000 sorts',            target: 1000,   reward: { gems: 25 }},
  { id: 'wizard',         category: 'spells', name: 'Sorcier',           icon: '🧙', desc: 'Lancer 10,000 sorts',           target: 10000,  reward: { gems: 50, starDust: 25 }},
  { id: 'archmage',       category: 'spells', name: 'Archimage',         icon: '🔮', desc: 'Lancer 100,000 sorts',          target: 100000, reward: { gems: 150, starDust: 150 }},
  { id: 'pyromancer',     category: 'spells', name: 'Pyromane',          icon: '🔥', desc: 'Lancer 1,000 Confringo',        target: 1000,   reward: { gems: 25 }},
  { id: 'electromancer',  category: 'spells', name: 'Électromancien',    icon: '⚡', desc: 'Lancer 1,000 Stupefix',         target: 1000,   reward: { gems: 25 }},
  { id: 'lightbringer',   category: 'spells', name: 'Porteur de Lumière', icon: '☀️', desc: 'Lancer 1,000 Patronus',        target: 1000,   reward: { gems: 25 }},
  { id: 'deathdealer',    category: 'spells', name: 'Marchand de Mort',  icon: '💀', desc: 'Lancer 1,000 Avada Kedavra',    target: 1000,   reward: { gems: 50, starDust: 50 }},
  { id: 'spell_master',   category: 'spells', name: 'Maître des Sorts',  icon: '📖', desc: 'Un sort au niveau 50',          target: 50,     reward: { gems: 50, starDust: 50 }},
  { id: 'spell_legend',   category: 'spells', name: 'Légende des Sorts', icon: '📚', desc: 'Tous les sorts au niveau 100',  target: 100,    reward: { gems: 200, starDust: 300 }},

  // ===== ECONOMY (10) =====
  { id: 'first_gold',     category: 'economy', name: 'Première Pièce',    icon: '🪙', desc: 'Gagner 1,000 or',               target: 1000,   reward: { gems: 5 }},
  { id: 'saver',          category: 'economy', name: 'Économe',           icon: '💵', desc: 'Accumuler 100K or total',       target: 1e5,    reward: { gems: 15 }},
  { id: 'wealthy',        category: 'economy', name: 'Riche',             icon: '💰', desc: 'Accumuler 1M or total',         target: 1e6,    reward: { gems: 25 }},
  { id: 'millionaire',    category: 'economy', name: 'Millionnaire',      icon: '💎', desc: 'Accumuler 1B or total',         target: 1e9,    reward: { gems: 50, starDust: 100 }},
  { id: 'billionaire',    category: 'economy', name: 'Milliardaire',      icon: '💳', desc: 'Accumuler 1T or total',         target: 1e12,   reward: { gems: 100, starDust: 250 }},
  { id: 'tycoon',         category: 'economy', name: 'Magnat',            icon: '🏦', desc: 'Accumuler 1Qa or total',        target: 1e15,   reward: { gems: 200, starDust: 500 }},
  { id: 'gem_collector',  category: 'economy', name: 'Collectionneur Gemmes', icon: '💎', desc: 'Posséder 1,000 gemmes',     target: 1000,   reward: { starDust: 100 }},
  { id: 'gem_hoarder',    category: 'economy', name: 'Accumulateur Gemmes', icon: '👑', desc: 'Posséder 10,000 gemmes',      target: 10000,  reward: { starDust: 500 }},
  { id: 'stardust_1',     category: 'economy', name: 'Poussière Cosmique', icon: '⭐', desc: 'Collecter 100 Star Dust',      target: 100,    reward: { gems: 25 }},
  { id: 'eternal_one',    category: 'economy', name: 'Éternel',            icon: '🌟', desc: 'Collecter 1,000 Star Dust',    target: 1000,   reward: { gems: 100, starDust: 500 }},

  // ===== TALENTS (8) =====
  { id: 'talent_1',       category: 'talents', name: 'Premier Talent',     icon: '📖', desc: 'Acheter 1 talent',              target: 1,    reward: { gems: 10 }},
  { id: 'talent_10',      category: 'talents', name: 'Apprenti Talentueux', icon: '📚', desc: 'Acheter 10 talents',           target: 10,   reward: { gems: 25 }},
  { id: 'talent_25',      category: 'talents', name: 'Talentueux',          icon: '🎯', desc: 'Acheter 25 talents',           target: 25,   reward: { gems: 50 }},
  { id: 'talent_50',      category: 'talents', name: 'Expert',              icon: '🏅', desc: 'Acheter 50 talents',           target: 50,   reward: { gems: 75, starDust: 50 }},
  { id: 'talent_100',     category: 'talents', name: 'Maître Talentueux',   icon: '🎖️', desc: 'Acheter 100 talents',          target: 100,  reward: { gems: 100, starDust: 100 }},
  { id: 'talent_max_1',   category: 'talents', name: 'Perfection',          icon: '✅', desc: 'Maxer 1 talent',               target: 1,    reward: { gems: 30 }},
  { id: 'talent_max_5',   category: 'talents', name: 'Excellence',          icon: '🌟', desc: 'Maxer 5 talents',              target: 5,    reward: { gems: 75, starDust: 50 }},
  { id: 'talent_max_all', category: 'talents', name: 'Omniscient',          icon: '👁️', desc: 'Maxer tous les talents',       target: 20,   reward: { gems: 300, starDust: 500 }},

  // ===== SHOP (6) =====
  { id: 'first_purchase', category: 'shop', name: 'Premier Achat',       icon: '🛒', desc: 'Acheter quelque chose',           target: 1,   reward: { gems: 10 }},
  { id: 'shopper',        category: 'shop', name: 'Acheteur',            icon: '🛍️', desc: 'Acheter 5 articles boutique',     target: 5,   reward: { gems: 25 }},
  { id: 'shopaholic',     category: 'shop', name: 'Accro du Shopping',   icon: '🏪', desc: 'Tout débloquer dans la boutique', target: 5,   reward: { gems: 100, starDust: 100 }},
  { id: 'buff_user',      category: 'shop', name: 'Utilisateur de Buffs', icon: '⚡', desc: 'Utiliser 10 consommables',       target: 10,  reward: { gems: 25 }},
  { id: 'buff_addict',    category: 'shop', name: 'Accro aux Buffs',      icon: '💊', desc: 'Utiliser 100 consommables',      target: 100, reward: { gems: 75, starDust: 50 }},
  { id: 'avada_unlock',   category: 'shop', name: 'Magie Interdite',      icon: '💀', desc: 'Débloquer Avada Kedavra',        target: 1,   reward: { gems: 50, starDust: 50 }},

  // ===== TIME (5) =====
  { id: 'play_1h',        category: 'time', name: 'Première Heure',      icon: '⏰', desc: 'Jouer 1 heure',                   target: 3600,    reward: { gems: 15 }},
  { id: 'play_10h',       category: 'time', name: 'Dévoué',              icon: '⏱️', desc: 'Jouer 10 heures',                 target: 36000,   reward: { gems: 50 }},
  { id: 'play_24h',       category: 'time', name: 'Un Jour Complet',     icon: '📅', desc: 'Jouer 24 heures',                 target: 86400,   reward: { gems: 100, starDust: 50 }},
  { id: 'play_100h',      category: 'time', name: 'Centurion',           icon: '🎮', desc: 'Jouer 100 heures',                target: 360000,  reward: { gems: 200, starDust: 200 }},
  { id: 'play_1000h',     category: 'time', name: 'Légende Vivante',     icon: '🏆', desc: 'Jouer 1000 heures',               target: 3600000, reward: { gems: 500, starDust: 1000 }},

  // ===== DAILY (4) =====
  { id: 'daily_1',        category: 'daily', name: 'Premier Défi',        icon: '📋', desc: 'Compléter 1 défi quotidien',     target: 1,   reward: { gems: 10 }},
  { id: 'daily_10',       category: 'daily', name: 'Habitué',             icon: '📝', desc: 'Compléter 10 défis quotidiens',  target: 10,  reward: { gems: 30 }},
  { id: 'daily_50',       category: 'daily', name: 'Régulier',            icon: '📊', desc: 'Compléter 50 défis quotidiens',  target: 50,  reward: { gems: 75, starDust: 50 }},
  { id: 'daily_100',      category: 'daily', name: 'Dévotion Quotidienne', icon: '🗓️', desc: 'Compléter 100 défis quotidiens', target: 100, reward: { gems: 150, starDust: 150 }},
];

const ACHIEVEMENT_CATEGORIES = {
  combat:      { name: 'Combat',      icon: '⚔️', bonus: { type: 'all_dmg', val: 0.02 }},
  progression: { name: 'Progression', icon: '📈', bonus: { type: 'all_dmg', val: 0.02 }},
  collection:  { name: 'Collection',  icon: '🎒', bonus: { type: 'gold', val: 0.02 }},
  spells:      { name: 'Sorts',       icon: '🪄', bonus: { type: 'all_dmg', val: 0.02 }},
  economy:     { name: 'Économie',    icon: '💰', bonus: { type: 'gold', val: 0.02 }},
  talents:     { name: 'Talents',     icon: '📖', bonus: { type: 'all_dmg', val: 0.02 }},
  shop:        { name: 'Boutique',    icon: '🛒', bonus: { type: 'gold', val: 0.02 }},
  time:        { name: 'Temps',       icon: '⏰', bonus: { type: 'all_dmg', val: 0.01 }},
  daily:       { name: 'Quotidien',   icon: '📅', bonus: { type: 'gold', val: 0.01 }},
};

// ============ SPELL EVOLUTIONS ============
const SPELL_EVOLUTIONS = {
  confringo: [
    { level: 25,  name: 'Flamme Bleue',   color: '#4fc3f7', bonusDmg: 0.20, icon: '🔵', desc: '+20% dégâts' },
    { level: 50,  name: 'Inferno',        color: '#ff5722', bonusDmg: 0.50, icon: '🌋', desc: '+50% dégâts, AoE' },
    { level: 100, name: 'Feu Maudit',     color: '#9c27b0', bonusDmg: 1.00, icon: '💜', desc: '+100% dégâts, DoT' },
  ],
  stupefix: [
    { level: 25,  name: 'Éclair Amélioré', color: '#64b5f6', bonusDmg: 0.15, icon: '⚡', desc: 'Stun 0.5s' },
    { level: 50,  name: 'Foudre',          color: '#1976d2', bonusDmg: 0.35, icon: '🌩️', desc: 'Stun 1s + slow' },
    { level: 100, name: 'Paralysie',       color: '#0d47a1', bonusDmg: 0.60, icon: '💎', desc: 'Paralysie 2s' },
  ],
  patronus: [
    { level: 25,  name: 'Lumière Vive',   color: '#fff59d', bonusDmg: 0.20, icon: '☀️', desc: '-10% def ennemi' },
    { level: 50,  name: 'Éclat Divin',    color: '#ffd54f', bonusDmg: 0.45, icon: '🌟', desc: '-25% def + désarme' },
    { level: 100, name: 'Nova Sacrée',    color: '#ffab00', bonusDmg: 0.80, icon: '💫', desc: '-50% def + réflexion' },
  ],
  avada: [
    { level: 25,  name: 'Mort Subite',    color: '#66bb6a', bonusDmg: 0.25, icon: '💚', desc: 'x2 crit dmg' },
    { level: 50,  name: 'Malédiction',    color: '#43a047', bonusDmg: 0.50, icon: '🐍', desc: 'x3 crit dmg' },
    { level: 100, name: 'Néant Absolu',   color: '#1b5e20', bonusDmg: 1.00, icon: '⚫', desc: 'x5 crit dmg + reset CD si kill' },
  ],
};

// ============ DAILY CHALLENGES ============
const DAILY_CHALLENGE_TYPES = [
  { id: 'kill_monsters', name: 'Tueur', icon: '⚔️', desc: 'Vaincre {target} monstres', targets: [100, 250, 500, 1000] },
  { id: 'cast_spells',   name: 'Lanceur', icon: '✨', desc: 'Lancer {target} sorts', targets: [50, 100, 200, 500] },
  { id: 'earn_gold',     name: 'Prospecteur', icon: '🪙', desc: 'Gagner {target} or', targets: [10000, 50000, 100000, 500000] },
  { id: 'boss_damage',   name: 'Champion', icon: '👹', desc: 'Infliger {target} dégâts au boss', targets: [1e6, 5e6, 10e6, 50e6] },
  { id: 'upgrade_spell', name: 'Améliorer', icon: '⬆️', desc: 'Améliorer un sort {target} fois', targets: [5, 10, 20, 50] },
];
const DAILY_REWARD = { gems: 25, starDust: 10 };

// ============ SHOP (gold sink) ============
// Unique unlocks (one-time purchase)
const SHOP_UNLOCKS = [
  { id: 'auto_advance',  name: 'Auto-Avance',     icon: '🚀', desc: 'Ouvre automatiquement la prochaine porte dès que tu as assez de gold.', cost: 5000 },
  { id: 'pet_magnet',    name: 'Aimant à Pets',   icon: '🧲', desc: 'Double le taux de drop de tous les pets.', cost: 15000 },
  { id: 'triple_hit',    name: 'Triple Frappe',    icon: '⚔️', desc: 'Les double hits peuvent devenir des triple hits (33% chance).', cost: 50000 },
  { id: 'gold_crit',     name: 'Gold Critique',    icon: '💰', desc: 'Les coups critiques donnent aussi x2 gold sur ce kill.', cost: 100000 },
  { id: 'spell4',        name: 'Avada Kedavra',    icon: '💀', desc: 'Débloque un 4ème sort : 40 dmg, 3.0s CD.', cost: 500000 },
];
// Consumables (repeatable, cost scales)
const SHOP_CONSUMABLES = [
  { id: 'gold_rush',  name: 'Gold Rush',      icon: '🪙', desc: 'x2 gold pendant 2 minutes.',       baseCost: 500,  costMult: 1.05, duration: 120 },
  { id: 'frenzy',     name: 'Frénésie',       icon: '⚡', desc: '-50% CD sorts pendant 2 minutes.',  baseCost: 800,  costMult: 1.05, duration: 120 },
  { id: 'lucky',      name: 'Chance Pure',     icon: '🍀', desc: 'x3 drop rate pets pendant 2 min.', baseCost: 1200, costMult: 1.05, duration: 120 },
];

// Pet upgrade cost: scales with pet zone, rarity, and level (VERY HARD scaling)
function petUpgradeCost(pet, level) {
  const rarityMult = PET_RARITIES[pet.rarity]?.mult || 1;
  const zoneBase = pet.zone >= 0 ? pet.zone * 2000 : 20000;  // Secret/Legendary have VERY high base
  const base = Math.max(500, zoneBase + 500) * rarityMult;
  // Exponential scaling: x2.2 per level = EXTREMELY hard to level high
  // Level 1->2: base, Level 2->3: base*2.2, Level 3->4: base*4.84, Level 10: base*1207
  return Math.floor(base * Math.pow(2.2, level - 1));
}

// ============ WORLD BOSS CONFIG ============
const WORLD_BOSS_CONFIG = {
  spawnInterval: 20 * 60 * 1000,  // 20 minutes
  duration: 5 * 60 * 1000,         // 5 minutes pour tuer
  baseHp: 50_000_000_000,          // 50 MILLIARDS HP de base (très difficile)
  attackCooldown: 0.5,             // 0.5s entre chaque attaque

  // Scaling dynamique (style MMO)
  // HP effectif = baseHp * bossMultiplier * (1 + scalingFactor * sqrt(nombreJoueurs - 1))
  // Donc 1 joueur = x1, 10 joueurs = x1.9, 25 joueurs = x2.4, 50 joueurs = x3, 100 joueurs = x4
  scalingFactor: 0.3,

  // Récompenses basées sur les dégâts (toujours données)
  damageRewards: {
    perPercent: { gems: 10, gold: 10000000000 },  // Par % de dégâts = 10 gems + 10B gold
    maxPercent: 100,                               // Cap à 100% = max 1000 gems + 1T gold
  },

  // Bonus si le boss est tué (en plus des récompenses de dégâts)
  victoryBonus: {
    participation: { gems: 100, gold: 100000000000 },      // Participation = 100 gems + 100B
    top50Percent: { gems: 250, gold: 500000000000 },       // Top 50% = 250 gems + 500B
    top10Percent: { gems: 500, gold: 2000000000000 },      // Top 10% = 500 gems + 2T
    top3: { gems: 1000, gold: 10000000000000 },            // Top 3 = 1000 gems + 10T
    top1: { gems: 2500, gold: 50000000000000 },            // #1 = 2500 gems + 50T
  }
};

const WORLD_BOSSES = [
  { id: 'voldemort', name: 'Lord Voldemort', icon: '🐍', hpMult: 1.0 },
  { id: 'grindelwald', name: 'Grindelwald', icon: '⚡', hpMult: 1.2 },
  { id: 'basilisk', name: 'Basilic', icon: '🐉', hpMult: 0.8 },
  { id: 'dementor_king', name: 'Roi Détraqueur', icon: '👻', hpMult: 1.5 },
  { id: 'dragon', name: 'Magyar à Pointes', icon: '🔥', hpMult: 1.3 },
];

// World Boss State
let worldBossState = {
  active: false,
  boss: null,           // { id, name, icon, hp, maxHp, baseMaxHp }
  myDamage: 0,
  myDisplayName: 'Sorcier',
  attackCD: 0,
  participants: [],     // [{ uid, name, damage }, ...]
  nextSpawn: null,
  status: 'waiting',    // waiting | active | victory | expired
  claimed: false,
  effectiveMaxHp: 0,    // HP max avec scaling (recalculé dynamiquement)
};

// Calcule le HP effectif en fonction du nombre de joueurs
function calcEffectiveMaxHp(baseMaxHp, numPlayers) {
  if (numPlayers <= 1) return baseMaxHp;
  // Scaling: baseHp * (1 + 0.3 * sqrt(joueurs - 1))
  // 1 joueur = x1, 10 joueurs = x1.9, 25 joueurs = x2.4, 50 joueurs = x3
  const scaling = 1 + WORLD_BOSS_CONFIG.scalingFactor * Math.sqrt(numPlayers - 1);
  return Math.floor(baseMaxHp * scaling);
}

// Calcule le HP restant avec le scaling
function calcEffectiveHp(currentHp, baseMaxHp, effectiveMaxHp) {
  // Ratio des dégâts infligés
  const damageRatio = 1 - (currentHp / baseMaxHp);
  // Applique ce ratio au HP effectif
  return Math.floor(effectiveMaxHp * (1 - damageRatio));
}

// Firebase user state
let firebaseUser = null;
let bossUnsubscribers = [];

// ============ STATE ============
let G = null;

function defaultState() {
  let talents = {};
  TALENTS.forEach(t => talents[t.id] = 0);
  return {
    gold: 0, gems: 0, talentPoints: 0,
    currentZone: 0, unlockedZones: 1,
    kills: 0, totalKills: 0, totalGoldEarned: 0,
    rebirth: 0, rebirthMult: 1,
    prestige: 0, prestigeMult: 1,
    highestZone: 0,
    talents: talents,
    spellLevels: { stupefix: 1, confringo: 1, patronus: 1 },
    ownedPets: [],  // array of pet ids
    activePet: null, // pet id or null
    petLevels: {},  // petId → level (starts at 1 when obtained)
    shopUnlocks: [],  // array of unlock ids
    shopBuys: {},     // consumableId → number of times bought (for cost scaling)
    buffs: {},        // buffId → expiry timestamp
    autoAdvanceEnabled: true,  // toggle for auto-advance feature
    mobHp: 0, mobMaxHp: 0,
    spellCDs: { stupefix: 0, confringo: 0, patronus: 0 },
    lastTick: Date.now(),
    _saveTimer: 0,
    startTime: Date.now(),
    // === NEW SYSTEMS ===
    // Star Dust & Eternals
    starDust: 0,
    totalStarDust: 0,
    relics: {},  // relicId → level (0-5)
    infinityPrestige: 0,  // number of infinity prestiges
    infinityMult: 1,  // permanent multiplier from infinity prestige
    // Shiny Pets
    shinyPets: [],  // array of pet ids that are shiny
    // Multi-Pets
    activePets: [],  // array of equipped pet ids (replaces activePet for multi-pet)
    petSlots: 1,  // number of pet slots (1 base, 2 after zone 15, 3 after prestige)
    // Achievements
    achievements: [],  // array of completed achievement ids
    achievementProgress: {},  // achievementId → progress value
    // Daily Challenges
    dailyChallenges: [],  // [{id, type, target, progress, completed}]
    lastDailyReset: 0,  // timestamp of last daily reset
    // Spell tracking for achievements
    spellsCast: {},  // spellId → total times cast
    // Zone completion times for speed records
    zoneCompletionTimes: {},  // zoneId → best time in seconds
    zone25FirstClear: 0,  // timestamp of first zone 25 clear
    // World Boss tracking for secret pets
    worldBossKills: 0,  // total world bosses killed (participated in victory)
    totalWorldBossDmg: 0,  // total damage dealt to world bosses (lifetime)
    // Achievement tracking
    totalCrits: 0,  // total critical hits
    totalTalentsBought: 0,  // total talents purchased
    totalConsumablesUsed: 0,  // total consumables used
    totalDailiesCompleted: 0,  // total daily challenges completed
    bossKills: 0,  // zone boss kills
  };
}

function save() {
  G.lastTick = Date.now();
  localStorage.setItem('wandIdle', JSON.stringify(G));
  // Sync to cloud if logged in
  saveToCloud();
}
function load() { try { const d = localStorage.getItem('wandIdle'); if (d) { G = JSON.parse(d); return true; } } catch(e) {} return false; }

// Cloud sync functions are defined after Firebase initialization (see below)

// ============ COMPUTED ============
function getTalent(id) { return G.talents[id] || 0; }

function getPetBonus(type, spell) {
  if (!G.activePet) return 0;
  const pet = PETS.find(p => p.id === G.activePet);
  if (!pet) return 0;
  if (pet.effect.type === type || pet.effect.type === 'all') {
    if (spell && pet.effect.spell && pet.effect.spell !== spell) return 0;
    const lvl = G.petLevels[pet.id] || 1;
    const rarityMult = (PET_RARITIES[pet.rarity] || PET_RARITIES.common).mult;
    // Diminishing returns: base + 20% of base per extra level, multiplied by rarity
    return pet.effect.val * (1 + (lvl - 1) * 0.2) * rarityMult;
  }
  return 0;
}

function hasShop(id) { return G.shopUnlocks && G.shopUnlocks.includes(id); }
function hasBuff(id) { return G.buffs && G.buffs[id] && G.buffs[id] > Date.now(); }
function buffRemaining(id) { return hasBuff(id) ? Math.max(0, Math.ceil((G.buffs[id] - Date.now()) / 1000)) : 0; }

function getSpellDmg(spellId) {
  const def = getSpells().find(s => s.id === spellId);
  let dmg = def.baseDmg * G.spellLevels[spellId];
  const t = TALENTS.find(t => t.effect.type === 'spell_dmg' && t.effect.spell === spellId);
  if (t) dmg *= (1 + getTalent(t.id) * t.effect.perLevel);
  const allDmg = TALENTS.find(t => t.effect.type === 'all_dmg');
  if (allDmg) dmg *= (1 + getTalent(allDmg.id) * allDmg.effect.perLevel);
  // Multi-pet system bonus (replaces old single pet)
  dmg *= (1 + getMultiPetBonus('spell_dmg', spellId) + getMultiPetBonus('all_dmg'));
  // Spell evolution bonus
  dmg *= (1 + getSpellEvolutionBonus(spellId));
  // Relic bonus
  dmg *= (1 + getRelicBonus('all_dmg'));
  // Achievement category bonus
  dmg *= (1 + getCategoryBonus('all_dmg'));
  // Multipliers
  dmg *= G.rebirthMult * G.prestigeMult * (G.infinityMult || 1);
  return dmg;
}

function getSpellCD(spellId) {
  const def = getSpells().find(s => s.id === spellId);
  let cd = def.baseCD;
  const t = TALENTS.find(t => t.effect.type === 'spell_cd' && t.effect.spell === spellId);
  if (t) cd *= (1 - getTalent(t.id) * t.effect.perLevel);
  const allCd = TALENTS.find(t => t.effect.type === 'all_cd');
  if (allCd) cd *= (1 - getTalent(allCd.id) * allCd.effect.perLevel);
  // Multi-pet system bonus
  cd *= (1 - getMultiPetBonus('all_cd'));
  // Relic bonus
  cd *= (1 - getRelicBonus('all_cd'));
  if (hasBuff('frenzy')) cd *= 0.5;
  return Math.max(0.15, cd);
}

function getCritChance() {
  const t = TALENTS.find(t => t.effect.type === 'crit_chance');
  let crit = (t ? getTalent(t.id) * t.effect.perLevel : 0);
  crit += getMultiPetBonus('crit');
  crit += getRelicBonus('crit');
  return Math.min(crit, 0.8);
}

function getCritMult() {
  const t = TALENTS.find(t => t.effect.type === 'crit_dmg');
  return 2 + (t ? getTalent(t.id) * t.effect.perLevel : 0);
}

function getGoldMult() {
  const t = TALENTS.find(t => t.effect.type === 'gold_bonus');
  let m = 1 + (t ? getTalent(t.id) * t.effect.perLevel : 0);
  m += getMultiPetBonus('gold');
  m += getCategoryBonus('gold');
  m *= G.rebirthMult * G.prestigeMult * (G.infinityMult || 1);
  if (hasBuff('gold_rush')) m *= 2;
  return m;
}

function getMultiHitChance() {
  const t = TALENTS.find(t => t.effect.type === 'multi_hit');
  return Math.min((t ? getTalent(t.id) * t.effect.perLevel : 0), 0.8);
}

function getDPS() {
  let total = 0;
  getSpells().forEach(s => { total += getSpellDmg(s.id) / getSpellCD(s.id); });
  return total * (1 + getCritChance() * (getCritMult() - 1)) * (1 + getMultiHitChance());
}

function getGoldPerSec() {
  const zone = ZONES[G.currentZone] || ZONES[ZONES.length - 1];
  const dps = getDPS();
  if (zone.mob.hp <= 0) return 0;
  return (dps / zone.mob.hp) * zone.mob.gold * getGoldMult();
}

// ============ MOB ============
function spawnMob() {
  const zone = ZONES[G.currentZone] || ZONES[ZONES.length - 1];
  G.mobHp = zone.mob.hp;
  G.mobMaxHp = zone.mob.hp;
}

function damageMob(amount, spellType) {
  if (G.mobHp <= 0) return;
  let isCrit = Math.random() < getCritChance();
  let dmg = amount;
  if (isCrit) {
    dmg *= getCritMult();
    G.totalCrits = (G.totalCrits || 0) + 1;
    checkAchievement('crit_king', G.totalCrits);
    checkAchievement('crit_god', G.totalCrits);
  }
  dmg = Math.floor(Math.max(1, dmg));
  let hits = 1;
  if (Math.random() < getMultiHitChance()) {
    hits = 2;
    if (hasShop('triple_hit') && Math.random() < 0.33) hits = 3;
  }
  // PixiJS spell animation
  if (window.battleAPI) {
    window.battleAPI.castSpell(spellType || 'fire');
  }
  for (let i = 0; i < hits; i++) {
    G.mobHp -= dmg;
    spawnDmgNumber(dmg, isCrit && i === 0);
  }
  // PixiJS hit animation
  if (window.battleAPI) {
    setTimeout(() => window.battleAPI.hitMob(), 250);
  }
  if (G.mobHp <= 0) onMobKill(isCrit);
}

function onMobKill(wasCrit) {
  const zone = ZONES[G.currentZone] || ZONES[ZONES.length - 1];
  let goldDrop = Math.floor(zone.mob.gold * getGoldMult());
  if (wasCrit && hasShop('gold_crit')) goldDrop *= 2;
  G.gold += goldDrop;
  G.totalGoldEarned += goldDrop;
  G.kills++;
  G.totalKills++;
  if (G.kills % 5 === 0) G.talentPoints++;
  spawnGoldNumber(goldDrop);

  // Update daily challenges
  updateDailyChallenge('kill_monsters', 1);
  updateDailyChallenge('earn_gold', goldDrop);

  // Check achievements
  checkAchievement('first_blood', G.totalKills);
  checkAchievement('hunter', G.totalKills);
  checkAchievement('exterminator', G.totalKills);
  checkAchievement('wealthy', G.totalGoldEarned);
  checkAchievement('millionaire', G.totalGoldEarned);

  // Pet drop check
  const zonePets = PETS.filter(p => p.zone === G.currentZone);
  zonePets.forEach(p => {
    let dr = p.dropRate;
    if (hasShop('pet_magnet')) dr *= 2;
    if (hasBuff('lucky')) dr *= 3;
    if (!G.ownedPets.includes(p.id) && Math.random() < dr) {
      G.ownedPets.push(p.id);
      G.petLevels[p.id] = 1;

      // Check for shiny!
      if (tryMakeShiny(p.id)) {
        if (!G.shinyPets) G.shinyPets = [];
        G.shinyPets.push(p.id);
        toast('✨ PET SHINY obtenu : ' + p.icon + ' ' + p.name + ' ✨');
        checkAchievement('shiny_hunter', 1);
        checkAchievement('shiny_master', G.shinyPets.length);
      } else {
        toast('🎉 Pet obtenu : ' + p.icon + ' ' + p.name + ' !');
      }

      // Auto-equip if slot available (multi-pet system)
      if (!G.activePets) G.activePets = [];
      if (G.activePets.length < getPetSlots()) {
        G.activePets.push(p.id);
      }
      // Sync with old system
      if (!G.activePet) G.activePet = p.id;

      // Check pet achievements (all tiers)
      checkPetCollectionAchievements();

      rebuildHeroRecap();
      showPetNotif();
    }
  });

  // Check secret/legendary pet unlocks
  checkSecretPetUnlocks();

  // Check zone 25 clear for Star Dust
  if (G.currentZone === 24 && !G.zone25FirstClear) {
    G.zone25FirstClear = Date.now();
    awardStarDust(100 * (G.prestigeMult || 1), 'Zone 25 terminée');
  }

  spawnMob();
}

// ============ SECRET/LEGENDARY PET UNLOCK CHECKS ============
function checkSecretPetUnlocks() {
  const secretPets = PETS.filter(p => p.rarity === 'secret' || p.rarity === 'legendary');

  secretPets.forEach(pet => {
    if (G.ownedPets.includes(pet.id)) return;  // Already owned
    if (!pet.unlock) return;

    let unlocked = false;
    const unlock = pet.unlock;

    switch (unlock.type) {
      case 'rebirth':
        unlocked = G.rebirth >= unlock.target;
        break;
      case 'kills':
        unlocked = G.totalKills >= unlock.target;
        break;
      case 'prestige':
        unlocked = G.prestige >= unlock.target;
        break;
      case 'gold_total':
        unlocked = G.totalGoldEarned >= unlock.target;
        break;
      case 'zone_clear':
        unlocked = G.highestZone >= unlock.target;
        break;
      case 'world_boss_dmg':
        unlocked = (G.totalWorldBossDmg || 0) >= unlock.target;
        break;
      case 'spells_cast':
        const totalSpells = Object.values(G.spellsCast || {}).reduce((a, b) => a + b, 0);
        unlocked = totalSpells >= unlock.target;
        break;
      case 'all_common_pets':
        const commonPets = PETS.filter(p => p.rarity === 'common');
        unlocked = commonPets.every(p => G.ownedPets.includes(p.id));
        break;
      case 'all_rare_pets':
        const rarePets = PETS.filter(p => p.rarity === 'rare');
        unlocked = rarePets.every(p => G.ownedPets.includes(p.id));
        break;
      case 'all_epic_pets':
        const epicPets = PETS.filter(p => p.rarity === 'epic');
        unlocked = epicPets.every(p => G.ownedPets.includes(p.id));
        break;
      case 'all_pets':
        // Needs all non-legendary pets
        const nonLegendary = PETS.filter(p => p.rarity !== 'legendary');
        unlocked = nonLegendary.every(p => G.ownedPets.includes(p.id));
        break;
      case 'infinity_prestige':
        unlocked = (G.infinityPrestige || 0) >= unlock.target;
        break;
      case 'world_boss_kills':
        unlocked = (G.worldBossKills || 0) >= unlock.target;
        break;
    }

    if (unlocked) {
      // Unlock the secret/legendary pet!
      G.ownedPets.push(pet.id);
      G.petLevels[pet.id] = 1;

      // Secret/Legendary pets are ALWAYS shiny
      if (!G.shinyPets) G.shinyPets = [];
      G.shinyPets.push(pet.id);

      const rarityInfo = PET_RARITIES[pet.rarity];
      toast(rarityInfo.color === '#ffd700'
        ? '👑 PET LÉGENDAIRE : ' + pet.icon + ' ' + pet.name + ' 👑'
        : '🔶 PET SECRET : ' + pet.icon + ' ' + pet.name + ' 🔶');

      checkPetCollectionAchievements();
      rebuildPets();
    }
  });
}

function checkPetCollectionAchievements() {
  const owned = G.ownedPets || [];

  // Count by rarity
  const commonOwned = PETS.filter(p => p.rarity === 'common' && owned.includes(p.id)).length;
  const rareOwned = PETS.filter(p => p.rarity === 'rare' && owned.includes(p.id)).length;
  const epicOwned = PETS.filter(p => p.rarity === 'epic' && owned.includes(p.id)).length;
  const secretOwned = PETS.filter(p => p.rarity === 'secret' && owned.includes(p.id)).length;
  const legendaryOwned = PETS.filter(p => p.rarity === 'legendary' && owned.includes(p.id)).length;

  checkAchievement('pet_friend', owned.length);
  checkAchievement('pet_collector', owned.length);
  checkAchievement('common_master', commonOwned);
  checkAchievement('rare_hunter', rareOwned);
  checkAchievement('epic_seeker', epicOwned);
  checkAchievement('secret_finder', secretOwned);
  checkAchievement('legendary_one', legendaryOwned);
  checkAchievement('menagerie', owned.length);
  checkAchievement('shiny_hunter', (G.shinyPets || []).length > 0 ? 1 : 0);
  checkAchievement('shiny_master', (G.shinyPets || []).length);
}

// ============ VFX ============
function spawnDmgNumber(amount, isCrit) {
  const area = document.getElementById('battleArea');
  if (!area) return;
  const el = document.createElement('div');
  el.className = 'dmg-number' + (isCrit ? ' crit' : '');
  el.textContent = (isCrit ? '💥 ' : '') + fmt(amount);
  el.style.left = (35 + Math.random() * 30) + '%';
  el.style.top = (25 + Math.random() * 25) + '%';
  area.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function spawnGoldNumber(amount) {
  const area = document.getElementById('battleArea');
  if (!area) return;
  const el = document.createElement('div');
  el.className = 'dmg-number gold-drop';
  el.textContent = '+' + fmt(amount) + ' 🪙';
  el.style.left = (40 + Math.random() * 20) + '%';
  el.style.top = (55 + Math.random() * 10) + '%';
  area.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

// ============ SPELL AUTO-CAST ============
function tickSpells(dt) {
  getSpells().forEach(spell => {
    const slotEl = document.getElementById('spell-slot-' + spell.id);
    const cdEl = document.getElementById('spell-cd-' + spell.id);
    const cdTextEl = document.getElementById('spell-cdtext-' + spell.id);
    const maxCd = getSpellCD(spell.id);

    if (G.spellCDs[spell.id] > 0) {
      G.spellCDs[spell.id] = Math.max(0, G.spellCDs[spell.id] - dt);
      // Update radial cooldown
      const cdPercent = (G.spellCDs[spell.id] / maxCd) * 100;
      if (cdEl) cdEl.style.setProperty('--cd-percent', cdPercent + '%');
      if (cdTextEl) { cdTextEl.style.display = 'block'; cdTextEl.textContent = G.spellCDs[spell.id].toFixed(1); }
      if (slotEl) { slotEl.classList.remove('ready'); slotEl.classList.add('on-cd'); }
    } else {
      // Cast spell
      damageMob(getSpellDmg(spell.id), spell.id);
      G.spellCDs[spell.id] = maxCd;

      // Track spell cast for achievements/challenges
      if (!G.spellsCast) G.spellsCast = {};
      G.spellsCast[spell.id] = (G.spellsCast[spell.id] || 0) + 1;
      updateDailyChallenge('cast_spells', 1);
      // Spell achievements
      const totalSpells = Object.values(G.spellsCast).reduce((a, b) => a + b, 0);
      checkAchievement('first_spell', totalSpells);
      checkAchievement('spellcaster', totalSpells);
      checkAchievement('wizard', totalSpells);
      checkAchievement('archmage', totalSpells);
      if (spell.id === 'confringo') checkAchievement('pyromancer', G.spellsCast[spell.id]);
      if (spell.id === 'stupefix') checkAchievement('electromancer', G.spellsCast[spell.id]);
      if (spell.id === 'patronus') checkAchievement('lightbringer', G.spellsCast[spell.id]);
      if (spell.id === 'avada') checkAchievement('deathdealer', G.spellsCast[spell.id]);

      if (slotEl) {
        slotEl.classList.remove('on-cd');
        slotEl.classList.add('casting');
        setTimeout(() => {
          slotEl.classList.remove('casting');
          slotEl.classList.add('on-cd');
        }, 200);
      }
      if (cdEl) cdEl.style.setProperty('--cd-percent', '100%');
      if (cdTextEl) { cdTextEl.style.display = 'block'; cdTextEl.textContent = maxCd.toFixed(1); }
    }
  });
}

// ============ SPELL UPGRADES ============
function upgradeSpell(spellId) {
  const cost = spellUpgradeCost(G.spellLevels[spellId]);
  if (G.gold < cost) { toast('Pas assez de gold !'); return; }
  G.gold -= cost;
  G.spellLevels[spellId]++;
  updateDailyChallenge('upgrade_spell', 1);
  checkSpellAchievements();
  if (activePanel === 'spells') rebuildSpellUpgrades();
}

function upgradeSpellMax(spellId) {
  let bought = 0;
  while (true) {
    const cost = spellUpgradeCost(G.spellLevels[spellId]);
    if (G.gold < cost) break;
    G.gold -= cost;
    G.spellLevels[spellId]++;
    bought++;
  }
  if (bought === 0) { toast('Pas assez de gold !'); return; }
  toast('+' + bought + ' niveaux !');
  updateDailyChallenge('upgrade_spell', bought);
  checkSpellAchievements();
  if (activePanel === 'spells') rebuildSpellUpgrades();
}

function checkSpellAchievements() {
  // Check spell_master (any spell at level 50)
  const maxSpellLevel = Math.max(...getSpells().map(s => G.spellLevels[s.id] || 1));
  checkAchievement('spell_master', maxSpellLevel);

  // Check archmage (all spells at level 100)
  const allAt100 = getSpells().every(s => (G.spellLevels[s.id] || 1) >= 100);
  if (allAt100) checkAchievement('archmage', 100);
}

// ============ GATES ============
function canAccessZone(zoneId) {
  const zone = ZONES[zoneId];
  if (!zone) return false;
  if (zone.reqRebirth && G.rebirth < zone.reqRebirth) return false;
  return true;
}

function unlockGate(zoneId) {
  if (zoneId >= ZONES.length) return;
  const cost = getGateCost(zoneId);
  if (G.gold < cost) { toast('Pas assez de gold !'); return; }
  if (!canAccessZone(zoneId)) { toast('Rebirth requis !'); return; }
  if (zoneId > G.unlockedZones) { toast('Débloque la zone précédente !'); return; }
  G.gold -= cost;
  G.unlockedZones = Math.max(G.unlockedZones, zoneId + 1);
  G.highestZone = Math.max(G.highestZone, zoneId);
  G.currentZone = zoneId;
  spawnMob();
  if (window.battleAPI) window.battleAPI.setZone(zoneId);

  // Check if this zone is a prestige wall — notify
  const zone = ZONES[zoneId];
  if (zone.prestigeWall) {
    toast('⚠️ Zone finale avant Rebirth ! Va dans Prestige pour progresser.');
  } else {
    toast('🚪 Zone ' + (zoneId + 1) + ' débloquée !');
  }

  // Check zone achievements
  checkAchievement('apprentice', zoneId + 1);
  checkAchievement('adventurer', zoneId + 1);
  checkAchievement('master', zoneId + 1);

  rebuildGates();
}

function goToZone(zoneId) {
  if (zoneId >= G.unlockedZones) return;
  G.currentZone = zoneId;
  spawnMob();
  if (window.battleAPI) window.battleAPI.setZone(zoneId);
  rebuildGates();
}

// ============ TALENTS ============
function buyTalent(talentId) {
  const t = TALENTS.find(x => x.id === talentId);
  const lvl = G.talents[talentId];
  if (lvl >= t.maxLvl) return;
  const cost = t.costBase + lvl;
  if (G.talentPoints < cost) { toast('Pas assez de points !'); return; }
  G.talentPoints -= cost;
  G.talents[talentId]++;
  G.totalTalentsBought = (G.totalTalentsBought || 0) + 1;
  checkTalentAchievements();
  updateTalentNode(talentId);
  updateUI();
}

function buyTalentMax(talentId) {
  const t = TALENTS.find(x => x.id === talentId);
  let lvl = G.talents[talentId];
  let bought = 0;

  while (lvl < t.maxLvl) {
    const cost = t.costBase + lvl;
    if (G.talentPoints < cost) break;
    G.talentPoints -= cost;
    lvl++;
    bought++;
  }

  if (bought === 0) {
    toast('Pas assez de points !');
    return;
  }

  G.talents[talentId] = lvl;
  G.totalTalentsBought = (G.totalTalentsBought || 0) + bought;
  checkTalentAchievements();
  toast('+' + bought + ' niveaux !');
  updateTalentNode(talentId);
  updateUI();
}

function checkTalentAchievements() {
  checkAchievement('talent_1', G.totalTalentsBought);
  checkAchievement('talent_10', G.totalTalentsBought);
  checkAchievement('talent_25', G.totalTalentsBought);
  checkAchievement('talent_50', G.totalTalentsBought);
  checkAchievement('talent_100', G.totalTalentsBought);
  // Check maxed talents
  let maxedCount = 0;
  TALENTS.forEach(t => { if ((G.talents[t.id] || 0) >= t.maxLvl) maxedCount++; });
  checkAchievement('talent_max_1', maxedCount);
  checkAchievement('talent_max_5', maxedCount);
  checkAchievement('talent_max_all', maxedCount);
}

function updateTalentNode(talentId) {
  const t = TALENTS.find(x => x.id === talentId);
  const lvl = G.talents[talentId];
  const cost = t.costBase + lvl;
  const isMax = lvl >= t.maxLvl;

  const levelEl = document.getElementById('talent-level-' + talentId);
  const costEl = document.getElementById('talent-cost-' + talentId);
  const btn1El = document.getElementById('talent-btn-' + talentId);
  const btnMaxEl = document.getElementById('talent-btnmax-' + talentId);
  const nodeEl = document.getElementById('talent-node-' + talentId);

  if (levelEl) levelEl.textContent = lvl + '/' + t.maxLvl;
  if (costEl) costEl.textContent = isMax ? '✅ MAX' : cost + ' 📖';
  if (btn1El) {
    btn1El.disabled = isMax || G.talentPoints < cost;
    btn1El.style.display = isMax ? 'none' : '';
  }
  if (btnMaxEl) {
    btnMaxEl.disabled = isMax || G.talentPoints < cost;
    btnMaxEl.style.display = isMax ? 'none' : '';
  }
  if (nodeEl) {
    if (isMax) nodeEl.classList.add('maxed');
    else nodeEl.classList.remove('maxed');
  }
}

// ============ REBIRTH (soft reset) ============
function doRebirth() {
  const nextTier = REBIRTH_TIERS.find(t => G.rebirth < t.id);
  if (!nextTier) { toast('Rebirth max atteint !'); return; }
  if (G.highestZone < nextTier.reqZone - 1) {
    toast('Atteins la Zone ' + nextTier.reqZone + ' !');
    return;
  }

  // Soft reset: keep talents, TP, gems, prestige, pets, eternals, achievements
  const keepTalents = JSON.parse(JSON.stringify(G.talents));
  const keepTP = G.talentPoints;
  const keepGems = G.gems;
  const keepPets = [...G.ownedPets];
  const keepActivePet = G.activePet;
  const keepActivePets = [...(G.activePets || [])];
  const keepPetLevels = JSON.parse(JSON.stringify(G.petLevels));
  const keepShinyPets = [...(G.shinyPets || [])];
  const keepShopUnlocks = [...(G.shopUnlocks || [])];
  const keepShopBuys = JSON.parse(JSON.stringify(G.shopBuys || {}));
  const keepPrestige = G.prestige;
  const keepPrestigeMult = G.prestigeMult;
  const keepTotalKills = G.totalKills;
  const keepTotalGold = G.totalGoldEarned;
  const keepStartTime = G.startTime;
  // Eternals persist through rebirth
  const keepStarDust = G.starDust || 0;
  const keepTotalStarDust = G.totalStarDust || 0;
  const keepRelics = JSON.parse(JSON.stringify(G.relics || {}));
  const keepInfinityPrestige = G.infinityPrestige || 0;
  const keepInfinityMult = G.infinityMult || 1;
  // Achievements persist
  const keepAchievements = [...(G.achievements || [])];
  const keepAchievementProgress = JSON.parse(JSON.stringify(G.achievementProgress || {}));
  const keepSpellsCast = JSON.parse(JSON.stringify(G.spellsCast || {}));

  const newRebirth = nextTier.id;
  const newRebirthMult = nextTier.mult;

  G = defaultState();
  G.rebirth = newRebirth;
  G.rebirthMult = newRebirthMult;
  G.prestige = isNaN(keepPrestige) ? 0 : keepPrestige;
  G.prestigeMult = isNaN(keepPrestigeMult) ? 1 : keepPrestigeMult;
  G.talents = keepTalents;
  G.talentPoints = isNaN(keepTP) ? 0 : keepTP;
  G.gems = isNaN(keepGems) ? 0 : keepGems;
  G.ownedPets = keepPets;
  G.activePet = keepActivePet;
  G.activePets = keepActivePets;
  G.petLevels = keepPetLevels;
  G.shinyPets = keepShinyPets;
  G.shopUnlocks = keepShopUnlocks;
  G.shopBuys = keepShopBuys;
  // Fix: initialiser avada si spell4 est débloqué
  if (G.shopUnlocks && G.shopUnlocks.includes('spell4')) {
    G.spellLevels['avada'] = 1;
    G.spellCDs['avada'] = 0;
  }
  G.totalKills = isNaN(keepTotalKills) ? 0 : keepTotalKills;
  G.totalGoldEarned = isNaN(keepTotalGold) ? 0 : keepTotalGold;
  G.startTime = keepStartTime || Date.now();
  // Restore eternals
  G.starDust = keepStarDust;
  G.totalStarDust = keepTotalStarDust;
  G.relics = keepRelics;
  G.infinityPrestige = keepInfinityPrestige;
  G.infinityMult = keepInfinityMult;
  // Restore achievements
  G.achievements = keepAchievements;
  G.achievementProgress = keepAchievementProgress;
  G.spellsCast = keepSpellsCast;

  // Check rebirth achievement
  checkAchievementIncrement('rebirthed', 1);

  spawnMob();
  save();
  toast('🔄 Rebirth ' + newRebirth + ' ! x' + newRebirthMult.toFixed(1) + ' — Talents conservés !');
  rebuildAll();
}

// ============ PRESTIGE (hard reset) ============
function doPrestige() {
  if (G.highestZone < 24) { toast('Atteins la Zone 25 !'); return; }

  // Calculate gems from spent TP
  let spentTP = 0;
  TALENTS.forEach(t => { const lvl = G.talents[t.id]; for (let i = 0; i < lvl; i++) spentTP += t.costBase + i; });
  const gemsEarned = Math.max(1, spentTP);

  const newPrestige = G.prestige + 1;
  const newPrestigeMult = 1 + newPrestige * PRESTIGE_MULT_PER;
  const keepGems = G.gems + gemsEarned;
  const keepTotalKills = G.totalKills;
  const keepTotalGold = G.totalGoldEarned;
  const keepStartTime = G.startTime;
  // Eternals persist through prestige
  const keepStarDust = G.starDust || 0;
  const keepTotalStarDust = G.totalStarDust || 0;
  const keepRelics = JSON.parse(JSON.stringify(G.relics || {}));
  const keepInfinityPrestige = G.infinityPrestige || 0;
  const keepInfinityMult = G.infinityMult || 1;
  // Achievements persist
  const keepAchievements = [...(G.achievements || [])];
  const keepAchievementProgress = JSON.parse(JSON.stringify(G.achievementProgress || {}));
  const keepSpellsCast = JSON.parse(JSON.stringify(G.spellsCast || {}));
  // PETS PERSIST THROUGH ALL RESETS (collection focus)
  const keepPets = [...(G.ownedPets || [])];
  const keepPetLevels = JSON.parse(JSON.stringify(G.petLevels || {}));
  const keepActivePets = [...(G.activePets || [])];
  const keepShinyPets = [...(G.shinyPets || [])];

  G = defaultState();
  G.prestige = newPrestige;
  G.prestigeMult = newPrestigeMult;
  G.gems = keepGems;
  G.totalKills = keepTotalKills;
  G.totalGoldEarned = keepTotalGold;
  G.startTime = keepStartTime;
  // Restore eternals
  G.starDust = keepStarDust;
  G.totalStarDust = keepTotalStarDust;
  G.relics = keepRelics;
  G.infinityPrestige = keepInfinityPrestige;
  G.infinityMult = keepInfinityMult;
  // Restore achievements
  G.achievements = keepAchievements;
  G.achievementProgress = keepAchievementProgress;
  G.spellsCast = keepSpellsCast;
  // Restore PETS (permanent collection!)
  G.ownedPets = keepPets;
  G.petLevels = keepPetLevels;
  G.activePets = keepActivePets;
  G.shinyPets = keepShinyPets;

  // Award Star Dust on prestige
  awardStarDust(100 + (newPrestige * 50), 'Prestige ' + newPrestige);

  // Check prestige achievement
  checkAchievement('transcended', newPrestige);

  spawnMob();
  save();
  toast('⏳ Prestige ' + newPrestige + ' ! x' + newPrestigeMult.toFixed(1) + ' — +' + gemsEarned + ' 💎');
  rebuildAll();
}

// ============ TICK ============
let lastTime = performance.now();

function tick(now) {
  requestAnimationFrame(tick);
  if (!G) return;
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  tickSpells(dt);
  tickWorldBoss(dt);
  // Auto-advance
  if (hasShop('auto_advance') && G.autoAdvanceEnabled) {
    const next = G.unlockedZones;
    if (next < ZONES.length && canAccessZone(next)) {
      const cost = getGateCost(next);
      if (G.gold >= cost) {
        G.gold -= cost;
        G.unlockedZones = next + 1;
        G.highestZone = Math.max(G.highestZone, next);
        G.currentZone = next;
        spawnMob();
        if (window.battleAPI) window.battleAPI.setZone(next);
        toast('🚀 Auto → Zone ' + (next + 1) + ' !');
        if (activePanel === 'gates') rebuildGates();
      }
    }
  }
  // Light refresh: update disabled states without rebuilding DOM
  G._refreshTimer = (G._refreshTimer || 0) + dt;
  if (G._refreshTimer >= 0.3) {
    G._refreshTimer = 0;
    refreshButtons();
    updateMiniBattleInfo();
  }
  G._saveTimer = (G._saveTimer || 0) + dt;
  if (G._saveTimer >= 5) { G._saveTimer = 0; save(); }
  // Time achievements check every 60 seconds
  G._timeAchievTimer = (G._timeAchievTimer || 0) + dt;
  if (G._timeAchievTimer >= 60) {
    G._timeAchievTimer = 0;
    const playTime = Math.floor((Date.now() - G.startTime) / 1000);
    checkAchievement('play_1h', playTime);
    checkAchievement('play_10h', playTime);
    checkAchievement('play_24h', playTime);
    checkAchievement('play_100h', playTime);
    checkAchievement('play_1000h', playTime);
  }
  updateUI();
}

// ============ UI LIGHT ============
function updateUI() {
  document.getElementById('goldVal').textContent = fmt(G.gold);
  document.getElementById('goldPs').textContent = '(' + fmt(getGoldPerSec()) + '/s)';
  document.getElementById('gemsVal').textContent = fmt(G.gems);
  // Check gem achievements
  checkAchievement('gem_collector', G.gems);
  checkAchievement('gem_hoarder', G.gems);
  document.getElementById('tpVal').textContent = G.talentPoints;
  document.getElementById('prestigeVal').textContent = G.prestige;
  // Update Star Dust
  const sdTop = document.getElementById('starDustTopVal');
  if (sdTop) sdTop.textContent = fmt(G.starDust || 0);

  const zone = ZONES[G.currentZone] || ZONES[ZONES.length - 1];
  document.getElementById('zoneName').textContent = 'Zone ' + (G.currentZone + 1) + ' — ' + zone.name;
  document.getElementById('zoneDesc').textContent = zone.mob.icon + ' ' + zone.mob.name;

  // Next gate cost progress
  const nextGate = G.currentZone + 1;
  if (nextGate < ZONES.length) {
    const nc = getGateCost(nextGate);
    const pct = Math.min(100, G.gold / nc * 100).toFixed(0);
    document.getElementById('zoneProgress').textContent = 'Prochaine porte : ' + fmt(G.gold) + ' / ' + fmt(nc) + ' 🪙 (' + pct + '%)';
  } else {
    document.getElementById('zoneProgress').textContent = 'Zone finale atteinte !';
  }

  document.getElementById('mobName').textContent = zone.mob.name;
  const hpPct = Math.max(0, G.mobHp / G.mobMaxHp * 100);
  document.getElementById('mobHpFill').style.width = hpPct + '%';
  document.getElementById('mobHpText').textContent = fmt(Math.max(0, G.mobHp)) + ' / ' + fmt(G.mobMaxHp);
  document.getElementById('killCounter').textContent = 'Kills : ' + fmt(G.kills);

  getSpells().forEach(spell => {
    const cdOverlay = document.getElementById('spell-cd-' + spell.id);
    const cdText = document.getElementById('spell-cdtext-' + spell.id);
    const dmgText = document.getElementById('spell-dmg-' + spell.id);
    if (!cdOverlay) return;
    const maxCd = getSpellCD(spell.id);
    const curCd = G.spellCDs[spell.id];
    if (curCd > 0) {
      cdOverlay.style.height = (curCd / maxCd * 100) + '%';
      cdText.textContent = curCd.toFixed(1) + 's';
      cdText.style.display = '';
    } else {
      cdOverlay.style.height = '0%';
      cdText.style.display = 'none';
    }
    if (dmgText) dmgText.textContent = '⚔️' + fmt(getSpellDmg(spell.id));
  });

  const tpEl = document.getElementById('tpAvailable');
  if (tpEl) tpEl.textContent = G.talentPoints;

  const dpsEl = document.getElementById('recapDps');
  if (dpsEl) dpsEl.textContent = fmt(getDPS());

  // Update buff timers in recap
  SHOP_CONSUMABLES.forEach(c => {
    const el = document.getElementById('buff-' + c.id);
    if (el) {
      const rem = buffRemaining(c.id);
      if (rem > 0) { el.style.display = ''; el.textContent = c.icon + ' ' + rem + 's'; }
      else { el.style.display = 'none'; }
    }
  });

  // Update active buffs bar
  updateActiveBuffsBar();

  // Update bottom progress bar
  const bpZone = document.getElementById('bpZone');
  const bpKills = document.getElementById('bpKills');
  const bpDps = document.getElementById('bpDps');
  const bpGoldPs = document.getElementById('bpGoldPs');
  if (bpZone) bpZone.textContent = G.currentZone + 1;
  if (bpKills) bpKills.textContent = fmt(G.kills);
  if (bpDps) bpDps.textContent = fmt(getDPS());
  if (bpGoldPs) bpGoldPs.textContent = fmt(getGoldPerSec());
}

function updateActiveBuffsBar() {
  const bar = document.getElementById('activeBuffsBar');
  if (!bar) return;

  let html = '';
  SHOP_CONSUMABLES.forEach(c => {
    if (hasBuff(c.id)) {
      const rem = buffRemaining(c.id);
      const mins = Math.floor(rem / 60);
      const secs = rem % 60;
      const timeStr = mins > 0 ? mins + ':' + secs.toString().padStart(2, '0') : secs + 's';
      const expiring = rem <= 10;

      html += '<div class="buff-item ' + (expiring ? 'expiring' : '') + '">';
      html += '<span class="buff-icon">' + c.icon + '</span>';
      html += '<div class="buff-info">';
      html += '<span class="buff-name">' + c.name + '</span>';
      html += '<span class="buff-timer">' + timeStr + '</span>';
      html += '</div>';
      html += '</div>';
    }
  });

  bar.innerHTML = html;
}

// ============ UI LIGHT REFRESH (no DOM rebuild) ============
function refreshButtons() {
  // Update all buttons' disabled state based on current gold/TP
  document.querySelectorAll('button[data-cost-gold]').forEach(btn => {
    btn.disabled = G.gold < Number(btn.dataset.costGold);
  });
  document.querySelectorAll('button[data-cost-tp]').forEach(btn => {
    btn.disabled = G.talentPoints < Number(btn.dataset.costTp);
  });
  // Update cost text for spells (cost changes after upgrade)
  getSpells().forEach(s => {
    const costEl = document.getElementById('spell-cost-' + s.id);
    if (costEl) {
      const cost = spellUpgradeCost(G.spellLevels[s.id]);
      costEl.textContent = fmt(cost) + ' 🪙';
    }
  });
  // Update gate open button
  const nextGate = G.unlockedZones;
  const gateBtn = document.getElementById('gate-btn-' + nextGate);
  if (gateBtn) {
    gateBtn.disabled = G.gold < getGateCost(nextGate);
  }
  // Update talent buttons with correct cost
  if (activePanel === 'talents') {
    TALENTS.forEach(t => {
      const lvl = G.talents[t.id] || 0;
      const cost = t.costBase + lvl;
      const isMax = lvl >= t.maxLvl;
      const btn1 = document.getElementById('talent-btn-' + t.id);
      const btnMax = document.getElementById('talent-btnmax-' + t.id);
      if (btn1) {
        btn1.disabled = isMax || G.talentPoints < cost;
        btn1.dataset.costTp = isMax ? 9999 : cost;
      }
      if (btnMax) {
        btnMax.disabled = isMax || G.talentPoints < cost;
        btnMax.dataset.costTp = isMax ? 9999 : cost;
      }
    });
  }
  // Refresh shop only when a buff expires (not every tick)
  if (activePanel === 'shop') {
    const currentBuffStates = SHOP_CONSUMABLES.map(c => hasBuff(c.id)).join(',');
    if (window._lastBuffStates !== currentBuffStates) {
      window._lastBuffStates = currentBuffStates;
      rebuildShop();
    }
  }
}

// ============ UI HEAVY ============
let activePanel = 'zone';

function switchPanel(id, btnEl) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  if (btnEl) btnEl.classList.add('active');
  activePanel = id;
  if (id === 'zone') { rebuildSpellBar(); rebuildHeroRecap(); }
  if (id === 'gates') rebuildGates();
  if (id === 'spells') rebuildSpellUpgrades();
  if (id === 'talents') rebuildTalents();
  if (id === 'shop') rebuildShop();
  if (id === 'pets') { rebuildPets(); clearPetNotif(); }
  if (id === 'boss') rebuildBoss();
  if (id === 'prestige') rebuildPrestige();
  if (id === 'eternals') { rebuildEternals(); clearEternalsNotif(); }
  if (id === 'achievements') { rebuildAchievements(); clearAchieveNotif(); }
  if (id === 'stats') rebuildStats();

  // Afficher/masquer le mini combat popup
  updateMiniBattlePopup(id);
}

// ============ MINI BATTLE MODE ============
function updateMiniBattlePopup(panelId) {
  const battleArea = document.getElementById('battleArea');
  const placeholder = document.getElementById('battleAreaPlaceholder');
  if (!battleArea) return;

  // Mode mini si on n'est pas sur Combat ou Boss
  if (panelId === 'zone') {
    // Mode normal - dans le placeholder
    battleArea.classList.remove('mini-mode');
    battleArea.onclick = null;
    if (placeholder && battleArea.parentNode !== placeholder) {
      placeholder.appendChild(battleArea);
    }
  } else if (panelId === 'boss') {
    // Sur Boss - cacher complètement
    battleArea.classList.add('mini-mode');
    battleArea.style.display = 'none';
  } else {
    // Autres onglets - mode mini flottant
    battleArea.classList.add('mini-mode');
    battleArea.style.display = 'block';
    battleArea.onclick = goToZonePanel;
    // Déplacer vers body si pas déjà
    if (battleArea.parentNode !== document.body) {
      document.body.appendChild(battleArea);
    }
  }
}

function updateMiniBattleInfo() {
  // Plus nécessaire - la vraie battle area se met à jour toute seule
}

function goToZonePanel() {
  const zoneBtn = document.querySelector('.nav-btn');
  switchPanel('zone', zoneBtn);
}

function rebuildAll() {
  rebuildSpellBar();
  rebuildHeroRecap();
  rebuildGates();
  rebuildSpellUpgrades();
  rebuildTalents();
  rebuildShop();
  rebuildPets();
  rebuildBoss();
  rebuildPrestige();
  rebuildEternals();
  rebuildAchievements();
  rebuildStats();
}

function rebuildHeroRecap() {
  const el = document.getElementById('heroRecap');
  if (!el) return;
  let html = '';
  // Wand companion
  html += '<div class="hr-section"><div class="hr-icon">🪄</div><div class="hr-val">DPS <span id="recapDps">' + fmt(getDPS()) + '</span></div></div>';
  html += '<div class="hr-divider"></div>';
  // Spells mini recap
  getSpells().forEach(s => {
    html += '<div class="hr-section"><div class="hr-icon">' + s.icon + '</div><div class="hr-val"><span>Niv.' + G.spellLevels[s.id] + '</span></div></div>';
  });
  // Mult
  const totalMult = G.rebirthMult * G.prestigeMult;
  if (totalMult > 1) {
    html += '<div class="hr-divider"></div>';
    html += '<div class="hr-section"><div class="hr-icon">✨</div><div class="hr-val">x<span>' + totalMult.toFixed(1) + '</span></div></div>';
  }
  // Pet (if equipped)
  if (G.activePet) {
    const pet = PETS.find(p => p.id === G.activePet);
    if (pet) {
      html += '<div class="hr-divider"></div>';
      html += '<div class="hr-pet"><div class="pet-icon">' + pet.icon + '</div><div><div class="pet-name">' + pet.name + '</div><div class="pet-bonus">' + pet.desc + '</div></div></div>';
    }
  }
  el.innerHTML = html;
}

function rebuildSpellBar() {
  const bar = document.getElementById('spellBar');
  if (!bar) return;
  bar.innerHTML = '';
  getSpells().forEach(spell => {
    // Ensure spell is initialized
    if (!G.spellLevels[spell.id] || isNaN(G.spellLevels[spell.id])) G.spellLevels[spell.id] = 1;
    if (G.spellCDs[spell.id] === undefined) G.spellCDs[spell.id] = 0;
    const curCd = G.spellCDs[spell.id] || 0;
    const maxCd = getSpellCD(spell.id);
    const cdPercent = curCd > 0 ? ((curCd / maxCd) * 100) : 0;
    const isReady = curCd <= 0;
    const stateClass = isReady ? 'ready' : 'on-cd';

    bar.innerHTML += \`
      <div class="spell-slot \${stateClass}" id="spell-slot-\${spell.id}" data-spell="\${spell.id}">
        <div class="spell-circle">
          <div class="s-icon">\${spell.icon}</div>
          <div class="spell-cd-radial" id="spell-cd-\${spell.id}" style="--cd-percent:\${cdPercent}%"></div>
          <div class="s-cd-text" id="spell-cdtext-\${spell.id}" style="\${isReady ? 'display:none' : ''}">\${curCd.toFixed(1)}</div>
        </div>
        <div class="s-info">Niv.\${G.spellLevels[spell.id]}</div>
        <div class="spell-tooltip">
          <div class="tt-name">\${spell.name}</div>
          <div class="tt-dmg">\${fmt(getSpellDmg(spell.id))} dmg</div>
          <div class="tt-cd">\${getSpellCD(spell.id).toFixed(1)}s cooldown</div>
        </div>
      </div>
    \`;
  });
}

function rebuildSpellUpgrades() {
  const el = document.getElementById('spellUpgradeList');
  if (!el) return;
  el.innerHTML = '';
  getSpells().forEach(spell => {
    // Ensure spell level is initialized
    if (!G.spellLevels[spell.id] || isNaN(G.spellLevels[spell.id])) G.spellLevels[spell.id] = 1;
    if (G.spellCDs[spell.id] === undefined) G.spellCDs[spell.id] = 0;
    const lvl = G.spellLevels[spell.id];
    const cost = spellUpgradeCost(lvl);
    const dmg = getSpellDmg(spell.id);
    const cd = getSpellCD(spell.id);
    const old = G.spellLevels[spell.id];
    G.spellLevels[spell.id] = lvl + 1;
    const nextDmg = getSpellDmg(spell.id);
    G.spellLevels[spell.id] = old;

    el.innerHTML += \`
      <div class="spell-upgrade-card">
        <div class="su-icon">\${spell.icon}</div>
        <div class="su-info">
          <div class="su-name">\${spell.name}</div>
          <div class="su-desc">\${spell.desc}</div>
          <div class="su-stats">
            <div class="su-stat">⚔️ <span>\${fmt(dmg)}</span> → <span style="color:#69f0ae">\${fmt(nextDmg)}</span></div>
            <div class="su-stat">⏱️ <span>\${cd.toFixed(2)}s</span></div>
            <div class="su-stat">📈 DPS <span>\${fmt(dmg / cd)}</span></div>
          </div>
        </div>
        <div class="su-actions">
          <div class="su-level">Niv. \${lvl}</div>
          <button class="btn btn-sm" data-cost-gold="\${cost}" onclick="upgradeSpell('\${spell.id}')" \${G.gold < cost ? 'disabled' : ''}>+1 (<span id="spell-cost-\${spell.id}">\${fmt(cost)} 🪙</span>)</button>
          <button class="btn btn-sm" data-cost-gold="\${cost}" onclick="upgradeSpellMax('\${spell.id}')" style="margin-top:4px;">MAX</button>
        </div>
      </div>
    \`;
  });
}

function rebuildGates() {
  const el = document.getElementById('gatesList');
  if (!el) return;
  let html = '';
  const maxShow = Math.min(ZONES.length, Math.max(G.unlockedZones + 5, 12));
  for (let i = 0; i < maxShow; i++) {
    const zone = ZONES[i];
    const cost = getGateCost(i);
    const unlocked = i < G.unlockedZones;
    const isCurrent = i === G.currentZone;
    const isNext = i === G.unlockedZones;
    const needsRebirth = zone.reqRebirth && G.rebirth < zone.reqRebirth;
    // prestigeWall zones only glow purple if the NEXT zone requires a rebirth the player hasn't done
    const nextZone = ZONES[i + 1];
    const isRebirthWall = zone.prestigeWall && unlocked && nextZone && nextZone.reqRebirth && G.rebirth < nextZone.reqRebirth;
    const locked = i > G.unlockedZones || needsRebirth;

    let cls = '';
    if (isRebirthWall || (isNext && needsRebirth)) cls = 'prestige-wall';
    else if (unlocked && isCurrent) cls = 'current';
    else if (unlocked) cls = 'unlocked';
    else if (locked) cls = 'locked';

    html += \`
      <div class="gate-item \${cls}">
        <div class="gate-info">
          <div class="gate-zone">\${unlocked ? '✅' : needsRebirth ? '⏳' : '🔒'} Zone \${i+1} — \${zone.name}</div>
          <div class="gate-cost">\${i === 0 ? 'Gratuit' : 'Coût : ' + fmt(cost) + ' 🪙'}</div>
          <div class="gate-mob">\${zone.mob.icon} \${zone.mob.name} — \${fmt(zone.mob.hp)} HP — \${fmt(zone.mob.gold)} 🪙/kill</div>
          \${needsRebirth ? '<div style="font-size:0.75em;color:#ce93d8;">⏳ Rebirth ' + zone.reqRebirth + ' requis</div>' : ''}
          \${isRebirthWall ? '<div style="font-size:0.75em;color:#ce93d8;">⚠️ Mur de Rebirth — rebirth obligatoire pour continuer</div>' : ''}
        </div>
        <div>
          \${unlocked ? \`<button class="btn btn-sm" onclick="goToZone(\${i})" \${isCurrent ? 'disabled' : ''}>\` + (isCurrent ? 'Actuelle' : 'Aller') + '</button>'
            : isNext && !needsRebirth ? \`<button class="btn" id="gate-btn-\${i}" data-cost-gold="\${cost}" onclick="unlockGate(\${i})" \${G.gold < cost ? 'disabled' : ''}>Ouvrir</button>\`
            : needsRebirth ? '<button class="btn btn-purple btn-sm" disabled>Rebirth requis</button>'
            : '<span style="color:#555;font-size:0.8em;">🔒</span>'}
        </div>
      </div>
    \`;
  }
  el.innerHTML = html;
}

function rebuildTalents() {
  const el = document.getElementById('talentSections');
  if (!el) return;
  const spellTalents = TALENTS.filter(t => t.spell !== null);
  const globalTalents = TALENTS.filter(t => t.spell === null);
  let html = '';

  getSpells().forEach(spell => {
    const sts = spellTalents.filter(t => t.spell === spell.id);
    html += \`<div class="talent-section"><div class="talent-section-title">\${spell.icon} \${spell.name}</div><div class="talent-grid">\`;
    sts.forEach(t => {
      const lvl = G.talents[t.id] || 0; const cost = t.costBase + lvl; const isMax = lvl >= t.maxLvl;
      html += \`<div class="talent-node \${isMax?'maxed':''}" id="talent-node-\${t.id}">
        <div class="t-icon">\${t.icon}</div>
        <div class="t-name">\${t.name}</div>
        <div class="t-level" id="talent-level-\${t.id}">\${lvl}/\${t.maxLvl}</div>
        <div class="t-desc">\${t.desc}</div>
        <div class="t-cost" id="talent-cost-\${t.id}">\${isMax?'✅ MAX':cost+' 📖'}</div>
        <div style="display:flex;gap:4px;margin-top:4px;justify-content:center;">
          <button class="btn btn-sm" id="talent-btn-\${t.id}" data-cost-tp="\${isMax?9999:cost}" onclick="buyTalent('\${t.id}')" \${isMax||G.talentPoints<cost?'disabled':''} style="\${isMax?'display:none':''}">+1</button>
          <button class="btn btn-sm" id="talent-btnmax-\${t.id}" data-cost-tp="\${isMax?9999:cost}" onclick="buyTalentMax('\${t.id}')" \${isMax||G.talentPoints<cost?'disabled':''} style="\${isMax?'display:none':''}">MAX</button>
        </div>
      </div>\`;
    });
    html += '</div></div>';
  });

  html += \`<div class="talent-section"><div class="talent-section-title">🌟 Talents Globaux</div><div class="talent-grid">\`;
  globalTalents.forEach(t => {
    const lvl = G.talents[t.id] || 0; const cost = t.costBase + lvl; const isMax = lvl >= t.maxLvl;
    html += \`<div class="talent-node \${isMax?'maxed':''}" id="talent-node-\${t.id}">
      <div class="t-icon">\${t.icon}</div>
      <div class="t-name">\${t.name}</div>
      <div class="t-level" id="talent-level-\${t.id}">\${lvl}/\${t.maxLvl}</div>
      <div class="t-desc">\${t.desc}</div>
      <div class="t-cost" id="talent-cost-\${t.id}">\${isMax?'✅ MAX':cost+' 📖'}</div>
      <div style="display:flex;gap:4px;margin-top:4px;justify-content:center;">
        <button class="btn btn-sm" id="talent-btn-\${t.id}" data-cost-tp="\${isMax?9999:cost}" onclick="buyTalent('\${t.id}')" \${isMax||G.talentPoints<cost?'disabled':''} style="\${isMax?'display:none':''}">+1</button>
        <button class="btn btn-sm" id="talent-btnmax-\${t.id}" data-cost-tp="\${isMax?9999:cost}" onclick="buyTalentMax('\${t.id}')" \${isMax||G.talentPoints<cost?'disabled':''} style="\${isMax?'display:none':''}">MAX</button>
      </div>
    </div>\`;
  });
  html += '</div></div>';
  el.innerHTML = html;
}

// ============ SHOP UI ============
function buyShopUnlock(id) {
  const item = SHOP_UNLOCKS.find(u => u.id === id);
  if (!item || hasShop(id)) return;
  if (G.gold < item.cost) { toast('Pas assez de gold !'); return; }
  G.gold -= item.cost;
  G.shopUnlocks.push(id);
  if (id === 'spell4') {
    if (!G.spellLevels['avada']) G.spellLevels['avada'] = 1;
    if (G.spellCDs['avada'] === undefined) G.spellCDs['avada'] = 0;
    checkAchievement('avada_unlock', 1);
  }
  // Shop achievements
  checkAchievement('first_purchase', G.shopUnlocks.length);
  checkAchievement('shopper', G.shopUnlocks.length);
  checkAchievement('shopaholic', G.shopUnlocks.length);
  toast('✅ ' + item.name + ' débloqué !');
  rebuildShop();
  rebuildHeroRecap();
  rebuildSpellBar();
}

function toggleAutoAdvance() {
  G.autoAdvanceEnabled = !G.autoAdvanceEnabled;
  toast(G.autoAdvanceEnabled ? '🚀 Auto-Avance activé' : '⏸️ Auto-Avance désactivé');
  rebuildShop();
}

function buyConsumable(id) {
  const item = SHOP_CONSUMABLES.find(c => c.id === id);
  if (!item) return;
  if (hasBuff(id)) { toast('Déjà actif !'); return; }
  const bought = G.shopBuys[id] || 0;
  const cost = Math.floor(item.baseCost * Math.pow(item.costMult, bought));
  if (G.gold < cost) { toast('Pas assez de gold !'); return; }
  G.gold -= cost;
  G.shopBuys[id] = bought + 1;
  G.buffs[id] = Date.now() + item.duration * 1000;
  G.totalConsumablesUsed = (G.totalConsumablesUsed || 0) + 1;
  checkAchievement('buff_user', G.totalConsumablesUsed);
  checkAchievement('buff_addict', G.totalConsumablesUsed);
  toast('🧪 ' + item.name + ' activé !');
  rebuildShop();
  rebuildHeroRecap();
}

function rebuildShop() {
  const el = document.getElementById('shopList');
  if (!el) return;
  let html = '<div style="font-family:\\'Cinzel\\',serif;color:var(--gold);font-size:0.95em;margin-bottom:8px;">Améliorations permanentes</div>';

  SHOP_UNLOCKS.forEach(u => {
    const owned = hasShop(u.id);
    let actionHtml;
    if (!owned) {
      actionHtml = \`<button class="btn" data-cost-gold="\${u.cost}" onclick="buyShopUnlock('\${u.id}')" \${G.gold < u.cost ? 'disabled' : ''}>\${fmt(u.cost)} 🪙</button>\`;
    } else if (u.id === 'auto_advance') {
      // Toggle for auto-advance
      const isOn = G.autoAdvanceEnabled;
      actionHtml = \`
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:0.75em;color:\${isOn ? 'var(--green)' : '#666'};">\${isOn ? 'ON' : 'OFF'}</span>
          <button class="btn btn-sm \${isOn ? 'btn-green' : ''}" onclick="toggleAutoAdvance()" style="min-width:50px;">\${isOn ? '✓' : '✗'}</button>
        </div>
      \`;
    } else {
      actionHtml = '<div style="color:var(--green);font-family:\\'Cinzel\\',serif;">✅ Acheté</div>';
    }
    html += \`
      <div class="spell-upgrade-card" style="\${owned && u.id !== 'auto_advance' ? 'opacity:0.6;' : ''}">
        <div class="su-icon">\${u.icon}</div>
        <div class="su-info">
          <div class="su-name">\${u.name}</div>
          <div class="su-desc">\${u.desc}</div>
        </div>
        <div class="su-actions">
          \${actionHtml}
        </div>
      </div>
    \`;
  });

  html += '<div style="font-family:\\'Cinzel\\',serif;color:var(--gold);font-size:0.95em;margin:15px 0 8px;">Consommables</div>';
  html += '<div style="font-size:0.75em;color:#555;margin-bottom:8px;">Le coût augmente à chaque achat. Non cumulable.</div>';

  SHOP_CONSUMABLES.forEach(c => {
    const bought = G.shopBuys[c.id] || 0;
    const cost = Math.floor(c.baseCost * Math.pow(c.costMult, bought));
    const active = hasBuff(c.id);
    const remaining = buffRemaining(c.id);
    html += \`
      <div class="spell-upgrade-card">
        <div class="su-icon">\${c.icon}</div>
        <div class="su-info">
          <div class="su-name">\${c.name}</div>
          <div class="su-desc">\${c.desc}</div>
          \${active ? '<div style="font-size:0.8em;color:var(--green);margin-top:3px;">Actif — ' + remaining + 's restantes</div>' : ''}
        </div>
        <div class="su-actions">
          <div style="font-size:0.7em;color:#555;">Acheté \${bought}x</div>
          <button class="btn btn-sm" data-cost-gold="\${active ? 999e18 : cost}" onclick="buyConsumable('\${c.id}')" \${active || G.gold < cost ? 'disabled' : ''}>\${fmt(cost)} 🪙</button>
        </div>
      </div>
    \`;
  });

  el.innerHTML = html;
}

// ============ PET UPGRADE ============
function upgradePet(petId) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet || !G.ownedPets.includes(petId)) return;
  const lvl = G.petLevels[petId] || 1;
  const cost = petUpgradeCost(pet, lvl);
  if (G.gold < cost) { toast('Pas assez de gold !'); return; }
  G.gold -= cost;
  G.petLevels[petId] = lvl + 1;
  rebuildPets();
  rebuildHeroRecap();
}

function maxPet(petId) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet || !G.ownedPets.includes(petId)) return;
  let lvl = G.petLevels[petId] || 1;
  let upgraded = 0;
  while (true) {
    const cost = petUpgradeCost(pet, lvl);
    if (G.gold < cost) break;
    G.gold -= cost;
    lvl++;
    upgraded++;
  }
  if (upgraded > 0) {
    G.petLevels[petId] = lvl;
    toast('+' + upgraded + ' niveaux !');
    rebuildPets();
    rebuildHeroRecap();
  } else {
    toast('Pas assez de gold !');
  }
}

// ============ SHINY PETS SYSTEM (moved before rebuildPets) ============
function isShiny(petId) {
  return G.shinyPets && G.shinyPets.includes(petId);
}

function getShinyMultiplier(petId) {
  return isShiny(petId) ? SHINY_MULT : 1;
}

// ============ MULTI-PETS SYSTEM (moved before rebuildPets) ============
function getPetSlots() {
  let slots = 1;
  if (G.highestZone >= 14) slots = 2;  // After zone 15
  if (G.prestige >= 1) slots = 3;       // After prestige
  return slots;
}

function getActivePets() {
  // Migration: if old system (single activePet), migrate to new
  if (G.activePet && (!G.activePets || G.activePets.length === 0)) {
    G.activePets = [G.activePet];
  }
  return G.activePets || [];
}

function equipPetMulti(petId) {
  if (!G.ownedPets.includes(petId)) return;
  if (!G.activePets) G.activePets = [];

  const idx = G.activePets.indexOf(petId);
  if (idx >= 0) {
    // Unequip
    G.activePets.splice(idx, 1);
  } else {
    // Equip if slot available
    const maxSlots = getPetSlots();
    if (G.activePets.length < maxSlots) {
      G.activePets.push(petId);
    } else {
      toast('Tous les slots sont occupés !');
      return;
    }
  }
  // Sync with old system for compatibility
  G.activePet = G.activePets[0] || null;
  rebuildPets();
  rebuildHeroRecap();
}

// ============ PET SYNERGIES (moved before rebuildPets) ============
function getActiveSynergies() {
  const activePets = getActivePets();
  const synergies = [];

  PET_SYNERGIES.forEach(syn => {
    if (syn.pets.every(p => activePets.includes(p))) {
      synergies.push(syn);
    }
  });

  return synergies;
}

function equipPet(petId) {
  // Redirect to new multi-pet system
  equipPetMulti(petId);
}

function rebuildPets() {
  const el = document.getElementById('petsList');
  if (!el) return;
  let html = '';

  // Pet Slots Display
  const maxSlots = getPetSlots();
  const activePets = getActivePets();
  html += '<div style="text-align:center;margin-bottom:20px;padding:15px;background:rgba(0,0,0,0.2);border-radius:12px;border:1px solid rgba(212,168,67,0.15);">';
  html += '<div style="font-family:\\'Cinzel\\',serif;color:var(--gold);font-size:1em;margin-bottom:12px;">🐾 Pets Équipés (' + activePets.length + '/' + maxSlots + ')</div>';
  html += '<div class="pet-slots">';
  for (let i = 0; i < 3; i++) {
    const pet = activePets[i] ? PETS.find(p => p.id === activePets[i]) : null;
    const locked = i >= maxSlots;
    const shiny = pet && isShiny(pet.id);

    if (locked) {
      // Slot verrouillé
      html += '<div class="pet-slot locked" title="' + (i === 1 ? 'Débloqué à Zone 15' : 'Débloqué après Prestige') + '">';
      html += '<div style="font-size:1.2em;">🔒</div>';
      html += '<div style="font-size:0.5em;color:#666;margin-top:2px;">' + (i === 1 ? 'Zone 15' : 'Prestige') + '</div>';
      html += '</div>';
    } else if (pet) {
      // Slot avec pet
      html += '<div class="pet-slot filled" onclick="equipPetMulti(' + "'" + pet.id + "'" + ')" title="Cliquer pour retirer ' + pet.name + '">';
      html += (shiny ? '<div class="shiny-sparkle"></div>' : '');
      html += '<div style="font-size:1.8em;">' + pet.icon + '</div>';
      html += '<div class="slot-remove-hint">✕</div>';
      html += '</div>';
    } else {
      // Slot vide disponible
      html += '<div class="pet-slot empty" title="Équipe un pet ci-dessous">';
      html += '<div style="font-size:1.5em;color:rgba(212,168,67,0.4);">+</div>';
      html += '<div style="font-size:0.5em;color:#666;margin-top:2px;">Vide</div>';
      html += '</div>';
    }
  }
  html += '</div>';
  html += '<div style="font-size:0.7em;color:#888;margin-top:8px;">Clique sur "Équiper" ci-dessous pour ajouter un pet</div>';
  html += '</div>';

  // Active Synergies
  const synergies = getActiveSynergies();
  if (synergies.length > 0) {
    html += '<div style="margin-bottom:15px;">';
    synergies.forEach(syn => {
      html += '<div class="synergy-active">' +
        '<div class="synergy-icon">' + syn.icon + '</div>' +
        '<div class="synergy-info">' +
          '<div class="synergy-name">' + syn.name + '</div>' +
          '<div class="synergy-desc">' + syn.desc + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  }

  // === COLLECTION PROGRESS ===
  const totalPets = PETS.length;
  const ownedCount = (G.ownedPets || []).length;
  const shinyCount = (G.shinyPets || []).length;

  // Count by rarity
  const rarityStats = {};
  Object.keys(PET_RARITIES).forEach(r => {
    const total = PETS.filter(p => p.rarity === r).length;
    const owned = PETS.filter(p => p.rarity === r && G.ownedPets.includes(p.id)).length;
    rarityStats[r] = { total, owned };
  });

  html += '<div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:12px;margin-bottom:15px;border:1px solid rgba(212,168,67,0.2);">';
  html += '<div style="font-family:\\'Cinzel\\',serif;color:var(--gold);font-size:1.1em;text-align:center;margin-bottom:10px;">📚 Collection : ' + ownedCount + '/' + totalPets + ' (' + Math.floor(ownedCount/totalPets*100) + '%)</div>';

  // Progress bar for total
  html += '<div style="background:#1a1a1a;height:8px;border-radius:4px;margin-bottom:12px;overflow:hidden;">';
  html += '<div style="height:100%;width:' + (ownedCount/totalPets*100) + '%;background:linear-gradient(90deg,#4caf50,#8bc34a);"></div>';
  html += '</div>';

  // Rarity breakdown
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">';
  Object.entries(PET_RARITIES).forEach(([key, info]) => {
    const stat = rarityStats[key];
    const complete = stat.owned === stat.total;
    html += '<div style="background:rgba(0,0,0,0.3);padding:6px 12px;border-radius:6px;border:1px solid ' + info.color + ';font-size:0.75em;' + (complete ? 'box-shadow:0 0 8px ' + info.color + ';' : '') + '">';
    html += '<span style="color:' + info.color + ';">' + info.name + '</span> ';
    html += '<span style="color:' + (complete ? '#4caf50' : '#aaa') + ';">' + stat.owned + '/' + stat.total + '</span>';
    if (complete) html += ' ✓';
    html += '</div>';
  });
  html += '</div>';

  // Shiny count
  if (shinyCount > 0) {
    html += '<div style="text-align:center;margin-top:8px;font-size:0.8em;color:#ffd700;">✨ Shiny : ' + shinyCount + '</div>';
  }
  html += '</div>';

  // Show owned pets first, then undiscovered for current/nearby zones
  const owned = PETS.filter(p => G.ownedPets.includes(p.id));
  const unowned = PETS.filter(p => !G.ownedPets.includes(p.id) && p.zone >= 0 && p.zone <= G.highestZone + 1);
  const secretPets = PETS.filter(p => (p.rarity === 'secret' || p.rarity === 'legendary') && !G.ownedPets.includes(p.id));

  if (owned.length === 0 && unowned.length === 0) {
    html += '<div style="text-align:center;color:#555;padding:20px;">Tue des mobs pour trouver des pets !</div>';
  }

  owned.forEach(p => {
    const isActive = activePets.includes(p.id);
    const shiny = isShiny(p.id);
    const lvl = G.petLevels[p.id] || 1;
    const cost = petUpgradeCost(p, lvl);
    const shinyMult = shiny ? SHINY_MULT : 1;
    const rarityInfo = PET_RARITIES[p.rarity] || PET_RARITIES.common;
    const rarityMult = rarityInfo.mult;
    const curVal = (p.effect.val * (1 + (lvl - 1) * 0.2) * shinyMult * rarityMult * 100).toFixed(1);
    const nextVal = (p.effect.val * (1 + lvl * 0.2) * shinyMult * rarityMult * 100).toFixed(1);
    const isSecret = p.rarity === 'secret' || p.rarity === 'legendary';

    html += \`
      <div class="pet-card \${shiny ? 'shiny' : ''} \${p.rarity}" style="position:relative;display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:6px;background:\${isActive ? 'rgba(106,27,154,0.2)' : 'rgba(0,0,0,0.25)'};border:2px solid \${isActive ? 'var(--purple)' : rarityInfo.color};border-radius:8px;">
        \${shiny ? '<div class="shiny-badge">✨ SHINY</div><div class="shiny-sparkle"></div>' : ''}
        <div style="font-size:2em;">\${p.icon}</div>
        <div style="flex:1;">
          <div style="font-family:'Cinzel',serif;color:\${rarityInfo.color};font-size:0.9em;">
            \${p.name} <span style="font-size:0.8em;color:#aaa;">Niv.\${lvl}</span>
            <span style="font-size:0.65em;background:\${rarityInfo.color};color:#000;padding:1px 5px;border-radius:3px;margin-left:4px;">\${rarityInfo.name}</span>
            \${isActive ? '<span style="color:var(--green);font-size:0.8em;"> — Équipé</span>' : ''}
          </div>
          <div style="font-size:0.8em;color:#ce93d8;">\${p.desc} → <span style="color:var(--gold);">\${curVal}%</span>\${shiny ? ' <span style="color:#ffd700;">(x' + SHINY_MULT + ' shiny)</span>' : ''}</div>
          <div style="font-size:0.7em;color:#555;">\${isSecret ? '✓ Obtenu : ' + p.unlock.desc : 'Zone ' + (p.zone + 1) + ' — ' + (p.dropRate * 100).toFixed(2) + '% drop'}</div>
        </div>
        <div style="text-align:right;display:flex;flex-direction:column;gap:4px;">
          <button class="btn btn-sm \${isActive ? 'btn-purple' : ''}" onclick="equipPetMulti('\${p.id}')">\${isActive ? 'Retirer' : 'Équiper'}</button>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-sm" data-cost-gold="\${cost}" onclick="upgradePet('\${p.id}')" \${G.gold < cost ? 'disabled' : ''}>⬆ \${fmt(cost)} 🪙</button>
            <button class="btn btn-sm" data-cost-gold="\${cost}" onclick="maxPet('\${p.id}')" \${G.gold < cost ? 'disabled' : ''}>MAX</button>
          </div>
          <div style="font-size:0.6em;color:#555;">→ \${nextVal}%</div>
        </div>
      </div>
    \`;
  });

  // Zone pets not yet discovered
  if (unowned.length > 0) {
    html += '<div style="font-family:\\'Cinzel\\',serif;color:#555;font-size:0.8em;margin:12px 0 6px;">🔍 Pas encore découverts (zones) :</div>';
    unowned.forEach(p => {
      const canGo = p.zone < G.unlockedZones;
      const rarityInfo = PET_RARITIES[p.rarity] || PET_RARITIES.common;
      html += \`
        <div style="display:flex;align-items:center;gap:12px;padding:8px 10px;margin-bottom:4px;background:rgba(0,0,0,0.15);border:1px solid \${rarityInfo.color}40;border-radius:8px;opacity:0.7;">
          <div style="font-size:1.8em;">❓</div>
          <div style="flex:1;">
            <div style="font-family:'Cinzel',serif;color:#555;font-size:0.85em;">??? <span style="font-size:0.7em;background:\${rarityInfo.color}50;color:\${rarityInfo.color};padding:1px 5px;border-radius:3px;">\${rarityInfo.name}</span></div>
            <div style="font-size:0.7em;color:#444;">Zone \${p.zone + 1} — \${(p.dropRate * 100).toFixed(2)}% drop</div>
          </div>
          <div>
            \${canGo
              ? \`<button class="btn btn-sm" onclick="goToZone(\${p.zone});switchPanel('zone',document.querySelector('.nav-btn'));">Aller</button>\`
              : '<span style="font-size:0.7em;color:#555;">🔒</span>'
            }
          </div>
        </div>
      \`;
    });
  }

  // Secret and Legendary pets with unlock conditions
  if (secretPets.length > 0) {
    html += '<div style="font-family:\\'Cinzel\\',serif;color:#ff9800;font-size:0.9em;margin:20px 0 10px;padding:8px;background:rgba(255,152,0,0.1);border-radius:8px;border:1px solid rgba(255,152,0,0.3);">🔶 Pets Secrets & Légendaires</div>';
    secretPets.forEach(p => {
      const rarityInfo = PET_RARITIES[p.rarity];
      const isLegendary = p.rarity === 'legendary';
      const unlock = p.unlock;
      const isHidden = unlock.hidden === true;

      // For hidden pets, show "???" instead of real info
      if (isHidden) {
        html += \`
          <div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:6px;background:rgba(0,0,0,0.4);border:2px solid \${rarityInfo.color}50;border-radius:8px;opacity:0.7;">
            <div style="font-size:2em;filter:grayscale(1);opacity:0.4;">❓</div>
            <div style="flex:1;">
              <div style="font-family:'Cinzel',serif;color:\${rarityInfo.color};font-size:0.9em;opacity:0.7;">
                ???
                <span style="font-size:0.65em;background:\${rarityInfo.color}50;color:\${rarityInfo.color};padding:1px 5px;border-radius:3px;margin-left:4px;">\${rarityInfo.name}</span>
              </div>
              <div style="font-size:0.8em;color:#555;font-style:italic;">Effet inconnu</div>
              <div style="font-size:0.7em;color:#444;margin-top:4px;">🔒 Condition secrète...</div>
            </div>
          </div>
        \`;
        return;
      }

      // For visible unlocks, show progress
      let progress = 0;
      let progressText = '';
      switch (unlock.type) {
        case 'rebirth': progress = Math.min(100, G.rebirth / unlock.target * 100); progressText = G.rebirth + '/' + unlock.target + ' rebirths'; break;
        case 'kills': progress = Math.min(100, G.totalKills / unlock.target * 100); progressText = fmt(G.totalKills) + '/' + fmt(unlock.target) + ' kills'; break;
        case 'prestige': progress = Math.min(100, G.prestige / unlock.target * 100); progressText = G.prestige + '/' + unlock.target + ' prestige'; break;
        case 'gold_total': progress = Math.min(100, G.totalGoldEarned / unlock.target * 100); progressText = fmt(G.totalGoldEarned) + '/' + fmt(unlock.target) + ' or'; break;
        case 'zone_clear': progress = Math.min(100, (G.highestZone + 1) / (unlock.target + 1) * 100); progressText = 'Zone ' + (G.highestZone + 1) + '/' + (unlock.target + 1); break;
        case 'world_boss_dmg': const wbDmg = G.totalWorldBossDmg || 0; progress = Math.min(100, wbDmg / unlock.target * 100); progressText = fmt(wbDmg) + '/' + fmt(unlock.target) + ' dmg'; break;
        case 'spells_cast': const totalSpells = Object.values(G.spellsCast || {}).reduce((a, b) => a + b, 0); progress = Math.min(100, totalSpells / unlock.target * 100); progressText = totalSpells + '/' + unlock.target + ' sorts'; break;
        case 'all_common_pets': const commonCount = PETS.filter(q => q.rarity === 'common' && G.ownedPets.includes(q.id)).length; const commonTotal = PETS.filter(q => q.rarity === 'common').length; progress = commonCount / commonTotal * 100; progressText = commonCount + '/' + commonTotal + ' communs'; break;
        case 'all_rare_pets': const rareCount = PETS.filter(q => q.rarity === 'rare' && G.ownedPets.includes(q.id)).length; const rareTotal = PETS.filter(q => q.rarity === 'rare').length; progress = rareCount / rareTotal * 100; progressText = rareCount + '/' + rareTotal + ' rares'; break;
        case 'all_epic_pets': const epicCount = PETS.filter(q => q.rarity === 'epic' && G.ownedPets.includes(q.id)).length; const epicTotal = PETS.filter(q => q.rarity === 'epic').length; progress = epicCount / epicTotal * 100; progressText = epicCount + '/' + epicTotal + ' épiques'; break;
        case 'all_pets': const allCount = PETS.filter(q => q.rarity !== 'legendary' && G.ownedPets.includes(q.id)).length; const allTotal = PETS.filter(q => q.rarity !== 'legendary').length; progress = allCount / allTotal * 100; progressText = allCount + '/' + allTotal + ' pets'; break;
        case 'infinity_prestige': progress = Math.min(100, (G.infinityPrestige || 0) / unlock.target * 100); progressText = (G.infinityPrestige || 0) + '/' + unlock.target + ' infinity'; break;
        case 'world_boss_kills': progress = Math.min(100, (G.worldBossKills || 0) / unlock.target * 100); progressText = (G.worldBossKills || 0) + '/' + unlock.target + ' boss kills'; break;
        default: progressText = unlock.desc;
      }

      html += \`
        <div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:6px;background:rgba(0,0,0,0.3);border:2px solid \${rarityInfo.color};border-radius:8px;box-shadow:\${isLegendary ? '0 0 15px ' + rarityInfo.color + '40' : 'none'};">
          <div style="font-size:2em;filter:grayscale(0.8);opacity:0.6;">\${p.icon}</div>
          <div style="flex:1;">
            <div style="font-family:'Cinzel',serif;color:\${rarityInfo.color};font-size:0.9em;">
              \${p.name}
              <span style="font-size:0.65em;background:\${rarityInfo.color};color:#000;padding:1px 5px;border-radius:3px;margin-left:4px;">\${rarityInfo.name}</span>
            </div>
            <div style="font-size:0.8em;color:#888;">\${p.desc}</div>
            <div style="font-size:0.7em;color:\${rarityInfo.color};margin-top:4px;">🔒 \${unlock.desc}</div>
            <div style="background:#1a1a1a;height:6px;border-radius:3px;margin-top:4px;overflow:hidden;">
              <div style="height:100%;width:\${progress}%;background:\${rarityInfo.color};transition:width 0.3s;"></div>
            </div>
            <div style="font-size:0.6em;color:#666;margin-top:2px;">\${progressText} (\${Math.floor(progress)}%)</div>
          </div>
        </div>
      \`;
    });
  }

  el.innerHTML = html;
}

function rebuildPrestige() {
  const el = document.getElementById('prestigeContent');
  if (!el) return;
  const totalMult = G.rebirthMult * G.prestigeMult;
  let html = \`
    <div style="text-align:center;margin-bottom:15px;">
      <div style="font-size:3em;" class="wand-icon">⏳</div>
      <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:1.2em;margin:10px 0;">Multiplicateur total : x\${totalMult.toFixed(1)}</div>
      <div style="font-size:0.8em;color:#888;">Rebirth x\${G.rebirthMult.toFixed(1)} × Prestige x\${G.prestigeMult.toFixed(1)}</div>
    </div>

    <div style="font-family:'Cinzel',serif;color:#ce93d8;font-size:1em;margin:15px 0 8px;padding-bottom:4px;border-bottom:1px solid rgba(206,147,216,0.3);">🔄 Rebirth (soft reset)</div>
    <div style="font-size:0.8em;color:#aaa;margin-bottom:10px;">Reset gold & sorts. Garde talents et points de talent.</div>
  \`;

  REBIRTH_TIERS.forEach(tier => {
    const done = G.rebirth >= tier.id;
    const canDo = !done && G.highestZone >= tier.reqZone - 1;
    html += \`
      <div class="prestige-tier \${done ? 'done' : canDo ? 'available' : ''}">
        <div class="pt-name">\${done ? '✅ ' : ''}\${tier.name}</div>
        <div class="pt-req">Requiert : Zone \${tier.reqZone} atteinte</div>
        <div class="pt-reward">Récompense : Multiplicateur x\${tier.mult}</div>
        <div style="font-size:0.8em;color:#aaa;">\${tier.desc}</div>
        \${done ? '<div style="font-size:0.8em;color:var(--green);margin-top:5px;">✅ Complété</div>'
          : canDo ? \`<button class="btn btn-purple" onclick="doRebirth()" style="margin-top:8px;">Activer le Rebirth</button>\`
          : \`<div style="font-size:0.8em;color:#555;margin-top:5px;">🔒 Atteins la Zone \${tier.reqZone}</div>\`}
      </div>
    \`;
  });

  const canPrestige = G.highestZone >= 24;
  const nextPrestigeMult = 1 + (G.prestige + 1) * PRESTIGE_MULT_PER;
  html += \`
    <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:1em;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid rgba(212,168,67,0.3);">⏳ Prestige (hard reset)</div>
    <div style="font-size:0.8em;color:#aaa;margin-bottom:10px;">Reset TOUT (gold, sorts, talents, rebirths). +\${PRESTIGE_MULT_PER} au multiplicateur permanent. Talents → 💎 Gems.</div>
    <div class="prestige-tier \${canPrestige ? 'available' : ''}">
      <div class="pt-name">Prestige \${G.prestige + 1}</div>
      <div class="pt-req">Requiert : Zone 25 atteinte</div>
      <div class="pt-reward">Multiplicateur : x\${G.prestigeMult.toFixed(1)} → x\${nextPrestigeMult.toFixed(1)}</div>
      <div style="font-size:0.8em;color:#aaa;">Prestiges effectués : \${G.prestige}</div>
      \${canPrestige ? \`<button class="btn btn-purple" onclick="doPrestige()" style="margin-top:8px;">Activer le Prestige</button>\`
        : \`<div style="font-size:0.8em;color:#555;margin-top:5px;">🔒 Atteins la Zone 25</div>\`}
    </div>
  \`;

  el.innerHTML = html;
}

function rebuildStats() {
  const el = document.getElementById('statsContent');
  if (!el) return;
  const playTime = Math.floor((Date.now() - (G.startTime || Date.now())) / 1000);
  const hours = Math.floor(playTime / 3600);
  const mins = Math.floor((playTime % 3600) / 60);
  el.innerHTML = \`
    <div class="stat-row"><span class="stat-label">DPS total</span><span class="stat-value">\${fmt(getDPS())}</span></div>
    <div class="stat-row"><span class="stat-label">Gold/s</span><span class="stat-value">\${fmt(getGoldPerSec())}</span></div>
    <div class="stat-row"><span class="stat-label">Zone actuelle</span><span class="stat-value">\${G.currentZone + 1} / \${ZONES.length}</span></div>
    <div class="stat-row"><span class="stat-label">Zone max atteinte</span><span class="stat-value">\${G.highestZone + 1}</span></div>
    <div class="stat-row"><span class="stat-label">Kills (session)</span><span class="stat-value">\${fmt(G.kills)}</span></div>
    <div class="stat-row"><span class="stat-label">Kills (total)</span><span class="stat-value">\${fmt(G.totalKills)}</span></div>
    <div class="stat-row"><span class="stat-label">Gold total</span><span class="stat-value">\${fmt(G.totalGoldEarned)}</span></div>
    <div class="stat-row"><span class="stat-label">Rebirth</span><span class="stat-value">\${G.rebirth} (x\${G.rebirthMult.toFixed(1)})</span></div>
    <div class="stat-row"><span class="stat-label">Prestige</span><span class="stat-value">\${G.prestige} (x\${G.prestigeMult.toFixed(1)})</span></div>
    <div class="stat-row"><span class="stat-label">Mult. total</span><span class="stat-value">x\${(G.rebirthMult * G.prestigeMult).toFixed(1)}</span></div>
    <div class="stat-row"><span class="stat-label">Critique</span><span class="stat-value">\${(getCritChance()*100).toFixed(1)}%</span></div>
    <div class="stat-row"><span class="stat-label">Mult. crit</span><span class="stat-value">x\${getCritMult().toFixed(2)}</span></div>
    <div class="stat-row"><span class="stat-label">Double hit</span><span class="stat-value">\${(getMultiHitChance()*100).toFixed(1)}%</span></div>
    <div class="stat-row"><span class="stat-label">Temps de jeu</span><span class="stat-value">\${hours}h \${mins}m</span></div>
    \${getSpells().map(s => \`
      <div class="stat-row"><span class="stat-label">\${s.icon} \${s.name}</span><span class="stat-value">Niv.\${G.spellLevels[s.id]} — \${fmt(getSpellDmg(s.id))} dmg — \${getSpellCD(s.id).toFixed(2)}s</span></div>
    \`).join('')}
  \`;
}

// ============ SHINY PETS (tryMakeShiny) ============
function tryMakeShiny(petId) {
  // Check special conditions first
  const special = SHINY_SPECIAL[petId];
  if (special) {
    if (special.condition === 'world_boss' && worldBossState.active) {
      return true;  // Guaranteed shiny during world boss
    }
    if (special.condition === 'rebirths_1000' && G.totalKills >= 1000000) {
      return true;  // Approximation: high total kills
    }
    if (special.condition === 'all_zones_fast') {
      // Check if all zones completed quickly (simplified)
      const allFast = Object.values(G.zoneCompletionTimes || {}).length >= 24;
      if (allFast) return true;
    }
  }
  // Standard 2% chance
  return Math.random() < SHINY_RATE;
}

// ============ MULTI-PET BONUS ============
function getMultiPetBonus(type, spell) {
  let totalBonus = 0;
  const activePets = getActivePets();

  activePets.forEach(petId => {
    const pet = PETS.find(p => p.id === petId);
    if (!pet) return;

    // Check for type match or 'all' type (for legendary pets with multiple effects)
    if (pet.effect.type === type || pet.effect.type === 'all') {
      if (spell && pet.effect.spell && pet.effect.spell !== spell) return;
      const lvl = G.petLevels[petId] || 1;
      const rarityMult = (PET_RARITIES[pet.rarity] || PET_RARITIES.common).mult;
      let bonus = pet.effect.val * (1 + (lvl - 1) * 0.2);
      // Apply shiny multiplier AND rarity multiplier
      bonus *= getShinyMultiplier(petId) * rarityMult;
      totalBonus += bonus;
    }
  });

  // Add synergy bonuses
  totalBonus += getSynergyBonus(type, spell);

  return totalBonus;
}

// ============ SYNERGY BONUS ============
function getSynergyBonus(type, spell) {
  let bonus = 0;
  const synergies = getActiveSynergies();

  synergies.forEach(syn => {
    if (syn.effect.type === type) {
      if (spell && syn.effect.spell && syn.effect.spell !== spell) return;
      bonus += syn.effect.val;
    }
  });

  return bonus;
}

// ============ SPELL EVOLUTIONS ============
function getSpellEvolution(spellId) {
  const evolutions = SPELL_EVOLUTIONS[spellId];
  if (!evolutions) return null;

  const level = G.spellLevels[spellId] || 1;
  let currentEvo = null;

  for (const evo of evolutions) {
    if (level >= evo.level) {
      currentEvo = evo;
    }
  }

  return currentEvo;
}

function getSpellEvolutionBonus(spellId) {
  const evo = getSpellEvolution(spellId);
  return evo ? evo.bonusDmg : 0;
}

// ============ RELICS (Eternals) ============
function getRelicLevel(relicId) {
  return G.relics && G.relics[relicId] ? G.relics[relicId] : 0;
}

function getRelicCost(relicId) {
  const relic = RELICS.find(r => r.id === relicId);
  if (!relic) return Infinity;
  const lvl = getRelicLevel(relicId);
  if (lvl >= relic.maxLvl) return Infinity;
  return relic.costs[lvl];
}

function buyRelic(relicId) {
  const cost = getRelicCost(relicId);
  if (G.starDust < cost) { toast('Pas assez de Star Dust !'); return; }

  G.starDust -= cost;
  if (!G.relics) G.relics = {};
  G.relics[relicId] = (G.relics[relicId] || 0) + 1;

  const relic = RELICS.find(r => r.id === relicId);
  toast('✨ ' + relic.name + ' amélioré niveau ' + G.relics[relicId] + ' !');
  rebuildEternals();
}

function getRelicBonus(type) {
  let bonus = 0;
  RELICS.forEach(relic => {
    if (relic.effect.type === type) {
      const lvl = getRelicLevel(relic.id);
      bonus += lvl * relic.effect.perLevel;
    }
  });
  return bonus;
}

function awardStarDust(amount, reason) {
  // Apply orb bonus
  const orbBonus = getRelicBonus('stardust');
  const finalAmount = Math.floor(amount * (1 + orbBonus));

  G.starDust = (G.starDust || 0) + finalAmount;
  G.totalStarDust = (G.totalStarDust || 0) + finalAmount;

  if (reason) {
    toast('⭐ +' + finalAmount + ' Star Dust (' + reason + ')');
  }

  // Check achievement
  checkAchievement('eternal_one', G.totalStarDust);
  showEternalsNotif();
}

// ============ ACHIEVEMENTS SYSTEM ============
function hasAchievement(id) {
  return G.achievements && G.achievements.includes(id);
}

function checkAchievement(id, value) {
  if (hasAchievement(id)) return;

  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return;

  // Update progress
  if (!G.achievementProgress) G.achievementProgress = {};
  G.achievementProgress[id] = Math.max(G.achievementProgress[id] || 0, value);

  // Check if completed
  if (value >= ach.target) {
    unlockAchievement(id);
  }
}

function checkAchievementIncrement(id, amount) {
  if (hasAchievement(id)) return;

  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return;

  if (!G.achievementProgress) G.achievementProgress = {};
  G.achievementProgress[id] = (G.achievementProgress[id] || 0) + amount;

  if (G.achievementProgress[id] >= ach.target) {
    unlockAchievement(id);
  }
}

function unlockAchievement(id) {
  if (hasAchievement(id)) return;

  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return;

  if (!G.achievements) G.achievements = [];
  G.achievements.push(id);

  // Give rewards
  if (ach.reward.gems) {
    G.gems = (G.gems || 0) + ach.reward.gems;
  }
  if (ach.reward.starDust) {
    G.starDust = (G.starDust || 0) + ach.reward.starDust;
    G.totalStarDust = (G.totalStarDust || 0) + ach.reward.starDust;
  }

  toast('🏆 Achievement : ' + ach.name + ' !');
  showAchieveNotif();

  // Check category completion bonus
  checkCategoryBonus(ach.category);
}

function checkCategoryBonus(category) {
  const categoryAchs = ACHIEVEMENTS.filter(a => a.category === category);
  const allComplete = categoryAchs.every(a => hasAchievement(a.id));

  if (allComplete) {
    const catInfo = ACHIEVEMENT_CATEGORIES[category];
    toast('🎊 Catégorie ' + catInfo.name + ' complète ! +2% ' + catInfo.bonus.type);
  }
}

function getCategoryBonus(type) {
  let bonus = 0;
  Object.entries(ACHIEVEMENT_CATEGORIES).forEach(([cat, info]) => {
    if (info.bonus.type === type) {
      const categoryAchs = ACHIEVEMENTS.filter(a => a.category === cat);
      const allComplete = categoryAchs.every(a => hasAchievement(a.id));
      if (allComplete) {
        bonus += info.bonus.val;
      }
    }
  });
  return bonus;
}

function getAchievementProgress(id) {
  return G.achievementProgress && G.achievementProgress[id] ? G.achievementProgress[id] : 0;
}

// ============ DAILY CHALLENGES ============
function generateDailyChallenges() {
  const now = Date.now();
  const midnight = new Date();
  midnight.setUTCHours(0, 0, 0, 0);

  if (G.lastDailyReset && G.lastDailyReset >= midnight.getTime()) {
    return; // Already generated today
  }

  G.dailyChallenges = [];
  G.lastDailyReset = now;

  // Pick 3 random challenge types
  const shuffled = [...DAILY_CHALLENGE_TYPES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  selected.forEach((type, i) => {
    const target = type.targets[Math.floor(Math.random() * type.targets.length)];
    G.dailyChallenges.push({
      id: type.id + '_' + i,
      type: type.id,
      name: type.name,
      icon: type.icon,
      desc: type.desc.replace('{target}', fmt(target)),
      target: target,
      progress: 0,
      completed: false
    });
  });

  toast('📅 Nouveaux défis quotidiens !');
}

function updateDailyChallenge(type, amount) {
  if (!G.dailyChallenges) return;

  G.dailyChallenges.forEach(challenge => {
    if (challenge.type === type && !challenge.completed) {
      challenge.progress += amount;

      if (challenge.progress >= challenge.target) {
        challenge.completed = true;
        G.gems = (G.gems || 0) + DAILY_REWARD.gems;
        awardStarDust(DAILY_REWARD.starDust, 'Défi quotidien');
        G.totalDailiesCompleted = (G.totalDailiesCompleted || 0) + 1;
        checkAchievement('daily_1', G.totalDailiesCompleted);
        checkAchievement('daily_10', G.totalDailiesCompleted);
        checkAchievement('daily_50', G.totalDailiesCompleted);
        checkAchievement('daily_100', G.totalDailiesCompleted);
        toast('✅ Défi complété : ' + challenge.name + ' !');
      }
    }
  });
}

// ============ INFINITY PRESTIGE ============
function canInfinityPrestige() {
  return G.prestige >= 10;
}

function doInfinityPrestige() {
  if (!canInfinityPrestige()) {
    toast('Atteins Prestige 10 d\\'abord !');
    return;
  }

  // Store permanent values
  const newInfinity = (G.infinityPrestige || 0) + 1;
  const newInfinityMult = Math.pow(1.5, newInfinity);
  const keepAchievements = [...(G.achievements || [])];
  const keepAchievementProgress = JSON.parse(JSON.stringify(G.achievementProgress || {}));
  const keepTotalStarDust = G.totalStarDust || 0;
  const keepTotalKills = G.totalKills || 0;
  const keepTotalGold = G.totalGoldEarned || 0;
  const keepStartTime = G.startTime;
  const keepShinyPets = [...(G.shinyPets || [])];  // Shiny pets persist!

  // Hard reset everything
  G = defaultState();

  // Restore permanent values
  G.infinityPrestige = newInfinity;
  G.infinityMult = newInfinityMult;
  G.achievements = keepAchievements;
  G.achievementProgress = keepAchievementProgress;
  G.totalStarDust = keepTotalStarDust;
  G.totalKills = keepTotalKills;
  G.totalGoldEarned = keepTotalGold;
  G.startTime = keepStartTime;
  G.shinyPets = keepShinyPets;

  spawnMob();
  save();
  toast('♾️ Infinity Prestige ' + newInfinity + ' ! x' + newInfinityMult.toFixed(1) + ' permanent !');
  rebuildAll();
}

// ============ NOTIFICATIONS ============
function showPetNotif() {
  const notif = document.getElementById('petNotif');
  if (notif) notif.style.display = 'flex';
}

function clearPetNotif() {
  const notif = document.getElementById('petNotif');
  if (notif) notif.style.display = 'none';
}

function showEternalsNotif() {
  const notif = document.getElementById('eternalsNotif');
  if (notif) notif.style.display = 'flex';
}

function clearEternalsNotif() {
  const notif = document.getElementById('eternalsNotif');
  if (notif) notif.style.display = 'none';
}

function showAchieveNotif() {
  const notif = document.getElementById('achieveNotif');
  if (notif) notif.style.display = 'flex';
}

function clearAchieveNotif() {
  const notif = document.getElementById('achieveNotif');
  if (notif) notif.style.display = 'none';
}

// ============ REBUILD ETERNALS UI ============
function rebuildEternals() {
  const el = document.getElementById('relicsList');
  const dailyEl = document.getElementById('dailyChallengesList');
  const infinityEl = document.getElementById('infinityPrestigeBox');
  const sdVal = document.getElementById('starDustVal');

  if (sdVal) sdVal.textContent = fmt(G.starDust || 0);

  // Update top bar star dust
  const sdTop = document.getElementById('starDustTopVal');
  if (sdTop) sdTop.textContent = fmt(G.starDust || 0);

  if (el) {
    let html = '';
    RELICS.forEach(relic => {
      const lvl = getRelicLevel(relic.id);
      const cost = getRelicCost(relic.id);
      const isMax = lvl >= relic.maxLvl;
      const currentBonus = lvl * relic.effect.perLevel * 100;

      html += \`
        <div class="relic-card \${isMax ? 'maxed' : ''}">
          <div class="relic-icon">\${relic.icon}</div>
          <div class="relic-info">
            <div class="relic-name">\${relic.name}</div>
            <div class="relic-desc">\${relic.desc}</div>
            <div class="relic-level">
              \${Array.from({length: relic.maxLvl}, (_, i) =>
                '<div class="relic-pip ' + (i < lvl ? 'filled' : '') + '"></div>'
              ).join('')}
            </div>
            <div style="font-size:0.75em;color:#888;margin-top:4px;">
              Bonus actuel : <span style="color:var(--gold);">+\${currentBonus.toFixed(0)}%</span>
            </div>
          </div>
          <div style="text-align:right;">
            \${isMax
              ? '<div style="color:var(--green);font-family:\\'Cinzel\\',serif;">✅ MAX</div>'
              : \`<button class="btn btn-sm" onclick="buyRelic('\${relic.id}')" \${G.starDust < cost ? 'disabled' : ''}>
                  ⭐ \${fmt(cost)}
                </button>\`
            }
          </div>
        </div>
      \`;
    });
    el.innerHTML = html;
  }

  // Daily Challenges
  if (dailyEl) {
    generateDailyChallenges();  // Generate if needed

    let html = '';
    if (G.dailyChallenges && G.dailyChallenges.length > 0) {
      G.dailyChallenges.forEach(challenge => {
        const pct = Math.min(100, (challenge.progress / challenge.target) * 100);
        html += \`
          <div class="daily-challenge \${challenge.completed ? 'completed' : ''}">
            <div class="daily-icon">\${challenge.icon}</div>
            <div class="daily-info">
              <div class="daily-name">\${challenge.name}</div>
              <div style="font-size:0.8em;color:#aaa;">\${challenge.desc}</div>
              <div class="daily-progress-bar">
                <div class="daily-progress-fill" style="width:\${pct}%"></div>
              </div>
              <div style="font-size:0.7em;color:#888;margin-top:2px;">
                \${fmt(challenge.progress)} / \${fmt(challenge.target)} \${challenge.completed ? '✅' : ''}
              </div>
            </div>
            <div class="daily-reward">
              <span>💎 \${DAILY_REWARD.gems}</span>
              <span>⭐ \${DAILY_REWARD.starDust}</span>
            </div>
          </div>
        \`;
      });
    } else {
      html = '<div style="text-align:center;color:#555;padding:15px;">Les défis apparaîtront à minuit UTC !</div>';
    }
    dailyEl.innerHTML = html;
  }

  // Infinity Prestige
  if (infinityEl) {
    const canDo = canInfinityPrestige();
    const currentInfinity = G.infinityPrestige || 0;
    const currentMult = G.infinityMult || 1;
    const nextMult = Math.pow(1.5, currentInfinity + 1);

    infinityEl.innerHTML = \`
      <div style="font-family:'Cinzel',serif;color:#9c27b0;font-size:1em;margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid rgba(156,39,176,0.3);">
        ♾️ Infinity Prestige
      </div>
      <div style="font-size:0.8em;color:#aaa;margin-bottom:10px;">
        Reset TOTAL (incluant reliques). Multiplicateur permanent x1.5 par infinity. Garde achievements & shiny pets.
      </div>
      \${currentInfinity > 0 ? \`
        <div class="infinity-badge" style="margin-bottom:10px;">
          ♾️ Infinity x\${currentInfinity} — Mult. x\${currentMult.toFixed(1)}
        </div>
      \` : ''}
      <div class="prestige-tier \${canDo ? 'available' : ''}">
        <div class="pt-name">Infinity Prestige \${currentInfinity + 1}</div>
        <div class="pt-req">Requiert : Prestige 10 (actuel : \${G.prestige || 0})</div>
        <div class="pt-reward">Multiplicateur : x\${currentMult.toFixed(1)} → x\${nextMult.toFixed(1)}</div>
        \${canDo
          ? '<button class="btn btn-purple" onclick="doInfinityPrestige()" style="margin-top:8px;">♾️ Activer Infinity Prestige</button>'
          : '<div style="font-size:0.8em;color:#555;margin-top:5px;">🔒 Atteins Prestige 10</div>'}
      </div>
    \`;
  }
}

// ============ REBUILD ACHIEVEMENTS UI ============
function rebuildAchievements() {
  const el = document.getElementById('achievementCategories');
  if (!el) return;

  let html = '';

  Object.entries(ACHIEVEMENT_CATEGORIES).forEach(([catId, catInfo]) => {
    const categoryAchs = ACHIEVEMENTS.filter(a => a.category === catId);
    const completedCount = categoryAchs.filter(a => hasAchievement(a.id)).length;
    const allComplete = completedCount === categoryAchs.length;

    html += \`
      <div style="margin-bottom:20px;">
        <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:1em;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
          <span>\${catInfo.icon}</span>
          <span>\${catInfo.name}</span>
          <span style="font-size:0.8em;color:#888;">(\${completedCount}/\${categoryAchs.length})</span>
          \${allComplete ? '<span style="color:var(--green);">✅ +2% bonus</span>' : ''}
        </div>
    \`;

    categoryAchs.forEach(ach => {
      const done = hasAchievement(ach.id);
      const progress = getAchievementProgress(ach.id);
      const pct = Math.min(100, (progress / ach.target) * 100);

      html += \`
        <div class="achievement-card \${done ? 'unlocked' : progress > 0 ? '' : 'locked'}">
          <div class="achievement-icon">\${ach.icon}</div>
          <div class="achievement-info">
            <div class="achievement-name">\${ach.name}</div>
            <div class="achievement-desc">\${ach.desc}</div>
            \${!done ? \`
              <div class="achievement-progress">
                <div class="achievement-progress-fill" style="width:\${pct}%"></div>
              </div>
              <div style="font-size:0.7em;color:#888;margin-top:2px;">\${fmt(progress)} / \${fmt(ach.target)}</div>
            \` : ''}
            <div class="achievement-reward">
              \${ach.reward.gems ? '<span>💎 ' + ach.reward.gems + '</span>' : ''}
              \${ach.reward.starDust ? '<span>⭐ ' + ach.reward.starDust + '</span>' : ''}
            </div>
          </div>
          \${done ? '<div style="color:var(--green);font-size:1.5em;">✅</div>' : ''}
        </div>
      \`;
    });

    html += '</div>';
  });

  el.innerHTML = html;
}

// ============ TOAST ============
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._to);
  t._to = setTimeout(() => t.classList.remove('show'), 2500);
}

// ============ FIREBASE AUTH ============
// Firebase SDK loaded from window globals (loaded via CDN in head)
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

// ============ CLOUD SYNC ============
let cloudSyncEnabled = true;
let lastCloudSave = 0;

async function saveToCloud() {
  if (!firebaseUser || !firebaseDb || !cloudSyncEnabled) return;

  // Throttle cloud saves to every 10 seconds max
  const now = Date.now();
  if (now - lastCloudSave < 10000) return;
  lastCloudSave = now;

  try {
    const saveData = { ...G };
    delete saveData._saveTimer;
    saveData.cloudSaveTime = now;

    await firebaseDb.ref('saves/' + firebaseUser.uid).set(saveData);
    console.log('Cloud save OK');
  } catch (e) {
    console.error('Cloud save error:', e);
  }
}

async function loadFromCloud() {
  if (!firebaseUser || !firebaseDb) return null;

  try {
    const snapshot = await firebaseDb.ref('saves/' + firebaseUser.uid).get();
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (e) {
    console.error('Cloud load error:', e);
  }
  return null;
}

async function checkCloudSave() {
  if (!firebaseUser) {
    console.log('No firebase user, skipping cloud check');
    return;
  }
  console.log('Checking cloud save...');

  let cloudData;
  try {
    cloudData = await loadFromCloud();
  } catch (e) {
    console.error('Error loading cloud save:', e);
    return;
  }

  if (!cloudData) {
    console.log('No cloud save found, uploading local save...');
    lastCloudSave = 0;
    saveToCloud();
    toast('☁️ Sauvegarde synchronisée !');
    return;
  }

  const localTime = G.lastTick || 0;
  const cloudTime = cloudData.cloudSaveTime || cloudData.lastTick || 0;
  const localKills = G.totalKills || 0;
  const cloudKills = cloudData.totalKills || 0;
  const localZone = G.highestZone || 0;
  const cloudZone = cloudData.highestZone || 0;

  console.log('Cloud time:', cloudTime, 'Local time:', localTime);
  console.log('Cloud kills:', cloudKills, 'Local kills:', localKills);
  console.log('Cloud zone:', cloudZone, 'Local zone:', localZone);

  // Si la sauvegarde locale est "vide" (nouvelle partie) et le cloud a de la progression
  const localIsEmpty = localKills < 10 && localZone === 0;
  const cloudHasProgress = cloudKills > 10 || cloudZone > 0;

  if (localIsEmpty && cloudHasProgress) {
    console.log('Local save is empty, cloud has progress - showing modal');
    showSyncModal(cloudData, cloudTime, localTime);
  } else if (cloudTime > localTime + 60000) {
    console.log('Cloud is newer - showing modal');
    showSyncModal(cloudData, cloudTime, localTime);
  } else if (localTime > cloudTime + 60000) {
    console.log('Local save is newer, uploading to cloud...');
    lastCloudSave = 0;
    saveToCloud();
    toast('☁️ Cloud mis à jour !');
  } else {
    toast('☁️ Saves synchronisées !');
  }
}

function showSyncModal(cloudData, cloudTime, localTime) {
  const modal = document.createElement('div');
  modal.id = 'syncModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center;';

  const cloudDate = new Date(cloudTime).toLocaleString('fr-FR');
  const localDate = new Date(localTime).toLocaleString('fr-FR');
  const cloudGold = cloudData.gold || 0;
  const cloudGems = cloudData.gems || 0;
  const cloudZone = cloudData.highestZone || 0;

  modal.innerHTML = '<div style="background:linear-gradient(180deg,var(--dark),var(--darker));border:2px solid var(--gold);border-radius:12px;padding:25px;max-width:400px;text-align:center;"><h2 style="color:var(--gold);font-family:Cinzel,serif;margin-bottom:20px;">☁️ Sauvegarde Cloud Trouvée</h2><p style="color:var(--parchment);margin-bottom:15px;">Une sauvegarde plus récente existe sur le cloud.</p><div style="display:flex;gap:15px;margin-bottom:20px;"><div style="flex:1;background:rgba(0,100,255,0.1);border:1px solid #4488ff;border-radius:8px;padding:12px;"><div style="color:#4488ff;font-weight:bold;margin-bottom:8px;">☁️ CLOUD</div><div style="color:#aaa;font-size:0.8em;">' + cloudDate + '</div><div style="color:var(--gold);margin-top:8px;">💰 ' + fmt(cloudGold) + '</div><div style="color:#ce93d8;">💎 ' + cloudGems + '</div><div style="color:#aaa;font-size:0.85em;">Zone ' + cloudZone + '</div></div><div style="flex:1;background:rgba(255,150,0,0.1);border:1px solid #ff9800;border-radius:8px;padding:12px;"><div style="color:#ff9800;font-weight:bold;margin-bottom:8px;">💾 LOCAL</div><div style="color:#aaa;font-size:0.8em;">' + localDate + '</div><div style="color:var(--gold);margin-top:8px;">💰 ' + fmt(G.gold) + '</div><div style="color:#ce93d8;">💎 ' + G.gems + '</div><div style="color:#aaa;font-size:0.85em;">Zone ' + G.highestZone + '</div></div></div><div style="display:flex;gap:10px;"><button onclick="useCloudSave()" style="flex:1;padding:12px;background:linear-gradient(180deg,#1565c0,#0d47a1);border:none;border-radius:8px;color:#fff;font-family:Cinzel,serif;cursor:pointer;">☁️ Utiliser Cloud</button><button onclick="useLocalSave()" style="flex:1;padding:12px;background:linear-gradient(180deg,#ff9800,#f57c00);border:none;border-radius:8px;color:#fff;font-family:Cinzel,serif;cursor:pointer;">💾 Garder Local</button></div></div>';

  document.body.appendChild(modal);
  window._pendingCloudData = cloudData;
}

function useCloudSave() {
  const cloudData = window._pendingCloudData;
  if (cloudData) {
    const fresh = defaultState();
    G = { ...fresh, ...cloudData };
    delete G.cloudSaveTime;
    localStorage.setItem('wandIdle', JSON.stringify(G));
    toast('☁️ Sauvegarde cloud chargée !');
    setTimeout(() => location.reload(), 500);
  }
  document.getElementById('syncModal')?.remove();
}

function useLocalSave() {
  lastCloudSave = 0;
  saveToCloud();
  toast('💾 Sauvegarde locale conservée !');
  document.getElementById('syncModal')?.remove();
}

async function initFirebase() {
  try {
    // Wait for Firebase SDK to be available
    if (typeof firebase === 'undefined') {
      console.log('Firebase SDK not loaded yet, waiting...');
      await new Promise(resolve => {
        const check = setInterval(() => {
          if (typeof firebase !== 'undefined') {
            clearInterval(check);
            resolve();
          }
        }, 100);
        // Timeout after 5 seconds
        setTimeout(() => { clearInterval(check); resolve(); }, 5000);
      });
    }

    if (typeof firebase === 'undefined') {
      console.log('Firebase SDK not available');
      return;
    }

    // Get config from env (injected via Next.js)
    const config = window.__FIREBASE_CONFIG__;
    if (!config || !config.apiKey || config.apiKey === 'YOUR_API_KEY_HERE') {
      console.log('Firebase not configured - set credentials in .env.local');
      return;
    }

    // Initialize Firebase
    if (!firebaseApp) {
      firebaseApp = firebase.initializeApp(config);
      firebaseAuth = firebase.auth();
      firebaseDb = firebase.database();
    }

    // Show loading state while checking auth
    const btnEl = document.getElementById('loginBtn');
    if (btnEl) btnEl.textContent = '⏳...';

    // Listen for auth state changes
    firebaseAuth.onAuthStateChanged((user) => {
      firebaseUser = user;
      updateUserUI();
      if (user) {
        subscribeToBoss();
        // Check for cloud save when user logs in
        console.log('User logged in, will check cloud save in 1s...');
        setTimeout(() => {
          console.log('Timeout fired, firebaseUser:', !!firebaseUser, 'firebaseDb:', !!firebaseDb);
          checkCloudSave().catch(e => console.error('checkCloudSave error:', e));
        }, 1000);
      } else {
        unsubscribeFromBoss();
      }
    });

    console.log('Firebase initialized successfully');
  } catch (e) {
    console.error('Firebase init error:', e);
  }
}

function updateUserUI() {
  const nameEl = document.getElementById('userName');
  const btnEl = document.getElementById('loginBtn');
  const avatarEl = document.getElementById('userAvatar');
  const loginPrompt = document.getElementById('bossLoginPrompt');
  const notLoggedIn = document.getElementById('bossNotLoggedIn');

  if (firebaseUser) {
    // Essayer de récupérer les infos Discord depuis providerData
    let displayName = firebaseUser.displayName;
    let photoURL = firebaseUser.photoURL;

    // Chercher dans providerData
    if (firebaseUser.providerData && firebaseUser.providerData.length > 0) {
      const provider = firebaseUser.providerData[0];
      if (provider.displayName) displayName = provider.displayName;
      if (provider.photoURL) photoURL = provider.photoURL;
    }

    // Charger le pseudo sauvegardé ou utiliser celui de Discord
    const savedName = localStorage.getItem('wandidle_username');
    worldBossState.myDisplayName = savedName || displayName || 'Sorcier';

    if (nameEl) {
      if (worldBossState.myDisplayName === 'Sorcier') {
        nameEl.innerHTML = 'Sorcier <span style="font-size:0.8em;opacity:0.6;">✏️</span>';
      } else {
        nameEl.textContent = worldBossState.myDisplayName;
      }
    }

    // Avatar : priorité au sauvegardé, puis Discord, puis défaut
    const savedAvatar = localStorage.getItem('wandidle_avatar');
    if (avatarEl) {
      if (savedAvatar) {
        avatarEl.src = savedAvatar;
        avatarEl.style.display = 'block';
      } else if (photoURL) {
        avatarEl.src = photoURL;
        avatarEl.style.display = 'block';
      } else {
        // Avatar par défaut avec emoji
        avatarEl.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
        avatarEl.style.display = 'block';
      }
    }
    if (btnEl) {
      btnEl.textContent = '🚪';
      btnEl.title = 'Se déconnecter';
      btnEl.onclick = handleLogout;
    }
    if (loginPrompt) loginPrompt.style.display = 'none';
    if (notLoggedIn) notLoggedIn.style.display = 'none';

    console.log('User info:', { displayName, photoURL, providerData: firebaseUser.providerData });
  } else {
    if (nameEl) nameEl.textContent = '';
    if (avatarEl) avatarEl.style.display = 'none';
    if (btnEl) {
      btnEl.textContent = '🎮 Discord';
      btnEl.title = 'Se connecter avec Discord';
      btnEl.onclick = handleLogin;
    }
    if (loginPrompt) loginPrompt.style.display = 'block';
    if (notLoggedIn) notLoggedIn.style.display = 'block';
  }
}

let loginInProgress = false;

async function handleLogin() {
  if (loginInProgress) {
    toast('⏳ Connexion en cours...');
    return;
  }
  try {
    if (!firebaseAuth) {
      toast('❌ Firebase non configuré');
      return;
    }
    loginInProgress = true;
    const btnEl = document.getElementById('loginBtn');
    if (btnEl) btnEl.textContent = '⏳...';

    // Discord login via OIDC provider
    const provider = new firebase.auth.OAuthProvider('oidc.discord');
    await firebaseAuth.signInWithPopup(provider);
    toast('✅ Connecté !');
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      toast('❌ Erreur de connexion');
      console.error(e);
    }
  } finally {
    loginInProgress = false;
    updateUserUI();
  }
}

async function handleLogout() {
  try {
    if (!firebaseAuth) return;
    await firebaseAuth.signOut();
    toast('👋 Déconnecté');
    firebaseUser = null;
    updateUserUI();
    unsubscribeFromBoss();
  } catch (e) {
    console.error(e);
  }
}

// ============ WORLD BOSS SYNC ============
let lastBossHpPercent = -1;
let lastBossStatus = '';

async function subscribeToBoss() {
  if (!firebaseUser || !firebaseDb) return;

  try {
    // Écouter l'état du boss
    const bossRef = firebaseDb.ref('worldBoss/current');
    bossRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const prevStatus = worldBossState.status;

      if (data && data.status === 'active') {
        worldBossState.active = true;
        worldBossState.boss = {
          id: data.id,
          name: data.name,
          icon: data.icon,
          hp: data.hp,
          maxHp: data.maxHp,
          startedAt: data.startedAt,
          endsAt: data.endsAt,
        };
        worldBossState.status = 'active';

        // Only show notification on status change
        if (prevStatus !== 'active') {
          showBossNotification();
        }

        // Only update UI if HP changed significantly (1%) or status changed
        const hpPercent = Math.floor((data.hp / data.maxHp) * 100);
        if (lastBossStatus !== 'active' || Math.abs(hpPercent - lastBossHpPercent) >= 1) {
          lastBossHpPercent = hpPercent;
          lastBossStatus = 'active';
          updateBossUI();
        }
      } else if (data && data.status === 'defeated') {
        worldBossState.active = false;
        worldBossState.status = 'victory';
        worldBossState.boss = data;
        if (lastBossStatus !== 'victory') {
          lastBossStatus = 'victory';
          updateBossUI();
        }
      } else if (data && data.status === 'expired') {
        worldBossState.active = false;
        worldBossState.status = 'expired';
        if (lastBossStatus !== 'expired') {
          lastBossStatus = 'expired';
          updateBossUI();
        }
      } else {
        worldBossState.active = false;
        worldBossState.status = 'waiting';
        worldBossState.myDamage = 0;
        worldBossState.claimed = false;
        bossAlertShown = false;
        if (lastBossStatus !== 'waiting') {
          lastBossStatus = 'waiting';
          lastBossHpPercent = -1;
          updateBossUI();
        }
      }
    });
    bossUnsubscribers.push(() => bossRef.off());

    // Écouter les participants (throttled)
    let participantsUpdatePending = false;
    const participantsRef = firebaseDb.ref('worldBoss/participants');
    participantsRef.on('value', (snapshot) => {
      const data = snapshot.val() || {};
      worldBossState.participants = Object.entries(data)
        .map(([uid, p]) => ({ uid, ...p }))
        .sort((a, b) => b.damage - a.damage);

      // Update my damage from server
      if (firebaseUser) {
        const myEntry = worldBossState.participants.find(p => p.uid === firebaseUser.uid);
        if (myEntry) {
          worldBossState.myDamage = myEntry.damage;
        }
      }

      // Throttle leaderboard updates to max 2/sec
      if (!participantsUpdatePending) {
        participantsUpdatePending = true;
        setTimeout(() => {
          participantsUpdatePending = false;
          updateBossLeaderboard();
        }, 500);
      }
    });
    bossUnsubscribers.push(() => participantsRef.off());

    // Écouter prochain spawn
    const nextRef = firebaseDb.ref('worldBoss/nextSpawn');
    nextRef.on('value', (snapshot) => {
      worldBossState.nextSpawn = snapshot.val();
      updateBossCountdown();
    });
    bossUnsubscribers.push(() => nextRef.off());

    // Check if already claimed
    const claimRef = firebaseDb.ref('worldBoss/claims/' + firebaseUser.uid);
    claimRef.on('value', (snapshot) => {
      worldBossState.claimed = !!snapshot.val();
      updateBossUI();
    });
    bossUnsubscribers.push(() => claimRef.off());
  } catch (e) {
    console.error('Error subscribing to boss:', e);
  }
}

function unsubscribeFromBoss() {
  bossUnsubscribers.forEach(unsub => {
    try { unsub(); } catch(e) {}
  });
  bossUnsubscribers = [];
}

let bossAlertShown = false;
let lastSeenBossId = localStorage.getItem('lastSeenBossId') || null;

function showBossNotification() {
  const notif = document.getElementById('bossNotif');
  if (notif) notif.style.display = 'inline';

  // Seulement montrer l'alerte si c'est un NOUVEAU boss qu'on n'a pas encore vu
  const currentBossKey = worldBossState.boss ? (worldBossState.boss.id + '_' + worldBossState.boss.startedAt) : null;
  const isNewBoss = currentBossKey && currentBossKey !== lastSeenBossId;

  if (!bossAlertShown && worldBossState.boss && isNewBoss) {
    bossAlertShown = true;
    lastSeenBossId = currentBossKey;
    localStorage.setItem('lastSeenBossId', currentBossKey);
    showBossAlert(worldBossState.boss.icon, worldBossState.boss.name);

    // Notification système seulement pour un nouveau boss
    if (Notification.permission === 'granted') {
      new Notification('⚔️ World Boss actif !', { body: 'Un boss mondial est apparu !' });
    }
  }
}

function showBossAlert(icon, name) {
  const overlay = document.getElementById('bossAlertOverlay');
  const iconEl = document.getElementById('bossAlertIcon');
  const nameEl = document.getElementById('bossAlertName');

  if (iconEl) iconEl.textContent = icon;
  if (nameEl) nameEl.textContent = name;
  if (overlay) overlay.classList.add('show');

  // Auto-fermer après 4 secondes (notification non-bloquante)
  setTimeout(() => {
    closeBossAlert();
  }, 4000);
}

function closeBossAlert() {
  const overlay = document.getElementById('bossAlertOverlay');
  if (overlay) overlay.classList.remove('show');
}

function goToBossPanel(event) {
  if (event) event.stopPropagation();
  closeBossAlert();
  switchPanel('boss', document.querySelector('.nav-btn:nth-child(7)'));
}

function hideBossNotification() {
  const notif = document.getElementById('bossNotif');
  if (notif) notif.style.display = 'none';
}

// ============ WORLD BOSS ATTACK ============
async function attackWorldBoss() {
  if (!firebaseUser || !firebaseDb) {
    toast('❌ Connecte-toi pour attaquer !');
    return;
  }
  if (!worldBossState.active || worldBossState.attackCD > 0) return;

  // Calculer les dégâts (basé sur DPS total du joueur)
  const damage = Math.floor(getDPS() * WORLD_BOSS_CONFIG.attackCooldown);

  // Cooldown local
  worldBossState.attackCD = WORLD_BOSS_CONFIG.attackCooldown;

  // Animation
  const bossIcon = document.getElementById('bossIcon');
  if (bossIcon) {
    bossIcon.classList.add('boss-hit');
    setTimeout(() => bossIcon.classList.remove('boss-hit'), 100);
  }

  try {
    // Update player participation
    const playerRef = firebaseDb.ref('worldBoss/participants/' + firebaseUser.uid);
    const currentSnap = await playerRef.get();
    const current = currentSnap.val() || { damage: 0 };

    await playerRef.set({
      displayName: firebaseUser.displayName || 'Sorcier',
      damage: current.damage + damage,
      lastHit: Date.now(),
      zone: G.currentZone,
    });

    // Décrémenter HP du boss avec transaction
    const bossHpRef = firebaseDb.ref('worldBoss/current/hp');
    await bossHpRef.transaction((currentHp) => {
      if (currentHp === null) return currentHp;
      const newHp = Math.max(0, currentHp - damage);
      return newHp;
    });

    // Local update
    worldBossState.myDamage += damage;
    if (worldBossState.boss) {
      worldBossState.boss.hp = Math.max(0, worldBossState.boss.hp - damage);
    }

    // Vérifier si boss mort
    if (worldBossState.boss && worldBossState.boss.hp <= 0) {
      await endWorldBoss('victory');
    }

    updateBossUI();
  } catch (e) {
    console.error('Error attacking boss:', e);
    toast('❌ Erreur de connexion');
  }
}

async function endWorldBoss(result) {
  if (!firebaseDb) return;

  try {
    // Get final leaderboard
    const participantsSnap = await firebaseDb.ref('worldBoss/participants').get();
    const participants = participantsSnap.val() || {};
    const topDamagers = Object.entries(participants)
      .map(([uid, p]) => ({ uid, ...p }))
      .sort((a, b) => b.damage - a.damage)
      .slice(0, 10)
      .map((p, i) => ({
        uid: p.uid,
        name: p.displayName,
        damage: p.damage,
        rank: i + 1
      }));

    // Update boss status
    await firebaseDb.ref('worldBoss/current/status').set(result === 'victory' ? 'defeated' : 'expired');

    // Set next spawn time
    await firebaseDb.ref('worldBoss/nextSpawn').set(Date.now() + WORLD_BOSS_CONFIG.spawnInterval);

    // Archive to history (optional)
    if (worldBossState.boss) {
      await firebaseDb.ref('worldBoss/history/' + Date.now()).set({
        name: worldBossState.boss.name,
        maxHp: worldBossState.boss.maxHp,
        result: result,
        endedAt: Date.now(),
        topDamagers: topDamagers,
      });
    }
  } catch (e) {
    console.error('Error ending boss:', e);
  }
}

// ============ WORLD BOSS REWARDS ============
async function claimBossReward() {
  if (!firebaseUser || !firebaseDb) {
    toast('❌ Non connecté');
    return;
  }
  if (worldBossState.claimed) {
    toast('✅ Déjà récupéré !');
    return;
  }
  if (worldBossState.status !== 'victory' && worldBossState.status !== 'expired') {
    toast('❌ Pas de boss terminé');
    return;
  }

  // Récupérer les dégâts directement depuis Firebase (plus fiable que l'état local)
  let myDamage = worldBossState.myDamage;
  try {
    const myParticipantSnap = await firebaseDb.ref('worldBoss/participants/' + firebaseUser.uid).get();
    const myParticipantData = myParticipantSnap.val();
    if (myParticipantData && myParticipantData.damage > 0) {
      myDamage = myParticipantData.damage;
    }
  } catch (e) {
    console.error('Error fetching participant data:', e);
  }

  const totalPlayers = Math.max(worldBossState.participants.length, 1);
  const myRank = worldBossState.participants.findIndex(p => p.uid === firebaseUser.uid) + 1;

  if (myDamage <= 0) {
    toast('❌ Tu n\\'as pas participé ! (0 dégâts)');
    console.log('Claim failed - myDamage:', myDamage, 'participants:', worldBossState.participants);
    return;
  }

  // Calcul de la récompense basée sur les dégâts (utilise HP effectif)
  const effectiveMaxHp = worldBossState.effectiveMaxHp || worldBossState.boss?.maxHp || WORLD_BOSS_CONFIG.baseHp;
  const damagePercent = Math.min((myDamage / effectiveMaxHp) * 100, WORLD_BOSS_CONFIG.damageRewards.maxPercent);

  console.log('Claiming reward - damage:', myDamage, 'effectiveMaxHp:', effectiveMaxHp, 'percent:', damagePercent);

  let totalGems = Math.floor(damagePercent * WORLD_BOSS_CONFIG.damageRewards.perPercent.gems);
  let totalGold = Math.floor(damagePercent * WORLD_BOSS_CONFIG.damageRewards.perPercent.gold);

  let bonusText = '';

  // Bonus si victoire
  if (worldBossState.status === 'victory') {
    let bonus = { ...WORLD_BOSS_CONFIG.victoryBonus.participation };

    // Si pas dans le classement mais a des dégâts, donner au moins participation
    const effectiveRank = myRank > 0 ? myRank : totalPlayers;

    if (effectiveRank === 1) {
      bonus = WORLD_BOSS_CONFIG.victoryBonus.top1;
    } else if (effectiveRank <= 3) {
      bonus = WORLD_BOSS_CONFIG.victoryBonus.top3;
    } else if (effectiveRank <= Math.ceil(totalPlayers * 0.1)) {
      bonus = WORLD_BOSS_CONFIG.victoryBonus.top10Percent;
    } else if (effectiveRank <= Math.ceil(totalPlayers * 0.5)) {
      bonus = WORLD_BOSS_CONFIG.victoryBonus.top50Percent;
    }

    totalGems += bonus.gems;
    totalGold += bonus.gold;
    bonusText = ' (+ bonus victoire !)';
  }

  // Appliquer les récompenses
  G.gems += totalGems;
  G.gold += totalGold;

  // Track world boss stats for secret pet unlocks
  G.totalWorldBossDmg = (G.totalWorldBossDmg || 0) + myDamage;
  if (worldBossState.status === 'victory') {
    G.worldBossKills = (G.worldBossKills || 0) + 1;
  }

  // Check if any secret pets can now be unlocked
  checkSecretPetUnlocks();

  toast('🎁 +' + totalGems + ' 💎 +' + fmt(totalGold) + ' 🪙' + bonusText);
  save();

  // Mettre à jour l'affichage des currencies
  document.getElementById('goldVal').textContent = fmt(G.gold);
  document.getElementById('gemsVal').textContent = G.gems;

  // Marquer comme claim dans Firebase
  try {
    if (firebaseDb) {
      await firebaseDb.ref('worldBoss/claims/' + firebaseUser.uid).set(Date.now());
    }
    worldBossState.claimed = true;
    updateBossUI();
  } catch (e) {
    console.error('Error claiming reward:', e);
  }
}

// ============ WORLD BOSS UI ============
function updateBossUI() {
  // Throttle UI updates to prevent lag from frequent Firebase updates
  if (bossUIUpdateScheduled) return;

  const now = performance.now();
  const timeSinceLastUpdate = now - bossUILastUpdateTime;

  if (timeSinceLastUpdate < BOSS_UI_MIN_INTERVAL) {
    bossUIUpdateScheduled = true;
    setTimeout(() => {
      bossUIUpdateScheduled = false;
      updateBossUIInternal();
    }, BOSS_UI_MIN_INTERVAL - timeSinceLastUpdate);
    return;
  }

  bossUILastUpdateTime = now;
  updateBossUIInternal();
}

function updateBossUIInternal() {
  const waiting = document.getElementById('bossWaiting');
  const active = document.getElementById('bossActive');
  const victory = document.getElementById('bossVictory');
  const expired = document.getElementById('bossExpired');

  if (!waiting || !active || !victory || !expired) return;

  // Hide all
  waiting.style.display = 'none';
  active.style.display = 'none';
  victory.style.display = 'none';
  expired.style.display = 'none';

  if (worldBossState.status === 'active' && worldBossState.boss) {
    active.style.display = 'block';
    showBossNotification();

    document.getElementById('bossIcon').textContent = worldBossState.boss.icon;
    document.getElementById('bossName').textContent = worldBossState.boss.name;

    // Mettre à jour les joueurs dans l'arène
    updateBossArenaPlayers();

    // Calcul du HP effectif avec scaling dynamique
    const numPlayers = Math.max(1, worldBossState.participants.length);
    const baseMaxHp = worldBossState.boss.maxHp;
    const effectiveMaxHp = calcEffectiveMaxHp(baseMaxHp, numPlayers);
    const effectiveHp = calcEffectiveHp(worldBossState.boss.hp, baseMaxHp, effectiveMaxHp);
    worldBossState.effectiveMaxHp = effectiveMaxHp;

    const hpPct = Math.max(0, (effectiveHp / effectiveMaxHp) * 100);
    document.getElementById('bossHpBar').style.width = hpPct + '%';
    document.getElementById('bossHpText').textContent = fmt(Math.max(0, effectiveHp)) + ' / ' + fmt(effectiveMaxHp);

    // Afficher le nombre de joueurs
    const playerCountEl = document.getElementById('bossPlayerCount');
    if (playerCountEl) {
      playerCountEl.textContent = '👥 ' + numPlayers + ' joueur' + (numPlayers > 1 ? 's' : '');
    }

    // Update DPS display
    const dpsEl = document.getElementById('bossDpsDisplay');
    if (dpsEl) dpsEl.textContent = fmt(getDPS()) + ' DPS';

    // Timer
    if (worldBossState.boss.endsAt) {
      const remaining = Math.max(0, worldBossState.boss.endsAt - Date.now());
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      document.getElementById('bossTimer').textContent = '⏱️ ' + mins + ':' + secs.toString().padStart(2, '0');
    }

    // My stats
    document.getElementById('myBossDmg').textContent = fmt(worldBossState.myDamage);
    const pct = effectiveMaxHp > 0 ? (worldBossState.myDamage / effectiveMaxHp * 100) : 0;
    document.getElementById('myBossPercent').textContent = pct.toFixed(2) + '%';

    const myRank = firebaseUser ? worldBossState.participants.findIndex(p => p.uid === firebaseUser.uid) + 1 : 0;
    document.getElementById('myBossRank').textContent = myRank > 0 ? '#' + myRank : '#--';

    updateBossLeaderboard();

  } else if (worldBossState.status === 'victory') {
    victory.style.display = 'block';
    hideBossNotification();

    const myRank = firebaseUser ? worldBossState.participants.findIndex(p => p.uid === firebaseUser.uid) + 1 : 0;
    let rewardText = '';
    if (myRank > 0 && worldBossState.myDamage > 0) {
      const totalPlayers = worldBossState.participants.length;
      const effectiveMaxHp = worldBossState.effectiveMaxHp || worldBossState.boss?.maxHp || WORLD_BOSS_CONFIG.baseHp;
      const damagePercent = Math.min((worldBossState.myDamage / effectiveMaxHp) * 100, 100);

      // Récompense dégâts
      let totalGems = Math.floor(damagePercent * WORLD_BOSS_CONFIG.damageRewards.perPercent.gems);
      let totalGold = Math.floor(damagePercent * WORLD_BOSS_CONFIG.damageRewards.perPercent.gold);

      // Bonus victoire
      let bonus = WORLD_BOSS_CONFIG.victoryBonus.participation;
      if (myRank === 1) bonus = WORLD_BOSS_CONFIG.victoryBonus.top1;
      else if (myRank <= 3) bonus = WORLD_BOSS_CONFIG.victoryBonus.top3;
      else if (myRank <= Math.ceil(totalPlayers * 0.1)) bonus = WORLD_BOSS_CONFIG.victoryBonus.top10Percent;
      else if (myRank <= Math.ceil(totalPlayers * 0.5)) bonus = WORLD_BOSS_CONFIG.victoryBonus.top50Percent;

      totalGems += bonus.gems;
      totalGold += bonus.gold;

      rewardText = '🏆 Rang #' + myRank + ' — ' + damagePercent.toFixed(2) + '% dégâts\\n💎 ' + totalGems + ' gems + 🪙 ' + fmt(totalGold) + ' gold\\n(dont bonus victoire: +' + bonus.gems + ' 💎 +' + fmt(bonus.gold) + ' 🪙)';
    } else {
      rewardText = 'Tu n\\'as pas participé';
    }
    document.getElementById('bossRewardText').innerHTML = rewardText.replace(/\\n/g, '<br>');

    const claimBtn = document.getElementById('bossClaimBtn');
    const alreadyClaimed = document.getElementById('bossAlreadyClaimed');
    if (worldBossState.claimed || myRank === 0) {
      claimBtn.style.display = 'none';
      alreadyClaimed.style.display = 'block';
    } else {
      claimBtn.style.display = 'inline-block';
      alreadyClaimed.style.display = 'none';
    }

  } else if (worldBossState.status === 'expired') {
    expired.style.display = 'block';
    hideBossNotification();

    // Calculer et afficher les récompenses même si expiré
    const effectiveMaxHp = worldBossState.effectiveMaxHp || worldBossState.boss?.maxHp || WORLD_BOSS_CONFIG.baseHp;
    const damagePercent = Math.min((worldBossState.myDamage / effectiveMaxHp) * 100, 100);
    const estGems = Math.floor(damagePercent * WORLD_BOSS_CONFIG.damageRewards.perPercent.gems);
    const estGold = Math.floor(damagePercent * WORLD_BOSS_CONFIG.damageRewards.perPercent.gold);

    const expiredRewardText = document.getElementById('bossExpiredRewardText');
    if (expiredRewardText) {
      if (worldBossState.myDamage > 0) {
        expiredRewardText.textContent = 'Tes dégâts: ' + fmt(worldBossState.myDamage) + ' (' + damagePercent.toFixed(2) + '%) → ' + estGems + ' 💎 + ' + fmt(estGold) + ' 🪙';
      } else {
        expiredRewardText.textContent = 'Tu n\\'as pas participé';
      }
    }

    const expiredClaimBtn = document.getElementById('bossExpiredClaimBtn');
    const expiredAlreadyClaimed = document.getElementById('bossExpiredAlreadyClaimed');
    if (worldBossState.claimed || worldBossState.myDamage <= 0) {
      if (expiredClaimBtn) expiredClaimBtn.style.display = 'none';
      if (expiredAlreadyClaimed) expiredAlreadyClaimed.style.display = worldBossState.myDamage > 0 ? 'block' : 'none';
    } else {
      if (expiredClaimBtn) expiredClaimBtn.style.display = 'inline-block';
      if (expiredAlreadyClaimed) expiredAlreadyClaimed.style.display = 'none';
    }

  } else {
    waiting.style.display = 'block';
    hideBossNotification();

    if (firebaseUser) {
      document.getElementById('bossLoginPrompt').style.display = 'none';
    }
  }

  updateBossCountdown();
}

// ============ BOSS BATTLE CANVAS RENDERER ============

// Wizard sprite (same as BattleScene)
const BOSS_WIZARD_SPRITE = {
  palette: ['#00000000', '#0a0a12', '#1a1a2e', '#2d2d4a', '#3d3d5c', '#4a4a6e', '#d4c4b0', '#b8a898', '#2a2a3a', '#6af', '#4cf'],
  pixels: [
    [0,0,0,0,0,0,0,0,0,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,8,8,7,7,7,7,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,8,7,6,6,6,6,7,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,8,7,6,6,6,6,7,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,7,6,6,6,6,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,7,6,6,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,3,3,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,3,3,4,3,3,2,2,1,0,0,0,0,0,9,10,9,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,3,3,4,4,4,3,3,2,1,0,0,0,9,10,10,10,9,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,3,4,4,4,4,4,3,2,2,6,6,9,10,10,9,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,4,4,5,4,4,3,3,6,6,9,10,9,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,4,4,5,5,5,4,4,3,6,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,4,4,5,5,5,4,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,4,4,4,5,4,4,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,4,4,4,4,4,3,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,3,3,4,4,4,3,3,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,3,3,3,4,3,3,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,3,3,3,3,3,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,2,3,3,3,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,2,3,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,2,2,2,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,2,0,0,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,2,0,0,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ]
};

// Boss sprites (dark lord style)
const BOSS_MONSTER_SPRITE = {
  palette: ['#00000000','#1a0a1a','#2a1a2a','#3a2a3a','#5a3a5a','#7a4a7a','#ff0000','#00ff00','#ffcc00'],
  pixels: [
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,3,3,3,6,6,3,3,3,6,6,3,3,3,3,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,3,3,3,6,7,3,3,3,6,7,3,3,3,3,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,3,3,3,3,4,4,4,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,3,3,3,4,4,4,4,4,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,2,3,3,3,3,3,3,3,4,4,4,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0],
    [0,0,0,0,1,2,3,3,4,4,4,4,3,3,3,3,3,4,4,4,4,3,3,3,2,1,0,0,0,0,0,0],
    [0,0,0,1,2,3,3,4,4,5,5,4,4,3,3,3,4,4,5,5,4,4,3,3,3,2,1,0,0,0,0,0],
    [0,0,0,1,2,3,3,4,5,5,5,5,4,3,3,3,4,5,5,5,5,4,3,3,3,2,1,0,0,0,0,0],
    [0,0,0,1,2,3,3,3,4,5,5,4,3,3,3,3,3,4,5,5,4,3,3,3,3,2,1,0,0,0,0,0],
    [0,0,0,1,2,3,3,3,3,4,4,3,3,3,3,3,3,3,4,4,3,3,3,3,3,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0],
    [0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,3,3,3,3,3,3,3,3,3,3,2,2,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
  ]
};

// Canvas state
let bossCanvasCtx = null;
let bossAnimFrame = 0;
let bossHitFlash = 0;
let bossFloatOffset = 0;
let bossDamageNumbers = [];
let bossRenderScheduled = false;
let bossLastRenderTime = 0;
const BOSS_RENDER_MIN_INTERVAL = 50; // Max 20 FPS for boss canvas
const spriteCache = new Map(); // Cache for rendered sprites

// Boss UI throttling
let bossUIUpdateScheduled = false;
let bossUILastUpdateTime = 0;
const BOSS_UI_MIN_INTERVAL = 100; // Max 10 updates/sec for boss UI
let bossCanvasRunning = false; // Track if boss canvas loop is running
let bossPlayerPositions = [];

function initBossCanvas() {
  const canvas = document.getElementById('bossCanvas');
  if (!canvas) return;
  bossCanvasCtx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 220;
}

function getCachedSprite(sprite, scale, flash = false) {
  const cacheKey = JSON.stringify({ p: sprite.palette, s: scale, f: flash });
  if (spriteCache.has(cacheKey)) return spriteCache.get(cacheKey);

  const { palette, pixels } = sprite;
  const w = pixels[0].length * scale;
  const h = pixels.length * scale;
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const offCtx = offscreen.getContext('2d');

  for (let row = 0; row < pixels.length; row++) {
    for (let col = 0; col < pixels[row].length; col++) {
      const colorIndex = pixels[row][col];
      if (colorIndex === 0) continue;
      offCtx.fillStyle = flash ? '#ffffff' : palette[colorIndex];
      offCtx.fillRect(col * scale, row * scale, scale, scale);
    }
  }

  // Limit cache size
  if (spriteCache.size > 50) {
    const firstKey = spriteCache.keys().next().value;
    spriteCache.delete(firstKey);
  }
  spriteCache.set(cacheKey, offscreen);
  return offscreen;
}

function drawSprite(ctx, sprite, x, y, scale = 1, flash = false) {
  const cached = getCachedSprite(sprite, scale, flash);
  ctx.drawImage(cached, x, y);
}

function renderBossCanvas() {
  if (!bossCanvasCtx) initBossCanvas();
  if (!bossCanvasCtx) return;

  const ctx = bossCanvasCtx;
  const canvas = ctx.canvas;
  const W = canvas.width;
  const H = canvas.height;

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#0a0515');
  bgGrad.addColorStop(0.5, '#1a0a2e');
  bgGrad.addColorStop(1, '#0f0a1a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Floor
  ctx.fillStyle = '#151020';
  ctx.fillRect(0, H - 50, W, 50);
  ctx.strokeStyle = 'rgba(212,168,67,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H - 50);
  ctx.lineTo(W, H - 50);
  ctx.stroke();

  // Update animations
  bossAnimFrame++;
  bossFloatOffset = Math.sin(bossAnimFrame * 0.05) * 5;
  if (bossHitFlash > 0) bossHitFlash--;

  // Draw boss
  if (worldBossState.boss) {
    const bossScale = 3;
    const bossX = W / 2 - (32 * bossScale) / 2;
    const bossY = 20 + bossFloatOffset;

    // Boss glow
    ctx.shadowColor = bossHitFlash > 0 ? '#ffffff' : '#ff0000';
    ctx.shadowBlur = bossHitFlash > 0 ? 30 : 15;

    drawSprite(ctx, BOSS_MONSTER_SPRITE, bossX, bossY, bossScale, bossHitFlash > 0);

    ctx.shadowBlur = 0;
  }

  // Draw players
  const participants = worldBossState.participants;
  const maxVisible = 10;
  const visible = participants.slice(0, maxVisible);
  const playerScale = 1.5;
  const playerSpacing = Math.min(35, (W - 40) / Math.max(visible.length, 1));
  const startX = W / 2 - (visible.length * playerSpacing) / 2;

  bossPlayerPositions = [];

  visible.forEach((p, i) => {
    const px = startX + i * playerSpacing;
    const py = H - 80;

    bossPlayerPositions.push({ uid: p.uid, x: px, y: py });

    // Player glow for current user
    if (firebaseUser && p.uid === firebaseUser.uid) {
      ctx.shadowColor = '#ce93d8';
      ctx.shadowBlur = 10;
    }

    drawSprite(ctx, BOSS_WIZARD_SPRITE, px, py, playerScale);
    ctx.shadowBlur = 0;
  });

  // Draw damage numbers
  bossDamageNumbers = bossDamageNumbers.filter(dmg => {
    dmg.y -= 1.5;
    dmg.alpha -= 0.02;

    if (dmg.alpha <= 0) return false;

    ctx.globalAlpha = dmg.alpha;
    ctx.font = 'bold 14px Cinzel, serif';
    ctx.fillStyle = '#ff6b6b';
    ctx.textAlign = 'center';
    ctx.fillText('-' + fmt(dmg.value), dmg.x, dmg.y);
    ctx.globalAlpha = 1;

    return true;
  });

  // Update player labels (only every 500ms)
  if (!window._lastLabelUpdate || performance.now() - window._lastLabelUpdate > 500) {
    window._lastLabelUpdate = performance.now();
    updateBossPlayerLabels(visible);
  }

  // Continue animation only if on boss panel and boss active (15 FPS)
  if (worldBossState.status === 'active' && activePanel === 'boss' && bossCanvasRunning) {
    setTimeout(() => requestAnimationFrame(renderBossCanvas), 66);
  } else {
    bossCanvasRunning = false;
  }
}

let lastPlayerLabelsHash = '';

function updateBossPlayerLabels(participants) {
  const container = document.getElementById('bossPlayerLabels');
  if (!container) return;

  const maxVisible = 10;
  const visible = participants.slice(0, maxVisible);
  const extraCount = Math.max(0, worldBossState.participants.length - maxVisible);

  // Only rebuild if participants changed
  const hash = visible.map(p => p.uid).join(',') + '|' + extraCount;
  if (hash === lastPlayerLabelsHash) return;
  lastPlayerLabelsHash = hash;

  let html = '';
  visible.forEach((p) => {
    const isMe = firebaseUser && p.uid === firebaseUser.uid;
    const name = (p.visibleName || p.displayName || 'Sorcier').substring(0, 8);
    html += '<span class="boss-player-label ' + (isMe ? 'me' : '') + '">' + name + '</span>';
  });

  if (extraCount > 0) {
    html += '<span class="boss-player-label">+' + extraCount + '</span>';
  }

  container.innerHTML = html;
}

function updateBossArenaPlayers() {
  // Only render when on boss panel and boss is active
  if (worldBossState.status !== 'active') return;
  if (activePanel !== 'boss') return;

  // Start canvas loop if not already running
  if (!bossCanvasRunning) {
    bossCanvasRunning = true;
    initBossCanvas();
    requestAnimationFrame(renderBossCanvas);
  }
}

// Animation d'attaque pour un joueur dans l'arène
function animateBossPlayerAttack(uid) {
  // Flash effect handled in canvas render
}

// Animation de dégât sur le boss
function showBossDamageNumber(damage) {
  bossHitFlash = 10;
  bossDamageNumbers.push({
    value: damage,
    x: 200 + (Math.random() - 0.5) * 40,
    y: 80,
    alpha: 1
  });
}

let lastLeaderboardHash = '';

function updateBossLeaderboard() {
  const el = document.getElementById('bossLeaderboard');
  if (!el) return;

  // Only update if data changed (compare hash of top 10 uids + damage rounded)
  const top = worldBossState.participants.slice(0, 10);
  const hash = top.map(p => p.uid + ':' + Math.floor(p.damage / 1000000)).join('|');
  if (hash === lastLeaderboardHash) return;
  lastLeaderboardHash = hash;

  let html = '';
  top.forEach((p, i) => {
    const isMe = firebaseUser && p.uid === firebaseUser.uid;
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
    html += '<div class="boss-leaderboard-entry ' + (isMe ? 'me' : '') + '">';
    html += '<span class="rank">' + medal + '#' + (i + 1) + '</span>';
    html += '<span class="name">' + (p.visibleName || p.displayName || 'Sorcier') + '</span>';
    html += '<span class="damage">' + fmt(p.damage) + '</span>';
    html += '</div>';
  });

  if (top.length === 0) {
    html = '<div style="text-align:center;color:#666;padding:10px;">Aucun participant</div>';
  }

  el.innerHTML = html;
}

function updateBossCountdown() {
  const countdownEl = document.getElementById('bossCountdown');
  const nextEl = document.getElementById('bossNextCountdown');
  const expiredEl = document.getElementById('bossExpiredCountdown');
  const navTimerEl = document.getElementById('bossNavTimer');

  // Si boss actif, afficher LIVE dans la navbar
  if (worldBossState.status === 'active') {
    if (navTimerEl) navTimerEl.textContent = '';
    return;
  }

  if (worldBossState.nextSpawn) {
    const remaining = Math.max(0, worldBossState.nextSpawn - Date.now());
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const timeStr = mins + ':' + secs.toString().padStart(2, '0');

    if (countdownEl) countdownEl.textContent = timeStr;
    if (nextEl) nextEl.textContent = 'Prochain boss dans ' + timeStr;
    if (navTimerEl) navTimerEl.textContent = timeStr;
    if (expiredEl) expiredEl.textContent = 'Prochain boss dans ' + timeStr;
  } else {
    // No nextSpawn set - show waiting message
    if (countdownEl) countdownEl.textContent = 'Bientôt...';
    if (nextEl) nextEl.textContent = 'Prochain boss bientôt...';
    if (expiredEl) expiredEl.textContent = 'Prochain boss bientôt...';
    if (navTimerEl) navTimerEl.textContent = '⏳';
  }
}

function updateBossAttackButton() {
  const btn = document.getElementById('bossAttackBtn');
  const cdEl = document.getElementById('bossAttackCD');
  if (!btn || !cdEl) return;

  if (worldBossState.attackCD > 0) {
    btn.disabled = true;
    cdEl.textContent = worldBossState.attackCD.toFixed(1) + 's';
  } else {
    btn.disabled = !firebaseUser;
    cdEl.textContent = '';
  }
}

function tickWorldBoss(dt) {
  // Auto-attaque du boss
  if (worldBossState.status === 'active' && firebaseUser && firebaseDb) {
    worldBossState.attackCD = (worldBossState.attackCD || 0) - dt;

    if (worldBossState.attackCD <= 0) {
      // Reset cooldown
      worldBossState.attackCD = WORLD_BOSS_CONFIG.attackCooldown;

      // Calculer et envoyer les dégâts automatiquement
      autoAttackBoss();
    }
  }

  // Update timer if boss active
  if (worldBossState.status === 'active' && worldBossState.boss && worldBossState.boss.endsAt) {
    const remaining = Math.max(0, worldBossState.boss.endsAt - Date.now());
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const timerEl = document.getElementById('bossTimer');
    if (timerEl) timerEl.textContent = '⏱️ ' + mins + ':' + secs.toString().padStart(2, '0');

    // Check if time expired locally
    if (remaining <= 0 && worldBossState.boss.hp > 0) {
      worldBossState.status = 'expired';
      updateBossUI();
    }
  }

  // Update countdown
  if (worldBossState.status !== 'active') {
    updateBossCountdown();
  }
}

// Auto-attaque silencieuse (sans animation à chaque coup)
let lastBossDamageSync = 0;
let pendingBossDamage = 0;

async function autoAttackBoss() {
  if (!firebaseUser || !firebaseDb || !worldBossState.active) return;

  // Calculer les dégâts (DPS * cooldown)
  const damage = Math.floor(getDPS() * WORLD_BOSS_CONFIG.attackCooldown);

  // Accumuler les dégâts localement
  pendingBossDamage += damage;
  worldBossState.myDamage += damage;

  // Mettre à jour le boss HP localement
  if (worldBossState.boss) {
    worldBossState.boss.hp = Math.max(0, worldBossState.boss.hp - damage);
  }

  // Sync avec Firebase toutes les 2 secondes (pour éviter trop de requêtes)
  const now = Date.now();
  if (now - lastBossDamageSync >= 2000) {
    lastBossDamageSync = now;

    // Afficher l'animation d'attaque et dégâts
    if (pendingBossDamage > 0) {
      animateBossPlayerAttack(firebaseUser.uid);
      showBossDamageNumber(pendingBossDamage);
    }

    try {
      // Update player damage
      const playerRef = firebaseDb.ref('worldBoss/participants/' + firebaseUser.uid);
      const snap = await playerRef.get();
      const current = snap.val() || { damage: 0 };

      await playerRef.set({
        displayName: firebaseUser.displayName || 'Sorcier',
        visibleName: worldBossState.myDisplayName || firebaseUser.displayName || 'Sorcier',
        damage: current.damage + pendingBossDamage,
        lastHit: now,
        zone: G.currentZone,
      });

      // Update boss HP
      await firebaseDb.ref('worldBoss/current/hp').transaction((currentHp) => {
        if (currentHp === null) return currentHp;
        return Math.max(0, currentHp - pendingBossDamage);
      });

      pendingBossDamage = 0;

      // Check if boss defeated
      if (worldBossState.boss && worldBossState.boss.hp <= 0) {
        await endWorldBoss('victory');
      }
    } catch (e) {
      console.error('Boss sync error:', e);
    }
  }

  updateBossUI();
}

function rebuildBoss() {
  updateBossUI();
  // Start canvas loop if boss is active and we just switched to boss panel
  if (worldBossState.status === 'active' && !bossCanvasRunning) {
    bossCanvasRunning = true;
    initBossCanvas();
    requestAnimationFrame(renderBossCanvas);
  }
}

// ============ DEV: SPAWN TEST BOSS ============
async function spawnTestBoss() {
  if (!firebaseDb) {
    toast('❌ Firebase non connecté');
    return;
  }

  // Reset alert pour revoir la bannière
  bossAlertShown = false;

  const bosses = [
    { id: 'voldemort', name: 'Lord Voldemort', icon: '🐍', hpMult: 1.0 },
    { id: 'grindelwald', name: 'Grindelwald', icon: '⚡', hpMult: 1.2 },
    { id: 'basilisk', name: 'Basilic', icon: '🐉', hpMult: 0.8 },
    { id: 'dementor_king', name: 'Roi Détraqueur', icon: '👻', hpMult: 1.5 },
    { id: 'dragon', name: 'Magyar à Pointes', icon: '🔥', hpMult: 1.3 },
  ];

  const boss = bosses[Math.floor(Math.random() * bosses.length)];
  const now = Date.now();
  const hp = Math.floor(WORLD_BOSS_CONFIG.baseHp * boss.hpMult);
  const duration = WORLD_BOSS_CONFIG.duration;

  try {
    await firebaseDb.ref('worldBoss/current').set({
      id: boss.id,
      name: boss.name,
      icon: boss.icon,
      hp: hp,
      maxHp: hp,
      startedAt: now,
      endsAt: now + duration,
      status: 'active',
    });

    await firebaseDb.ref('worldBoss/participants').remove();
    await firebaseDb.ref('worldBoss/claims').remove();
    await firebaseDb.ref('worldBoss/nextSpawn').set(now + WORLD_BOSS_CONFIG.spawnInterval);

    toast('⚔️ Boss ' + boss.name + ' invoqué !');
  } catch (e) {
    console.error('Error spawning boss:', e);
    toast('❌ Erreur: ' + e.message);
  }
}

// Expose to window for console testing
window.spawnTestBoss = spawnTestBoss;

// ============ CUSTOM PSEUDO & AVATAR ============
function promptChangeName() {
  if (!firebaseUser) return;

  const currentName = localStorage.getItem('wandidle_username') || worldBossState.myDisplayName || 'Sorcier';
  const newName = prompt('Entre ton pseudo pour le World Boss:', currentName);

  if (newName && newName.trim().length > 0 && newName.trim().length <= 20) {
    const cleanName = newName.trim();
    localStorage.setItem('wandidle_username', cleanName);
    worldBossState.myDisplayName = cleanName;

    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = cleanName; // Plus de stylo car pseudo personnalisé

    toast('✅ Pseudo: ' + cleanName);
  } else if (newName !== null) {
    toast('❌ Pseudo invalide (1-20 caractères)');
  }
}

function promptChangeAvatar() {
  if (!firebaseUser) return;

  const currentAvatar = localStorage.getItem('wandidle_avatar') || '';
  const newAvatar = prompt('Colle l\\'URL de ton avatar Discord:\\n(Clic droit sur ton avatar Discord → Copier le lien)', currentAvatar);

  if (newAvatar && newAvatar.trim().startsWith('http')) {
    const cleanUrl = newAvatar.trim();
    localStorage.setItem('wandidle_avatar', cleanUrl);

    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
      avatarEl.src = cleanUrl;
      avatarEl.style.display = 'block';
    }

    toast('✅ Avatar mis à jour !');
  } else if (newAvatar !== null && newAvatar.trim() !== '') {
    toast('❌ URL invalide');
  }
}

// Load saved profile on init
function loadSavedProfile() {
  const savedName = localStorage.getItem('wandidle_username');
  if (savedName) {
    worldBossState.myDisplayName = savedName;
  }

  const savedAvatar = localStorage.getItem('wandidle_avatar');
  if (savedAvatar) {
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
      avatarEl.src = savedAvatar;
      avatarEl.style.display = 'block';
    }
  }
}

// ============ OFFLINE ============
function calcOffline() {
  if (!G.lastTick) return;
  const elapsed = (Date.now() - G.lastTick) / 1000;
  if (elapsed < 5) return;
  const capped = Math.min(elapsed, 3600 * 8);
  const goldGain = getGoldPerSec() * capped;
  G.gold += goldGain;
  G.totalGoldEarned += goldGain;
  const zone = ZONES[G.currentZone] || ZONES[ZONES.length - 1];
  const dps = getDPS();
  const estKills = Math.floor(dps * capped / zone.mob.hp);
  G.kills += estKills;
  G.totalKills += estKills;
  G.talentPoints += Math.floor(estKills / 5);
  const mins = Math.floor(capped / 60);
  if (mins > 0) toast('⏳ +' + fmt(goldGain) + ' 🪙 en ' + mins + ' min hors-ligne');
}

// ============ INIT ============
if (load()) {
  if (!G.spellCDs) G.spellCDs = { stupefix: 0, confringo: 0, patronus: 0 };
  if (!G.spellLevels) G.spellLevels = { stupefix: 1, confringo: 1, patronus: 1 };
  if (G.highestZone === undefined) G.highestZone = G.currentZone;
  if (!G.startTime) G.startTime = Date.now();
  if (G.rebirth === undefined) {
    // Migrate old prestige saves: old prestige 1/2 → rebirth 1/2
    if (G.prestige >= 2) { G.rebirth = 2; G.rebirthMult = 3.0; G.prestige = 0; G.prestigeMult = 1; }
    else if (G.prestige >= 1) { G.rebirth = 1; G.rebirthMult = 1.5; G.prestige = 0; G.prestigeMult = 1; }
    else { G.rebirth = 0; G.rebirthMult = 1; }
  }
  // Safety: if player already unlocked zones past a wall, grant the rebirth
  if (G.unlockedZones > 20 && G.rebirth < 2) { G.rebirth = 2; G.rebirthMult = 3.0; }
  else if (G.unlockedZones > 10 && G.rebirth < 1) { G.rebirth = 1; G.rebirthMult = 1.5; }
  if (G.prestigeMult === undefined) G.prestigeMult = 1;
  if (!G.ownedPets) G.ownedPets = [];
  if (G.activePet === undefined) G.activePet = null;
  if (!G.petLevels) G.petLevels = {};
  if (!G.shopUnlocks) G.shopUnlocks = [];
  if (!G.shopBuys) G.shopBuys = {};
  if (!G.buffs) G.buffs = {};
  if (G.autoAdvanceEnabled === undefined) G.autoAdvanceEnabled = true;
  // Fix: réparer TOUS les sorts (base + avada si débloqué)
  ['stupefix', 'confringo', 'patronus'].forEach(id => {
    if (!G.spellLevels[id] || isNaN(G.spellLevels[id])) G.spellLevels[id] = 1;
    if (G.spellCDs[id] === undefined || isNaN(G.spellCDs[id])) G.spellCDs[id] = 0;
  });
  if (G.shopUnlocks.includes('spell4')) {
    if (!G.spellLevels['avada'] || isNaN(G.spellLevels['avada'])) G.spellLevels['avada'] = 1;
    if (G.spellCDs['avada'] === undefined || isNaN(G.spellCDs['avada'])) G.spellCDs['avada'] = 0;
  }
  // Fix: réparer gold/gems/etc si NaN
  if (isNaN(G.gold) || G.gold === undefined || G.gold === null) G.gold = 0;
  if (isNaN(G.gems) || G.gems === undefined || G.gems === null) G.gems = 0;
  if (isNaN(G.talentPoints) || G.talentPoints === undefined || G.talentPoints === null) G.talentPoints = 0;
  if (isNaN(G.kills) || G.kills === undefined) G.kills = 0;
  if (isNaN(G.totalKills) || G.totalKills === undefined) G.totalKills = 0;
  if (isNaN(G.totalGoldEarned) || G.totalGoldEarned === undefined) G.totalGoldEarned = 0;
  if (isNaN(G.rebirthMult) || G.rebirthMult === undefined) G.rebirthMult = 1;
  if (isNaN(G.prestigeMult) || G.prestigeMult === undefined) G.prestigeMult = 1;
  // Init pet levels for already owned pets
  G.ownedPets.forEach(id => { if (!G.petLevels[id]) G.petLevels[id] = 1; });
  // Init missing talents (for new talents added in updates)
  TALENTS.forEach(t => { if (G.talents[t.id] === undefined) G.talents[t.id] = 0; });

  // ===== MIGRATION: Initialize new systems for old saves =====
  // Eternals
  if (G.starDust === undefined) G.starDust = 0;
  if (G.totalStarDust === undefined) G.totalStarDust = 0;
  if (!G.relics) G.relics = {};
  if (G.infinityPrestige === undefined) G.infinityPrestige = 0;
  if (G.infinityMult === undefined) G.infinityMult = 1;
  // Shiny Pets
  if (!G.shinyPets) G.shinyPets = [];
  // Multi-pets: migrate old activePet to new activePets array
  if (!G.activePets) {
    G.activePets = G.activePet ? [G.activePet] : [];
  }
  if (G.petSlots === undefined) G.petSlots = 1;
  // Achievements
  if (!G.achievements) G.achievements = [];
  if (!G.achievementProgress) G.achievementProgress = {};
  // Daily challenges
  if (!G.dailyChallenges) G.dailyChallenges = [];
  if (!G.lastDailyReset) G.lastDailyReset = 0;
  // Spell tracking
  if (!G.spellsCast) G.spellsCast = {};
  // Zone completion times
  if (!G.zoneCompletionTimes) G.zoneCompletionTimes = {};
  if (!G.zone25FirstClear) G.zone25FirstClear = 0;

  calcOffline();
  spawnMob();
} else {
  G = defaultState();
  spawnMob();
}

rebuildSpellBar();
rebuildHeroRecap();
save();

// Wait for battleAPI to be ready, then set initial zone
const waitForBattleAPI = setInterval(() => {
  if (window.battleAPI) {
    window.battleAPI.setZone(G.currentZone);
    clearInterval(waitForBattleAPI);
  }
}, 100);

// Check for new patch notes
checkPatchNotes();

// Initialize Firebase for World Boss
initFirebase();

// Request notification permission for boss alerts
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Placer la battle area dans son placeholder initial
const battleArea = document.getElementById('battleArea');
const placeholder = document.getElementById('battleAreaPlaceholder');
if (battleArea && placeholder) {
  placeholder.appendChild(battleArea);
}

requestAnimationFrame(tick);
`;
    document.body.appendChild(script);

    return () => {
      style.remove();
      script.remove();
    };
  }, []);

  return (
    <>
      <div ref={containerRef} />
      <BattleScenePortal onReady={handleBattleReady} />
    </>
  );
}

// Portal component to render BattleScene into the injected HTML
function BattleScenePortal({ onReady }: { onReady: (api: BattleAPI) => void }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const checkContainer = () => {
      const el = document.getElementById('battleSceneContainer');
      if (el) {
        setContainer(el);
      } else {
        setTimeout(checkContainer, 100);
      }
    };
    checkContainer();
  }, []);

  if (!container) return null;

  return ReactDOM.createPortal(
    <BattleScene onReady={onReady} />,
    container
  );
}
