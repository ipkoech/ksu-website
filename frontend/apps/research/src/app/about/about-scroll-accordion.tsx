"use client";

import { useEffect, useRef, type ReactNode } from "react";

type PanelState = {
  panel: HTMLElement;
  content: HTMLElement;
  fullHeight: number;
};

const collapsedHeight = 96;
const scrollStep = 420;

export function AboutScrollAccordion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const runway = root.querySelector<HTMLElement>("[data-about-runway]");
    const sticky = root.querySelector<HTMLElement>("[data-about-sticky]");
    const stage = root.querySelector<HTMLElement>("[data-about-stage]");
    if (!runway || !sticky || !stage) return;

    const rootEl = root;
    const runwayEl = runway;
    const stickyEl = sticky;
    const stageEl = stage;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    let panels: PanelState[] = [];
    let cleanupFrame = 0;
    let startY = 0;
    let travel = 0;

    function reset() {
      window.cancelAnimationFrame(cleanupFrame);
      runwayEl.style.height = "";
      stickyEl.style.position = "";
      stickyEl.style.top = "";
      stageEl.style.height = "";
      panels.forEach(({ panel, content }) => {
        panel.style.height = "";
        panel.style.opacity = "";
        panel.style.overflow = "";
        content.style.transform = "";
        content.style.visibility = "";
        content.removeAttribute("aria-hidden");
      });
    }

    function clamp(value: number, min: number, max: number) {
      return Math.min(max, Math.max(min, value));
    }

    function measure() {
      panels = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-about-panel]"))
        .map((panel) => {
          const content = panel.querySelector<HTMLElement>("[data-about-panel-content]");
          return content
            ? {
                panel,
                content,
                fullHeight: Math.max(content.scrollHeight, collapsedHeight),
              }
            : null;
        })
        .filter((panel): panel is PanelState => Boolean(panel));

      if (panels.length < 2) return false;

      const maxFullHeight = Math.max(...panels.map((panel) => panel.fullHeight));
      const stageHeight = Math.round(maxFullHeight + collapsedHeight * (panels.length - 1));
      const stickyTop = clamp(Math.round((window.innerHeight - stageHeight) / 2), 16, 96);

      travel = scrollStep * (panels.length - 1);
      startY = window.scrollY + rootEl.getBoundingClientRect().top - stickyTop;

      runwayEl.style.height = `${stageHeight + travel + stickyTop}px`;
      stickyEl.style.position = "sticky";
      stickyEl.style.top = `${stickyTop}px`;
      stageEl.style.height = `${stageHeight}px`;

      panels.forEach(({ panel }) => {
        panel.style.overflow = "hidden";
      });

      return true;
    }

    function render() {
      if (!panels.length) return;

      const progress = clamp(window.scrollY - startY, 0, travel);
      const activePosition = travel === 0 ? 0 : progress / scrollStep;

      panels.forEach(({ panel, content, fullHeight }, index) => {
        const openness = clamp(1 - Math.abs(index - activePosition), 0, 1);
        const height = collapsedHeight + (fullHeight - collapsedHeight) * openness;
        const opacity = 0.45 + 0.55 * openness;
        const offset = Math.round((1 - openness) * 16);

        panel.style.height = `${Math.round(height)}px`;
        panel.style.opacity = `${opacity}`;
        content.style.transform = `translateY(${offset}px)`;
        content.style.visibility = openness > 0.04 ? "visible" : "hidden";
        content.setAttribute("aria-hidden", String(openness <= 0.04));
      });
    }

    function requestRender() {
      window.cancelAnimationFrame(cleanupFrame);
      cleanupFrame = window.requestAnimationFrame(render);
    }

    function setup() {
      reset();
      if (motionQuery.matches || !desktopQuery.matches) return;
      if (!measure()) return;
      render();
    }

    setup();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", setup);
    motionQuery.addEventListener("change", setup);
    desktopQuery.addEventListener("change", setup);

    return () => {
      reset();
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", setup);
      motionQuery.removeEventListener("change", setup);
      desktopQuery.removeEventListener("change", setup);
    };
  }, []);

  return (
    <div ref={rootRef} data-about-scroll-accordion>
      <div data-about-runway>
        <div data-about-sticky>
          <div data-about-stage className="space-y-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
