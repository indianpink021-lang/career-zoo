"use strict";

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

const state = {
  spec: null,
  screen: "intro",
  step: 0,
  profile: null,
  answers: {},
  result: null,
  locked: false,
};

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function assetUrl(path) {
  return `assets/${path.split("/").at(-1)}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function focusMain() {
  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadSpec() {
  const response = await fetch("test-spec.json");
  if (!response.ok) throw new Error("test-spec.json을 불러오지 못했습니다.");
  state.spec = await response.json();
  renderIntro();
}

function renderIntro() {
  state.screen = "intro";
  const spec = state.spec;
  app.innerHTML = `
    <section class="screen hero" aria-labelledby="intro-title">
      <p class="eyebrow">NEXT CAREER ANIMAL TEST</p>
      <img class="hero-cast" src="assets/explorer_rabbit.png" alt="지도를 살펴보는 탐색 토끼" />
      <h1 id="intro-title">${escapeHtml(spec.meta.title)}</h1>
      <p class="hero-copy">${escapeHtml(spec.meta.subtitle)}</p>
      <div class="meta-pills" aria-label="테스트 정보">
        <span class="pill">총 ${spec.meta.questionCount}문항</span>
        <span class="pill">약 ${spec.meta.estimatedMinutes}분</span>
        <span class="pill">회원가입 없음</span>
      </div>
      <button class="primary-button" type="button" id="start-button">내 전직 동물 찾기</button>
      <p class="disclaimer">${escapeHtml(spec.disclaimer)}</p>
    </section>`;
  document.querySelector("#start-button").addEventListener("click", () => {
    state.step = 0;
    renderQuestion();
  });
  focusMain();
}

function allQuestions() {
  return [...state.spec.profileQuestions, ...state.spec.scoredQuestions];
}

function renderQuestion() {
  state.screen = "question";
  state.locked = false;
  const questions = allQuestions();
  const question = questions[state.step];
  const isProfile = state.step < state.spec.profileQuestions.length;
  const selected = isProfile ? state.profile : state.answers[question.id];
  const progress = Math.round((state.step / questions.length) * 100);
  const options = question.options.map((option) => `
    <button class="option-button" type="button" data-option="${escapeHtml(option.id)}"
      aria-pressed="${selected === option.id}">${escapeHtml(option.label)}</button>`).join("");

  app.innerHTML = `
    <section class="screen" aria-labelledby="question-title">
      <div class="topbar">
        <div class="progress-label"><span>다음 직업 찾는 중</span><span>${state.step + 1} / ${questions.length}</span></div>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
      </div>
      <article class="question-card">
        <p class="question-kicker">${isProfile ? "현재의 나" : `상황 ${state.step}`}</p>
        <h2 id="question-title" tabindex="-1">${escapeHtml(question.prompt)}</h2>
        <div class="options" role="group" aria-labelledby="question-title">${options}</div>
      </article>
      <div class="question-actions">
        <button class="text-button" type="button" id="back-button">${state.step === 0 ? "처음으로" : "이전 질문"}</button>
        ${isProfile && !question.required ? '<button class="text-button" type="button" id="skip-button">건너뛰기</button>' : ""}
      </div>
    </section>`;

  document.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => chooseOption(question, button.dataset.option, isProfile));
  });
  document.querySelector("#back-button").addEventListener("click", goBack);
  document.querySelector("#skip-button")?.addEventListener("click", () => {
    state.profile = "other";
    advance();
  });
  focusMain();
  document.querySelector("#question-title").focus({ preventScroll: true });
}

function chooseOption(question, optionId, isProfile) {
  if (state.locked) return;
  state.locked = true;
  if (isProfile) state.profile = optionId;
  else state.answers[question.id] = optionId;
  document.querySelectorAll("[data-option]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.option === optionId));
    button.disabled = true;
  });
  window.setTimeout(advance, 130);
}

function advance() {
  const total = allQuestions().length;
  if (state.step < total - 1) {
    state.step += 1;
    renderQuestion();
  } else {
    renderCalculating();
  }
}

function goBack() {
  if (state.step === 0) renderIntro();
  else {
    state.step -= 1;
    renderQuestion();
  }
}

function renderCalculating() {
  state.screen = "calculating";
  app.innerHTML = `
    <section class="screen loading-card" aria-labelledby="loading-title">
      <p class="eyebrow">CAREER ANIMAL MATCHING</p>
      <h2 id="loading-title">동물 친구들이 답을 몰래 훑어보는 중…</h2>
      <div class="loading-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>`;
  focusMain();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => {
    state.result = calculateResult();
    renderResult();
  }, reduced ? 50 : 850);
}

function calculateResult() {
  const spec = state.spec;
  const dimensions = spec.dimensions.map((dimension) => dimension.id);
  const lookup = new Map();
  const appearances = Object.fromEntries(spec.archetypes.map((item) => [item.id, 0]));
  spec.scoredQuestions.forEach((question) => question.options.forEach((option) => {
    lookup.set(option.id, option);
    appearances[option.archetype] += 1;
  }));

  const votes = Object.fromEntries(spec.archetypes.map((item) => [item.id, 0]));
  const totals = Object.fromEntries(dimensions.map((dimension) => [dimension, 0]));
  spec.scoredQuestions.forEach((question) => {
    const option = lookup.get(state.answers[question.id]);
    votes[option.archetype] += 1;
    dimensions.forEach((dimension) => { totals[dimension] += option.weights[dimension]; });
  });
  const averages = Object.fromEntries(dimensions.map((dimension) => [dimension, totals[dimension] / spec.scoredQuestions.length]));
  const normalized = Object.fromEntries(spec.archetypes.map((item) => [item.id, votes[item.id] / appearances[item.id]]));
  const best = Math.max(...Object.values(normalized));
  let candidates = spec.archetypes.filter((item) => Math.abs(normalized[item.id] - best) < 1e-9);
  if (candidates.length > 1) {
    const distances = candidates.map((item) => ({
      item,
      distance: dimensions.reduce((sum, dimension) => sum + (averages[dimension] - item.vector[dimension]) ** 2, 0),
    }));
    const minimum = Math.min(...distances.map((entry) => entry.distance));
    candidates = distances.filter((entry) => Math.abs(entry.distance - minimum) < 1e-9).map((entry) => entry.item);
  }
  const strongest = dimensions.reduce((winner, dimension) => Math.abs(averages[dimension]) > Math.abs(averages[winner]) ? dimension : winner, dimensions[0]);
  const dimension = spec.dimensions.find((item) => item.id === strongest);
  const secondary = averages[strongest] >= 0 ? dimension.positive : dimension.negative;
  return { archetype: candidates[0], averages, secondary };
}

function bridgeCopy(archetype) {
  const field = state.profile || "other";
  const fieldLabel = state.spec.currentFieldLabels[field] || state.spec.currentFieldLabels.other;
  const skills = state.spec.transferableSkillMap[field] || state.spec.transferableSkillMap.other;
  return state.spec.bridgeTemplate
    .replace("{currentField}", fieldLabel)
    .replace("{skill1}", skills[0])
    .replace("{skill2}", skills[1])
    .replace("{bridgeTheme}", archetype.bridge_theme);
}

function dimensionRows() {
  const { averages } = state.result;
  return state.spec.dimensions.map((dimension) => {
    const value = averages[dimension.id];
    const width = Math.max(3, Math.abs(value) / 2 * 50);
    const marginLeft = value >= 0 ? 50 : 50 - width;
    return `
      <div class="dimension-row">
        <span>${escapeHtml(dimension.negative)}</span>
        <div class="dimension-bar" aria-label="${escapeHtml(dimension.negative)}에서 ${escapeHtml(dimension.positive)} 사이 ${value.toFixed(2)}">
          <div class="dimension-value" style="width:${width}%;margin-left:${marginLeft}%"></div>
        </div>
        <span>${escapeHtml(dimension.positive)}</span>
      </div>`;
  }).join("");
}

function renderResult() {
  state.screen = "result";
  const item = state.result.archetype;
  const careers = item.career_groups.map((group) => `
    <div class="career-card"><strong>${escapeHtml(group.name)}</strong><span>${group.examples.map(escapeHtml).join(" · ")}</span></div>`).join("");
  const keywords = item.career_groups.map((group) => `<span class="keyword">${escapeHtml(group.name)}</span>`).join("");
  app.innerHTML = `
    <section class="screen result-screen" style="--result-accent:${item.accent};--result-soft:${item.accent}20" aria-labelledby="result-title">
      <header class="result-hero">
        <p class="eyebrow">당신의 다음 직업 동물은</p>
        <img class="result-character" src="${assetUrl(item.asset)}" alt="${escapeHtml(item.alt)}" />
        <h1 class="result-name" id="result-title" tabindex="-1">${escapeHtml(item.name)}</h1>
        <p class="catchphrase">“${escapeHtml(item.catchphrase)}”</p>
        <div class="tag-row"><span class="tag">보조 성향 · ${escapeHtml(state.result.secondary)}</span></div>
      </header>
      <article class="result-section"><h3>들켰네요, 이런 타입이에요</h3><p>${escapeHtml(item.description)}</p></article>
      <article class="result-section"><h3>이럴 때 살아나요</h3><p>${escapeHtml(item.thrives_when)}</p></article>
      <article class="result-section"><h3>슬쩍 구경해볼 직무군</h3><div class="career-grid">${careers}</div></article>
      <article class="result-section"><h3>지금 일에서 챙겨갈 것</h3><p>${escapeHtml(bridgeCopy(item))}</p></article>
      <article class="result-section"><h3>업무 성향 온도계</h3><div class="dimension-list">${dimensionRows()}</div></article>
      <article class="result-section"><h3>이런 환경에서는 털이 곤두서요</h3><p>${escapeHtml(item.draining_environment)}</p></article>
      <div class="keyword-row">${keywords}</div>
      <div class="result-actions">
        <button class="primary-button" type="button" id="save-card">결과 이미지 저장</button>
        <button class="secondary-button" type="button" id="restart">다시 하기</button>
      </div>
      <p class="disclaimer">${escapeHtml(state.spec.disclaimer)}</p>
    </section>`;
  document.querySelector("#save-card").addEventListener("click", downloadResultCard);
  document.querySelector("#restart").addEventListener("click", restart);
  focusMain();
  document.querySelector("#result-title").focus({ preventScroll: true });
}

function restart() {
  state.step = 0;
  state.profile = null;
  state.answers = {};
  state.result = null;
  renderIntro();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = [...text];
  let line = "";
  let lineIndex = 0;
  for (const word of words) {
    const candidate = line + word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y + lineIndex * lineHeight);
      line = word;
      lineIndex += 1;
      if (lineIndex >= maxLines - 1) break;
    } else line = candidate;
  }
  context.fillText(line, x, y + lineIndex * lineHeight);
}

async function downloadResultCard() {
  const item = state.result.archetype;
  const canvas = document.createElement("canvas");
  canvas.width = state.spec.resultCard.width;
  canvas.height = state.spec.resultCard.height;
  const context = canvas.getContext("2d");
  const image = await loadImage(assetUrl(item.asset));

  context.fillStyle = "#fffaf0";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = `${item.accent}24`;
  roundedRect(context, 70, 70, 940, 1210, 72);
  context.strokeStyle = "#292725";
  context.lineWidth = 7;
  context.strokeRect(72, 72, 936, 1206);

  context.textAlign = "center";
  context.fillStyle = "#d65e4b";
  context.font = "700 28px system-ui, sans-serif";
  context.fillText("나의 다음 직업 찾기", 540, 145);

  const maxW = 600;
  const maxH = 520;
  const scale = Math.min(maxW / image.width, maxH / image.height);
  const drawW = image.width * scale;
  const drawH = image.height * scale;
  context.drawImage(image, (1080 - drawW) / 2, 180 + (520 - drawH) / 2, drawW, drawH);

  context.fillStyle = "#292725";
  context.font = '900 76px "Arial Rounded MT Bold", system-ui, sans-serif';
  context.fillText(item.name, 540, 790);
  context.font = "700 34px system-ui, sans-serif";
  wrapCanvasText(context, `“${item.catchphrase}”`, 540, 855, 800, 48, 2);

  context.fillStyle = item.accent;
  roundedRect(context, 310, 950, 460, 66, 33);
  context.fillStyle = "#292725";
  context.font = "700 28px system-ui, sans-serif";
  context.fillText(`보조 성향 · ${state.result.secondary}`, 540, 993);

  context.font = "700 27px system-ui, sans-serif";
  let x = 110;
  item.career_groups.forEach((group) => {
    context.fillStyle = "#ffffff";
    roundedRect(context, x, 1080, 270, 82, 28);
    context.fillStyle = "#292725";
    context.fillText(group.name, x + 135, 1131);
    x += 295;
  });

  context.fillStyle = "#6f6962";
  context.font = "500 21px system-ui, sans-serif";
  context.fillText("재미를 위한 자기 탐색 콘텐츠예요. 진로를 대신 결정하지 않아요.", 540, 1225);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `나의-다음-직업-${item.name}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("결과 이미지를 저장했어요.");
  }, "image/png");
}

loadSpec().catch((error) => {
  app.innerHTML = `<section class="loading-card"><h1>앗, 동물들이 길을 잃었어요.</h1><p>${escapeHtml(error.message)}</p><p>로컬 서버로 실행했는지 확인해주세요.</p></section>`;
});

