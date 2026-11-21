"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useId, useRef, type CSSProperties, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const RANGE_MAX = 1000;
type Station = { id: string; number: string; date: string; title: string };

function seek(trigger: ScrollTrigger, position: number) {
  window.scrollTo({ top: Math.round(position), behavior: "instant" });
  trigger.update();
}

export function TimelineMotion({ children, labels, stations }: {
  children: ReactNode;
  labels: { title: string; newest: string; oldest: string };
  stations: readonly Station[];
}) {
  const root = useRef<HTMLElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const navigation = useRef<{ trigger: ScrollTrigger; step: (direction: number) => void } | null>(null);
  const rangeId = useId();

  useGSAP(() => {
    const scope = root.current;
    const slider = range.current;
    if (!scope || !slider) return;
    const query = <T extends HTMLElement>(selector: string) => scope.querySelector<T>(selector);
    const entries = Array.from(scope.querySelectorAll<HTMLElement>("[data-log-entry]"));
    const ticks = Array.from(scope.querySelectorAll<HTMLElement>("[data-log-tick]"));
    const controls = query(".log-controls");
    const rail = query(".log-rail");
    const fill = query(".log-rail-fill");
    const cursor = query(".log-cursor");
    const trackFill = query(".log-spine-fill");
    const date = query("[data-log-date]");
    const number = query("[data-log-number]");
    if (!controls || !rail || !fill || !cursor || !trackFill || !date || !number || !entries.length) return;

    const media = gsap.matchMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
      const animated = conditions?.motion === true;
      scope.dataset.timelineReady = "";
      let offsets: number[] = [];
      let selected = -1;
      let railWidth = 0;
      // Read geometry only on refresh. The activation line always clears the sticky controls.
      const focusLine = () => Math.max(controls.offsetHeight + 36, Math.min(window.innerHeight * .35, 300));
      const stopAt = (entry: HTMLElement) => entry.getBoundingClientRect().top + window.scrollY - focusLine();
      const paintRail = gsap.quickSetter(fill, "scaleX");
      const paintSpine = gsap.quickSetter(trackFill, "scaleY");
      const setCursor = gsap.quickSetter(cursor, "x", "px");
      const paint = (progress: number) => {
        paintRail(progress);
        paintSpine(progress);
        setCursor(progress * railWidth);
      };
      const sync = ({ progress, start, end }: ScrollTrigger) => {
        slider.valueAsNumber = Math.round(progress * RANGE_MAX);
        if (!animated) paint(progress);
        const position = start + progress * (end - start);
        const index = Math.max(0, offsets.findLastIndex(offset => offset <= position + 1));
        if (index === selected) return;
        if (selected !== -1) {
          delete entries[selected].dataset.logCurrent;
          ticks[selected]?.removeAttribute("data-current");
        }
        selected = index;
        const station = stations[index];
        entries[index].dataset.logCurrent = "";
        ticks[index]?.setAttribute("data-current", "");
        number.textContent = station.number;
        date.textContent = station.date;
        slider.setAttribute("aria-valuetext", `${station.date} · ${station.title}`);
      };

      const playhead = { progress: 0 };
      const sweep = animated ? gsap.to(playhead, {
        progress: 1, ease: "none", paused: true,
        onUpdate: () => paint(playhead.progress),
      }) : undefined;
      const travel = ScrollTrigger.create({
        trigger: scope,
        start: () => Math.max(0, Math.floor(stopAt(entries[0]))),
        end: () => Math.min(ScrollTrigger.maxScroll(window), Math.ceil(stopAt(entries.at(-1)!))),
        animation: sweep,
        scrub: animated ? .23 : undefined,
        onUpdate: sync,
        onRefresh: trigger => {
          railWidth = rail.clientWidth;
          paint(trigger.progress);
          offsets = entries.map(entry => gsap.utils.clamp(trigger.start, trigger.end, stopAt(entry)));
          const distance = Math.max(1, trigger.end - trigger.start);
          offsets.forEach((offset, index) => ticks[index]?.style.setProperty("--stop", `${100 * (offset - trigger.start) / distance}%`));
          trackFill.parentElement?.style.setProperty("--log-spine-length", `${entries.at(-1)!.offsetTop - entries[0].offsetTop}px`);
          sync(trigger);
        },
      });
      navigation.current = {
        trigger: travel,
        step: direction => {
          const next = gsap.utils.clamp(0, offsets.length - 1, selected + direction);
          if (next !== selected && offsets[next] !== undefined) seek(travel, offsets[next]);
        },
      };
      sync(travel);

      if (animated) {
        for (const entry of entries) {
          const heading = entry.querySelector("h2");
          const trace = entry.querySelector(".log-sweep");
          if (!heading || !trace) continue;
          gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: entry, start: "top 94%", end: "bottom 4%", scrub: .25 },
          })
            .fromTo(heading, { opacity: .68 }, { opacity: 1, duration: .28 }, 0)
            .fromTo(trace, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: .43, ease: "power2.out" }, 0)
            .to(trace, { opacity: 0, duration: .34 }, .66)
            .to(heading, { opacity: .68, duration: .22 }, .78);
        }
      }

      let frame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      observer.observe(scope);
      observer.observe(controls);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        navigation.current = null;
        delete scope.dataset.timelineReady;
        for (const entry of entries) delete entry.dataset.logCurrent;
        for (const tick of ticks) {
          tick.removeAttribute("data-current");
          tick.style.removeProperty("--stop");
        }
        slider.removeAttribute("aria-valuetext");
        slider.valueAsNumber = 0;
        number.textContent = stations[0].number;
        date.textContent = stations[0].date;
        fill.style.removeProperty("transform");
        cursor.style.removeProperty("transform");
        trackFill.style.removeProperty("transform");
        trackFill.parentElement?.style.removeProperty("--log-spine-length");
      };
    });
    return () => media.revert();
  }, { scope: root, dependencies: [stations], revertOnUpdate: true });

  return <section ref={root} id="log-timeline" className="log-timeline" aria-label={labels.title}>
    <div className="log-controls">
      <div className="log-control-heading">
        <span className="log-control-label" id={`${rangeId}-label`}>{labels.title}</span>
        <span className="log-readout" aria-hidden="true"><strong data-log-number>{stations[0].number}</strong><span>/ {stations.at(-1)?.number}</span></span>
      </div>
      <div className="log-scrubber">
        <div className="log-rail" aria-hidden="true">
          <span className="log-rail-fill" />
          {stations.map((station, index) => <span key={station.id} data-log-tick style={{ "--fallback-stop": `${index / Math.max(1, stations.length - 1) * 100}%` } as CSSProperties} />)}
          <span className="log-cursor" />
        </div>
        <input aria-labelledby={`${rangeId}-label`} ref={range} type="range" min={0} max={RANGE_MAX} defaultValue={0}
          onKeyDown={event => {
            const direction = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[event.key];
            if (!direction || !navigation.current) return;
            event.preventDefault();
            navigation.current.step(direction);
          }}
          onChange={event => {
            const trigger = navigation.current?.trigger;
            if (!trigger) return;
            const progress = event.currentTarget.valueAsNumber / RANGE_MAX;
            // Native scrolling stays in charge; the GSAP playhead eases to the new position.
            seek(trigger, trigger.start + progress * (trigger.end - trigger.start));
          }} />
        <div className="log-range-ends" aria-hidden="true"><span>{labels.newest}</span><span>{labels.oldest}</span></div>
      </div>
      <span className="log-control-date" aria-hidden="true" data-log-date>{stations[0].date}</span>
    </div>
    <div className="log-track">
      <div className="log-spine" aria-hidden="true"><span className="log-spine-fill" /></div>
      {children}
    </div>
  </section>;
}
