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
  const nextSlide = Math.min(5, Math.max(1, targetSlide));
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

  if (currentSlide === 5 && finalSection) {
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
  const targetSlide = Math.min(5, Math.max(1, Math.round(window.scrollY / window.innerHeight) + 1));
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

  if (currentSlide === 5 && finalSection) {
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
  if ((currentSlide === 1 && primaryDelta < 0) || (currentSlide === 5 && primaryDelta > 0)) {
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
  if ((progress >= 0.33 || (velocity > 0.42 && primaryDelta > 35)) && currentSlide < 5) {
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
    goToSlide(5);
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

const pageHistoryInput = document.getElementById('page-history-input');
const userEmailInput = document.getElementById('user-email-input');
const emailAsterisk = document.getElementById('email-asterisk');
const websiteAsterisk = document.getElementById('website-asterisk');
const yesMcRow = document.getElementById('yes-mc-row');
const noMcRow = document.getElementById('no-mc-row');
const websiteLinkInput = document.getElementById('website-link-input');
const noHelperText = document.getElementById('no-helper-text');
const entry1282780905Other = document.getElementById('entry-1282780905-other');
const entry1282780905No = document.getElementById('entry-1282780905-no');
const backToSlide4Btn = document.getElementById('back-to-slide4-btn');
const nextStepButton = document.getElementById('next-step-button');

const qStep1 = document.getElementById('q-step-1');
const qStep2HasSite = document.getElementById('q-step-2-has-site');
const qStep2NoSite = document.getElementById('q-step-2-no-site');

const redesignAsterisk = document.getElementById('redesign-asterisk');
const customRedesignMcRow = document.getElementById('custom-redesign-mc-row');
const presetRedesignMcRow = document.getElementById('preset-redesign-mc-row');
const redesignDescInput = document.getElementById('redesign-desc-input');
const entry1222736678Other = document.getElementById('entry-1222736678-other');
const entry1222736678Preset = document.getElementById('entry-1222736678-preset');
const backToStep1FromHasBtn = document.getElementById('back-to-step1-from-has-btn');
const submitButtonHasSite = document.getElementById('submit-button-has-site');

const domainAsterisk = document.getElementById('domain-asterisk');
const freeDomainMcRow = document.getElementById('free-domain-mc-row');
const buyDomainMcRow = document.getElementById('buy-domain-mc-row');
const domainLinkInput = document.getElementById('domain-link-input');
const entry1830002899Free = document.getElementById('entry-1830002899-free');
const entry1830002899Buy = document.getElementById('entry-1830002899-buy');
const backToStep1FromNoBtn = document.getElementById('back-to-step1-from-no-btn');
const submitButtonNoSite = document.getElementById('submit-button-no-site');
const redesignForm = document.getElementById('redesign-form');
const questionnaireMainView = document.getElementById('questionnaire-main-view');
const submissionConfirmation = document.getElementById('submission-confirmation');
const resetQuestionnaireBtn = document.getElementById('reset-questionnaire-btn');

let step1Choice = '';

function triggerAsteriskFlash(el) {
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(() => {
    el.classList.remove('flash');
  }, 2000);
}

function isEmailValid() {
  const emailVal = userEmailInput ? userEmailInput.value.trim() : '';
  return emailVal.length > 3 && emailVal.includes('@');
}

function isStep1ChoiceValid() {
  if (step1Choice === 'no') return true;
  if (step1Choice === 'yes') {
    return websiteLinkInput ? websiteLinkInput.value.trim().length > 0 : false;
  }
  return false;
}

function validateStep1() {
  const isReady = isEmailValid() && isStep1ChoiceValid();
  if (nextStepButton) {
    nextStepButton.classList.toggle('ready', isReady);
  }
}

if (userEmailInput) {
  userEmailInput.addEventListener('input', () => {
    if (userEmailInput.value.trim().length > 0) {
      userEmailInput.classList.add('has-content');
    } else {
      userEmailInput.classList.remove('has-content');
    }
    validateStep1();
  });

  userEmailInput.addEventListener('blur', () => {
    if (userEmailInput.value.trim().length > 0) {
      userEmailInput.classList.add('has-content');
    } else {
      userEmailInput.classList.remove('has-content');
    }
  });
}

function selectYesOption() {
  step1Choice = 'yes';
  if (yesMcRow) yesMcRow.classList.add('selected');
  if (noMcRow) noMcRow.classList.remove('selected');
  if (websiteLinkInput) {
    websiteLinkInput.classList.add('active');
    if (websiteLinkInput.value.trim().length > 0) {
      websiteLinkInput.classList.add('has-content');
    } else {
      websiteLinkInput.classList.remove('has-content');
    }
  }
  if (noHelperText) noHelperText.classList.remove('active');
  if (entry1282780905Other) entry1282780905Other.disabled = false;
  if (entry1282780905No) entry1282780905No.disabled = true;
  if (pageHistoryInput) pageHistoryInput.value = '0,1';
  validateStep1();
}

function selectNoOption() {
  step1Choice = 'no';
  if (noMcRow) noMcRow.classList.add('selected');
  if (yesMcRow) yesMcRow.classList.remove('selected');
  if (websiteLinkInput) {
    websiteLinkInput.classList.remove('active');
    websiteLinkInput.classList.remove('has-content');
  }
  if (noHelperText) noHelperText.classList.add('active');
  if (entry1282780905No) entry1282780905No.disabled = false;
  if (entry1282780905Other) entry1282780905Other.disabled = true;
  if (pageHistoryInput) pageHistoryInput.value = '0,2';
  validateStep1();
}

function unselectStep1() {
  step1Choice = '';
  if (yesMcRow) yesMcRow.classList.remove('selected');
  if (noMcRow) noMcRow.classList.remove('selected');
  if (websiteLinkInput) {
    websiteLinkInput.classList.remove('active');
    websiteLinkInput.classList.remove('has-content');
  }
  if (noHelperText) noHelperText.classList.remove('active');
  if (entry1282780905Other) entry1282780905Other.disabled = true;
  if (entry1282780905No) entry1282780905No.disabled = true;
  validateStep1();
}

if (yesMcRow) {
  yesMcRow.addEventListener('click', () => {
    if (step1Choice === 'yes') {
      unselectStep1();
    } else {
      selectYesOption();
      if (websiteLinkInput) websiteLinkInput.focus();
    }
  });
}

if (noMcRow) {
  noMcRow.addEventListener('click', () => {
    if (step1Choice === 'no') {
      unselectStep1();
    } else {
      selectNoOption();
    }
  });
}

if (websiteLinkInput) {
  websiteLinkInput.addEventListener('focus', () => {
    if (step1Choice !== 'yes') {
      selectYesOption();
    }
  });

  websiteLinkInput.addEventListener('blur', () => {
    if (websiteLinkInput.value.trim().length > 0) {
      websiteLinkInput.classList.add('has-content');
    } else {
      websiteLinkInput.classList.remove('has-content');
    }
  });

  websiteLinkInput.addEventListener('input', () => {
    if (step1Choice !== 'yes') {
      step1Choice = 'yes';
      if (yesMcRow) yesMcRow.classList.add('selected');
      if (noMcRow) noMcRow.classList.remove('selected');
      if (noHelperText) noHelperText.classList.remove('active');
      if (entry1282780905Other) entry1282780905Other.disabled = false;
      if (entry1282780905No) entry1282780905No.disabled = true;
      if (pageHistoryInput) pageHistoryInput.value = '0,1';
    }
    if (websiteLinkInput.value.trim().length > 0) {
      websiteLinkInput.classList.add('has-content');
    } else {
      websiteLinkInput.classList.remove('has-content');
    }
    validateStep1();
  });
}

if (backToSlide4Btn) {
  backToSlide4Btn.addEventListener('click', () => {
    goToSlide(4);
  });
}

if (nextStepButton) {
  nextStepButton.addEventListener('click', () => {
    const emailOk = isEmailValid();
    const choiceOk = isStep1ChoiceValid();

    if (!emailOk || !choiceOk) {
      if (!emailOk) triggerAsteriskFlash(emailAsterisk);
      if (!choiceOk) triggerAsteriskFlash(websiteAsterisk);
      return;
    }

    if (qStep1) {
      qStep1.style.opacity = '0';
      qStep1.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        qStep1.classList.remove('active');
        qStep1.style.opacity = '';
        qStep1.style.transform = '';
        if (step1Choice === 'yes') {
          if (pageHistoryInput) pageHistoryInput.value = '0,1';
          if (qStep2HasSite) {
            qStep2HasSite.classList.add('active');
            validateHasSiteStep();
          }
        } else {
          if (pageHistoryInput) pageHistoryInput.value = '0,2';
          if (qStep2NoSite) {
            qStep2NoSite.classList.add('active');
            validateNoSiteStep();
          }
        }
      }, 250);
    }
  });
}

let redesignChoice = '';

function isHasSiteValid() {
  const descVal = redesignDescInput ? redesignDescInput.value.trim() : '';
  return (redesignChoice === 'custom' && descVal.length > 0) || redesignChoice === 'preset';
}

function validateHasSiteStep() {
  const isReady = isHasSiteValid();
  if (submitButtonHasSite) {
    submitButtonHasSite.classList.toggle('ready', isReady);
  }
}

function selectCustomRedesign() {
  redesignChoice = 'custom';
  if (customRedesignMcRow) customRedesignMcRow.classList.add('selected');
  if (presetRedesignMcRow) presetRedesignMcRow.classList.remove('selected');
  if (entry1222736678Other) entry1222736678Other.disabled = false;
  if (entry1222736678Preset) entry1222736678Preset.disabled = true;
  if (redesignDescInput) {
    if (redesignDescInput.value.trim().length > 0) {
      redesignDescInput.classList.add('has-content');
    } else {
      redesignDescInput.classList.remove('has-content');
    }
  }
  validateHasSiteStep();
}

function selectPresetRedesign() {
  redesignChoice = 'preset';
  if (presetRedesignMcRow) presetRedesignMcRow.classList.add('selected');
  if (customRedesignMcRow) customRedesignMcRow.classList.remove('selected');
  if (entry1222736678Preset) entry1222736678Preset.disabled = false;
  if (entry1222736678Other) entry1222736678Other.disabled = true;
  if (redesignDescInput) {
    redesignDescInput.classList.remove('has-content');
  }
  validateHasSiteStep();
}

function unselectHasSite() {
  redesignChoice = '';
  if (customRedesignMcRow) customRedesignMcRow.classList.remove('selected');
  if (presetRedesignMcRow) presetRedesignMcRow.classList.remove('selected');
  if (entry1222736678Other) entry1222736678Other.disabled = true;
  if (entry1222736678Preset) entry1222736678Preset.disabled = true;
  if (redesignDescInput) redesignDescInput.classList.remove('has-content');
  validateHasSiteStep();
}

if (customRedesignMcRow) {
  customRedesignMcRow.addEventListener('click', () => {
    if (redesignChoice === 'custom') {
      unselectHasSite();
    } else {
      selectCustomRedesign();
      if (redesignDescInput) redesignDescInput.focus();
    }
  });
}

if (presetRedesignMcRow) {
  presetRedesignMcRow.addEventListener('click', () => {
    if (redesignChoice === 'preset') {
      unselectHasSite();
    } else {
      selectPresetRedesign();
    }
  });
}

if (redesignDescInput) {
  redesignDescInput.addEventListener('focus', () => {
    if (redesignChoice !== 'custom') {
      selectCustomRedesign();
    }
  });

  redesignDescInput.addEventListener('blur', () => {
    if (redesignDescInput.value.trim().length > 0 && redesignChoice === 'custom') {
      redesignDescInput.classList.add('has-content');
    } else {
      redesignDescInput.classList.remove('has-content');
    }
  });

  redesignDescInput.addEventListener('input', () => {
    redesignDescInput.style.height = 'auto';
    redesignDescInput.style.height = `${redesignDescInput.scrollHeight}px`;

    if (redesignChoice !== 'custom') {
      selectCustomRedesign();
    }
    if (redesignDescInput.value.trim().length > 0) {
      redesignDescInput.classList.add('has-content');
    } else {
      redesignDescInput.classList.remove('has-content');
    }
    validateHasSiteStep();
  });
}

if (backToStep1FromHasBtn) {
  backToStep1FromHasBtn.addEventListener('click', () => {
    if (qStep2HasSite) {
      qStep2HasSite.style.opacity = '0';
      qStep2HasSite.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        qStep2HasSite.classList.remove('active');
        qStep2HasSite.style.opacity = '';
        qStep2HasSite.style.transform = '';
        if (qStep1) {
          qStep1.classList.add('active');
          validateStep1();
        }
      }, 250);
    }
  });
}

if (submitButtonHasSite) {
  submitButtonHasSite.addEventListener('click', (e) => {
    if (!isHasSiteValid()) {
      e.preventDefault();
      triggerAsteriskFlash(redesignAsterisk);
    }
  });
}

let domainChoice = '';

function isNoSiteValid() {
  if (domainChoice === 'free') return true;
  if (domainChoice === 'buy') {
    return domainLinkInput ? domainLinkInput.value.trim().length > 0 : false;
  }
  return false;
}

function validateNoSiteStep() {
  const isReady = isNoSiteValid();
  if (submitButtonNoSite) {
    submitButtonNoSite.classList.toggle('ready', isReady);
  }
}

function selectFreeDomain() {
  domainChoice = 'free';
  if (freeDomainMcRow) freeDomainMcRow.classList.add('selected');
  if (buyDomainMcRow) buyDomainMcRow.classList.remove('selected');
  if (domainLinkInput) {
    domainLinkInput.classList.remove('active');
    domainLinkInput.classList.remove('has-content');
    domainLinkInput.disabled = true;
  }
  if (entry1830002899Free) entry1830002899Free.disabled = false;
  if (entry1830002899Buy) entry1830002899Buy.disabled = true;
  validateNoSiteStep();
}

function selectBuyDomain() {
  domainChoice = 'buy';
  if (buyDomainMcRow) buyDomainMcRow.classList.add('selected');
  if (freeDomainMcRow) freeDomainMcRow.classList.remove('selected');
  if (domainLinkInput) {
    domainLinkInput.disabled = false;
    domainLinkInput.classList.add('active');
    if (domainLinkInput.value.trim().length > 0) {
      domainLinkInput.classList.add('has-content');
    } else {
      domainLinkInput.classList.remove('has-content');
    }
  }
  if (entry1830002899Buy) entry1830002899Buy.disabled = false;
  if (entry1830002899Free) entry1830002899Free.disabled = true;
  validateNoSiteStep();
}

function unselectNoSite() {
  domainChoice = '';
  if (freeDomainMcRow) freeDomainMcRow.classList.remove('selected');
  if (buyDomainMcRow) buyDomainMcRow.classList.remove('selected');
  if (domainLinkInput) {
    domainLinkInput.classList.remove('active');
    domainLinkInput.classList.remove('has-content');
    domainLinkInput.disabled = true;
  }
  if (entry1830002899Free) entry1830002899Free.disabled = true;
  if (entry1830002899Buy) entry1830002899Buy.disabled = true;
  validateNoSiteStep();
}

if (freeDomainMcRow) {
  freeDomainMcRow.addEventListener('click', () => {
    if (domainChoice === 'free') {
      unselectNoSite();
    } else {
      selectFreeDomain();
    }
  });
}

if (buyDomainMcRow) {
  buyDomainMcRow.addEventListener('click', () => {
    if (domainChoice === 'buy') {
      unselectNoSite();
    } else {
      selectBuyDomain();
      if (domainLinkInput) domainLinkInput.focus();
    }
  });
}

if (domainLinkInput) {
  domainLinkInput.addEventListener('focus', () => {
    if (domainChoice !== 'buy') {
      selectBuyDomain();
    }
  });

  domainLinkInput.addEventListener('blur', () => {
    if (domainLinkInput.value.trim().length > 0 && domainChoice === 'buy') {
      domainLinkInput.classList.add('has-content');
    } else {
      domainLinkInput.classList.remove('has-content');
    }
  });

  domainLinkInput.addEventListener('input', () => {
    if (domainChoice !== 'buy') {
      domainChoice = 'buy';
      if (buyDomainMcRow) buyDomainMcRow.classList.add('selected');
      if (freeDomainMcRow) freeDomainMcRow.classList.remove('selected');
      if (entry1830002899Buy) entry1830002899Buy.disabled = false;
      if (entry1830002899Free) entry1830002899Free.disabled = true;
    }
    if (domainLinkInput.value.trim().length > 0) {
      domainLinkInput.classList.add('has-content');
    } else {
      domainLinkInput.classList.remove('has-content');
    }
    validateNoSiteStep();
  });
}

if (backToStep1FromNoBtn) {
  backToStep1FromNoBtn.addEventListener('click', () => {
    if (qStep2NoSite) {
      qStep2NoSite.style.opacity = '0';
      qStep2NoSite.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        qStep2NoSite.classList.remove('active');
        qStep2NoSite.style.opacity = '';
        qStep2NoSite.style.transform = '';
        if (qStep1) {
          qStep1.classList.add('active');
          validateStep1();
        }
      }, 250);
    }
  });
}

if (submitButtonNoSite) {
  submitButtonNoSite.addEventListener('click', (e) => {
    if (!isNoSiteValid()) {
      e.preventDefault();
      triggerAsteriskFlash(domainAsterisk);
    }
  });
}

if (redesignForm) {
  redesignForm.addEventListener('submit', (e) => {
    if (step1Choice === 'yes') {
      if (!isEmailValid() || !isStep1ChoiceValid() || !isHasSiteValid()) {
        e.preventDefault();
        if (!isEmailValid()) triggerAsteriskFlash(emailAsterisk);
        if (!isStep1ChoiceValid()) triggerAsteriskFlash(websiteAsterisk);
        if (!isHasSiteValid()) triggerAsteriskFlash(redesignAsterisk);
        return;
      }
      if (pageHistoryInput) pageHistoryInput.value = '0,1';
      if (entry1830002899Free) entry1830002899Free.disabled = true;
      if (entry1830002899Buy) entry1830002899Buy.disabled = true;
      if (domainLinkInput) domainLinkInput.disabled = true;
    } else {
      if (!isEmailValid() || !isStep1ChoiceValid() || !isNoSiteValid()) {
        e.preventDefault();
        if (!isEmailValid()) triggerAsteriskFlash(emailAsterisk);
        if (!isStep1ChoiceValid()) triggerAsteriskFlash(websiteAsterisk);
        if (!isNoSiteValid()) triggerAsteriskFlash(domainAsterisk);
        return;
      }
      if (pageHistoryInput) pageHistoryInput.value = '0,2';
      if (entry1222736678Other) entry1222736678Other.disabled = true;
      if (entry1222736678Preset) entry1222736678Preset.disabled = true;
      if (redesignDescInput) redesignDescInput.disabled = true;
    }

    if (questionnaireMainView) {
      questionnaireMainView.classList.add('faded-out');
    }
    setTimeout(() => {
      if (submissionConfirmation) {
        submissionConfirmation.classList.add('active');
      }
    }, 500);

    if (submitButtonHasSite) {
      submitButtonHasSite.textContent = 'Submitted!';
      submitButtonHasSite.style.opacity = '0.7';
      submitButtonHasSite.style.pointerEvents = 'none';
    }
    if (submitButtonNoSite) {
      submitButtonNoSite.textContent = 'Submitted!';
      submitButtonNoSite.style.opacity = '0.7';
      submitButtonNoSite.style.pointerEvents = 'none';
    }
  });
}

if (resetQuestionnaireBtn) {
  resetQuestionnaireBtn.addEventListener('click', () => {
    if (submissionConfirmation) {
      submissionConfirmation.classList.remove('active');
    }

    setTimeout(() => {
      if (userEmailInput) {
        userEmailInput.value = '';
        userEmailInput.classList.remove('has-content');
      }
      if (websiteLinkInput) {
        websiteLinkInput.value = '';
        websiteLinkInput.classList.remove('has-content');
        websiteLinkInput.classList.remove('active');
      }
      if (noHelperText) {
        noHelperText.classList.remove('active');
      }
      if (redesignDescInput) {
        redesignDescInput.value = '';
        redesignDescInput.classList.remove('has-content');
        redesignDescInput.style.height = 'auto';
      }
      if (domainLinkInput) {
        domainLinkInput.value = '';
        domainLinkInput.classList.remove('has-content');
        domainLinkInput.classList.remove('active');
        domainLinkInput.disabled = true;
      }

      if (yesMcRow) yesMcRow.classList.remove('selected');
      if (noMcRow) noMcRow.classList.remove('selected');
      if (customRedesignMcRow) customRedesignMcRow.classList.remove('selected');
      if (presetRedesignMcRow) presetRedesignMcRow.classList.remove('selected');
      if (freeDomainMcRow) freeDomainMcRow.classList.remove('selected');
      if (buyDomainMcRow) buyDomainMcRow.classList.remove('selected');

      step1Choice = '';
      redesignChoice = '';
      domainChoice = '';

      if (entry1282780905Other) entry1282780905Other.disabled = true;
      if (entry1282780905No) entry1282780905No.disabled = true;
      if (entry1222736678Other) entry1222736678Other.disabled = true;
      if (entry1222736678Preset) entry1222736678Preset.disabled = true;
      if (entry1830002899Free) entry1830002899Free.disabled = true;
      if (entry1830002899Buy) entry1830002899Buy.disabled = true;
      if (pageHistoryInput) pageHistoryInput.value = '0,1';

      if (nextStepButton) nextStepButton.classList.remove('ready');
      if (submitButtonHasSite) {
        submitButtonHasSite.classList.remove('ready');
        submitButtonHasSite.textContent = 'Submit Request';
        submitButtonHasSite.style.opacity = '';
        submitButtonHasSite.style.pointerEvents = '';
      }
      if (submitButtonNoSite) {
        submitButtonNoSite.classList.remove('ready');
        submitButtonNoSite.textContent = 'Submit Request';
        submitButtonNoSite.style.opacity = '';
        submitButtonNoSite.style.pointerEvents = '';
      }

      if (qStep2HasSite) qStep2HasSite.classList.remove('active');
      if (qStep2NoSite) qStep2NoSite.classList.remove('active');
      if (qStep1) {
        qStep1.classList.add('active');
        qStep1.style.opacity = '';
        qStep1.style.transform = '';
      }

      if (questionnaireMainView) {
        questionnaireMainView.classList.remove('faded-out');
      }
    }, 500);
  });
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

  const maxTop = (currentSlide >= 2 && currentSlide <= 3) ? 0.58 : 0.42;
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
