// ==============================
// Interactive "Do you like me?" project
// - Name form with validation
// - Yes button: positive response, hearts + sound
// - No button: dodges on hover/touch/focus (desktop & mobile-friendly)
// - Theme toggle
// ==============================

document.addEventListener('DOMContentLoaded', () => {
  // DOM references
  const nameForm = document.getElementById('nameForm');
  const nameInput = document.getElementById('nameInput');
  const nameError = document.getElementById('nameError');

  const playCard = document.getElementById('playCard');
  const introCard = document.getElementById('introCard');
  const heartsContainer = document.getElementById('heartsContainer');
  const themeToggle = document.getElementById('themeToggle');

  // -------------------
  // Theme toggle
  // -------------------
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-mode');
    // toggle icon
    themeToggle.textContent = document.documentElement.classList.contains('dark-mode') ? '🌙' : '🌞';
  });

  // -------------------
  // Name form validation
  // -------------------
  nameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();

    // simple validation: letters and spaces, length 5..
    const namePattern = /^[A-Za-z\s]{5,20}$/;
    if (!namePattern.test(name)) {
      nameError.textContent = 'Please enter your first name (5 letters).';
      nameInput.focus();
      return;
    }
    nameError.textContent = '';

    // show the question area
    showQuestionFor(name);
  });

  // -------------------
  // Build the question UI
  // -------------------
  function showQuestionFor(name) {
    introCard.classList.add('hidden');
    playCard.classList.remove('hidden');

    // create markup for question area
    playCard.innerHTML = `
      <h2 class="question-title">Hey <span id="herName">${escapeHtml(name)}</span>... do you like me?😉</h2>
      <div class="button-area" id="buttonArea" aria-hidden="false">
        <button class="btn-yes" id="yesBtn" aria-label="Yes">Yes 💖</button>
        <button class="btn-no" id="noBtn" aria-label="No">Kinda 😅</button>
      </div>
      <p class="small-muted"></p>
    `;

    // Now attach listeners to the newly created buttons
    initButtons();
  }

  // -------------------
  // Initialize button behavior
  // -------------------
  function initButtons(){
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const buttonArea = document.getElementById('buttonArea');

    // ensure buttonArea is positioned for absolute children
    buttonArea.style.position = 'relative';

    // set accessible tabindex so focus triggers dodge too
    noBtn.setAttribute('tabindex', '0');

    // ====== YES button ======
    yesBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Friendly response + visual effect
      respondYes();
    });

    // ====== NO button: evasive behavior ======
    // On desktop mouse hover
    noBtn.addEventListener('mouseenter', (e) => {
      moveNoButton(noBtn, buttonArea);
    });

    // On focus (keyboard tab)
    noBtn.addEventListener('focus', (e) => {
      moveNoButton(noBtn, buttonArea);
    });

    // On pointer events (covers mouse & some touch)
    noBtn.addEventListener('pointerover', (e) => {
      // pointerover can include touch in some devices; dodge
      moveNoButton(noBtn, buttonArea);
    });

    // On touchstart (mobile), prevent the tap and dodge immediately
    // use passive:false so we can preventDefault the touch to avoid click
    noBtn.addEventListener('touchstart', (e) => {
      e.preventDefault(); // stop click from firing on some devices
      moveNoButton(noBtn, buttonArea);
    }, { passive: false });

    // Extra: if they somehow click it, we also move then show a playful message
    noBtn.addEventListener('click', (e) => {
      e.preventDefault();
      moveNoButton(noBtn, buttonArea);
    });

    // Place buttons at safe initial positions (center-left and center-right)
    placeInitialButtons(yesBtn, noBtn, buttonArea);
  }

  // ==============================
  // placeInitialButtons - positions the buttons inside the area
  // ==============================
  function placeInitialButtons(yesBtn, noBtn, area){
    const areaRect = area.getBoundingClientRect();
    // compute basic coordinates relative to area
    // center Y and left/right offsets
    const top = Math.max(6, (areaRect.height - yesBtn.offsetHeight) / 2);
    yesBtn.style.top = `${top}px`;
    yesBtn.style.left = `${Math.max(10, areaRect.width * 0.20)}px`;

    noBtn.style.top = `${top}px`;
    noBtn.style.left = `${Math.max(10, areaRect.width * 0.62)}px`;
  }

  // ==============================
  // moveNoButton - pick a new random spot inside the container
  // ==============================
  function moveNoButton(noBtn, area) {
    const areaRect = area.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    // compute area-relative space for left/top
    const maxLeft = Math.max(0, areaRect.width - btnRect.width - 6);
    const maxTop = Math.max(0, areaRect.height - btnRect.height - 6);

    // pick a random position but bias away from the yes button (so it's cheeky)
    const randX = Math.floor(Math.random() * (maxLeft + 1)); // 0..maxLeft
    const randY = Math.floor(Math.random() * (maxTop + 1)); // 0..maxTop

    // Smooth random movement; ensure it actually moves (if same pos, nudge)
    const newLeft = `${randX}px`;
    const newTop = `${randY}px`;

    // minor pop animation for fun
    noBtn.style.transform = 'scale(1.05) rotate(-6deg)';
    requestAnimationFrame(() => {
      noBtn.style.left = newLeft;
      noBtn.style.top = newTop;
    });
    // reset scale after short timeout
    setTimeout(() => { noBtn.style.transform = ''; }, 220);
  }

  // ==============================
  // respondYes - run the positive flow
  // ==============================
  function respondYes(){
    // show a cheerful modal inside playCard (overlay-like)
    const overlay = document.createElement('div');
    overlay.className = 'card';
    overlay.style.textAlign = 'center';
    overlay.innerHTML = `
      <h2>Yes — I knew it! 🎉😂😂</h2>
      <p class="small-muted">Hope your day was amazing 💝. Corporate work is not easy but the income is rewarding even when little. More will come.</p>
      <div style="margin-top:12px;">
        <button id="againBtn" class="primary">Aww ❤️</button>
      </div>
    `;

    // append overlay to play card
    playCard.appendChild(overlay);

    // spawn hearts and play a chime
    spawnHearts(12);
    playChime();

    // disable further clicks on original buttons to avoid multiple spawns
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    if (yesBtn) yesBtn.disabled = true;
    if (noBtn) noBtn.disabled = true;

    // hook up "again" button to create more hearts
    const againBtn = document.getElementById('againBtn');
    againBtn.addEventListener('click', () => {
      spawnHearts(10);
      playChime();
    });
  }

  // ==============================
  // spawnHearts - create small heart elements that float up
  // ==============================
  function spawnHearts(count = 8){
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i=0;i<count;i++){
      const heart = document.createElement('span');
      heart.className = 'heart';
      // random start position around center
      const startX = Math.random() * (w * 0.8) + (w * 0.1);
      const startY = Math.random() * (h * 0.5) + (h * 0.3);
      heart.style.left = `${startX}px`;
      heart.style.top = `${startY}px`;
      heart.style.transform = `translateY(0) scale(${0.85 + Math.random()*0.4}) rotate(${Math.random()*40 - 20}deg)`;
      heartsContainer.appendChild(heart);

      // remove after animation completes (1600ms)
      setTimeout(()=> {
        heart.remove();
      }, 1600 + (i*40));
    }
  }

  // ==============================
  // playChime - simple short tone using Web Audio API
  // ==============================
  function playChime(){
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 560; // happy pitch
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.11, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.6);
    } catch (err) {
      // audio may be blocked on some browsers — ignore gracefully
      console.warn('Audio unavailable', err);
    }
  }

  // ==============================
  // escapeHtml - tiny helper to avoid simple injection in name
  // ==============================
  function escapeHtml(unsafe){
    return unsafe.replace(/[&<"'>]/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});
  }

});
