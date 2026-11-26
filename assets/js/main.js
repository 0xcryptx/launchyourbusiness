document.documentElement.classList.add("js");

/* ---------- Site settings ----------
   Fill these in before launch. The contact form sends through Web3Forms
   (free): create an access key at https://web3forms.com with the owner's
   email address and paste it below. */
const SITE = {
  web3formsKey: "YOUR_WEB3FORMS_ACCESS_KEY",
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Active nav link ---------- */
  const page = document.body.dataset.page;
  document.querySelectorAll("[data-page-link]").forEach((link) => {
    const isActive = link.dataset.pageLink === page;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector(".menu-toggle");
  const setMenu = (open) => {
    if (!menuToggle) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  };
  menuToggle?.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  document.querySelectorAll("#site-nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (e.target.closest("#site-nav") || e.target.closest(".menu-toggle")) return;
    setMenu(false);
  });
  let menuScrollStart = 0;
  menuToggle?.addEventListener("click", () => {
    menuScrollStart = window.scrollY;
  });
  window.addEventListener(
    "scroll",
    () => {
      if (document.body.classList.contains("nav-open") && Math.abs(window.scrollY - menuScrollStart) > 60) setMenu(false);
    },
    { passive: true }
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      setMenu(false);
      menuToggle?.focus();
    }
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Word splitting (headings rise in, text lights up) ---------- */
  const splitWords = (el, className) => {
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const outer = document.createElement("span");
            outer.className = className;
            if (className === "w") {
              const inner = document.createElement("span");
              inner.className = "wi";
              inner.textContent = part;
              outer.appendChild(inner);
              words.push(inner);
            } else {
              outer.textContent = part;
              words.push(outer);
            }
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
    return words;
  };

  document.querySelectorAll("[data-split]").forEach((el) => {
    if (!reduceMotion) {
      splitWords(el, "w").forEach((w, i) => w.style.setProperty("--d", i));
    }
    el.classList.add("is-split");
  });

  /* ---------- Hero line: its flat part sits just under the headline ---------- */
  const hero = document.querySelector(".hero");
  const heroLine = hero?.querySelector(".hero-line");
  const heroTitle = hero?.querySelector("h1");
  const placeHeroLine = () => {
    if (!heroLine || !heroTitle || getComputedStyle(heroLine).display === "none") return;
    const heroBox = hero.getBoundingClientRect();
    const titleBox = heroTitle.getBoundingClientRect();
    const paths = heroLine.querySelectorAll("path");
    if (paths.length < 2) return;

    // underline starts at the title's left edge, sits just under its last line,
    // then rises at 45 degrees into the arrow near the right edge of the screen
    // phones: no room for the big sweep, so end in a short kick-up like the logo
    const narrow = heroBox.width < 700;
    const left = titleBox.left - heroBox.left;
    const right = narrow ? titleBox.right - heroBox.left : heroBox.width - Math.max(24, heroBox.width * 0.04);
    const flatY = titleBox.bottom - heroBox.top + (narrow ? 8 : 12);
    const rise = narrow ? 22 : Math.max(60, Math.min(230, flatY - 100, (right - left) * 0.3));
    const head = narrow ? 8 : Math.round(rise * 0.32);
    const pad = 6;
    const w = right - left;
    const h = rise + pad * 2;
    const tipX = w - pad;
    const tipY = pad;
    const baseY = pad + rise;

    heroLine.setAttribute("viewBox", `0 0 ${Math.round(w)} ${Math.round(h)}`);
    heroLine.setAttribute("preserveAspectRatio", "none");
    Object.assign(heroLine.style, {
      left: `${Math.round(left)}px`,
      right: "auto",
      top: `${Math.round(flatY - baseY)}px`,
      width: `${Math.round(w)}px`,
      height: `${Math.round(h)}px`,
    });
    paths[0].setAttribute("d", `M0 ${baseY} H${tipX - rise} L${tipX} ${tipY}`);
    paths[1].setAttribute("d", `M${tipX - head} ${tipY} H${tipX} V${tipY + head}`);
    paths.forEach((p) => p.setAttribute("stroke-width", narrow ? "1.5" : "2"));
  };
  placeHeroLine();
  document.fonts?.ready.then(placeHeroLine);
  window.addEventListener("resize", placeHeroLine, { passive: true });

  /* ---------- Hero entrance (after the intro, if it's showing) ---------- */
  const startHero = () => {
    hero?.classList.add("is-in");
    hero?.querySelectorAll("[data-split]").forEach((el) => el.classList.add("is-in"));
  };
  if (reduceMotion) {
    startHero();
    document.querySelectorAll(".hero-dot").forEach((d) => d.remove());
  } else {
    window.setTimeout(startHero, root.classList.contains("show-intro") ? 1350 : 80);
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = [...document.querySelectorAll(".reveal, [data-split]")].filter((el) => !el.closest(".hero"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible", "is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible", "is-in"));
  }

  /* ---------- Line icons draw themselves ---------- */
  if (!reduceMotion) {
    document.querySelectorAll(".area-icon").forEach((svg) => {
      svg.querySelectorAll("path, rect, circle").forEach((shape) => shape.setAttribute("pathLength", "1"));
      svg.classList.add("draw");
    });
  }

  /* ---------- Process steps light up as you pass them ---------- */
  const steps = document.querySelectorAll(".process li");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const stepIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-active");
          stepIO.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -30% 0px" }
    );
    steps.forEach((s) => stepIO.observe(s));
  } else {
    steps.forEach((s) => s.classList.add("is-active"));
  }

  /* ---------- Text that lights up word by word while scrolling ---------- */
  const scrubs = reduceMotion
    ? []
    : [...document.querySelectorAll("[data-scrub]")].map((el) => {
        const words = splitWords(el, "sw");
        el.classList.add("is-scrub");
        return { el, words, lit: -1 };
      });

  /* ---------- One scroll loop: header state, progress line, scrubbed text ---------- */
  const header = document.querySelector(".site-header");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    header?.classList.toggle("is-scrolled", y > 10);

    const max = document.documentElement.scrollHeight - vh;
    header?.style.setProperty("--p", max > 0 ? clamp(y / max, 0, 1).toFixed(4) : "0");

    scrubs.forEach((s) => {
      const r = s.el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      const progress = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.38), 0, 1);
      const lit = Math.round(progress * s.words.length * 1.1);
      if (lit === s.lit) return;
      s.lit = lit;
      s.words.forEach((w, i) => w.classList.toggle("lit", i < lit));
    });
  };
  const requestScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  };
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  onScroll();

  /* ---------- Pointer effects (mouse only) ---------- */
  if (finePointer && !reduceMotion) {
    // soft spotlight that follows the cursor across the hero
    if (hero) {
      let frame = 0;
      hero.addEventListener("pointermove", (e) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = hero.getBoundingClientRect();
          hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
          hero.style.setProperty("--my", `${e.clientY - r.top}px`);
        });
      });
    }

    // spotlight inside cards
    document.querySelectorAll(".area, .person").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--x", `${e.clientX - r.left}px`);
        card.style.setProperty("--y", `${e.clientY - r.top}px`);
      });
    });

    // buttons that lean towards the cursor
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("formStatus");
  const toast = document.getElementById("formToast");
  const submitButton = form.querySelector('button[type="submit"]');

  const setError = (field, hasError) => field.closest(".field")?.classList.toggle("has-error", hasError);

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => setError(field, false));
    field.addEventListener("change", () => setError(field, false));
  });

  const showToast = () => {
    if (!toast) return;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 5000);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    status.className = "status";

    const invalid = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
    form.querySelectorAll(".field").forEach((f) => f.classList.remove("has-error"));
    if (invalid.length) {
      invalid.forEach((el) => setError(el, true));
      invalid[0].focus();
      status.textContent = "Please fill in the highlighted fields.";
      status.className = "status error";
      return;
    }

    if (!SITE.web3formsKey || SITE.web3formsKey.startsWith("YOUR_")) {
      status.textContent = "The form isn't connected yet. Please get in touch by email for now.";
      status.className = "status error";
      return;
    }

    const data = new FormData(form);
    data.append("access_key", SITE.web3formsKey);
    data.append("subject", `New enquiry from ${data.get("Full Name") || "the website"}`);
    data.append("from_name", "Launch Your Business website");

    submitButton?.setAttribute("disabled", "disabled");

    fetch(form.getAttribute("action"), {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    })
      .then((response) => response.json())
      .then((result) => {
        if (!result.success) throw new Error(result.message || "Something went wrong.");
        form.reset();
        showToast();
      })
      .catch(() => {
        status.textContent = "Sorry, that didn't go through. Please try again or send an email instead.";
        status.className = "status error";
      })
      .finally(() => submitButton?.removeAttribute("disabled"));
  });
});
