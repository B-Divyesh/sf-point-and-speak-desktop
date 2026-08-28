import "./style.css";
import "./extra.css";
import { createWorker, OEM, PSM, type Worker } from "tesseract.js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

const canvas = document.querySelector<HTMLCanvasElement>("#screen")!;
const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
const workspace = document.querySelector<HTMLElement>("#workspace")!;
const empty = document.querySelector<HTMLElement>("#empty")!;
const panel = document.querySelector<HTMLElement>("#result-panel")!;
const result = document.querySelector<HTMLTextAreaElement>("#result")!;
const status = document.querySelector<HTMLElement>("#status")!;
const speed = document.querySelector<HTMLInputElement>("#speed")!;
const speedValue = document.querySelector<HTMLOutputElement>("#speed-value")!;
const pinned = document.querySelector<HTMLElement>("#pinned")!;
const pinnedText = document.querySelector<HTMLElement>("#pinned-text")!;
let screenshot: HTMLImageElement | null = null;
let worker: Worker | null = null;
let start: { x: number; y: number } | null = null;
let end: { x: number; y: number } | null = null;

function setStatus(message: string) { status.textContent = message; }

function showScreen(dataUrl: string, message: string) {
  screenshot = new Image();
  screenshot.onload = () => {
    canvas.width = screenshot!.naturalWidth;
    canvas.height = screenshot!.naturalHeight;
    canvas.hidden = false;
    empty.hidden = true;
    draw();
    setStatus(message);
    canvas.focus();
  };
  screenshot.src = dataUrl;
}

async function captureScreen() {
  setStatus("Capturing your screen…");
  panel.hidden = true;
  try {
    const dataUrl = await invoke<string>("capture_desktop");
    showScreen(dataUrl, "Drag a rectangle around the text. Press Escape to cancel.");
  } catch (error) {
    setStatus(`The screen could not be captured. Allow screen recording in system settings, then try again. ${String(error)}`);
  }
}

function loadSample() {
  const sample = document.createElement("canvas");
  sample.width = 1200;
  sample.height = 720;
  const pen = sample.getContext("2d")!;
  pen.fillStyle = "#e9e5d6";
  pen.fillRect(0, 0, sample.width, sample.height);
  pen.fillStyle = "#163343";
  pen.fillRect(0, 0, sample.width, 82);
  pen.font = "bold 30px sans-serif";
  pen.fillStyle = "#ffffff";
  pen.fillText("FIELD STOCK / TERMINAL 4", 42, 52);
  pen.font = "bold 28px monospace";
  pen.fillStyle = "#163343";
  pen.fillText("REF       ITEM                    STATUS", 100, 190);
  pen.font = "30px monospace";
  const rows = [
    "R-1082    Valve housing           HOLD",
    "R-1083    Seal kit, 40 mm          READY",
    "R-1084    Pressure gauge           CHECK",
    "R-1085    Safety cover             READY",
  ];
  rows.forEach((row, index) => pen.fillText(row, 100, 260 + index * 78));
  pen.strokeStyle = "#007c91";
  pen.lineWidth = 4;
  pen.strokeRect(75, 140, 1000, 405);
  showScreen(sample.toDataURL("image/png"), "Sample screen loaded. Drag around one or more rows, or press Enter.");
}

function point(event: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(canvas.width, (event.clientX - rect.left) * canvas.width / rect.width)),
    y: Math.max(0, Math.min(canvas.height, (event.clientY - rect.top) * canvas.height / rect.height)),
  };
}

function draw() {
  if (!screenshot) return;
  ctx.drawImage(screenshot, 0, 0);
  if (start && end) {
    const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
    ctx.fillStyle = "rgba(4, 20, 28, .52)";
    ctx.fillRect(0, 0, canvas.width, y);
    ctx.fillRect(0, y + h, canvas.width, canvas.height - y - h);
    ctx.fillRect(0, y, x, h);
    ctx.fillRect(x + w, y, canvas.width - x - w, h);
    ctx.strokeStyle = "#42d8e9";
    ctx.lineWidth = Math.max(3, canvas.width / 600);
    ctx.strokeRect(x, y, w, h);
  }
}

async function recogniseSelection() {
  if (!start || !end) return;
  const x = Math.round(Math.min(start.x, end.x));
  const y = Math.round(Math.min(start.y, end.y));
  const width = Math.round(Math.abs(end.x - start.x));
  const height = Math.round(Math.abs(end.y - start.y));
  if (width < 12 || height < 12) {
    setStatus("That region is too small. Drag a larger rectangle around the text.");
    return;
  }
  setStatus("Reading the selected region on this device…");
  const crop = document.createElement("canvas");
  crop.width = width; crop.height = height;
  crop.getContext("2d")!.drawImage(canvas, x, y, width, height, 0, 0, width, height);
  try {
    if (!worker) {
      worker = await createWorker("eng", OEM.LSTM_ONLY, {
        workerPath: "/tesseract/worker.min.js",
        corePath: "/tesseract/tesseract-core-simd-lstm.wasm.js",
        langPath: "/tesseract",
        logger: ({ status: phase, progress }) => setStatus(`${phase} ${Math.round(progress * 100)}%`),
      });
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    }
    const { data } = await worker.recognize(crop);
    result.value = data.text.trim();
    panel.hidden = false;
    setStatus(result.value ? "Text is ready. Review it, then speak, copy, or pin it." : "No text was found. Try a tighter region with larger text.");
    result.focus();
  } catch (error) {
    setStatus(`The text could not be read. Try the region again. ${String(error)}`);
  }
}

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId); start = point(event); end = start; draw();
});
canvas.addEventListener("pointermove", (event) => { if (start) { end = point(event); draw(); } });
canvas.addEventListener("pointerup", async (event) => { end = point(event); await recogniseSelection(); start = null; end = null; });
canvas.addEventListener("keydown", (event) => {
  if (!screenshot) return;
  if (event.key === "Enter") { start = { x: canvas.width * .2, y: canvas.height * .3 }; end = { x: canvas.width * .8, y: canvas.height * .7 }; draw(); void recogniseSelection(); }
});

document.querySelector("#capture")!.addEventListener("click", captureScreen);
document.querySelector("#sample")!.addEventListener("click", loadSample);
document.querySelector("#again")!.addEventListener("click", captureScreen);
document.querySelector("#speak")!.addEventListener("click", () => {
  speechSynthesis.cancel();
  if (!result.value.trim()) { setStatus("There is no text to speak. Capture a region first."); return; }
  const utterance = new SpeechSynthesisUtterance(result.value);
  utterance.rate = Number(speed.value);
  utterance.onend = () => setStatus("Finished speaking.");
  speechSynthesis.speak(utterance); setStatus("Speaking. Choose Speak text again to restart.");
});
document.querySelector("#copy")!.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(result.value); setStatus("Text copied to the clipboard."); }
  catch { setStatus("The text could not be copied. Select it and press Ctrl+C or Command+C."); }
});
document.querySelector("#pin")!.addEventListener("click", () => {
  pinnedText.textContent = result.value; pinned.hidden = false; setStatus("Result pinned until this window closes.");
});
document.querySelector("#unpin")!.addEventListener("click", () => { pinned.hidden = true; pinnedText.textContent = ""; setStatus("Pinned result removed."); });
speed.addEventListener("input", () => { speedValue.value = `${Number(speed.value).toFixed(1).replace(".0", "")}×`; });
document.querySelector("#close-app")!.addEventListener("click", () => getCurrentWindow().hide());
window.addEventListener("keydown", (event) => { if (event.key === "Escape") void getCurrentWindow().hide(); });
if ("__TAURI_INTERNALS__" in window) void listen("start-capture", captureScreen);
