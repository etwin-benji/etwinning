/* =========================
   SCROLL REVEAL ANIMATION
========================= */

const revealElements = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const windowHeight = window.innerHeight;
  const revealPoint = 120;

  revealElements.forEach((el) => {
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < windowHeight - revealPoint) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll, { passive: true });
window.addEventListener("load", revealOnScroll);

/* =========================
   NAVBAR SCROLL EFFECT
   (Tidy & non-destructive)
   - Do NOT apply inline dark styles that conflict with the stylesheet.
   - Toggle a class instead so CSS controls appearance; this keeps the navbar
     light as requested while allowing safe transitions.
========================= */

const navbar = document.querySelector(".navbar");

if (navbar) {
  const handleNavbarOnScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };

  // Run on scroll (passive for performance) and on load to set initial state
  window.addEventListener("scroll", handleNavbarOnScroll, { passive: true });
  window.addEventListener("load", handleNavbarOnScroll);
}

/* =========================
   MOBILE NAV TOGGLE
========================= */

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Close menu when clicking a link (mobile UX)
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}

/* =========================
   BUTTON INTERACTION (hover / focus)
   - Slightly enhanced to cover pointer and keyboard focus.
========================= */

const buttons = document.querySelectorAll(".btn-primary");

if (buttons && buttons.length) {
  buttons.forEach((btn) => {
    const elevate = () => (btn.style.transform = "scale(1.06)");
    const normalize = () => (btn.style.transform = "");

    btn.addEventListener("pointerenter", elevate);
    btn.addEventListener("pointerleave", normalize);
    btn.addEventListener("focus", elevate);
    btn.addEventListener("blur", normalize);
    // keep mouseenter/mouseleave fallback for older environments
    btn.addEventListener("mouseenter", elevate);
    btn.addEventListener("mouseleave", normalize);
  });
}

/* =========================
   CARD HOVER DEPTH (DESKTOP ONLY)
   - preserves the original 3D tilt effect but ensures transform is cleared
     on mouse leave so CSS hover/transition rules can apply normally.
========================= */

const cards = document.querySelectorAll(".card, .showcase-card");

if (cards && window.matchMedia && window.matchMedia("(hover: hover)").matches) {
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 25;
      const rotateY = (centerX - x) / 25;

      card.style.transform = `
        perspective(600px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-6px)
      `;
    });

    card.addEventListener("mouseleave", () => {
      // Clear inline transform so CSS rules take precedence again
      card.style.transform = "";
    });
  });
}

/* =========================
   METRIC COUNT-UP
   - safe guards for non-numeric targets
   - avoids re-running after first run
========================= */

const metrics = document.querySelectorAll(".metric h3");
let metricsPlayed = false;

function animateMetrics() {
  if (!metrics || metrics.length === 0) return;

  metrics.forEach((metric) => {
    const rawText = metric.innerText.trim();
    // Extract numeric portion (handles "42", "42%", "42+", etc.)
    const numericMatch = rawText.match(/-?\d+/);
    if (!numericMatch) return;

    const target = parseInt(numericMatch[0], 10);
    if (isNaN(target) || target === 0) {
      // Nothing to animate; leave as-is
      return;
    }

    let count = 0;
    const increment = Math.max(1, Math.ceil(target / 60));

    const suffix = rawText.includes("+") ? "+" : rawText.includes("%") ? "%" : "";

    const interval = setInterval(() => {
      count += increment;
      if (count >= target) {
        metric.innerText = `${target}${suffix}`;
        clearInterval(interval);
      } else {
        metric.innerText = `${count}`;
      }
    }, 25);
  });
}

window.addEventListener(
  "scroll",
  () => {
    const metricsSection = document.querySelector(".metrics-grid");
    if (!metricsSection || metricsPlayed) return;

    const sectionTop = metricsSection.getBoundingClientRect().top;
    if (sectionTop < window.innerHeight - 100) {
      animateMetrics();
      metricsPlayed = true;
    }
  },
  { passive: true }
);

/* =========================
   SMOOTH INTERNAL LINKS
   - preserves default if target not found
========================= */

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (!href || href === "#") return; // don't handle bare hashes
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: "smooth",
    });
  });
});

/* =========================
   FORM SUBMIT FEEDBACK
   - non-destructive: store original button styles and restore them after
========================= */

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const button = contactForm.querySelector("button");
    if (!button) return;

    // Save original inline styles so we can restore them later
    const originalBackground = button.style.background || "";
    const originalColor = button.style.color || "";

    // Use the requested theme-inspired feedback gradient (explicit colors)
    button.innerHTML = "✓ Message Sent";
    button.style.background = "linear-gradient(135deg, #8CA9FF, #FFF2C6)";
    button.style.color = "#07102a";

    setTimeout(() => {
      button.innerHTML = "Send Message";
      button.style.background = originalBackground;
      button.style.color = originalColor;
    }, 3000);

    contactForm.reset();
  });
}

/* =========================
   PAGE LOAD FADE-IN
   - keep transition non-invasive
========================= */

window.addEventListener("load", () => {
  // Ensure the body transitions to visible; if CSS already handles it, this is harmless
  document.body.style.transition = "opacity 0.6s ease";
  document.body.style.opacity = "1";
});

/* =========================
   CONSOLE CREDIT (CLEAN)
   - updated to match the tuned palette vibe
========================= */

console.log(
  "%cNOVA Website Loaded Successfully",
  "color:#8CA9FF;font-size:14px;font-weight:700"
);
