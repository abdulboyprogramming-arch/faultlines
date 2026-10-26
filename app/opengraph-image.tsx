import { ImageResponse } from "next/og";

export const alt = "Fault Lines — see what your class actually misunderstands";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social preview card, generated at build time from the product's own
 * language — so a shared link looks like the product instead of a blank box.
 * Pure markup, no external assets, no font downloads.
 */
export default function OpengraphImage() {
  const bands = [
    { color: "#B5471F", width: "64%", label: "18 of 28", caption: "High risk" },
    { color: "#C98A2E", width: "25%", label: "7 of 28", caption: "Medium" },
    { color: "#3E5C63", width: "7%", label: "2", caption: "Low" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4F1EA",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Strata mark */}
          <div style={{ display: "flex", flexDirection: "column", width: 64, height: 64, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ height: 16, background: "#B5471F" }} />
            <div style={{ height: 16, background: "#C98A2E" }} />
            <div style={{ height: 16, background: "#3E5C63" }} />
            <div style={{ height: 16, background: "#14110E" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: "#14110E", letterSpacing: -0.5 }}>Fault Lines</div>
            <div style={{ fontSize: 18, color: "#6b6357", letterSpacing: 2, textTransform: "uppercase" }}>
              Misconception map
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 62, fontWeight: 700, color: "#14110E", lineHeight: 1.08, letterSpacing: -1.5 }}>
            Every class has fault lines.
          </div>
          <div style={{ fontSize: 40, color: "#B5471F", marginTop: 8, fontStyle: "italic" }}>
            See them before the exam does.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 32, fontSize: 24, color: "#4a443a" }}>
            <span>Paste answers</span>
            <span style={{ color: "#b3a894" }}>→</span>
            <span>see the beliefs underneath</span>
            <span style={{ color: "#b3a894" }}>→</span>
            <span>5-minute reteach plan</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bands.map((band) => (
            <div key={band.caption} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 820, height: 20, background: "#e3ddcf", borderRadius: 10, display: "flex" }}>
                <div style={{ width: band.width, height: 20, background: band.color, borderRadius: 10 }} />
              </div>
              <div style={{ fontSize: 20, color: "#14110E", fontWeight: 600 }}>{band.label}</div>
              <div style={{ fontSize: 18, color: "#6b6357" }}>{band.caption}</div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 18, color: "#6b6357" }}>
            <span>No accounts · no stored student data · works offline</span>
            <span>faultlines-kappa.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
