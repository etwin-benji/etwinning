// Projects: fullscreen (media preferred), overlay fallback, and slide control for multi-file card
document.addEventListener('DOMContentLoaded', () => {
  const fullscreenButtons = document.querySelectorAll('.btn-fullscreen');

  fullscreenButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.currentTarget.closest('.project-card');
      if (!card) return;

      // Prefer to fullscreen the media element (video, iframe, img, or slide-frame)
      const media = card.querySelector('video, .slide-frame, iframe, img');
      if (media) {
        try {
          if (media.requestFullscreen) {
            await media.requestFullscreen();
            return;
          } else if (media.webkitRequestFullscreen) {
            media.webkitRequestFullscreen();
            return;
          } else if (media.msRequestFullscreen) {
            media.msRequestFullscreen();
            return;
          }
        } catch (err) {
          console.warn('Fullscreen API failed on media, falling back to overlay', err);
        }
      }

      // If no media or fullscreen fails, fallback to overlay of the card
      openOverlay(card);
    });
  });

  // Slide buttons (for cards with multiple assets e.g., project 16)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.slide-btn');
    if (!btn) return;
    const parentCard = btn.closest('.project-card');
    if (!parentCard) return;
    const frame = parentCard.querySelector('.slide-frame');
    if (!frame) return;

    const src = btn.getAttribute('data-src');
    if (!src) return;

    // If opening a non-renderable file (pptx/docx), open in new tab
    if (src.endsWith('.pptx') || src.endsWith('.docx')) {
      window.open(src, '_blank');
      return;
    }

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

  function openOverlay(card) {
    closeOverlay();
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

    document.documentElement.style.overflow = 'hidden';
  }

  function closeOverlay() {
    const overlay = document.querySelector('.project-overlay');
    if (overlay) {
      overlay.remove();
      document.documentElement.style.overflow = '';
    }
  }

  // Keep overlay in sync with fullscreen state
  ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(evt => {
    document.addEventListener(evt, () => {
      if (!document.fullscreenElement) {
        closeOverlay();
      }
    });
  });
});
