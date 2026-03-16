import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: "#3b82f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 48,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 96,
            fontWeight: 700,
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          P
        </span>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
