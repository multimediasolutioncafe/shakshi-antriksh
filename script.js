/* ============================================================
   Shakshi & Antriksh — WEDDING INVITATION INTERACTIONS
   Vanilla JavaScript only. No framework or external JS library.
   ============================================================ */
(() => {
  "use strict";

  const CONFIG = {
    // Add the WhatsApp number with country code, digits only.
    // Example format: "919876543210"
    whatsappNumber: "+91 9135321089",
    bride: "Shakshi",
    groom: "Antriksh",
    weddingDate: "11 December 2026",
    weddingDateISO: "2026-12-11T00:00:00+05:30"
  };

  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else callback();
  };

  onReady(() => {
    const root = document.querySelector(".wd");
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll progress and sticky header state
    const progress = document.createElement("div");
    progress.className = "wd-scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    let scrollPending = false;
    const updateScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const amount = total > 0 ? (window.scrollY / total) * 100 : 0;
      progress.style.width = `${Math.min(100, Math.max(0, amount))}%`;
      root.querySelector(".wd-header")?.classList.toggle("wd-scrolled", window.scrollY > 24);
      scrollPending = false;
    };
    window.addEventListener("scroll", () => {
      if (!scrollPending) {
        requestAnimationFrame(updateScroll);
        scrollPending = true;
      }
    }, { passive: true });
    updateScroll();

    // Scroll reveal with staggered timing
    const selectors = [
      ".wd-oval", ".wd-title", ".wd-person", ".wd-story-grid", ".wd-count",
      ".wd-gallery", ".wd-wish-head", ".wd-contact-grid > *",
      ".wd-follow", ".wd-partners .wd-container", ".wd-foot-grid", ".wd-foot-bottom"
    ];
    const targets = [...new Set(selectors.flatMap(selector => [...root.querySelectorAll(selector)]))];

    targets.forEach((element, index) => {
      element.classList.add("wd-motion-item");
      element.style.setProperty("--wd-motion-delay", `${(index % 4) * 85}ms`);
      if (element.matches(".wd-person-1")) element.classList.add("wd-motion-left");
      if (element.matches(".wd-person-2")) element.classList.add("wd-motion-right");
      if (element.matches(".wd-count")) element.classList.add("wd-motion-scale");
    });

    const galleryItems = [...root.querySelectorAll(".wd-gallery .wd-g")];
    galleryItems.forEach((element, index) => {
      element.classList.add("wd-motion-item");
      element.style.setProperty("--wd-motion-delay", `${(index % 4) * 75}ms`);
    });

    const reveal = (items) => {
      if (reduceMotion || !("IntersectionObserver" in window)) {
        items.forEach(item => item.classList.add("wd-motion-in"));
        return;
      }
      const observer = new IntersectionObserver((entries, io) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("wd-motion-in");
          io.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
      items.forEach(item => observer.observe(item));
    };
    reveal([...targets, ...galleryItems]);

    // Falling floral petals in hero
    const hero = root.querySelector(".wd-hero");
    if (hero && !reduceMotion && !hero.querySelector(".wd-petal-layer")) {
      const layer = document.createElement("div");
      layer.className = "wd-petal-layer";
      layer.setAttribute("aria-hidden", "true");
      const amount = window.innerWidth < 700 ? 7 : 14;
      for (let i = 0; i < amount; i++) {
        const petal = document.createElement("span");
        petal.className = "wd-petal";
        petal.style.setProperty("--petal-x", `${Math.random() * 100}%`);
        petal.style.setProperty("--petal-size", `${7 + Math.random() * 8}px`);
        petal.style.setProperty("--petal-duration", `${11 + Math.random() * 12}s`);
        petal.style.setProperty("--petal-delay", `${-Math.random() * 20}s`);
        petal.style.setProperty("--petal-drift", `${-70 + Math.random() * 140}px`);
        petal.style.setProperty("--petal-rotate", `${Math.random() * 120}deg`);
        layer.appendChild(petal);
      }
      hero.appendChild(layer);
    }

    // Soft mouse parallax for hero botanicals (desktop only)
    if (hero && !reduceMotion && matchMedia("(hover:hover) and (pointer:fine)").matches) {
      const decor = [...hero.querySelectorAll(".wd-art")];
      let pending = false;
      hero.addEventListener("pointermove", event => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          decor.forEach((item, index) => {
            const depth = (index + 1) * 3;
            item.style.translate = `${x * depth}px ${y * depth}px`;
          });
          pending = false;
        });
      });
      hero.addEventListener("pointerleave", () => decor.forEach(item => item.style.translate = ""));
    }

    // Wedding countdown — date only; update the time in CONFIG if needed.
    const clock = root.querySelector(".wd-clock");
    if (clock) {
      const target = new Date(CONFIG.weddingDateISO).getTime();
      const updateCountdown = () => {
        const seconds = Math.max(0, Math.floor((target - Date.now()) / 1000));
        const values = {
          d: Math.floor(seconds / 86400),
          h: Math.floor(seconds / 3600) % 24,
          m: Math.floor(seconds / 60) % 60,
          s: seconds % 60
        };
        Object.entries(values).forEach(([unit, value]) => {
          const output = clock.querySelector(`[data-u="${unit}"]`);
          if (output) output.textContent = String(value).padStart(2, "0");
        });
      };
      updateCountdown();
      window.setInterval(updateCountdown, 1000);
    }

    // Mobile menu closes after choosing a section
    root.querySelectorAll(".wd-nav a").forEach(link => {
      link.addEventListener("click", () => {
        const menu = root.querySelector("#wd-menu");
        if (menu) menu.checked = false;
      });
    });

    // Smooth scrolling for in-page links
    root.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener("click", event => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        const target = root.querySelector(href);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        const menu = root.querySelector("#wd-menu");
        if (menu) menu.checked = false;
      });
    });

    // Gallery lightbox
    const lightbox = root.querySelector("#wd-lightbox");
    if (lightbox) {
      const image = lightbox.querySelector("img");
      root.querySelectorAll("[data-lightbox]").forEach(link => {
        link.addEventListener("click", event => {
          event.preventDefault();
          if (!image) return;
          const thumb = link.querySelector("img");
          const fullUrl = link.href;
          image.src = thumb ? (thumb.currentSrc || thumb.src) : fullUrl;
          image.alt = thumb?.alt || "Wedding memory";
          image.dataset.requestedSrc = fullUrl;
          const full = new Image();
          full.onload = () => {
            if (image.dataset.requestedSrc === fullUrl) image.src = fullUrl;
          };
          full.src = fullUrl;
          if (typeof lightbox.showModal === "function") lightbox.showModal();
        });
      });
      lightbox.addEventListener("click", event => {
        if (event.target === lightbox) lightbox.close();
      });
    }

    // Blessings / wishes slider
    const wishes = [...root.querySelectorAll(".wd-wish")];
    if (wishes.length) {
      let current = Math.max(0, wishes.findIndex(item => item.classList.contains("is-on")));
      let timer;
      const show = index => {
        wishes[current]?.classList.remove("is-on");
        current = (index + wishes.length) % wishes.length;
        wishes[current]?.classList.add("is-on");
      };
      const play = () => {
        clearInterval(timer);
        if (wishes.length > 1 && !reduceMotion) timer = setInterval(() => show(current + 1), 7000);
      };
      root.querySelectorAll("[data-wish]").forEach(button => {
        button.addEventListener("click", () => {
          show(current + Number(button.dataset.wish));
          play();
        });
      });
      root.querySelectorAll("[data-wish-to]").forEach(button => {
        button.addEventListener("click", () => {
          show(Number(button.dataset.wishTo));
          play();
        });
      });
      play();
    }

    // RSVP: configure phone number once in CONFIG above.
    const message = `Hello! Thank you for inviting me to ${CONFIG.bride} and ${CONFIG.groom}'s wedding on ${CONFIG.weddingDate}. I would like to confirm my attendance.`;
    root.querySelectorAll("[data-rsvp]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        const phone = CONFIG.whatsappNumber.replace(/\D/g, "");
        if (!phone) {
          alert("Please add your WhatsApp number in script.js (CONFIG.whatsappNumber) to activate RSVP.");
          return;
        }
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });

    // Avoid dead placeholder venue links: open a Google Maps search only after address is configured.
    root.querySelectorAll(".wd-map").forEach(link => {
      link.addEventListener("click", event => {
        const label = link.closest(".wd-card")?.innerText || "";
        const venue = label.match(/(?:Venue|Wedding venue)[^\\n]*/i)?.[0] || "";
        if (!venue || /to be announced|add the venue/i.test(venue)) {
          event.preventDefault();
          alert("Wedding venue details will be updated soon.");
        }
      });
    });
  });
})();


// WELCOME GATE ANIMATION
document.addEventListener("DOMContentLoaded", function () {
  const welcomeGate = document.getElementById("welcomeGate");
  const openGateBtn = document.getElementById("openGateBtn");

  if (!welcomeGate || !openGateBtn) return;

  openGateBtn.addEventListener("click", function () {
    welcomeGate.classList.add("opening");

    setTimeout(function () {
      welcomeGate.classList.add("hidden");
      document.body.style.overflow = "";
    }, 1900);
  });

  document.body.style.overflow = "hidden";
});