import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const runtime = "edge";
export const alt = "SunuLogis - location appartement Dakar et logements au Senegal";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 48%, #d1fae5 100%)",
          color: "#0f172a",
          padding: 72,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 24,
              background: "#0f766e",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 800,
            }}
          >
            SL
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 54, fontWeight: 900 }}>{siteConfig.name}</div>
            <div style={{ fontSize: 28, color: "#0f766e", marginTop: 6 }}>
              Dakar - Senegal - WhatsApp
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 70,
              lineHeight: 1.03,
              fontWeight: 900,
              maxWidth: 980,
            }}
          >
            Trouvez un logement fiable au Senegal
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.35,
              maxWidth: 960,
              color: "#334155",
            }}
          >
            Appartements meubles, chambres, villas, hotels et auberges avec
            recherche simple et contact direct.
          </div>
        </div>
      </div>
    ),
    size
  );
}
