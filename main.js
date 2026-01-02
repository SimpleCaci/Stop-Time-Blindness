(() => {
  const FPS = 30;

  const canvas = document.getElementById("myCanvas");
  const video  = document.getElementById("myVideo");
  const start  = document.getElementById("start");
  const stop   = document.getElementById("stop");

  if (!canvas || !video || !start || !stop) {
    throw new Error("Missing #myCanvas, #myVideo, #start, or #stop.");
  }

  // Basic capability logs
  console.log("secureContext:", window.isSecureContext);
  console.log("pipEnabled:", document.pictureInPictureEnabled);
  console.log("hasPiP:", typeof video.requestPictureInPicture === "function");
  console.log("hasOffscreen:", typeof canvas.transferControlToOffscreen === "function");

  // Stream comes from the DOM canvas
  const stream = canvas.captureStream(FPS);
  console.log("stream tracks:", stream.getTracks().map(t => ({ kind: t.kind, readyState: t.readyState })));

  // Worker rendering (OffscreenCanvas)
  let worker = null;
  if (canvas.transferControlToOffscreen) {
    worker = new Worker("./worker.js"); // classic worker (more reliable than module workers)
    worker.onerror = (e) => console.error("WORKER ERROR:", e.message || e);
    worker.onmessage = (e) => {
      if (e.data?.type === "log") console.log("worker:", e.data.msg);
    };

    const off = canvas.transferControlToOffscreen();
    worker.postMessage(
      { type: "init", canvas: off, width: canvas.width, height: canvas.height, fps: FPS },
      [off]
    );

    // Start drawing immediately so the stream has frames before PiP request
    worker.postMessage({ type: "startTimer", label: "Focus", durationSec: 25 * 60 });
  } else {
    // Fallback: draw on main thread (will throttle in hidden tabs)
    console.warn("OffscreenCanvas not supported; using main-thread draw fallback.");
    let startMs = performance.now();
    function draw() {
      const now = performance.now();
      const elapsed = (now - startMs) / 1000;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0b1020";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "72px system-ui";
      ctx.fillText(elapsed.toFixed(1) + "s", 24, 120);

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  async function startPiP() {
    // Attach the stream to video
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    // Ensure the video has metadata before play/PiP
    await new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("timeout waiting for loadedmetadata")), 2000);
      video.onloadedmetadata = () => { clearTimeout(t); res(); };
    });

    // Start playback
    await video.play();

    // Enter PiP
    if (!document.pictureInPictureEnabled || typeof video.requestPictureInPicture !== "function") {
      throw new Error("PiP unsupported/disabled in this browser.");
    }
    await video.requestPictureInPicture();
  }

  function stopAll() {
    if (worker) worker.postMessage({ type: "stopTimer" });

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }

    // Do NOT stop stream tracks if you want to restart later; just detach
    video.pause();
    video.srcObject = null;
  }

  start.addEventListener("click", async () => {
    try {
      // Attach the stream to video
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      
      await video.requestPictureInPicture();
      await startPiP();
      console.log("✅ PiP started");
    } catch (e) {
      console.error("❌ PiP failed:", e.name, e.message);
      console.log("debug:", {
        readyState: video.readyState,
        videoW: video.videoWidth,
        videoH: video.videoHeight,
        tracks: stream.getVideoTracks().length,
        secure: window.isSecureContext,
        pipEnabled: document.pictureInPictureEnabled
      });
    }
  });

  stop.addEventListener("click", stopAll);
})();
