const NOTE_W = 160;
const NOTE_H = 160;
const PAD = 10;

export function getBBox(habit) {
  return {
    x: habit.position.x,
    y: habit.position.y,
    w: NOTE_W,
    h: NOTE_H,
  };
}

export function overlaps(a, b) {
  return (
    a.x < b.x + b.w + PAD &&
    a.x + a.w + PAD > b.x &&
    a.y < b.y + b.h + PAD &&
    a.y + a.h + PAD > b.y
  );
}

export function findFreePosition(existing, boardW, boardH, skipId = null) {
  const NOTE_COLS = Math.floor(boardW / (NOTE_W + 20));
  const STEP = NOTE_W + 20;
  const VSTEP = NOTE_H + 20;

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < (NOTE_COLS || 2); col++) {
      const x = 20 + col * STEP;
      const y = 20 + row * VSTEP;
      if (x + NOTE_W > boardW - 20) continue;
      if (y + NOTE_H > boardH - 20) continue;
      const candidate = { x, y, w: NOTE_W, h: NOTE_H };
      const collision = existing
        .filter(h => h.id !== skipId)
        .some(h => overlaps(candidate, getBBox(h)));
      if (!collision) return { x, y };
    }
  }
  // Fallback: random placement
  return {
    x: 20 + Math.random() * Math.max(boardW - NOTE_W - 40, 10),
    y: 20 + Math.random() * Math.max(boardH - NOTE_H - 100, 10),
  };
}

export function resolveDisplacement(draggingId, newPos, habits, boardW, boardH) {
  const updated = habits.map(h => ({ ...h }));
  const dragging = updated.find(h => h.id === draggingId);
  if (!dragging) return updated;
  dragging.position = newPos;

  const others = updated.filter(h => h.id !== draggingId);
  for (const other of others) {
    const dragBox = { x: dragging.position.x, y: dragging.position.y, w: NOTE_W, h: NOTE_H };
    const otherBox = getBBox(other);
    if (!overlaps(dragBox, otherBox)) continue;

    // Try to find a free spot for `other` (no chain reaction)
    const candidates = [
      { x: other.position.x + NOTE_W + 20, y: other.position.y },
      { x: other.position.x - NOTE_W - 20, y: other.position.y },
      { x: other.position.x, y: other.position.y + NOTE_H + 20 },
      { x: other.position.x, y: other.position.y - NOTE_H - 20 },
      { x: other.position.x + NOTE_W + 20, y: other.position.y + NOTE_H + 20 },
      { x: other.position.x - NOTE_W - 20, y: other.position.y - NOTE_H - 20 },
    ];

    for (const cand of candidates) {
      if (cand.x < 0 || cand.y < 0) continue;
      if (cand.x + NOTE_W > boardW) continue;
      if (cand.y + NOTE_H > boardH) continue;
      const candBox = { ...cand, w: NOTE_W, h: NOTE_H };
      const collidesWithOthers = updated
        .filter(h => h.id !== other.id && h.id !== draggingId)
        .some(h => overlaps(candBox, getBBox(h)));
      if (!collidesWithOthers && !overlaps(candBox, dragBox)) {
        other.position = { x: cand.x, y: cand.y };
        break;
      }
    }
  }
  return updated;
}
