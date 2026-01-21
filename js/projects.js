// Enhanced fullscreen handling with mobile fallbacks.
// Place as js/projects.js (replaces the previous file)

document.addEventListener('DOMContentLoaded', () => {
  const fullscreenButtons = document.querySelectorAll('.btn-fullscreen');

  // Use pointerup so it works reliably on touch & mouse
  fullscreenButtons.forEach(btn => {
    btn.addEventListener('pointerup', async (e) => {
      // Ensure this is the primary pointer (avoid secondary-button triggers)
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const card = e.currentTarget.closest('.project-card');
      if (!card) return;

      // Prefer the most suitable media element within the card
      const video = card.querySelector('video');
      const slideFrame = card.querySelector('.slide-frame');
      const iframe = card.querySelector('iframe:not(.slide-frame)');
      const img = card.querySelector('img');

      // Try fullscreen on the best candidate in order: video -> slideFrame -> iframe -> img -> card
      try {
        if (video) {
          // iOS Safari exposes webkitEnterFullscreen() for native fullscreen on videos
          if (typeof video.webkitEnterFullscreen === 'function') {
            // some iOS versions require a play call before entering native fullscreen
            try { await video.play(); } catch (_) { /* ignore play errors */ }
            video.webkitEnterFullscreen();
            return;
          }

          if (video.requestFullscreen) {
            await video.requestFullscreen();
            return;
          } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
            return;
          } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
            return;
          }
        }

        if (slideFrame) {
          // slideFrame is usually an iframe showing a PDF/image — try fullscreen
          if (slideFrame.requestFullscreen) {
            await slideFrame.requestFullscreen();
            return;
          } else if (slideFrame.webkitRequestFullscreen) {
            slideFrame.webkitRequestFullscreen();
            return;
          } else if (slideFrame.msRequestFullscreen) {
            slideFrame.msRequestFullscreen();
            return;
          }
        }

        if (iframe) {
          // Iframes may be blocked by some browsers when cross-origin.
          if (iframe.requestFullscreen) {
            await iframe.requestFullscreen();
            return;
          } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
            return;
          } else if (iframe.msRequestFullscreen) {
            iframe.msRequestFullscreen();
            return;
          }
        }

        if (img) {
          if (img.requestFullscreen) {
            await img.requestFullscreen();
            return;
          } else if (img.webkitRequestFullscreen) {
            img.webkitRequestFullscreen();
            return;
          } else if (img.msRequestFullscreen) {
            img.msRequestFullscreen();
            return;
          }
        }
      } catch (err) {
        // If any fullscreen attempt throws, we'll fall back to overlay below
        // (Common for cross-origin iframes or restrictive mobile browsers)
        console.warn('Fullscreen attempt failed, falling back to overlay', err);
      }

      // Fallback: open overlay modal (cloned card)
      openOverlay(card);
    });
  });

  // Slide buttons (for cards with multiple assets e.g., project 16/17)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.slide-btn');
    if (!btn) return;
    const parentCard = btn.closest('.project-card');
    if (!parentCard) return;
    const frame = parentCard.querySelector('.slide-frame');
    if (!frame) return;

    const src = btn.getAttribute('data-src');
    if (!src) return;

    // If non-renderable file, open in a new tab
    if (/\.(pptx|docx)$/i.test(src)) {
      window.open(src, '_blank');
      return;
    }

    // For images, if the slide-frame is an iframe we can set src to the image
    frame.src = src;
  });

  // Close overlay on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOverlay();
      if (document.fullscreenElement) {
        document.exitFullscreen && document.exitFullscreen();
      }
    }
  });

  // Close overlay when clicking outside content
  document.addEventListener('click', (e) => {
    const overlay = document.querySelector('.project-overlay');
    if (!overlay) return;
    const content = overlay.querySelector('.overlay-card');
    if (!content) return;
    if (!content.contains(e.target)) {
      closeOverlay();
    }
  });

  // Keep overlay in sync with fullscreen state
  ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(evt => {
    document.addEventListener(evt, () => {
      if (!document.fullscreenElement) {
        closeOverlay();
      } else {
        // If user entered real fullscreen, remove any fallback overlay just in case
        closeOverlay();
      }
    });
  });

  // Overlay helpers (same UX fallback as before)
  function openOverlay(card) {
    closeOverlay(); // ensure single overlay

    const overlay = document.createElement('div');
    overlay.className = 'project-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const overlayCard = document.createElement('div');
    overlayCard.className = 'overlay-card';

    const header = document.createElement('div');
    header.className = 'overlay-header';
    const title = document.createElement('div');
    title.className = 'overlay-title';
    title.textContent = card.querySelector('.project-title')?.textContent || 'Project';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'overlay-close';
    closeBtn.setAttribute('aria-label', 'Close project preview');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeOverlay);
    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.style.padding = '16px';

    // Clone useful parts: media and project-body
    const media = card.querySelector('.project-media');
    const desc = card.querySelector('.project-body');
    if (media) body.appendChild(media.cloneNode(true));
    if (desc) body.appendChild(desc.cloneNode(true));

    overlayCard.appendChild(header);
    overlayCard.appendChild(body);
    overlay.appendChild(overlayCard);
    document.body.appendChild(overlay);

    // Prevent body scroll while overlay is open
    document.documentElement.style.overflow = 'hidden';
  }

  function closeOverlay() {
    const overlay = document.querySelector('.project-overlay');
    if (overlay) {
      overlay.remove();
      document.documentElement.style.overflow = '';
    }
  }
});
