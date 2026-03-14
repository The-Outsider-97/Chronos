import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', async () => {
  // === Three.js Background (unchanged) ===
  const container = document.getElementById('academy-canvas');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020617, 0.035);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 6, 14);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.PointLight(0x38bdf8, 2, 80);
  key.position.set(2, 8, 6);
  scene.add(key);

  const grid = new THREE.Group();
  const tileGeo = new THREE.BoxGeometry(1.8, 0.2, 1.8);
  for (let x = -6; x <= 6; x += 1) {
    for (let z = -6; z <= 6; z += 1) {
      if (Math.random() > 0.72) continue;
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0x0ea5e9,
        emissiveIntensity: Math.random() * 0.2 + 0.06,
      });
      const tile = new THREE.Mesh(tileGeo, mat);
      tile.position.set(x * 1.6, -2 + (Math.random() - 0.5) * 0.5, z * 1.6);
      tile.userData.baseY = tile.position.y;
      grid.add(tile);
    }
  }
  scene.add(grid);

  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.3, 1),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0x22d3ee, roughness: 0.12, transmission: 0.8, thickness: 1.1 })
  );
  orb.position.set(0, 1.6, 0);
  scene.add(orb);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    grid.children.forEach((tile, i) => {
      tile.position.y = tile.userData.baseY + Math.sin(t * 1.8 + i * 0.15) * 0.12;
    });
    orb.rotation.y += 0.01;
    orb.position.y = 1.6 + Math.sin(t * 1.3) * 0.25;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // === Director's Welcome from responses.json ===
  const responsesPath = '/mindweave/templates/responses.json';
  let directorMessageEl = document.getElementById('director-message');
  let directorWelcomeSection = document.getElementById('director-welcome');

  try {
    const response = await fetch(responsesPath);
    if (!response.ok) throw new Error('Failed to load responses');
    const templates = await response.json();
    const directorWelcomeGroup = templates.director_welcome;
    if (directorWelcomeGroup && directorWelcomeGroup.length > 0) {
      const randomIndex = Math.floor(Math.random() * directorWelcomeGroup.length);
      const chosen = directorWelcomeGroup[randomIndex];
      directorMessageEl.textContent = chosen.text;
      if (chosen.voice) {
        // Attempt to play audio (may be blocked by autoplay policy)
        const audio = new Audio(chosen.voice);
        audio.volume = 0.8;
        audio.play().catch(e => console.log('Director audio play failed (autoplay policy?):', e));
      }
    } else {
      directorMessageEl.textContent = 'Welcome to Weaver Academy.';
    }
  } catch (error) {
    console.error('Director welcome error:', error);
    directorMessageEl.textContent = 'Welcome to Weaver Academy.';
  }

  // === Progress Bar & Ordered Section Clicks ===
  const sectionIds = [
    'section-foundations',
    'section-metacognition',
    'section-iq',
    'section-eq',
    'section-integration'
  ];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(el => el !== null);
  const totalSteps = sections.length;
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  let currentStep = 0; // index of the next section to be clicked
  let cooldownActive = false;
  let activeTimer = null; // interval ID for countdown
  let timerSectionIndex = -1; // which section is currently showing timer

  // Helper to hide timer on a section
  function hideTimer() {
    if (timerSectionIndex >= 0 && timerSectionIndex < sections.length) {
      const prevSection = sections[timerSectionIndex];
      const timerSpan = prevSection.querySelector('.section-timer');
      if (timerSpan) timerSpan.style.display = 'none';
    }
    if (activeTimer) {
      clearInterval(activeTimer);
      activeTimer = null;
    }
    timerSectionIndex = -1;
  }

  // Start countdown on the section at given index
  function startTimer(sectionIndex) {
    hideTimer(); // clear any previous timer
    if (sectionIndex >= sections.length) return;
    const section = sections[sectionIndex];
    const timerSpan = section.querySelector('.section-timer');
    if (!timerSpan) return;
    let remaining = 60; // seconds
    timerSpan.textContent = `⏱ ${remaining}s`;
    timerSpan.style.display = 'inline-block';
    timerSectionIndex = sectionIndex;
    activeTimer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(activeTimer);
        activeTimer = null;
        timerSpan.style.display = 'none';
        timerSectionIndex = -1;
        // Cooldown ended, but we don't need to do anything else; next click will be allowed.
      } else {
        timerSpan.textContent = `⏱ ${remaining}s`;
      }
    }, 1000);
  }

  function updateSectionAvailability() {
    sections.forEach((section, index) => {
      if (index === currentStep && !cooldownActive) {
        section.style.opacity = '1';
        section.style.pointerEvents = 'auto';
        // If there was a timer, it should have been hidden already, but ensure
        const timer = section.querySelector('.section-timer');
        if (timer) timer.style.display = 'none';
      } else if (index < currentStep) {
        section.style.opacity = '1';
        section.style.pointerEvents = 'none';
        // Hide timer on already read sections
        const timer = section.querySelector('.section-timer');
        if (timer) timer.style.display = 'none';
      } else {
        section.style.opacity = '0.5';
        section.style.pointerEvents = 'none';
        // Hide timer on future sections
        const timer = section.querySelector('.section-timer');
        if (timer) timer.style.display = 'none';
      }
    });
  }

  function advanceProgress() {
    if (currentStep >= totalSteps) return;
    currentStep++;
    const percent = (currentStep / totalSteps) * 100;
    progressFill.style.width = percent + '%';
    progressText.textContent = `Step ${currentStep}/${totalSteps}`;
    if (currentStep === totalSteps) {
      progressText.textContent = 'Complete – Well done';
      // Play director congratulations
      playDirectorCongratulations();
    }
    updateSectionAvailability();
  }

  async function playDirectorCongratulations() {
    try {
      const response = await fetch(responsesPath);
      if (!response.ok) throw new Error('Failed to load responses');
      const templates = await response.json();
      const congratsGroup = templates.director_congratulations;
      if (congratsGroup && congratsGroup.length > 0) {
        const randomIndex = Math.floor(Math.random() * congratsGroup.length);
        const chosen = congratsGroup[randomIndex];
        if (chosen.voice) {
          const audio = new Audio(chosen.voice);
          audio.volume = 0.8;
          audio.play().catch(e => console.log('Congratulations audio play failed:', e));
        }
        // Optionally show a message
        // Could also display a temporary notification
      }
    } catch (error) {
      console.error('Director congratulations error:', error);
    }
  }

  // Attach click handlers
  sections.forEach((section, index) => {
    section.addEventListener('click', () => {
      // Only allow click if it's the expected next section and no cooldown
      if (index !== currentStep || cooldownActive) return;

      // Mark as read
      advanceProgress();

      // If we haven't finished, start cooldown for the next section
      if (currentStep < totalSteps) {
        cooldownActive = true;
        updateSectionAvailability(); // immediately disables next section (since cooldownActive = true)
        // Start timer on the next section (which is at index currentStep)
        startTimer(currentStep);
        setTimeout(() => {
          cooldownActive = false;
          updateSectionAvailability(); // re-enable next section (if still same step)
          // Timer will be cleared when section becomes active (in updateSectionAvailability) or when next click happens
        }, 60000); // 60 seconds
      }
    });
  });

  // Initial state
  updateSectionAvailability();

  // Enlargement effect (from previous version) - works only if pointer-events auto
  const allCards = document.querySelectorAll('.academy-section-card');
  allCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // This will fire only if the card is clickable (pointer-events auto)
      if (this.classList.contains('enlarged')) {
        this.classList.remove('enlarged');
      } else {
        allCards.forEach(c => c.classList.remove('enlarged'));
        this.classList.add('enlarged');
      }
    });
  });
});
