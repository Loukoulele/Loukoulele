# Loukoulele - Portfolio spatial interactif

Site personnel deploye sur **Vercel** : [loukoulele.fr](https://www.loukoulele.fr)

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript 5
- **Tailwind CSS 4** pour le styling utilitaire
- **Framer Motion** pour les animations d'entree (titre, lignes)
- **Canvas HTML5** pour tout le background (pas de lib 3D)
- **@imgly/background-removal** pour le BG remover IA (cote client, pas de serveur)

## Structure

```
src/app/
  page.tsx        # Page principale - hero spatial interactif
  globals.css     # CSS global (cursor-glow, text-glow)
  layout.tsx      # Layout racine (Geist font, meta FR)
  bg/page.tsx     # Application BG Remover complete
```

## Page principale (`/`)

Page unique plein ecran (pas de scroll) avec un canvas fullscreen qui contient :

### Etoiles
- 1000 etoiles reparties en 3 couches de profondeur (500 loin, 350 moyen, 150 proches)
- **Parallax souris** : chaque couche bouge a une vitesse differente quand on deplace la souris
- **Repulsion souris** : les etoiles sont poussees par le curseur (rayon 150px) et reviennent elastiquement a leur position

### Planete WASP-76b (droite, 78% x 35%)
- Exoplanete ou il pleut du fer liquide
- Corps en degrade bleu profond / violet avec volutes atmospheriques en rotation
- Lueur de fer fondu sur le terminateur jour/nuit
- Ombre 3D realiste (eclairage depuis la gauche)
- Atmosphere bleue sur le bord
- **Pluie de fer 3D** : 25 particules dorees qui spiralent depuis l'espace vers la planete avec trainee
- **HUD sci-fi** : panneau a crochets avec donnees (masse 0.92 Mj, temp 2228K, pluie de fer liquide), barre de scan, point de statut

### Planete 55 Cancri e (gauche, 18% x 60%)
- Super-terre potentiellement composee de diamant/carbone
- Surface cristalline bleu-argent avec bandes de refraction prismatiques arc-en-ciel en rotation
- Facettes geometriques tournantes + eclats de diamant en orbite (forme etoile 4 branches)
- Atmosphere bleu glace
- **HUD sci-fi** : meme style, donnees (masse 8.63 M-Terre, temp 2573K, composition C/diamant)

### Autres effets
- **Hover zoom** : les planetes + HUD grossissent de ~35-40% au survol souris (transition fluide lerp 6%/frame)
- **Etoiles filantes** : apparaissent aleatoirement (~15% de chance toutes les 2s)
- **Nebuleuses** : 4 gradients radiaux colores (violet, bleu, cyan) en fond avec parallax
- **Auras translucides** : 5 voiles colores (violet, bleu, cyan, turquoise) qui derivent et respirent (compositeOperation screen)
- **Coordonnees dynamiques** : sous le titre "LOUKOULELE", les coords changent selon la position souris (variation +/-0.25 deg autour de Paris 48.8566N / 2.3522E)
- **Cursor glow** : halo lumineux 300px qui suit la souris (CSS radial-gradient)

### Titre
- "LOUKOULELE" en lettres animees une par une (Framer Motion, delay 0.07s/lettre)
- Ligne decorative verticale en haut + underline anime horizontal

## BG Remover (`/bg`)

Application complete de suppression de fond d'image. Portee depuis app.py (Flask/rembg) vers Next.js client-side.

Le composant injecte du HTML brut + JS imperatif dans un div via useEffect (pas de React pour l'editeur canvas). Tout le code est dans un seul fichier `bg/page.tsx`.

### Outils
- **Baguette magique** : clic pour selectionner la couleur cible, maintenir + tirer pour augmenter la tolerance en temps reel. Preview rouge semi-transparent (overlay canvas) de la zone qui sera supprimee. Relacher pour appliquer. Pas de slider de tolerance, tout est controle par le drag.
- **Lasso garder** : dessiner une zone au lasso, tout l'exterieur est supprime
- **Lasso supprimer** : dessiner une zone au lasso, l'interieur est supprime
- **Crop** : dessiner un rectangle pour recadrer (preview avec zone assombrie)
- **Auto (IA)** : suppression automatique via @imgly/background-removal (execute entierement cote client, pas de serveur)
- **Redimensionner** : modal avec largeur/hauteur en px, option conserver le ratio
- **Recentrer** : reset zoom/pan a 1x

### Interactions
- Zoom molette (0.1x a 10x)
- Pan clic milieu (molette)
- Undo bouton + Ctrl+Z (historique ImageData)
- Telecharger en PNG
- Drag & drop ou clic pour charger une image
- Overlay canvas pour les previews (lasso, crop, baguette magique)

## Dev

```bash
npm install
npm run dev     # localhost:3000
npm run build   # build production
```

## Deploiement

Push sur `main` → Vercel deploie automatiquement.

Repo GitHub : `github.com/Loukoulele/Loukoulele`

**DNS (OVH)** :
- A record : `loukoulele.fr` → `76.76.21.21`
- CNAME : `www` → `cname.vercel-dns.com`
