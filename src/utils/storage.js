export async function loadKey(key, fallback) {
  try {
    const result = await window.storage.get(key);
    return result ? JSON.parse(result.value) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveKey(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value));
  } catch {
    // silently fail – storage unavailable
  }
}
