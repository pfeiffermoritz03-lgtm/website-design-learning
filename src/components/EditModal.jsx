import { useState } from 'react';

const COLORS = [
  { key: 'yellow',    bg: '#F4D35E' },
  { key: 'pink',      bg: '#F2A6A6' },
  { key: 'mint',      bg: '#A8D8B9' },
  { key: 'lightblue', bg: '#A6CEF2' },
  { key: 'lavender',  bg: '#C9A8E8' },
];

export default function EditModal({ habit, font, onSave, onCancel }) {
  const [name, setName]   = useState(habit.name);
  const [desc, setDesc]   = useState(habit.description || '');
  const [color, setColor] = useState(habit.color);

  const bgNote = COLORS.find(c => c.key === color)?.bg ?? '#F4D35E';

  return (
    <div
      className="modal-backdrop"
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="anim-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: bgNote,
          borderRadius: 6,
          padding: '28px 20px 20px',
          minWidth: 260,
          maxWidth: 320,
          position: 'relative',
          boxShadow: '3px 6px 18px rgba(0,0,0,0.35)',
          fontFamily: font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif",
        }}
      >
        {/* Pin */}
        <div style={{
          position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
          width: 14, height: 14, borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 35%, #E8E8E8, #8C8C8C 70%)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.45)',
        }} />

        {/* Close */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute', top: 8, right: 10,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, color: '#555', lineHeight: 1,
          }}
        >×</button>

        <div style={{ fontSize: font === 'handwritten' ? 20 : 15, fontWeight: 700, color: '#2A2A2A', marginBottom: 12 }}>
          Habit bearbeiten
        </div>

        <label style={{ display: 'block', fontSize: font === 'handwritten' ? 15 : 12, color: '#444', marginBottom: 4 }}>Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={40}
          style={{
            width: '100%', padding: '6px 8px', borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.5)',
            fontSize: font === 'handwritten' ? 18 : 14, fontFamily: 'inherit',
            marginBottom: 10, outline: 'none', color: '#2A2A2A',
          }}
        />

        <label style={{ display: 'block', fontSize: font === 'handwritten' ? 15 : 12, color: '#444', marginBottom: 4 }}>Beschreibung</label>
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={3}
          style={{
            width: '100%', padding: '6px 8px', borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.5)',
            fontSize: font === 'handwritten' ? 16 : 13, fontFamily: 'inherit',
            marginBottom: 12, outline: 'none', resize: 'none', color: '#2A2A2A',
          }}
        />

        <label style={{ display: 'block', fontSize: font === 'handwritten' ? 15 : 12, color: '#444', marginBottom: 8 }}>Farbe</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <div
              key={c.key}
              onClick={() => setColor(c.key)}
              className={`swatch${color === c.key ? ' active' : ''}`}
              style={{ background: c.bg }}
            />
          ))}
        </div>

        <button
          onClick={() => onSave({ name: name.trim() || 'Neuer Habit', description: desc.trim(), color })}
          style={{
            width: '100%', padding: '8px', borderRadius: 5,
            background: '#E8633A', border: 'none', cursor: 'pointer',
            color: 'white', fontSize: font === 'handwritten' ? 17 : 14,
            fontWeight: 700, fontFamily: 'inherit',
          }}
        >
          Speichern
        </button>
      </div>
    </div>
  );
}
