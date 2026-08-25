# NeoTunes Technical Debt Tracking

| Debt Item | Impact | Solution Strategy | Priority |
| :--- | :--- | :--- | :--- |
| LocalStorage Fallback Storage | Large JSONs in localStorage can hit 5MB browser quota | Migrate offline metadata cache to IndexedDB via idb-keyval | Medium |
| Web Audio API Context Autoplay | Browsers require user gesture before unlocking AudioContext | Maintain pre-initialized silent buffer on first user click | Low |
