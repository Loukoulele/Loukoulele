"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Test3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera - perspective for 3D depth
    const camera = new THREE.PerspectiveCamera(60, 800 / 500, 0.1, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 500);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd700, 1);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // Point light for magic glow
    const magicLight = new THREE.PointLight(0x6a1b9a, 2, 10);
    magicLight.position.set(-2, 2, 2);
    scene.add(magicLight);

    // Floor - stone tiles
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d2d4a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid pattern on floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x4a4a6e, 0x3d3d5c);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Create wizard sprite (2D in 3D world)
    const wizardTexture = createWizardTexture();
    const wizardMaterial = new THREE.SpriteMaterial({
      map: wizardTexture,
      transparent: true,
    });
    const wizard = new THREE.Sprite(wizardMaterial);
    wizard.scale.set(2, 3, 1);
    wizard.position.set(-3, 1.5, 0);
    scene.add(wizard);

    // Create monster sprite
    const monsterTexture = createMonsterTexture();
    const monsterMaterial = new THREE.SpriteMaterial({
      map: monsterTexture,
      transparent: true,
    });
    const monster = new THREE.Sprite(monsterMaterial);
    monster.scale.set(2.5, 3, 1);
    monster.position.set(3, 1.5, 0);
    scene.add(monster);

    // Particle system for ambient magic
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Purple/gold magic colors
      const color = Math.random() > 0.5
        ? new THREE.Color(0x6a1b9a)
        : new THREE.Color(0xffd700);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Spell projectile
    let spellMesh: THREE.Mesh | null = null;
    let spellActive = false;
    let spellProgress = 0;

    function castSpell() {
      if (spellActive) return;

      const spellGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const spellMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
      });
      spellMesh = new THREE.Mesh(spellGeometry, spellMaterial);
      spellMesh.position.set(-2, 2, 0);
      scene.add(spellMesh);

      // Add glow
      const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4fc3f7,
        transparent: true,
        opacity: 0.3,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      spellMesh.add(glow);

      spellActive = true;
      spellProgress = 0;
    }

    // Auto-cast every 2 seconds
    const castInterval = setInterval(castSpell, 2000);
    castSpell(); // Initial cast

    // Impact particles
    function createImpact() {
      for (let i = 0; i < 20; i++) {
        const impactGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const impactMaterial = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? 0x00ffff : 0xffffff,
          transparent: true,
          opacity: 1,
        });
        const impact = new THREE.Mesh(impactGeometry, impactMaterial);
        impact.position.set(3, 2, 0);
        scene.add(impact);

        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          Math.random() * 0.2,
          (Math.random() - 0.5) * 0.3
        );

        const animate = () => {
          impact.position.add(velocity);
          velocity.y -= 0.01;
          (impact.material as THREE.MeshBasicMaterial).opacity -= 0.03;
          if ((impact.material as THREE.MeshBasicMaterial).opacity > 0) {
            requestAnimationFrame(animate);
          } else {
            scene.remove(impact);
          }
        };
        animate();
      }

      // Monster hit effect
      monster.material.color.setHex(0xff0000);
      setTimeout(() => {
        monster.material.color.setHex(0xffffff);
      }, 100);
    }

    // Animation loop
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      // Wizard idle animation (bob up and down)
      wizard.position.y = 1.5 + Math.sin(time * 2) * 0.1;

      // Monster idle animation
      monster.position.y = 1.5 + Math.sin(time * 1.5 + 1) * 0.15;

      // Animate particles
      const positions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.01;
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = 0;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Animate spell
      if (spellActive && spellMesh) {
        spellProgress += 0.03;
        spellMesh.position.x = -2 + spellProgress * 5;
        spellMesh.position.y = 2 + Math.sin(spellProgress * Math.PI) * 0.5;

        if (spellProgress >= 1) {
          scene.remove(spellMesh);
          spellMesh = null;
          spellActive = false;
          createImpact();
        }
      }

      // Magic light flicker
      magicLight.intensity = 2 + Math.sin(time * 5) * 0.5;

      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      clearInterval(castInterval);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a12 0%, #1a1a2e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{ color: '#d4a843', marginBottom: '20px', fontFamily: 'serif' }}>
        Test Three.js - Combat 2.5D
      </h1>
      <div
        ref={containerRef}
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(106, 27, 154, 0.5)',
          border: '2px solid #d4a843',
        }}
      />
      <p style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>
        Sprites 2D dans un environnement 3D avec éclairage dynamique et particules
      </p>
      <a href="/hp" style={{ color: '#d4a843', marginTop: '10px' }}>
        ← Retour au jeu
      </a>
    </div>
  );
}

// Create wizard texture using canvas
function createWizardTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  // Simple wizard silhouette
  ctx.fillStyle = '#6a1b9a';
  // Robe
  ctx.beginPath();
  ctx.moveTo(20, 96);
  ctx.lineTo(44, 96);
  ctx.lineTo(40, 50);
  ctx.lineTo(24, 50);
  ctx.closePath();
  ctx.fill();

  // Body
  ctx.fillStyle = '#4a148c';
  ctx.fillRect(26, 45, 12, 20);

  // Head
  ctx.fillStyle = '#d4c4b0';
  ctx.beginPath();
  ctx.arc(32, 38, 8, 0, Math.PI * 2);
  ctx.fill();

  // Hat
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.moveTo(20, 40);
  ctx.lineTo(32, 10);
  ctx.lineTo(44, 40);
  ctx.closePath();
  ctx.fill();

  // Wand
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(44, 55);
  ctx.lineTo(55, 45);
  ctx.stroke();

  // Wand tip glow
  ctx.fillStyle = '#00ffff';
  ctx.beginPath();
  ctx.arc(55, 45, 4, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// Create monster texture
function createMonsterTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  // Goblin-like monster
  ctx.fillStyle = '#2e7d32';
  // Body
  ctx.beginPath();
  ctx.ellipse(32, 60, 18, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#388e3c';
  ctx.beginPath();
  ctx.ellipse(32, 30, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(26, 28, 4, 0, Math.PI * 2);
  ctx.arc(38, 28, 4, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(27, 28, 2, 0, Math.PI * 2);
  ctx.arc(39, 28, 2, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#388e3c';
  ctx.beginPath();
  ctx.moveTo(14, 25);
  ctx.lineTo(20, 35);
  ctx.lineTo(22, 22);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(50, 25);
  ctx.lineTo(44, 35);
  ctx.lineTo(42, 22);
  ctx.closePath();
  ctx.fill();

  // Arms
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(10, 50, 8, 25);
  ctx.fillRect(46, 50, 8, 25);

  // Claws
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(8, 72, 4, 8);
  ctx.fillRect(14, 72, 4, 8);
  ctx.fillRect(46, 72, 4, 8);
  ctx.fillRect(52, 72, 4, 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}
