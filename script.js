// Se progress.js não carregar (bloqueio, rede), o quiz segue sem registrar.
const replayTrack = (...args) => window.replayTrack?.(...args);

const app = document.querySelector("#app");
const backButton = document.querySelector("#backButton");
const progressBar = document.querySelector("#progressBar");
const landingParams = new URLSearchParams(window.location.search);

const brand = "The Replay Effect";

// Especialista que assina a carta da tela "protocolo". Nome vazio = a carta sai sem a apresentação
// pessoal. Só use o nome, a profissão e os números de uma pessoa real, com permissão e dados verificáveis.
const expert = {
  name: "Ethan Bennett",
  role: "psychoanalyst",
  years: 7,
  helped: "over 30,000 women",
  cases: "over 8,000 cases",
};

// Casos da carta da tela "protocolo" (nome, cidade e prints). Exemplos adaptados da referência:
// substituir por casos reais de clientes, com autorização, antes de anunciar.
const cases = [
  { name: "Jessica", city: "from Dallas, Texas", image: "images/image-depoimento-01.webp", size: [880, 660] },
  { name: "Sophia", city: "from Denver, Colorado", image: "images/image-depoimento-02.webp", size: [880, 880] },
  { name: "Ashley", city: "from Atlanta, Georgia", image: "images/image-depoimento-03.webp", size: [880, 880] },
];

// VSL (última tela do quiz).
const vslConfig = {
  // Player VTurb (ConverteAI): id do vídeo e script do player, copiados do código de incorporação.
  playerId: "vid-6adc01ea4b8512e83db6a26a",
  playerScript: "https://scripts.converteai.net/c2417bee-66d1-4b80-bf5d-35c849b7e2fa/players/6adc01ea4b8512e83db6a26a/v4/player.js",
  // Arquivos que o player baixa primeiro: pré-carregados duas telas antes da VSL (ver warmVsl).
  preload: [
    ["https://scripts.converteai.net/c2417bee-66d1-4b80-bf5d-35c849b7e2fa/players/6adc01ea4b8512e83db6a26a/v4/player.js", "script"],
    ["https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js", "script"],
    ["https://cdn.converteai.net/c2417bee-66d1-4b80-bf5d-35c849b7e2fa/6adc01a93ed0561e2bfd4769/main.m3u8", "fetch"],
  ],
  // Botão de compra abaixo do player (#oferta-vsl). Começa oculto e quem revela é o VTurb, no segundo
  // do pitch configurado no painel (seletor #oferta-vsl). O link leva as UTMs junto (ver [data-checkout]).
  offer: {
    // Checkout VendePay do produto principal. Vazio = o botão aparece, mas não sai da página.
    checkoutUrl: "https://checkout.vendepay.com/8df2c586-23ae-4214-9bb7-ab0968852401",
    cta: "I WANT MY EX BACK",
  },
};

const iconCheck = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"></path></svg>`;

const steps = [
  {
    id: "capa",
    kind: "cover",
  },
  {
    id: "termino",
    kind: "single",
    title: "When did you two break up?",
    options: ["Less than a week ago", "1 to 4 weeks ago", "1 to 3 months ago", "More than 3 months ago"],
    icons: ["💔", "📅", "🗓️", "⏳"],
  },
  {
    id: "contato",
    kind: "single",
    title: "Are you two still in any kind of contact these days?",
    options: ["Yes, we talk every now and then", "He talks to me, but he's cold and distant", "He only replies to be polite", "No, he blocked me everywhere"],
    icons: ["💬", "🥶", "🙂", "🚫"],
  },
  {
    id: "dor",
    kind: "single",
    title: "What hurts the most since you broke up?",
    options: ["A crushing loneliness", "Guilt and regret", "Anxiety and fear of the future", "Picturing him with another woman"],
    icons: ["😔", "😣", "😰", "💔"],
  },
  {
    id: "outra",
    kind: "single",
    title: "If he truly fell in love with another woman, what would happen to you?",
    options: [
      "I'd completely fall apart",
      "I'd be hurt, but I'd try to move on",
      "I'd try to win him back no matter what",
      "I'd pretend I don't care, but I'd be dying inside",
    ],
    icons: ["😵", "😕", "🔥", "🎭"],
  },
  {
    id: "prazo",
    kind: "single",
    title: "How much time do you think you have left before he forgets you completely?",
    options: [
      "A few days — I feel like I'm already being replaced",
      "A few weeks — there's still time to act",
      "A few months — I think he still feels something",
      "I don't know, but I'm afraid to find out",
    ],
    icons: ["⌛", "⏰", "💭", "😨"],
  },
  {
    id: "protocolo",
    kind: "letter",
    alert: "WARNING: don't leave this page!",
    // !!texto!! = destaque vermelho, ++texto++ = destaque verde.
    title: "Your chances of getting back with your ex are !!only 12%!! — that's critical — but if you follow this protocol, you can ++make sure++ he comes back 👇",
    blocks: () => [
      {
        text: [
          "Hi there,",
          expert.name && `My name is **${expert.name}**.`,
          expert.name && `I've been a ${expert.role} for ${expert.years} years, and I've helped **${expert.helped}** get back with their ex.`,
          "And if it's up to me, within the next 48 hours **you'll be next.**",
        ],
      },
      { image: "images/instagram-ethan-bennett.webp", size: [800, 242], emoji: "👤" },
      {
        text: [
          `Look, I've worked with **${expert.cases} of women just like you** who wanted their ex back.`,
          "Some of them had **much lower chances than you**.",
          "But by following the right protocol, **they won their ex back in less than a week**.",
          `Like **${cases[0].name}, ${cases[0].city}**, who was blocked… and still **got him to come back**.`,
        ],
      },
      { image: cases[0].image, size: cases[0].size, emoji: "💬" },
      {
        text: [
          `Or **${cases[1].name}, ${cases[1].city}**, who saw her ex going out with **another woman**.`,
          "All she had to do was follow the protocol I'm about to show you…",
          "and in just **7 days he came back** to her.",
          "**Take a look 👇**",
        ],
      },
      { image: cases[1].image, size: cases[1].size, emoji: "💬" },
      {
        text: [
          `And then there's **${cases[2].name}, ${cases[2].city}**, who cheated on her boyfriend…`,
          "but despite her mistakes, **she got back together with him**.",
        ],
      },
      { image: cases[2].image, size: cases[2].size, emoji: "💬" },
      {
        text: [`And they're just **3 of the ${expert.helped}** I've helped **get their ex back in only 7 days**. Look ⬇️`],
      },
      { image: "images/image-depoimento-04.webp", size: [880, 880], emoji: "💬" },
      {
        lead: "If these women, who were in a **worse situation than yours**, got back with their ex in less than 7 days, **you can too. Here's how 👇**",
      },
      {
        center: true,
        text: [
          "Based on your answers, !!your chances of getting back with him are 12%!!",
          "That's because a **man's** brain has **two sides: the rational and the emotional**.",
          "And everything you've done so far to win him back… **only convinced him that breaking up was the best thing that could have happened.**",
          "It's as if **his emotional side has been switched off**, leaving you in an **emotional blackout**.",
          "The good news is that **this emotional side can be switched back on** when you use **the right trigger**.",
          "And that trigger can be activated **with a single 3-word message**.",
        ],
      },
    ],
    question: "Do you want me to reveal this message to you now?",
    options: ["Yes, reveal it now", "I need to know more about this message"],
    note: "**Oh, and don't worry:** even if he's blocked you, we'll show you ways to get him to reply.",
  },
  {
    id: "saudade",
    kind: "single",
    title: "Besides the **3-word message**, would you like me to show you how to make his brain miss you and **come running back to you**, even if he's with another woman right now?",
    options: ["Yes, I want him to miss me", "Yes, if it's straight to the point"],
    icons: ["💘", "✅"],
  },
  {
    id: "video",
    kind: "single",
    title: "If there were a short 60-second video showing the exact step-by-step to get your ex **back within the next 48 hours**, would you commit to watching it to the end?",
    options: ["Yes, I want to watch it now", "Yes, I want to watch it and use it today", "Yes, but I want to understand every detail"],
    icons: ["▶️", "⚡", "🔍"],
  },
  {
    id: "vsl",
    kind: "vsl",
    title: "Watch the video below to **get your** ex back in 48 hours 👇",
    // Uma linha a mais para quem disse que foi bloqueada (tela "contato").
    blocked: "Even if he blocked you: the video shows you how to get him to reply.",
  },
];

const state = {
  index: 0,
  answers: {},
  picks: {},
  selected: [],
  timers: [],
  trackedIndex: -1,
};

function rich(text = "") {
  return text
    .replace(/\{brand\}/g, brand)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/!!([^!]+)!!/g, '<strong class="is-bad">$1</strong>')
    .replace(/\+\+([^+]+)\+\+/g, '<strong class="is-good">$1</strong>');
}

function imageTag(path, [width, height] = [800, 600], emoji = "") {
  return `<img src="${path}" alt="" width="${width}" height="${height}" decoding="async"${emoji ? ` data-emoji="${emoji}"` : ""} />`;
}

// Imagem que ainda não existe vira uma caixa com o nome do arquivo esperado,
// para o funil funcionar (e mostrar o que falta) enquanto as artes não ficam prontas.
function guardImages(root) {
  root.querySelectorAll("img").forEach((image) => {
    const swap = () => {
      const box = document.createElement("div");
      box.className = "img-placeholder";
      const emoji = image.dataset.emoji;
      box.innerHTML = `${emoji ? `<span class="img-placeholder__emoji">${emoji}</span>` : ""}<small>${image.getAttribute("src").split("?")[0]}</small>`;
      image.replaceWith(box);
    };
    if (image.complete && image.naturalWidth === 0) swap();
    else image.addEventListener("error", swap, { once: true });
  });
}

// Índice da opção escolhida (0 = primeira). -1 se a pergunta não foi respondida.
// Serve para telas condicionais: { when: () => pick("contato") === 3 }.
function pick(id) {
  return state.picks[id] ?? -1;
}

function isActive(step) {
  return !step.when || step.when();
}

// Entrada em cascata: cada bloco sobe um pouco depois do anterior.
function stagger(root) {
  [...root.children].forEach((child, index) => {
    if (child.classList.contains("cta-bar")) child.style.setProperty("--delay", `${160 + index * 70}ms`);
    else child.style.setProperty("--delay", `${80 + index * 70}ms`);
    child.classList.add("rise");
  });
}

function setScreen(html) {
  coverPrerendered = false;
  app.classList.remove("screen");
  void app.offsetWidth;
  app.classList.add("screen");
  app.innerHTML = html;
  stagger(app);
  guardImages(app);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function updateHeader() {
  backButton.classList.toggle("is-visible", state.index > 0);
  // Barra de progresso do topo, como na referência: +10% por tela (capa 10%, tela 2 20%...).
  // Ajustar quando o quiz completo estiver montado.
  progressBar.style.width = `${Math.min(100, (state.index + 1) * 10)}%`;
}

// Telas visitadas, para o "voltar" respeitar pulos e ramificações.
const visited = [];

function goTo(index) {
  visited.push(state.index);
  state.index = index;
  render();
}

function next() {
  let index = state.index + 1;
  while (index < steps.length - 1 && !isActive(steps[index])) index += 1;
  goTo(Math.min(index, steps.length - 1));
}

function back() {
  state.index = visited.pop() ?? 0;
  render();
}

function answer(value, index) {
  const step = steps[state.index];
  state.answers[step.id] = value;
  if (index !== undefined) state.picks[step.id] = index;
  replayTrack("answer", { key: step.id, value });
  state.selected = [];
  next();
}

// Resposta única: marca a opção e avança sozinho depois de 300 ms.
function choose(button, value, index) {
  if (app.dataset.locked) return;
  app.dataset.locked = "1";
  button.classList.add("is-active");
  const timer = setTimeout(() => {
    delete app.dataset.locked;
    answer(value, index);
  }, 300);
  state.timers.push(timer);
}

const renderers = {
  cover: renderCover,
  single: (step) => renderQuestion(step, false),
  multi: (step) => renderQuestion(step, true),
  letter: renderLetter,
  vsl: renderVsl,
};

function render() {
  state.timers.forEach((timer) => clearTimeout(timer));
  state.timers = [];
  delete app.dataset.locked;
  updateHeader();
  const step = steps[state.index];
  if (state.index > state.trackedIndex) {
    state.trackedIndex = state.index;
    replayTrack("step", { idx: state.index, id: step.id });
  }
  renderers[step.kind](step);
  prefetchAhead();
  const vslIndex = steps.findIndex((item) => item.kind === "vsl");
  if (vslIndex !== -1 && state.index >= vslIndex - 2) warmVsl();
}

// Imagens de uma tela (para baixar antes de ela aparecer).
function stepImages(step) {
  if (step.kind === "letter") return step.blocks().map((block) => block.image).filter(Boolean);
  return [step.image].filter(Boolean);
}

// Baixa em segundo plano as imagens das próximas telas, para elas já aparecerem prontas.
// Só começa depois da página carregada, para não disputar banda com o pixel e a primeira tela.
const prefetched = new Set();
function prefetchAhead() {
  if (document.readyState !== "complete") return window.addEventListener("load", prefetchAhead, { once: true });
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  idle(() => {
    // Só as próximas 2 telas: quem sai na capa não baixa as imagens da carta (tela 7).
    for (let i = state.index + 1; i < steps.length && i <= state.index + 2; i += 1) {
      const urls = isActive(steps[i]) ? stepImages(steps[i]) : [];
      urls.forEach((url) => {
        if (prefetched.has(url)) return;
        prefetched.add(url);
        new Image().src = url;
      });
    }
  });
}

function ctaBar(label, id, { disabled = false } = {}) {
  return `<div class="cta-bar"><button class="primary" id="${id}" type="button"${disabled ? " disabled" : ""}>${label}</button></div>`;
}

// A capa vem pronta no index.html (aparece antes do script). Guardamos o HTML dela
// para redesenhar quando a pessoa volta para a primeira tela.
const coverHTML = app.innerHTML;
let coverPrerendered = Boolean(app.querySelector(".cover"));

function renderCover() {
  if (coverPrerendered) coverPrerendered = false;
  else setScreen(coverHTML);
  app.querySelector("#coverStart").addEventListener("click", next);
}

function renderQuestion(step, multi) {
  const saved = state.answers[step.id];
  const selected = new Set(state.selected.length ? state.selected : Array.isArray(saved) ? saved : []);
  const buttons = step.options
    .map((label, index) => {
      const active = selected.has(label) ? " is-active" : "";
      const emoji = step.icons?.[index];
      const icon = emoji ? `<span class="option__emoji" aria-hidden="true">${emoji}</span>` : "";
      const tail = multi ? `<span class="check" aria-hidden="true">${iconCheck}</span>` : "";
      return `<button class="option${active}" data-option="${index}" type="button">${icon}<span class="option__label">${label}</span>${tail}</button>`;
    })
    .join("");

  setScreen(`
    <h1 class="title">${rich(step.title)}</h1>
    ${step.subtitle ? `<p class="subtitle">${rich(step.subtitle)}</p>` : ""}
    <div class="options">${buttons}</div>
    ${multi ? ctaBar("Continue","continueStep", { disabled: !selected.size }) : ""}
  `);

  const continueButton = app.querySelector("#continueStep");

  app.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.option);
      const label = step.options[index];
      if (!multi) return choose(button, label, index);
      if (selected.has(label)) selected.delete(label);
      else selected.add(label);
      state.selected = [...selected];
      button.classList.toggle("is-active", selected.has(label));
      continueButton.disabled = !selected.size;
    });
  });

  continueButton?.addEventListener("click", () => answer([...selected]));
}

// Carta longa (tela "protocolo"): aviso, título, blocos de texto e imagens, e no fim
// uma pergunta com duas respostas empilhadas (as duas avançam).
function renderLetter(step) {
  const blocks = step
    .blocks()
    .map((block) => {
      if (block.image) return `<div class="letter__image${block.bare ? " letter__image--bare" : ""}">${imageTag(block.image, block.size, block.emoji)}</div>`;
      if (block.lead) return `<p class="letter__lead">${rich(block.lead)}</p>`;
      const lines = block.text.filter(Boolean).map((line) => `<p>${rich(line)}</p>`).join("");
      return `<div class="letter__text${block.center ? " letter__text--center" : ""}">${lines}</div>`;
    })
    .join("");
  setScreen(`
    <p class="letter__alert">${step.alert}</p>
    <h1 class="title title--center">${rich(step.title)}</h1>
    ${blocks}
    <h2 class="letter__question">${rich(step.question)}</h2>
    <div class="options options--stack">
      ${step.options.map((label, index) => `<button class="option" data-option="${index}" type="button"><span class="option__label">${label}</span></button>`).join("")}
    </div>
    <p class="letter__note">${rich(step.note)}</p>
  `);
  app.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.option);
      choose(button, step.options[index], index);
    });
  });
}

// Pré-carrega o player da VSL (scripts e início do vídeo) quando a pessoa chega perto dela,
// e não na capa: assim a VSL abre rápido sem disputar banda com a primeira tela (connect rate).
let vslWarm = false;
function warmVsl() {
  if (vslWarm) return;
  vslWarm = true;
  vslConfig.preload.forEach(([href, as]) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    if (as === "fetch") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

// O script do player só roda uma vez; se a pessoa voltar e entrar de novo, o elemento se reconecta sozinho.
let vslScriptAdded = false;
function loadVslPlayer() {
  if (vslScriptAdded) return;
  vslScriptAdded = true;
  const script = document.createElement("script");
  script.src = vslConfig.playerScript;
  script.async = true;
  document.head.appendChild(script);
}

// Última tela: VSL. O botão de compra fica dentro do player (VTurb) e aparece no momento do pitch.
function renderVsl(step) {
  const blocked = pick("contato") === 3;
  setScreen(`
    <h1 class="title title--center title--big">${rich(step.title)}</h1>
    ${blocked ? `<p class="subtitle subtitle--center">${rich(step.blocked)}</p>` : ""}
    <div class="vsl-player">
      <vturb-smartplayer id="${vslConfig.playerId}" style="display: block; margin: 0 auto; width: 100%; max-width: 400px;"><div class="vturb-player-placeholder" style="position: relative; width: 100%; padding: 177.77777777777777% 0 0; z-index: 0; background-color: black;"></div></vturb-smartplayer>
    </div>
    ${vslOfferHTML()}
  `);
  loadVslPlayer();
  watchVslOffer();
}

// Botão da oferta, separado do player. O display:none inline é o que o VTurb troca ao revelar.
function vslOfferHTML() {
  const offer = vslConfig.offer;
  return `
    <div id="oferta-vsl" class="vsl-offer" style="display: none;">
      <a class="primary vsl-offer__cta" href="${offer.checkoutUrl || "#"}" data-checkout>${offer.cta}</a>
    </div>
  `;
}

// Só observa: registra no tracking quando o VTurb revela a oferta (não mexe na exibição).
function watchVslOffer() {
  const offer = app.querySelector("#oferta-vsl");
  const observer = new MutationObserver(() => {
    if (offer.style.display === "none") return;
    observer.disconnect();
    replayTrack("answer", { key: "oferta_vsl", value: "visivel" });
  });
  observer.observe(offer, { attributes: true, attributeFilter: ["style", "class"] });
}

// Parâmetros de campanha registrados no tracking da visita (evento landing).
const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id", "fbclid", "gclid", "src", "sck", "xcod"];

// Links de checkout ([data-checkout]): registra o clique e leva junto os parâmetros da campanha (UTMs, fbclid...).
// Pixel: nenhum evento sai daqui; InitiateCheckout e Purchase ficam com a VendePay.
document.addEventListener(
  "click",
  (event) => {
    const link = event.target.closest("a[data-checkout]");
    if (!link) return;
    // Sem link configurado (href="#"): não sai da página.
    let url;
    try {
      url = new URL(link.getAttribute("href"));
    } catch {
      event.preventDefault();
      return;
    }
    replayTrack("checkout", { plan: link.dataset.plan || "plano" }, { now: true });
    // O que o link já tiver (ex.: colocado pela UTMify) não é sobrescrito.
    landingParams.forEach((value, key) => {
      if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
    });
    link.href = url.toString();
  },
  true,
);

backButton.addEventListener("click", back);

replayTrack("landing", {
  meta: {
    utm: Object.fromEntries(trackingParams.filter((key) => landingParams.get(key)).map((key) => [key, landingParams.get(key)])),
    referrer: document.referrer.slice(0, 300),
  },
});

// Só em ambiente local: ?step=<id> abre direto numa tela.
if (["localhost", "127.0.0.1"].includes(window.location.hostname) && landingParams.get("step")) {
  const target = steps.findIndex((step) => step.id === landingParams.get("step"));
  if (target !== -1) state.index = target;
}
render();
