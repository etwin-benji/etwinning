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

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* =========================
   NAVBAR SCROLL EFFECT
========================= */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    navbar.style.background = "rgba(15,16,32,0.9)";
    navbar.style.backdropFilter = "blur(18px)";
  } else {
    navbar.style.background = "rgba(15,16,32,0.75)";
    navbar.style.backdropFilter = "blur(14px)";
  }
});

/* =========================
   BUTTON RIPPLE EFFECT
========================= */

const buttons = document.querySelectorAll(".btn-primary");

buttons.forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.06)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1)";
  });
});

/* =========================
   CARD HOVER DEPTH
========================= */

const cards = document.querySelectorAll(".card, .showcase-card");

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
    card.style.transform = "translateY(0)";
  });
});

/* =========================
   METRIC COUNT-UP
========================= */

const metrics = document.querySelectorAll(".metric h3");
let metricsPlayed = false;

function animateMetrics() {
  metrics.forEach((metric) => {
    const target = parseInt(metric.innerText);
    let count = 0;
    const increment = Math.ceil(target / 60);

    const interval = setInterval(() => {
      count += increment;
      if (count >= target) {
        metric.innerText = target + (metric.innerText.includes("%") ? "%" : "+");
        clearInterval(interval);
      } else {
        metric.innerText = count;
      }
    }, 25);
  });
}

window.addEventListener("scroll", () => {
  const metricsSection = document.querySelector(".metrics-grid");
  if (!metricsSection) return;

  const sectionTop = metricsSection.getBoundingClientRect().top;
  if (sectionTop < window.innerHeight - 100 && !metricsPlayed) {
    animateMetrics();
    metricsPlayed = true;
  }
});

/* =========================
   SMOOTH INTERNAL LINKS
========================= */

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

/* =========================
   FORM SUBMIT FEEDBACK
========================= */

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const button = contactForm.querySelector("button");
    button.innerHTML = "✓ Message Sent";
    button.style.background =
      "linear-gradient(135deg, #5ce1e6, #7f8cff)";
    button.style.color = "#000";

    setTimeout(() => {
      button.innerHTML = "Send Message";
    }, 3000);

    contactForm.reset();
  });
}

/* =========================
   PAGE LOAD FADE-IN
========================= */

window.addEventListener("load", () => {
  document.body.style.opacity = "1";
  document.body.style.transition = "opacity 0.6s ease";
});

/* =========================
   CONSOLE CREDIT (CLEAN)
========================= */

console.log(
  "%cNOVA Website Loaded Successfully",
  "color:#7f8cff;font-size:14px;font-weight:700"
);
