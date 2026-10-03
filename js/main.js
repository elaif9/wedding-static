/* =========================================================
   Tema 3D Motion 18 - Static Replica (JS)
   - Cover open + audio autoplay (after user interaction)
   - Motion video autoplay after open
   - Scroll reveal animations (.inv-*)
   - Countdown to 10 Oct 2026
   - Save to Google Calendar
   - Wedding Gift collapse + copy to clipboard
   - Wishes (RSVP) - localStorage as mock backend
   - Gallery lightbox
   - Timeline line progress
   - YouTube video lazy-load
   ========================================================= */

(() => {
  'use strict';

  /* ---------- Helpers ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const WEDDING_DATE = new Date('2026-10-10T08:00:00+07:00').getTime() / 1000;
  const MOTION_DELAY = 13800; // ms

  /* =========================================================
     DYNAMIC INVITATION NAME
     ========================================================= */
  const invNameEl = $('#inv-name');
  if (invNameEl) {
    const params = new URLSearchParams(window.location.search);
    const invName = params.get('inv');
    if (invName) {
      invNameEl.textContent = decodeURIComponent(invName);
    }
  }

  /* =========================================================
     AUDIO
     ========================================================= */
  const audio    = $('#bg-audio');
  const btnMusic = $('#btn-music');

  function tryPlayAudio() {
    if (!audio) return;
    audio.volume = 0.7;
    const p = audio.play();
    if (p && p.catch) {
      p.then(() => {
        if (btnMusic) {
          btnMusic.classList.add('show', 'playing');
        }
      }).catch(() => {
        // browser autoplay blocked
        if (btnMusic) btnMusic.classList.add('show');
      });
    }
  }

  function toggleAudio() {
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      btnMusic.classList.add('playing');
    } else {
      audio.pause();
      btnMusic.classList.remove('playing');
    }
  }

  if (btnMusic) btnMusic.addEventListener('click', toggleAudio);

  /* =========================================================
     COVER OPEN
     ========================================================= */
  const cover    = $('#cover');
  const bgDeco   = $('.bg-deco');
  const btnOpen  = $('#btn-open');
  const main     = $('#main-content');
  const motionVid= $('#motion-video');
  const motionEl = $('#motionContent');

  function openCover() {
    // Fade out cover section saja — bg-deco tetap di belakang konten
    if (cover) {
      cover.style.transition = 'opacity 1.5s ease, height 0s 1.5s';
      cover.style.opacity = '0';
      setTimeout(() => {
        cover.style.display = 'none';
      }, 1500);
    }

    main.style.display = 'block';
    document.body.style.overflow = 'visible';
    document.body.style.height = 'auto';

    // Music start (after user interaction)
    tryPlayAudio();

    // Re-run reveal setelah konten terlihat (karena sebelumnya hidden)
    setTimeout(() => reveal(), 50);
    setTimeout(() => reveal(), 500);
    setTimeout(() => reveal(), 1500);

    // Motion video flow
    motionVid.currentTime = 0;
    motionVid.play().catch(() => {});
    setTimeout(() => {
      motionEl.style.display = 'block';
      reveal();
    }, MOTION_DELAY);
  }

  if (btnOpen) {
    btnOpen.addEventListener('click', (e) => {
      e.preventDefault();
      openCover();
    });
  }

  // Lock scroll while cover shown
  document.body.style.overflow = 'hidden';
  document.body.style.height   = '100vh';

  /* =========================================================
     SCROLL REVEAL (with stagger via data-delay)
     ========================================================= */
  function reveal() {
    const elements = $$('.inv-fade-in, .inv-atas, .inv-bawah, .inv-kiri, .inv-kanan, .inv-zoom-in, .inv-zoom-out, .inv-rotate-in, .inv-flip-x, .inv-flip-y');
    const winH = window.innerHeight;
    elements.forEach((el) => {
      if (el.classList.contains('active')) return;
      const rect = el.getBoundingClientRect();
      // Skip element yang masih tersembunyi (di dalam container display:none)
      if (rect.width === 0 && rect.height === 0) return;
      if (rect.top < winH - 100) {
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('active'), delay);
      }
    });
  }
  window.addEventListener('scroll', reveal, { passive: true });
  window.addEventListener('load', reveal);
  document.addEventListener('DOMContentLoaded', reveal);

  /* =========================================================
     COUNTDOWN
     ========================================================= */
  const cd = {
    d: $('.cd-days'),
    h: $('.cd-hours'),
    m: $('.cd-minutes'),
    s: $('.cd-seconds')
  };
  function tick() {
    const now = Math.floor(Date.now() / 1000);
    let diff = WEDDING_DATE - now;
    if (diff < 0) diff = 0;
    const days  = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins  = Math.floor((diff % 3600) / 60);
    const secs  = diff % 60;
    if (cd.d) cd.d.textContent = String(days).padStart(2, '0');
    if (cd.h) cd.h.textContent = String(hours).padStart(2, '0');
    if (cd.m) cd.m.textContent = String(mins).padStart(2, '0');
    if (cd.s) cd.s.textContent = String(secs).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);

  /* =========================================================
     SAVE TO GOOGLE CALENDAR
     ========================================================= */
  const btnSaveCal = $('#btn-save-cal');
  if (btnSaveCal) {
    const start = '20261010T040000Z';
    const end   = '20261010T060000Z';
    const url = 'https://www.google.com/calendar/render?action=TEMPLATE' +
      '&text=Hajatannye+Sekar+%26+Alif' +
      '&details=Hajatannye+%3A%3Cbr%3E%3Cbr%3ESekar%3Cbr%3E%26amp%3B%3Cbr%3EAlif%3Cbr%3E%3Cbr%3E10+.+10+.+2026' +
      '&location=Gedung+Serbaguna+Nur+Alam%2C+Pd.+Pesantren+Al+Hamid%2C+Jl.+Raya+Munjul+No.12%2C+Cipayung%2C+Jakarta+Timur' +
      '&dates=' + start + '%2F' + end;
    btnSaveCal.setAttribute('href', url);
  }

  // Copy to clipboard
  $$('.btn-copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
      }
      btn.classList.add('shake');
      setTimeout(() => btn.classList.remove('shake'), 600);
      showToast('Berhasil disalin: ' + text);
    });
  });

  /* =========================================================
     GALLERY LIGHTBOX
     ========================================================= */
  const lightbox = $('#lightbox');
  const lbImg    = $('#lbImg');
  const galleryItems = $$('.g-item');
  let currentIdx = 0;

  function openLightbox(idx) {
    currentIdx = idx;
    lbImg.src = galleryItems[idx].href;
    lightbox.style.display = 'flex';
  }
  function closeLightbox() { lightbox.style.display = 'none'; }
  function navLightbox(dir) {
    currentIdx = (currentIdx + dir + galleryItems.length) % galleryItems.length;
    lbImg.src = galleryItems[currentIdx].href;
  }
  galleryItems.forEach((a, i) => a.addEventListener('click', (e) => {
    e.preventDefault(); openLightbox(i);
  }));
  $('.lb-close').addEventListener('click', closeLightbox);
  $('.lb-prev').addEventListener('click', () => navLightbox(-1));
  $('.lb-next').addEventListener('click', () => navLightbox(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lightbox.style.display !== 'none') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    }
  });

  /* =========================================================
     TIMELINE LINE PROGRESS
     ========================================================= */
  const timeline = $('.timeline');
  const lineProgress = $('.timeline-line-progress');
  if (timeline && lineProgress) {
    function updateLine() {
      const rect = timeline.getBoundingClientRect();
      const winH = window.innerHeight;
      if (rect.top > winH) { lineProgress.style.height = '0%'; return; }
      if (rect.bottom < 0) { lineProgress.style.height = '100%'; return; }
      const total = rect.height;
      const seen = Math.max(0, winH - rect.top);
      const pct = Math.min(100, (seen / total) * 100);
      lineProgress.style.height = pct + '%';
    }
    window.addEventListener('scroll', updateLine, { passive: true });
    updateLine();
  }

  /* =========================================================
     TOAST
     ========================================================= */
  const toast = $('#toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  /* =========================================================
     VH fix (iOS)
     ========================================================= */
  function setVH() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }
  setVH();
  window.addEventListener('resize', setVH);

  /* =========================================================
     SCROLL RESTORE TOP on load
     ========================================================= */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
  window.scrollTo(0, 0);

})();
