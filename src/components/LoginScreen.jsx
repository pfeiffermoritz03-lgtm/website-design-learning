import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase.js';

export default function LoginScreen({ font }) {
  const [mode,     setMode]     = useState('login'); // 'login' | 'register' | 'reset'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [info,     setInfo]     = useState('');
  const [loading,  setLoading]  = useState(false);

  const ff = font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif";

  const handle = async () => {
    setError(''); setInfo(''); setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await sendPasswordResetEmail(auth, email);
        setInfo('E-Mail gesendet! Bitte prüfe dein Postfach.');
      }
    } catch (e) {
      const msgs = {
        'auth/user-not-found':    'Kein Konto mit dieser E-Mail.',
        'auth/wrong-password':    'Falsches Passwort.',
        'auth/email-already-in-use': 'E-Mail bereits registriert.',
        'auth/weak-password':     'Passwort zu schwach (min. 6 Zeichen).',
        'auth/invalid-email':     'Ungültige E-Mail-Adresse.',
        'auth/invalid-credential':'E-Mail oder Passwort falsch.',
      };
      setError(msgs[e.code] || e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#1a1a1a',
    }}>
      {/* Wood frame */}
      <div style={{
        width: '100%', maxWidth: 420, height: '100%', maxHeight: 860,
        background: 'linear-gradient(160deg, #E8C87A 0%, #D9B36C 25%, #C4993A 55%, #D4AD60 78%, #E0C070 100%)',
        boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.15), 0 6px 24px rgba(0,0,0,0.45)',
        borderRadius: 10, padding: 14, display: 'flex',
      }}>
        {/* Cork */}
        <div style={{
          flex: 1, borderRadius: 4,
          backgroundColor: '#C8975A',
          backgroundImage: `
            radial-gradient(ellipse at 15% 25%, rgba(169,118,62,0.55) 0%, transparent 45%),
            radial-gradient(ellipse at 80% 15%, rgba(184,132,72,0.45) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 65%, rgba(169,118,62,0.40) 0%, transparent 42%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Login card */}
          <div style={{
            background: '#FFF8EE', borderRadius: 6,
            padding: '32px 24px 24px', width: '82%', maxWidth: 300,
            boxShadow: '2px 4px 10px rgba(0,0,0,0.28)',
            position: 'relative', fontFamily: ff,
          }}>
            {/* Pin */}
            <div style={{
              position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
              width: 14, height: 14, borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 35%, #E8E8E8, #8C8C8C 70%)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.45)',
            }} />

            <div style={{ fontSize: font === 'handwritten' ? 26 : 20, fontWeight: 700, color: '#2A2A2A', textAlign: 'center', marginBottom: 4 }}>
              📌 Habit Tracker
            </div>
            <div style={{ fontSize: font === 'handwritten' ? 15 : 12, color: '#888', textAlign: 'center', marginBottom: 20 }}>
              {mode === 'login'    && 'Anmelden'}
              {mode === 'register' && 'Konto erstellen'}
              {mode === 'reset'    && 'Passwort zurücksetzen'}
            </div>

            <input
              type="email" placeholder="E-Mail"
              value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle(font)}
            />
            {mode !== 'reset' && (
              <input
                type="password" placeholder="Passwort"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handle()}
                style={inputStyle(font)}
              />
            )}

            {error && <div style={{ color: '#C0392B', fontSize: font === 'handwritten' ? 14 : 11, marginBottom: 8 }}>{error}</div>}
            {info  && <div style={{ color: '#27ae60', fontSize: font === 'handwritten' ? 14 : 11, marginBottom: 8 }}>{info}</div>}

            <button
              onClick={handle} disabled={loading}
              style={{
                width: '100%', padding: '9px', borderRadius: 5,
                background: loading ? '#ccc' : '#E8633A',
                border: 'none', cursor: loading ? 'default' : 'pointer',
                color: 'white', fontSize: font === 'handwritten' ? 18 : 14,
                fontWeight: 700, fontFamily: ff, marginBottom: 12,
              }}
            >
              {loading ? '...' : mode === 'login' ? 'Anmelden' : mode === 'register' ? 'Registrieren' : 'Link senden'}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              {mode !== 'login' && (
                <button onClick={() => { setMode('login'); setError(''); setInfo(''); }} style={linkStyle(font)}>
                  ← Zurück zur Anmeldung
                </button>
              )}
              {mode === 'login' && (
                <>
                  <button onClick={() => { setMode('register'); setError(''); }} style={linkStyle(font)}>
                    Noch kein Konto? Registrieren
                  </button>
                  <button onClick={() => { setMode('reset'); setError(''); }} style={linkStyle(font)}>
                    Passwort vergessen?
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = (font) => ({
  width: '100%', padding: '8px 10px', borderRadius: 4, marginBottom: 10,
  border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.7)',
  fontSize: font === 'handwritten' ? 17 : 13,
  fontFamily: font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif",
  outline: 'none', color: '#2A2A2A', boxSizing: 'border-box',
});

const linkStyle = (font) => ({
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#E8633A', fontSize: font === 'handwritten' ? 14 : 11,
  fontFamily: font === 'handwritten' ? "'Caveat', cursive" : "'Inter', sans-serif",
  textDecoration: 'underline', padding: 0,
});
