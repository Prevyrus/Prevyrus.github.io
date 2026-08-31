/**
 * ANIMATIONS.JS
 * -----------------------------------------------------------------------
 * Two things happen here:
 *   1. Sections/cards marked [data-reveal] fade + rise into place the
 *      first time they cross into the viewport while scrolling.
 *   2. The fixed background glows drift at a different speed than the
 *      page content, so the whole backdrop feels alive as you scroll —
 *      not just the foreground content.
 *
 * Respects prefers-reduced-motion: if the user has that on, everything
 * is shown immediately with no motion.
 * -----------------------------------------------------------------------
 */

(function initAnimations() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    document.documentElement.classList.add("reduce-motion");
    return;
  }

  if (typeof gsap === "undefined") {
    // GSAP failed to load (e.g. offline) — reveal everything so content
    // is never stuck invisible.
    document.documentElement.classList.add("no-js");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("js-ready");

  // --- 1. Section / card reveal --------------------------------------
  const revealEls = gsap.utils.toArray("[data-reveal]");
  revealEls.forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      // small stagger for elements that reveal in the same group
      delay: (i % 4) * 0.05
    });
  });

  // --- 2. Background parallax drift ------------------------------------
  const primaryGlow = document.querySelector(".bg-field__glow");
  const secondaryGlow = document.querySelector(".bg-field__glow--secondary");
  const grid = document.querySelector(".bg-field__grid");

  if (primaryGlow) {
    gsap.to(primaryGlow, {
      y: 220,
      x: -60,
      scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1.2 }
    });
  }
  if (secondaryGlow) {
    gsap.to(secondaryGlow, {
      y: -160,
      x: -40,
      scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1.2 }
    });
  }
  if (grid) {
    gsap.to(grid, {
      y: 80,
      scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1.2 }
    });
  }

  // --- 3. Hero data-stage gentle float (non-scroll-linked, plays once) -
  const stage = document.querySelector(".hero-stage");
  if (stage) {
    gsap.fromTo(
      stage,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.1, ease: "power2.out", delay: 0.3 }
    );
  }
})();
