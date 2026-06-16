// ─── Fetch wrapper with auth ───────────────────────────────────
async function apiFetch(path, opts = {}) {
  const headers = opts.headers || {};
  if (STATE.token) headers['Authorization'] = `Bearer ${STATE.token}`;
  const res = await fetch(path, { ...opts, headers });
  if (res.status === 401) { toast('Auth required — restart server'); throw new Error('Unauthorized'); }
  return res;
}

// ─── Ollama API ────────────────────────────────────────────────
async function ollamaFetch(method, body) {
  const url = `${STATE.ollamaHost}/api/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Ollama ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res;
}

async function fetchModels() {
  const res = await ollamaFetch('tags');
  const data = await res.json();
  STATE.modelMap = {};
  (data.models || []).forEach(m => {
    const name = m.name;
    STATE.modelMap[name] = {
      size: m.size,
      modified: m.modified_at,
      details: m.details || {},
    };
  });
  return Object.keys(STATE.modelMap);
}

async function checkOllama() {
  try {
    const names = await fetchModels();
    return names.length > 0;
  } catch {
    return false;
  }
}
