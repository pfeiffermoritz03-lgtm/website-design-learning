import {
  collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

function habitsCol(uid)  { return collection(db, 'users', uid, 'habits');  }
function entriesCol(uid) { return collection(db, 'users', uid, 'entries'); }
function settingsDoc(uid){ return doc(db, 'users', uid, 'settings', 'main'); }

export async function loadUserData(uid) {
  const [habSnap, entSnap, setSnap] = await Promise.all([
    getDocs(habitsCol(uid)),
    getDocs(entriesCol(uid)),
    getDocs(collection(db, 'users', uid, 'settings')),
  ]);
  const habits   = habSnap.docs.map(d => d.data());
  const entries  = entSnap.docs.map(d => d.data());
  const setDoc_  = setSnap.docs.find(d => d.id === 'main');
  const settings = setDoc_ ? setDoc_.data() : null;
  return { habits, entries, settings };
}

export async function saveHabit(uid, habit) {
  await setDoc(doc(habitsCol(uid), habit.id), habit);
}

export async function removeHabit(uid, habitId) {
  await deleteDoc(doc(habitsCol(uid), habitId));
}

export async function saveEntry(uid, entry) {
  const id = `${entry.habitId}_${entry.date}`;
  await setDoc(doc(entriesCol(uid), id), entry);
}

export async function saveSettings(uid, settings) {
  await setDoc(settingsDoc(uid), settings);
}

export async function saveAllHabits(uid, habits) {
  const batch = writeBatch(db);
  habits.forEach(h => batch.set(doc(habitsCol(uid), h.id), h));
  await batch.commit();
}

export function subscribeUserData(uid, onChange) {
  const unsub1 = onSnapshot(habitsCol(uid),  () => onChange('habits'));
  const unsub2 = onSnapshot(entriesCol(uid), () => onChange('entries'));
  return () => { unsub1(); unsub2(); };
}
