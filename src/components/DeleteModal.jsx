export default function DeleteModal({ habit, font, onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="anim-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFF9F0',
          borderRadius: 6,
          padding: '28px 20px 20px',
          minWidth: 240,
          maxWidth: 300,
          position: 'relative',
          boxShadow: '3px 6px 18px rgba(0,0,0,0.35)',
          fontFamily: font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif",
          textAlign: 'center',
        }}
      >
        <div style={{
          position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
          width: 14, height: 14, borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 35%, #E8E8E8, #8C8C8C 70%)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.45)',
        }} />

        <div style={{ fontSize: font === 'handwritten' ? 20 : 15, fontWeight: 700, color: '#2A2A2A', marginBottom: 8 }}>
          Habit löschen?
        </div>
        <div style={{ fontSize: font === 'handwritten' ? 15 : 12, color: '#555', marginBottom: 18 }}>
          „{habit.name}" und alle Einträge werden dauerhaft entfernt.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '8px', borderRadius: 5,
              border: '1px solid rgba(0,0,0,0.2)', background: 'transparent',
              cursor: 'pointer', fontSize: font === 'handwritten' ? 16 : 13,
              fontFamily: 'inherit', color: '#2A2A2A',
            }}
          >Abbrechen</button>
          <button
            onClick={() => onConfirm(habit.id)}
            style={{
              flex: 1, padding: '8px', borderRadius: 5,
              background: '#E8633A', border: 'none', cursor: 'pointer',
              color: 'white', fontSize: font === 'handwritten' ? 16 : 13,
              fontWeight: 700, fontFamily: 'inherit',
            }}
          >Löschen</button>
        </div>
      </div>
    </div>
  );
}
