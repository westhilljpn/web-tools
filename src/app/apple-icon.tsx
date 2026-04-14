import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1D3D5E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          fontSize: 130,
          color: "white",
          letterSpacing: "-3px",
        }}
      >
        Q
      </div>
    ),
    { ...size }
  );
}
