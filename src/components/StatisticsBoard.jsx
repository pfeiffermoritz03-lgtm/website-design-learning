import { useState, useRef } from 'react';
import { calcStreak, todayStr, getWeekDays } from '../utils/streak';
import HabitChart from './HabitChart';

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const NOTE_BG = '#F5F0E8';
const NOTE_DARK = '#3a3330';

function WeekView({ habit, entries, isDark, font }) {
  const weekDays = getWeekDays();
  const streak   = calcStreak(habit.id, entries);
  const today    = todayStr();
  const ff = font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif";
  const bg = isDark ? NOTE_DARK : NOTE_BG;
  const textColor = isDark ? '#e8e0d0' : '#2A2A2A';

  const weekStart = weekDays[0];
  const weekEnd   = weekDays[6];
  const fmt = d => {
    const [y, m, dd] = d.split('-');
    return `${dd}.${m}.`;
  };

  return (
    <div style={{
      background: bg, borderRadius: 6, padding: '28px 24px 22px',
      boxShadow: '2px 4px 8px rgba(0,0,0,0.28)', position: 'relative',
      maxWidth: 340, margin: '0 auto', fontFamily: ff,
    }}>
      <div style={{
        position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
        width: 14, height: 14, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #E8E8E8, #8C8C8C 70%)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.45)',
      }} />

      <div style={{ fontSize: font === 'handwritten' ? 13 : 10, color: isDark ? '#a09080' : '#888', letterSpacing: 1, marginBottom: 2, textTransform: 'uppercase' }}>
        Wochenfortschritt
      </div>
      <div style={{ fontSize: font === 'handwritten' ? 11 : 9, color: isDark ? '#806050' : '#aaa', marginBottom: 14 }}>
        {fmt(weekStart)} – {fmt(weekEnd)}
      </div>

      {/* 7 circles */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {weekDays.map((date, i) => {
          const done    = entries.some(e => e.habitId === habit.id && e.date === date && e.done);
          const isToday = date === today;
          const isFuture = date > today;
          return (
            <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                border: `2px solid ${isToday ? '#E8633A' : isFuture ? (isDark ? '#555' : '#ccc') : (isDark ? '#6a5a50' : '#aaa')}`,
                background: done ? '#E8633A' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isFuture ? 0.4 : 1,
              }}>
                {done && (
                  <svg width="14" height="14" viewBox="0 0 14 14">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <div style={{ fontSize: font === 'handwritten' ? 11 : 9, color: isDark ? '#a09080' : '#888' }}>
                {DAY_LABELS[i]}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <span style={{ fontSize: 22 }}>🔥</span>
        <div>
          <div style={{ fontSize: font === 'handwritten' ? 18 : 14, fontWeight: 700, color: '#E8633A' }}>
            {streak} TAGE
          </div>
          <div style={{ fontSize: font === 'handwritten' ? 13 : 10, color: isDark ? '#a09080' : '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Streak
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthView({ habit, entries, isDark, font }) {
  const today = todayStr();
  const todayDate = new Date(today);
  const [year,  setYear]  = useState(todayDate.getFullYear());
  const [month, setMonth] = useState(todayDate.getMonth()); // 0-based

  const ff = font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif";
  const bg = isDark ? NOTE_DARK : NOTE_BG;
  const textColor = isDark ? '#e8e0d0' : '#2A2A2A';

  const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7; // Mon=0

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{
      background: bg, borderRadius: 6, padding: '28px 20px 20px',
      boxShadow: '2px 4px 8px rgba(0,0,0,0.28)', position: 'relative',
      maxWidth: 340, margin: '0 auto', fontFamily: ff,
    }}>
      <div style={{
        position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
        width: 14, height: 14, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #E8E8E8, #8C8C8C 70%)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.45)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={prev} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: isDark ? '#a0907a' : '#888', padding: '0 4px' }}>‹</button>
        <div style={{ fontSize: font === 'handwritten' ? 18 : 14, fontWeight: 700, color: textColor }}>
          {MONTHS[month]} {year}
        </div>
        <button onClick={next} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: isDark ? '#a0907a' : '#888', padding: '0 4px' }}>›</button>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 6 }}>
        {['Mo','Di','Mi','Do','Fr','Sa','So'].map(l => (
          <div key={l} style={{ textAlign: 'center', fontSize: font === 'handwritten' ? 11 : 9, color: isDark ? '#806050' : '#bbb', fontWeight: 600 }}>{l}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} />;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const done    = entries.some(e => e.habitId === habit.id && e.date === dateStr && e.done);
          const isToday = dateStr === today;
          return (
            <div key={dateStr} style={{
              textAlign: 'center', padding: '3px 0',
              borderRadius: 4,
              background: done ? '#E8633A' : isToday ? (isDark ? '#4a3a2a' : '#FFF0E0') : 'transparent',
              border: isToday ? '1px solid #E8633A' : '1px solid transparent',
              position: 'relative',
            }}>
              <span style={{ fontSize: font === 'handwritten' ? 13 : 10, color: done ? 'white' : textColor }}>
                {done ? '✓' : day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StatisticsBoard({ habits, entries, isDark, font, onGoHome }) {
  const [activeHabit, setActiveHabit] = useState(habits[0]?.id ?? null);
  const [view, setView] = useState('week'); // 'week' | 'month'

  // Swipe for view toggle
  const swipeRef  = useRef(null);
  const swipeStart = useRef(null);

  const habit = habits.find(h => h.id === activeHabit) ?? habits[0];
  const ff = font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif";

  const handlePointerDown = (e) => { swipeStart.current = { x: e.clientX, y: e.clientY }; };
  const handlePointerUp   = (e) => {
    if (!swipeStart.current) return;
    const dx = e.clientX - swipeStart.current.x;
    const dy = e.clientY - swipeStart.current.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      setView(dx < 0 ? 'month' : 'week');
    }
    swipeStart.current = null;
  };

  if (!habit) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ff, color: isDark ? '#e0d0b0' : '#555', fontSize: 16 }}>
        Noch keine Habits vorhanden.
      </div>
    );
  }

  return (
    <div
      ref={swipeRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
    >
      {/* Habit tabs */}
      <div className="no-scrollbar" style={{
        display: 'flex', overflowX: 'auto', padding: '14px 14px 0',
        gap: 6, flexShrink: 0,
      }}>
        {habits.map(h => (
          <button
            key={h.id}
            onClick={() => setActiveHabit(h.id)}
            style={{
              padding: '6px 12px', borderRadius: '4px 4px 0 0',
              background: activeHabit === h.id ? (isDark ? '#FFF8EE' : '#FFF9F2') : 'rgba(255,255,255,0.18)',
              border: 'none', cursor: 'pointer',
              fontSize: font === 'handwritten' ? 15 : 11,
              fontWeight: activeHabit === h.id ? 700 : 400,
              color: activeHabit === h.id ? '#2A2A2A' : (isDark ? '#c0a080' : '#666'),
              fontFamily: ff, whiteSpace: 'nowrap', flexShrink: 0,
              boxShadow: activeHabit === h.id ? '0 -2px 6px rgba(0,0,0,0.1)' : 'none',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
              width: 8, height: 8, borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 35%, #E8E8E8, #8C8C8C 70%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
            }} />
            {h.name}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '12px 0 8px', flexShrink: 0 }}>
        {['week','month'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '4px 16px', borderRadius: 20,
              background: view === v ? '#E8633A' : 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer', color: view === v ? 'white' : (isDark ? '#d0b090' : '#555'),
              fontSize: font === 'handwritten' ? 14 : 11, fontFamily: ff,
              fontWeight: view === v ? 700 : 400,
            }}
          >
            {v === 'week' ? 'Woche' : 'Monat'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 20px' }} className="no-scrollbar">
        {view === 'week'
          ? <WeekView habit={habit} entries={entries} isDark={isDark} font={font} />
          : <MonthView habit={habit} entries={entries} isDark={isDark} font={font} />
        }
        <HabitChart habit={habit} entries={entries} isDark={isDark} font={font} />
      </div>

      {/* Home icon */}
      <button
        onClick={onGoHome}
        className="board-icon"
        style={{
          position: 'absolute', bottom: 18, left: 18,
          background: 'rgba(255,255,255,0.15)', border: 'none',
          borderRadius: 10, padding: 8, cursor: 'pointer',
          backdropFilter: 'blur(2px)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"
            fill={isDark ? '#c0a080' : '#6b5040'} />
        </svg>
      </button>
    </div>
  );
}
