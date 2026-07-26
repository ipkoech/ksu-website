const ACCESSIBILITY_INIT_SOURCE = String.raw`
(() => {
  try {
    const raw = window.localStorage.getItem("ksu:accessibility:v1");
    if (!raw) return;
    const value = JSON.parse(raw);
    if (!value || value.version !== 1) return;
    const root = document.documentElement;
    const enums = {
      textScale: ["large", "larger", "largest"],
      contrast: ["increased", "high"],
      lineHeight: ["relaxed"],
      letterSpacing: ["increased"],
      wordSpacing: ["increased"]
    };
    const attributes = {
      textScale: "data-a11y-text-scale",
      contrast: "data-a11y-contrast",
      readableFont: "data-a11y-readable-font",
      lineHeight: "data-a11y-line-height",
      letterSpacing: "data-a11y-letter-spacing",
      wordSpacing: "data-a11y-word-spacing",
      emphasizeLinks: "data-a11y-emphasize-links",
      largeTargets: "data-a11y-large-targets",
      reduceMotion: "data-a11y-reduce-motion",
      pauseMotion: "data-a11y-pause-motion"
    };
    for (const [key, attribute] of Object.entries(attributes)) {
      if (Object.prototype.hasOwnProperty.call(enums, key)) {
        if (enums[key].includes(value[key])) root.setAttribute(attribute, value[key]);
      } else if (value[key] === true) {
        root.setAttribute(attribute, "true");
      }
    }
  } catch {
    // Accessibility preferences are optional; defaults remain usable.
  }
})();
`;

export function AccessibilityInitScript() {
  return (
    <script
      id="ksu-accessibility-init"
      dangerouslySetInnerHTML={{ __html: ACCESSIBILITY_INIT_SOURCE }}
    />
  );
}
