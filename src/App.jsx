import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import HabitCard from './components/HabitCard';
import StatisticsBoard from './components/StatisticsBoard';
import SettingsModal from './components/SettingsModal';
import EditModal from './components/EditModal';
import DeleteModal from './components/DeleteModal';
import { loadKey, saveKey } from './utils/storage';
import { calcStreak, todayStr } from './utils/streak';
import { findFreePosition, resolveDisplacement } from './utils/collision';
import './index.css';

const DEFAULT_SETTINGS = { theme: 'light', font: 'handwritten', defaultColor: 'yellow' };
const SWIPE_THRESHOLD  = 80;

// Gear SVG
const GearIcon = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill={color}>
    <path d="M19.14 12.94A7.16 7.16 0 0 0 19.2 12c0-.32-.03-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.07 7.07 0 0 0-1.62-.94l-.36-2.54A.48.48 0 0 0 14 3h-4a.48.48 0 0 0-.48.41l-.36 2.54a7.07 7.07 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.64 9.47a.47.47 0 0 0 .12.61L4.79 11.06A7.2 7.2 0 0 0 4.72 12c0 .31.03.63.07.94L2.76 14.52a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.06.27.3.47.57.47h4c.27 0 .51-.2.57-.47l.36-2.54a7.07 7.07 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/>
  </svg>
);

const StatsIcon = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill={color}>
    <rect x="3"  y="12" width="4" height="9" rx="1"/>
    <rect x="10" y="7"  width="4" height="14" rx="1"/>
    <rect x="17" y="3"  width="4" height="18" rx="1"/>
  </svg>
);

const HomeIcon = ({ color }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={color}>
    <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"/>
  </svg>
);

// Small pinned icon button
function PinnedIcon({ onClick, children, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', padding: 0,
        cursor: 'pointer', position: 'absolute',
        filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.35))',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 2,
        ...style,
      }}
    >
      {/* small pin */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #E8E8E8, #8C8C8C 70%)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        marginBottom: -2,
      }} />
      {children}
    </button>
  );
}

export default function App() {
  const [habits,   setHabits]   = useState([]);
  const [entries,  setEntries]  = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded,   setLoaded]   = useState(false);

  const [board,         setBoard]         = useState(0);
  const [showSettings,  setShowSettings]  = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [deleteId,      setDeleteId]      = useState(null);
  const [animating,     setAnimating]     = useState(false);
  const [swipeOffset,   setSwipeOffset]   = useState(0);

  const boardRef   = useRef(null);
  const swipeStart = useRef(null);
  const swipeDeltaX = useRef(0);

  // ── Load ──────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const h = await loadKey('habits',   []);
      const e = await loadKey('entries',  []);
      const s = await loadKey('settings', DEFAULT_SETTINGS);
      setHabits(h);
      setEntries(e);
      setSettings({ ...DEFAULT_SETTINGS, ...s });
      setLoaded(true);
    }
    init();
  }, []);

  // ── Persist ──────────────────────────────────────────
  useEffect(() => { if (loaded) saveKey('habits',   habits);   }, [habits,   loaded]);
  useEffect(() => { if (loaded) saveKey('entries',  entries);  }, [entries,  loaded]);
  useEffect(() => { if (loaded) saveKey('settings', settings); }, [settings, loaded]);

  const isDark = settings.theme === 'dark';
  const font   = settings.font;
  const iconColor = isDark ? '#c0a880' : '#7a6040';

  // ── Navigate ─────────────────────────────────────────
  const goTo = useCallback((idx) => {
    if (idx === board) return;
    setAnimating(true);
    setBoard(idx);
    setTimeout(() => setAnimating(false), 380);
  }, [board]);

  // ── Add habit ────────────────────────────────────────
  const addHabit = useCallback(() => {
    const el = boardRef.current;
    const w = el?.offsetWidth  ?? 360;
    const h = el?.offsetHeight ?? 600;
    const position = findFreePosition(habits, w, h);
    const rotation = parseFloat((Math.random() * 4 - 2).toFixed(2));
    const newHabit = {
      id: uuid(),
      name: 'Neuer Habit',
      description: '',
      color: settings.defaultColor,
      position,
      rotation,
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
  }, [habits, settings.defaultColor]);

  // ── Update habit ─────────────────────────────────────
  const updateHabit = useCallback((id, data) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...data } : h));
  }, []);

  // ── Delete habit ─────────────────────────────────────
  const deleteHabitConfirm = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setEntries(prev => prev.filter(e => e.habitId !== id));
    setDeleteId(null);
  }, []);

  // ── Toggle today ─────────────────────────────────────
  const toggleToday = useCallback((habitId) => {
    const today = todayStr();
    let resultStreak = 0;
    setEntries(prev => {
      const idx = prev.findIndex(e => e.habitId === habitId && e.date === today);
      let next;
      if (idx >= 0) {
        next = prev.map((e, i) => i === idx ? { ...e, done: !e.done } : e);
      } else {
        next = [...prev, { habitId, date: today, done: true }];
      }
      resultStreak = calcStreak(habitId, next);
      return next;
    });
    return resultStreak;
  }, []);

  // ── Drop ─────────────────────────────────────────────
  const handleDrop = useCallback((habitId, newPos) => {
    setHabits(prev => {
      const el = boardRef.current;
      const w = el?.offsetWidth  ?? 360;
      const h = el?.offsetHeight ?? 600;
      return resolveDisplacement(habitId, newPos, prev, w, h);
    });
  }, []);

  // ── Swipe navigation ─────────────────────────────────
  const handleBoardPointerDown = (e) => {
    if (e.target.closest('[data-no-swipe]')) return;
    swipeStart.current = { x: e.clientX };
    swipeDeltaX.current = 0;
  };

  const handleBoardPointerMove = (e) => {
    if (!swipeStart.current) return;
    const dx = e.clientX - swipeStart.current.x;
    swipeDeltaX.current = dx;
    const capped = board === 0 ? Math.min(0, dx * 0.4) : Math.max(0, dx * 0.4);
    setSwipeOffset(capped);
  };

  const handleBoardPointerUp = () => {
    if (!swipeStart.current) return;
    const dx = swipeDeltaX.current;
    swipeStart.current = null;
    setSwipeOffset(0);
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      goTo(dx < 0 ? Math.min(board + 1, 1) : Math.max(board - 1, 0));
    }
  };

  // ── Settings ─────────────────────────────────────────
  const saveSettings = (s) => { setSettings(s); setShowSettings(false); };
  const resetAll     = () => { setHabits([]); setEntries([]); setSettings(DEFAULT_SETTINGS); setShowSettings(false); };

  if (!loaded) return null;

  const editHabit    = habits.find(h => h.id === editId);
  const deleteHabit_ = habits.find(h => h.id === deleteId);

  // slider translate: 0% = main, -50% = stats
  const sliderX = -board * 50 + (swipeOffset / (boardRef.current?.offsetWidth || 380)) * 50;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#1a1a1a',
    }}>
      {/* Outer frame */}
      <div style={{
        width: '100%', maxWidth: 420,
        height: '100%', maxHeight: 860,
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        {/* Wood frame */}
        <div
          className={isDark ? 'wood-frame-dark' : 'wood-frame-light'}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: 10,
            padding: 14,
            display: 'flex',
          }}
        >
          {/* Cork board */}
          <div
            ref={boardRef}
            className={isDark ? 'cork-dark' : 'cork-light'}
            style={{ flex: 1, borderRadius: 4, position: 'relative', overflow: 'hidden' }}
            onPointerDown={handleBoardPointerDown}
            onPointerMove={handleBoardPointerMove}
            onPointerUp={handleBoardPointerUp}
          >
            {/* Slide container */}
            <div style={{
              display: 'flex',
              width: '200%',
              height: '100%',
              transform: `translateX(${sliderX}%)`,
              transition: animating ? 'transform 0.32s cubic-bezier(0.4,0,0.2,1)' : 'none',
            }}>

              {/* ── MAIN BOARD ── */}
              <div style={{ width: '50%', height: '100%', position: 'relative', flexShrink: 0 }}>

                {habits.map(habit => (
                  <div key={habit.id} data-habit-card data-no-swipe>
                    <HabitCard
                      habit={habit}
                      entries={entries}
                      isDark={isDark}
                      font={font}
                      boardRef={boardRef}
                      onDrop={handleDrop}
                      onToggle={toggleToday}
                      onEdit={id => setEditId(id)}
                      onDelete={id => setDeleteId(id)}
                    />
                  </div>
                ))}

                {/* Gear — top right */}
                <PinnedIcon
                  onClick={() => setShowSettings(true)}
                  style={{ top: 10, right: 10, zIndex: 200 }}
                >
                  <GearIcon color={iconColor} />
                </PinnedIcon>

                {/* Stats — bottom left */}
                <PinnedIcon
                  onClick={() => goTo(1)}
                  style={{ bottom: 18, left: 18, zIndex: 200 }}
                >
                  <StatsIcon color={iconColor} />
                </PinnedIcon>

                {/* Add — bottom right */}
                <button
                  data-no-swipe
                  onClick={addHabit}
                  style={{
                    position: 'absolute', bottom: 18, right: 18, zIndex: 200,
                    width: 50, height: 50, borderRadius: '50%',
                    background: '#E8633A', border: 'none', cursor: 'pointer',
                    color: 'white', fontSize: 30, fontWeight: 300,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '2px 4px 10px rgba(0,0,0,0.40)',
                    lineHeight: 0,
                  }}
                >+</button>
              </div>

              {/* ── STATS BOARD ── */}
              <div style={{ width: '50%', height: '100%', flexShrink: 0, position: 'relative' }}>
                {/* Gear on stats too */}
                <PinnedIcon
                  onClick={() => setShowSettings(true)}
                  style={{ top: 10, right: 10, zIndex: 200 }}
                >
                  <GearIcon color={iconColor} />
                </PinnedIcon>

                <StatisticsBoard
                  habits={habits}
                  entries={entries}
                  isDark={isDark}
                  font={font}
                  onGoHome={() => goTo(0)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          font={font}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
          onReset={resetAll}
        />
      )}

      {editHabit && (
        <EditModal
          habit={editHabit}
          font={font}
          onSave={data => { updateHabit(editId, data); setEditId(null); }}
          onCancel={() => setEditId(null)}
        />
      )}

      {deleteHabit_ && (
        <DeleteModal
          habit={deleteHabit_}
          font={font}
          onConfirm={deleteHabitConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
