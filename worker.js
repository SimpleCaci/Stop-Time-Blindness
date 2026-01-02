let canvas, ctx, W, H, fps;
let running = false;
let startMs = 0;
let durationMs = 0;
let label = "Task";

// Draw loop via setInterval (often keeps ticking more than rAF when tab is hidden)
let intervalId = null;

function fmt(sec) {
  sec = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function drawFrame() {
  if (!ctx) return;

  const now = performance.now();
  const elapsed = now - startMs;
  const remaining = Math.max(0, durationMs - elapsed);
  const frac = durationMs ? Math.min(1, elapsed / durationMs) : 0;

  // background
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, W, H);

  // label
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "28px system-ui";
  ctx.fillText(label, 24, 48);

  // timer text
  ctx.fillStyle = "#ffffff";
  ctx.font = "92px system-ui";
  ctx.fillText(fmt(remaining / 1000), 24, 160);

  // progress ring
  const cx = W - 120;
  const cy = 120;
  const r = 70;

  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
  ctx.stroke();

  // subtle "alive" indicator so frames are obviously updating
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "18px system-ui";
  ctx.fillText("frames: " + Math.floor(now / 1000), 24, H - 24);

  if (running && remaining <= 0) running = false;
}

self.onmessage = (e) => {
  const msg = e.data;

  if (msg.type === "init") {
    canvas = msg.canvas;
    W = msg.width;
    H = msg.height;
    fps = msg.fps || 30;

    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext("2d");

    startMs = performance.now();
    durationMs = 10_000;
    label = "Ready";
    running = true;

    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(drawFrame, 1000 / fps);

    self.postMessage({ type: "log", msg: "initialized and drawing" });
    return;
  }

  if (msg.type === "startTimer") {
    label = msg.label ?? "Task";
    startMs = performance.now();
    durationMs = (msg.durationSec ?? 1500) * 1000;
    running = true;
    drawFrame();
    self.postMessage({ type: "log", msg: "timer started" });
    return;
  }

  if (msg.type === "stopTimer") {
    running = false;
    self.postMessage({ type: "log", msg: "timer stopped" });
    return;
  }
};
