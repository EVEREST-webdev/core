const curatedCloudTextures = [
  'Assets/Resource Boy - Cloud Textures/01.png',
  'Assets/Resource Boy - Cloud Textures/07.png',
  'Assets/Resource Boy - Cloud Textures/14.png',
  'Assets/Resource Boy - Cloud Textures/22.png',
  'Assets/Resource Boy - Cloud Textures/29.png',
  'Assets/Resource Boy - Cloud Textures/35.png',
  'Assets/Resource Boy - Cloud Textures/42.png',
  'Assets/Resource Boy - Cloud Textures/50.png'
];

curatedCloudTextures.forEach((src) => {
  const img = new Image();
  img.src = src;
});

const preSky = new Image();
preSky.src = 'Assets/sky.jpg';
const preMnt = new Image();
preMnt.src = 'Assets/Everest.png';

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

let currentSlide = 1;
let targetCarouselOffset = 0;
let currentCarouselOffset = 0;
let isProgrammaticScroll = false;
let programmaticScrollTimeout = null;
let lastWheelTime = 0;
let lastWheelDir = 0;

const viewport = document.getElementById('viewport');
const cloudsLayer1 = document.getElementById('clouds-layer-1');
const cloudsLayer2 = document.getElementById('clouds-layer-2');
const finalSection = document.getElementById('final-section');

function updateScale() {
  const isMobile = window.innerWidth <= 768;
  let scale;
  if (isMobile) {
    scale = Math.min(1, Math.max(0.68, window.innerWidth / 480));
  } else {
    scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    scale = Math.max(0.48, scale);
  }
  document.documentElement.style.setProperty('--ui-scale', scale.toFixed(4));
}

function updateDeviceMode() {
  updateScale();

  const w = window.innerWidth;
  const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
  const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const ua = navigator.userAgent.toLowerCase();
  const isMobileUA = /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua);
  const isTabletUA = /ipad|tablet|(android(?!.*mobile))/i.test(ua);

  const isMobile = (w <= 768 && (hasTouch || isCoarse || isMobileUA)) || (w <= 600);
  const isTablet = !isMobile && ((w <= 1024 && (hasTouch || isCoarse || isTabletUA)) || isTabletUA);

  document.body.classList.toggle('is-mobile', isMobile);
  document.body.classList.toggle('is-tablet', isTablet);
}

window.addEventListener('resize', updateDeviceMode);
window.addEventListener('orientationchange', updateDeviceMode);
updateDeviceMode();

function goToSlide(targetSlide, syncScroll = true) {
  const nextSlide = Math.min(6, Math.max(1, targetSlide));
  if (nextSlide === currentSlide) return;
  currentSlide = nextSlide;

  const isMobile = document.body.classList.contains('is-mobile');
  const isTablet = document.body.classList.contains('is-tablet');
  document.body.className = `slide-${currentSlide}` + (isMobile ? ' is-mobile' : '') + (isTablet ? ' is-tablet' : '');

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
    }, 100);
  }
}

window.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) < 12) return;
  const dir = e.deltaY > 0 ? 1 : -1;
  const now = performance.now();

  if (currentSlide === 6 && finalSection) {
    const isInsideFinal = finalSection.contains(e.target);
    if (isInsideFinal) {
      if (dir > 0 && finalSection.scrollTop < finalSection.scrollHeight - finalSection.clientHeight - 2) {
        return;
      }
      if (dir < 0 && finalSection.scrollTop > 2) {
        return;
      }
    }
  }

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
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
    return;
  }
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

let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let isTouchActive = false;
let isDragging = false;
let currentDragDelta = 0;

window.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) return;
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchStartTime = performance.now();
  isTouchActive = true;
  isDragging = false;
  currentDragDelta = 0;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (!isTouchActive) return;
  const touch = e.touches[0];
  const deltaX = touchStartX - touch.clientX;
  const deltaY = touchStartY - touch.clientY;
  const isMobile = document.body.classList.contains('is-mobile');

  if (currentSlide === 6 && finalSection) {
    const isInsideFinal = finalSection.contains(e.target);
    if (isInsideFinal) {
      if (finalSection.scrollTop > 5) {
        return;
      }
      if (deltaY > 0) {
        return;
      }
    }
  }

  const primaryDelta = isMobile ? deltaY : deltaX;
  const secondaryDelta = isMobile ? deltaX : deltaY;

  if (!isDragging && Math.abs(primaryDelta) > 10 && Math.abs(primaryDelta) > Math.abs(secondaryDelta)) {
    isDragging = true;
  }

  if (!isDragging) return;

  if (e.cancelable) {
    e.preventDefault();
  }

  let effectiveDelta = primaryDelta;
  if ((currentSlide === 1 && primaryDelta < 0) || (currentSlide === 6 && primaryDelta > 0)) {
    effectiveDelta = primaryDelta * 0.25;
  }
  currentDragDelta = effectiveDelta;

  if (viewport) {
    viewport.style.transition = 'none';
    if (isMobile) {
      viewport.style.transform = `translate3d(0, ${(-effectiveDelta * 0.45).toFixed(1)}px, 0)`;
    } else {
      viewport.style.transform = `translate3d(${(-effectiveDelta * 0.45).toFixed(1)}px, 0, 0)`;
    }
  }
}, { passive: false });

window.addEventListener('touchend', (e) => {
  if (!isTouchActive) return;
  isTouchActive = false;

  if (!isDragging) return;
  isDragging = false;

  const isMobile = document.body.classList.contains('is-mobile');
  const touch = e.changedTouches[0];
  const deltaX = touchStartX - touch.clientX;
  const deltaY = touchStartY - touch.clientY;
  const primaryDelta = isMobile ? deltaY : deltaX;
  const totalDim = isMobile ? window.innerHeight : window.innerWidth;
  const progress = primaryDelta / (totalDim * 0.65);
  const elapsed = Math.max(1, performance.now() - touchStartTime);
  const velocity = Math.abs(primaryDelta) / elapsed;

  let targetSlide = currentSlide;
  if ((progress >= 0.33 || (velocity > 0.42 && primaryDelta > 35)) && currentSlide < 6) {
    targetSlide = currentSlide + 1;
  } else if ((progress <= -0.33 || (velocity > 0.42 && primaryDelta < -35)) && currentSlide > 1) {
    targetSlide = currentSlide - 1;
  }

  if (viewport) {
    viewport.style.transition = 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1)';
    viewport.style.transform = 'translate3d(0, 0, 0)';
  }

  if (targetSlide !== currentSlide) {
    goToSlide(targetSlide);
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

const redesignForm = document.getElementById('redesign-form');
const successMsg = document.getElementById('booking-success-msg');
const submitBtn = document.getElementById('booking-submit-button');
if (redesignForm) {
  redesignForm.addEventListener('submit', () => {
    if (submitBtn) {
      submitBtn.textContent = 'Submitted!';
      submitBtn.style.opacity = '0.7';
      submitBtn.style.pointerEvents = 'none';
    }
    if (successMsg) {
      successMsg.style.display = 'block';
    }
  });
}

const bookingTextarea = document.querySelector('.booking-textarea');
if (bookingTextarea) {
  function adjustTextareaHeight() {
    bookingTextarea.style.height = 'auto';
    bookingTextarea.style.height = `${bookingTextarea.scrollHeight}px`;
  }
  bookingTextarea.addEventListener('input', adjustTextareaHeight);
  window.addEventListener('resize', adjustTextareaHeight);
  setTimeout(adjustTextareaHeight, 60);
}

const cloudsPool = [];
const POOL_SIZE = 6;

function resetCloud(c, initial = false) {
  const tex = curatedCloudTextures[Math.floor(Math.random() * curatedCloudTextures.length)];
  c.element.src = tex;
  c.direction = Math.random() < 0.5 ? 1 : -1;
  const widthVw = 30 + Math.random() * 22;
  c.width = (window.innerWidth * widthVw) / 100;
  c.element.style.width = `${Math.round(c.width)}px`;

  c.baseOpacity = isFirefox ? (0.24 + Math.random() * 0.18) : (0.09 + Math.random() * 0.09);
  c.element.style.opacity = c.baseOpacity.toFixed(3);
  c.speed = 10 + Math.random() * 15;

  const maxTop = (currentSlide >= 2 && currentSlide <= 4) ? 0.58 : 0.42;
  c.y = (0.02 + Math.random() * maxTop) * window.innerHeight;

  if (initial) {
    c.x = Math.random() * (window.innerWidth - c.width * 0.5);
  } else {
    c.x = c.direction === 1 ? -c.width - 40 : window.innerWidth + 40;
  }
}

function initCloudPool() {
  for (let i = 0; i < POOL_SIZE; i++) {
    const layer = (i % 2 === 0) ? 1 : 2;
    const container = layer === 1 ? cloudsLayer1 : cloudsLayer2;
    if (!container) continue;

    const img = document.createElement('img');
    img.className = 'cloud-item';
    img.draggable = false;
    img.loading = 'eager';
    img.decoding = 'sync';
    container.appendChild(img);

    const cloud = {
      element: img,
      layer: layer,
      direction: 1,
      speed: 12,
      width: 400,
      x: 0,
      y: 0,
      baseOpacity: 0.15
    };
    resetCloud(cloud, true);
    cloudsPool.push(cloud);
  }
}

initCloudPool();

let lastFrameTime = performance.now();
function animateClouds(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
  lastFrameTime = now;

  currentCarouselOffset += (targetCarouselOffset - currentCarouselOffset) * (1 - Math.exp(-dt * 4.2));

  for (let i = 0; i < cloudsPool.length; i++) {
    const c = cloudsPool[i];
    c.x += c.speed * c.direction * dt;

    const shiftPerStep = c.layer === 2 ? 300 : 95;
    const carouselShift = currentCarouselOffset * shiftPerStep;
    const renderX = c.x + carouselShift;

    c.element.style.transform = `translate3d(${renderX.toFixed(1)}px, ${c.y.toFixed(1)}px, 0)`;

    const isOffscreen = (c.direction === 1 && renderX > window.innerWidth + 160) ||
                        (c.direction === -1 && renderX < -c.width - 160);

    if (isOffscreen) {
      resetCloud(c, false);
    }
  }

  requestAnimationFrame(animateClouds);
}

window.scrollTo(0, 0);

requestAnimationFrame((now) => {
  lastFrameTime = now;
  requestAnimationFrame(animateClouds);
});
