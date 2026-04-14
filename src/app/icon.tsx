import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 24,
          color: "white",
          letterSpacing: "-0.5px",
        }}
      >
        Q
      </div>
    ),
    { ...size }
  );
}
