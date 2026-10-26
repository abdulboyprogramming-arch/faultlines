"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { useT } from "@/lib/use-i18n";

/**
 * Strata Drop — Fault Lines' own mini game (100% programmatic canvas,
 * zero assets, works fully offline). Catch falling "solid understanding"
 * (slate, +10) and "partial ideas" (ochre, +5) in your core-sample tray;
 * dodge rust fault-cracks (3 hits = the section collapses). Speed rises
 * with score. Mouse / touch / ← → keys. High score kept locally.
 *
 * Lives on the 404 page, the error page, /offline and /play.
 */
type TileKind = "solid" | "partial" | "crack";
interface Tile { x: number; y: number; r: number; vy: number; kind: TileKind; rot: number }

const COLORS = { solid: "#3E5C63", partial: "#C98A2E", crack: "#B5471F", ink: "#14110E", paper: "#F4F1EA", card: "#FBFAF5" };

/** Canvas colours follow the live design tokens, so the game matches dark mode. */
function readPalette() {
  if (typeof window === "undefined") return COLORS;
  const read = (name: string, fallback: string) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  };
  return {
    solid: read("--color-slate", COLORS.solid),
    partial: read("--color-ochre", COLORS.partial),
    crack: read("--color-rust", COLORS.crack),
    ink: read("--color-ink", COLORS.ink),
    paper: read("--color-paper", COLORS.paper),
    card: read("--color-card", COLORS.card),
  };
}

export default function StrataGame({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "playing" | "paused" | "over">("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [best, setBest] = useState(() =>
    typeof window === "undefined" ? 0 : Number(localStorage.getItem("faultlines-game-best") ?? 0) || 0);
  const game = useRef({ tiles: [] as Tile[], trayX: 0.5, targetX: 0.5, last: 0, spawn: 0, score: 0, lives: 3, shake: 0, keys: new Set<string>() });

  const endGame = useCallback((final: number) => {
    setState("over");
    setBest((b) => {
      const next = Math.max(b, final);
      try { localStorage.setItem("faultlines-game-best", String(next)); } catch { /* private mode */ }
      return next;
    });
  }, []);

  const start = useCallback(() => {
    game.current = { tiles: [], trayX: 0.5, targetX: 0.5, last: performance.now(), spawn: 0, score: 0, lives: 3, shake: 0, keys: new Set() };
    setScore(0);
    setLives(3);
    setState("playing");
  }, []);

  useEffect(() => {
    if (state !== "playing") return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLORS = readPalette();
    let raf = 0;
    let W = 0, H = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = Math.round(W * (compact ? 0.78 : 0.62));
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const spawnTile = () => {
      const roll = Math.random();
      const kind: TileKind = roll < 0.42 ? "solid" : roll < 0.72 ? "partial" : "crack";
      game.current.tiles.push({
        x: 24 + Math.random() * (W - 48),
        y: -20,
        r: 11 + Math.random() * 6,
        vy: 90 + Math.random() * 60 + game.current.score * 0.9,
        kind,
        rot: Math.random() * Math.PI,
      });
    };

    const frame = (now: number) => {
      const g = game.current;
      const dt = Math.min(0.05, (now - g.last) / 1000);
      g.last = now;

      // keyboard movement
      if (g.keys.has("ArrowLeft") || g.keys.has("a")) g.targetX = Math.max(0, g.targetX - dt * 1.6);
      if (g.keys.has("ArrowRight") || g.keys.has("d")) g.targetX = Math.min(1, g.targetX + dt * 1.6);
      g.trayX += (g.targetX - g.trayX) * Math.min(1, dt * 14);

      g.spawn -= dt;
      if (g.spawn <= 0) { spawnTile(); g.spawn = Math.max(0.34, 0.85 - g.score * 0.004); }

      const trayW = Math.max(64, W * 0.16);
      const trayH = 12;
      const trayX = g.trayX * (W - trayW);
      const trayY = H - 26;

      // update tiles
      const kept: Tile[] = [];
      for (const tile of g.tiles) {
        tile.y += tile.vy * dt;
        tile.rot += dt * 1.5;
        const caught = tile.y + tile.r >= trayY && tile.y - tile.r <= trayY + trayH && tile.x >= trayX - 6 && tile.x <= trayX + trayW + 6;
        if (caught) {
          if (tile.kind === "crack") {
            g.lives -= 1;
            g.shake = reduced ? 0 : 8;
            setLives(g.lives);
            if (g.lives <= 0) { setScore(g.score); endGame(g.score); return; }
          } else {
            g.score += tile.kind === "solid" ? 10 : 5;
            setScore(g.score);
          }
          continue;
        }
        if (tile.y - tile.r <= H + 24) kept.push(tile);
      }
      g.tiles = kept;
      g.shake = Math.max(0, g.shake - dt * 26);

      // ---- draw ----
      ctx.save();
      if (g.shake > 0) ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
      ctx.fillStyle = COLORS.card;
      ctx.fillRect(-10, -10, W + 20, H + 20);
      // strata backdrop bands with a fault crack
      const bands: [string, number][] = [["#B5471F", 0.13], ["#C98A2E", 0.10], ["#3E5C63", 0.10], ["#14110E", 0.16]];
      let y = H;
      for (const [c, a] of bands) { ctx.globalAlpha = a; ctx.fillStyle = c; const bh = H * 0.09; y -= bh; ctx.fillRect(0, y, W, bh); }
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(W * 0.62, 0); ctx.lineTo(W * 0.58, H * 0.3); ctx.lineTo(W * 0.64, H * 0.55); ctx.lineTo(W * 0.57, H * 0.8); ctx.lineTo(W * 0.6, H);
      ctx.stroke();
      ctx.globalAlpha = 1;

      for (const tile of g.tiles) {
        ctx.save();
        ctx.translate(tile.x, tile.y);
        ctx.fillStyle = COLORS[tile.kind];
        if (tile.kind === "crack") {
          ctx.rotate(tile.rot);
          ctx.beginPath();
          ctx.moveTo(-tile.r, -tile.r * 0.3); ctx.lineTo(-tile.r * 0.3, -tile.r); ctx.lineTo(tile.r * 0.35, -tile.r * 0.25);
          ctx.lineTo(tile.r, -tile.r * 0.7); ctx.lineTo(tile.r * 0.7, tile.r * 0.5); ctx.lineTo(0, tile.r); ctx.lineTo(-tile.r * 0.7, tile.r * 0.45);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = COLORS.paper; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(-tile.r * 0.5, -tile.r * 0.5); ctx.lineTo(0, 0); ctx.lineTo(-tile.r * 0.2, tile.r * 0.6); ctx.stroke();
        } else if (tile.kind === "solid") {
          ctx.beginPath(); ctx.arc(0, 0, tile.r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = COLORS.paper;
          ctx.beginPath(); ctx.arc(0, 0, tile.r * 0.38, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.rotate(tile.rot);
          ctx.fillRect(-tile.r * 0.85, -tile.r * 0.85, tile.r * 1.7, tile.r * 1.7);
          ctx.fillStyle = COLORS.paper;
          ctx.fillRect(-tile.r * 0.3, -tile.r * 0.3, tile.r * 0.6, tile.r * 0.6);
        }
        ctx.restore();
      }

      // core-sample tray
      ctx.fillStyle = COLORS.ink;
      ctx.beginPath();
      ctx.roundRect(trayX, trayY, trayW, trayH, 5);
      ctx.fill();
      ctx.fillStyle = COLORS.paper;
      ctx.fillRect(trayX + 5, trayY + 3.5, trayW - 10, 2.4);
      ctx.fillStyle = COLORS.crack;
      ctx.fillRect(trayX, trayY + trayH - 2.5, trayW, 2.5);
      ctx.restore();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const move = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      game.current.targetX = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    };
    const onMouse = (e: MouseEvent) => move(e.clientX);
    const onTouch = (e: TouchEvent) => { if (e.touches[0]) move(e.touches[0].clientX); };
    const down = (e: KeyboardEvent) => { game.current.keys.add(e.key); if (e.key.startsWith("Arrow")) e.preventDefault(); };
    const up = (e: KeyboardEvent) => game.current.keys.delete(e.key);
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [state, compact, endGame]);


  return (
    <section className="card p-4 sm:p-5" aria-label={t("playGame")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9" variant="static" />
          <div>
            <h2 className="font-display text-lg font-semibold leading-tight">Strata Drop</h2>
            <p className="text-xs text-ink/55">{t("gameTagline")}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 font-ui text-sm tabular-nums" aria-live="polite">
          <span>
            {t("gameScore")} <strong className="tabular-nums">{score}</strong>
          </span>
          <span aria-label={t("gameLives", { n: lives })}>{"♥".repeat(Math.max(0, lives))}<span className="opacity-25">{"♥".repeat(Math.max(0, 3 - lives))}</span></span>
          <span className="text-ink/50">
            {t("gameBest")} <strong className="tabular-nums">{best}</strong>
          </span>
        </div>
      </div>

      <div ref={wrapRef} className="relative w-full touch-none select-none overflow-hidden rounded-lg border border-ink/10">
        <canvas ref={canvasRef} className="block w-full" style={{ minHeight: 220 }} tabIndex={0} aria-label={t("gameAria")} />
        {state !== "playing" && (
          <div className="absolute inset-0 bg-paper/85 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 text-center px-6 animate-fade-in">
            {state === "over" ? (
              <>
                <p className="font-display text-2xl">{t("gameOver")}</p>
                <p className="text-sm text-ink/70">{t("gameOverBody", { score, best })}</p>
              </>
            ) : state === "paused" ? (
              <p className="font-display text-2xl">{t("gamePaused")}</p>
            ) : (
              <>
                <p className="font-display text-2xl">Strata Drop</p>
                <p className="text-sm text-ink/70 max-w-sm">{t("gameHint")}</p>
              </>
            )}
            <button type="button" onClick={start} className="btn btn-primary">
              {state === "over" ? t("gameAgain") : state === "paused" ? t("gameRestart") : t("gameStart")}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        {state === "playing" && (
          <button type="button" onClick={() => setState("paused")} className="btn btn-outline btn-sm">
            {t("gamePause")}
          </button>
        )}
        {state === "paused" && (
          <button type="button" onClick={() => { game.current.last = performance.now(); setState("playing"); }} className="btn btn-primary btn-sm">
            {t("gameResume")}
          </button>
        )}
        <p className="text-xs text-ink/50 self-center">{t("gameFoot")}</p>
      </div>
    </section>
  );
}
