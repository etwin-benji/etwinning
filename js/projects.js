// Project fullscreen and overlay fallback logic
// Place this file as js/projects.js (it's referenced from projects.html)

document.addEventListener('DOMContentLoaded', () => {
  const fullscreenButtons = document.querySelectorAll('.btn-fullscreen');

  fullscreenButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.currentTarget.closest('.project-card');
      if (!card) return;

      // Prefer the Fullscreen API
      try {
        if (card.requestFullscreen) {
          await card.requestFullscreen();
          return;
        } else if (card.webkitRequestFullscreen) {
          // Safari
          card.webkitRequestFullscreen();
          return;
        } else if (card.msRequestFullscreen) {
          card.msRequestFullscreen();
          return;
        }
      } catch (err) {
        // If API fails, fall back to overlay below
        console.warn('Fullscreen API failed, opening fallback overlay', err);
      }

      // Fallback overlay: clone card content into a centered modal overlay
      openOverlay(card);
    });
  });

  // Close overlay on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOverlay();
      // exit fullscreen if needed
      if (document.fullscreenElement) {
        document.exitFullscreen && document.exitFullscreen();
      }
    }
  });

  // Close overlay when clicking outside the content
  document.addEventListener('click', (e) => {
    const overlay = document.querySelector('.project-overlay');
    if (!overlay) return;
    const content = overlay.querySelector('.overlay-card');
    if (!content) return;
    if (!content.contains(e.target)) {
      closeOverlay();
    }
  });

  // Helper: create and open overlay
  function openOverlay(card) {
    closeOverlay(); // ensure single overlay

    const overlay = document.createElement('div');
    overlay.className = 'project-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    // Clone the card for display
    const clone = card.cloneNode(true);
    // Remove fullscreen buttons in the cloned view to avoid nested behavior
    const clonedActionBtn = clone.querySelector('.project-actions');
    if (clonedActionBtn) clonedActionBtn.remove();

    const overlayCard = document.createElement('div');
    overlayCard.className = 'overlay-card';

    // Header with title and close
    const header = document.createElement('div');
    header.className = 'overlay-header';
    const title = document.createElement('div');
    title.className = 'overlay-title';
    title.textContent = clone.querySelector('.project-title')?.textContent || 'Project';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'overlay-close';
    closeBtn.setAttribute('aria-label', 'Close project preview');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeOverlay);
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body: the cloned card media + description
    const body = document.createElement('div');
    body.className = 'overlay-body';
    // Give it some padding
    body.style.padding = '16px';
    // Move useful parts into overlay body
    const media = clone.querySelector('.project-media');
    const desc = clone.querySelector('.project-body');
    if (media) {
      media.style.aspectRatio = '16 / 9';
      body.appendChild(media.cloneNode(true));
    }
    if (desc) {
      body.appendChild(desc.cloneNode(true));
    }

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

  // Also listen for fullscreenchange and clean up fallback overlay if user exits fullscreen
  ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(evt => {
    document.addEventListener(evt, () => {
      if (!document.fullscreenElement) {
        // user left fullscreen — nothing to do except ensure overlay is removed
        closeOverlay();
      }
    });
  });
});
