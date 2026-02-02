"use client";

import { useEffect, useRef } from "react";

export default function WandIdle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);

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

.top-bar { background:linear-gradient(180deg,var(--dark),var(--darker)); border-bottom:2px solid var(--gold-dark); padding:8px 15px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:100; }
.game-logo { font-family:'Cinzel',serif; color:var(--gold); font-size:1.1em; text-shadow:0 0 15px rgba(212,168,67,0.3); }
.currency-bar { display:flex; gap:18px; align-items:center; }
.currency { display:flex; align-items:center; gap:4px; font-size:0.9em; }
.currency .c-icon { font-size:1.1em; }
.currency .c-val { color:var(--gold); font-weight:700; font-family:'Cinzel',serif; }
.currency .c-ps { color:#777; font-size:0.75em; }

.nav { display:flex; background:var(--dark); border-bottom:1px solid rgba(212,168,67,0.2); position:sticky; top:42px; z-index:100; }
.nav-btn { flex:1; padding:10px 5px; background:none; border:none; color:#666; font-family:'Cinzel',serif; font-size:0.78em; cursor:pointer; transition:all 0.2s; border-bottom:2px solid transparent; }
.nav-btn:hover { color:var(--parchment); }
.nav-btn.active { color:var(--gold); border-bottom-color:var(--gold); background:rgba(212,168,67,0.06); }

.main { max-width:900px; margin:0 auto; padding:10px; }
.panel { display:none; }
.panel.active { display:block; }

.zone-header { text-align:center; padding:10px; background:linear-gradient(180deg,rgba(106,27,154,0.15),transparent); border-radius:10px; margin-bottom:10px; }
.zone-name { font-family:'Cinzel',serif; color:var(--gold); font-size:1.3em; }
.zone-desc { color:#888; font-size:0.85em; }
.zone-progress { font-size:0.75em; color:#666; margin-top:3px; }

.battle-area { position:relative; background:linear-gradient(180deg,rgba(20,20,40,0.8),rgba(10,10,25,0.9)); border:1px solid rgba(212,168,67,0.15); border-radius:12px; height:320px; overflow:hidden; margin-bottom:10px; }
.mob-container { position:absolute; top:45%; left:50%; transform:translate(-50%,-50%); text-align:center; }
.mob-icon { font-size:4em; transition:transform 0.1s; }
.mob-icon.hit { transform:scale(0.85); filter:brightness(2); }
.mob-name { font-family:'Cinzel',serif; color:var(--parchment); font-size:0.9em; margin-top:5px; }
.mob-hp-bar { width:200px; height:12px; background:rgba(0,0,0,0.6); border-radius:6px; margin:6px auto 0; overflow:hidden; }
.mob-hp-fill { height:100%; background:linear-gradient(90deg,var(--red),#ef5350); border-radius:6px; transition:width 0.15s; }
.mob-hp-text { font-size:0.7em; color:#aaa; margin-top:2px; }

.wand-companion { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); text-align:center; }
.wand-icon { font-size:3em; animation:wandFloat 2.5s ease-in-out infinite; }
@keyframes wandFloat { 0%,100%{transform:translateY(0) rotate(-10deg);} 50%{transform:translateY(-8px) rotate(10deg);} }

.dmg-number { position:absolute; font-family:'Cinzel',serif; font-weight:900; font-size:1.2em; color:#ff6b6b; pointer-events:none; animation:dmgFly 0.8s ease-out forwards; text-shadow:0 0 6px rgba(255,0,0,0.5); z-index:10; }
.dmg-number.crit { font-size:1.6em; color:#ffd740; text-shadow:0 0 10px rgba(255,215,0,0.7); }
.dmg-number.gold-drop { color:var(--gold); font-size:0.9em; text-shadow:0 0 6px rgba(212,168,67,0.5); }
@keyframes dmgFly { 0%{opacity:1;transform:translateY(0) scale(1);} 100%{opacity:0;transform:translateY(-60px) scale(0.5);} }

.spell-bar { display:flex; justify-content:center; gap:12px; margin-bottom:10px; }
.spell-slot { width:80px; text-align:center; background:linear-gradient(145deg,rgba(30,30,55,0.95),rgba(15,15,30,0.95)); border:2px solid rgba(212,168,67,0.25); border-radius:10px; padding:8px 5px; position:relative; overflow:hidden; }
.spell-slot.casting { border-color:var(--gold); box-shadow:0 0 15px rgba(212,168,67,0.3); }
.spell-slot .s-icon { font-size:1.8em; }
.spell-slot .s-name { font-family:'Cinzel',serif; font-size:0.65em; color:var(--gold); margin-top:2px; }
.spell-slot .s-dmg { font-size:0.65em; color:#ff6b6b; }
.spell-slot .s-cd-label { font-size:0.6em; color:#888; }
.spell-cd-overlay { position:absolute; bottom:0; left:0; width:100%; background:rgba(0,0,0,0.7); transition:height 0.1s linear; pointer-events:none; }
.spell-cd-text { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:'Cinzel',serif; font-size:0.8em; color:#aaa; }

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

@media (max-width:600px) {
  .talent-grid { grid-template-columns:repeat(2,1fr); }
  .currency-bar { gap:10px; font-size:0.8em; }
  .battle-area { height:260px; }
  .spell-upgrade-card { flex-direction:column; text-align:center; }
  .spell-upgrade-card .su-stats { justify-content:center; }
}
`;
    document.head.appendChild(style);

    // Inject HTML
    container.innerHTML = `

<div class="top-bar">
  <div class="game-logo">🪄 Wand Idle</div>
  <div class="currency-bar">
    <div class="currency"><span class="c-icon">🪙</span><span class="c-val" id="goldVal">0</span><span class="c-ps" id="goldPs"></span></div>
    <div class="currency"><span class="c-icon">💎</span><span class="c-val" id="gemsVal">0</span></div>
    <div class="currency"><span class="c-icon">⭐</span><span class="c-val" id="tpVal">0</span></div>
  </div>
</div>

<nav class="nav">
  <button class="nav-btn active" onclick="switchPanel('zone',this)">Zone</button>
  <button class="nav-btn" onclick="switchPanel('gates',this)">Portes</button>
  <button class="nav-btn" onclick="switchPanel('spells',this)">Sorts</button>
  <button class="nav-btn" onclick="switchPanel('talents',this)">Talents</button>
  <button class="nav-btn" onclick="switchPanel('shop',this)">Shop</button>
  <button class="nav-btn" onclick="switchPanel('pets',this)">Pets</button>
  <button class="nav-btn" onclick="switchPanel('prestige',this)">Prestige</button>
  <button class="nav-btn" onclick="switchPanel('stats',this)">Stats</button>
</nav>

<div class="hero-recap" id="heroRecap"></div>

<div class="main">
  <div id="panel-zone" class="panel active">
    <div class="zone-header">
      <div class="zone-name" id="zoneName">Zone 1</div>
      <div class="zone-desc" id="zoneDesc">...</div>
      <div class="zone-progress" id="zoneProgress"></div>
    </div>
    <div class="battle-area" id="battleArea">
      <div class="mob-container">
        <div class="mob-icon" id="mobIcon">🕷️</div>
        <div class="mob-name" id="mobName">—</div>
        <div class="mob-hp-bar"><div class="mob-hp-fill" id="mobHpFill" style="width:100%"></div></div>
        <div class="mob-hp-text" id="mobHpText">0/0</div>
      </div>
      <div class="wand-companion"><div class="wand-icon">🪄</div></div>
    </div>
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
</div>

<div id="toast" class="toast"></div>


`;

    // Execute game script
    const script = document.createElement('script');
    script.textContent = `
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
const BASE_SPELLS = [
  { id: 'stupefix',  name: 'Stupefix',  icon: '⚡', baseDmg: 10, baseCD: 1.2, desc: 'Éclair rapide.' },
  { id: 'confringo', name: 'Confringo', icon: '🔥', baseDmg: 24, baseCD: 2.0, desc: 'Explosion puissante.' },
  { id: 'patronus',  name: 'Patronus',  icon: '🦌', baseDmg: 15, baseCD: 1.5, desc: 'Lumière sacrée.' },
];
const SPELL4 = { id: 'avada', name: 'Avada Kedavra', icon: '💀', baseDmg: 40, baseCD: 3.0, desc: 'Le sort interdit.' };
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
    mobHp: 0, mobMaxHp: 0,
    spellCDs: { stupefix: 0, confringo: 0, patronus: 0 },
    lastTick: Date.now(),
    _saveTimer: 0,
    startTime: Date.now(),
  };
}

function save() { G.lastTick = Date.now(); localStorage.setItem('wandIdle', JSON.stringify(G)); }
function load() { try { const d = localStorage.getItem('wandIdle'); if (d) { G = JSON.parse(d); return true; } } catch(e) {} return false; }

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

function damageMob(amount) {
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
  for (let i = 0; i < hits; i++) {
    G.mobHp -= dmg;
    spawnDmgNumber(dmg, isCrit && i === 0);
  }
  const mobEl = document.getElementById('mobIcon');
  if (mobEl) { mobEl.classList.add('hit'); setTimeout(() => mobEl.classList.remove('hit'), 100); }
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
    if (G.spellCDs[spell.id] > 0) {
      G.spellCDs[spell.id] = Math.max(0, G.spellCDs[spell.id] - dt);
    } else {
      damageMob(getSpellDmg(spell.id));
      G.spellCDs[spell.id] = getSpellCD(spell.id);
      const slotEl = document.getElementById('spell-slot-' + spell.id);
      if (slotEl) { slotEl.classList.add('casting'); setTimeout(() => slotEl.classList.remove('casting'), 200); }
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
  rebuildTalents();
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
  G.prestige = keepPrestige;
  G.prestigeMult = keepPrestigeMult;
  G.talents = keepTalents;
  G.talentPoints = keepTP;
  G.gems = keepGems;
  G.ownedPets = keepPets;
  G.activePet = keepActivePet;
  G.petLevels = keepPetLevels;
  G.shopUnlocks = keepShopUnlocks;
  G.shopBuys = keepShopBuys;
  G.totalKills = keepTotalKills;
  G.totalGoldEarned = keepTotalGold;
  G.startTime = keepStartTime;

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
  // Auto-advance
  if (hasShop('auto_advance')) {
    const next = G.unlockedZones;
    if (next < ZONES.length && canAccessZone(next)) {
      const cost = getGateCost(next);
      if (G.gold >= cost) {
        G.gold -= cost;
        G.unlockedZones = next + 1;
        G.highestZone = Math.max(G.highestZone, next);
        G.currentZone = next;
        spawnMob();
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

  document.getElementById('mobIcon').textContent = zone.mob.icon;
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
  if (id === 'pets') rebuildPets();
  if (id === 'prestige') rebuildPrestige();
  if (id === 'stats') rebuildStats();
}

function rebuildAll() {
  rebuildSpellBar();
  rebuildHeroRecap();
  rebuildGates();
  rebuildSpellUpgrades();
  rebuildTalents();
  rebuildShop();
  rebuildPets();
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
  // Active buffs
  let anyBuff = false;
  SHOP_CONSUMABLES.forEach(c => {
    if (hasBuff(c.id)) anyBuff = true;
  });
  if (anyBuff) {
    html += '<div class="hr-divider"></div>';
    SHOP_CONSUMABLES.forEach(c => {
      const rem = buffRemaining(c.id);
      html += '<span id="buff-' + c.id + '" style="font-size:0.7em;color:var(--green);' + (rem > 0 ? '' : 'display:none;') + '">' + c.icon + ' ' + rem + 's</span> ';
    });
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
    const curCd = G.spellCDs[spell.id] || 0;
    const maxCd = getSpellCD(spell.id);
    bar.innerHTML += \`
      <div class="spell-slot" id="spell-slot-\${spell.id}">
        <div class="s-icon">\${spell.icon}</div>
        <div class="s-name">\${spell.name} Niv.\${G.spellLevels[spell.id]}</div>
        <div class="s-dmg" id="spell-dmg-\${spell.id}">⚔️\${fmt(getSpellDmg(spell.id))}</div>
        <div class="s-cd-label">\${getSpellCD(spell.id).toFixed(1)}s</div>
        <div class="spell-cd-overlay" id="spell-cd-\${spell.id}" style="height:\${curCd > 0 ? (curCd/maxCd*100) : 0}%"></div>
        <div class="spell-cd-text" id="spell-cdtext-\${spell.id}" style="\${curCd <= 0 ? 'display:none' : ''}">\${curCd.toFixed(1)}s</div>
      </div>
    \`;
  });
}

function rebuildSpellUpgrades() {
  const el = document.getElementById('spellUpgradeList');
  if (!el) return;
  el.innerHTML = '';
  getSpells().forEach(spell => {
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
      const lvl = G.talents[t.id]; const cost = t.costBase + lvl; const isMax = lvl >= t.maxLvl;
      html += \`<div class="talent-node \${isMax?'maxed':''}"><div class="t-icon">\${t.icon}</div><div class="t-name">\${t.name}</div><div class="t-level">\${lvl}/\${t.maxLvl}</div><div class="t-desc">\${t.desc}</div><div class="t-cost">\${isMax?'✅ MAX':cost+' ⭐'}</div><button class="btn btn-sm" data-cost-tp="\${isMax?9999:cost}" onclick="buyTalent('\${t.id}')" \${isMax||G.talentPoints<cost?'disabled':''} style="margin-top:4px;">+</button></div>\`;
    });
    html += '</div></div>';
  });

  html += \`<div class="talent-section"><div class="talent-section-title">🌟 Talents Globaux</div><div class="talent-grid">\`;
  globalTalents.forEach(t => {
    const lvl = G.talents[t.id]; const cost = t.costBase + lvl; const isMax = lvl >= t.maxLvl;
    html += \`<div class="talent-node \${isMax?'maxed':''}"><div class="t-icon">\${t.icon}</div><div class="t-name">\${t.name}</div><div class="t-level">\${lvl}/\${t.maxLvl}</div><div class="t-desc">\${t.desc}</div><div class="t-cost">\${isMax?'✅ MAX':cost+' ⭐'}</div><button class="btn btn-sm" data-cost-tp="\${isMax?9999:cost}" onclick="buyTalent('\${t.id}')" \${isMax||G.talentPoints<cost?'disabled':''} style="margin-top:4px;">+</button></div>\`;
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
    html += \`
      <div class="spell-upgrade-card" style="\${owned ? 'opacity:0.6;' : ''}">
        <div class="su-icon">\${u.icon}</div>
        <div class="su-info">
          <div class="su-name">\${u.name}</div>
          <div class="su-desc">\${u.desc}</div>
        </div>
        <div class="su-actions">
          \${owned ? '<div style="color:var(--green);font-family:\\'Cinzel\\',serif;">✅ Acheté</div>'
            : \`<button class="btn" data-cost-gold="\${u.cost}" onclick="buyShopUnlock('\${u.id}')" \${G.gold < u.cost ? 'disabled' : ''}>\${fmt(u.cost)} 🪙</button>\`}
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

function equipPet(petId) {
  if (!G.ownedPets.includes(petId)) return;
  G.activePet = G.activePet === petId ? null : petId;
  rebuildPets();
  rebuildHeroRecap();
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
          <button class="btn btn-sm" data-cost-gold="\${cost}" onclick="upgradePet('\${p.id}')" \${G.gold < cost ? 'disabled' : ''}>⬆ \${fmt(cost)} 🪙</button>
          <div style="font-size:0.6em;color:#555;">→ \${nextVal}%</div>
        </div>
      </div>
    \`;
  });

  if (unowned.length > 0) {
    html += '<div style="font-family:\\'Cinzel\\',serif;color:#555;font-size:0.8em;margin:12px 0 6px;">Pas encore découverts :</div>';
    unowned.forEach(p => {
      html += \`
        <div style="display:flex;align-items:center;gap:12px;padding:8px 10px;margin-bottom:4px;background:rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.04);border-radius:8px;opacity:0.5;">
          <div style="font-size:1.8em;">❓</div>
          <div style="flex:1;">
            <div style="font-family:'Cinzel',serif;color:#555;font-size:0.85em;">???</div>
            <div style="font-size:0.7em;color:#444;">Zone \${p.zone + 1} — \${(p.dropRate * 100).toFixed(2)}% drop</div>
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
  // Init pet levels for already owned pets
  G.ownedPets.forEach(id => { if (!G.petLevels[id]) G.petLevels[id] = 1; });
  calcOffline();
  spawnMob();
} else {
  G = defaultState();
  spawnMob();
}

rebuildSpellBar();
rebuildHeroRecap();
save();
requestAnimationFrame(tick);
`;
    document.body.appendChild(script);

    return () => {
      style.remove();
      script.remove();
    };
  }, []);

  return <div ref={containerRef} />;
}
