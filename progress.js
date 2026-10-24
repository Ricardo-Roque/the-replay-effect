// Registro de progresso do funil no Supabase (Edge Function "track-replay-en").
// Nunca bloqueia a tela: eventos vão para uma fila em localStorage e são
// enviados em segundo plano. Só saem da fila depois de resposta 2xx.
(() => {
  // URL da Edge Function, ex: https://<project-ref>.supabase.co/functions/v1/track-replay
  // Vazio = tracking desligado (nada é enviado nem guardado).
  const TRACK_URL = "https://bionetfauvpcwlhqvvum.supabase.co/functions/v1/track-replay-en";

  // Testes locais não sujam o banco de produção.
  const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

  if (!TRACK_URL || isLocal) {
    window.replayTrack = () => {};
    return;
  }

  const QUEUE_KEY = "er_queue";
  const SID_KEY = "er_sid";
  const SEQ_KEY = "er_seq";
  const MAX_QUEUE = 300;
  const MAX_BATCH = 40;

  const memory = {};
  const store = (area) => ({
    get(key) {
      try {
        return window[area].getItem(key);
      } catch {
        return memory[area + key] ?? null;
      }
    },
    set(key, value) {
      try {
        window[area].setItem(key, value);
      } catch {
        memory[area + key] = value;
      }
    },
  });
  const local = store("localStorage");
  const session = store("sessionStorage");

  const uuid = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
          (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
        );

  // Uma sessão por visita (aba). Reabrir o link cria outra linha.
  let sid = session.get(SID_KEY);
  if (!sid) {
    sid = uuid();
    session.set(SID_KEY, sid);
  }
  // Identificador da visita (uma linha em replay_en_sessions).
  window.replaySid = sid;

  const readQueue = () => {
    try {
      const queue = JSON.parse(local.get(QUEUE_KEY) || "[]");
      return Array.isArray(queue) ? queue : [];
    } catch {
      return [];
    }
  };
  const writeQueue = (queue) => local.set(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));

  let sending = false;
  let failures = 0;
  let timer = null;

  function nextSeq() {
    const seq = Number(session.get(SEQ_KEY) || 0) + 1;
    session.set(SEQ_KEY, String(seq));
    return seq;
  }

  // Eventos saem em lotes, no máximo a cada 3 s (um envio a cada poucas respostas, não um por clique).
  const BATCH_EVERY = 3000;
  // Nada sai antes da página terminar de carregar: o pixel do Meta tem a banda só para ele.
  let pageReady = document.readyState === "complete";

  function schedule(delay, { reset = false } = {}) {
    if (!pageReady) return;
    if (timer && !reset) return; // já tem envio marcado: o evento novo vai junto
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, delay);
  }

  function drop(batch) {
    const sent = new Set(batch.map((event) => `${event.sid}:${event.seq}`));
    writeQueue(readQueue().filter((event) => !sent.has(`${event.sid}:${event.seq}`)));
  }

  // force = saída da página ou clique no checkout: manda tudo que ainda não foi confirmado,
  // mesmo com outro envio em andamento. O servidor ignora seq repetido, então não duplica,
  // e aplica os eventos na ordem certa qualquer que seja o lote que chegar primeiro.
  function flush(force = false) {
    if (sending && !force) return;
    const queue = readQueue();
    if (!queue.length) return;

    // Um lote por sessão, na ordem: sobras de visitas antigas saem com o sid delas.
    const batchSid = queue[0].sid;
    const batch = queue.filter((event) => event.sid === batchSid).slice(0, MAX_BATCH);
    const events = batch.map(({ sid: _sid, ...event }) => event);
    if (!force) sending = true;

    // text/plain evita o preflight de CORS (uma ida e volta a menos).
    fetch(TRACK_URL, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ sid: batchSid, events }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        drop(batch);
        failures = 0;
        if (!force) sending = false;
        if (readQueue().length) schedule(0, { reset: true });
      })
      .catch((error) => {
        if (!force) sending = false;
        const status = Number(error.message);
        // 4xx (payload inválido) é descartado para não travar a fila para sempre.
        if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
          drop(batch);
          if (readQueue().length) schedule(0, { reset: true });
          return;
        }
        failures += 1;
        schedule(Math.min(30000, 1000 * 2 ** failures), { reset: true });
      });
  }

  // replayTrack("answer", { key, value }, { now: true })
  window.replayTrack = (type, data = {}, { now = false } = {}) => {
    const queue = readQueue();
    queue.push({ sid, seq: nextSeq(), type, ...data });
    writeQueue(queue);
    if (now) flush(true);
    else schedule(BATCH_EVERY);
  };

  const flushNow = () => flush(true);
  // Reenvia quando a rede volta; na saída da página, manda o que faltar (keepalive).
  window.addEventListener("online", () => flush());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushNow();
  });
  window.addEventListener("pagehide", flushNow);

  // Primeiro envio só depois do load (inclui sobras de visitas anteriores).
  const start = () => {
    pageReady = true;
    schedule(1000);
  };
  if (pageReady) start();
  else window.addEventListener("load", start, { once: true });
})();
