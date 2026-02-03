const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// World Boss Configuration
const WORLD_BOSS_CONFIG = {
  spawnInterval: 20 * 60 * 1000,  // 20 minutes
  duration: 5 * 60 * 1000,         // 5 minutes to kill
  baseHp: 50000000000,             // 50 MILLIARDS HP (très difficile, scale avec joueurs)
};

const WORLD_BOSSES = [
  { id: 'voldemort', name: 'Lord Voldemort', icon: '🐍', hpMult: 1.0 },
  { id: 'grindelwald', name: 'Grindelwald', icon: '⚡', hpMult: 1.2 },
  { id: 'basilisk', name: 'Basilic', icon: '🐉', hpMult: 0.8 },
  { id: 'dementor_king', name: 'Roi Détraqueur', icon: '👻', hpMult: 1.5 },
  { id: 'dragon', name: 'Magyar à Pointes', icon: '🔥', hpMult: 1.3 },
];

/**
 * Spawns a World Boss every 20 minutes
 * Deploy with: firebase deploy --only functions
 */
exports.spawnWorldBoss = functions.pubsub
  .schedule('every 20 minutes')
  .onRun(async (context) => {
    const db = admin.database();

    // Check if boss is already active
    const currentSnap = await db.ref('worldBoss/current').get();
    const current = currentSnap.val();

    if (current && current.status === 'active') {
      console.log('Boss already active, skipping spawn');
      return null;
    }

    // Choose a random boss
    const boss = WORLD_BOSSES[Math.floor(Math.random() * WORLD_BOSSES.length)];
    const now = Date.now();
    const hp = Math.floor(WORLD_BOSS_CONFIG.baseHp * boss.hpMult);

    // Create new boss
    await db.ref('worldBoss/current').set({
      id: boss.id,
      name: boss.name,
      icon: boss.icon,
      hp: hp,
      maxHp: hp,
      startedAt: now,
      endsAt: now + WORLD_BOSS_CONFIG.duration,
      status: 'active',
    });

    // Clear previous participants and claims
    await db.ref('worldBoss/participants').remove();
    await db.ref('worldBoss/claims').remove();

    // Set next spawn time
    await db.ref('worldBoss/nextSpawn').set(now + WORLD_BOSS_CONFIG.spawnInterval);

    console.log(`Spawned boss: ${boss.name} with ${hp} HP`);
    return null;
  });

/**
 * Checks if the active boss has expired (time limit reached)
 * Runs every minute
 */
exports.checkBossExpiry = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const db = admin.database();
    const bossSnap = await db.ref('worldBoss/current').get();
    const boss = bossSnap.val();

    if (!boss || boss.status !== 'active') {
      return null;
    }

    const now = Date.now();

    // Check if time expired
    if (now > boss.endsAt) {
      console.log('Boss expired, marking as failed');

      // Archive the boss fight
      const participantsSnap = await db.ref('worldBoss/participants').get();
      const participants = participantsSnap.val() || {};
      const topDamagers = Object.entries(participants)
        .map(([uid, p]) => ({ uid, ...p }))
        .sort((a, b) => b.damage - a.damage)
        .slice(0, 10);

      await db.ref('worldBoss/history/' + now).set({
        name: boss.name,
        maxHp: boss.maxHp,
        remainingHp: boss.hp,
        result: 'expired',
        endedAt: now,
        topDamagers: topDamagers,
      });

      // Mark boss as expired
      await db.ref('worldBoss/current/status').set('expired');
    }

    // Check if boss was defeated
    if (boss.hp <= 0 && boss.status === 'active') {
      console.log('Boss defeated!');

      // Archive the boss fight
      const participantsSnap = await db.ref('worldBoss/participants').get();
      const participants = participantsSnap.val() || {};
      const topDamagers = Object.entries(participants)
        .map(([uid, p]) => ({ uid, ...p }))
        .sort((a, b) => b.damage - a.damage)
        .slice(0, 10);

      await db.ref('worldBoss/history/' + now).set({
        name: boss.name,
        maxHp: boss.maxHp,
        result: 'defeated',
        endedAt: now,
        topDamagers: topDamagers,
      });

      // Mark boss as defeated
      await db.ref('worldBoss/current/status').set('defeated');
    }

    return null;
  });

/**
 * HTTP endpoint to manually trigger a boss spawn (for testing)
 * Call with: https://your-region-your-project.cloudfunctions.net/manualSpawnBoss
 */
exports.manualSpawnBoss = functions.https.onRequest(async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const db = admin.database();

  // Choose a random boss
  const boss = WORLD_BOSSES[Math.floor(Math.random() * WORLD_BOSSES.length)];
  const now = Date.now();
  const hp = Math.floor(WORLD_BOSS_CONFIG.baseHp * boss.hpMult);

  // Create new boss
  await db.ref('worldBoss/current').set({
    id: boss.id,
    name: boss.name,
    icon: boss.icon,
    hp: hp,
    maxHp: hp,
    startedAt: now,
    endsAt: now + WORLD_BOSS_CONFIG.duration,
    status: 'active',
  });

  // Clear previous participants and claims
  await db.ref('worldBoss/participants').remove();
  await db.ref('worldBoss/claims').remove();

  // Set next spawn time
  await db.ref('worldBoss/nextSpawn').set(now + WORLD_BOSS_CONFIG.spawnInterval);

  res.json({ success: true, boss: boss.name, hp: hp });
});
