# World Boss Multiplayer Setup

## Overview
This document explains how to configure the World Boss multiplayer feature for Wand Idle.

## Prerequisites
- Firebase project
- Discord Developer Application
- Firebase CLI installed (`npm install -g firebase-tools`)

## Setup Steps

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named `wand-idle-hp` (or your chosen name)
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "OpenID Connect (OIDC)"
   - Add a new OIDC provider with:
     - Provider ID: `oidc.discord`
     - Name: Discord
     - Client ID: (from Discord Developer Portal)
     - Client Secret: (from Discord Developer Portal)
     - Issuer URL: `https://discord.com`

4. Enable **Realtime Database**:
   - Go to Realtime Database > Create Database
   - Start in test mode (we'll add rules later)
   - Copy the database URL

5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and add a Web app
   - Copy the config values

### 2. Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URL: `https://wand-idle-hp.firebaseapp.com/__/auth/handler`
   (Replace with your Firebase auth domain)
5. Copy Client ID and Client Secret

### 3. Environment Variables

Update `.env.local` with your actual values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=wand-idle-hp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://wand-idle-hp-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=wand-idle-hp
```

### 4. Database Rules

Deploy the database rules to Firebase:

```bash
firebase login
firebase deploy --only database
```

Or manually copy the rules from `database.rules.json` to your Firebase Console.

### 5. Deploy Cloud Functions

The Cloud Functions handle automatic boss spawning:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

This will deploy:
- `spawnWorldBoss`: Runs every 20 minutes to spawn a new boss
- `checkBossExpiry`: Runs every minute to check if boss time expired
- `manualSpawnBoss`: HTTP endpoint for testing

### 6. Test the Feature

1. Run the development server: `npm run dev`
2. Open `http://localhost:3000/hp`
3. Click the "Discord" button to log in
4. Go to the "Boss" tab
5. To manually spawn a boss for testing:
   ```bash
   curl -X POST https://your-region-wand-idle-hp.cloudfunctions.net/manualSpawnBoss
   ```

## How It Works

### Boss Spawn Cycle
- A World Boss spawns every 20 minutes
- Players have 5 minutes to defeat it
- If defeated, players can claim rewards based on contribution
- If time expires, the boss escapes and no rewards are given

### Damage Calculation
- Damage per attack = Player's DPS × 0.5 seconds
- Attack cooldown: 0.5 seconds

### Rewards (based on rank)
| Rank | Gems | Gold |
|------|------|------|
| #1 | 50 | 1,000,000 |
| Top 3 | 25 | 500,000 |
| Top 10% | 10 | 200,000 |
| Top 50% | 3 | 50,000 |
| Participation | 1 | 10,000 |

### Boss Types
- Seigneur Ombral (🐍) - 500M HP
- Malachar (⚡) - 600M HP
- Grand Serpent (🐉) - 400M HP
- Roi Spectral (👻) - 750M HP
- Dragon Cornu (🔥) - 650M HP

## Troubleshooting

### "Firebase not configured"
- Check that `.env.local` has valid credentials
- Make sure the env variables start with `NEXT_PUBLIC_`

### "Erreur de connexion" on Discord login
- Verify Discord OAuth2 redirect URL is correct
- Check that OIDC provider is configured in Firebase Auth

### Boss not spawning
- Verify Cloud Functions are deployed
- Check Firebase Functions logs for errors
- Use the manual spawn endpoint for testing

## Vercel Deployment

When deploying to Vercel, add the environment variables in:
Project Settings > Environment Variables

Add all four `NEXT_PUBLIC_FIREBASE_*` variables.
