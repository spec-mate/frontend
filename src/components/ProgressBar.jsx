// src/components/ProgressBar.jsx
import { useProgressStore } from "../store/progressStore";

export default function ProgressBar() {
  const progress = useProgressStore((state) => state.progress);

  if (progress === 0 || progress === 100) return null; // 0이나 100이면 숨김

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "4px",
        background: "#eee",
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background: "linear-gradient(90deg,#1e5cde,#1e2bde,#9b1ede)",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}
