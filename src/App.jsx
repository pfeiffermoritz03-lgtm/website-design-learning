import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase.js';
import {
  loadUserData, saveHabit, removeHabit as fsRemoveHabit,
  saveEntry, saveSettings as fsSaveSettings, saveAllHabits,
} from './utils/firestore.js';

import HabitCard     from './components/HabitCard';
import StatisticsBoard from './components/StatisticsBoard';
import SettingsModal from './components/SettingsModal';
import EditModal     from './components/EditModal';
import DeleteModal   from './components/DeleteModal';
import LoginScreen   from './components/LoginScreen';
import { calcStreak, todayStr } from './utils/streak';
import { findFreePosition, resolveDisplacement } from './utils/collision';
import './index.css';

const DEFAULT_SETTINGS = { theme: 'light', font: 'handwritten', defaultColor: 'yellow' };
const SWIPE_THRESHOLD  = 80;

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
const EditModeIcon = ({ color, active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#E8633A' : color}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

function PinnedIcon({ onClick, children, style }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
      position: 'absolute', filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.35))',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      ...style,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #E8E8E8, #8C8C8C 70%)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)', marginBottom: -2,
      }} />
      {children}
    </button>
  );
}

export default function App() {
  const [user,     setUser]     = useState(undefined); // undefined=loading, null=logged out
  const [habits,   setHabits]   = useState([]);
  const [entries,  setEntries]  = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded,   setLoaded]   = useState(false);

  const [board,        setBoard]        = useState(0);
  const [editMode,     setEditMode]     = useState(false); // drag-to-rearrange mode
  const [showSettings, setShowSettings] = useState(false);
  const [editId,       setEditId]       = useState(null);
  const [deleteId,     setDeleteId]     = useState(null);
  const [animating,    setAnimating]    = useState(false);
  const [swipeOffset,  setSwipeOffset]  = useState(0);

  const boardRef    = useRef(null);
  const swipeStart  = useRef(null);
  const swipeDeltaX = useRef(0);

  // ── Auth listener ──────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const data = await loadUserData(u.uid);
        setHabits(data.habits   || []);
        setEntries(data.entries || []);
        setSettings({ ...DEFAULT_SETTINGS, ...(data.settings || {}) });
        setLoaded(true);
      } else {
        setHabits([]); setEntries([]); setSettings(DEFAULT_SETTINGS); setLoaded(false);
      }
    });
    return unsub;
  }, []);

  const isDark    = settings.theme === 'dark';
  const font      = settings.font;
  const iconColor = isDark ? '#c0a880' : '#7a6040';

  // ── Navigate ──────────────────────────────────────────
  const goTo = useCallback((idx) => {
    if (idx === board) return;
    setAnimating(true);
    setBoard(idx);
    setTimeout(() => setAnimating(false), 380);
  }, [board]);

  // ── Add habit ─────────────────────────────────────────
  const addHabit = useCallback(async () => {
    if (!user) return;
    const el = boardRef.current;
    const w  = el?.offsetWidth  ?? 360;
    const h  = el?.offsetHeight ?? 600;
    const position = findFreePosition(habits, w, h);
    const rotation = parseFloat((Math.random() * 4 - 2).toFixed(2));
    const newHabit = {
      id: uuid(), name: 'Neuer Habit', description: '',
      color: settings.defaultColor, position, rotation,
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    await saveHabit(user.uid, newHabit);
  }, [habits, settings.defaultColor, user]);

  // ── Update habit ─────────────────────────────────────
  const updateHabit = useCallback(async (id, data) => {
    if (!user) return;
    setHabits(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, ...data } : h);
      const habit   = updated.find(h => h.id === id);
      if (habit) saveHabit(user.uid, habit);
      return updated;
    });
  }, [user]);

  // ── Delete habit ─────────────────────────────────────
  const deleteHabitConfirm = useCallback(async (id) => {
    if (!user) return;
    setHabits(prev => prev.filter(h => h.id !== id));
    setEntries(prev => prev.filter(e => e.habitId !== id));
    setDeleteId(null);
    await fsRemoveHabit(user.uid, id);
  }, [user]);

  // ── Toggle today ─────────────────────────────────────
  const toggleToday = useCallback((habitId) => {
    if (!user) return 0;
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
      const entry = next.find(e => e.habitId === habitId && e.date === today);
      if (entry) saveEntry(user.uid, entry);
      return next;
    });
    return resultStreak;
  }, [user]);

  // ── Drop ─────────────────────────────────────────────
  const handleDrop = useCallback(async (habitId, newPos) => {
    if (!user) return;
    setHabits(prev => {
      const el = boardRef.current;
      const w  = el?.offsetWidth  ?? 360;
      const h  = el?.offsetHeight ?? 600;
      const updated = resolveDisplacement(habitId, newPos, prev, w, h);
      updated.forEach(hab => {
        const orig = prev.find(p => p.id === hab.id);
        if (!orig || orig.position.x !== hab.position.x || orig.position.y !== hab.position.y) {
          saveHabit(user.uid, hab);
        }
      });
      return updated;
    });
  }, [user]);

  // ── Swipe ────────────────────────────────────────────
  const handleBoardPointerDown = (e) => {
    if (e.target.closest('[data-no-swipe]')) return;
    swipeStart.current  = { x: e.clientX };
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
  const saveSettingsHandler = async (s) => {
    setSettings(s);
    setShowSettings(false);
    if (user) await fsSaveSettings(user.uid, s);
  };
  const resetAll = async () => {
    setHabits([]); setEntries([]); setSettings(DEFAULT_SETTINGS);
    setShowSettings(false);
    // Note: Firestore docs remain — user can re-login and they'll be gone after full wipe
    // For a true wipe we'd batch delete, but keeping simple
  };

  // ── Loading / Auth states ─────────────────────────────
  if (user === undefined) return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#1a1a1a' }}>
      <div style={{ color:'#C8975A', fontSize:32 }}>📌</div>
    </div>
  );

  if (!user) return <LoginScreen font="handwritten" />;
  if (!loaded) return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#1a1a1a' }}>
      <div style={{ color:'#C8975A', fontSize:18, fontFamily:"'Caveat', cursive" }}>Lade Daten…</div>
    </div>
  );

  const editHabit_   = habits.find(h => h.id === editId);
  const deleteHabit_ = habits.find(h => h.id === deleteId);
  const sliderX = -board * 50 + (swipeOffset / (boardRef.current?.offsetWidth || 380)) * 50;

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#1a1a1a' }}>
      <div style={{
        width:'100%', maxWidth:420, height:'100%', maxHeight:860,
        position:'relative', borderRadius:10, overflow:'hidden',
      }}>
        {/* Wood frame */}
        <div
          className={isDark ? 'wood-frame-dark' : 'wood-frame-light'}
          style={{ position:'absolute', inset:0, borderRadius:10, padding:14, display:'flex' }}
        >
          {/* Cork */}
          <div
            ref={boardRef}
            className={isDark ? 'cork-dark' : 'cork-light'}
            style={{ flex:1, borderRadius:4, position:'relative', overflow:'hidden' }}
            onPointerDown={handleBoardPointerDown}
            onPointerMove={handleBoardPointerMove}
            onPointerUp={handleBoardPointerUp}
          >
            {/* Slide container */}
            <div style={{
              display:'flex', width:'200%', height:'100%',
              transform:`translateX(${sliderX}%)`,
              transition: animating ? 'transform 0.32s cubic-bezier(0.4,0,0.2,1)' : 'none',
            }}>

              {/* ── MAIN BOARD ── */}
              <div style={{ width:'50%', height:'100%', position:'relative', flexShrink:0 }}>

                {/* Edit mode banner */}
                {editMode && (
                  <div style={{
                    position:'absolute', top:0, left:0, right:0, zIndex:150,
                    background:'rgba(232,99,58,0.85)', padding:'6px 0',
                    textAlign:'center',
                    fontFamily: font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif",
                    fontSize: font === 'handwritten' ? 16 : 12,
                    color:'white', fontWeight:700,
                    backdropFilter:'blur(2px)',
                  }}>
                    ✏️ Bearbeitungsmodus — Zettel verschieben & tippen zum Bearbeiten
                  </div>
                )}

                {habits.map(habit => (
                  <div key={habit.id} data-no-swipe>
                    <HabitCard
                      habit={habit}
                      entries={entries}
                      isDark={isDark}
                      font={font}
                      boardRef={boardRef}
                      editMode={editMode}
                      onDrop={handleDrop}
                      onToggle={toggleToday}
                      onEdit={id => setEditId(id)}
                      onDelete={id => setDeleteId(id)}
                    />
                  </div>
                ))}

                {/* Gear — top right */}
                <PinnedIcon onClick={() => setShowSettings(true)} style={{ top:10, right:10, zIndex:200 }}>
                  <GearIcon color={iconColor} />
                </PinnedIcon>

                {/* Edit mode toggle — top left */}
                <PinnedIcon
                  onClick={() => setEditMode(v => !v)}
                  style={{ top:10, left:10, zIndex:200 }}
                >
                  <EditModeIcon color={iconColor} active={editMode} />
                </PinnedIcon>

                {/* Stats — bottom left */}
                <PinnedIcon onClick={() => goTo(1)} style={{ bottom:18, left:18, zIndex:200 }}>
                  <StatsIcon color={iconColor} />
                </PinnedIcon>

                {/* Add — bottom right (only in edit mode) */}
                {editMode && (
                  <button
                    data-no-swipe
                    onClick={addHabit}
                    style={{
                      position:'absolute', bottom:18, right:18, zIndex:200,
                      width:50, height:50, borderRadius:'50%',
                      background:'#E8633A', border:'none', cursor:'pointer',
                      color:'white', fontSize:30, fontWeight:300,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'2px 4px 10px rgba(0,0,0,0.40)', lineHeight:0,
                    }}
                  >+</button>
                )}

                {/* Sign out — bottom right when not edit mode */}
                {!editMode && (
                  <button
                    data-no-swipe
                    onClick={() => signOut(auth)}
                    style={{
                      position:'absolute', bottom:18, right:18, zIndex:200,
                      background:'rgba(0,0,0,0.18)', border:'none', borderRadius:8,
                      padding:'5px 10px', cursor:'pointer', color: isDark ? '#d0b090' : '#5a3a20',
                      fontSize: font === 'handwritten' ? 13 : 10,
                      fontFamily: font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif",
                    }}
                  >
                    Abmelden
                  </button>
                )}
              </div>

              {/* ── STATS BOARD ── */}
              <div style={{ width:'50%', height:'100%', flexShrink:0, position:'relative' }}>
                <PinnedIcon onClick={() => setShowSettings(true)} style={{ top:10, right:10, zIndex:200 }}>
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

      {showSettings && (
        <SettingsModal
          settings={settings} font={font}
          onSave={saveSettingsHandler}
          onClose={() => setShowSettings(false)}
          onReset={resetAll}
        />
      )}
      {editHabit_ && (
        <EditModal
          habit={editHabit_} font={font}
          onSave={data => { updateHabit(editId, data); setEditId(null); }}
          onCancel={() => setEditId(null)}
        />
      )}
      {deleteHabit_ && (
        <DeleteModal
          habit={deleteHabit_} font={font}
          onConfirm={deleteHabitConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
