const PANEL_ID = "__sl_panel__";
const GHOST_ID = "__sl_ghost__";
const SNAP_ID = "__sl_snap__";
const NOTE_ID = "__sl_note__";
const BACKDROP_ID = "__sl_backdrop__";
const SKIP_IDS = [
  "__sl_panel__",
  "__sl_ghost__",
  "__sl_snap__",
  "__sl_note__",
  "__sl_backdrop__"
];
const SPACING_PROPS = [
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left"
];
function getCSSValue(el, prop) {
  const computed = getComputedStyle(el);
  const value = computed.getPropertyValue(prop);
  return value.trim();
}
function getCSSNumber(el, prop) {
  const raw = getCSSValue(el, prop);
  const parsed = parseFloat(raw);
  return parsed || 0;
}
function parseRGB(colorStr) {
  if (!colorStr) {
    return null;
  }
  const pattern = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/;
  const match = colorStr.match(pattern);
  if (!match) {
    return null;
  }
  return {
    r: +match[1],
    g: +match[2],
    b: +match[3]
  };
}
function relativeLuminance(r, g, b) {
  const channels = [r, g, b];
  const weights = [0.2126, 0.7152, 0.0722];
  return channels.reduce((acc, value, index) => {
    const normalised = value / 255;
    const linear = normalised <= 0.03928 ? normalised / 12.92 : Math.pow((normalised + 0.055) / 1.055, 2.4);
    return acc + linear * weights[index];
  }, 0);
}
function contrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}
function isMultipleOf8(value) {
  return value % 8 === 0;
}
function analyzeSpacing(allEls) {
  const issues = [];
  const snapStyle = document.createElement("style");
  snapStyle.id = SNAP_ID;
  let snapCSS = "";
  allEls.forEach((el, index) => {
    if (SKIP_IDS.includes(el.id)) {
      return;
    }
    const hasViolation = SPACING_PROPS.some((prop) => {
      const value = getCSSNumber(el, prop);
      return value !== 0 && !isMultipleOf8(Math.round(value));
    });
    if (!hasViolation) {
      return;
    }
    const markerClass = `__sl_s_${index}`;
    el.classList.add(markerClass);
    snapCSS += `.${markerClass} { outline: 2px solid #ff4757 !important; outline-offset: 1px; }`;
    const allClasses = (el.className + "").split(" ");
    const ownClasses = allClasses.filter((c) => c && !c.startsWith("__sl_"));
    const shortClass = ownClasses.slice(0, 2).join(" ");
    const issue = {
      tag: el.tagName.toLowerCase(),
      id: el.id,
      cls: shortClass
    };
    issues.push(issue);
  });
  snapStyle.textContent = snapCSS;
  return {
    issues,
    snapStyle
  };
}
function analyzeContrast(allEls) {
  const issues = [];
  allEls.forEach((el) => {
    const childNodes = Array.from(el.childNodes);
    const hasDirectText = childNodes.some((node) => {
      const isTextNode = node.nodeType === 3;
      const hasContent = (node.textContent || "").trim().length > 0;
      return isTextNode && hasContent;
    });
    if (!hasDirectText) {
      return;
    }
    const fg = parseRGB(getCSSValue(el, "color"));
    const bgStr = getCSSValue(el, "background-color");
    const bg = parseRGB(bgStr);
    if (!fg || !bg) {
      return;
    }
    const isTransparent = bg.r === 0 && bg.g === 0 && bg.b === 0 && bgStr.includes("rgba(0, 0, 0, 0)");
    if (isTransparent) {
      return;
    }
    const fgLum = relativeLuminance(fg.r, fg.g, fg.b);
    const bgLum = relativeLuminance(bg.r, bg.g, bg.b);
    const ratio = contrastRatio(fgLum, bgLum);
    if (ratio < 4.5) {
      const rawText = (el.textContent || "").trim();
      const shortText = rawText.slice(0, 45);
      const issue = {
        tag: el.tagName.toLowerCase(),
        ratio: ratio.toFixed(2),
        text: shortText
      };
      issues.push(issue);
    }
  });
  return issues;
}
function analyzeA11y() {
  const issues = [];
  document.querySelectorAll("img").forEach((img) => {
    const hasAlt = img.getAttribute("alt") !== null;
    if (!hasAlt) {
      const src = (img.src || "").slice(0, 60);
      const issue = {
        type: "Missing alt",
        el: `<img src="${src}">`
      };
      issues.push(issue);
    }
  });
  document.querySelectorAll("input, textarea, select").forEach((inp) => {
    const inputId = inp.getAttribute("id");
    const hasLabel = inputId && document.querySelector(`label[for="${inputId}"]`);
    const hasAria = inp.getAttribute("aria-label") || inp.getAttribute("aria-labelledby");
    if (!hasLabel && !hasAria) {
      const tag = inp.tagName.toLowerCase();
      const type = inp.getAttribute("type") || "";
      const issue = {
        type: "Missing label",
        el: `<${tag} type="${type}">`
      };
      issues.push(issue);
    }
  });
  return issues;
}
function buildReport(data) {
  const report = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url: location.href,
    summary: {
      spacing: data.spIssues.length,
      contrast: data.ctIssues.length,
      accessibility: data.a11yIssues.length
    },
    spacingIssues: data.spIssues,
    contrastIssues: data.ctIssues,
    accessibilityIssues: data.a11yIssues
  };
  return report;
}
const SHARED_ATTRS = `fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`;
const INLINE_STYLE_SM = `style="vertical-align:middle;margin-right:4px"`;
const INLINE_STYLE_MD = `style="vertical-align:middle;margin-right:5px"`;
const ICO = {
  ruler: `<svg width="13" height="13" viewBox="0 0 24 24" ${SHARED_ATTRS} ${INLINE_STYLE_SM}>
    <path d="M2 8h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z"/>
    <line x1="6"  y1="8"  x2="6"  y2="12"/>
    <line x1="10" y1="8"  x2="10" y2="14"/>
    <line x1="14" y1="8"  x2="14" y2="12"/>
    <line x1="18" y1="8"  x2="18" y2="14"/>
  </svg>`,
  eye: `<svg width="13" height="13" viewBox="0 0 24 24" ${SHARED_ATTRS} ${INLINE_STYLE_SM}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`,
  person: `<svg width="13" height="13" viewBox="0 0 24 24" ${SHARED_ATTRS} ${INLINE_STYLE_SM}>
    <circle cx="12" cy="4" r="2"/>
    <path d="M19 13l-7-2-7 2"/>
    <path d="M12 11v5l-3 4"/>
    <path d="M12 16l3 4"/>
  </svg>`,
  ghost: `<svg width="14" height="14" viewBox="0 0 24 24" ${SHARED_ATTRS} ${INLINE_STYLE_MD}>
    <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
  </svg>`,
  download: `<svg width="14" height="14" viewBox="0 0 24 24" ${SHARED_ATTRS} ${INLINE_STYLE_MD}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>`,
  document: `<svg width="14" height="14" viewBox="0 0 24 24" ${SHARED_ATTRS} ${INLINE_STYLE_MD}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9"  y1="13" x2="15" y2="13"/>
    <line x1="9"  y1="17" x2="13" y2="17"/>
  </svg>`,
  close: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18"/>
    <line x1="6"  y1="6"  x2="18" y2="18"/>
  </svg>`
};
function buildPanelStyles() {
  return `
    #${PANEL_ID} {
      position: fixed;
      bottom: 80px;
      right: 16px;
      z-index: 2147483647;
      width: 340px;
      max-height: 76vh;
      overflow-y: auto;
      background: #1a1a2e;
      color: #eee;
      border-radius: 16px;
      border: 2px solid #ff6b9d;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      box-shadow: 0 8px 36px rgba(255, 107, 157, .4);
      animation: dl-slide-up .25s ease;
    }
    @keyframes sl-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    #${PANEL_ID} .sl-head {
      background: linear-gradient(135deg, #ff6b9d, #c44dff);
      padding: 14px 16px;
      border-radius: 14px 14px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1;
    }
    #${PANEL_ID} .sl-head-title {
      font-weight: 800;
      font-size: 15px;
      letter-spacing: .5px;
    }
    #${PANEL_ID} .sl-close {
      background: rgba(255,255,255,.25);
      border: none;
      color: #fff;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #${PANEL_ID} .sl-body {
      padding: 14px 16px;
    }
    #${PANEL_ID} .sl-badges {
      display: flex;
      gap: 7px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    #${PANEL_ID} .sl-badge {
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    #${PANEL_ID} .sl-ghost-btn {
      width: 100%;
      background: #16213e;
      border: 1.5px solid #ff6b9d;
      color: #ff6b9d;
      padding: 9px;
      border-radius: 10px;
      cursor: pointer;
      margin-bottom: 10px;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    #${PANEL_ID} .sl-issues {
      max-height: 260px;
      overflow-y: auto;
    }
    #${PANEL_ID} .sl-section-head {
      font-weight: 800;
      margin: 8px 0 5px;
      font-size: 12px;
      display: flex;
      align-items: center;
    }
    #${PANEL_ID} .sl-row {
      background: #16213e;
      border-left: 3px solid #888;
      padding: 5px 9px;
      margin-bottom: 4px;
      border-radius: 0 7px 7px 0;
      font-size: 11px;
    }
    #${PANEL_ID} .sl-more {
      font-size: 11px;
      color: #888;
      margin-bottom: 5px;
    }
    #${PANEL_ID} .sl-ok {
      text-align: center;
      padding: 24px 0;
      color: #4ecdc4;
      font-weight: 800;
      font-size: 13px;
    }
    #${PANEL_ID} .sl-actions {
      display: flex;
      gap: 8px;
      margin-top: 13px;
    }
    #${PANEL_ID} .sl-btn {
      flex: 1;
      border: none;
      color: #fff;
      padding: 9px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
  `;
}
function buildIssueRows(data) {
  const { spIssues, ctIssues, a11yIssues } = data;
  let html = "";
  if (spIssues.length > 0) {
    html += `<p class="sl-section-head" style="color:#ff4757">${ICO.ruler} Spacing Issues</p>`;
    spIssues.slice(0, 8).forEach((s) => {
      const label = s.id ? `#${s.id}` : s.cls ? `.${s.cls}` : "";
      html += `<div class="sl-row" style="border-left-color:#ff4757">&lt;${s.tag}&gt; ${label}</div>`;
    });
    if (spIssues.length > 8) {
      html += `<div class="sl-more">+ ${spIssues.length - 8} more…</div>`;
    }
  }
  if (ctIssues.length > 0) {
    html += `<p class="sl-section-head" style="color:#c44dff">${ICO.eye} Contrast Issues</p>`;
    ctIssues.slice(0, 6).forEach((c) => {
      const preview = c.text.slice(0, 32);
      html += `<div class="sl-row" style="border-left-color:#c44dff">Ratio ${c.ratio} — "${preview}"</div>`;
    });
    if (ctIssues.length > 6) {
      html += `<div class="sl-more">+ ${ctIssues.length - 6} more…</div>`;
    }
  }
  if (a11yIssues.length > 0) {
    html += `<p class="sl-section-head" style="color:#ffd32a">${ICO.person} Accessibility Issues</p>`;
    a11yIssues.slice(0, 6).forEach((a) => {
      html += `<div class="sl-row" style="border-left-color:#ffd32a">
        <span style="color:#ffd32a">${a.type}</span>: ${a.el}
      </div>`;
    });
  }
  if (!html) {
    html = `<div class="sl-ok">✦ No issues found — great work! ✦</div>`;
  }
  return html;
}
function setupGhostToggle() {
  const ghostBtn = document.getElementById("__sl_g__");
  if (!ghostBtn) {
    return;
  }
  let ghostActive = false;
  ghostBtn.addEventListener("click", () => {
    ghostActive = !ghostActive;
    if (ghostActive) {
      const styleEl = document.createElement("style");
      styleEl.id = GHOST_ID;
      styleEl.textContent = `*:not([id^=__sl]):not([id^=__sl] *) { outline: 1px solid rgba(255,20,147,.35) !important; }`;
      document.head.appendChild(styleEl);
      ghostBtn.style.background = "#ff6b9d";
      ghostBtn.style.color = "#1a1a2e";
    } else {
      document.getElementById(GHOST_ID)?.remove();
      ghostBtn.style.background = "#16213e";
      ghostBtn.style.color = "#ff6b9d";
    }
  });
}
function setupExportButton(report) {
  const btn = document.getElementById("__sl_j__");
  if (!btn) {
    return;
  }
  btn.addEventListener("click", () => {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "starlint-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
  });
}
function buildPanelHTML(report, data) {
  const { summary } = report;
  return `
    <style>${buildPanelStyles()}</style>

    <div class="sl-head">
      <span class="sl-head-title">✦ StarLint</span>
      <button class="sl-close" id="__sl_x__">${ICO.close}</button>
    </div>

    <div class="sl-body">

      <div class="sl-badges">
        <span class="sl-badge" style="background:#ff4757">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M2 8h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z"/>
            <line x1="6"  y1="8"  x2="6"  y2="12"/>
            <line x1="10" y1="8"  x2="10" y2="14"/>
            <line x1="14" y1="8"  x2="14" y2="12"/>
            <line x1="18" y1="8"  x2="18" y2="14"/>
          </svg>
          ${summary.spacing} spacing
        </span>
        <span class="sl-badge" style="background:#c44dff">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          ${summary.contrast} contrast
        </span>
        <span class="sl-badge" style="background:#e0a800;color:#333">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="12" cy="4" r="2"/>
            <path d="M19 13l-7-2-7 2"/>
            <path d="M12 11v5l-3 4"/>
            <path d="M12 16l3 4"/>
          </svg>
          ${summary.accessibility} a11y
        </span>
      </div>

      <button class="sl-ghost-btn" id="__sl_g__">
        ${ICO.ghost}
        Toggle Ghost Layout
      </button>

      <div class="sl-issues">${buildIssueRows(data)}</div>

      <div class="sl-actions">
        <button class="sl-btn" id="__sl_j__" style="background:#ff6b9d">
          ${ICO.download}
          Export JSON
        </button>
        <button class="sl-btn" id="__sl_n__" style="background:#c44dff">
          ${ICO.document}
          View Report
        </button>
      </div>

    </div>
  `;
}
function createPanel(report, data, onClose, onViewReport) {
  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.innerHTML = buildPanelHTML(report, data);
  document.body.appendChild(panel);
  document.getElementById("__sl_x__")?.addEventListener("click", onClose);
  setupGhostToggle();
  setupExportButton(report);
  document.getElementById("__sl_n__")?.addEventListener("click", onViewReport);
  return panel;
}
function buildNoteLines(report, data) {
  const { spIssues, ctIssues, a11yIssues } = data;
  const { summary, timestamp, url } = report;
  const lines = [];
  lines.push(`Generated: ${new Date(timestamp).toLocaleString()}`);
  lines.push(`Page:      ${url}`);
  lines.push(``);
  lines.push(`━━━  Summary  ━━━`);
  lines.push(`Spacing issues  : ${summary.spacing}`);
  lines.push(`Contrast issues : ${summary.contrast}`);
  lines.push(`A11y issues     : ${summary.accessibility}`);
  if (spIssues.length > 0) {
    lines.push(``);
    lines.push(`━━━  Spacing (not a multiple of 8 px)  ━━━`);
    spIssues.forEach((s, i) => {
      const qualifier = s.id ? ` #${s.id}` : s.cls ? ` .${s.cls}` : "";
      lines.push(`${i + 1}. &lt;${s.tag}&gt;${qualifier}`);
    });
  }
  if (ctIssues.length > 0) {
    lines.push(``);
    lines.push(`━━━  Contrast (ratio below 4.5 : 1)  ━━━`);
    ctIssues.forEach((c, i) => {
      lines.push(`${i + 1}. Ratio ${c.ratio} — "${c.text}"`);
    });
  }
  if (a11yIssues.length > 0) {
    lines.push(``);
    lines.push(`━━━  Accessibility  ━━━`);
    a11yIssues.forEach((a, i) => {
      lines.push(`${i + 1}. ${a.type}: ${a.el}`);
    });
  }
  const hasNoIssues = spIssues.length === 0 && ctIssues.length === 0 && a11yIssues.length === 0;
  if (hasNoIssues) {
    lines.push(``);
    lines.push(`✦ No issues found — great work! ✦`);
  }
  return lines;
}
function buildNoteHTML(report, lines) {
  const isTooLong = report.url.length > 55;
  const shortURL = isTooLong ? report.url.slice(0, 55) + "…" : report.url;
  const closeIconSVG = `
    <svg
      width="13" height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    >
      <line x1="18" y1="6"  x2="6"  y2="18"/>
      <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>
  `;
  return `
    <!-- corner fold decoration -->
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 32px 32px 0;
      border-color: transparent #fde8f0 transparent transparent;
      z-index: 2;
    "></div>

    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #ff6b9d 0%, #ff6b9d 50%, transparent 50%);
      border-radius: 0 0 4px 0;
      z-index: 1;
    "></div>

    <!-- header bar -->
    <div style="
      background: linear-gradient(135deg, #ff6b9d, #c44dff);
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    ">
      <div>
        <div style="
          font-family: system-ui, sans-serif;
          font-weight: 800;
          font-size: 15px;
          color: #fff;
          letter-spacing: .3px;
        ">
          ✦ StarLint Report
        </div>
        <div style="
          font-family: system-ui, sans-serif;
          font-size: 11px;
          color: rgba(255, 255, 255, .75);
          margin-top: 2px;
        ">
          ${shortURL}
        </div>
      </div>

      <button id="__sl_nc__" style="
        background: rgba(255, 255, 255, .25);
        border: none;
        color: #fff;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      ">
        ${closeIconSVG}
      </button>
    </div>

    <!-- lined paper body -->
    <div style="
      overflow-y: auto;
      flex: 1;
      padding: 24px 28px 28px;
      background: repeating-linear-gradient(#fffdf5 0px, #fffdf5 27px, #e8dff5 28px);
      background-size: 100% 28px;
      line-height: 28px;
    ">
      <div style="
        color: #2d1b4e;
        font-size: 12.5px;
        white-space: pre-wrap;
        word-break: break-word;
      ">
${lines.join("\n")}
      </div>
    </div>

    <!-- footer strip -->
    <div style="
      background: #fef0f6;
      border-top: 1px solid #f5d0e8;
      padding: 10px 20px;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      color: #9b6b8a;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    ">
      <span>✦ DesignLint — Grammarly for Web Design</span>

      <button id="__sl_nc2__" style="
        background: transparent;
        border: 1.5px solid #c44dff;
        color: #c44dff;
        border-radius: 99px;
        padding: 4px 14px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 700;
        font-family: inherit;
      ">
        Close
      </button>
    </div>
  `;
}
function createNoteCard(report, lines) {
  const card = document.createElement("div");
  card.id = NOTE_ID;
  card.style.position = "relative";
  card.style.width = "min(620px, 92vw)";
  card.style.maxHeight = "80vh";
  card.style.background = "#fffdf5";
  card.style.borderRadius = "4px 16px 16px 16px";
  card.style.boxShadow = "0 24px 64px rgba(0,0,0,.55), 0 0 0 1px rgba(255,107,157,.3)";
  card.style.overflow = "hidden";
  card.style.display = "flex";
  card.style.flexDirection = "column";
  card.style.animation = "sl-note-in .28s cubic-bezier(.34,1.56,.64,1)";
  card.style.fontFamily = "'Courier New', Courier, monospace";
  card.innerHTML = buildNoteHTML(report, lines);
  return card;
}
function createBackdrop() {
  const backdrop = document.createElement("div");
  backdrop.id = BACKDROP_ID;
  backdrop.style.position = "fixed";
  backdrop.style.inset = "0";
  backdrop.style.zIndex = "2147483646";
  backdrop.style.background = "rgba(10, 5, 20, .65)";
  backdrop.style.backdropFilter = "blur(5px)";
  backdrop.style.display = "flex";
  backdrop.style.alignItems = "center";
  backdrop.style.justifyContent = "center";
  backdrop.style.animation = "sl-fade .2s ease";
  backdrop.innerHTML = `
    <style>
      @keyframes sl-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes sl-note-in {
        from { opacity: 0; transform: scale(.94) translateY(12px); }
        to   { opacity: 1; transform: scale(1)   translateY(0); }
      }
    </style>
  `;
  return backdrop;
}
function showNoteModal(report, data) {
  const alreadyOpen = document.getElementById(NOTE_ID) !== null;
  if (alreadyOpen) {
    return;
  }
  const lines = buildNoteLines(report, data);
  const backdrop = createBackdrop();
  const noteCard = createNoteCard(report, lines);
  backdrop.appendChild(noteCard);
  document.body.appendChild(backdrop);
  function closeNote() {
    backdrop.remove();
  }
  document.getElementById("__sl_nc__")?.addEventListener("click", closeNote);
  document.getElementById("__sl_nc2__")?.addEventListener("click", closeNote);
  backdrop.addEventListener("click", (e) => {
    const clickedOutside = e.target === backdrop;
    if (clickedOutside) {
      closeNote();
    }
  });
}
function dismissAll() {
  document.getElementById(PANEL_ID)?.remove();
  document.getElementById(NOTE_ID)?.remove();
  document.getElementById(BACKDROP_ID)?.remove();
  document.getElementById(SNAP_ID)?.remove();
  document.getElementById(GHOST_ID)?.remove();
  document.querySelectorAll("[class*=__sl_s_]").forEach((el) => {
    const allClasses = Array.from(el.classList);
    const markerClasses = allClasses.filter((c) => c.startsWith("__sl_s_"));
    markerClasses.forEach((cls) => {
      el.classList.remove(cls);
    });
  });
}
function runAudit() {
  const alreadyRunning = document.getElementById(PANEL_ID) !== null;
  if (alreadyRunning) {
    dismissAll();
    return;
  }
  const allEls = Array.from(document.querySelectorAll("*"));
  const { issues: spIssues, snapStyle } = analyzeSpacing(allEls);
  const ctIssues = analyzeContrast(allEls);
  const a11yIssues = analyzeA11y();
  snapStyle.textContent = snapStyle.textContent ?? "";
  document.head.appendChild(snapStyle);
  const data = {
    spIssues,
    ctIssues,
    a11yIssues
  };
  const report = buildReport(data);
  function handleClose() {
    dismissAll();
  }
  function handleViewReport() {
    showNoteModal(report, data);
  }
  createPanel(
    report,
    data,
    handleClose,
    handleViewReport
  );
}

window.runAudit = runAudit;
export { runAudit as r };
runAudit();
