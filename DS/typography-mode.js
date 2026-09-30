/*
  Sets data-typography-mode on <html> from the viewport width.
  Tokens in typography.css follow this attribute, not CSS media queries.
  Desktop: above 1024px. Tablet: 601–1024px. Mobile: 600px and below.
*/
function setTypographyMode() {
  const width = window.innerWidth;
  let mode = "desktop";

  if (width <= 600) {
    mode = "mobile";
  } else if (width <= 1024) {
    mode = "tablet";
  }

  document.documentElement.setAttribute("data-typography-mode", mode);
}

setTypographyMode();
