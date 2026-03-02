/* global lucide */
(function () {
  // Icons
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth scrolling via data-scroll
  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Mobile menu toggle
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");
  let menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    if (!navToggle || !navMobile) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navMobile.hidden = !open;

    // Swap icon
    const icon = navToggle.querySelector("[data-lucide]");
    if (icon) icon.setAttribute("data-lucide", open ? "x" : "menu");
    if (window.lucide) window.lucide.createIcons();
  }

  if (navToggle && navMobile) {
    navToggle.addEventListener("click", () => setMenu(!menuOpen));
  }

  // Click handlers for nav buttons
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-scroll]");
    if (!t) return;
    const id = t.getAttribute("data-scroll");
    if (!id) return;

    e.preventDefault();
    scrollToId(id);
    setMenu(false);
  });

  // Scroll spy for active link
  const sections = ["home", "about", "skills", "experience", "education"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const desktopLinks = Array.from(document.querySelectorAll(".nav-desktop .nav-link"));
  const mobileLinks = Array.from(document.querySelectorAll(".nav-mobile-link"));

  function setActive(id) {
    desktopLinks.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-scroll") === id));
    mobileLinks.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-scroll") === id));
  }

  // Use IntersectionObserver when possible
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        // pick most visible
        const visible = entries
          .filter((x) => x.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible && visible.target && visible.target.id) setActive(visible.target.id);
      },
      { root: null, threshold: [0.2, 0.35, 0.5, 0.65], rootMargin: "-20% 0px -60% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
  } else {
    // Fallback
    window.addEventListener("scroll", () => {
      const pos = window.scrollY + 120;
      for (const s of sections) {
        if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) {
          setActive(s.id);
          break;
        }
      }
    });
  }

  // Reveal-on-scroll
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    const ro = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            ro.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => ro.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  // CV download behavior (mobile-friendly)
  const cvLinks = [document.getElementById("cvLinkDesktop"), document.getElementById("cvLinkMobile")].filter(Boolean);

  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);

  // iOS Safari often ignores the download attribute for PDFs.
  // On iOS we open the PDF in a new tab so the user can use the viewer's download/share options.
  if (isIOS) {
    cvLinks.forEach((a) => {
      a.removeAttribute("download");
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
  }

  // On Android/desktop, try to force download with a programmatic click (keeps the nice UX).
  // If it fails, the normal link will still open the PDF.
  cvLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      if (isIOS) return; // handled above
      const href = a.getAttribute("href");
      if (!href) return;
      // Only try for same-origin files
      if (/^https?:/i.test(href)) return;

      // Let default happen if download attr is missing
      if (!a.hasAttribute("download")) return;

      // Some mobile browsers need the click to be synchronous.
      // We keep it simple: create a temporary anchor and click it.
      e.preventDefault();
      const tmp = document.createElement("a");
      tmp.href = href;
      tmp.download = a.getAttribute("download") || "CV.pdf";
      document.body.appendChild(tmp);
      tmp.click();
      tmp.remove();
    });
  });

})();
