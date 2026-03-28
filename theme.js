const STORAGE_KEY = "sl-dark";
const MOON_SVG = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
const SUN_SVG = `
  <circle cx="12" cy="12" r="5"/>
  <line x1="12"   y1="1"     x2="12"   y2="3"/>
  <line x1="12"   y1="21"    x2="12"   y2="23"/>
  <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1"    y1="12"    x2="3"    y2="12"/>
  <line x1="21"   y1="12"    x2="23"   y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
`;
const TOGGLE_ICON_IDS = ["theme-icon", "theme-icon-mobile"];
function applyTheme(dark) {
  const html = document.documentElement;
  if (dark) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
  const svgContent = dark ? SUN_SVG : MOON_SVG;
  TOGGLE_ICON_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = svgContent;
    }
  });
}
function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const nextDark = !isDark;
  applyTheme(nextDark);
  localStorage.setItem(STORAGE_KEY, String(nextDark));
}
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const isDark = saved === "true";
  applyTheme(isDark);
  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
  document.getElementById("theme-toggle-mobile")?.addEventListener("click", toggleTheme);
}
const STAR_COUNT = 22;
const STAR_COLORS = ["#ff6b9d", "#c44dff", "#4ecdc4", "#ffd166", "#74c0fc"];
const SVG_NS = "http://www.w3.org/2000/svg";
function buildStarPath(outerRadius, innerRadius) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI / 5 * i - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = (radius * Math.cos(angle)).toFixed(2);
    const y = (radius * Math.sin(angle)).toFixed(2);
    points.push(`${x},${y}`);
  }
  return `M${points.join("L")}Z`;
}
function createStarSVG(index) {
  const size = 22 + Math.random() * 46;
  const top = Math.random() * 97;
  const left = Math.random() * 97;
  const delay = (Math.random() * 8).toFixed(2);
  const dur = (7 + Math.random() * 8).toFixed(1);
  const color = STAR_COLORS[index % STAR_COLORS.length];
  const opacity = (0.13 + Math.random() * 0.11).toFixed(3);
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "-50 -50 100 100");
  svg.setAttribute("xmlns", SVG_NS);
  svg.classList.add("bg-star");
  svg.style.width = `${size}px`;
  svg.style.height = `${size}px`;
  svg.style.top = `${top}%`;
  svg.style.left = `${left}%`;
  svg.style.opacity = opacity;
  svg.style.fill = color;
  svg.style.animationDelay = `${delay}s`;
  svg.style.animationDuration = `${dur}s`;
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", buildStarPath(44, 20));
  svg.appendChild(path);
  return svg;
}
function initStars() {
  const container = document.getElementById("star-pattern");
  if (!container) {
    return;
  }
  for (let i = 0; i < STAR_COUNT; i++) {
    const star = createStarSVG(i);
    container.appendChild(star);
  }
}
export {
  initStars as a,
  initTheme as i
};
