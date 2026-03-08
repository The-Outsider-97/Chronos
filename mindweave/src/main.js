import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. SYSTEM INITIALIZATION & API KEY CHECK ---
  const apiKey = localStorage.getItem('mindweave_llm_api_key');
  const apiStatusEl = document.getElementById('api-status');
  const chatInput = document.getElementById('player-input');
  const sendBtn = document.getElementById('btn-send');
  const chatHistory = document.getElementById('chat-history');
  
  if (!apiKey) {
    apiStatusEl.textContent = 'ERROR: No LLM Key detected. Neural link severed.';
    apiStatusEl.classList.replace('text-yellow-400', 'text-red-500');
    appendChat('SYSTEM', 'CRITICAL ERROR: Language Model API Key missing. Please return to the R-Games Launcher and input your credentials.', 'text-red-500');
  } else {
    apiStatusEl.textContent = 'Uplink Secure. LLM Active.';
    apiStatusEl.classList.replace('text-yellow-400', 'text-green-400');
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }

  // Handle Exit
  document.getElementById('btn-exit').addEventListener('click', () => {
    window.location.href = '/index.html'; // Return to launcher
  });

  // --- 2. THREE.JS ISOMETRIC ENVIRONMENT SETUP ---
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020617, 0.04);

  // Isometric Camera setup (Orthographic)
  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 20;
  const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, frustumSize * aspect / 2,
    frustumSize / 2, frustumSize / -2,
    1, 1000
  );
  
  // Position camera for isometric view
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0x38bdf8, 2); // Neural blue tint
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  const redLight = new THREE.PointLight(0xef4444, 1.5, 20); // Traffic red tint
  redLight.position.set(-5, 5, -5);
  scene.add(redLight);

  // Procedural Grid (The "Fractured Society" IQ Logic Puzzle base)
  const gridGroup = new THREE.Group();
  const gridSize = 7;
  const tileSize = 1.9;
  
  const tileGeo = new THREE.BoxGeometry(tileSize, 0.5, tileSize);
  const tileMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, 
    roughness: 0.8,
    metalness: 0.2,
    transparent: true,
    opacity: 0.8
  });

  for (let i = -gridSize/2; i < gridSize/2; i++) {
    for (let j = -gridSize/2; j < gridSize/2; j++) {
      // Randomly drop tiles to simulate a fractured grid
      if (Math.random() > 0.85) continue; 
      
      const mesh = new THREE.Mesh(tileGeo, tileMat);
      mesh.position.set(i * 2, (Math.random() * 0.5) - 0.25, j * 2);
      
      // Highlight some tiles to simulate active "Logic Gates"
      if (Math.random() > 0.9) {
        mesh.material = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.5 });
      }
      gridGroup.add(mesh);
    }
  }
  scene.add(gridGroup);

  // --- 3. THE NPC AVATAR (EQ MECHANIC) ---
  // Since we don't have external assets, we use a procedural geometric shape
  // that morphs/spins to represent the NPC's emotional state.
  const npcGeo = new THREE.IcosahedronGeometry(1.5, 1);
  const npcMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    emissive: 0x222222,
    roughness: 0.1,
    transmission: 0.9, // glass-like
    thickness: 1.0,
  });
  const npcMesh = new THREE.Mesh(npcGeo, npcMat);
  npcMesh.position.set(0, 3, 0);
  scene.add(npcMesh);

  // NPC floating animation variables
  let clock = new THREE.Clock();
  let currentEmotion = 'neutral';
  const emotionColors = {
    'neutral': 0x38bdf8, // blue
    'stress': 0xef4444,  // red
    'calm': 0x10b981,    // green
    'thinking': 0xa855f7 // purple
  };

  // --- 4. EQ & LLM CHAT LOGIC ---
  const emotionIndicator = document.getElementById('emotion-indicator');
  const eqSyncValue = document.getElementById('eq-sync-value');
  const eqSyncBar = document.getElementById('eq-sync-bar');
  let currentEqScore = 82;

  function updateNPCState(emotion, textIndicator) {
    currentEmotion = emotion;
    emotionIndicator.textContent = `Analysis: ${textIndicator}`;
    
    // Tween color transition (simplified for vanilla JS)
    const targetColor = new THREE.Color(emotionColors[emotion] || emotionColors['neutral']);
    npcMesh.material.emissive.copy(targetColor);
    npcMesh.material.emissiveIntensity = 0.8;
  }

  function adjustEQScore(amount) {
    currentEqScore = Math.max(0, Math.min(100, currentEqScore + amount));
    eqSyncValue.textContent = `${currentEqScore}%`;
    eqSyncBar.style.width = `${currentEqScore}%`;
    
    if (currentEqScore < 40) eqSyncBar.style.backgroundColor = 'var(--traffic-red)';
    else if (currentEqScore < 70) eqSyncBar.style.backgroundColor = '#eab308'; // yellow
    else eqSyncBar.style.backgroundColor = '#10b981'; // green
  }

  function appendChat(sender, message, colorClass = 'text-white') {
    const div = document.createElement('div');
    const senderColor = sender === 'Weaver' ? 'text-[var(--traffic-red)]' : 'text-[var(--neural-blue)]';
    div.innerHTML = `<span class="${senderColor}">> ${sender}:</span> <span class="${colorClass}">${message}</span>`;
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  async function handleChatSubmit() {
    const text = chatInput.value.trim();
    if (!text || !apiKey) return;

    appendChat('Weaver', text);
    chatInput.value = '';
    chatInput.disabled = true;
    sendBtn.disabled = true;
    updateNPCState('thinking', 'Processing Semantics...');

    // Simulate LLM Processing time and logical response mapping
    // *In a production environment, you would make a fetch() call to your backend or directly to OpenAI here using the apiKey variable*
    setTimeout(() => {
      // Dummy logic to simulate EQ response
      const lowerText = text.toLowerCase();
      let response = "";
      
      if (lowerText.includes('understand') || lowerText.includes('help') || lowerText.includes('calm')) {
        response = "Your empathy parameters are acceptable. My logic loops are stabilizing. Proceed with the temporal hack.";
        updateNPCState('calm', 'Regulated / Stable');
        adjustEQScore(5);
      } else if (lowerText.includes('hurry') || lowerText.includes('now') || lowerText.includes('fix')) {
        response = "Your aggressive syntax triggers my defense subroutines! The grid cannot be forced!";
        updateNPCState('stress', 'Agitated / Defensive');
        adjustEQScore(-15);
      } else {
        response = "Input acknowledged. However, the emotional context is ambiguous. Please recalibrate your active listening protocols.";
        updateNPCState('neutral', 'Ambiguous');
      }

      appendChat('Architect-7', response);
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }, 2000);
  }

  sendBtn.addEventListener('click', handleChatSubmit);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSubmit();
  });

  document.getElementById('btn-empathy-ping').addEventListener('click', () => {
    appendChat('SYSTEM', '[Active Listening Ping Initiated. Architect-7 is masking fear regarding data corruption.]', 'text-slate-500 italic');
  });

  // --- 5. RENDER LOOP ---
  window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Idle animations for the procedual grid
    gridGroup.children.forEach((mesh, index) => {
      mesh.position.y = mesh.userData.baseY !== undefined ? mesh.userData.baseY : mesh.position.y;
      if (mesh.userData.baseY === undefined) mesh.userData.baseY = mesh.position.y;
      
      // Gentle sine wave floating effect
      mesh.position.y = mesh.userData.baseY + Math.sin(time * 2 + index * 0.1) * 0.1;
    });

    // NPC Animations
    npcMesh.rotation.y += 0.01;
    npcMesh.rotation.x += 0.005;
    npcMesh.position.y = 3 + Math.sin(time * 1.5) * 0.3; // Breathing effect
    
    // If stressed, make it glitch/jitter
    if (currentEmotion === 'stress') {
      npcMesh.position.x = (Math.random() - 0.5) * 0.1;
      npcMesh.scale.setScalar(1 + Math.sin(time * 20) * 0.05);
    } else {
      npcMesh.position.x = 0;
      npcMesh.scale.setScalar(1);
    }

    renderer.render(scene, camera);
  }

  animate();
});
