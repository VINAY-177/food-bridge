import { useRef, useCallback } from "react";

/**
 * Card3D — wraps any card with a real-time mouse-tracking 3D tilt.
 *
 * Usage:
 *   <Card3D className="..." intensity={12}>
 *     ...content...
 *   </Card3D>
 *
 * intensity: max tilt degrees (default 10)
 */
export default function Card3D({ children, className = "", intensity = 10, style = {} }) {
  const ref = useRef(null);
  const rafRef = useRef(null);

  const handleMove = useCallback((e) => {
    if (!ref.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = ref.current.getBoundingClientRect();
      // Normalise mouse position within card: -1 .. 1
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      // rotateY follows X-axis movement, rotateX follows Y-axis (inverted)
      const ry = (x * intensity).toFixed(2);
      const rx = (-y * intensity * 0.6).toFixed(2);
      ref.current.style.setProperty("--rx", `${rx}deg`);
      ref.current.style.setProperty("--ry", `${ry}deg`);
      ref.current.classList.remove("card-3d-reset");
    });
  }, [intensity]);

  const handleLeave = useCallback(() => {
    if (!ref.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
    ref.current.classList.add("card-3d-reset");
    // Remove the snap-back class after animation completes
    setTimeout(() => {
      ref.current?.classList.remove("card-3d-reset");
    }, 450);
  }, []);

  return (
    <div
      ref={ref}
      className={`card-3d ${className}`}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
