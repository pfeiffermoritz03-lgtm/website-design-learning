import { useRef, useState, useCallback } from 'react';
import { todayStr, getWeekDays, calcStreak } from '../utils/streak';
import Confetti from './Confetti';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const COLOR_MAP = {
  yellow: '#F4D35E', pink: '#F2A6A6', mint: '#A8D8B9',
  lightblue: '#A6CEF2', lavender: '#C9A8E8',
};
const COLOR_DARK = {
  yellow: '#CFA93E', pink: '#CE7E7E', mint: '#7FB896',
  lightblue: '#7DAACF', lavender: '#A07FC0',
};

const TAP_MAX_DIST = 7;
const TAP_MAX_MS   = 300;
const DBL_MAX_MS   = 320;
const LONG_MS      = 500;

export default function HabitCard({
  habit, entries, isDark, font, editMode,
  onDrop, onToggle, onEdit, onDelete,
  boardRef,
}) {
  const today = todayStr();
  const weekDays = getWeekDays();
  const streak = calcStreak(habit.id, entries);
  const todayDone = entries.some(e => e.habitId === habit.id && e.date === today && e.done);

  const [dragging, setDragging] = useState(false);
  const [confetti, setConfetti] = useState(null);
  const [wobblingStreak, setWobblingStreak] = useState(false);
  const [wobbling, setWobbling] = useState(false);

  const ptr       = useRef(null); // pointerId
  const startPos  = useRef(null);
  const moved     = useRef(false);
  const startTime = useRef(0);
  const lastTap   = useRef(0);
  const longTimer = useRef(null);
  const cardRef   = useRef(null);
  const dragOffset = useRef({ ox: 0, oy: 0 });
  const currentPos = useRef({ x: habit.position.x, y: habit.position.y });

  const bgColor = isDark ? COLOR_DARK[habit.color] : COLOR_MAP[habit.color];
  const rotation = `rotate(${habit.rotation}deg)`;

  const clearLong = () => { clearTimeout(longTimer.current); longTimer.current = null; };

  const handlePointerDown = useCallback((e) => {
    if (e.button > 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    ptr.current       = e.pointerId;
    startPos.current  = { x: e.clientX, y: e.clientY };
    moved.current     = false;
    startTime.current = Date.now();

    const rect = cardRef.current.getBoundingClientRect();
    dragOffset.current = { ox: e.clientX - rect.left, oy: e.clientY - rect.top };

    // Long-press only in edit mode (for delete)
    if (editMode) {
      longTimer.current = setTimeout(() => {
        if (!moved.current) { clearLong(); onDelete(habit.id); }
      }, LONG_MS);
    }
  }, [habit.id, onDelete, editMode]);

  const handlePointerMove = useCallback((e) => {
    if (ptr.current !== e.pointerId) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!moved.current && dist > TAP_MAX_DIST) {
      moved.current = true;
      clearLong();
      if (editMode) setDragging(true);
    }

    if (moved.current && editMode && boardRef.current) {
      const board = boardRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - board.left - dragOffset.current.ox, board.width  - 160));
      const y = Math.max(0, Math.min(e.clientY - board.top  - dragOffset.current.oy, board.height - 160));
      currentPos.current = { x, y };
      cardRef.current.style.left = x + 'px';
      cardRef.current.style.top  = y + 'px';
    }
  }, [boardRef, editMode]);

  const handlePointerUp = useCallback((e) => {
    if (ptr.current !== e.pointerId) return;
    clearLong();

    if (moved.current && editMode) {
      setDragging(false);
      onDrop(habit.id, currentPos.current);
      return;
    }

    setDragging(false);
    const elapsed = Date.now() - startTime.current;
    if (elapsed < TAP_MAX_MS) {
      if (editMode) {
        // In edit mode: single tap = open edit modal
        onEdit(habit.id);
        return;
      }
      const now = Date.now();
      if (now - lastTap.current < DBL_MAX_MS) {
        lastTap.current = 0;
        onEdit(habit.id);
      } else {
        lastTap.current = now;
        setTimeout(() => {
          if (Date.now() - lastTap.current >= DBL_MAX_MS - 10) {
            lastTap.current = 0;
            // single tap → toggle
            const rect = cardRef.current?.getBoundingClientRect();
            const cx = rect ? rect.left + rect.width  / 2 : e.clientX;
            const cy = rect ? rect.top  + rect.height / 2 : e.clientY;
            const newStreak = onToggle(habit.id);
            setWobbling(true);
            setConfetti({ x: cx, y: cy });
            if (newStreak >= 7) setWobblingStreak(true);
            setTimeout(() => { setWobbling(false); setWobblingStreak(false); }, 650);
          }
        }, DBL_MAX_MS);
      }
    }
  }, [habit.id, onToggle, onEdit, editMode]);

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: habit.position.x,
        top:  habit.position.y,
        '--nr': rotation,
        transform: dragging ? `${rotation} translateY(-4px)` : rotation,
        boxShadow: dragging
          ? '4px 8px 16px rgba(0,0,0,0.45)'
          : '2px 4px 6px rgba(0,0,0,0.30)',
        background: bgColor,
        minWidth: 148,
        maxWidth: 180,
        borderRadius: 4,
        padding: '18px 12px 10px',
        cursor: dragging ? 'grabbing' : editMode ? 'grab' : 'pointer',
        userSelect: 'none',
        zIndex: dragging ? 500 : 10,
        touchAction: 'none',
        transition: dragging ? 'box-shadow 0.15s' : 'box-shadow 0.15s, transform 0.15s',
        fontFamily: font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif",
      }}
      className={wobbling ? 'anim-wobble' : ''}
    >
      {/* Pin */}
      <div style={{
        position: 'absolute', top: -6, left: '50%',
        transform: 'translateX(-50%)',
        width: 13, height: 13, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #E8E8E8, #8C8C8C 70%)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.45)',
      }} />

      {/* Habit name */}
      <div style={{
        fontSize: font === 'handwritten' ? 19 : 15,
        fontWeight: 700,
        color: '#2A2A2A',
        lineHeight: 1.2,
        marginBottom: 4,
        wordBreak: 'break-word',
      }}>
        {habit.name}
      </div>

      {/* Description */}
      {habit.description ? (
        <div style={{
          fontSize: font === 'handwritten' ? 14 : 11,
          color: '#3a3a3a',
          marginBottom: 6,
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}>
          {habit.description}
        </div>
      ) : null}

      {/* Week day dots */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
        {weekDays.map((date, i) => {
          const done = entries.some(e => e.habitId === habit.id && e.date === date && e.done);
          const isToday = date === today;
          return (
            <div key={date} style={{
              width: 18, height: 18, borderRadius: '50%',
              border: `2px solid ${isToday ? '#E8633A' : 'rgba(0,0,0,0.3)'}`,
              background: done ? 'rgba(0,0,0,0.55)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {done && (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Day labels */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {DAY_LABELS.map((l, i) => (
          <div key={i} style={{
            width: 18, textAlign: 'center',
            fontSize: font === 'handwritten' ? 11 : 9,
            color: 'rgba(0,0,0,0.5)',
            flexShrink: 0,
          }}>{l}</div>
        ))}
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span
          className={wobblingStreak ? 'anim-streak' : ''}
          style={{ fontSize: 16, display: 'inline-block' }}
        >🔥</span>
        <span style={{
          fontSize: font === 'handwritten' ? 15 : 12,
          fontWeight: 600,
          color: '#E8633A',
        }}>{streak}x</span>
      </div>

      {/* Confetti */}
      {confetti && (
        <Confetti
          x={confetti.x - habit.position.x}
          y={confetti.y - habit.position.y}
          onDone={() => setConfetti(null)}
        />
      )}
    </div>
  );
}
