let adaptiveBoost = 0;
let pulseTimer = null;
let audioCtx = null;

/**
 * Code that executes when a click happens inside the grid.
 */
function processClick(interaction) {
  const { type } = interaction;

  if (type === 'success') {
    adaptiveBoost = Math.max(0, adaptiveBoost - 2);
    playGoalTone();
  } else {
    adaptiveBoost = Math.min(8, adaptiveBoost + 2);
    playFailTone();
  }
  applyGoalStyling();
}

function applyGoalStyling() {
  // Reset neutral targets (CSS defines base look; here we just clear state)
  const targets = document.querySelectorAll('.target');
  targets.forEach(t => {
    t.removeAttribute('style'); // limpa quaisquer estilos inline de goal anterior
    t.textContent = '';
    t.parentElement.style.outline = 'none';
    t.parentElement.style.border = 'none';
    t.parentElement.style.boxSizing = 'border-box';
    t.classList.remove('pulse');
  });

  // Highlight current/next goals
  styleGoal('.goal-0', '100%', '#00ff2a', '1');
  styleGoal('.goal-1', '33.3333%', '#ffcc00', '2', '4px');
  // styleGoal('.goal-2', '33.3333%', '#ff8800', '3', '4px');
}

function styleGoal(sel, size, color, label, outlineWidth = '3px') {
  const el = document.querySelector(sel);
  if (!el) return;

  el.style.width = size;
  el.style.height = size;
  if (size === '100%') {
    el.style.top = '0';
    el.style.left = '0';
    el.style.transform = 'none';
    el.style.lineHeight = '100%';
  } else {
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.lineHeight = size;
  }

  el.style.background = color;
  el.style.boxShadow = 'none';
  el.style.borderRadius = '0';
  el.style.boxSizing = 'border-box';
  el.style.border = 'none';
  el.style.color = '#000';
  el.style.fontWeight = '700';
  el.style.fontSize = '1.2rem';
  el.style.textAlign = 'center';
  el.style.userSelect = 'none';
  el.textContent = label;
  el.parentElement.style.outline = 'none';
  el.parentElement.style.boxSizing = 'border-box';
  el.parentElement.style.border = `${outlineWidth} solid ${color}`;

  if (sel === '.goal-0') {
    el.classList.add('pulse');
  } else {
    el.classList.remove('pulse');
  }
}

function restartPulse() {
  // pulsar desativado para manter o alinhamento estável
}

// Sounds
function playGoalTone() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const duration = 0.12;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Audio not available', e);
  }
}

function playFailTone() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const duration = 0.14;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = 220;
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Audio not available', e);
  }
}

function processEnd(performance) {
  const times = performance.interactions.map(i => i.elapsed);
  const avgTime = times.length
    ? times.reduce((a, b) => a + b, 0) / times.length
    : 0;
  const minTime = times.length ? Math.min(...times) : 0;
  const maxTime = times.length ? Math.max(...times) : 0;
  const medianTime = (() => {
    if (!times.length) return 0;
    const sorted = [...times].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; // fórmula da mediana
  })();
  const stdDevTime = (() => {
    if (times.length < 2) return 0;
    const mean = avgTime;
    const variance = times.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0) / times.length;
    return Math.sqrt(variance); // Desvio padrão é a raiz quadrada da variância
  })();

  const accuracy =
    performance.successes + performance.failures > 0
      ? performance.successes / (performance.successes + performance.failures)
      : 0;

  console.log('Resumo final', {
    age: performance.age,
    user_id: performance.user_id,
    elapsed: performance.elapsed,
    avgTime: avgTime.toFixed(2),
    minTime: minTime.toFixed(2),
    maxTime: maxTime.toFixed(2),
    medianTime: medianTime.toFixed(2),
    stdDevTime: stdDevTime.toFixed(2),
    timePerTarget: times.map(t => Number(t.toFixed(2))),
    successes: performance.successes,
    failures: performance.failures,
    mistakes: performance.mistakes,
    accuracy: accuracy.toFixed(2),
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyGoalStyling();
  setInterval(applyGoalStyling, 120);
});
