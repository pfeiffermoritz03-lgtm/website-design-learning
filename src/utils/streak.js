export function calcStreak(habitId, entries) {
  const today = todayStr();
  let streak = 0;
  let cursor = new Date();

  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const entry = entries.find(e => e.habitId === habitId && e.date === dateStr);
    if (entry && entry.done) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // Allow today to be missing without breaking streak
      if (dateStr === today && streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        const yesterdayEntry = entries.find(e => e.habitId === habitId && e.date === cursor.toISOString().slice(0, 10));
        if (yesterdayEntry && yesterdayEntry.done) {
          cursor = new Date();
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  return streak;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekDays() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}
