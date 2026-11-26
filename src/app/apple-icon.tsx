import { ImageResponse } from "next/og";

/** iOS ana ekran ikonu (180×180 PNG): krem zemin, turunç güneş, Akdeniz mavisi dalga */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#FAF9F6",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 50,
            top: 36,
            width: 80,
            height: 80,
            borderRadius: 9999,
            background: "#FF9F1C",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -20,
            right: -20,
            bottom: 0,
            height: 70,
            background: "#0077B6",
            borderTopLeftRadius: 90,
            borderTopRightRadius: 90,
          }}
        />
      </div>
    ),
    size,
  );
}
