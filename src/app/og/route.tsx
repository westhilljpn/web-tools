import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Free Online Web Tools";
  const icon = searchParams.get("icon") ?? "🔧";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e3a8a",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 背景装飾: 右上の円 */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        {/* 背景装飾: 左下の円 */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />

        {/* アイコン */}
        <div style={{ fontSize: 96, lineHeight: 1, marginBottom: 28 }}>
          {icon}
        </div>

        {/* タイトル */}
        <div
          style={{
            fontSize: title.length > 24 ? 44 : 56,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            maxWidth: 880,
            lineHeight: 1.25,
            padding: "0 60px",
          }}
        >
          {title}
        </div>

        {/* 区切り線 */}
        <div
          style={{
            width: 60,
            height: 3,
            backgroundColor: "rgba(255,255,255,0.4)",
            borderRadius: 2,
            marginTop: 28,
            marginBottom: 20,
          }}
        />

        {/* サイトURL */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.04em",
          }}
        >
          quicker-app.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
