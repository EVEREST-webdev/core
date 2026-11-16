const cloudTextures = Array.from({ length: 100 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `Assets/Resource Boy - Cloud Textures/${num}.png`;
});

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

let currentSlide = 1;
let targetCarouselOffset = 0;
let currentCarouselOffset = 0;
let isProgrammaticScroll = false;
let programmaticScrollTimeout = null;
let lastWheelTime = 0;
let lastWheelDir = 0;

const cloudsLayer1 = document.getElementById('clouds-layer-1');
const cloudsLayer2 = document.getElementById('clouds-layer-2');

function goToSlide(targetSlide, syncScroll = true) {
  const nextSlide = Math.min(6, Math.max(1, targetSlide));
  if (nextSlide === currentSlide) return;
  currentSlide = nextSlide;
  document.body.className = `slide-${currentSlide}`;

  if (currentSlide <= 2) {
    targetCarouselOffset = 0;
  } else if (currentSlide === 3) {
    targetCarouselOffset = -1;
  } else {
    targetCarouselOffset = -2;
  }

  if (syncScroll) {
    isProgrammaticScroll = true;
    clearTimeout(programmaticScrollTimeout);
    window.scrollTo({ top: (currentSlide - 1) * window.innerHeight, behavior: 'auto' });
    programmaticScrollTimeout = setTimeout(() => {
      isProgrammaticScroll = false;
    }, 80);
  }
}

window.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) < 12) return;
  const dir = e.deltaY > 0 ? 1 : -1;
  const now = performance.now();

  if (dir !== lastWheelDir || now - lastWheelTime > 450) {
    lastWheelTime = now;
    lastWheelDir = dir;
    if (dir > 0) {
      goToSlide(currentSlide + 1);
    } else {
      goToSlide(currentSlide - 1);
    }
  }
}, { passive: true });

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    e.preventDefault();
    goToSlide(currentSlide + 1);
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    goToSlide(currentSlide - 1);
  }
});

window.addEventListener('scroll', () => {
  if (isProgrammaticScroll) return;
  const targetSlide = Math.min(6, Math.max(1, Math.round(window.scrollY / window.innerHeight) + 1));
  if (targetSlide !== currentSlide) {
    goToSlide(targetSlide, false);
  }
}, { passive: true });

let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  const diffY = touchStartY - e.changedTouches[0].clientY;
  if (diffY > 30) {
    goToSlide(currentSlide + 1);
  } else if (diffY < -30) {
    goToSlide(currentSlide - 1);
  }
}, { passive: true });

const continueHint = document.getElementById('continue-hint');
if (continueHint) {
  continueHint.addEventListener('click', () => {
    goToSlide(2);
  });
}

const interestedHint = document.getElementById('interested-hint');
if (interestedHint) {
  interestedHint.addEventListener('click', () => {
    goToSlide(6);
  });
}

const dots = document.querySelectorAll('.progress-dot');
dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const slide = parseInt(dot.getAttribute('data-slide'), 10);
    if (!isNaN(slide)) {
      goToSlide(slide);
    }
  });
});

const activeClouds = [];
const MAX_CLOUDS = 6;
const MIN_CLOUDS = 3;

function getRandomCloudTexture() {
  const idx = Math.floor(Math.random() * cloudTextures.length);
  return cloudTextures[idx];
}

function spawnCloud(initial = false) {
  if (activeClouds.length >= MAX_CLOUDS) return;

  const layer = Math.random() < 0.5 ? 1 : 2;
  const container = layer === 1 ? cloudsLayer1 : cloudsLayer2;
  if (!container) return;

  const direction = Math.random() < 0.5 ? 1 : -1;
  const widthVw = 32 + Math.random() * 22;
  const widthPx = (window.innerWidth * widthVw) / 100;
  const opacity = isFirefox ? (0.28 + Math.random() * 0.22) : (0.16 + Math.random() * 0.16);
  const speed = 10 + Math.random() * 16;

  const maxTop = (currentSlide >= 2 && currentSlide <= 4) ? 0.58 : 0.42;
  const y = (0.02 + Math.random() * maxTop) * window.innerHeight;

  let x;
  if (initial) {
    x = Math.random() * (window.innerWidth - widthPx * 0.5);
  } else {
    x = direction === 1 ? -widthPx - 40 : window.innerWidth + 40;
  }

  const img = document.createElement('img');
  img.className = 'cloud-item';
  img.src = getRandomCloudTexture();
  img.style.width = `${Math.round(widthPx)}px`;
  img.style.opacity = opacity.toFixed(2);
  container.appendChild(img);

  const cloud = {
    element: img,
    layer,
    direction,
    speed,
    width: widthPx,
    x,
    y
  };

  activeClouds.push(cloud);
}

for (let i = 0; i < 4; i++) {
  spawnCloud(true);
}

let lastFrameTime = performance.now();
function animateClouds(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
  lastFrameTime = now;

  currentCarouselOffset += (targetCarouselOffset - currentCarouselOffset) * (1 - Math.exp(-dt * 4.2));

  for (let i = activeClouds.length - 1; i >= 0; i--) {
    const c = activeClouds[i];
    c.x += c.speed * c.direction * dt;

    const shiftPerStep = c.layer === 2 ? 300 : 95;
    const carouselShift = currentCarouselOffset * shiftPerStep;
    const renderX = c.x + carouselShift;

    c.element.style.transform = `translate3d(${renderX.toFixed(1)}px, ${c.y.toFixed(1)}px, 0)`;

    const isOffscreen = (c.direction === 1 && renderX > window.innerWidth + 160) ||
                        (c.direction === -1 && renderX < -c.width - 160);

    if (isOffscreen) {
      if (c.element.parentNode) {
        c.element.parentNode.removeChild(c.element);
      }
      activeClouds.splice(i, 1);
    }
  }

  if (activeClouds.length < MIN_CLOUDS) {
    spawnCloud(false);
  } else if (activeClouds.length < MAX_CLOUDS && Math.random() < 0.008) {
    spawnCloud(false);
  }

  requestAnimationFrame(animateClouds);
}

window.scrollTo(0, 0);

requestAnimationFrame((now) => {
  lastFrameTime = now;
  requestAnimationFrame(animateClouds);
});
