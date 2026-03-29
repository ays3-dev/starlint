# ✨ Starlint | Accessibility & UI Friction Auditor

**Starlint** is a high-performance, vanilla JavaScript utility designed to identify accessibility gaps and UI friction points in modern web interfaces. It specifically targets contrast ratios, interactive element scaling, and visual hierarchy to ensure a seamless experience for all users.

<p align="center">
  <img src="https://kaplumbagadeden.neocities.org/starlint1.png" alt="Screenshot of Starlint" width="600"><br>
  🌐 <a href="https://starlint.netlify.app/"><b>Live Demo</b></a>
</p>

---

## **🚀 Key Features**

- **Universal Bookmarklet Integration:** Designed to run on any live website via the browser's bookmark bar, injecting the audit engine into the active DOM.
- **Cross-Domain Compatibility:** Engineered to handle varying site architectures without interfering with existing site scripts.
- **Modular Architecture:** Logic is decoupled into dedicated modules (Lint, UI, Theme) for high maintainability and scalability.
- **Accessibility Check (A11y):** Real-time auditing of DOM elements to detect low contrast and missing ARIA attributes.
- **Zero-Dependency Core:** Engineered entirely in Vanilla JS (ES6+) to ensure zero bloat and maximum execution speed.
- **Visual Friction Analysis:** Identifies elements that might cause "interaction fatigue" or visual overload in complex layouts.

---

## **🛠️ Tech Stack**

* **Execution Method:** JavaScript Bookmarklet (Browser-based injection)

* **Frontend:** HTML5, CSS3 (Shadow DOM implementation for style isolation)

* **Logic:** Vanilla JavaScript (Modular ES6+)

* **Deployment:** Netlify (for hosting the remote script assets)

---

## **⚙️ Getting Started**

1. Visit the live demo: https://starlint.netlify.app
2. Drag the bookmarklet to your bookmarks bar **or** copy the code and paste it into a **new bookmark’s URL field**
3. Open any website
4. Click the bookmarklet to run the audit

> Once installed, StarLint works on any website — just click the bookmarklet to see your audit report.

---

## **📂 Project Structure**

├── scripts/                # Core Auditor Engine (Modular ES6)

│   ├── lint.js             # WCAG 2.1 auditing & accessibility logic

│   ├── ui.js               # Dashboard injection & DOM manipulation

│   ├── theme.js            # Glassmorphism & persistent state manager

│   └── script.js           # Main initialization & event orchestration

├── style.css               # Global auditor styles & responsive layout

├── index.html              # Landing page / Documentation entry point

└── bookmarklet.js          # The "Trigger" (Browser-side injection logic)

---

## 💡 How It Works

1. Script Injection & Execution: The bookmarklet serves as a wrapper that triggers a dynamic script tag injection into the active document's <head>.
2. Remote Module Loading: Utilizing a lightweight loader, it fetches the modular ES6 logic (lint.js, ui.js, theme.js) from the Netlify-hosted CDN to ensure the latest version is always executed.
3. DOM Traversal & Node Analysis: lint.js recursively traverses the active DOM tree, calculating WCAG 2.1 Contrast Ratios and identifying interactive elements lacking accessible names or ARIA roles.
4. Shadow DOM Overlay (UI): To prevent style leakage from the host website, the auditor interface is rendered as a decoupled UI overlay, providing a non-destructive analysis dashboard.
5. State Persistence: User-defined preferences are handled via localStorage, allowing the auditor's configuration to persist across different domains during a single session.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

