"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Custom vignette shader
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    darkness: { value: 0.6 },  // Moins sombre
    offset: { value: 1.5 },    // Plus large
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float darkness;
    uniform float offset;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vig = clamp(1.0 - dot(uv, uv), 0.0, 1.0);
      texel.rgb *= mix(1.0 - darkness, 1.0, vig);
      gl_FragColor = texel;
    }
  `,
};

// Color correction shader - tons bleu/cyan saturés
const ColorCorrectionShader = {
  uniforms: {
    tDiffuse: { value: null },
    powRGB: { value: new THREE.Vector3(0.95, 0.95, 0.9) },
    mulRGB: { value: new THREE.Vector3(0.9, 1.1, 1.4) }, // Blue/cyan boost
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 powRGB;
    uniform vec3 mulRGB;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      texel.rgb = pow(texel.rgb, powRGB) * mulRGB;
      gl_FragColor = texel;
    }
  `,
};

export default function Test3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = 900;
    const height = 550;

    // Scene setup - fog léger bleu
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a2a4a, 0.015); // Plus léger pour voir le fond

    // Camera - vue de côté, plus basse, style RPG
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    camera.position.set(8, 3, 8); // Vue de côté en diagonale
    camera.lookAt(0, 1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap; // Meilleur pour éviter les artefacts
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8; // Plus lumineux
    containerRef.current.appendChild(renderer.domElement);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.6,  // strength (réduit pour pas trop éblouir)
      0.4,  // radius
      0.7   // threshold (plus bas = plus d'éléments brillent)
    );
    composer.addPass(bloomPass);

    const vignettePass = new ShaderPass(VignetteShader);
    composer.addPass(vignettePass);

    const colorPass = new ShaderPass(ColorCorrectionShader);
    composer.addPass(colorPass);

    // ============ LIGHTING ============

    // Ambient - plus lumineux
    const ambientLight = new THREE.AmbientLight(0x4466cc, 1.8);
    scene.add(ambientLight);

    // Hemisphere light (SKYLIGHT) - très fort pour éclairer la scène
    const hemiLight = new THREE.HemisphereLight(0x88aaff, 0x224488, 2.5);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // SOLEIL au loin - visible glow
    const sunGeo = new THREE.SphereGeometry(2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0x88ddff,
      transparent: true,
      opacity: 0.8,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(-15, 12, -20);
    scene.add(sun);

    // Glow autour du soleil
    const sunGlowGeo = new THREE.SphereGeometry(4, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0x66bbff,
      transparent: true,
      opacity: 0.3,
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    sunGlow.position.copy(sun.position);
    scene.add(sunGlow);

    // Lumière du soleil
    const sunLight = new THREE.PointLight(0x88ccff, 15, 100);
    sunLight.position.copy(sun.position);
    scene.add(sunLight);

    // SPOTLIGHT principal - plus intense
    const spotLight = new THREE.SpotLight(0x88ddff, 60);
    spotLight.position.set(0, 15, 5);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    spotLight.decay = 1;
    spotLight.distance = 50;
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.001;
    spotLight.shadow.normalBias = 0.02;
    scene.add(spotLight);

    // Fill light pour les personnages (devant)
    const fillLight = new THREE.DirectionalLight(0xaaccff, 1.5);
    fillLight.position.set(0, 5, 10);
    scene.add(fillLight);

    // Main directional light - plus fort
    const moonLight = new THREE.DirectionalLight(0xaaddff, 3);
    moonLight.position.set(-5, 15, 5);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 50;
    moonLight.shadow.camera.left = -15;
    moonLight.shadow.camera.right = 15;
    moonLight.shadow.camera.top = 15;
    moonLight.shadow.camera.bottom = -15;
    moonLight.shadow.bias = -0.001; // Fix shadow stripes
    moonLight.shadow.normalBias = 0.02;
    scene.add(moonLight);

    // Wizard magic light (purple)
    const wizardLight = new THREE.PointLight(0x9c27b0, 3, 8);
    wizardLight.position.set(-3, 2.5, 1); // Lumière sur le wizard
    scene.add(wizardLight);

    // Monster aura light (red)
    const monsterLight = new THREE.PointLight(0xff1744, 2, 6);
    monsterLight.position.set(3, 2, -1); // Lumière sur le monstre
    scene.add(monsterLight);

    // Torches
    const createTorch = (x: number, z: number) => {
      const light = new THREE.PointLight(0xff6600, 1.5, 6);
      light.position.set(x, 2.5, z);
      scene.add(light);

      // Torch holder
      const holderGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.5, 8);
      const holderMat = new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.9 });
      const holder = new THREE.Mesh(holderGeo, holderMat);
      holder.position.set(x, 1.5, z);
      holder.castShadow = true;
      scene.add(holder);

      return light;
    };

    const torch1 = createTorch(-5, -3);
    const torch2 = createTorch(5, -3);
    const torch3 = createTorch(-5, 3);
    const torch4 = createTorch(5, 3);

    // ============ ENVIRONMENT - DUNGEON GLB ============

    // GLTF Loader (utilisé pour tous les modèles)
    const loader = new GLTFLoader();

    // Load the dungeon arena
    let dungeonModel: THREE.Group | null = null;
    loader.load('/models/game_level_design_-_water_stone_dungeon.glb', (gltf) => {
      dungeonModel = gltf.scene;

      // Adjust scale and position
      dungeonModel.scale.set(2, 2, 2);
      dungeonModel.position.set(0, -1, 0);

      // Enable shadows
      dungeonModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(dungeonModel);
      console.log('Dungeon loaded!');
    }, undefined, (error) => {
      console.error('Error loading dungeon:', error);
    });

    // Keep some crystals for ambiance
    const crystals: THREE.Mesh[] = [];
    const crystalPositions = [
      { x: -6, z: -4 }, { x: 6, z: -4 }, { x: -6, z: 4 }, { x: 6, z: 4 }
    ];
    crystalPositions.forEach((pos, i) => {
      const crystalGeo = new THREE.OctahedronGeometry(0.3, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x9c27b0,
        emissive: 0x6a1b9a,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(pos.x, 4, pos.z);
      scene.add(crystal);
      crystals.push(crystal);
    });

    // ============ CHARACTERS ============

    // Wizard - Loaded from GLTF
    const wizardGroup = new THREE.Group();
    wizardGroup.position.set(-3, 0, 1); // À gauche, légèrement avancé
    scene.add(wizardGroup);

    // Magic orb for the wizard - plus grande et repositionnée
    const orbGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00aaaa,
      emissiveIntensity: 2,
      roughness: 0.1,
      metalness: 0.9,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(1.2, 4.5, 0.5); // Ajusté pour le modèle plus grand
    wizardGroup.add(orb);

    // Load the fantasy wizard model with animations
    let wizardMixer: THREE.AnimationMixer | null = null;
    let wizardModel: THREE.Group | null = null;
    let idleAction: THREE.AnimationAction | null = null;
    let castAction: THREE.AnimationAction | null = null;

    // Function to play cast animation - mode statique, juste un effet visuel
    const playCastAnimation = () => {
      // Petit effet de recul quand le wizard cast
      if (wizardModel) {
        wizardModel.rotation.y = Math.PI * 0.7; // Légère rotation
        setTimeout(() => {
          if (wizardModel) {
            wizardModel.rotation.y = Math.PI * 0.6; // Retour position normale
          }
        }, 200);
      }
    };

    loader.load('/models/fantasy_wizard.glb', (gltf) => {
      const model = gltf.scene;
      wizardModel = model; // Stocker la référence

      // Adjust scale and position - 4x plus grand
      model.scale.set(4, 4, 4);
      model.position.y = 0;
      model.rotation.y = Math.PI * 0.6; // Face vers le monstre (à droite)

      // Enable shadows
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      wizardGroup.add(model);

      // ANIMATIONS DÉSACTIVÉES - mode statique
      console.log('Animations disponibles:', gltf.animations.length);
      // Le modèle reste en pose statique, pas d'animation
      console.log('Mode statique activé');

      console.log('Fantasy Wizard loaded!');
    }, undefined, (error) => {
      console.error('Error loading wizard model:', error);
    });

    // Monster - Demon style
    const monsterGroup = new THREE.Group();

    // Body
    const mBodyGeo = new THREE.SphereGeometry(1, 16, 16);
    mBodyGeo.scale(1, 1.3, 0.8);
    const mBodyMat = new THREE.MeshStandardMaterial({
      color: 0x8b0000,
      roughness: 0.6,
    });
    const mBody = new THREE.Mesh(mBodyGeo, mBodyMat);
    mBody.position.y = 1.8;
    mBody.castShadow = true;
    monsterGroup.add(mBody);

    // Head
    const mHeadGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const mHead = new THREE.Mesh(mHeadGeo, mBodyMat);
    mHead.position.y = 3.2;
    mHead.castShadow = true;
    monsterGroup.add(mHead);

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.12, 0.7, 8);
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.5,
    });
    const horn1 = new THREE.Mesh(hornGeo, hornMat);
    horn1.position.set(-0.35, 3.7, 0);
    horn1.rotation.z = 0.4;
    monsterGroup.add(horn1);

    const horn2 = new THREE.Mesh(hornGeo, hornMat);
    horn2.position.set(0.35, 3.7, 0);
    horn2.rotation.z = -0.4;
    monsterGroup.add(horn2);

    // Eyes (glowing)
    const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(-0.2, 3.3, 0.5);
    monsterGroup.add(eye1);

    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye2.position.set(0.2, 3.3, 0.5);
    monsterGroup.add(eye2);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.2, 0.15, 1.5, 8);
    const arm1 = new THREE.Mesh(armGeo, mBodyMat);
    arm1.position.set(-1.1, 2, 0);
    arm1.rotation.z = 0.8;
    arm1.castShadow = true;
    monsterGroup.add(arm1);

    const arm2 = new THREE.Mesh(armGeo, mBodyMat);
    arm2.position.set(1.1, 2, 0);
    arm2.rotation.z = -0.8;
    arm2.castShadow = true;
    monsterGroup.add(arm2);

    // Claws
    const clawGeo = new THREE.ConeGeometry(0.08, 0.4, 6);
    const clawMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    for (let i = 0; i < 3; i++) {
      const claw1 = new THREE.Mesh(clawGeo, clawMat);
      claw1.position.set(-1.6 - i * 0.12, 1.3 + i * 0.05, 0);
      claw1.rotation.z = 1.2;
      monsterGroup.add(claw1);

      const claw2 = new THREE.Mesh(clawGeo, clawMat);
      claw2.position.set(1.6 + i * 0.12, 1.3 + i * 0.05, 0);
      claw2.rotation.z = -1.2;
      monsterGroup.add(claw2);
    }

    monsterGroup.position.set(3, 0, -1); // À droite, face au wizard
    scene.add(monsterGroup);

    // ============ PARTICLES ============

    // Ambient magic particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.1; colors[i * 3 + 2] = 0.8; // Purple
      } else if (colorChoice < 0.7) {
        colors[i * 3] = 0.83; colors[i * 3 + 1] = 0.66; colors[i * 3 + 2] = 0.26; // Gold
      } else {
        colors[i * 3] = 0; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.8; // Cyan
      }

      sizes[i] = Math.random() * 0.15 + 0.05;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ============ SPELL SYSTEM ============

    // Magic style laser spells
    interface LaserSpell {
      beam: THREE.Mesh;
      glow: THREE.Mesh;
      glow2: THREE.Mesh;
      startLight: THREE.PointLight;
      midLight: THREE.PointLight;
      light: THREE.PointLight;
      type: string;
      life: number;
    }

    const activeSpells: LaserSpell[] = [];

    // Spell colors
    const SPELL_COLORS: Record<string, { main: number; glow: number; name: string }> = {
      fulgur: { main: 0xff0000, glow: 0xff4444, name: 'Fulgur' },          // Rouge
      expulso: { main: 0xff0000, glow: 0xff6666, name: 'Expulso' },        // Rouge
      mortalis: { main: 0x00ff00, glow: 0x44ff44, name: 'Mortalis' },      // Vert
      aegis: { main: 0x88ccff, glow: 0xaaddff, name: 'Aegis' },            // Bleu clair
      ignis: { main: 0xff6600, glow: 0xff9944, name: 'Ignis' },            // Orange
    };

    function castSpell(type: string) {
      // Play wizard cast animation
      playCastAnimation();

      // Pick a random HP spell
      const spellKeys = Object.keys(SPELL_COLORS);
      const spellKey = spellKeys[Math.floor(Math.random() * spellKeys.length)];
      const spell = SPELL_COLORS[spellKey];

      // Start and end positions
      const startPos = new THREE.Vector3(-2.5, 2.5, 1); // Wizard wand
      const endPos = new THREE.Vector3(3, 2, -1);       // Monster

      // Calculate beam geometry
      const direction = new THREE.Vector3().subVectors(endPos, startPos);
      const length = direction.length();
      const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);

      // Create laser beam (cylinder) - plus épais et lumineux
      const beamGeo = new THREE.CylinderGeometry(0.05, 0.05, length, 12);
      const beamMat = new THREE.MeshBasicMaterial({
        color: spell.main,
        transparent: true,
        opacity: 1,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);

      // Create outer glow - plus grand
      const glowGeo = new THREE.CylinderGeometry(0.15, 0.15, length, 12);
      const glowMat = new THREE.MeshBasicMaterial({
        color: spell.glow,
        transparent: true,
        opacity: 0.5,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);

      // Create extra outer glow for more effect
      const glow2Geo = new THREE.CylinderGeometry(0.25, 0.25, length, 12);
      const glow2Mat = new THREE.MeshBasicMaterial({
        color: spell.glow,
        transparent: true,
        opacity: 0.2,
      });
      const glow2 = new THREE.Mesh(glow2Geo, glow2Mat);

      // Position and rotate beam to point from wizard to monster
      beam.position.copy(midPoint);
      glow.position.copy(midPoint);
      glow2.position.copy(midPoint);

      // Rotate to align with direction
      beam.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize()
      );
      glow.quaternion.copy(beam.quaternion);
      glow2.quaternion.copy(beam.quaternion);

      // Add light at wizard wand (start)
      const startLight = new THREE.PointLight(spell.main, 8, 4);
      startLight.position.copy(startPos);

      // Add light at impact point - plus intense
      const light = new THREE.PointLight(spell.main, 10, 6);
      light.position.copy(endPos);

      // Add light at midpoint for continuous glow
      const midLight = new THREE.PointLight(spell.main, 5, 4);
      midLight.position.copy(midPoint);

      scene.add(beam);
      scene.add(glow);
      scene.add(glow2);
      scene.add(startLight);
      scene.add(light);
      scene.add(midLight);

      activeSpells.push({
        beam,
        glow,
        glow2,
        startLight,
        midLight,
        light,
        type: spellKey,
        life: 0.4, // Durée du laser en secondes
      });

      // Create impact immediately
      createImpact(spellKey);
    }

    function createImpact(type: string) {
      const spell = SPELL_COLORS[type] || SPELL_COLORS.fulgur;
      const impactColor = spell.main;

      // Particle burst
      for (let i = 0; i < 30; i++) {
        const particleGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
          color: impactColor,
          transparent: true,
          opacity: 1,
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        particle.position.set(3, 2, -1); // Impact sur le monstre
        scene.add(particle);

        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          Math.random() * 0.3,
          (Math.random() - 0.5) * 0.4
        );

        const animate = () => {
          particle.position.add(velocity);
          velocity.y -= 0.015;
          (particle.material as THREE.MeshBasicMaterial).opacity -= 0.025;
          if ((particle.material as THREE.MeshBasicMaterial).opacity > 0) {
            requestAnimationFrame(animate);
          } else {
            scene.remove(particle);
            particle.geometry.dispose();
            (particle.material as THREE.MeshBasicMaterial).dispose();
          }
        };
        setTimeout(animate, i * 10);
      }

      // Impact flash
      const flashGeo = new THREE.SphereGeometry(1, 16, 16);
      const flashMat = new THREE.MeshBasicMaterial({
        color: impactColor,
        transparent: true,
        opacity: 0.8,
      });
      const flash = new THREE.Mesh(flashGeo, flashMat);
      flash.position.set(3, 2, -1); // Flash sur le monstre
      scene.add(flash);

      const expandFlash = () => {
        flash.scale.multiplyScalar(1.15);
        (flash.material as THREE.MeshBasicMaterial).opacity -= 0.1;
        if ((flash.material as THREE.MeshBasicMaterial).opacity > 0) {
          requestAnimationFrame(expandFlash);
        } else {
          scene.remove(flash);
          flash.geometry.dispose();
          (flash.material as THREE.MeshBasicMaterial).dispose();
        }
      };
      expandFlash();

      // Monster hit reaction
      monsterGroup.position.x += 0.3;
      (mBody.material as THREE.MeshStandardMaterial).emissive.setHex(impactColor);
      (mBody.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
      setTimeout(() => {
        monsterGroup.position.x = 3;
        (mBody.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }, 150);

      // Camera shake
      const originalPos = camera.position.clone();
      const shakeIntensity = 0.15;
      let shakeTime = 0;
      const shake = () => {
        shakeTime++;
        if (shakeTime < 8) {
          camera.position.x = originalPos.x + (Math.random() - 0.5) * shakeIntensity;
          camera.position.y = originalPos.y + (Math.random() - 0.5) * shakeIntensity;
          requestAnimationFrame(shake);
        } else {
          camera.position.copy(originalPos);
        }
      };
      shake();
    }

    // Auto-cast magic spells
    const castInterval = setInterval(() => {
      castSpell('random'); // Le sort est choisi aléatoirement dans castSpell
    }, 1200); // Un peu plus rapide
    setTimeout(() => castSpell('random'), 500);

    // ============ ANIMATION LOOP ============

    let time = 0;
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;

      // Mode statique - pas d'animation mixer

      // Orb pulsing effect
      orb.scale.setScalar(1 + Math.sin(time * 4) * 0.1);

      // Monster idle animation
      monsterGroup.position.y = Math.sin(time * 1.5 + 1) * 0.08;
      monsterGroup.rotation.y = Math.sin(time * 0.7) * 0.1;

      // Crystal rotation
      crystals.forEach((crystal, i) => {
        crystal.rotation.y = time + i * Math.PI / 2;
        crystal.position.y = 4 + Math.sin(time * 2 + i) * 0.1;
      });

      // Torch flicker
      [torch1, torch2, torch3, torch4].forEach((torch, i) => {
        torch.intensity = 1.5 + Math.sin(time * 10 + i * 2) * 0.3 + Math.random() * 0.2;
      });

      // Wizard light pulse
      wizardLight.intensity = 3 + Math.sin(time * 5) * 1;

      // Particle animation
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += delta * 0.5;
        if (positions[i * 3 + 1] > 8) {
          positions[i * 3 + 1] = 0;
          positions[i * 3] = (Math.random() - 0.5) * 20;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Animate laser spells - fade out with light effects
      for (let i = activeSpells.length - 1; i >= 0; i--) {
        const spell = activeSpells[i];
        spell.life -= delta;

        // Fade out the beam and all glows
        const opacity = Math.max(0, spell.life / 0.4);
        (spell.beam.material as THREE.MeshBasicMaterial).opacity = opacity;
        (spell.glow.material as THREE.MeshBasicMaterial).opacity = opacity * 0.5;
        (spell.glow2.material as THREE.MeshBasicMaterial).opacity = opacity * 0.2;

        // Fade out all lights
        spell.startLight.intensity = opacity * 8;
        spell.midLight.intensity = opacity * 5;
        spell.light.intensity = opacity * 10;

        // Remove when faded
        if (spell.life <= 0) {
          scene.remove(spell.beam);
          scene.remove(spell.glow);
          scene.remove(spell.glow2);
          scene.remove(spell.startLight);
          scene.remove(spell.midLight);
          scene.remove(spell.light);
          spell.beam.geometry.dispose();
          spell.glow.geometry.dispose();
          spell.glow2.geometry.dispose();
          (spell.beam.material as THREE.MeshBasicMaterial).dispose();
          (spell.glow.material as THREE.MeshBasicMaterial).dispose();
          (spell.glow2.material as THREE.MeshBasicMaterial).dispose();
          activeSpells.splice(i, 1);
        }
      }

      composer.render();
    }
    animate();

    // Cleanup
    return () => {
      clearInterval(castInterval);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      composer.dispose();
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #05050a 0%, #0a0a15 50%, #0f0f1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Georgia, serif',
    }}>
      <h1 style={{
        color: '#d4a843',
        marginBottom: '20px',
        fontSize: '2em',
        textShadow: '0 0 20px rgba(212, 168, 67, 0.5)',
        letterSpacing: '3px',
      }}>
        WAND IDLE - Combat Arena
      </h1>
      <div
        ref={containerRef}
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 0 50px rgba(106, 27, 154, 0.4), 0 0 100px rgba(0, 0, 0, 0.8), inset 0 0 50px rgba(0, 0, 0, 0.3)',
          border: '3px solid #2a1a3a',
        }}
      />
      <div style={{
        marginTop: '20px',
        color: '#888',
        textAlign: 'center',
        maxWidth: '600px',
        lineHeight: '1.6',
      }}>
        <p style={{ color: '#d4a843', marginBottom: '10px' }}>
          Environnement 3D avec post-processing
        </p>
        <p style={{ fontSize: '0.9em' }}>
          Bloom • Vignette • Color Grading • Dynamic Lighting • Particles
        </p>
      </div>
      <a href="/hp" style={{
        color: '#d4a843',
        marginTop: '20px',
        textDecoration: 'none',
        padding: '10px 20px',
        border: '1px solid #d4a843',
        borderRadius: '8px',
        transition: 'all 0.3s',
      }}>
        ← Retour au jeu
      </a>
    </div>
  );
}
