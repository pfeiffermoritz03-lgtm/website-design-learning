import { useEffect, useRef } from 'react';

const COLORS = ['#F4D35E', '#F2A6A6', '#A8D8B9', '#A6CEF2', '#C9A8E8', '#E8633A'];

export default function Confetti({ x, y, onDone }) {
  const particles = useRef(
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      dx: (Math.random() - 0.5) * 60,
      dy: -(Math.random() * 40 + 20),
      size: Math.random() * 6 + 4,
      rot: Math.random() * 360,
    }))
  );

  useEffect(() => {
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 999 }}>
      {particles.current.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-drop 0.6s ease-out forwards`,
            animationDelay: `${p.id * 25}ms`,
            transform: `translate(${p.dx}px, ${p.dy}px) rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
