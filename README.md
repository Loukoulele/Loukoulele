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

## DR400/120 F-GLDT (`/dr400`)

Manuel de vol interactif du Robin DR400/120 "Dauphin" immatriculation F-GLDT. Page statique pure (HTML/CSS/JS vanilla) dans `public/dr400/`, aucune dependance React. Donnees extraites des 88 pages du POH original (PDF scanne, OCR via lecture visuelle page par page).

### Source des donnees

Manuel de vol approuve, Edition 6 (Sept. 1980), Revision 8 (Fev. 1989). Certificat de type N°45 du 11/02/1975. Constructeur : Avions Pierre Robin, Aerodrome de Darois, 21121 Fontaine-les-Dijon.

### Structure de la page

Organisation fidele aux 7 chapitres du manuel de vol :

1. **Chapitre I — Generalites** : dimensions (8,72 x 6,96 x 2,23 m), voilure type Jodel (13,6 m², profil NACA 43012 modifie), volets 3 positions (lisse/15°/60°), empennage monobloc (2,88 m²), train tricycle fixe carene, cabine (1,62 x 1,10 x 1,23 m), moteur Lycoming O-235-L2A (118 CV, 2700 RPM max util. normale), 3 helices autorisees (Mac Cauley / Hoffmann / Sensenich), circuit essence (reservoir AR 110 L), circuit electrique, plan 3 vues, debattements gouvernes
2. **Chapitre II — Limites d'emploi** : vitesses limites (VNE 308, VNO 260, Va 215, VFE 170 km/h), barre anemometre interactive (arcs blanc/vert/jaune/rouge), facteurs de charge (+3,8/-1,9 cat.N, +4,4/-2,2 cat.U), masse max 900 kg, centrage (AV 0,205-0,428 / AR 0,564), plaquettes obligatoires, limitations GMP (tachymetre Mac Cauley vs Sensenich), interdictions (vrilles interdites cat.N)
3. **Chapitre III — Procedures d'urgence** : 6 procedures en accordeon cliquable (feu moteur vol/sol, panne alternateur, givrage carburateur, atterrissage de fortune, vrille involontaire)
4. **Chapitre IV — Procedures normales** : preparation vols + bras de levier (AV 0,41 / AR 1,19 / essence 1,12 / bagages 1,9), visite prevol 8 points, mise en marche (sequence complete + moteur noye), roulage (1200 t/mn), avant decollage (magnetos 1800, chute max 125, ACHEVER), 4 cartes phase de vol (decollage 90-100 km/h, montee Vx 130 / Vy 140-150, croisiere 195-210, approche 110 km/h), amarrage
5. **Chapitre V — Performances** : limitation acoustique (72 dB(A), Sensenich requise), decrochage (3 configs x 3 inclinaisons), **2 onglets croisiere** (Mac Cauley : 2600-2800 RPM vs Sensenich : 2420-2650 RPM), tableaux decollage/atterrissage complets (9 conditions altitude/temperature, 2 masses, beton/herbe), montee (Mac Cauley Vi=140 vs Sensenich Vi=145), plane (finesse ~10 a Vi=135 km/h)
6. **Chapitre VI — Entretien courant** : nettoyage, vidange 50h, pressions train
7. **Chapitre VII — Additifs** : reservoir supplementaire (50 L, bras 1,61 m), stabilisateur de roulis EDO-AIRE-MITCHELL CENTURY 1-AK, helice Sensenich 72 CKS6-0-56, VFR de nuit (13 equipements requis)

### Elements interactifs

- **Video hero** : fond video aerien avec parallax au scroll, overlay gradient
- **Compteurs animes** : les 4 stats (118cv, 900kg, 308km/h, 4h) comptent de 0 a la cible au chargement
- **Ticker de vol simule** : barre ALT/IAS/HDG/RPM avec fluctuations realistes
- **6 jauges rondes SVG** : tachymetre, temp culasses, pression huile, temp huile, pression essence, reservoir. Aiguilles animees au scroll + cliquables pour relancer l'animation
- **Barre anemometre** : segments hover avec zoom sur arc blanc/vert/jaune/rouge
- **Calculateur masse & centrage** : 4 inputs (pax AV, pax AR, essence, bagages), calcul temps reel masse totale + position CG + statut OK/hors limites. Canvas enveloppe CG avec point positionne
- **Accordeons procedures** : clic pour ouvrir/fermer avec chevron anime
- **Lightbox images** : clic sur les images PDF pour zoom plein ecran
- **Tableaux interactifs** : highlight des lignes au survol

### Images

9 images extraites du PDF scanne, converties en WebP (qualite 70, ~1.1 MB total) :

| Fichier | Contenu | Taille |
|---|---|---|
| `planche-bord-88.webp` | Planche de bord "Modele 88" | 139 KB |
| `planche-bord-rev7.webp` | Planche de bord edition 7 | 154 KB |
| `planche-bord-rev8.webp` | Planche de bord revision 8 | 130 KB |
| `circuit-essence.webp` | Schema circuit carburant | 98 KB |
| `circuit-electrique.webp` | Schema circuit electrique | 93 KB |
| `plan-3-vues.webp` | Plan 3 vues (profil, dessus, face) | 76 KB |
| `debattements.webp` | Debattements gouvernes (ailerons, profondeur, direction, volets) | 110 KB |
| `plaquettes-1.webp` | Plaquettes obligatoires cockpit | 134 KB |
| `plaquettes-2.webp` | Plaquettes obligatoires (suite) | 189 KB |

### Fichiers

```
public/dr400/
  index.html          # Page complete (HTML + CSS + JS inline, ~143 KB)
  planche-bord-88.webp
  planche-bord-rev7.webp
  planche-bord-rev8.webp
  circuit-essence.webp
  circuit-electrique.webp
  plan-3-vues.webp
  debattements.webp
  plaquettes-1.webp
  plaquettes-2.webp
```

Total : **~1.3 MB**. Page statique pure, zero JS framework, zero API call. Compatible Vercel freemium.

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
