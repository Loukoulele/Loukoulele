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
  --parchment: #f5e6c8;
  --dark: #1a1a2e;
  --darker: #0f0f1a;
  --darkest: #080812;
  --red: #c62828;
  --green: #2e7d32;
  --blue: #1565c0;
  --purple: #6a1b9a;
  --accent: #ff9800;
}

* { margin:0; padding:0; box-sizing:border-box; }

body { font-family:'Crimson Text',serif; background:var(--darkest); color:var(--parchment); min-height:100vh; overflow-x:hidden; user-select:none; }

.top-bar { background:linear-gradient(180deg, rgba(35,30,50,0.98), rgba(20,15,35,0.98)); border-bottom:2px solid var(--gold-dark); padding:8px 15px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:100; box-shadow:0 2px 15px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(212,168,67,0.1); }
.game-logo { font-family:'Cinzel',serif; color:var(--gold); font-size:1.1em; text-shadow:0 0 15px rgba(212,168,67,0.3); display:flex; align-items:center; gap:10px; }
.patch-note-btn { background:none; border:none; font-size:1.1em; cursor:pointer; position:relative; opacity:0.7; transition:opacity 0.2s, transform 0.2s; }
.patch-note-btn:hover { opacity:1; transform:scale(1.1); }
.patch-note-btn.has-new::after { content:''; position:absolute; top:-2px; right:-2px; width:8px; height:8px; background:#ff4444; border-radius:50%; animation:pulse-dot 1.5s infinite; }
@keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.3);opacity:0.7;} }
.patch-modal { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:1000; justify-content:center; align-items:center; }
.patch-modal.show { display:flex; }
.patch-content { background:linear-gradient(180deg,var(--dark),var(--darker)); border:2px solid var(--gold-dark); border-radius:12px; max-width:450px; width:90%; max-height:80vh; overflow-y:auto; box-shadow:0 0 40px rgba(212,168,67,0.2); }
.patch-header { padding:15px 20px; border-bottom:1px solid var(--gold-dark); display:flex; justify-content:space-between; align-items:center; }
.patch-header h2 { font-family:'Cinzel',serif; color:var(--gold); font-size:1.2em; margin:0; }
.patch-close { background:none; border:none; color:var(--parchment); font-size:1.5em; cursor:pointer; opacity:0.7; }
.patch-close:hover { opacity:1; }
.patch-body { padding:20px; }
.patch-version { color:var(--gold); font-family:'Cinzel',serif; font-size:0.9em; margin-bottom:15px; }
.patch-section { margin-bottom:15px; }
.patch-section h3 { color:var(--accent); font-size:0.95em; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
.patch-section ul { list-style:none; padding-left:5px; }
.patch-section li { color:var(--parchment); font-size:0.85em; margin-bottom:6px; padding-left:15px; position:relative; }
.patch-section li::before { content:'•'; position:absolute; left:0; color:var(--gold-dark); }
.currency-bar { display:flex; gap:12px; align-items:center; }
.currency { display:flex; align-items:center; gap:5px; font-size:0.95em; background:linear-gradient(145deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)); border:1px solid rgba(212,168,67,0.2); border-radius:20px; padding:5px 12px 5px 8px; }
.currency .c-icon { font-size:1.15em; }
.currency .c-val { color:var(--gold); font-weight:700; font-family:'Cinzel',serif; text-shadow:0 0 8px rgba(212,168,67,0.3); }
.currency .c-ps { color:#666; font-size:0.75em; margin-left:2px; }

.nav { display:flex; background:linear-gradient(180deg, rgba(30,25,40,0.98), rgba(15,12,25,0.98)); border-bottom:2px solid var(--gold-dark); position:sticky; top:42px; z-index:100; padding:4px 2px; gap:2px; box-shadow:0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,168,67,0.1); }
.nav-btn { flex:1; padding:10px 4px; background:linear-gradient(180deg, rgba(40,35,55,0.6), rgba(25,20,40,0.8)); border:1px solid rgba(212,168,67,0.15); border-radius:6px; color:#888; font-family:'Cinzel',serif; font-size:0.85em; cursor:pointer; transition:all 0.25s ease; display:flex; flex-direction:column; align-items:center; gap:3px; position:relative; overflow:hidden; }
.nav-btn::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, rgba(212,168,67,0.3), transparent); }
.nav-btn .nav-icon { font-size:1.5em; transition:transform 0.2s, filter 0.2s; }
.nav-btn .nav-label { font-size:0.9em; letter-spacing:0.5px; }
.nav-btn:hover { color:var(--parchment); background:linear-gradient(180deg, rgba(60,50,80,0.7), rgba(35,28,55,0.9)); border-color:rgba(212,168,67,0.3); transform:translateY(-1px); }
.nav-btn:hover .nav-icon { transform:scale(1.1); }
.nav-btn.active { color:var(--gold); background:linear-gradient(180deg, rgba(212,168,67,0.2), rgba(160,120,48,0.1)); border-color:var(--gold); box-shadow:0 0 12px rgba(212,168,67,0.3), inset 0 0 20px rgba(212,168,67,0.05); }
.nav-btn.active::after { content:''; position:absolute; bottom:-2px; left:20%; right:20%; height:2px; background:var(--gold); border-radius:2px; box-shadow:0 0 8px var(--gold); }
.nav-btn.active .nav-icon { filter:drop-shadow(0 0 4px rgba(212,168,67,0.6)); }
.nav-notif { position:absolute; top:2px; right:2px; background:var(--red); color:#fff; font-size:0.5em; font-weight:bold; min-width:14px; height:14px; border-radius:50%; display:flex; align-items:center; justify-content:center; animation:pulse-dot 1.5s infinite; }
@media (max-width:600px) { .nav-btn { padding:8px 2px; } .nav-btn .nav-icon { font-size:1.3em; } .nav-btn .nav-label { font-size:0.75em; } }

.main { max-width:900px; margin:0 auto; padding:10px; }
.panel { display:none; }
.panel.active { display:block; padding-bottom:80px; }

.zone-header { text-align:center; padding:10px; background:linear-gradient(180deg,rgba(106,27,154,0.15),transparent); border-radius:10px; margin-bottom:10px; }
.zone-name { font-family:'Cinzel',serif; color:var(--gold); font-size:1.3em; }
.zone-desc { color:#888; font-size:0.85em; }
.zone-progress { font-size:0.75em; color:#666; margin-top:3px; }

.battle-area { position:relative; border:1px solid rgba(212,168,67,0.15); border-radius:12px; overflow:hidden; margin-bottom:10px; transition: all 0.3s ease; }

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
.mob-info-bar { text-align:center; padding:8px; background:rgba(0,0,0,0.5); }
.mob-info-bar .mob-name { font-family:'Cinzel',serif; color:var(--gold); font-size:1em; margin-bottom:4px; }
.mob-info-bar .mob-hp-bar { width:200px; height:12px; background:#1a1a1a; border-radius:6px; margin:0 auto; border:1px solid rgba(212,168,67,0.3); overflow:hidden; }
.mob-info-bar .mob-hp-fill { height:100%; background:linear-gradient(90deg,#c62828,#ff5252); transition:width 0.1s; }
.mob-info-bar .mob-hp-text { font-size:0.75em; color:#888; margin-top:2px; }

.dmg-number { position:absolute; font-family:'Cinzel',serif; font-weight:900; font-size:1.2em; color:#ff6b6b; pointer-events:none; animation:dmgFly 0.8s ease-out forwards; text-shadow:0 0 6px rgba(255,0,0,0.5); z-index:10; }
.dmg-number.crit { font-size:1.6em; color:#ffd740; text-shadow:0 0 10px rgba(255,215,0,0.7); }
.dmg-number.gold-drop { color:var(--gold); font-size:0.9em; text-shadow:0 0 6px rgba(212,168,67,0.5); }
@keyframes dmgFly { 0%{opacity:1;transform:translateY(0) scale(1);} 100%{opacity:0;transform:translateY(-60px) scale(0.5);} }

/* Spell Bar - MMO Style */
.spell-bar { display:flex; justify-content:center; gap:8px; margin-bottom:10px; padding:10px; background:linear-gradient(180deg,rgba(15,12,25,0.9),rgba(10,8,18,0.95)); border-radius:12px; border:1px solid rgba(212,168,67,0.15); }

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

.kill-counter { text-align:center; font-size:0.8em; color:#666; margin-bottom:5px; }

.hero-recap { display:flex; align-items:center; justify-content:center; gap:15px; background:linear-gradient(145deg,rgba(25,25,45,0.95),rgba(15,15,30,0.95)); border-bottom:1px solid rgba(212,168,67,0.12); padding:8px 15px; flex-wrap:wrap; position:sticky; top:82px; z-index:98; }
.hero-recap .hr-section { display:flex; align-items:center; gap:6px; }
.hero-recap .hr-label { font-family:'Cinzel',serif; font-size:0.65em; color:#666; text-transform:uppercase; letter-spacing:0.5px; }
.hero-recap .hr-icon { font-size:1.4em; }
.hero-recap .hr-val { font-size:0.75em; color:var(--parchment); }
.hero-recap .hr-val span { color:var(--gold); font-family:'Cinzel',serif; }
.hero-recap .hr-divider { width:1px; height:25px; background:rgba(212,168,67,0.15); }
.hero-recap .hr-pet { display:flex; align-items:center; gap:4px; background:rgba(106,27,154,0.15); border:1px solid rgba(106,27,154,0.25); border-radius:6px; padding:4px 8px; }
.hero-recap .hr-pet .pet-icon { font-size:1.3em; animation:petBounce 1.5s ease-in-out infinite; }
.hero-recap .hr-pet .pet-name { font-size:0.7em; color:#ce93d8; font-family:'Cinzel',serif; }
.hero-recap .hr-pet .pet-bonus { font-size:0.6em; color:#888; }
@keyframes petBounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-3px);} }

.gate-item { display:flex; align-items:center; justify-content:space-between; background:linear-gradient(145deg,rgba(30,30,50,0.9),rgba(20,20,35,0.9)); border:1px solid rgba(212,168,67,0.15); border-radius:10px; padding:12px 15px; margin-bottom:8px; }
.gate-item.unlocked { border-color:var(--green); opacity:0.6; }
.gate-item.current { border-color:var(--gold); box-shadow:0 0 10px rgba(212,168,67,0.15); }
.gate-item.locked { opacity:0.5; }
.gate-item.prestige-wall { border-color:var(--purple); background:linear-gradient(145deg,rgba(106,27,154,0.2),rgba(50,10,80,0.15)); opacity:1; }
.gate-info { flex:1; }
.gate-zone { font-family:'Cinzel',serif; color:var(--gold); font-size:0.95em; }
.gate-cost { font-size:0.8em; color:#aaa; margin-top:2px; }
.gate-mob { font-size:0.8em; color:#ce93d8; }
.gate-time { font-size:0.7em; color:#555; font-style:italic; }

.btn { padding:7px 14px; border:1px solid var(--gold-dark); background:linear-gradient(145deg,rgba(212,168,67,0.12),rgba(160,120,48,0.08)); color:var(--gold); font-family:'Cinzel',serif; font-size:0.8em; border-radius:6px; cursor:pointer; transition:all 0.2s; }
.btn:hover { background:linear-gradient(145deg,rgba(212,168,67,0.25),rgba(160,120,48,0.15)); }
.btn:disabled { opacity:0.3; cursor:not-allowed; }
.btn-sm { padding:4px 10px; font-size:0.75em; }
.btn-purple { border-color:var(--purple); color:#ce93d8; }
.btn-green { border-color:var(--green); color:var(--green); background:rgba(76,175,80,0.15); }

.spell-upgrade-card { background:linear-gradient(145deg,rgba(30,30,55,0.95),rgba(15,15,30,0.95)); border:1px solid rgba(212,168,67,0.2); border-radius:10px; padding:15px; margin-bottom:10px; display:flex; align-items:center; gap:15px; }
.spell-upgrade-card .su-icon { font-size:2.5em; }
.spell-upgrade-card .su-info { flex:1; }
.spell-upgrade-card .su-name { font-family:'Cinzel',serif; color:var(--gold); font-size:1em; }
.spell-upgrade-card .su-desc { font-size:0.8em; color:#aaa; }
.spell-upgrade-card .su-stats { display:flex; gap:15px; margin-top:5px; font-size:0.8em; flex-wrap:wrap; }
.spell-upgrade-card .su-stat { color:#ccc; }
.spell-upgrade-card .su-stat span { color:var(--gold); font-family:'Cinzel',serif; }
.spell-upgrade-card .su-actions { text-align:right; }
.spell-upgrade-card .su-level { font-family:'Cinzel',serif; color:var(--gold); font-size:1.1em; margin-bottom:5px; }
.spell-upgrade-card .su-cost { font-size:0.75em; color:var(--accent); margin-top:3px; }

.talent-section { margin-bottom:15px; }
.talent-section-title { font-family:'Cinzel',serif; color:var(--gold); font-size:1em; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid rgba(212,168,67,0.2); }
.talent-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.talent-node { background:rgba(0,0,0,0.35); border:1px solid rgba(212,168,67,0.15); border-radius:8px; padding:10px; text-align:center; }
.talent-node:hover { border-color:rgba(212,168,67,0.4); }
.talent-node .t-icon { font-size:1.5em; }
.talent-node .t-name { font-family:'Cinzel',serif; font-size:0.75em; color:var(--gold); margin:3px 0; }
.talent-node .t-level { font-size:0.7em; color:#aaa; }
.talent-node .t-desc { font-size:0.7em; color:#888; margin:3px 0; }
.talent-node .t-cost { font-size:0.7em; color:var(--accent); }
.talent-node.maxed { border-color:var(--green); }

.prestige-box { text-align:center; padding:20px; background:linear-gradient(145deg,rgba(106,27,154,0.15),rgba(50,10,80,0.1)); border:1px solid rgba(106,27,154,0.3); border-radius:12px; margin-bottom:15px; }
.prestige-box .p-icon { font-size:4em; animation:wandFloat 3s ease-in-out infinite; }
.prestige-box .p-title { font-family:'Cinzel',serif; color:var(--gold); font-size:1.3em; margin:10px 0; }
.prestige-box .p-desc { color:#aaa; font-size:0.85em; margin-bottom:15px; }
.prestige-box .p-mult { font-family:'Cinzel',serif; color:#ce93d8; font-size:1.2em; margin:10px 0; }

.prestige-tier { background:rgba(0,0,0,0.3); border:1px solid rgba(212,168,67,0.15); border-radius:8px; padding:12px; margin-bottom:10px; text-align:center; }
.prestige-tier.done { border-color:var(--green); opacity:0.7; }
.prestige-tier.available { border-color:var(--purple); box-shadow:0 0 10px rgba(106,27,154,0.2); }
.prestige-tier .pt-name { font-family:'Cinzel',serif; color:var(--gold); }
.prestige-tier .pt-req { font-size:0.8em; color:#aaa; }
.prestige-tier .pt-reward { font-size:0.85em; color:#ce93d8; margin:5px 0; }

.stat-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.85em; }
.stat-row .stat-label { color:#aaa; }
.stat-row .stat-value { color:var(--gold); font-family:'Cinzel',serif; }

.card { background:linear-gradient(145deg,rgba(30,30,50,0.9),rgba(18,18,32,0.9)); border:1px solid rgba(212,168,67,0.12); border-radius:10px; padding:12px; margin-bottom:10px; }
.card-title { font-family:'Cinzel',serif; color:var(--gold); font-size:0.95em; margin-bottom:8px; padding-bottom:5px; border-bottom:1px solid rgba(212,168,67,0.15); }

.toast { position:fixed; bottom:15px; left:50%; transform:translateX(-50%) translateY(80px); background:var(--dark); border:1px solid var(--gold); border-radius:8px; padding:8px 18px; color:var(--gold); font-family:'Cinzel',serif; font-size:0.85em; z-index:300; opacity:0; transition:all 0.3s; }
.toast.show { transform:translateX(-50%) translateY(0); opacity:1; }

/* Active Buffs Bar */
.active-buffs-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  padding: 10px 20px;
  background: linear-gradient(180deg, rgba(30,25,45,0.95), rgba(15,12,25,0.98));
  border: 2px solid var(--gold-dark);
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  z-index: 400;
  box-shadow: 0 -5px 20px rgba(0,0,0,0.5);
}
.active-buffs-bar:empty {
  display: none;
}
.buff-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(212,168,67,0.3);
  border-radius: 8px;
  padding: 8px 12px;
  animation: buffPulse 2s ease-in-out infinite;
}
@keyframes buffPulse {
  0%, 100% { box-shadow: 0 0 5px rgba(46,125,50,0.3); }
  50% { box-shadow: 0 0 15px rgba(46,125,50,0.6); }
}
.buff-item .buff-icon {
  font-size: 1.8em;
}
.buff-item .buff-info {
  display: flex;
  flex-direction: column;
}
.buff-item .buff-name {
  font-family: 'Cinzel', serif;
  font-size: 0.85em;
  color: var(--gold);
}
.buff-item .buff-timer {
  font-size: 1.1em;
  font-weight: bold;
  color: var(--green);
  font-family: 'Cinzel', serif;
}
.buff-item.expiring {
  animation: buffExpiring 0.5s ease-in-out infinite;
}
@keyframes buffExpiring {
  0%, 100% { border-color: var(--red); box-shadow: 0 0 10px rgba(198,40,40,0.5); }
  50% { border-color: #ff6666; box-shadow: 0 0 20px rgba(198,40,40,0.8); }
}

@media (max-width:600px) {
  .talent-grid { grid-template-columns:repeat(2,1fr); }
  .currency-bar { gap:10px; font-size:0.8em; }
  .spell-upgrade-card { flex-direction:column; text-align:center; }
  .spell-upgrade-card .su-stats { justify-content:center; }
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

/* Boss Alert Banner */
.boss-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.boss-alert-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

.boss-alert-content {
  text-align: center;
  animation: bossAlertZoom 0.5s ease-out;
}

@keyframes bossAlertZoom {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.boss-alert-icon {
  font-size: 8em;
  animation: bossAlertPulse 0.5s ease-in-out infinite alternate;
}

@keyframes bossAlertPulse {
  0% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(255, 0, 0, 0.8)); }
  100% { transform: scale(1.1); filter: drop-shadow(0 0 40px rgba(255, 0, 0, 1)); }
}

.boss-alert-title {
  font-family: 'Cinzel', serif;
  font-size: 3em;
  color: var(--red);
  text-shadow: 0 0 30px rgba(198, 40, 40, 0.8), 0 0 60px rgba(198, 40, 40, 0.5);
  margin: 20px 0;
  animation: bossAlertFlash 0.3s ease-in-out infinite alternate;
}

@keyframes bossAlertFlash {
  0% { color: #c62828; }
  100% { color: #ff5252; }
}

.boss-alert-name {
  font-family: 'Cinzel', serif;
  font-size: 2em;
  color: var(--gold);
  text-shadow: 0 0 20px rgba(212, 168, 67, 0.8);
  margin-bottom: 30px;
}

.boss-alert-btn {
  font-size: 1.5em;
  padding: 15px 50px;
  animation: bossAlertBtnPulse 1s ease-in-out infinite;
}

@keyframes bossAlertBtnPulse {
  0%, 100% { box-shadow: 0 0 10px rgba(212, 168, 67, 0.5); }
  50% { box-shadow: 0 0 30px rgba(212, 168, 67, 0.8); }
}
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
  <div class="game-logo">🪄 Wand Idle <button class="patch-note-btn" id="patchNoteBtn" onclick="togglePatchModal(true)" title="Patch Notes">📜</button></div>
  <div class="currency-bar">
    <div class="currency"><span class="c-icon">🪙</span><span class="c-val" id="goldVal">0</span><span class="c-ps" id="goldPs"></span></div>
    <div class="currency"><span class="c-icon">💎</span><span class="c-val" id="gemsVal">0</span></div>
    <div class="currency"><span class="c-icon">⭐</span><span class="c-val" id="tpVal">0</span></div>
    <div class="currency" title="Niveau de Prestige"><span class="c-icon">🔮</span><span class="c-val" id="prestigeVal">Prestige 0</span></div>
    <div id="userZone" style="margin-left:auto;display:flex;align-items:center;gap:8px;">
      <img id="userAvatar" src="" style="width:28px;height:28px;border-radius:50%;display:none;border:2px solid var(--gold);cursor:pointer;" onclick="promptChangeAvatar()" title="Cliquer pour changer l'avatar" />
      <span id="userName" style="font-size:0.8em;color:#aaa;cursor:pointer;" onclick="promptChangeName()" title="Cliquer pour changer le pseudo"></span>
      <button id="loginBtn" class="btn btn-sm" onclick="handleLogin()">🎮 Discord</button>
    </div>
  </div>
</div>

<nav class="nav">
  <button class="nav-btn active" onclick="switchPanel('zone',this)"><span class="nav-icon">⚔️</span><span class="nav-label">Combat</span></button>
  <button class="nav-btn" onclick="switchPanel('gates',this)"><span class="nav-icon">🚪</span><span class="nav-label">Portes</span></button>
  <button class="nav-btn" onclick="switchPanel('spells',this)"><span class="nav-icon">✨</span><span class="nav-label">Sorts</span></button>
  <button class="nav-btn" onclick="switchPanel('talents',this)"><span class="nav-icon">📖</span><span class="nav-label">Talents</span></button>
  <button class="nav-btn" onclick="switchPanel('shop',this)"><span class="nav-icon">🏪</span><span class="nav-label">Shop</span></button>
  <button class="nav-btn" onclick="switchPanel('pets',this)"><span class="nav-icon">🐾</span><span class="nav-label">Pets</span><span id="petNotif" class="nav-notif" style="display:none;">!</span></button>
  <button class="nav-btn" onclick="switchPanel('boss',this)"><span class="nav-icon" id="bossNavIcon">👹</span><span class="nav-label">Boss</span><span id="bossNavTimer" style="font-size:0.6em;color:#888;margin-left:2px;"></span><span id="bossNotif" style="display:none;position:absolute;top:2px;right:2px;background:var(--red);color:#fff;font-size:0.5em;padding:2px 4px;border-radius:6px;animation:pulse-dot 1.5s infinite;">LIVE</span></button>
  <button class="nav-btn" onclick="switchPanel('prestige',this)"><span class="nav-icon">🔮</span><span class="nav-label">Prestige</span></button>
  <button class="nav-btn" onclick="switchPanel('stats',this)"><span class="nav-icon">📊</span><span class="nav-label">Stats</span></button>
</nav>

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

<!-- Active Buffs Bar -->
<div id="activeBuffsBar" class="active-buffs-bar"></div>

<div id="toast" class="toast"></div>

<div id="bossAlertOverlay" class="boss-alert-overlay" onclick="closeBossAlert()">
  <div class="boss-alert-content">
    <div class="boss-alert-icon" id="bossAlertIcon">🐍</div>
    <div class="boss-alert-title">⚔️ WORLD BOSS ⚔️</div>
    <div class="boss-alert-name" id="bossAlertName">Lord Voldemort</div>
    <button class="btn boss-alert-btn" onclick="goToBossPanel(event)">COMBATTRE !</button>
  </div>
</div>

<div class="patch-modal" id="patchModal">
  <div class="patch-content">
    <div class="patch-header">
      <h2>📜 Patch Notes</h2>
      <button class="patch-close" onclick="togglePatchModal(false)">&times;</button>
    </div>
    <div class="patch-body">
      <div class="patch-version">Version 2.1.0 — 3 Février 2026</div>
      <div class="patch-section">
        <h3>✨ Animations & Interface</h3>
        <ul>
          <li>Nouvelles animations de sorts uniques (⚡🦌🔥💀)</li>
          <li>Barre de sorts style MMO avec cooldown radial</li>
          <li>Mini-aperçu du combat flottant</li>
          <li>Barre des buffs actifs en bas de l'écran</li>
          <li>Notification Pets quand nouveau familier</li>
          <li>Navbar redesignée avec icônes</li>
          <li>Affichage du niveau de Prestige</li>
        </ul>
      </div>
      <div class="patch-section" style="border-top:1px solid rgba(212,168,67,0.2);margin-top:15px;padding-top:15px;">
        <h3>📜 Historique</h3>
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
const PATCH_VERSION = '2.1.0';

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
const PETS = [
  { id: 'fairy',     zone: 0,  icon: '🧚', name: 'Fée',            dropRate: 0.05,  desc: '+5% gold',        effect: { type: 'gold', val: 0.05 }},
  { id: 'spider',    zone: 1,  icon: '🕷️', name: 'Araignée',       dropRate: 0.04,  desc: '+8% Stupefix dmg', effect: { type: 'spell_dmg', spell: 'stupefix', val: 0.08 }},
  { id: 'wolf',      zone: 2,  icon: '🐺', name: 'Loup',           dropRate: 0.035, desc: '-5% tous CD',     effect: { type: 'all_cd', val: 0.05 }},
  { id: 'troll',     zone: 3,  icon: '🧌', name: 'Troll',          dropRate: 0.03,  desc: '+10% tous dmg',   effect: { type: 'all_dmg', val: 0.10 }},
  { id: 'kraken',    zone: 4,  icon: '🐙', name: 'Strangulot',     dropRate: 0.025, desc: '+8% Confringo dmg', effect: { type: 'spell_dmg', spell: 'confringo', val: 0.08 }},
  { id: 'ghoul',     zone: 5,  icon: '🧟', name: 'Goule',          dropRate: 0.02,  desc: '+12% gold',       effect: { type: 'gold', val: 0.12 }},
  { id: 'ghost',     zone: 6,  icon: '👻', name: 'Spectre',        dropRate: 0.018, desc: '+8% Patronus dmg', effect: { type: 'spell_dmg', spell: 'patronus', val: 0.08 }},
  { id: 'skeleton',  zone: 7,  icon: '💀', name: 'Squelette',      dropRate: 0.015, desc: '+5% crit chance', effect: { type: 'crit', val: 0.05 }},
  { id: 'vampire',   zone: 8,  icon: '🧛', name: 'Vampire',        dropRate: 0.012, desc: '+15% tous dmg',   effect: { type: 'all_dmg', val: 0.15 }},
  { id: 'guardian',  zone: 9,  icon: '⚔️', name: 'Gardien',        dropRate: 0.01,  desc: '-8% tous CD',     effect: { type: 'all_cd', val: 0.08 }},
  { id: 'golem',     zone: 10, icon: '🗿', name: 'Golem',          dropRate: 0.009, desc: '+20% gold',       effect: { type: 'gold', val: 0.20 }},
  { id: 'salamander',zone: 11, icon: '🦎', name: 'Salamandre',     dropRate: 0.008, desc: '+12% Confringo',  effect: { type: 'spell_dmg', spell: 'confringo', val: 0.12 }},
  { id: 'dragon',    zone: 12, icon: '🐉', name: 'Dragon',         dropRate: 0.007, desc: '+20% tous dmg',   effect: { type: 'all_dmg', val: 0.20 }},
  { id: 'giant',     zone: 13, icon: '🏔️', name: 'Géant de Glace', dropRate: 0.006, desc: '+8% crit chance', effect: { type: 'crit', val: 0.08 }},
  { id: 'djinn',     zone: 14, icon: '🌪️', name: 'Djinn',          dropRate: 0.005, desc: '-10% tous CD',    effect: { type: 'all_cd', val: 0.10 }},
  { id: 'knight',    zone: 15, icon: '🖤', name: 'Chevalier Noir', dropRate: 0.005, desc: '+25% tous dmg',   effect: { type: 'all_dmg', val: 0.25 }},
  { id: 'lich',      zone: 16, icon: '☠️', name: 'Liche',          dropRate: 0.004, desc: '+30% gold',       effect: { type: 'gold', val: 0.30 }},
  { id: 'necro',     zone: 17, icon: '🧙', name: 'Nécromant',      dropRate: 0.004, desc: '+12% crit chance', effect: { type: 'crit', val: 0.12 }},
  { id: 'demon',     zone: 18, icon: '😈', name: 'Démon',          dropRate: 0.003, desc: '+30% tous dmg',   effect: { type: 'all_dmg', val: 0.30 }},
  { id: 'archangel', zone: 19, icon: '👁️', name: 'Archange',       dropRate: 0.003, desc: '-12% tous CD',    effect: { type: 'all_cd', val: 0.12 }},
  { id: 'alpha',     zone: 20, icon: '🌀', name: 'Entité Alpha',   dropRate: 0.002, desc: '+40% tous dmg',   effect: { type: 'all_dmg', val: 0.40 }},
  { id: 'chrono',    zone: 21, icon: '⏳', name: 'Chrono-Bête',    dropRate: 0.002, desc: '-15% tous CD',    effect: { type: 'all_cd', val: 0.15 }},
  { id: 'void',      zone: 22, icon: '⚫', name: 'Vide Incarné',   dropRate: 0.0015,desc: '+50% gold',       effect: { type: 'gold', val: 0.50 }},
  { id: 'titan',     zone: 23, icon: '💥', name: 'Titan du Chaos', dropRate: 0.001, desc: '+50% tous dmg',   effect: { type: 'all_dmg', val: 0.50 }},
  { id: 'eternal',   zone: 24, icon: '✨', name: "L'Éternel",      dropRate: 0.0005,desc: '+100% tous dmg',  effect: { type: 'all_dmg', val: 1.00 }},
];

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

// Pet upgrade cost: scales with pet zone and level
function petUpgradeCost(pet, level) {
  const base = Math.max(50, pet.zone * 500 + 50);
  return Math.floor(base * Math.pow(1.2, level));
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
  if (pet.effect.type === type) {
    if (spell && pet.effect.spell && pet.effect.spell !== spell) return 0;
    const lvl = G.petLevels[pet.id] || 1;
    // Diminishing returns: base + 20% of base per extra level
    return pet.effect.val * (1 + (lvl - 1) * 0.2);
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
  dmg *= (1 + getPetBonus('spell_dmg', spellId) + getPetBonus('all_dmg'));
  dmg *= G.rebirthMult * G.prestigeMult;
  return dmg;
}

function getSpellCD(spellId) {
  const def = getSpells().find(s => s.id === spellId);
  let cd = def.baseCD;
  const t = TALENTS.find(t => t.effect.type === 'spell_cd' && t.effect.spell === spellId);
  if (t) cd *= (1 - getTalent(t.id) * t.effect.perLevel);
  const allCd = TALENTS.find(t => t.effect.type === 'all_cd');
  if (allCd) cd *= (1 - getTalent(allCd.id) * allCd.effect.perLevel);
  cd *= (1 - getPetBonus('all_cd'));
  if (hasBuff('frenzy')) cd *= 0.5;
  return Math.max(0.15, cd);
}

function getCritChance() {
  const t = TALENTS.find(t => t.effect.type === 'crit_chance');
  return Math.min((t ? getTalent(t.id) * t.effect.perLevel : 0) + getPetBonus('crit'), 0.8);
}

function getCritMult() {
  const t = TALENTS.find(t => t.effect.type === 'crit_dmg');
  return 2 + (t ? getTalent(t.id) * t.effect.perLevel : 0);
}

function getGoldMult() {
  const t = TALENTS.find(t => t.effect.type === 'gold_bonus');
  let m = (1 + (t ? getTalent(t.id) * t.effect.perLevel : 0) + getPetBonus('gold')) * G.rebirthMult * G.prestigeMult;
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
  if (isCrit) dmg *= getCritMult();
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
  // Pet drop check
  const zonePets = PETS.filter(p => p.zone === G.currentZone);
  zonePets.forEach(p => {
    let dr = p.dropRate;
    if (hasShop('pet_magnet')) dr *= 2;
    if (hasBuff('lucky')) dr *= 3;
    if (!G.ownedPets.includes(p.id) && Math.random() < dr) {
      G.ownedPets.push(p.id);
      G.petLevels[p.id] = 1;
      if (!G.activePet) G.activePet = p.id;
      toast('🎉 Pet obtenu : ' + p.icon + ' ' + p.name + ' !');
      rebuildHeroRecap();
      showPetNotif();
    }
  });
  spawnMob();
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
  if (activePanel === 'spells') rebuildSpellUpgrades();
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
  toast('+' + bought + ' niveaux !');
  updateTalentNode(talentId);
  updateUI();
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
  if (costEl) costEl.textContent = isMax ? '✅ MAX' : cost + ' ⭐';
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

  // Soft reset: keep talents, TP, gems, prestige, pets
  const keepTalents = JSON.parse(JSON.stringify(G.talents));
  const keepTP = G.talentPoints;
  const keepGems = G.gems;
  const keepPets = [...G.ownedPets];
  const keepActivePet = G.activePet;
  const keepPetLevels = JSON.parse(JSON.stringify(G.petLevels));
  const keepShopUnlocks = [...(G.shopUnlocks || [])];
  const keepShopBuys = JSON.parse(JSON.stringify(G.shopBuys || {}));
  const keepPrestige = G.prestige;
  const keepPrestigeMult = G.prestigeMult;
  const keepTotalKills = G.totalKills;
  const keepTotalGold = G.totalGoldEarned;
  const keepStartTime = G.startTime;

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
  G.petLevels = keepPetLevels;
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

  G = defaultState();
  G.prestige = newPrestige;
  G.prestigeMult = newPrestigeMult;
  G.gems = keepGems;
  G.totalKills = keepTotalKills;
  G.totalGoldEarned = keepTotalGold;
  G.startTime = keepStartTime;

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
  updateUI();
}

// ============ UI LIGHT ============
function updateUI() {
  document.getElementById('goldVal').textContent = fmt(G.gold);
  document.getElementById('goldPs').textContent = '(' + fmt(getGoldPerSec()) + '/s)';
  document.getElementById('gemsVal').textContent = fmt(G.gems);
  document.getElementById('tpVal').textContent = G.talentPoints;
  document.getElementById('prestigeVal').textContent = 'Prestige ' + G.prestige;

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
        <div class="t-cost" id="talent-cost-\${t.id}">\${isMax?'✅ MAX':cost+' ⭐'}</div>
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
      <div class="t-cost" id="talent-cost-\${t.id}">\${isMax?'✅ MAX':cost+' ⭐'}</div>
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
  }
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

function equipPet(petId) {
  if (!G.ownedPets.includes(petId)) return;
  G.activePet = G.activePet === petId ? null : petId;
  rebuildPets();
  rebuildHeroRecap();
}

function showPetNotif() {
  const notif = document.getElementById('petNotif');
  if (notif) notif.style.display = 'flex';
}

function clearPetNotif() {
  const notif = document.getElementById('petNotif');
  if (notif) notif.style.display = 'none';
}

function rebuildPets() {
  const el = document.getElementById('petsList');
  if (!el) return;
  let html = '';
  // Show owned pets first, then undiscovered for current/nearby zones
  const owned = PETS.filter(p => G.ownedPets.includes(p.id));
  const unowned = PETS.filter(p => !G.ownedPets.includes(p.id) && p.zone <= G.highestZone + 1);

  if (owned.length === 0 && unowned.length === 0) {
    html = '<div style="text-align:center;color:#555;padding:20px;">Tue des mobs pour trouver des pets !</div>';
  }

  owned.forEach(p => {
    const isActive = G.activePet === p.id;
    const lvl = G.petLevels[p.id] || 1;
    const cost = petUpgradeCost(p, lvl);
    const curVal = (p.effect.val * (1 + (lvl - 1) * 0.2) * 100).toFixed(1);
    const nextVal = (p.effect.val * (1 + lvl * 0.2) * 100).toFixed(1);
    html += \`
      <div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:6px;background:\${isActive ? 'rgba(106,27,154,0.2)' : 'rgba(0,0,0,0.25)'};border:1px solid \${isActive ? 'var(--purple)' : 'rgba(212,168,67,0.12)'};border-radius:8px;">
        <div style="font-size:2em;">\${p.icon}</div>
        <div style="flex:1;">
          <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:0.9em;">\${p.name} <span style="font-size:0.8em;color:#aaa;">Niv.\${lvl}</span> \${isActive ? '<span style="color:var(--green);font-size:0.8em;">— Équipé</span>' : ''}</div>
          <div style="font-size:0.8em;color:#ce93d8;">\${p.desc} → <span style="color:var(--gold);">\${curVal}%</span></div>
          <div style="font-size:0.7em;color:#555;">Zone \${p.zone + 1} — \${(p.dropRate * 100).toFixed(2)}% drop</div>
        </div>
        <div style="text-align:right;display:flex;flex-direction:column;gap:4px;">
          <button class="btn btn-sm \${isActive ? 'btn-purple' : ''}" onclick="equipPet('\${p.id}')">\${isActive ? 'Retirer' : 'Équiper'}</button>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-sm" data-cost-gold="\${cost}" onclick="upgradePet('\${p.id}')" \${G.gold < cost ? 'disabled' : ''}>⬆ \${fmt(cost)} 🪙</button>
            <button class="btn btn-sm" data-cost-gold="\${cost}" onclick="maxPet('\${p.id}')" \${G.gold < cost ? 'disabled' : ''}>MAX</button>
          </div>
          <div style="font-size:0.6em;color:#555;">→ \${nextVal}%</div>
        </div>
      </div>
    \`;
  });

  if (unowned.length > 0) {
    html += '<div style="font-family:\\'Cinzel\\',serif;color:#555;font-size:0.8em;margin:12px 0 6px;">Pas encore découverts :</div>';
    unowned.forEach(p => {
      const canGo = p.zone < G.unlockedZones;
      html += \`
        <div style="display:flex;align-items:center;gap:12px;padding:8px 10px;margin-bottom:4px;background:rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.04);border-radius:8px;opacity:0.6;">
          <div style="font-size:1.8em;">❓</div>
          <div style="flex:1;">
            <div style="font-family:'Cinzel',serif;color:#555;font-size:0.85em;">???</div>
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
  if (!firebaseUser) return;
  console.log('Checking cloud save...');

  const cloudData = await loadFromCloud();
  if (!cloudData) {
    console.log('No cloud save found, uploading local save...');
    lastCloudSave = 0;
    saveToCloud();
    toast('☁️ Sauvegarde synchronisée !');
    return;
  }

  const localTime = G.lastTick || 0;
  const cloudTime = cloudData.cloudSaveTime || cloudData.lastTick || 0;
  console.log('Cloud time:', cloudTime, 'Local time:', localTime);

  if (cloudTime > localTime + 60000) {
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
async function subscribeToBoss() {
  if (!firebaseUser || !firebaseDb) return;

  try {
    // Écouter l'état du boss
    const bossRef = firebaseDb.ref('worldBoss/current');
    bossRef.on('value', (snapshot) => {
      const data = snapshot.val();
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
        showBossNotification();
      } else if (data && data.status === 'defeated') {
        worldBossState.active = false;
        worldBossState.status = 'victory';
        worldBossState.boss = data;
      } else if (data && data.status === 'expired') {
        worldBossState.active = false;
        worldBossState.status = 'expired';
      } else {
        worldBossState.active = false;
        worldBossState.status = 'waiting';
        worldBossState.myDamage = 0;
        worldBossState.claimed = false;
        bossAlertShown = false; // Reset pour le prochain boss
      }
      updateBossUI();
    });
    bossUnsubscribers.push(() => bossRef.off());

    // Écouter les participants
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
      updateBossLeaderboard();
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

  // Auto-fermer après 5 secondes
  setTimeout(() => {
    closeBossAlert();
  }, 5000);
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
let bossPlayerPositions = [];

function initBossCanvas() {
  const canvas = document.getElementById('bossCanvas');
  if (!canvas) return;
  bossCanvasCtx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 220;
}

function drawSprite(ctx, sprite, x, y, scale = 1, flash = false) {
  const { palette, pixels } = sprite;
  const pixelSize = scale;

  for (let row = 0; row < pixels.length; row++) {
    for (let col = 0; col < pixels[row].length; col++) {
      const colorIndex = pixels[row][col];
      if (colorIndex === 0) continue;

      let color = palette[colorIndex];
      if (flash) {
        color = '#ffffff';
      }

      ctx.fillStyle = color;
      ctx.fillRect(
        x + col * pixelSize,
        y + row * pixelSize,
        pixelSize,
        pixelSize
      );
    }
  }
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

  // Update player labels
  updateBossPlayerLabels(visible);

  // Continue animation
  if (worldBossState.status === 'active') {
    requestAnimationFrame(renderBossCanvas);
  }
}

function updateBossPlayerLabels(participants) {
  const container = document.getElementById('bossPlayerLabels');
  if (!container) return;

  const maxVisible = 10;
  const visible = participants.slice(0, maxVisible);
  const extraCount = Math.max(0, worldBossState.participants.length - maxVisible);

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
  // Start canvas rendering if not already running
  if (worldBossState.status === 'active') {
    initBossCanvas();
    renderBossCanvas();
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

function updateBossLeaderboard() {
  const el = document.getElementById('bossLeaderboard');
  if (!el) return;

  let html = '';
  const top = worldBossState.participants.slice(0, 10);
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
