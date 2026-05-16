/* ============================================================
   AGENTiX – script.js
   ============================================================ */

const GOOGLE_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbw1ZqZ7uAjLUrytu31QMZz2eV26bl8ZiKdySeoDMbX1aHb-euHMfjLDBLMlrQrtsdPy/exec";

/* ── Form Submission ─────────────────────────────────────────── */
const form = document.querySelector("[data-sheet-form]");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const existing = form.querySelector(".submit-status");
  existing?.remove();

  const status = document.createElement("p");
  status.className = "submit-status form-note";
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn?.textContent || "Submit Bottleneck →";

  if (!GOOGLE_SHEETS_WEB_APP_URL) {
    status.textContent = "⚠ Endpoint not configured.";
    form.append(status);
    return;
  }

  status.textContent = "Sending…";
  status.style.color = "#f37021";
  form.append(status);
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

  const fd = new FormData(form);
  const params = new URLSearchParams();
  for (const [key, value] of fd.entries()) {
    params.set(key, String(value).trim());
  }
  params.set("Timestamp", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));

  try {
    const url = GOOGLE_SHEETS_WEB_APP_URL + "?" + params.toString();
    await fetch(url, { method: "GET", mode: "no-cors" });

    form.reset();
    status.remove();
    confettiBlast();
    const overlay = document.getElementById("success-overlay");
    if (overlay) overlay.classList.add("active");

  } catch {
    status.textContent = "❌ Failed. Please email us at hello@agentix.in";
    status.style.color = "#ef4444";
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
  }
});

/* ── Particle Canvas ─────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles = [];
  const COUNT = 60;

  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }

  function Particle() {
    this.x = Math.random() * (W || 800);
    this.y = Math.random() * (H || 600);
    this.r = Math.random() * 1.5 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.alpha = Math.random() * 0.4 + 0.1;
    this.color = Math.random() > 0.6 ? "243,112,33" : "85,196,179";
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(243,112,33,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener("resize", resize);
  draw();
})();

/* ── Typewriter ──────────────────────────────────────────────── */
(function () {
  const el = document.querySelector(".hero-typewriter");
  if (!el) return;
  const phrases = ["Operating System", "Revenue Engine", "AI Execution Layer", "Competitive Edge"];
  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 2000); return; }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 40 : 75);
  }
  tick();
})();

/* Scroll reveal handled by Framer Motion module in index.html */

/* ── Counter Animation ───────────────────────────────────────── */
function animateCount(el, target, suffix, dur = 1600) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const v = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    el.textContent = v + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target, parseFloat(e.target.dataset.target), e.target.dataset.suffix || ""); cObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll("[data-target]").forEach(el => cObs.observe(el));

/* Button spring hover handled by Framer Motion in index.html */

/* ── Cursor Glow ─────────────────────────────────────────────── */
(function () {
  const g = document.getElementById("cursor-glow");
  if (!g) return;
  let mx = -300, my = -300, cx = -300, cy = -300;
  document.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
  (function loop() { cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06; g.style.transform = `translate(${cx - 200}px,${cy - 200}px)`; requestAnimationFrame(loop); })();
})();

/* ── Header scroll + sticky CTA ──────────────────────────────── */
const header = document.querySelector(".site-header");
const stickyCta = document.getElementById("sticky-cta");
window.addEventListener("scroll", () => {
  header?.classList.toggle("scrolled", window.scrollY > 20);
  stickyCta?.classList.toggle("visible", window.scrollY > 600);
}, { passive: true });

/* Card hover handled by Framer Motion spring in index.html */

/* ── Mobile nav ──────────────────────────────────────────────── */
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelector(".nav-links");
navToggle?.addEventListener("click", () => { navLinks?.classList.toggle("open"); });

/* ── Confetti Blast ──────────────────────────────────────────── */
function confettiBlast() {
  const colors = ["#f37021", "#55c4b3", "#2497c8", "#58b982", "#fff"];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    const size = 4 + Math.random() * 8;
    el.style.cssText = `
      position:fixed;left:${40 + Math.random() * 20}vw;top:${40 + Math.random() * 20}vh;
      width:${size}px;height:${size}px;border-radius:${Math.random() > 0.4 ? '50%' : '1px'};
      background:${colors[Math.floor(Math.random() * colors.length)]};
      z-index:10000;pointer-events:none;
      animation:confettiFall ${1 + Math.random() * 1.5}s ease-out forwards;
      animation-delay:${Math.random() * 0.3}s;
      transform:translate(${(Math.random() - 0.5) * 400}px, ${(Math.random() - 0.5) * 400}px) rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}
