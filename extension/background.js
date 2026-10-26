// Fault Lines service worker: right-click selected answers -> open in Fault Lines.
function encodePayload(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "fl-send-selection",
    title: "Send selection to Fault Lines",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== "fl-send-selection" || !info.selectionText) return;
  const answers = info.selectionText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).slice(0, 120);
  if (!answers.length) return;
  const { "fl-base": stored } = await chrome.storage.local.get(["fl-base"]);
  const base = (stored || "http://localhost:3000").replace(/\/$/, "");
  chrome.tabs.create({ url: `${base}/tool#a=${encodePayload({ answers })}` });
});
