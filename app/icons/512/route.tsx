import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#3b82f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 128,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 256,
            fontWeight: 700,
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          P
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
