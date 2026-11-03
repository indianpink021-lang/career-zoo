"use strict";

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
window.gtag("js", new Date());
window.gtag("config", "G-WHM8Y81MM2");

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

function trackEvent(name, parameters = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, parameters);
}

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
  if (!restoreResultFromUrl()) renderIntro();
}

function resultStatePayload() {
  return { profile: state.profile, answers: state.answers };
}

function persistResultInUrl() {
  const encoded = encodeURIComponent(window.btoa(JSON.stringify(resultStatePayload())));
  const url = new URL(window.location.href);
  url.hash = `result=${encoded}`;
  window.history.replaceState(null, "", url);
}

function clearResultFromUrl() {
  if (!window.location.hash.startsWith("#result=")) return;
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(null, "", url);
}

function restoreResultFromUrl() {
  const encoded = new URLSearchParams(window.location.hash.slice(1)).get("result");
  if (!encoded) return false;
  try {
    const payload = JSON.parse(window.atob(decodeURIComponent(encoded)));
    const profileOptions = new Set(state.spec.profileQuestions.flatMap((question) => question.options.map((option) => option.id)));
    const validProfile = profileOptions.has(payload.profile) || payload.profile === "other";
    const validAnswers = state.spec.scoredQuestions.every((question) => {
      const selected = payload.answers?.[question.id];
      return question.options.some((option) => option.id === selected);
    });
    if (!validProfile || !validAnswers) throw new Error("invalid result state");
    state.profile = payload.profile;
    state.answers = payload.answers;
    state.result = calculateResult();
    renderResult({ trackCompletion: false });
    trackEvent("result_restore", { archetype_id: state.result.archetype.id });
    return true;
  } catch (error) {
    clearResultFromUrl();
    return false;
  }
}

function renderIntro() {
  state.screen = "intro";
  const spec = state.spec;
  app.innerHTML = `
    <section class="screen hero" aria-labelledby="intro-title">
      <p class="eyebrow">NEXT CAREER TEST</p>
      <img class="hero-cast" src="assets/explorer_rabbit.png" alt="지도를 살펴보는 탐색하는 토끼" />
      <div class="hero-heading">
        <h1 id="intro-title"><span>나의</span><span>다음 직업 찾기</span></h1>
        <p class="hero-copy">지금 일은 잠깐 내려두고,<br />다음 직업의 동물을 만나보세요.</p>
      </div>
      <div class="meta-pills" aria-label="테스트 정보">
        <span class="pill">${spec.meta.questionCount}문항</span>
        <span class="pill">약 ${spec.meta.estimatedMinutes}분</span>
        <span class="pill">가입 없음</span>
      </div>
      <button class="primary-button" type="button" id="start-button">내 전직 동물 찾기</button>
      <p class="disclaimer">재미를 위한 자기 탐색 콘텐츠예요. 진로를 대신 결정하지 않아요.</p>
    </section>`;
  document.querySelector("#start-button").addEventListener("click", () => {
    trackEvent("test_start", { question_count: allQuestions().length });
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
  const progress = Math.round(((state.step + 1) / questions.length) * 100);
  const options = question.options.map((option) => `
    <button class="option-button" type="button" data-option="${escapeHtml(option.id)}"
      aria-pressed="${selected === option.id}">${escapeHtml(option.label)}</button>`).join("");

  app.innerHTML = `
    <section class="screen question-screen" aria-labelledby="question-title">
      <div class="topbar">
        <div class="progress-label"><span>다음 직업 찾는 중</span><span>${state.step + 1} / ${questions.length}</span></div>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
      </div>
      <article class="question-card">
        <p class="question-kicker">${isProfile ? "현재의 나" : `상황 ${state.step}`}</p>
        <h2 id="question-title" tabindex="-1">${escapeHtml(question.prompt)}</h2>
      </article>
      <div class="options" role="group" aria-labelledby="question-title">${options}</div>
      <p class="question-hint">👀 오래 고민하면 동물 친구들이 먼저 골라요</p>
      <div class="question-actions">
        <button class="text-button" type="button" id="back-button">← ${state.step === 0 ? "처음으로" : "이전 질문"}</button>
        ${isProfile && !question.required ? '<button class="text-button" type="button" id="skip-button">잘 모르겠어요 →</button>' : ""}
      </div>
    </section>`;

  document.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => chooseOption(question, button.dataset.option, isProfile));
  });
  document.querySelector("#back-button").addEventListener("click", goBack);
  document.querySelector("#skip-button")?.addEventListener("click", () => {
    state.profile = "other";
    trackEvent("question_answer", {
      question_id: question.id,
      option_id: "other",
      question_number: state.step + 1,
      question_type: "profile",
    });
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
  trackEvent("question_answer", {
    question_id: question.id,
    option_id: optionId,
    question_number: state.step + 1,
    question_type: isProfile ? "profile" : "scored",
  });
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
  const signals = { independence: 0, leadership: 0, visibility: 0 };
  spec.scoredQuestions.forEach((question) => {
    const option = lookup.get(state.answers[question.id]);
    votes[option.archetype] += 1;
    dimensions.forEach((dimension) => { totals[dimension] += option.weights[dimension]; });
    Object.entries(option.signals || {}).forEach(([signal, value]) => { signals[signal] += value; });
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
  const archetype = candidates[0];
  return { archetype, averages, secondary, signals, careers: chooseCareerPaths(archetype, signals) };
}

const CAREER_MODE_LABELS = {
  stable: "전문 실무",
  independent: "독립·사업",
  public: "대중·콘텐츠",
  leadership: "리더십",
};

// A few characters were cut from a shared illustration sheet. These small
// insets hide neighboring-sheet fragments without trimming the character.
const CHARACTER_CROPS = {
  maker_hamster: { top: 0, right: 0, bottom: 18, left: 0 },
  creator_chinchilla: { top: 14, right: 0, bottom: 0, left: 0 },
};

function characterCrop(id) {
  return CHARACTER_CROPS[id] || { top: 0, right: 0, bottom: 0, left: 0 };
}

function characterCropStyle(id) {
  const crop = characterCrop(id);
  return `--crop-top:${crop.top}px;--crop-right:${crop.right}px;--crop-bottom:${crop.bottom}px;--crop-left:${crop.left}px`;
}

function chooseCareerPaths(archetype, signals) {
  const eligible = [
    { id: "independent", score: signals.independence },
    { id: "public", score: signals.visibility },
    { id: "leadership", score: signals.leadership },
  ].filter((entry) => entry.score >= 2).sort((a, b) => b.score - a.score).slice(0, 2);
  const modes = ["stable", ...eligible.map((entry) => entry.id)];
  while (modes.length < 3) modes.push("stable");
  const used = {};
  return modes.map((mode) => {
    const choices = archetype.career_tracks[mode];
    const index = used[mode] || 0;
    used[mode] = index + 1;
    return { mode, label: CAREER_MODE_LABELS[mode], title: choices[index % choices.length] };
  });
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

function renderResult({ trackCompletion = true } = {}) {
  state.screen = "result";
  const item = state.result.archetype;
  persistResultInUrl();
  if (trackCompletion) {
    trackEvent("test_complete", {
      archetype_id: item.id,
      question_count: allQuestions().length,
    });
  }
  const careerCards = state.result.careers.map((career) => `
    <div class="career-card">
      <span class="career-mode">${escapeHtml(career.label)}</span>
      <strong>${escapeHtml(career.title)}</strong>
    </div>`).join("");
  app.innerHTML = `
    <section class="screen result-screen" style="--result-accent:${item.accent};--result-soft:${item.accent}20" aria-labelledby="result-title">
      <header class="result-hero">
        <p class="eyebrow">당신의 다음 직업 동물은</p>
        <img class="result-character" style="${characterCropStyle(item.id)}" src="${assetUrl(item.asset)}" alt="${escapeHtml(item.alt)}" />
        <h1 class="result-name" id="result-title" tabindex="-1">${escapeHtml(item.name)}</h1>
        <p class="catchphrase">“${escapeHtml(item.catchphrase)}”</p>
        <div class="tag-row"><span class="tag">보조 성향 · ${escapeHtml(state.result.secondary)}</span></div>
      </header>
      <article class="result-section"><h3>이런 타입이에요</h3><p>${escapeHtml(item.description)}</p></article>
      <article class="result-section career-section"><h3>당신에게 열려 있는 세 갈래</h3><div class="career-paths">${careerCards}</div><p class="bridge-copy">${escapeHtml(bridgeCopy(item))}</p></article>
      <div class="result-actions">
        <button class="primary-button" type="button" id="save-card">결과 이미지 저장</button>
        <button class="text-button restart-button" type="button" id="restart">↻ 다시 해보기</button>
      </div>
    </section>`;
  document.querySelector("#save-card").addEventListener("click", downloadResultCard);
  document.querySelector("#restart").addEventListener("click", restart);
  focusMain();
  document.querySelector("#result-title").focus({ preventScroll: true });
}

function restart() {
  trackEvent("test_restart", {
    from_screen: state.screen,
    archetype_id: state.result?.archetype?.id || "none",
  });
  state.step = 0;
  state.profile = null;
  state.answers = {};
  state.result = null;
  clearResultFromUrl();
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

function drawCareerCardTitle(context, text, x, maxWidth) {
  context.font = "700 24px system-ui, sans-serif";
  if (context.measureText(text).width <= maxWidth) {
    context.fillText(text, x, 1131);
    return;
  }
  const words = text.split(" ");
  let lines;
  if (words.length > 1) {
    let best = 1;
    let difference = Infinity;
    for (let index = 1; index < words.length; index += 1) {
      const left = words.slice(0, index).join(" ");
      const right = words.slice(index).join(" ");
      const nextDifference = Math.abs(left.length - right.length);
      if (nextDifference < difference) {
        difference = nextDifference;
        best = index;
      }
    }
    lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  } else {
    const characters = [...text];
    const middle = Math.ceil(characters.length / 2);
    lines = [characters.slice(0, middle).join(""), characters.slice(middle).join("")];
  }
  let size = 20;
  context.font = `700 ${size}px system-ui, sans-serif`;
  while (Math.max(...lines.map((line) => context.measureText(line).width)) > maxWidth && size > 14) {
    size -= 1;
    context.font = `700 ${size}px system-ui, sans-serif`;
  }
  context.fillText(lines[0], x, 1119);
  context.fillText(lines[1], x, 1144);
}

function drawCharacter(context, image, id, x, y, maxWidth, maxHeight) {
  const crop = characterCrop(id);
  const sourceWidth = image.width - crop.left - crop.right;
  const sourceHeight = image.height - crop.top - crop.bottom;
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(
    image,
    crop.left,
    crop.top,
    sourceWidth,
    sourceHeight,
    x + (maxWidth - drawWidth) / 2,
    y + (maxHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("이미지를 만들지 못했습니다."));
    }, "image/png");
  });
}

function isMobileDevice() {
  return navigator.userAgentData?.mobile === true
    || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isKakaoInAppBrowser() {
  return /KAKAOTALK/i.test(navigator.userAgent);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  showToast("결과 이미지를 저장했어요.");
}

function showImageSavePreview(blob, item) {
  const url = URL.createObjectURL(blob);
  const kakaoBrowser = isKakaoInAppBrowser();
  const title = kakaoBrowser ? "카카오톡에서는 다른 브라우저로 열어주세요" : "이미지를 길게 눌러 저장하세요";
  const description = kakaoBrowser
    ? "우측 하단의 ⋮ 버튼을 누르고 ‘다른 브라우저로 열기’를 선택하세요. 현재 결과 화면이 그대로 이어집니다."
    : "메뉴가 나타나면 ‘사진에 저장’ 또는 ‘이미지 저장’을 선택하세요.";
  const dialog = document.createElement("div");
  dialog.className = "image-save-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "image-save-title");
  dialog.innerHTML = `
    <div class="image-save-panel">
      <div class="image-save-heading">
        <div>
          <h2 id="image-save-title">${title}</h2>
          <p>${description}</p>
        </div>
        <button class="image-save-close" type="button" aria-label="저장용 이미지 닫기">×</button>
      </div>
      <img src="${url}" alt="${escapeHtml(item.name)} 결과 카드 저장용 이미지" />
    </div>`;
  document.body.append(dialog);

  const closeButton = dialog.querySelector(".image-save-close");
  const close = () => {
    document.removeEventListener("keydown", handleKeydown);
    dialog.remove();
    URL.revokeObjectURL(url);
    document.querySelector("#save-card")?.focus();
  };
  const handleKeydown = (event) => {
    if (event.key === "Escape") close();
  };
  closeButton.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  document.addEventListener("keydown", handleKeydown);
  closeButton.focus();
}

async function saveResultImage(blob, item) {
  const filename = `나의-다음-직업-${item.name}.png`;
  let file = null;
  try {
    file = new File([blob], filename, { type: "image/png" });
  } catch (error) {
    // Older in-app browsers may not expose the File constructor.
  }

  if (isMobileDevice()
    && file
    && typeof navigator.share === "function"
    && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `나의 다음 직업: ${item.name}` });
      showToast("공유 메뉴에서 이미지 저장을 선택할 수 있어요.");
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  if (isMobileDevice()) {
    showImageSavePreview(blob, item);
    return;
  }

  downloadBlob(blob, filename);
}

async function downloadResultCard() {
  const item = state.result.archetype;
  trackEvent("result_image_save", { archetype_id: item.id });
  const canvas = document.createElement("canvas");
  canvas.width = state.spec.resultCard.width;
  canvas.height = state.spec.resultCard.height;
  const context = canvas.getContext("2d");
  const image = await loadImage(assetUrl(item.asset));

  context.fillStyle = "#fffaf0";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = `${item.accent}24`;
  roundedRect(context, 70, 70, 940, 1210, 72);

  context.textAlign = "center";
  context.fillStyle = "#d65e4b";
  context.font = "700 28px system-ui, sans-serif";
  context.fillText("나의 다음 직업 찾기", 540, 145);

  drawCharacter(context, image, item.id, 240, 180, 600, 520);

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

  let x = 110;
  state.result.careers.forEach((career) => {
    context.fillStyle = "#ffffff";
    roundedRect(context, x, 1080, 270, 82, 28);
    context.fillStyle = "#292725";
    drawCareerCardTitle(context, career.title, x + 135, 230);
    x += 295;
  });

  context.fillStyle = "#6f6962";
  context.font = "500 21px system-ui, sans-serif";
  context.fillText("재미를 위한 자기 탐색 콘텐츠예요. 진로를 대신 결정하지 않아요.", 540, 1225);

  try {
    const blob = await canvasToBlob(canvas);
    await saveResultImage(blob, item);
  } catch (error) {
    showToast("이미지 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
  }
}

loadSpec().catch((error) => {
  app.innerHTML = `<section class="loading-card"><h1>앗, 동물들이 길을 잃었어요.</h1><p>${escapeHtml(error.message)}</p><p>로컬 서버로 실행했는지 확인해주세요.</p></section>`;
});

