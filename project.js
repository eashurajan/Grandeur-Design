/*
  project.js — fills project.html with one project's content

  project.html is a blank template (title, gallery, testimonial, next project).
  This file reads the project id from the URL hash, for example:
    project.html#tropical-residence
  Then it copies text and images from project-data.js into those empty spots.

  Load order in project.html:
    1. project-data.js  → window.GRANDEUR_PROJECTS
    2. project.js       → this file (runs immediately)
    3. script.js        → shared header / scroll / enquiry
*/

(function setupProjectDetail() {
  /* All projects live on window so this file does not need import/export. */
  const projects = window.GRANDEUR_PROJECTS || {};

  /*
    Which project to show, in order:
    1. ?project=tropical-residence  (query string)
    2. #tropical-residence          (hash — this is what the site uses)
    3. tropical-residence           (default if the URL is unknown)
  */
  const params = new URLSearchParams(window.location.search);
  const requestedKey =
    params.get("project") ||
    window.location.hash.replace(/^#/, "") ||
    "tropical-residence";
  const projectKey = projects[requestedKey] ? requestedKey : "tropical-residence";
  const project = projects[projectKey];

  if (!project) {
    return;
  }

  /* CSS uses [data-project="..."] for a few mobile image sizes. */
  document.documentElement.dataset.project = projectKey;

  /* Header Works dropdown should highlight this project's category. */
  window.GRANDEUR_ACTIVE_WORK_TYPE = project.category;

  const page = document.querySelector(".Project-page");
  if (page) {
    page.id = projectKey;
  }

  /* Stop the browser from restoring a mid-page scroll when you refresh. */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.scrollTo(0, 0);

  /* Some photos are cropped with CSS variables instead of object-position. */
  const applyImageCrop = (img, source) => {
    if (source.crop) {
      img.classList.add("is-cropped");
      img.style.setProperty("--crop-left", source.crop.left);
      img.style.setProperty("--crop-top", source.crop.top);
      img.style.setProperty("--crop-width", source.crop.width);
      img.style.setProperty("--crop-height", source.crop.height);
      return;
    }

    img.style.objectPosition = source.position || "center";
  };

  /* Helper: find an element by CSS selector and replace its text. */
  const setText = (selector, value) => {
    const element = document.querySelector(selector);

    if (element) {
      element.textContent = value;
    }
  };

  document.title = `${project.title} - Grandeur Designs`;
  const descriptionMeta = document.querySelector('meta[name="description"]');

  if (descriptionMeta) {
    descriptionMeta.content = `${project.title}, a ${project.details.Scope.toLowerCase()} project by Grandeur Designs in ${project.details.Location}.`;
  }

  setText("[data-project-eyebrow]", project.eyebrow);
  setText("[data-project-title]", project.title);
  setText("[data-testimonial-role]", project.testimonial.role);
  setText("[data-testimonial-name]", project.testimonial.name);
  setText("[data-testimonial-quote]", project.testimonial.quote);
  setText("[data-next-project-title]", project.nextProject.title);

  /* Description is an array of paragraphs — build a <p> for each. */
  const description = document.querySelector("[data-project-description]");
  if (description) {
    description.replaceChildren(
      ...project.description.map((paragraph) => {
        const element = document.createElement("p");
        element.textContent = paragraph;
        return element;
      })
    );
  }

  /* Facts row: Type, Scope, Area, Location, Year. */
  const details = document.querySelector("[data-project-details]");
  if (details) {
    details.replaceChildren(
      ...Object.entries(project.details).map(([label, value]) => {
        const item = document.createElement("div");
        item.className = "Project-detail";

        const labelElement = document.createElement("span");
        labelElement.className = "type-title-small";
        labelElement.textContent = `${label}${label === "Type" || label === "Year" ? " :" : ":"}`;

        const valueElement = document.createElement("span");
        valueElement.className = "type-title-small-prominent";
        valueElement.textContent = value;

        item.append(labelElement, valueElement);
        return item;
      })
    );
  }

  /* Photo gallery. First image loads immediately; the rest load lazily. */
  const gallery = document.querySelector("[data-project-gallery]");
  if (gallery) {
    gallery.replaceChildren(
      ...project.gallery.map((image, index) => {
        const picture = document.createElement("picture");
        picture.className = `Project-gallery-item Project-gallery-item--${index + 1}`;

        if (image.ratio) {
          picture.classList.add("Project-gallery-item--ratio");
          picture.style.setProperty("--project-image-ratio", image.ratio);
        }

        if (image.mobile) {
          const source = document.createElement("source");
          source.media = "(max-width: 600px)";
          source.srcset = image.mobile;
          picture.append(source);
        }

        const img = document.createElement("img");
        img.src = image.desktop;
        img.alt = image.alt;
        img.loading = index > 0 ? "lazy" : "eager";
        img.decoding = "async";
        applyImageCrop(img, image);
        picture.append(img);
        return picture;
      })
    );
  }

  const testimonialPicture = document.querySelector("[data-testimonial-image]");
  if (testimonialPicture) {
    testimonialPicture.style.setProperty(
      "--project-testimonial-ratio",
      project.testimonial.ratio || "2668 / 3335"
    );
    testimonialPicture.querySelector("source").srcset =
      project.testimonial.mobileImage || project.testimonial.image;
    const image = testimonialPicture.querySelector("img");
    image.src = project.testimonial.image;
    image.alt = project.testimonial.imageAlt;
    applyImageCrop(image, project.testimonial);
  }

  const nextImage = document.querySelector("[data-next-project-image]");
  if (nextImage) {
    nextImage.src = project.nextProject.image;
    nextImage.alt = project.nextProject.imageAlt;
  }

  /* If the next project is not ready yet, send people back to Works instead. */
  const nextHref = project.nextProject.available
    ? `project.html#${encodeURIComponent(project.nextProject.key)}`
    : "works.html?type=residential#residential";

  document.querySelectorAll("[data-next-project-link]").forEach((link) => {
    link.href = nextHref;
  });

  const backLink = document.querySelector("[data-project-back]");
  if (backLink) {
    backLink.href = `works.html?type=${encodeURIComponent(project.category)}#${encodeURIComponent(project.category)}`;
    backLink.setAttribute("aria-label", `Back to ${project.category} works`);

    /*
      If they arrived from works.html, the back arrow uses the browser Back
      button (keeps their scroll). Otherwise it uses the category link above.
    */
    backLink.addEventListener("click", (event) => {
      const cameFromWorks = document.referrer &&
        new URL(document.referrer).pathname.toLowerCase().endsWith("/works.html");

      if (cameFromWorks && window.history.length > 1) {
        event.preventDefault();
        window.history.back();
      }
    });
  }

  /* Changing #garden-residence while already on this page reloads with the new data. */
  window.addEventListener("hashchange", () => {
    const nextKey = window.location.hash.replace(/^#/, "");

    if (projects[nextKey] && nextKey !== projectKey) {
      window.location.reload();
    }
  });
})();
