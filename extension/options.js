const $ = (id) => document.getElementById(id);
chrome.storage.local.get(["fl-base"]).then((v) => { if (v["fl-base"]) $("base").value = v["fl-base"]; });
$("save").addEventListener("click", async () => {
  const value = $("base").value.trim();
  if (value) {
    try { const u = new URL(value); if (!/^https?:$/.test(u.protocol)) throw new Error(); }
    catch { $("msg").textContent = "Enter a full http(s) URL."; return; }
  }
  await chrome.storage.local.set({ "fl-base": value });
  $("msg").textContent = "Saved ✓";
});
