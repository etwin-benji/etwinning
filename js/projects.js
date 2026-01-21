// Updated projects.js
// - Improved mobile compatibility for PDFs/PPTX
// - PPTX opens in Office viewer (if available) or triggers download
// - PDFs open in new tab on mobile for full native viewing (multi-page)
// - Fullscreen behavior still applied to video & images where possible

document.addEventListener('DOMContentLoaded', () => {
  const fullscreenButtons = document.querySelectorAll('.btn-fullscreen');

  // Utility: detect mobile (coarse pointer OR small viewport)
  const isMobile = () => {
    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 820;
  };

  // Convert relative asset path to absolute URL (required for Office viewer)
  const absoluteUrl = (relativePath) => {
    try {
      return new URL(relativePath, location.href).href;
    } catch {
      return relativePath;
    }
  };

  // Open Office Online viewer for .pptx/.docx if possible
  const openOfficeViewer = (fileUrl) => {
    // Use the Office web viewer for pptx/docx: embed/view links
    const url = 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(fileUrl);
    window.open(url, '_blank', 'noopener');
  };

  // Primary behavior for fullscreen button
  fullscreenButtons.forEach(btn => {
    btn.addEventListener('pointerup', async (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const card = e.currentTarget.closest('.project-card');
      if (!card) return;

      // Prefer to fullscreen the best candidate
      const video = card.querySelector('.media-video');
      const img = card.querySelector('.media-img');
      const slideFrame = card.querySelector('.slide-frame');
      const pdfFrame = card.querySelector('.media-wrapper.media-pdf .media-frame, .media-frame[src$=".pdf"]');
      const genericFrame = slideFrame || pdfFrame;

      // Videos: try to use native fullscreen (including iOS webkitEnterFullscreen)
      if (video) {
        try {
          if (typeof video.webkitEnterFullscreen === 'function') {
            try { await video.play(); } catch (_) {}
            video.webkitEnterFullscreen();
            return;
          }
          if (video.requestFullscreen) { await video.requestFullscreen(); return; }
          if (video.webkitRequestFullscreen) { video.webkitRequestFullscreen(); return; }
          if (video.msRequestFullscreen) { video.msRequestFullscreen(); return; }
        } catch (err) { console.warn('video fullscreen failed', err); }
      }

      // Images: fullscreen if supported
      if (img) {
        try {
          if (img.requestFullscreen) { await img.requestFullscreen(); return; }
          if (img.webkitRequestFullscreen) { img.webkitRequestFullscreen(); return; }
        } catch (err) { console.warn('image fullscreen failed', err); }
      }

      // For PDFs / iframes on mobile: open in new tab (native viewer is best)
      if (genericFrame) {
        const src = genericFrame.getAttribute('src') || '';
        if (src) {
          // If mobile: open in new tab to use native PDF viewer
          if (isMobile()) {
            window.open(absoluteUrl(src), '_blank', 'noopener');
            return;
          }

          // Desktop: try to fullscreen the iframe
          try {
            if (genericFrame.requestFullscreen) { await genericFrame.requestFullscreen(); return; }
            if (genericFrame.webkitRequestFullscreen) { genericFrame.webkitRequestFullscreen(); return; }
            if (genericFrame.msRequestFullscreen) { genericFrame.msRequestFullscreen(); return; }
          } catch (err) {
            console.warn('iframe fullscreen failed', err);
          }
        }
      }

      // Fallback overlay (cloned card)
      openOverlay(card);
    });
  });

  // Slide buttons (for cards with multiple assets e.g., pdf/pptx/image)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.slide-btn');
    if (!btn) return;
    const parentCard = btn.closest('.project-card');
    if (!parentCard) return;
    const frame = parentCard.querySelector('.slide-frame');
    if (!frame) return;

    const src = btn.getAttribute('data-src');
    if (!src) return;

    // If PPTX (or other Office file) open with Office viewer in new tab
    if (/\.(pptx|ppt|docx|doc|xlsx)$/i.test(src)) {
      const abs = absoluteUrl(src);
      openOfficeViewer(abs);
      return;
    }

    // For PDFs: on mobile open in new tab, on desktop set iframe src
    if (/\.pdf$/i.test(src)) {
      if (isMobile()) {
        window.open(absoluteUrl(src), '_blank', 'noopener');
        return;
      } else {
        frame.src = src;
        return;
      }
    }

    // For images: set iframe src to image (most browsers can render image in iframe)
    if (/\.(png|jpe?g|gif|webp)$/i.test(src)) {
      // If the slide-frame is an iframe we set src, otherwise if it's an <img> replace it
      if (frame.tagName.toLowerCase() === 'iframe') {
        frame.src = src;
      } else {
        // fallback: replace with an <img> element
        const img = document.createElement('img');
        img.className = 'media-img';
        img.src = src;
        img.alt = parentCard.querySelector('.project-title')?.textContent || 'Project image';
        const wrapper = parentCard.querySelector('.project-media .media-wrapper') || parentCard.querySelector('.project-media');
        if (wrapper) {
          wrapper.innerHTML = '';
          wrapper.appendChild(img);
        }
      }
      return;
    }

    // Default: open in new tab
    window.open(absoluteUrl(src), '_blank', 'noopener');
  });

  // Media controls: handle Open/Download and improve mobile behavior
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('.btn-open');
    if (!openBtn) return;
    const href = openBtn.getAttribute('href');
    if (!href) return;

    // If it's a pptx on mobile try Office viewer, otherwise open in new tab
    if (/\.(pptx|ppt|docx|doc|xlsx)$/i.test(href)) {
      const abs = absoluteUrl(href);
      openOfficeViewer(abs);
      e.preventDefault();
      return;
    }

    // PDFs: open new tab (native viewer)
    if (/\.pdf$/i.test(href)) {
      window.open(absoluteUrl(href), '_blank', 'noopener');
      e.preventDefault();
      return;
    }

    // Otherwise default behavior (download link or external)
  });

  // On initial load: for small screens, hide embedded PDF iframe to avoid single-page preview issues
  const adaptPdfForMobile = () => {
    const isM = isMobile();
    document.querySelectorAll('.media-wrapper.media-pdf').forEach(wrapper => {
      const frame = wrapper.querySelector('.media-frame');
      if (!frame) return;
      if (isM) {
        // hide frame (some mobile browsers show only first page or scrollbar issues)
        frame.classList.add('media-pdf-hidden');
        // ensure "Open" button is visible and focused UX
        const openBtn = wrapper.querySelector('.btn-open');
        if (openBtn) openBtn.style.display = 'inline-flex';
      } else {
        frame.classList.remove('media-pdf-hidden');
      }
    });
  };

  // Run on load and resize/orientation change
  adaptPdfForMobile();
  window.addEventListener('resize', debounce(adaptPdfForMobile, 180));
  window.addEventListener('orientationchange', () => setTimeout(adaptPdfForMobile, 300));

  // Overlay helpers reused from previous version
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
    if (!content.contains(e.target) && !e.target.closest('.btn-fullscreen')) {
      closeOverlay();
    }
  });

  // Debounce helper
  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Keep overlay in sync with fullscreen state
  ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(evt => {
    document.addEventListener(evt, () => {
      if (!document.fullscreenElement) {
        closeOverlay();
      } else {
        closeOverlay();
      }
    });
  });
});
