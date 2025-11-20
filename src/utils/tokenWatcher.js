// src/utils/tokenWatcher.js
// Debug utility untuk track siapa yang menghapus token

let isWatching = false;

export function startTokenWatcher() {
  if (isWatching) return;
  isWatching = true;

  console.log("🔍 Token Watcher: Started");

  // Override localStorage.removeItem untuk track
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);
  const originalClear = localStorage.clear.bind(localStorage);
  const originalSetItem = localStorage.setItem.bind(localStorage);

  localStorage.removeItem = function(key) {
    if (key === 'siswa_token' || key === 'token') {
      console.error("🗑️ Token removed:", key);
      console.trace("Stack trace:"); // Ini akan show siapa yang call removeItem
    }
    return originalRemoveItem(key);
  };

  localStorage.clear = function() {
    console.error("🗑️ localStorage.clear() called!");
    console.trace("Stack trace:");
    return originalClear();
  };

  localStorage.setItem = function(key, value) {
    if (key === 'siswa_token' || key === 'token') {
      console.log("💾 Token set:", key, "value length:", value?.length || 0);
      console.trace("Stack trace:");
    }
    return originalSetItem(key, value);
  };
}

export function stopTokenWatcher() {
  isWatching = false;
  console.log("🔍 Token Watcher: Stopped");
  // Note: Can't easily restore original functions once overridden
}