# Fault Lines — Browser Extension (MV3)

Select or paste your class's answers on any web page and open them prefilled in Fault Lines. Answers travel in the opened tab's **URL hash** (`#a=…`) — the extension sends nothing to any server itself.

## Load it (developer mode, 1 minute)
1. Open `chrome://extensions` (or `edge://extensions`) → enable **Developer mode**.
2. **Load unpacked** → choose this `extension/` folder.
3. Click the Fault Lines icon → set your **Fault Lines address** (your deployment, or `http://localhost:3000` while developing) — it's remembered.
4. Use it three ways:
   - **Paste** answers in the popup → "Map my class in Fault Lines".
   - **Select text** on a page (e.g. answers in your VLE) → popup → "Grab selected text from page".
   - **Right-click** a selection → "Send selection to Fault Lines".
5. In the opened tab, remove any student names, then **Map my class**.

Firefox: `about:debugging` → This Firefox → Load Temporary Add-on → pick `manifest.json` (MV3 event-page differences may need a small port for permanent install).

## Privacy & permissions
`activeTab` + `scripting` (read *your selection*, only on click), `contextMenus`, `storage` (app address only). **No host permissions, no tracking, no remote code.** Strict extension CSP: `script-src 'self'`.

## Chrome Web Store submission (when ready)
1. Bump `version` in `manifest.json`; zip the `extension/` folder contents (manifest at zip root).
2. Developer account at chrome.google.com/webstore/devconsole (one-time fee).
3. Upload zip; listing copy = manifest description; category: Education; screenshots: popup + a results map.
4. Privacy practices tab: single purpose ("send selected text to the user's own Fault Lines app"), justify each permission as above, declare **no data collection**.
5. Submit for review (typically 1–3 days). The app-address setting is why "remote code"/host concerns don't apply — say so in the review notes.
