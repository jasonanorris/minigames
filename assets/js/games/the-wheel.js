const DEFAULT_PRIZES = ["Yes", "No", "Try Again", "Try Again", "Try Again"];
const COLORS = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#f78c6b", "#4cc9f0", "#90be6d"];
const CLICK_VOLUME = 0.075;
const HORN_VOLUME = 0.12;
const LANDING_RANDOMNESS = 0.72;

export function startTheWheel({ stage }) {
  let prizes = [...DEFAULT_PRIZES];
  let rotation = 0;
  let isSpinning = false;
  let spinTimer = null;
  let spinFrame = null;
  let audioContext = null;
  let lastTickIndex = null;
  let confettiTimer = null;
  const spinDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 4200;

  stage.innerHTML = `
    <div class="wheel-game">
      <div class="wheel-layout">
        <div class="wheel-wrap">
          <span class="wheel-pointer" aria-hidden="true"></span>
          <button class="prize-wheel" id="prize-wheel" type="button" aria-label="Spin the prize wheel">
            <canvas id="wheel-canvas" width="600" height="600" aria-hidden="true"></canvas>
            <span class="wheel-hub">SPIN</span>
          </button>
        </div>
        <section class="wheel-settings" aria-labelledby="wheel-settings-title">
          <div class="wheel-settings-heading">
            <div><h3 id="wheel-settings-title">Prizes</h3></div>
            <button class="wheel-add" id="wheel-add" type="button">+ Add</button>
          </div>
          <div class="wheel-prizes" id="wheel-prizes"></div>
          <p class="wheel-hint">Choose 2–12 prizes, then tap the wheel.</p>
        </section>
      </div>
      <dialog class="win-modal" id="win-modal" aria-labelledby="win-title">
        <div class="win-confetti" id="win-confetti" aria-hidden="true"></div>
        <div class="win-burst" aria-hidden="true">★</div>
        <p class="win-kicker">Winner!</p>
        <h3 id="win-title">You won</h3>
        <strong class="win-prize" id="win-prize"></strong>
        <button class="primary-action" id="win-again" type="button">Spin again</button>
      </dialog>
    </div>`;

  const wheel = stage.querySelector("#prize-wheel");
  const canvas = stage.querySelector("#wheel-canvas");
  const pointer = stage.querySelector(".wheel-pointer");
  const context = canvas.getContext("2d");
  const prizeList = stage.querySelector("#wheel-prizes");
  const addButton = stage.querySelector("#wheel-add");
  const modal = stage.querySelector("#win-modal");
  const wonPrize = stage.querySelector("#win-prize");
  const againButton = stage.querySelector("#win-again");
  const confetti = stage.querySelector("#win-confetti");

  function getPrizeIndexAtAngle(angle) {
    const normalized = ((360 - angle) % 360 + 360) % 360;
    return Math.floor(normalized / (360 / prizes.length)) % prizes.length;
  }

  function setPointerPrize(index) {
    const safeIndex = ((index % prizes.length) + prizes.length) % prizes.length;
    pointer.style.setProperty("--pointer-color", COLORS[safeIndex % COLORS.length]);
    pointer.dataset.prizeIndex = String(safeIndex);
  }

  function getRenderedRotation() {
    const transform = getComputedStyle(canvas).transform;

    if (transform === "none") return 0;

    const matrix = new DOMMatrixReadOnly(transform);
    return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
  }

  function playSoftClick() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    audioContext ||= new AudioContext();
    audioContext.resume().catch(() => { });
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(620, now);
    gain.gain.setValueAtTime(CLICK_VOLUME, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.04);
  }

  function playWinHorn() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    audioContext ||= new AudioContext();
    audioContext.resume().catch(() => { });
    const start = audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const noteStart = start + index * 0.12;
      oscillator.type = index === notes.length - 1 ? "square" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(HORN_VOLUME, noteStart + 0.018);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteStart + (index === notes.length - 1 ? 0.42 : 0.16)
      );
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + (index === notes.length - 1 ? 0.44 : 0.18));
    });
  }

  function launchConfetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    window.clearTimeout(confettiTimer);
    confetti.replaceChildren();

    for (let index = 0; index < 72; index += 1) {
      const piece = document.createElement("span");
      piece.style.setProperty("--confetti-x", `${Math.random() * 100}vw`);
      piece.style.setProperty("--confetti-drift", `${Math.random() * 180 - 90}px`);
      piece.style.setProperty("--confetti-delay", `${Math.random() * 0.45}s`);
      piece.style.setProperty("--confetti-duration", `${1.8 + Math.random() * 1.5}s`);
      piece.style.setProperty("--confetti-spin", `${360 + Math.random() * 900}deg`);
      piece.style.setProperty("--confetti-color", COLORS[index % COLORS.length]);
      confetti.append(piece);
    }

    confettiTimer = window.setTimeout(() => confetti.replaceChildren(), 3800);
  }

  function updateSpinFeedback() {
    const index = getPrizeIndexAtAngle(getRenderedRotation());
    setPointerPrize(index);

    if (lastTickIndex !== null && index !== lastTickIndex) {
      playSoftClick();
    }

    lastTickIndex = index;

    if (isSpinning) {
      spinFrame = window.requestAnimationFrame(updateSpinFeedback);
    }
  }

  function drawWheel() {
    const size = canvas.width;
    const radius = size / 2;
    const arc = (Math.PI * 2) / prizes.length;
    context.clearRect(0, 0, size, size);
    prizes.forEach((prize, index) => {
      const start = index * arc - Math.PI / 2;
      context.beginPath();
      context.moveTo(radius, radius);
      context.arc(radius, radius, radius - 8, start, start + arc);
      context.closePath();
      context.fillStyle = COLORS[index % COLORS.length];
      context.fill();
      context.strokeStyle = "rgba(255,255,255,.78)";
      context.lineWidth = 5;
      context.stroke();
      context.save();
      context.translate(radius, radius);
      context.rotate(start + arc / 2);
      context.fillStyle = index % COLORS.length === 1 ? "#332800" : "#fff";
      context.font = "800 28px system-ui, sans-serif";
      context.textAlign = "right";
      context.textBaseline = "middle";
      const label = prize.length > 17 ? `${prize.slice(0, 16)}…` : prize;
      context.fillText(label, radius - 42, 0, radius - 86);
      context.restore();
    });

    if (!isSpinning) {
      setPointerPrize(getPrizeIndexAtAngle(rotation));
    }
  }

  function renderPrizeInputs() {
    prizeList.innerHTML = "";
    prizes.forEach((prize, index) => {
      const row = document.createElement("div");
      row.className = "wheel-prize-row";
      row.innerHTML = `<span style="--prize-color:${COLORS[index % COLORS.length]}">${index + 1}</span><input type="text" maxlength="32" aria-label="Prize ${index + 1}" value=""><button type="button" aria-label="Remove prize ${index + 1}" ${prizes.length <= 2 || isSpinning ? "disabled" : ""}>×</button>`;
      const input = row.querySelector("input");
      input.value = prize;
      input.disabled = isSpinning;
      input.addEventListener("input", () => {
        prizes[index] = input.value.trim() || `Prize ${index + 1}`;
        drawWheel();
      });
      row.querySelector("button").addEventListener("click", () => {
        prizes.splice(index, 1);
        renderPrizeInputs();
        drawWheel();
      });
      prizeList.append(row);
    });
    addButton.disabled = isSpinning || prizes.length >= 12;
  }

  function spin() {
    if (isSpinning || modal.open) return;
    isSpinning = true;
    wheel.disabled = true;
    const winnerIndex = Math.floor(Math.random() * prizes.length);
    const winningPrize = prizes[winnerIndex];
    const slice = 360 / prizes.length;
    const landingOffset = (Math.random() - 0.5) * slice * LANDING_RANDOMNESS;
    const landingAngle = winnerIndex * slice + slice / 2 + landingOffset;
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const currentNormalized = ((rotation % 360) + 360) % 360;
    const targetNormalized = (360 - landingAngle) % 360;
    rotation += extraTurns * 360 + ((targetNormalized - currentNormalized + 360) % 360);
    canvas.style.transform = `rotate(${rotation}deg)`;
    lastTickIndex = getPrizeIndexAtAngle(getRenderedRotation());
    window.cancelAnimationFrame(spinFrame);
    spinFrame = window.requestAnimationFrame(updateSpinFeedback);
    renderPrizeInputs();
    spinTimer = window.setTimeout(() => {
      isSpinning = false;
      window.cancelAnimationFrame(spinFrame);
      spinFrame = null;
      wheel.disabled = false;
      renderPrizeInputs();
      setPointerPrize(winnerIndex);
      wonPrize.textContent = winningPrize;
      modal.showModal();
      playWinHorn();
      launchConfetti();
      againButton.focus();
    }, spinDuration);
  }

  function closeModal() { modal.close(); wheel.focus(); }
  wheel.addEventListener("click", spin);
  addButton.addEventListener("click", () => {
    if (prizes.length >= 12) return;
    prizes.push(`Prize ${prizes.length + 1}`);
    renderPrizeInputs();
    drawWheel();
    prizeList.querySelector(".wheel-prize-row:last-child input")?.focus();
  });
  againButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  stage.addEventListener("minigames:control", (event) => {
    if (event.detail?.control === "a") spin();
  });
  renderPrizeInputs();
  drawWheel();

  return {
    cleanup() {
      window.clearTimeout(spinTimer);
      window.clearTimeout(confettiTimer);
      window.cancelAnimationFrame(spinFrame);
      audioContext?.close().catch(() => { });
    }
  };
}
