import { useMemo } from 'react';

// SVG bar chart — last 4 weeks completion per day
export default function HabitChart({ habit, entries, isDark, font }) {
  const ff = font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif";
  const textColor = isDark ? '#d0b890' : '#5a4030';
  const barColor  = '#E8633A';
  const barBg     = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  // Build last 28 days
  const days = useMemo(() => {
    const result = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const done    = entries.some(e => e.habitId === habit.id && e.date === dateStr && e.done);
      result.push({ dateStr, done, day: d.getDate(), weekday: d.getDay() });
    }
    return result;
  }, [habit.id, entries]);

  // Group into 4 weeks of 7
  const weeks = [];
  for (let w = 0; w < 4; w++) weeks.push(days.slice(w * 7, w * 7 + 7));

  const W = 300, H = 120, pad = { t: 10, b: 28, l: 28, r: 8 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const barW   = chartW / 28 - 2;
  const WEEKDAY = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const today   = new Date().toISOString().slice(0, 10);

  // Completion rate per week for subtitle
  const weekRates = weeks.map(w => {
    const past = w.filter(d => d.dateStr <= today);
    if (!past.length) return null;
    return Math.round(100 * past.filter(d => d.done).length / past.length);
  });

  return (
    <div style={{
      background: isDark ? '#3a3330' : '#F5F0E8',
      borderRadius: 6, padding: '22px 18px 16px',
      boxShadow: '2px 4px 8px rgba(0,0,0,0.25)',
      position: 'relative', maxWidth: 340, margin: '16px auto 0',
      fontFamily: ff,
    }}>
      {/* Pin */}
      <div style={{
        position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
        width: 14, height: 14, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #E8E8E8, #8C8C8C 70%)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.45)',
      }} />

      <div style={{ fontSize: font === 'handwritten' ? 16 : 12, fontWeight: 700, color: textColor, marginBottom: 2 }}>
        28-Tage Verlauf
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        {weekRates.map((r, i) => r !== null && (
          <div key={i} style={{ fontSize: font === 'handwritten' ? 12 : 9, color: isDark ? '#a09080' : '#999' }}>
            W{i + 1}: <span style={{ color: r >= 70 ? '#E8633A' : textColor, fontWeight: 600 }}>{r}%</span>
          </div>
        ))}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 0.5, 1].map(v => (
          <line key={v}
            x1={pad.l} y1={pad.t + chartH * (1 - v)}
            x2={pad.l + chartW} y2={pad.t + chartH * (1 - v)}
            stroke={gridColor} strokeWidth="1"
          />
        ))}

        {/* Y labels */}
        {['0%', '50%', '100%'].map((l, i) => (
          <text key={l} x={pad.l - 4} y={pad.t + chartH * (1 - i * 0.5) + 4}
            textAnchor="end" fontSize="9" fill={isDark ? '#806050' : '#bbb'}
            fontFamily={ff}
          >{l}</text>
        ))}

        {/* Bars */}
        {days.map((d, i) => {
          const x = pad.l + i * (barW + 2);
          const isToday = d.dateStr === today;
          const isFuture = d.dateStr > today;
          const h = d.done ? chartH : 0;
          return (
            <g key={d.dateStr}>
              {/* bg bar */}
              <rect x={x} y={pad.t} width={barW} height={chartH} fill={barBg} rx="2" />
              {/* fill bar */}
              {!isFuture && (
                <rect
                  x={x} y={pad.t + chartH - h} width={barW} height={h}
                  fill={isToday ? '#ff8c42' : barColor}
                  rx="2" opacity={d.done ? 1 : 0.3}
                />
              )}
              {/* today indicator */}
              {isToday && (
                <rect x={x} y={pad.t + chartH + 3} width={barW} height={3} fill="#E8633A" rx="1" />
              )}
            </g>
          );
        })}

        {/* Week separators + labels */}
        {[0, 1, 2, 3].map(w => {
          const x = pad.l + w * 7 * (barW + 2);
          const weekLabel = weeks[w] ? weeks[w][0] : null;
          return (
            <g key={w}>
              {w > 0 && <line x1={x} y1={pad.t} x2={x} y2={pad.t + chartH} stroke={isDark ? '#5a4a3a' : '#ddd'} strokeWidth="1" strokeDasharray="2,2" />}
              {weekLabel && (
                <text x={x + 2} y={H - 4} fontSize="8" fill={isDark ? '#806050' : '#bbb'} fontFamily={ff}>
                  {weekLabel.dateStr.slice(5).replace('-', '.')}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, background: barColor, borderRadius: 2 }} />
          <span style={{ fontSize: font === 'handwritten' ? 11 : 9, color: isDark ? '#a09080' : '#999' }}>Erledigt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, background: barBg, border: `1px solid ${isDark ? '#5a4a3a' : '#ddd'}`, borderRadius: 2 }} />
          <span style={{ fontSize: font === 'handwritten' ? 11 : 9, color: isDark ? '#a09080' : '#999' }}>Nicht erledigt</span>
        </div>
      </div>
    </div>
  );
}
