const menuToggle = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector("#site-menu");

const revealItems = document.querySelectorAll("[data-reveal]");
if (revealItems.length > 0 && "IntersectionObserver" in window) {
  document.documentElement.classList.add("reveal-enabled");

  let revealObserver;
  const reveal = (item) => {
    item.classList.add("is-visible");
    revealObserver?.unobserve(item);
  };

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          reveal(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  let revealCheckScheduled = false;
  let revealCheckTimer;
  const revealInViewport = () => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;

    for (const item of revealItems) {
      if (item.classList.contains("is-visible")) {
        continue;
      }

      const rect = item.getBoundingClientRect();
      const visibleWidth = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
      const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
      const area = rect.width * rect.height;

      if (area > 0 && (visibleWidth * visibleHeight) / area >= 0.15) {
        reveal(item);
      }
    }
  };
  const flushRevealCheck = () => {
    if (!revealCheckScheduled) {
      return;
    }
    revealCheckScheduled = false;
    window.clearTimeout(revealCheckTimer);
    revealInViewport();
  };
  const scheduleRevealCheck = () => {
    if (revealCheckScheduled) {
      return;
    }
    revealCheckScheduled = true;
    revealCheckTimer = window.setTimeout(flushRevealCheck, 100);
    requestAnimationFrame(flushRevealCheck);
  };

  for (const item of revealItems) {
    const delay = Number(item.dataset.revealDelay);
    if (Number.isFinite(delay) && delay > 0) {
      item.style.setProperty("--reveal-delay", `${delay}ms`);
    }
    revealObserver.observe(item);
  }

  window.addEventListener("scroll", scheduleRevealCheck, { passive: true });
  window.addEventListener("resize", scheduleRevealCheck);
  window.addEventListener("pageshow", scheduleRevealCheck);
  document.addEventListener("visibilitychange", scheduleRevealCheck);
  scheduleRevealCheck();
}

function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Toggle navigation");
  siteMenu.hidden = !isOpen;
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

siteMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.reportValidity()) {
    return;
  }

  const data = new FormData(form);
  const subject = `Portfolio enquiry from ${data.get("name")}`;
  const body = [
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Company: ${data.get("company") || "Not provided"}`,
    "",
    data.get("message"),
  ].join("\n");
  const mailto = `mailto:sibandamthulisi7@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  document.querySelector("#form-note").textContent = "Opening your email app to send this message.";
  window.location.href = mailto;
});
