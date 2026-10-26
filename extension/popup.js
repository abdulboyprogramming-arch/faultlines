// Fault Lines popup: collect answers -> open the web app with #a=<payload>.
// Encoding MUST match lib/share.ts decodeAnswersPayload in the web app:
// JSON { q?, answers[] } -> UTF-8 -> base64url.
const $ = (id) => document.getElementById(id);
const MAX = 120;

function encodePayload(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function currentAnswers() {
  return $("answers").value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}
function refreshCount() {
  const n = currentAnswers().length;
  $("count").textContent = n === 0 ? "0 answers" : `${n} answer${n === 1 ? "" : "s"}${n > MAX ? ` — only the first ${MAX} will be sent` : ""}`;
}
$("answers").addEventListener("input", refreshCount);

chrome.storage.local.get(["fl-base"]).then((v) => { if (v["fl-base"]) $("base").value = v["fl-base"]; });
$("base").addEventListener("change", () => {
  chrome.storage.local.set({ "fl-base": $("base").value.trim() });
});

$("grab").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() ?? "",
    });
    const text = String(result ?? "").trim();
    if (!text) { $("msg").textContent = "Select the answers on the page first, then click Grab."; return; }
    $("answers").value = ($("answers").value.trim() ? $("answers").value.trim() + "\n" : "") + text;
    refreshCount();
    $("msg").textContent = "Grabbed. Remove any student names before mapping.";
  } catch {
    $("msg").textContent = "Can't read this page (browser-internal pages are off-limits). Paste instead.";
  }
});

$("example").addEventListener("click", () => {
  $("q").value = "Why do we have seasons?";
  $("answers").value = [
    "Because the earth moves nearer to the sun in June",
    "The earth is closer to the sun during summer",
    "The earth's tilt changes the angle of sunlight through the year",
    "Because of the tilt of the earth",
    "I don't know",
  ].join("\n");
  refreshCount();
});

$("open").addEventListener("click", async () => {
  const answers = currentAnswers().slice(0, MAX);
  if (!answers.length) { $("msg").textContent = "Paste or grab at least one answer first."; return; }
  const stored = await chrome.storage.local.get(["fl-base"]);
  const base = ($("base").value.trim() || stored["fl-base"] || "http://localhost:3000").replace(/\/$/, "");
  let url;
  try { url = new URL(base); } catch { $("msg").textContent = "That Fault Lines address doesn't look like a URL."; return; }
  if (!/^https?:$/.test(url.protocol)) { $("msg").textContent = "Use an http(s) address."; return; }
  const payload = encodePayload({ q: $("q").value.trim() || undefined, answers });
  chrome.tabs.create({ url: `${base}/tool#a=${payload}` });
  window.close();
});

$("opts").addEventListener("click", (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });
refreshCount();
