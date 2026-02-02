"use client";

import { useEffect, useRef } from "react";

export default function BgRemover() {
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = `
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .bg-app {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: #fff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
        }
        .bg-app h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(to bottom, #fff, rgba(255,255,255,0.6));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .bg-app .subtitle {
            color: rgba(255,255,255,0.4);
            margin-bottom: 40px;
            font-size: 1rem;
        }
        .bg-app .drop-zone {
            width: 100%;
            max-width: 500px;
            border: 2px dashed rgba(255,255,255,0.15);
            border-radius: 24px;
            padding: 60px 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            background: rgba(255,255,255,0.03);
            backdrop-filter: blur(20px);
        }
        .bg-app .drop-zone:hover, .bg-app .drop-zone.dragover {
            border-color: rgba(168,85,247,0.5);
            background: rgba(168,85,247,0.05);
        }
        .bg-app .drop-zone p { color: rgba(255,255,255,0.5); font-size: 1.1rem; margin-bottom: 16px; }
        .bg-app .drop-zone .browse {
            display: inline-block; padding: 10px 24px;
            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
            border-radius: 100px; color: #fff; font-size: 0.9rem; font-weight: 500;
            cursor: pointer; transition: all 0.3s;
        }
        .bg-app .drop-zone .browse:hover { background: rgba(255,255,255,0.2); }
        .bg-app input[type="file"] { display: none; }

        .bg-app .loader { display: none; margin-top: 30px; text-align: center; }
        .bg-app .loader.active { display: block; }
        .bg-app .spinner {
            width: 40px; height: 40px;
            border: 3px solid rgba(255,255,255,0.1); border-top-color: #a855f7;
            border-radius: 50%; animation: bgspin 0.8s linear infinite; margin: 0 auto 16px;
        }
        @keyframes bgspin { to { transform: rotate(360deg); } }
        .bg-app .loader p { color: rgba(255,255,255,0.5); }

        .bg-app .editor { display: none; margin-top: 30px; width: 100%; max-width: 900px; }
        .bg-app .editor.active { display: block; }

        .bg-app .toolbar {
            display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
            margin-bottom: 16px; padding: 12px 16px;
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px; backdrop-filter: blur(20px);
        }
        .bg-app .tool-btn {
            padding: 8px 16px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
            cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.3s;
        }
        .bg-app .tool-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .bg-app .tool-btn.active { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.4); color: #fff; }
        .bg-app .tool-sep { width: 1px; height: 24px; background: rgba(255,255,255,0.1); margin: 0 4px; }

        .bg-app .canvas-wrap {
            position: relative; display: inline-block; border-radius: 16px; overflow: hidden;
            background-image: linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
                              linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
                              linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            max-height: 70vh; max-width: 100%; display: flex; align-items: center; justify-content: center;
        }
        .bg-app .canvas-wrap canvas { display: block; cursor: crosshair; transform-origin: center center; max-width: 100%; max-height: 70vh; object-fit: contain; }

        .bg-app .actions {
            display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap;
        }
        .bg-app .action-btn {
            display: inline-block; padding: 10px 24px; border-radius: 100px;
            border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05);
            color: rgba(255,255,255,0.7); font-weight: 500; font-size: 0.9rem;
            cursor: pointer; transition: all 0.3s; text-decoration: none;
        }
        .bg-app .action-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .bg-app .action-btn.primary {
            background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.3); color: #fff;
        }
        .bg-app .action-btn.primary:hover { background: rgba(168,85,247,0.3); }

        .bg-app .color-preview {
            width: 24px; height: 24px; border-radius: 6px;
            border: 2px solid rgba(255,255,255,0.2); background: #000;
        }

        .bg-app .modal-overlay {
            display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px); z-index: 100;
            align-items: center; justify-content: center;
        }
        .bg-app .modal-overlay.active { display: flex; }
        .bg-app .modal {
            background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px; padding: 32px; min-width: 320px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .bg-app .modal h3 {
            font-size: 1.2rem; font-weight: 600; color: #fff; margin-bottom: 20px; text-align: center;
        }
        .bg-app .modal-fields { display: flex; gap: 12px; margin-bottom: 20px; }
        .bg-app .modal-field { flex: 1; }
        .bg-app .modal-field label {
            display: block; color: rgba(255,255,255,0.5); font-size: 0.8rem;
            margin-bottom: 6px; font-weight: 500;
        }
        .bg-app .modal-field input {
            width: 100%; padding: 10px 14px; border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05);
            color: #fff; font-size: 1rem; outline: none; text-align: center;
        }
        .bg-app .modal-field input:focus { border-color: rgba(168,85,247,0.5); }
        .bg-app .modal-sep {
            display: flex; align-items: flex-end; padding-bottom: 10px;
            color: rgba(255,255,255,0.3); font-size: 1.2rem; font-weight: 300;
        }
        .bg-app .modal-actions { display: flex; gap: 10px; }
        .bg-app .modal-actions button {
            flex: 1; padding: 10px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.15);
            font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.3s;
        }
        .bg-app .modal-cancel { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }
        .bg-app .modal-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .bg-app .modal-confirm { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.3); color: #fff; }
        .bg-app .modal-confirm:hover { background: rgba(168,85,247,0.3); }
    </style>

    <div class="bg-app">
        <h1>BG Remover</h1>
        <p class="subtitle">Suppression auto par IA, baguette magique ou lasso</p>

        <div class="drop-zone" id="dropZone">
            <p>Glisse une image ici</p>
            <span class="browse">Parcourir</span>
            <input type="file" id="fileInput" accept="image/*">
        </div>

        <div class="loader" id="loader">
            <div class="spinner"></div>
            <p id="loaderText">Suppression du fond en cours...</p>
        </div>

        <div class="editor" id="editor">
            <div class="toolbar">
                <button class="tool-btn active" id="btnWand">Baguette magique</button>
                <button class="tool-btn" id="btnLassoKeep">Lasso garder</button>
                <button class="tool-btn" id="btnLassoRemove">Lasso supprimer</button>
                <button class="tool-btn" id="btnCrop">Crop</button>
                <button class="tool-btn" id="btnAuto">Auto (IA)</button>
                <div class="tool-sep"></div>
                <button class="tool-btn" id="btnResetView">Recentrer</button>
                <button class="tool-btn" id="btnResize">Redimensionner</button>
                <div class="color-preview" id="colorPreview" title="Couleur sélectionnée"></div>
                <label style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin-left:4px" id="colorLabel">Cliquez sur l'image</label>
                <label style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin-left:8px;display:none" id="lassoHint">Dessine une zone puis relâche</label>
            </div>

            <div style="text-align:center">
                <div class="canvas-wrap" id="canvasWrap">
                    <canvas id="bgCanvas"></canvas>
                </div>
            </div>

            <div class="actions">
                <button class="action-btn" id="btnUndo">Annuler</button>
                <a class="action-btn primary" id="btnDownload" href="" download="sans-fond.png">Télécharger</a>
                <button class="action-btn" id="btnReset">Nouvelle image</button>
            </div>
        </div>

        <div class="modal-overlay" id="resizeModal">
            <div class="modal">
                <h3>Redimensionner</h3>
                <div class="modal-fields">
                    <div class="modal-field">
                        <label>Largeur (px)</label>
                        <input type="number" id="resizeW" min="1" max="10000">
                    </div>
                    <div class="modal-sep">&times;</div>
                    <div class="modal-field">
                        <label>Hauteur (px)</label>
                        <input type="number" id="resizeH" min="1" max="10000">
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;justify-content:center;cursor:pointer" id="ratioToggle">
                    <div id="ratioIcon" style="width:20px;height:20px;border-radius:5px;border:1.5px solid rgba(168,85,247,0.5);background:rgba(168,85,247,0.2);display:flex;align-items:center;justify-content:center;transition:all 0.3s">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" id="ratioCheck"><path d="M2 6L5 9L10 3" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <label style="color:rgba(255,255,255,0.5);font-size:0.85rem;cursor:pointer">Conserver le ratio</label>
                </div>
                <div class="modal-actions">
                    <button class="modal-cancel" id="resizeCancel">Annuler</button>
                    <button class="modal-confirm" id="resizeConfirm">Appliquer</button>
                </div>
            </div>
        </div>
    </div>
    `;

    // Now run the JS logic
    const dropZone = container.querySelector('#dropZone') as HTMLDivElement;
    const fileInput = container.querySelector('#fileInput') as HTMLInputElement;
    const loader = container.querySelector('#loader') as HTMLDivElement;
    const loaderText = container.querySelector('#loaderText') as HTMLParagraphElement;
    const editorEl = container.querySelector('#editor') as HTMLDivElement;
    const canvas = container.querySelector('#bgCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const colorPreview = container.querySelector('#colorPreview') as HTMLDivElement;
    const colorLabel = container.querySelector('#colorLabel') as HTMLLabelElement;
    const btnWand = container.querySelector('#btnWand') as HTMLButtonElement;
    const btnLassoKeep = container.querySelector('#btnLassoKeep') as HTMLButtonElement;
    const btnLassoRemove = container.querySelector('#btnLassoRemove') as HTMLButtonElement;
    const btnCrop = container.querySelector('#btnCrop') as HTMLButtonElement;
    const btnAuto = container.querySelector('#btnAuto') as HTMLButtonElement;
    const btnUndo = container.querySelector('#btnUndo') as HTMLButtonElement;
    const btnDownload = container.querySelector('#btnDownload') as HTMLAnchorElement;
    const btnReset = container.querySelector('#btnReset') as HTMLButtonElement;
    const lassoHint = container.querySelector('#lassoHint') as HTMLLabelElement;
    const canvasWrap = container.querySelector('#canvasWrap') as HTMLDivElement;

    let mode = 'wand';
    let history: ImageData[] = [];
    let originalImage: HTMLImageElement | null = null;
    let lassoPoints: {x:number,y:number}[] = [];
    let isDrawingLasso = false;
    let isDrawingCrop = false;
    let cropStart: {x:number,y:number} | null = null;
    let zoomLevel = 1;
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 10;
    let panX = 0, panY = 0;
    let isPanning = false;
    let panStartX = 0, panStartY = 0, panOriginX = 0, panOriginY = 0;

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    canvasWrap.appendChild(overlayCanvas);
    const overlayCtx = overlayCanvas.getContext('2d')!;

    function applyTransform() {
      const t = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
      canvas.style.transform = t;
      overlayCanvas.style.transform = t;
    }

    function resetView() {
      zoomLevel = 1; panX = 0; panY = 0;
      applyTransform();
    }

    function setAllInactive() {
      btnWand.classList.remove('active'); btnAuto.classList.remove('active');
      btnLassoKeep.classList.remove('active'); btnLassoRemove.classList.remove('active');
      btnCrop.classList.remove('active');
      lassoHint.style.display = 'none';
    }

    function updateDownload() {
      canvas.toBlob((blob) => {
        if (blob) btnDownload.href = URL.createObjectURL(blob);
      }, 'image/png');
    }

    function getCanvasCoords(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const displayW = rect.width / zoomLevel;
      const displayH = rect.height / zoomLevel;
      const scaleX = canvas.width / displayW;
      const scaleY = canvas.height / displayH;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return {
        x: Math.floor(((e.clientX - centerX) / zoomLevel) * scaleX + canvas.width / 2),
        y: Math.floor(((e.clientY - centerY) / zoomLevel) * scaleY + canvas.height / 2)
      };
    }

    function loadImage(file: File) {
      if (!file.type.startsWith('image/')) return;
      dropZone.style.display = 'none';
      zoomLevel = 1; panX = 0; panY = 0;
      canvas.style.transform = '';
      overlayCanvas.style.transform = '';
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        overlayCanvas.width = img.width;
        overlayCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        history = [data];
        originalImage = img;
        editorEl.classList.add('active');
        updateDownload();
      };
      img.src = URL.createObjectURL(file);
    }

    function applyLasso() {
      const w = canvas.width, h = canvas.height;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const maskCanvas2 = document.createElement('canvas');
      maskCanvas2.width = w; maskCanvas2.height = h;
      const maskCtx = maskCanvas2.getContext('2d')!;
      maskCtx.beginPath();
      maskCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
      for (let i = 1; i < lassoPoints.length; i++) {
        maskCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
      }
      maskCtx.closePath();
      maskCtx.fillStyle = '#fff';
      maskCtx.fill();
      const maskData = maskCtx.getImageData(0, 0, w, h).data;
      if (mode === 'lasso-keep') {
        for (let i = 0; i < w * h; i++) {
          if (maskData[i * 4 + 3] === 0) data[i * 4 + 3] = 0;
        }
      } else {
        for (let i = 0; i < w * h; i++) {
          if (maskData[i * 4 + 3] > 0) data[i * 4 + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      history.push(ctx.getImageData(0, 0, w, h));
      lassoPoints = [];
      updateDownload();
    }

    function applyCrop(x: number, y: number, w: number, h: number) {
      const cropped = ctx.getImageData(x, y, w, h);
      canvas.width = w; canvas.height = h;
      overlayCanvas.width = w; overlayCanvas.height = h;
      ctx.putImageData(cropped, 0, 0);
      history.push(ctx.getImageData(0, 0, w, h));
      updateDownload();
    }

    async function runAutoRemove() {
      if (!originalImage) return;
      loader.classList.add('active');
      editorEl.classList.remove('active');
      loaderText.textContent = 'IA en cours de traitement...';
      try {
        const { removeBackground } = await import("@imgly/background-removal");
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        const url = URL.createObjectURL(blob);
        const resultBlob = await removeBackground(url, {
          progress: (_key: string, current: number, total: number) => {
            if (total > 0) loaderText.textContent = "IA en cours... " + Math.round((current / total) * 100) + "%";
          },
        });
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width; canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
          loader.classList.remove('active');
          editorEl.classList.add('active');
          updateDownload();
        };
        img.src = URL.createObjectURL(resultBlob);
      } catch {
        loader.classList.remove('active');
        editorEl.classList.add('active');
        alert('Erreur IA');
      }
    }

    // Event listeners
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault(); dropZone.classList.remove('dragover');
      if (e.dataTransfer?.files.length) loadImage(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files?.length) loadImage(fileInput.files[0]); });

    btnWand.addEventListener('click', () => { setAllInactive(); mode = 'wand'; btnWand.classList.add('active'); });
    btnLassoKeep.addEventListener('click', () => { setAllInactive(); mode = 'lasso-keep'; btnLassoKeep.classList.add('active'); lassoHint.style.display = ''; });
    btnLassoRemove.addEventListener('click', () => { setAllInactive(); mode = 'lasso-remove'; btnLassoRemove.classList.add('active'); lassoHint.style.display = ''; });
    btnCrop.addEventListener('click', () => { setAllInactive(); mode = 'crop'; btnCrop.classList.add('active'); lassoHint.style.display = ''; lassoHint.textContent = 'Dessine un rectangle puis relâche'; });
    btnAuto.addEventListener('click', () => { setAllInactive(); mode = 'auto'; btnAuto.classList.add('active'); runAutoRemove(); });

    btnUndo.addEventListener('click', () => {
      if (history.length > 1) {
        history.pop();
        const prev = history[history.length - 1];
        ctx.putImageData(prev, 0, 0);
        updateDownload();
      }
    });

    btnReset.addEventListener('click', () => {
      editorEl.classList.remove('active');
      dropZone.style.display = '';
      fileInput.value = '';
      history = [];
      originalImage = null;
    });

    container.querySelector('#btnResetView')!.addEventListener('click', resetView);

    // Resize modal
    const resizeModal = container.querySelector('#resizeModal') as HTMLDivElement;
    const resizeW = container.querySelector('#resizeW') as HTMLInputElement;
    const resizeH = container.querySelector('#resizeH') as HTMLInputElement;
    let keepRatio = true;
    let resizeRatio = 1;
    const ratioToggle = container.querySelector('#ratioToggle') as HTMLDivElement;
    const ratioIcon = container.querySelector('#ratioIcon') as HTMLDivElement;
    const ratioCheck = container.querySelector('#ratioCheck') as SVGElement;

    ratioToggle.addEventListener('click', () => {
      keepRatio = !keepRatio;
      ratioIcon.style.background = keepRatio ? 'rgba(168,85,247,0.2)' : 'transparent';
      ratioIcon.style.borderColor = keepRatio ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.2)';
      ratioCheck.style.display = keepRatio ? '' : 'none';
    });

    resizeW.addEventListener('input', () => {
      if (keepRatio && resizeRatio) resizeH.value = String(Math.round(parseInt(resizeW.value) / resizeRatio) || '');
    });
    resizeH.addEventListener('input', () => {
      if (keepRatio && resizeRatio) resizeW.value = String(Math.round(parseInt(resizeH.value) * resizeRatio) || '');
    });

    container.querySelector('#btnResize')!.addEventListener('click', () => {
      resizeW.value = String(canvas.width);
      resizeH.value = String(canvas.height);
      resizeRatio = canvas.width / canvas.height;
      resizeModal.classList.add('active');
      resizeW.focus(); resizeW.select();
    });

    container.querySelector('#resizeCancel')!.addEventListener('click', () => resizeModal.classList.remove('active'));
    resizeModal.addEventListener('click', (e) => { if (e.target === resizeModal) resizeModal.classList.remove('active'); });

    container.querySelector('#resizeConfirm')!.addEventListener('click', () => {
      const newW = parseInt(resizeW.value);
      const newH = parseInt(resizeH.value);
      if (!newW || !newH || newW < 1 || newH < 1 || newW > 10000 || newH > 10000) return;
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = newW; tmpCanvas.height = newH;
      const tmpCtx = tmpCanvas.getContext('2d')!;
      tmpCtx.drawImage(canvas, 0, 0, newW, newH);
      canvas.width = newW; canvas.height = newH;
      overlayCanvas.width = newW; overlayCanvas.height = newH;
      ctx.drawImage(tmpCanvas, 0, 0);
      history.push(ctx.getImageData(0, 0, newW, newH));
      resetView();
      updateDownload();
      resizeModal.classList.remove('active');
    });

    // Magic wand - click+drag to grow tolerance, red preview overlay, apply on release
    let wandActive = false;
    let wandOrigin: {x: number, y: number} | null = null;
    let wandStartClient: {x: number, y: number} | null = null;
    let wandBaseImageData: ImageData | null = null;
    let wandTargetR = 0, wandTargetG = 0, wandTargetB = 0;
    let wandLastMask: Uint8Array | null = null;

    function floodFill(sourceData: Uint8ClampedArray, w: number, h: number, ox: number, oy: number, tolerance: number): Uint8Array {
      const mask = new Uint8Array(w * h);
      const stack = [ox + oy * w];
      mask[ox + oy * w] = 1;
      while (stack.length > 0) {
        const pos = stack.pop()!;
        const px = pos % w;
        const py = (pos - px) / w;
        const neighbors: number[] = [];
        if (px > 0) neighbors.push(pos - 1);
        if (px < w - 1) neighbors.push(pos + 1);
        if (py > 0) neighbors.push(pos - w);
        if (py < h - 1) neighbors.push(pos + w);
        for (const npos of neighbors) {
          if (mask[npos]) continue;
          const ni = npos * 4;
          if (sourceData[ni + 3] === 0) { mask[npos] = 1; continue; }
          const dr = sourceData[ni] - wandTargetR;
          const dg = sourceData[ni+1] - wandTargetG;
          const db = sourceData[ni+2] - wandTargetB;
          const dist = Math.sqrt(dr*dr + dg*dg + db*db);
          if (dist <= tolerance) { mask[npos] = 1; stack.push(npos); }
        }
      }
      return mask;
    }

    function drawWandPreview(mask: Uint8Array) {
      const w = canvas.width, h = canvas.height;
      overlayCtx.clearRect(0, 0, w, h);
      const imgData = overlayCtx.createImageData(w, h);
      const d = imgData.data;
      for (let i = 0; i < w * h; i++) {
        if (mask[i]) {
          d[i * 4] = 239;     // red
          d[i * 4 + 1] = 68;  // green
          d[i * 4 + 2] = 68;  // blue
          d[i * 4 + 3] = 100; // alpha - semi-transparent red tint
        }
      }
      overlayCtx.putImageData(imgData, 0, 0);
    }

    canvas.addEventListener('mousedown', (e) => {
      if (mode !== 'wand' || e.button !== 0) return;
      const { x, y } = getCanvasCoords(e);
      const w = canvas.width, h = canvas.height;
      if (x < 0 || x >= w || y < 0 || y >= h) return;

      wandActive = true;
      wandOrigin = { x, y };
      wandStartClient = { x: e.clientX, y: e.clientY };
      wandBaseImageData = ctx.getImageData(0, 0, w, h);

      const idx = (y * w + x) * 4;
      wandTargetR = wandBaseImageData.data[idx];
      wandTargetG = wandBaseImageData.data[idx+1];
      wandTargetB = wandBaseImageData.data[idx+2];
      colorPreview.style.background = "rgb(" + wandTargetR + "," + wandTargetG + "," + wandTargetB + ")";
      colorLabel.textContent = "rgb(" + wandTargetR + ", " + wandTargetG + ", " + wandTargetB + ")";

      // Initial preview with tolerance 0 (exact match only)
      const mask = floodFill(wandBaseImageData.data, w, h, x, y, 0);
      wandLastMask = mask;
      drawWandPreview(mask);
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!wandActive || !wandOrigin || !wandStartClient || !wandBaseImageData) return;
      const dx = e.clientX - wandStartClient.x;
      const dy = e.clientY - wandStartClient.y;
      const dragDist = Math.sqrt(dx * dx + dy * dy);
      // More you drag = higher tolerance. 1px drag ~ 1 tolerance.
      const tolerance = Math.min(dragDist * 1.0, 442);

      const w = canvas.width, h = canvas.height;
      const mask = floodFill(wandBaseImageData.data, w, h, wandOrigin.x, wandOrigin.y, tolerance);
      wandLastMask = mask;
      drawWandPreview(mask);
    });

    canvas.addEventListener('mouseup', () => {
      if (!wandActive) return;
      wandActive = false;
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      // Apply: remove the masked pixels
      if (wandLastMask && wandBaseImageData) {
        const w = canvas.width, h = canvas.height;
        const result = new ImageData(new Uint8ClampedArray(wandBaseImageData.data), w, h);
        const d = result.data;
        for (let i = 0; i < w * h; i++) {
          if (wandLastMask[i]) d[i * 4 + 3] = 0;
        }
        ctx.putImageData(result, 0, 0);
        history.push(ctx.getImageData(0, 0, w, h));
        updateDownload();
      }
      wandBaseImageData = null;
      wandLastMask = null;
    });

    // Crop
    canvas.addEventListener('mousedown', (e) => {
      if (mode !== 'crop') return;
      isDrawingCrop = true;
      cropStart = getCanvasCoords(e);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    });
    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawingCrop || mode !== 'crop' || !cropStart) return;
      const pt = getCanvasCoords(e);
      const x = Math.min(cropStart.x, pt.x), y = Math.min(cropStart.y, pt.y);
      const w = Math.abs(pt.x - cropStart.x), h = Math.abs(pt.y - cropStart.y);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      overlayCtx.fillStyle = 'rgba(0,0,0,0.5)';
      overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      overlayCtx.clearRect(x, y, w, h);
      overlayCtx.strokeStyle = 'rgba(168,85,247,0.8)';
      overlayCtx.lineWidth = 2;
      overlayCtx.setLineDash([6, 4]);
      overlayCtx.strokeRect(x, y, w, h);
    });
    canvas.addEventListener('mouseup', (e) => {
      if (!isDrawingCrop || mode !== 'crop' || !cropStart) return;
      isDrawingCrop = false;
      const pt = getCanvasCoords(e);
      const x = Math.min(cropStart.x, pt.x), y = Math.min(cropStart.y, pt.y);
      const w = Math.abs(pt.x - cropStart.x), h = Math.abs(pt.y - cropStart.y);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      if (w < 5 || h < 5) return;
      applyCrop(x, y, w, h);
    });

    // Lasso
    canvas.addEventListener('mousedown', (e) => {
      if (mode !== 'lasso-keep' && mode !== 'lasso-remove') return;
      isDrawingLasso = true;
      lassoPoints = [getCanvasCoords(e)];
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    });
    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawingLasso) return;
      const pt = getCanvasCoords(e);
      lassoPoints.push(pt);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      overlayCtx.beginPath();
      overlayCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
      for (let i = 1; i < lassoPoints.length; i++) overlayCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
      overlayCtx.closePath();
      overlayCtx.strokeStyle = mode === 'lasso-keep' ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)';
      overlayCtx.lineWidth = 2;
      overlayCtx.setLineDash([6, 4]);
      overlayCtx.stroke();
      overlayCtx.fillStyle = mode === 'lasso-keep' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)';
      overlayCtx.fill();
    });
    canvas.addEventListener('mouseup', () => {
      if (!isDrawingLasso || lassoPoints.length < 3) { isDrawingLasso = false; return; }
      isDrawingLasso = false;
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      applyLasso();
    });

    // Zoom & Pan
    canvasWrap.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel * delta));
      applyTransform();
    }, { passive: false });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1) {
        e.preventDefault();
        isPanning = true;
        panStartX = e.clientX; panStartY = e.clientY;
        panOriginX = panX; panOriginY = panY;
        canvas.style.cursor = 'grabbing';
      }
    });
    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      panX = panOriginX + (e.clientX - panStartX);
      panY = panOriginY + (e.clientY - panStartY);
      applyTransform();
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 1 && isPanning) { isPanning = false; canvas.style.cursor = 'crosshair'; }
    });
    canvasWrap.addEventListener('mousedown', (e) => { if (e.button === 1) e.preventDefault(); });

    // Ctrl+Z
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); btnUndo.click(); }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <div ref={containerRef} />;
}
