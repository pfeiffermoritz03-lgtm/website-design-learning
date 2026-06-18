import { useState } from 'react';

const COLORS = [
  { key: 'yellow',    bg: '#F4D35E' },
  { key: 'pink',      bg: '#F2A6A6' },
  { key: 'mint',      bg: '#A8D8B9' },
  { key: 'lightblue', bg: '#A6CEF2' },
  { key: 'lavender',  bg: '#C9A8E8' },
];

export default function SettingsModal({ settings, font, onSave, onClose, onReset }) {
  const [theme,   setTheme]   = useState(settings.theme);
  const [fnt,     setFnt]     = useState(settings.font);
  const [color,   setColor]   = useState(settings.defaultColor);
  const [confirm, setConfirm] = useState(false);

  const ff = fnt === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif";

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="anim-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFF8EE',
          borderRadius: 6,
          padding: '30px 22px 22px',
          minWidth: 280,
          maxWidth: 340,
          position: 'relative',
          boxShadow: '3px 6px 24px rgba(0,0,0,0.35)',
          fontFamily: ff,
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
        <button onClick={onClose} style={{
          position: 'absolute', top: 8, right: 12,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 20, color: '#555', lineHeight: 1,
        }}>×</button>

        <div style={{ fontSize: fnt === 'handwritten' ? 22 : 17, fontWeight: 700, color: '#2A2A2A', marginBottom: 18 }}>
          ⚙️ Einstellungen
        </div>

        {/* Theme */}
        <Row label="Darstellung" font={fnt}>
          <ToggleSwitch
            on={theme === 'dark'}
            onChange={v => setTheme(v ? 'dark' : 'light')}
            icons={['☀️', '🌙']}
          />
        </Row>

        {/* Font */}
        <Row label="Schriftart" font={fnt}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['handwritten', 'modern'].map(f => (
              <button
                key={f}
                onClick={() => setFnt(f)}
                style={{
                  padding: '4px 10px', borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.25)',
                  background: fnt === f ? '#E8633A' : 'transparent',
                  color: fnt === f ? 'white' : '#2A2A2A',
                  cursor: 'pointer',
                  fontSize: f === 'handwritten' ? 14 : 11,
                  fontFamily: f === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif",
                  fontWeight: fnt === f ? 700 : 400,
                }}
              >
                {f === 'handwritten' ? 'Handschrift' : 'Modern'}
              </button>
            ))}
          </div>
        </Row>

        {/* Default color */}
        <Row label="Standard-Farbe" font={fnt}>
          <div style={{ display: 'flex', gap: 7 }}>
            {COLORS.map(c => (
              <div
                key={c.key}
                onClick={() => setColor(c.key)}
                className={`swatch${color === c.key ? ' active' : ''}`}
                style={{ background: c.bg, width: 26, height: 26 }}
              />
            ))}
          </div>
        </Row>

        {/* Save */}
        <button
          onClick={() => onSave({ theme, font: fnt, defaultColor: color })}
          style={{
            width: '100%', padding: '9px', marginTop: 14,
            borderRadius: 5, background: '#E8633A', border: 'none',
            cursor: 'pointer', color: 'white',
            fontSize: fnt === 'handwritten' ? 17 : 14,
            fontWeight: 700, fontFamily: ff,
          }}
        >
          Speichern
        </button>

        {/* Reset */}
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#E8633A', fontSize: fnt === 'handwritten' ? 14 : 11,
                fontFamily: ff, textDecoration: 'underline',
              }}
            >
              Alle Daten löschen
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirm(false)}
                style={{
                  flex: 1, padding: '7px', borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.2)', background: 'transparent',
                  cursor: 'pointer', fontFamily: ff,
                  fontSize: fnt === 'handwritten' ? 15 : 12,
                }}
              >Abbrechen</button>
              <button
                onClick={onReset}
                style={{
                  flex: 1, padding: '7px', borderRadius: 4,
                  background: '#C0392B', border: 'none', cursor: 'pointer',
                  color: 'white', fontFamily: ff, fontWeight: 700,
                  fontSize: fnt === 'handwritten' ? 15 : 12,
                }}
              >Bestätigen</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, font, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontSize: font === 'handwritten' ? 16 : 13, color: '#2A2A2A' }}>{label}</span>
      {children}
    </div>
  );
}

function ToggleSwitch({ on, onChange, icons }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 16 }}>{icons[0]}</span>
      <div style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? '#555' : '#ddd',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: 'white',
          position: 'absolute', top: 2,
          left: on ? 22 : 2,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
      <span style={{ fontSize: 16 }}>{icons[1]}</span>
    </div>
  );
}
