/*
  script.js — site-wide behaviour

  This file runs on every page. HTML builds the layout; this file adds
  interaction: menus, overlays, scrolling, carousels, and forms.

  How to read it:
  1. querySelector finds an element already in the HTML.
  2. addEventListener waits for a user action (click, scroll, key).
  3. classList.add/remove/toggle turns CSS on or off (open menus, etc.).
  4. GSAP (loaded from a CDN in the HTML) handles animation.

  If a page does not have a section (for example, no testimonials),
  that setup function finds nothing and quietly returns.

  Rough order in this file:
  - Header / menu / typography
  - Smooth scroll and page animations
  - Team / works trackers and testimonials
  - Service accordion
  - Full-screen menu overlay
  - Enquiry form overlay
  - Works category (Architectural / Residential / Commercial)
*/

/* The hamburger button and the nav list it controls on tablet/mobile. */
const menuButton = document.querySelector(".Menu-Button");
const siteNav = document.querySelector(".Menu-list");

/*
  CSS typography tokens change with a data attribute on <html>.
  Desktop: wider than 1024px. Tablet: 601–1024px. Mobile: 600px and below.
*/
function setTypographyMode() {
  const width = window.innerWidth;

  /* Tablet type scale from 601px to 1024px */
  if (width <= 1024) {
    document.documentElement.setAttribute("data-typography-mode", "tablet");
  } else {
    /* Desktop type scale above 1024px */
    document.documentElement.setAttribute("data-typography-mode", "desktop");
  }

  /* Mobile type scale at 600px and below (overrides tablet) */
  if (width <= 600) {
    document.documentElement.setAttribute("data-typography-mode", "mobile");
  }
}

/*
  These two functions are empty at first. setupMenuOverlay() later
  replaces them with the real open/close animation.
*/
let closeMenuOverlay = () => {};
let toggleMenuOverlay = () => {};

/* Close both the small dropdown nav and the full-screen menu overlay. */
function closeMenu(instant) {
  siteNav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  closeMenuOverlay(instant);
}

/* Toggle the overlay menu when the hamburger/close button is clicked */
menuButton.addEventListener("click", () => {
  toggleMenuOverlay();
});

/* Close the overlay after a nav link is chosen */
siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeMenu();
  }
});

/* Keep type scale, header contrast, and compact nav in sync when the window size changes */
window.addEventListener("resize", () => {
  setTypographyMode();
  updateNavOnImage();

  /* Full desktop nav does not use the overlay menu */
  if (window.innerWidth > 1024 && !nav.classList.contains("Nav--past-hero")) {
    closeMenu();
  }

  /* Recalculate parallax travel for the new frame size */
  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

/* Valid Works filters, used in the URL (?type=residential) and page titles. */
const WORK_CATEGORIES = {
  architectural: "Architectural",
  residential: "Residential",
  commercial: "Commercial",
};

/* Freeze GSAP smooth-scroll while a full-screen overlay is open. */
function pauseSmoothScroll(paused) {
  const smoother = window.ScrollSmoother && ScrollSmoother.get();

  if (smoother) {
    smoother.paused(paused);
  }
}

/*
  Escape key: close the enquiry form first if it is open,
  otherwise close the menu. Focus returns to the hamburger only
  if the menu was actually open.
*/
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const overlay = document.querySelector(".Overlay");

  if (overlay && overlay.classList.contains("is-open") && overlay.closeEnquiry) {
    overlay.closeEnquiry();
    return;
  }

  const menuWasOpen =
    siteNav.classList.contains("is-open") ||
    Boolean(document.querySelector(".Menu-overlay.is-open"));

  closeMenu();

  if (menuWasOpen) {
    menuButton.focus();
  }
});





/* The fixed header bar at the top of every page. */
const nav = document.querySelector(".Nav");

/* Photos the header may sit on top of (hero + featured works). */
const imageOverlays = [
  document.querySelector(".Image-1-1"),
  ...document.querySelectorAll(".Work-img"),
].filter(Boolean);

function getPageScrollY() {
  const smoother = window.ScrollSmoother && ScrollSmoother.get();

  if (smoother && typeof smoother.scrollTop === "function") {
    return smoother.scrollTop();
  }

  return window.scrollY || document.documentElement.scrollTop || 0;
}

/*
  Header colour and compact mode:
  - Nav--on-image  → white text when the bar overlaps a photo
  - Nav--past-hero → hide logo + inline menu as soon as the page scrolls
  The Works page keeps the full desktop nav while scrolling.
*/
const keepFullNavOnDesktop = Boolean(document.querySelector(".Works-container"));
let syncWorksTitleDock = () => {};

function updateNavOnImage() {
  const navBox = nav.getBoundingClientRect();

  const isOverImage = imageOverlays.some((image) => {
    const imageBox = image.getBoundingClientRect();
    return imageBox.bottom > navBox.top && imageBox.top < navBox.bottom;
  });

  const isDesktop = window.innerWidth > 1024;
  const scrollY = getPageScrollY();
  const keepFull = keepFullNavOnDesktop && isDesktop;
  const isScrolled = scrollY > 12;
  const collapseOnScroll = isScrolled && !keepFull;

  nav.classList.toggle("Nav--on-image", isOverImage);
  nav.classList.toggle("Nav--past-hero", collapseOnScroll);

  /* Dock and undock at different scroll points so collapsing the title
     cannot immediately reverse itself and loop the animation. */
  if (keepFull) {
    syncWorksTitleDock(false);
  } else if (scrollY > 36) {
    syncWorksTitleDock(true);
  } else if (scrollY < 8) {
    syncWorksTitleDock(false);
  }

  /* Restore the full desktop menu when the page is back at the top */
  if (!collapseOnScroll && isDesktop) {
    closeMenu();
  }
}

/* Recheck header contrast while the native page still scrolls (reduced motion) */
window.addEventListener("scroll", updateNavOnImage, { passive: true });

/*
  Desktop only: when you hover Works, a white sheet expands behind the
  dropdown. This measures the dropdown height and stores it as a CSS variable.
*/
function setupWorksNavOverlay() {
  const worksMenu = [...nav.querySelectorAll(".Menu-list > .Menu")].find((item) =>
    item.querySelector(":scope > .Options")
  );
  const options = worksMenu?.querySelector(":scope > .Options");

  if (!worksMenu || !options) {
    return;
  }

  /* Open the white sheet only on desktop, while Works is hovered or focused. */
  function syncWorksOverlay() {
    const open =
      window.innerWidth > 1024 &&
      !nav.classList.contains("Nav--past-hero") &&
      (worksMenu.matches(":hover") || worksMenu.contains(document.activeElement));

    if (open) {
      const navBox = nav.getBoundingClientRect();
      const optionsBox = options.getBoundingClientRect();
      const height = Math.ceil(Math.max(navBox.height, optionsBox.bottom - navBox.top));
      nav.style.setProperty("--nav-overlay-height", `${height}px`);
    }

    nav.classList.toggle("Nav--works-open", open);
  }

  worksMenu.addEventListener("mouseenter", syncWorksOverlay);
  worksMenu.addEventListener("mouseleave", syncWorksOverlay);
  worksMenu.addEventListener("focusin", syncWorksOverlay);
  worksMenu.addEventListener("focusout", () => {
    requestAnimationFrame(syncWorksOverlay);
  });
  window.addEventListener("resize", syncWorksOverlay);
}

/* Set the correct type scale and header colors on first load */
setTypographyMode();
updateNavOnImage();
setupWorksNavOverlay();

/*
  Accessibility setting: if the user asked the OS for reduced motion,
  we skip smooth scroll, parallax, and most animations.
*/
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*
  GSAP ScrollSmoother wraps the page so scrolling feels eased.
  The header sits outside #smooth-wrapper so it can stay fixed.
  In-page links like #works use smoother.scrollTo instead of a jump.
*/
function setupScrollSmoother() {
  if (prefersReducedMotion || !window.ScrollSmoother) {
    return null;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  document.documentElement.classList.add("has-smooth-scroll");

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.4,
    effects: false,
    smoothTouch: 0.1,
    normalizeScroll: true,
    ignoreMobileResize: true,
    onUpdate: updateNavOnImage,
  });

  if (window.ScrollTrigger) {
    ScrollTrigger.addEventListener("scroll", updateNavOnImage);
  }

  /* In-page anchors travel through the smoother instead of jumping */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");

      if (!id || id === "#") {
        return;
      }

      const target = document.querySelector(id);

      if (!target || link.classList.contains("Enquiry") || id === "#enquiry") {
        return;
      }

      event.preventDefault();
      smoother.scrollTo(target, true, "top top");
    });
  });

  return smoother;
}

setupScrollSmoother();

/* Project pages should always start at the top (not mid-scroll from a previous page). */
function pinProjectPageToTop() {
  if (!document.querySelector(".Project-page")) {
    return;
  }

  window.scrollTo(0, 0);

  const smoother = window.ScrollSmoother && ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(0, false);
  }
}

pinProjectPageToTop();
document.addEventListener("DOMContentLoaded", pinProjectPageToTop);

/*
  Home hero video: autoplay muted, then rewind just before the end
  so the loop does not flash a black frame. Reduced-motion users get
  a paused first frame instead.
*/
function setupHeroVideo() {
  const video = document.querySelector(".Hero-visual video.Image-1-1");

  if (!video) {
    return;
  }

  if (prefersReducedMotion) {
    video.pause();
    video.removeAttribute("autoplay");
    video.removeAttribute("loop");
    return;
  }

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  const playVideo = () => {
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const loopBeforeEnd = () => {
    if (!video.duration || !Number.isFinite(video.duration)) {
      return;
    }

    if (video.currentTime >= video.duration - 0.08) {
      video.currentTime = 0.001;
    }
  };

  if (typeof video.requestVideoFrameCallback === "function") {
    const onFrame = () => {
      loopBeforeEnd();
      video.requestVideoFrameCallback(onFrame);
    };

    video.requestVideoFrameCallback(onFrame);
  } else {
    video.addEventListener("timeupdate", loopBeforeEnd);
  }

  video.addEventListener("ended", () => {
    video.currentTime = 0.001;
    playVideo();
  });

  video.addEventListener("canplay", playVideo);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      playVideo();
    }
  });

  playVideo();
}

setupHeroVideo();

/*
  Home hero: pin the photo while the text scrolls over it,
  and slowly shift the image so it feels like parallax.
*/
function setupHeroFold() {
  const hero = document.querySelector(".Hero-Banner");
  const visual = hero && hero.querySelector(".Hero-visual");
  const image = visual && visual.querySelector(".Image-1-1");
  const nextFold = document.querySelector(".Value-proportion");

  if (!hero || !visual || !image || !nextFold || prefersReducedMotion) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const heroScroll = {
    trigger: hero,
    start: "top top",
    endTrigger: nextFold,
    end: "top top",
    invalidateOnRefresh: true,
  };

  ScrollTrigger.create({
    ...heroScroll,
    pin: visual,
    pinSpacing: false,
    anticipatePin: 1,
  });

  /* Video stays centered; only the extra height travels on scroll */
  gsap.set(image, { x: 0, xPercent: 0 });
  gsap.fromTo(
    image,
    {
      y: 0,
    },
    {
      y: () => {
        const extra = image.offsetHeight - visual.offsetHeight;
        return extra > 0 ? -(extra / 2) : 0;
      },
      ease: "none",
      scrollTrigger: {
        ...heroScroll,
        scrub: 1.2,
      },
    }
  );
}

setupHeroFold();

/*
  Fade/slide headings, paragraphs, and buttons in when they enter the screen.
  Accordions and testimonials are skipped so their own animation stays in control.
*/
function setupContentReveal() {
  if (prefersReducedMotion) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Read a spacing token from CSS (e.g. --spacing-24 → 24). */
  const token = (name) =>
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(name)
    ) || 0;

  const groups = [
    {
      selector: "main .type-display-large, main .type-heading",
      y: token("--spacing-32"),
      duration: 1.05,
    },
    {
      selector: "main .type-title-large, main .type-title-medium, .Footer .type-title-small-prominent, main .Details",
      y: token("--spacing-24"),
      duration: 0.95,
    },
    {
      selector: "main .type-paragraph, main .type-body",
      y: token("--spacing-24"),
      duration: 0.95,
    },
    {
      selector: "main .Button, .Footer .Button",
      y: token("--spacing-16"),
      duration: 0.9,
    },
    {
      selector: ".Footer .Link",
      y: token("--spacing-16"),
      duration: 0.9,
      start: "top 88%",
    },
    {
      selector: ".Footer-bottom",
      y: token("--spacing-16"),
      duration: 0.9,
      start: "top bottom",
    },
  ];

  groups.forEach(({ selector, y, duration, start }) => {
    const items = gsap.utils.toArray(selector).filter(
      (item) =>
        !item.closest(".Accordion") &&
        !item.closest(".Client-Testimonials")
    );

    if (!items.length) {
      return;
    }

    gsap.set(items, { y, autoAlpha: 0, force3D: true });

    ScrollTrigger.batch(items, {
      start: start || "top 88%",
      once: true,
      interval: 0.12,
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          autoAlpha: 1,
          duration,
          ease: "power3.out",
          stagger: 0.06,
          overwrite: true,
          onComplete: () => {
            gsap.set(batch, { clearProps: "transform" });
          },
        });
      },
    });
  });
}

setupContentReveal();

/* Featured-work photos: keep the crop, then drift them slightly as you scroll. */
function setupWorkImageParallax() {
  if (prefersReducedMotion || !window.ScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const frames = [...document.querySelectorAll(".Work-img")];
  const images = frames
    .map((frame) => frame.querySelector("img"))
    .filter(Boolean);

  Promise.all(
    images.map((image) => image.decode().catch(() => undefined))
  ).then(() => {
    const smoother = window.ScrollSmoother && ScrollSmoother.get();

    frames.forEach((frame) => {
      const image = frame.querySelector("img");

      if (!image) {
        return;
      }

      gsap.fromTo(
        image,
        {
          y: 0,
        },
        {
          y: () => {
            const overflow = image.offsetHeight - frame.offsetHeight;
            return overflow > 0 ? -(overflow / 4) : 0;
          },
          ease: "none",
          force3D: true,
          autoRound: false,
          scrollTrigger: {
            trigger: frame,
            start: "top center",
            end: "bottom top",
            scrub: smoother ? true : 0.8,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    ScrollTrigger.refresh();
  });
}

setupWorkImageParallax();

/* Pin a section and scrub its track along x or y until the overflow is gone */
/*
  Shared helper for Team and Works galleries.
  Pins the section, then moves the inner "track" sideways (x) or up (y)
  as you scroll, so extra cards come into view.
*/
function setupPinnedTrack(section, track, axis) {
  if (!section || !track) {
    return;
  }

  const container = track.parentElement;

  if (!container) {
    return;
  }

  /* How far the track must move to show the last card. */
  function travel() {
    const styles = getComputedStyle(container);
    const padStart = Number.parseFloat(
      axis === "y" ? styles.paddingTop : styles.paddingLeft
    ) || 0;
    const padEnd = Number.parseFloat(
      axis === "y" ? styles.paddingBottom : styles.paddingRight
    ) || 0;
    const visible =
      (axis === "y" ? container.clientHeight : container.clientWidth) -
      padStart -
      padEnd;

    if (axis === "y") {
      return Math.max(0, track.scrollHeight - visible);
    }

    return Math.max(0, track.scrollWidth - visible);
  }

  if (prefersReducedMotion) {
    container.style.overflow = "auto";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.set(track, { x: 0, y: 0 });

  const tween = gsap.to(track, {
    x: () => (axis === "x" ? -travel() : 0),
    y: () => (axis === "y" ? -travel() : 0),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => "+=" + Math.max(travel(), window.innerHeight * 0.5),
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  return () => {
    if (tween.scrollTrigger) {
      tween.scrollTrigger.kill();
    }

    tween.kill();
    gsap.set(track, { clearProps: "transform" });
  };
}

/*
  Same tracker, different direction by screen size:
  below mobileMaxWidth → vertical, above it → horizontal.
*/
function setupAxisPinnedTrack(section, track, mobileMaxWidth) {
  if (!section || !track) {
    return;
  }

  if (prefersReducedMotion) {
    setupPinnedTrack(section, track, window.innerWidth <= mobileMaxWidth ? "y" : "x");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.matchMedia({
    [`(max-width: ${mobileMaxWidth}px)`]: function () {
      return setupPinnedTrack(section, track, "y");
    },
    [`(min-width: ${mobileMaxWidth + 1}px)`]: function () {
      return setupPinnedTrack(section, track, "x");
    },
  });
}

/* About page: team cards scroll horizontally on desktop, vertically on tablet/mobile. */
function setupTeamTracker() {
  setupAxisPinnedTrack(
    document.querySelector(".Our-Team"),
    document.querySelector(".Team-Tracker"),
    1024
  );
}

setupTeamTracker();

/*
  Home page testimonial carousel.
  One quote is visible at a time. Users can use arrows, keyboard,
  or drag. Hidden slides are not focusable for keyboard users.
*/
function setupTestimonials() {
  const section = document.querySelector(".Client-Testimonials");

  if (!section || !window.gsap) {
    return;
  }

  const tracker = section.querySelector(".Testimonial_tracker");
  const track = section.querySelector(".Testimonial_track");
  const slides = [...section.querySelectorAll(".Testimonial")];
  const contents = slides.map((slide) =>
    slide.querySelector(".Testimonial-content")
  );
  const prev = section.querySelector("[data-testimonial-prev]");
  const next = section.querySelector("[data-testimonial-next]");
  const currentLabel = section.querySelector("[data-testimonial-current]");
  const totalLabel = section.querySelector("[data-testimonial-total]");

  if (
    !tracker ||
    !track ||
    !slides.length ||
    !prev ||
    !next ||
    !currentLabel ||
    !totalLabel
  ) {
    return;
  }

  const clampIndex = gsap.utils.clamp(0, slides.length - 1);
  const formatIndex = (value) => String(value).padStart(2, "0");
  const slideDuration = 30;
  const progressBars = slides.map((slide) =>
    slide.querySelector("[data-testimonial-progress]")
  );
  let index = 0;
  let minX = 0;
  let transition;
  let progressTween;
  let isAnimating = false;
  let dragging = false;
  let dragStartX = 0;
  let pressX = 0;
  let pressY = 0;
  let pointerId = null;
  let dragAxis = null;
  let didDrag = false;
  let lastMoveX = 0;
  let lastMoveT = 0;
  let velocityX = 0;
  let lastWidth = 0;

  section.setAttribute("aria-roledescription", "carousel");
  tracker.setAttribute("aria-live", "off");
  tracker.setAttribute("tabindex", "0");
  totalLabel.textContent = formatIndex(slides.length);

  slides.forEach((slide, slideIndex) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute(
      "aria-label",
      `${slideIndex + 1} of ${slides.length}`
    );
  });

  gsap.set(track, { x: 0, force3D: true });
  gsap.set(slides, { clearProps: "opacity,visibility" });

  /* Size every slide to the viewport and store how far left the last slide sits. */
  function layout() {
    const width = tracker.clientWidth;

    slides.forEach((slide) => {
      gsap.set(slide, { width, flexBasis: width });
    });

    minX = -slides[slides.length - 1].offsetLeft;
    gsap.set(track, {
      x: gsap.utils.clamp(minX, 0, -slides[index].offsetLeft),
      force3D: true,
    });
  }

  function isAutoplayViewport() {
    return window.innerWidth <= 1024;
  }

  function wrapIndex(value) {
    return ((value % slides.length) + slides.length) % slides.length;
  }

  function stopAutoplay() {
    if (progressTween) {
      progressTween.kill();
      progressTween = null;
    }
  }

  function syncProgress(progress) {
    progressBars.forEach((bar) => {
      if (!bar) {
        return;
      }

      [...bar.querySelectorAll(".Testimonial-progress-segment")].forEach(
        (segment, segmentIndex) => {
          const fill = segment.querySelector(".Testimonial-progress-fill");

          segment.classList.toggle("is-complete", segmentIndex < index);
          segment.classList.toggle("is-active", segmentIndex === index);

          if (!fill) {
            return;
          }

          if (segmentIndex < index) {
            gsap.set(fill, { scaleX: 1 });
          } else if (segmentIndex === index) {
            gsap.set(fill, { scaleX: progress });
          } else {
            gsap.set(fill, { scaleX: 0 });
          }
        }
      );
    });
  }

  function startAutoplay() {
    stopAutoplay();

    if (
      !isAutoplayViewport() ||
      prefersReducedMotion ||
      document.hidden ||
      dragging
    ) {
      syncProgress(0);
      return;
    }

    syncProgress(0);

    const fills = progressBars
      .map((bar) =>
        bar?.querySelector(".Testimonial-progress-segment.is-active .Testimonial-progress-fill")
      )
      .filter(Boolean);

    if (!fills.length) {
      return;
    }

    progressTween = gsap.to(fills, {
      scaleX: 1,
      duration: slideDuration,
      ease: "none",
      overwrite: true,
      onComplete: () => {
        progressTween = null;
        goTo(index + 1, { wrap: true });
      },
    });
  }

  /* Disable prev/next at the ends, update 01/04, hide other slides from keyboard. */
  function updateControls() {
    const atStart = index === 0;
    const atEnd = index === slides.length - 1;

    prev.disabled = atStart && !isAutoplayViewport();
    next.disabled = atEnd && !isAutoplayViewport();
    currentLabel.textContent = formatIndex(index + 1);

    slides.forEach((slide, slideIndex) => {
      const isCurrent = slideIndex === index;

      slide.setAttribute("aria-hidden", String(!isCurrent));
      slide.querySelectorAll("a, button").forEach((control) => {
        if (isCurrent) {
          control.removeAttribute("tabindex");
        } else {
          control.setAttribute("tabindex", "-1");
        }
      });
    });
  }

  /* Current GSAP x position of the sliding row. */
  function trackX() {
    return Number(gsap.getProperty(track, "x")) || 0;
  }

  /* Animate to a slide index. Instant skip is used on first layout / resize. */
  function goTo(nextIndex, { instant = false, wrap = false } = {}) {
    const targetIndex = wrap ? wrapIndex(nextIndex) : clampIndex(nextIndex);

    if (isAnimating && !instant) {
      return;
    }

    stopAutoplay();

    const previousIndex = index;
    const incoming = slides[targetIndex];
    const outgoingContent = contents[previousIndex];
    const incomingContent = contents[targetIndex];
    const destination = gsap.utils.clamp(
      minX,
      0,
      -incoming.offsetLeft
    );

    if (
      !instant &&
      targetIndex === index &&
      Math.abs(trackX() - destination) < 1
    ) {
      startAutoplay();
      return;
    }

    if (transition) {
      transition.kill();
      transition = null;
    }

    index = targetIndex;

    if (instant || prefersReducedMotion) {
      gsap.set(track, { x: destination, force3D: true });
      gsap.set(contents, { autoAlpha: 1 });
      isAnimating = false;
      updateControls();
      startAutoplay();
      return;
    }

    isAnimating = true;
    updateControls();

    transition = gsap.timeline({
      defaults: {
        overwrite: "auto",
      },
      onComplete: () => {
        gsap.set(contents, { autoAlpha: 1 });
        gsap.set(track, { x: destination, force3D: true });
        transition = null;
        isAnimating = false;
        updateControls();
        startAutoplay();
      },
    });

    if (targetIndex === previousIndex) {
      transition.to(track, {
        x: destination,
        duration: 0.72,
        ease: "power3.out",
        force3D: true,
      });
      return;
    }

    gsap.set(incomingContent, { autoAlpha: 0.32 });

    transition
      .to(
        outgoingContent,
        {
          autoAlpha: 0.42,
          duration: 0.45,
          ease: "power2.out",
        },
        0
      )
      .to(
        track,
        {
          x: destination,
          duration: 1.05,
          ease: "power3.inOut",
          force3D: true,
        },
        0
      )
      .to(
        incomingContent,
        {
          autoAlpha: 1,
          duration: 0.72,
          ease: "power2.out",
        },
        0.3
      );
  }

  /* Rubber-band a little if the user drags past the first or last slide. */
  function applyDragResistance(x) {
    const previousX = index > 0 ? -slides[index - 1].offsetLeft : 0;
    const nextX =
      index < slides.length - 1 ? -slides[index + 1].offsetLeft : minX;

    if (x > previousX) {
      return previousX + (x - previousX) * 0.22;
    }

    if (x < nextX) {
      return nextX + (x - nextX) * 0.22;
    }

    return x;
  }

  /* After a drag, go to the next/prev slide if they moved far or flicked quickly. */
  function snapFromDrag() {
    const currentX = -slides[index].offsetLeft;
    const distance = trackX() - currentX;
    const distanceThreshold = tracker.clientWidth * 0.12;
    const velocityThreshold = 0.35;
    let direction = 0;

    if (Math.abs(distance) >= distanceThreshold) {
      direction = distance < 0 ? 1 : -1;
    } else if (Math.abs(velocityX) >= velocityThreshold) {
      direction = velocityX < 0 ? 1 : -1;
    }

    goTo(index + direction);
  }

  prev.addEventListener("click", () => {
    if (!isAnimating) {
      goTo(index - 1, { wrap: isAutoplayViewport() });
    }
  });

  next.addEventListener("click", () => {
    if (!isAnimating) {
      goTo(index + 1, { wrap: isAutoplayViewport() });
    }
  });

  tracker.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1, { wrap: isAutoplayViewport() });
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1, { wrap: isAutoplayViewport() });
    }
  });

  tracker.addEventListener("pointerdown", (event) => {
    if (isAnimating || (event.button && event.button !== 0)) {
      return;
    }

    if (event.target.closest("a, button")) {
      return;
    }

    pointerId = event.pointerId;
    pressX = event.clientX;
    pressY = event.clientY;
    lastMoveX = event.clientX;
    lastMoveT = performance.now();
    velocityX = 0;
    dragAxis = null;
    didDrag = false;
    dragStartX = trackX();
  });

  tracker.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) {
      return;
    }

    const dx = event.clientX - pressX;
    const dy = event.clientY - pressY;
    const now = performance.now();
    const dt = Math.max(now - lastMoveT, 1);

    velocityX = ((event.clientX - lastMoveX) / dt) * 16;
    lastMoveX = event.clientX;
    lastMoveT = now;

    if (!dragAxis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        return;
      }

      dragAxis = Math.abs(dx) > Math.abs(dy) * 1.15 ? "x" : "y";

      if (dragAxis === "x") {
        dragging = true;
        didDrag = true;
        stopAutoplay();
        tracker.classList.add("is-dragging");
        tracker.setPointerCapture(pointerId);
      }
    }

    if (dragAxis !== "x") {
      return;
    }

    event.preventDefault();
    gsap.set(track, {
      x: applyDragResistance(dragStartX + dx),
      force3D: true,
    });
  });

  /* Pointer up / cancel: stop dragging and snap if they actually dragged. */
  function endPointer(event) {
    if (pointerId === null || (event && event.pointerId !== pointerId)) {
      return;
    }

    const wasDragging = dragging;

    if (performance.now() - lastMoveT > 80) {
      velocityX = 0;
    }

    pointerId = null;
    dragging = false;
    tracker.classList.remove("is-dragging");

    if (wasDragging) {
      snapFromDrag();
    }

    dragAxis = null;
  }

  tracker.addEventListener("pointerup", endPointer);
  tracker.addEventListener("pointercancel", endPointer);
  tracker.addEventListener(
    "click",
    (event) => {
      if (!didDrag) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      didDrag = false;
    },
    true
  );

  const resizeObserver = new ResizeObserver(() => {
    const width = Math.round(tracker.clientWidth);

    if (width === lastWidth) {
      return;
    }

    lastWidth = width;

    if (transition) {
      transition.kill();
      transition = null;
      isAnimating = false;
    }

    layout();
    gsap.set(slides, { clearProps: "opacity,visibility" });
    gsap.set(contents, { autoAlpha: 1 });
    updateControls();
    startAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }

    startAutoplay();
  });

  resizeObserver.observe(tracker);
  layout();
  updateControls();
  startAutoplay();
}

setupTestimonials();

/*
  Service page accordion: click a heading to expand the paragraph.
  Plus/minus icons swap with CSS class .is-open. Height is animated with GSAP.
*/
function setupServiceAccordion() {
  const items = document.querySelectorAll(".Accordion");

  if (!items.length) {
    return;
  }

  items.forEach((item, index) => {
    const trigger = item.querySelector(".A-Heading-Container");
    const panel = item.querySelector(".A-Para-container");

    if (!trigger || !panel) {
      return;
    }

    const panelId = panel.id || `service-panel-${index + 1}`;
    const triggerId = trigger.id || `service-trigger-${index + 1}`;
    panel.id = panelId;
    trigger.id = triggerId;
    trigger.setAttribute("aria-controls", panelId);
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", triggerId);

    gsap.set(panel, { height: 0, overflow: "hidden" });

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");

      trigger.setAttribute("aria-expanded", String(isOpen));

      if (prefersReducedMotion) {
        gsap.set(panel, { height: isOpen ? "auto" : 0 });
        return;
      }

      gsap.to(panel, {
        height: isOpen ? "auto" : 0,
        duration: 0.45,
        ease: "power3.inOut",
        overwrite: true,
        onComplete: () => {
          if (window.ScrollTrigger) {
            ScrollTrigger.refresh();
          }
        },
      });
    });
  });
}

setupServiceAccordion();

/*
  Builds the full-screen menu in JavaScript (it is not in the HTML).
  Desktop/tablet: slides down from the top. Mobile: slides in from the right.
  Copies the existing nav links so we do not duplicate them by hand.
*/
function setupMenuOverlay() {
  if (document.querySelector(".Menu-overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "Menu-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Site menu");
  overlay.setAttribute("aria-hidden", "true");

  const arrowIcons = `
    <span class="Icons" aria-hidden="true">
      <svg class="Icon-go-black" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.8855 16.8872L18.9942 6.33872L8.44568 5.23003M18.9942 6.33872L5.00555 17.6665" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg class="Icon-go-black" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.8855 16.8872L18.9942 6.33872L8.44568 5.23003M18.9942 6.33872L5.00555 17.6665" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>`;

  overlay.innerHTML = `
    <button class="Menu-Button" type="button" aria-label="Close menu">
      <img class="Icons" src="assets/icons/ui/cancel.svg" alt="" aria-hidden="true">
    </button>
    <div class="Menu-overlay-body">
      <nav class="Menu-overlay-list" aria-label="Site menu"></nav>
      <a class="Button Button--primary Enquiry type-button" href="#enquiry">Enquiry Now${arrowIcons}</a>
      <div class="Links">
        <div class="Link">
          <div class="Anchor-Large type-title-medium">
            <p>A:</p>
            <p>Mecricar Rd, R.S. Puram, Coimbatore, Tamil Nadu 641002</p>
          </div>
        </div>
        <div class="Link">
          <div class="Anchor-Large type-title-medium">
            <p>P:</p>
            <p><a href="tel:+919988757665">+ 91 9988757665</a></p>
          </div>
        </div>
        <div class="Link">
          <div class="Anchor-Large type-title-medium">
            <p>E:</p>
            <p><a href="mailto:design@grandeur.com">design@grandeur.com</a></p>
          </div>
        </div>
      </div>
    </div>
  `;

  const list = overlay.querySelector(".Menu-overlay-list");
  /* Copy nav links from the header so the overlay stays in sync with the page. */
  list.innerHTML = siteNav.innerHTML;

  const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const isWorkPage = page.includes("work") || page.includes("project");

  /* Does this href belong to the page we are on? Used to bold the current item. */
  function isCurrentPage(href) {
    const target = (href || "").toLowerCase();

    if (!page || page === "index.html") {
      return target.includes("index.html") || target.endsWith("#home") || target === "#home";
    }

    if (page.includes("about")) {
      return target.includes("about.html");
    }

    if (isWorkPage) {
      return target.includes("works.html");
    }

    if (page.includes("service")) {
      return target.includes("service.html");
    }

    return false;
  }

  /* Apply heading styles and the active class to one overlay nav item. */
  function markOverlayItem(item) {
    const label = item.matches("a") ? item : item.querySelector(":scope > a, :scope > span");

    if (!label) {
      return;
    }

    const href = label.getAttribute("href");
    const active = href ? isCurrentPage(href) : Boolean(item.querySelector(".Options") && isWorkPage);

    item.classList.remove("type-anchor-large", "type-anchor-large-prominent");
    item.classList.toggle("Menu--active", active);
    label.classList.remove("type-anchor-large", "type-anchor-large-prominent");
    label.classList.add("type-heading-small");
    label.classList.toggle("Menu--active", active);
  }

  list.querySelectorAll(":scope > a.Menu, :scope > .Menu").forEach(markOverlayItem);

  const workType = isWorkPage
    ? getActiveWorkType()
    : window.GRANDEUR_ACTIVE_WORK_TYPE || "";

  function markWorkOptions(root) {
    root.querySelectorAll(".Dropdown").forEach((option) => {
      const href = option.getAttribute("href") || "";
      const optionUrl = new URL(href, window.location.href);
      const optionType =
        optionUrl.searchParams.get("type") ||
        optionUrl.hash.replace(/^#/, "") ||
        "architectural";

      option.classList.toggle("Menu--active", Boolean(workType) && optionType === workType);
    });
  }

  markWorkOptions(list);
  markWorkOptions(siteNav);

  const wrapper = document.getElementById("smooth-wrapper");
  document.body.insertBefore(overlay, wrapper || null);

  const closeBtn = overlay.querySelector(":scope > .Menu-Button");
  let openTween;

  /* Where the menu starts off-screen: right on tablet/mobile, above on desktop. */
  function menuOffscreen() {
    return window.innerWidth <= 1024
      ? { xPercent: 100, yPercent: 0 }
      : { xPercent: 0, yPercent: -100 };
  }

  /* Hide the overlay, unlock page scroll, and restore the hamburger label. */
  function finishClose() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");

    if (!document.querySelector(".Overlay.is-open")) {
      pauseSmoothScroll(false);
      document.body.style.overflow = "";
    }

    if (window.gsap) {
      gsap.set(overlay, { clearProps: "transform,opacity,visibility" });
    } else {
      overlay.style.transform = "";
    }
  }

  /* Slide the menu on screen and lock scrolling underneath. */
  function openMenuOverlay() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close menu");
    pauseSmoothScroll(true);
    document.body.style.overflow = "hidden";

    if (prefersReducedMotion || !window.gsap) {
      overlay.style.transform = "none";
      closeBtn.focus();
      return;
    }

    gsap.set(overlay, { ...menuOffscreen(), autoAlpha: 1 });
    openTween = gsap.to(overlay, {
      xPercent: 0,
      yPercent: 0,
      duration: 0.8,
      ease: "power4.out",
      onComplete: () => closeBtn.focus(),
    });
  }

  closeMenuOverlay = function closeMenuOverlay(instant) {
    if (!overlay.classList.contains("is-open")) {
      return;
    }

    if (openTween) {
      openTween.kill();
    }

    if (instant || prefersReducedMotion || !window.gsap) {
      finishClose();
      return;
    }

    gsap.to(overlay, {
      ...menuOffscreen(),
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: finishClose,
    });
  };

  toggleMenuOverlay = function toggleMenuOverlay() {
    if (overlay.classList.contains("is-open")) {
      closeMenuOverlay();
      return;
    }

    openMenuOverlay();
  };

  closeBtn.addEventListener("click", () => closeMenuOverlay());

  list.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenuOverlay();
    }
  });

  setupMenuHoverType(list);
}

/*
  Builds the 3-step enquiry form overlay in JavaScript.
  Step 1: name, phone, email
  Step 2: service + project type
  Step 3: budget + short brief
  "Enquiry Now", "Get a Quote", and "Start Your Project" all open this.
*/
function setupEnquiryOverlay() {
  if (document.querySelector(".Overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "Overlay";
  overlay.id = "enquiry";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "enquiry-title");
  overlay.setAttribute("aria-hidden", "true");
  const checkboxOn = `
    <span class="Option-Actions">
      <span class="Option-Actions-mark"></span>
      <svg class="Option-Actions-on" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 4H16V16H4V4Z" fill="currentColor"/>
        <path d="M6.59105 9.87428L8.94791 12.2305L13.409 7.76948" stroke="currentColor"/>
      </svg>
    </span>`;
  const radioOn = `
    <span class="Option-Actions Option-Actions--radio">
      <span class="Option-Actions-mark"></span>
      <svg class="Option-Actions-on" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="5.5" stroke="currentColor" fill="none"/>
        <circle cx="10" cy="10" r="3.35938" fill="currentColor"/>
      </svg>
    </span>`;

  overlay.innerHTML = `
    <button class="Cancel-button Component-1" type="button" aria-label="Close enquiry">
      <img class="Icons" src="assets/icons/ui/cancel.svg" alt="" aria-hidden="true">
    </button>
    <div class="Enquiry-Content">
      <div class="Stepper is-step-1" aria-hidden="true">
        <div class="Stepper-01"><span class="type-caption">01</span></div>
        <div class="Stepper-line"><span class="Stepper-line-fill"></span></div>
        <div class="Stepper-02"><span class="type-caption">02</span></div>
        <div class="Stepper-line"><span class="Stepper-line-fill"></span></div>
        <div class="Stepper-03"><span class="type-caption">03</span></div>
      </div>
      <form class="Enquiry-Form" aria-labelledby="enquiry-title">
        <div class="Enquiry-Title">
          <h2 class="type-heading" id="enquiry-title">Enquiry Form</h2>
          <p class="type-caption">Building, renovating, or reimagining your home? Share your requirements and let’s bring your vision to life.</p>
        </div>
        <div class="Enquiry-Step Input-Container is-active" data-step="1">
          <div class="Input-field">
            <label class="sr-only" for="enquiry-name">Full Name</label>
            <input class="Input type-caption" id="enquiry-name" type="text" name="name" autocomplete="name" placeholder="Full Name" inputmode="text" spellcheck="false" aria-describedby="enquiry-name-error">
            <p class="Input-error type-caption" id="enquiry-name-error" hidden></p>
          </div>
          <div class="Input-field">
            <label class="sr-only" for="enquiry-phone">Phone Number</label>
            <input class="Mobile-Input type-caption" id="enquiry-phone" type="tel" name="phone" inputmode="numeric" autocomplete="tel" placeholder="Phone Number" maxlength="10" pattern="[0-9]{10}" aria-describedby="enquiry-phone-error">
            <p class="Input-error type-caption" id="enquiry-phone-error" hidden></p>
          </div>
          <div class="Input-field">
            <label class="sr-only" for="enquiry-email">Email ID</label>
            <input class="Email-Input type-caption" id="enquiry-email" type="email" name="email" autocomplete="email" placeholder="Email ID" autocapitalize="none" spellcheck="false" aria-describedby="enquiry-email-error">
            <p class="Input-error type-caption" id="enquiry-email-error" hidden></p>
          </div>
        </div>
        <div class="Enquiry-Step Questions-Container" data-step="2">
          <div class="S-frame">
            <div class="service-question type-anchor-large-prominent" id="enquiry-service-q">What service are you interested in?</div>
            <div class="service-option" role="group" aria-labelledby="enquiry-service-q">
              <label class="Option type-caption"><input type="checkbox" name="service" value="Interior Design">${checkboxOn}Interior Design</label>
              <label class="Option type-caption"><input type="checkbox" name="service" value="Architecture">${checkboxOn}Architecture</label>
              <label class="Option type-caption"><input type="checkbox" name="service" value="Both">${checkboxOn}Both</label>
            </div>
          </div>
          <div class="P-frame">
            <div class="Project-question type-anchor-large-prominent" id="enquiry-project-q">What’s your project type?</div>
            <div class="Project-option-container" role="group" aria-labelledby="enquiry-project-q">
              <div class="p-option">
                <label class="Option type-caption"><input type="checkbox" name="project" value="Residential">${checkboxOn}Residential</label>
                <label class="Option type-caption"><input type="checkbox" name="project" value="Commercial">${checkboxOn}Commercial</label>
                <label class="Option type-caption"><input type="checkbox" name="project" value="Restaurant">${checkboxOn}Restaurant</label>
                <label class="Option type-caption"><input type="checkbox" name="project" value="Hotel">${checkboxOn}Hotel</label>
                <label class="Option type-caption"><input type="checkbox" name="project" value="Hospital">${checkboxOn}Hospital</label>
              </div>
              <input class="Input type-caption" id="enquiry-other" type="text" name="projectOther" placeholder="Others" aria-label="Other project type">
            </div>
          </div>
        </div>
        <div class="Enquiry-Step Project-container" data-step="3">
          <div class="B-Frame">
            <div class="Budget-question type-anchor-large-prominent" id="enquiry-budget-q">Choose your budget range</div>
            <div class="B-option" role="group" aria-labelledby="enquiry-budget-q">
              <label class="Option type-caption"><input type="radio" name="budget" value="3L-10L">${radioOn}3L-10L</label>
              <label class="Option type-caption"><input type="radio" name="budget" value="10L-30L">${radioOn}10L-30L</label>
              <label class="Option type-caption"><input type="radio" name="budget" value="30L-90L">${radioOn}30L-90L</label>
              <label class="Option type-caption"><input type="radio" name="budget" value="1C-5C">${radioOn}1C-5C</label>
            </div>
          </div>
          <label class="Project-question type-anchor-large-prominent" for="enquiry-brief">Tell us a little about your project ?</label>
          <textarea class="Project-Brief type-caption" id="enquiry-brief" name="brief" rows="2" placeholder="Write here"></textarea>
        </div>
        <div class="Button-container is-start">
          <button class="Button Button--variant Enquiry-Back type-button" type="button">Back</button>
          <button class="Button Button--muted Enquiry-Next type-button" type="button" disabled>Next</button>
        </div>
      </form>
      <div class="Enquiry-Whatsapp">
        <div class="Enquiry-or" aria-hidden="true">
          <span class="Enquiry-or-line"></span>
          <span class="type-caption">or</span>
          <span class="Enquiry-or-line"></span>
        </div>
        <a class="Button Button--primary Enquiry-Whatsapp-button type-button" href="https://wa.me/919677746629?text=Hi%2C%20I%E2%80%99d%20like%20to%20know%20more%20about%20your%20interior%20design%20services%20and%20discuss%20my%20project." target="_blank" rel="noopener noreferrer">
          <img class="Enquiry-Whatsapp-icon" src="assets/icons/social/whatsapp.svg" alt="" width="24" height="24" aria-hidden="true">
          Whatsapp Us
        </a>
      </div>
    </div>
  `;

  const wrapper = document.getElementById("smooth-wrapper");
  document.body.insertBefore(overlay, wrapper || null);

  const form = overlay.querySelector(".Enquiry-Form");
  const stepper = overlay.querySelector(".Stepper");
  const steps = [...overlay.querySelectorAll(".Enquiry-Step")];
  const buttons = overlay.querySelector(".Button-container");
  const back = overlay.querySelector(".Enquiry-Back");
  const next = overlay.querySelector(".Enquiry-Next");
  const closeBtn = overlay.querySelector(".Cancel-button");
  const lineFills = [...overlay.querySelectorAll(".Stepper-line-fill")];
  const whatsapp = overlay.querySelector(".Enquiry-Whatsapp");
  let step = 1;
  let openTween;
  let enquiryOpener = null;

  /* Fill the 01—02—03 line as the user moves between form steps. */
  function animateStepper(toStep) {
    const targets = [
      toStep >= 2 ? 1 : 0,
      toStep >= 3 ? 1 : 0,
    ];

    lineFills.forEach((fill, index) => {
      const nextScale = targets[index];

      if (prefersReducedMotion || !window.gsap) {
        fill.style.transform = nextScale ? "scaleX(1)" : "scaleX(0)";
        return;
      }

      gsap.to(fill, {
        scaleX: nextScale,
        duration: 0.55,
        ease: "power3.inOut",
        overwrite: true,
      });
    });

    if (prefersReducedMotion || !window.gsap) {
      return;
    }

    const labels = [
      overlay.querySelector(".Stepper-01"),
      overlay.querySelector(".Stepper-02"),
      overlay.querySelector(".Stepper-03"),
    ];

    labels.forEach((label, index) => {
      gsap.to(label, {
        color: index < toStep ? "var(--text-dark)" : "var(--text-muted)",
        duration: 0.4,
        ease: "power2.out",
        overwrite: true,
      });
    });
  }

  function isMobile() {
    return window.innerWidth <= 600;
  }

  /* Enquiry overlay: from the right on phones, from the top on larger screens. */
  function offscreen() {
    return isMobile()
      ? { xPercent: 100, yPercent: 0 }
      : { xPercent: 0, yPercent: -100 };
  }

  /* Count letters / digits so we can validate name and phone. */
  function letterCount(value) {
    return (value.match(/[A-Za-z]/g) || []).length;
  }

  function digitCount(value) {
    return (value.match(/\d/g) || []).length;
  }

  /* Return an error message for a field, or "" if it is valid. */
  function fieldError(name) {
    const field = form.elements[name];
    const value = field.value.trim();

    if (name === "name") {
      if (!value) {
        return "Enter your full name.";
      }

      if (letterCount(value) <= 3) {
        return "Name must be more than three letters.";
      }

      return "";
    }

    if (name === "phone") {
      const digits = digitCount(value);

      if (!value) {
        return "Enter your phone number.";
      }

      if (digits !== 10) {
        return "Phone number must be 10 digits.";
      }

      return "";
    }

    if (name === "email") {
      if (!value) {
        return "Enter your email ID.";
      }

      if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) {
        return "Enter a valid email address.";
      }

      return "";
    }

    return "";
  }

  const errorTimers = {};

  function clearFieldError(name) {
    const field = form.elements[name];
    const note = field.parentElement.querySelector(".Input-error");

    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
    note.hidden = true;
    note.textContent = "";
  }

  function clearErrorTimers() {
    Object.keys(errorTimers).forEach((name) => {
      clearTimeout(errorTimers[name]);
      delete errorTimers[name];
    });
  }

  /* Strip invalid characters as the user types (letters in name, digits in phone). */
  function sanitizeField(field) {
    const name = field.name;
    const previous = field.value;
    const cursor = field.selectionStart;
    let next = previous;

    if (name === "name") {
      next = previous.replace(/[^\p{L}\s'-]/gu, "");
    } else if (name === "phone") {
      next = previous.replace(/\D/g, "").slice(0, 10);
    } else if (name === "email") {
      next = previous.toLowerCase();
    } else {
      return;
    }

    if (next === previous) {
      return;
    }

    field.value = next;

    if (typeof cursor === "number") {
      const position = Math.max(0, cursor + (next.length - previous.length));
      field.setSelectionRange(position, position);
    }
  }

  /* Wait 2 seconds after typing before showing an error (avoids nagging mid-word). */
  function scheduleFieldError(name) {
    clearTimeout(errorTimers[name]);
    clearFieldError(name);

    if (!form.elements[name].value.trim()) {
      return;
    }

    errorTimers[name] = setTimeout(() => {
      showFieldError(name, false);
    }, 2000);
  }

  /* Show or hide the red error under a field. */
  function showFieldError(name, force) {
    const field = form.elements[name];
    const note = field.parentElement.querySelector(".Input-error");
    const message = fieldError(name);
    const shouldShow = Boolean(message) && (force || field.value.trim().length > 0);

    field.classList.toggle("is-invalid", shouldShow);
    field.toggleAttribute("aria-invalid", shouldShow);
    note.hidden = !shouldShow;
    note.textContent = shouldShow ? message : "";
    return !message;
  }

  /* Each step has its own required fields. Next stays disabled until they are filled. */
  function isStepValid() {
    if (step === 1) {
      return !fieldError("name") && !fieldError("phone") && !fieldError("email");
    }

    if (step === 2) {
      const hasService = form.querySelectorAll('input[name="service"]:checked').length > 0;
      const hasProject =
        form.querySelectorAll('input[name="project"]:checked').length > 0 ||
        form.elements.projectOther.value.trim().length > 0;
      return hasService && hasProject;
    }

    const hasBudget = Boolean(form.querySelector('input[name="budget"]:checked'));
    return hasBudget && form.elements.brief.value.trim().length > 0;
  }

  /* Enable Next and switch it from grey to dark when the current step is complete. */
  function syncNext() {
    const valid = isStepValid();
    next.disabled = !valid;
    next.classList.toggle("Button--muted", !valid);
    next.classList.toggle("Button--primary", valid);
  }

  /* Move to step 1, 2, or 3 and update the stepper, buttons, and WhatsApp block. */
  function setStep(nextStep, animate) {
    step = nextStep;
    stepper.classList.remove("is-step-1", "is-step-2", "is-step-3");
    stepper.classList.add("is-step-" + step);
    buttons.classList.toggle("is-start", step === 1);
    whatsapp.hidden = step !== 1;
    next.textContent = step === 3 ? "Submit" : "Next";
    animateStepper(step);
    syncNext();

    steps.forEach((panel) => {
      const active = Number(panel.dataset.step) === step;
      panel.classList.toggle("is-active", active);

      if (animate && active && window.gsap && !prefersReducedMotion) {
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }
        );
      }
    });
  }

  /* Open the form: close the menu first, lock scroll, animate the overlay in. */
  function openEnquiry() {
    closeMenu(true);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    pauseSmoothScroll(true);
    document.body.style.overflow = "hidden";
    syncNext();

    if (prefersReducedMotion || !window.gsap) {
      overlay.style.transform = "none";
      closeBtn.focus();
      return;
    }

    gsap.set(overlay, { ...offscreen(), autoAlpha: 1 });
    openTween = gsap.to(overlay, {
      xPercent: 0,
      yPercent: 0,
      duration: 0.8,
      ease: "power4.out",
      onComplete: () => closeBtn.focus(),
    });
  }

  /* Close the form, reset to step 1, and put keyboard focus back on the button that opened it. */
  function closeEnquiry() {
    function finish() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      pauseSmoothScroll(false);
      document.body.style.overflow = "";

      if (window.gsap) {
        gsap.set(overlay, { clearProps: "transform,opacity,visibility" });
      } else {
        overlay.style.transform = "";
      }

      setStep(1, false);
      clearErrorTimers();
      form.reset();
      ["name", "phone", "email"].forEach(clearFieldError);
      syncNext();

      if (enquiryOpener && typeof enquiryOpener.focus === "function") {
        enquiryOpener.focus();
      }
    }

    if (prefersReducedMotion || !window.gsap) {
      finish();
      return;
    }

    if (openTween) {
      openTween.kill();
    }

    gsap.to(overlay, {
      ...offscreen(),
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: finish,
    });
  }

  overlay.closeEnquiry = closeEnquiry;

  closeBtn.addEventListener("click", closeEnquiry);

  back.addEventListener("click", () => {
    if (step > 1) {
      setStep(step - 1, true);
    }
  });

  next.addEventListener("click", () => {
    if (step === 1) {
      clearErrorTimers();
      const nameOk = showFieldError("name", true);
      const phoneOk = showFieldError("phone", true);
      const emailOk = showFieldError("email", true);

      if (!nameOk || !phoneOk || !emailOk) {
        next.disabled = true;
        next.classList.add("Button--muted");
        next.classList.remove("Button--primary");
        return;
      }
    }

    if (!isStepValid()) {
      return;
    }

    if (step < 3) {
      setStep(step + 1, true);
      return;
    }

    closeEnquiry();
  });

  form.addEventListener("beforeinput", (event) => {
    const field = event.target;

    if (!event.data || event.inputType === "insertFromPaste") {
      return;
    }

    if (field.name === "name" && /[^\p{L}\s'-]/u.test(event.data)) {
      event.preventDefault();
    }

    if (field.name === "phone" && /\D/.test(event.data)) {
      event.preventDefault();
    }
  });

  form.addEventListener("input", (event) => {
    if (event.target.name === "name" || event.target.name === "phone" || event.target.name === "email") {
      sanitizeField(event.target);
      scheduleFieldError(event.target.name);
    }

    syncNext();
  });
  form.addEventListener("change", syncNext);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  document.querySelectorAll("a, button").forEach((trigger) => {
    const label = trigger.textContent.replace(/\s+/g, " ").trim();
    const opensEnquiry =
      trigger.classList.contains("Enquiry") ||
      trigger.getAttribute("href") === "#enquiry" ||
      label === "Enquiry Now" ||
      label === "Get a Quote" ||
      label.startsWith("Start Your Project");

    if (!opensEnquiry) {
      return;
    }

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      enquiryOpener = trigger;
      openEnquiry();
    });
  });
}

/* True if this nav item is the current page (Home, About, Works, Service). */
function isMenuActive(el) {
  return Boolean(el && (el.classList.contains("Menu--active") || el.closest(".Menu.Menu--active")));
}

/* Swap regular / bold nav text classes on hover or focus. */
function setAnchorType(el, prominent) {
  if (!el) {
    return;
  }

  if (!el.classList.contains("type-anchor-large") && !el.classList.contains("type-anchor-large-prominent")) {
    return;
  }

  el.classList.toggle("type-anchor-large-prominent", prominent);
  el.classList.toggle("type-anchor-large", !prominent);
}

/* Make nav labels go bold while the mouse or keyboard is on them. */
function setupMenuHoverType(root) {
  if (!root) {
    return;
  }

  root.querySelectorAll(".Menu").forEach((menu) => {
    const label = menu.matches("a") ? menu : menu.querySelector(":scope > a, :scope > span");

    menu.addEventListener("mouseenter", () => setAnchorType(label, true));
    menu.addEventListener("mouseleave", () => setAnchorType(label, isMenuActive(menu) || isMenuActive(label)));
    menu.addEventListener("focusin", () => setAnchorType(label, true));
    menu.addEventListener("focusout", (event) => {
      if (menu.contains(event.relatedTarget)) {
        return;
      }

      setAnchorType(label, isMenuActive(menu) || isMenuActive(label));
    });
  });

  root.querySelectorAll(".Dropdown").forEach((option) => {
    option.addEventListener("mouseenter", () => setAnchorType(option, true));
    option.addEventListener("mouseleave", () => setAnchorType(option, option.classList.contains("Menu--active")));
    option.addEventListener("focus", () => setAnchorType(option, true));
    option.addEventListener("blur", () => setAnchorType(option, option.classList.contains("Menu--active")));
  });
}

/*
  Which Works gallery to show: from ?type= in the URL, or from #architectural
  in the hash. Falls back to Architectural.
*/
function getActiveWorkType() {
  const requestedType = new URLSearchParams(window.location.search).get("type");
  const hashType = window.location.hash.replace(/^#/, "");

  if (WORK_CATEGORIES[requestedType]) {
    return requestedType;
  }

  if (WORK_CATEGORIES[hashType]) {
    return hashType;
  }

  return "architectural";
}

/* Hide the two unused Works sections so only one category is on screen. */
function setupWorksCategory() {
  const works = document.querySelector(".Works-container");
  if (!works) {
    return;
  }

  const type = getActiveWorkType();

  window.GRANDEUR_ACTIVE_WORK_TYPE = type;
  works.dataset.activeCategory = type;
  works.querySelectorAll(".Works-section").forEach((section) => {
    const isActive = section.dataset.workCategory === type;
    section.hidden = !isActive;
    section.setAttribute("aria-hidden", String(!isActive));
  });
  document.title = `${WORK_CATEGORIES[type]} Works - Grandeur Designs`;
}

/*
  Works page: the category title stays in the gallery at rest.
  After the page scrolls, it moves into the header beside the menu.
*/
function setupWorksTitleDock() {
  const works = document.querySelector(".Works-container");
  const navActions = nav.querySelector(".Nav-actions");
  const titleWrap = works?.querySelector(".Works-section:not([hidden]) .Title-Large");
  const heading = titleWrap?.querySelector(".type-title-large");

  if (!works || !navActions || !titleWrap || !heading || !window.gsap) {
    return;
  }

  const duration = 0.45;
  let docked = false;
  let isAnimating = false;
  let headingTween;
  let wrapTween;

  function dockTitle(next) {
    if (isAnimating || next === docked) {
      return;
    }

    const first = heading.getBoundingClientRect();
    const wrapHeight = titleWrap.offsetHeight;

    if (headingTween) {
      headingTween.kill();
    }

    if (wrapTween) {
      wrapTween.kill();
    }

    isAnimating = true;
    docked = next;
    works.classList.toggle("is-title-docked", next);
    heading.classList.toggle("is-docked-title", next);

    if (next) {
      gsap.set(titleWrap, { height: wrapHeight });
      nav.insertBefore(heading, navActions);
    } else {
      titleWrap.appendChild(heading);
    }

    const instant = prefersReducedMotion;
    let openHeight = wrapHeight;
    let last = heading.getBoundingClientRect();

    if (!next) {
      gsap.set(titleWrap, { height: "auto", overflow: "visible" });
      openHeight = titleWrap.offsetHeight;
      last = heading.getBoundingClientRect();
      gsap.set(titleWrap, { height: 0 });
    }

    headingTween = gsap.fromTo(
      heading,
      { x: first.left - last.left, y: first.top - last.top },
      {
        x: 0,
        y: 0,
        duration: instant ? 0 : duration,
        ease: "power2.out",
        overwrite: true,
        clearProps: "transform",
      }
    );

    wrapTween = gsap.to(titleWrap, {
      height: next ? 0 : openHeight,
      duration: instant ? 0 : duration,
      ease: "power2.out",
      overwrite: true,
      onComplete: () => {
        if (!next) {
          gsap.set(titleWrap, { clearProps: "height,overflow" });
        }

        isAnimating = false;
      },
    });
  }

  syncWorksTitleDock = dockTitle;
}

/* Works page: the selected gallery pins and scrolls like the team tracker. */
function setupWorkTracker() {
  const section = document.querySelector(".Works-container");
  const track = section?.querySelector(".Works-section:not([hidden]) .Work-Tracker");

  setupAxisPinnedTrack(section, track, 600);
}

/* Start page-specific features. Each function no-ops if its HTML is missing. */
setupWorksCategory();
setupWorksTitleDock();
setupMenuOverlay();
setupEnquiryOverlay();
setupWorkTracker();
setupMenuHoverType(siteNav);

/* If the Works hash changes (e.g. #residential), reload so the right gallery shows. */
window.addEventListener("hashchange", () => {
  const works = document.querySelector(".Works-container");
  const hashType = window.location.hash.replace(/^#/, "");

  if (!works || !WORK_CATEGORIES[hashType]) {
    return;
  }

  if (hashType !== works.dataset.activeCategory) {
    window.location.reload();
  }
});

/* After images load, GSAP recalculates scroll distances. */
window.addEventListener("load", () => {
  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }

  pinProjectPageToTop();
});

