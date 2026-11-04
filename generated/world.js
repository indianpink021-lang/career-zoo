"use strict";

const GA_MEASUREMENT_ID = "G-WHM8Y81MM2";
const pageParameters = new URLSearchParams(window.location.search);
const qaMode = pageParameters.get("qa") === "1";
const localMode = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const analyticsEnabled = !qaMode && !localMode;

if (analyticsEnabled) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.append(script);
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
} else {
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
}

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const spritePath = "assets/world_characters.png";

const questions = [
  {
    id: "q01_start",
    prompt: "새로운 일이 시작됐다.\n가장 먼저 해야 마음이 놓이는 것은?",
    options: [
      { label: "사람들과 이야기하며 방향을 잡는다", letter: "E" },
      { label: "혼자 자료를 읽으며 생각을 정리한다", letter: "I" },
    ],
  },
  {
    id: "q02_brief",
    prompt: "설명은 짧고 일은 애매하다.\n어떤 정보가 먼저 필요할까?",
    options: [
      { label: "비슷한 사례와 구체적인 조건", letter: "S" },
      { label: "이 일을 하는 이유와 앞으로의 가능성", letter: "N" },
    ],
  },
  {
    id: "q03_conflict",
    prompt: "회의에서 의견이 팽팽하게 갈렸다.\n내가 꺼낼 첫 번째 카드는?",
    options: [
      { label: "기준과 근거를 놓고 다시 비교한다", letter: "T" },
      { label: "각자가 중요하게 여기는 맥락부터 듣는다", letter: "F" },
    ],
  },
  {
    id: "q04_month",
    prompt: "한 달짜리 프로젝트를 맡았다.\n내 책상 위에는 무엇이 놓일까?",
    options: [
      { label: "마감까지 나눈 일정표와 체크리스트", letter: "J" },
      { label: "상황에 따라 바꿀 수 있는 큰 방향 메모", letter: "P" },
    ],
  },
  {
    id: "q05_blocked",
    prompt: "일이 막혀서 머리가 멈췄다.\n다시 시동을 거는 방법은?",
    options: [
      { label: "누군가에게 말하다 보면 답이 나온다", letter: "E" },
      { label: "조용한 곳에서 혼자 생각을 가다듬는다", letter: "I" },
    ],
  },
  {
    id: "q06_tool",
    prompt: "처음 보는 도구를 써야 한다.\n어느 쪽이 더 나다운가?",
    options: [
      { label: "사용법을 차근차근 따라 하며 익힌다", letter: "S" },
      { label: "일단 눌러 보며 원리와 패턴을 찾는다", letter: "N" },
    ],
  },
  {
    id: "q07_feedback",
    prompt: "동료의 결과물에 아쉬운 점이 보인다.\n나는 어떻게 말할까?",
    options: [
      { label: "고칠 부분과 이유를 명확하게 말한다", letter: "T" },
      { label: "상대가 받아들이기 좋은 방식부터 고른다", letter: "F" },
    ],
  },
  {
    id: "q08_change",
    prompt: "마감 직전에 요구사항이 바뀌었다.\n내 머릿속 첫 반응은?",
    options: [
      { label: "변경 범위를 정리하고 일정을 다시 짠다", letter: "J" },
      { label: "좋아, 지금 가능한 방법부터 찾아본다", letter: "P" },
    ],
  },
  {
    id: "q09_day",
    prompt: "오늘 유난히 일이 잘됐다.\n어떤 하루였을 가능성이 클까?",
    options: [
      { label: "대화와 반응이 오가며 일이 빠르게 굴러갔다", letter: "E" },
      { label: "방해 없이 깊게 몰입할 시간이 충분했다", letter: "I" },
    ],
  },
  {
    id: "q10_review",
    prompt: "완성 직전의 결과물을 다시 본다.\n가장 먼저 눈에 들어오는 것은?",
    options: [
      { label: "빠진 내용과 실제로 작동하지 않는 부분", letter: "S" },
      { label: "더 새롭게 확장할 수 있는 아이디어", letter: "N" },
    ],
  },
  {
    id: "q11_choice",
    prompt: "둘 중 하나를 결정해야 한다.\n마지막까지 놓치고 싶지 않은 것은?",
    options: [
      { label: "일관된 기준과 효율적인 결과", letter: "T" },
      { label: "함께할 사람들의 납득과 관계", letter: "F" },
    ],
  },
  {
    id: "q12_freedom",
    prompt: "아무 간섭 없이 일할 수 있다.\n오히려 힘이 나는 조건은?",
    options: [
      { label: "끝낼 기준과 순서가 분명한 상태", letter: "J" },
      { label: "중간에 방향을 바꿔도 되는 상태", letter: "P" },
    ],
  },
];

const results = {
  INTJ: {
    name: "탑 꼭대기에서 왕국을 설계하는 마법사",
    tagline: "회의는 짧게, 왕국의 큰 그림은 길게 봅니다.",
    description: "혼자 깊이 생각할 시간과 장기적인 목표가 주어질 때 실력이 선명해져요. 복잡한 문제를 구조로 바꾸고, 남들이 놓친 다음 수를 미리 준비하는 타입이에요.",
    keywords: ["장기 설계", "독립 몰입", "복잡한 문제"],
    conditions: ["목표는 분명하되 방법은 맡겨주는 환경", "집중을 끊지 않는 충분한 몰입 시간", "관습보다 더 나은 구조를 제안할 수 있는 문화"],
    drain: "이유 없는 반복 회의와 수시로 뒤집히는 우선순위",
    accent: "#8f78ad", soft: "#f1ebf7", sprite: 0,
  },
  INTP: {
    name: "시계탑의 수수께끼를 푸는 연구가",
    tagline: "잠깐만요, 이 톱니가 왜 이렇게 도는지부터요.",
    description: "궁금한 원리를 끝까지 파고들 수 있을 때 성과가 나요. 정답을 외우기보다 문제의 규칙을 발견하고, 더 영리한 방법을 만드는 데 강해요.",
    keywords: ["원리 탐구", "자율성", "논리 실험"],
    conditions: ["깊게 파고들 가치가 있는 어려운 문제", "생각을 시험해 볼 수 있는 자유", "불필요한 형식보다 논리를 존중하는 동료"],
    drain: "결론을 미리 정해 놓고 맞장구만 요구하는 일",
    accent: "#70839a", soft: "#eaf0f5", sprite: 1,
  },
  ENTJ: {
    name: "잠든 왕국을 깨우는 원정대장",
    tagline: "좋아요. 지도 펴고, 오늘 어디까지 갈지 정하죠.",
    description: "큰 목표와 결정 권한이 주어질 때 속도가 붙어요. 자원을 배치하고 사람을 움직여 어려운 목표를 현실로 만드는 데 에너지를 얻어요.",
    keywords: ["목표 달성", "결정", "추진력"],
    conditions: ["성과 기준과 책임 범위가 선명한 환경", "빠른 결정과 실행을 허용하는 문화", "실력 있는 동료와 높은 난도의 목표"],
    drain: "결정을 미루면서 책임 소재만 따지는 분위기",
    accent: "#b96855", soft: "#f8e9e4", sprite: 2,
  },
  ENTP: {
    name: "램프의 세 가지 소원을 흥정하는 꾀쟁이",
    tagline: "소원이 세 개라면, 네 개로 만드는 방법부터 찾죠.",
    description: "새로운 가능성을 던지고 빠르게 실험할 수 있을 때 빛나요. 익숙한 규칙의 빈틈을 찾아 판을 바꾸고, 사람들과 아이디어를 주고받는 과정에 강해요.",
    keywords: ["발상 전환", "토론", "빠른 실험"],
    conditions: ["새 아이디어를 작게 시험할 수 있는 환경", "직급보다 좋은 논리를 따지는 동료", "문제 정의부터 다시 해도 되는 자율성"],
    drain: "한 번 정한 방식만 계속 반복해야 하는 업무",
    accent: "#c39135", soft: "#fbf0d8", sprite: 3,
  },
  INFJ: {
    name: "저주받은 성의 마음을 읽는 예언가",
    tagline: "성벽보다 그 안에 사는 사람의 마음이 먼저 보여요.",
    description: "의미 있는 목표와 조용한 집중, 깊은 신뢰가 함께 있을 때 강해져요. 말로 드러나지 않은 필요를 읽고 사람과 방향을 연결하는 타입이에요.",
    keywords: ["통찰", "의미", "깊은 신뢰"],
    conditions: ["사람에게 좋은 변화를 만드는 목표", "혼자 정리한 뒤 깊게 대화할 수 있는 리듬", "가치와 행동이 일치하는 조직"],
    drain: "감정을 소모품처럼 여기고 성과만 재촉하는 문화",
    accent: "#8b719b", soft: "#f1eaf4", sprite: 4,
  },
  INFP: {
    name: "별빛을 모아 이야기를 쓰는 몽상가",
    tagline: "그럴듯한 답보다 마음에 오래 남는 답을 찾습니다.",
    description: "나답다고 느끼는 주제와 충분한 자율성이 있을 때 몰입해요. 작은 감정과 가능성을 포착해 자신만의 언어로 의미를 만드는 데 강해요.",
    keywords: ["가치 몰입", "상상력", "자기표현"],
    conditions: ["개인의 취향과 관점을 존중하는 환경", "혼자 생각하고 표현할 수 있는 시간", "진심으로 공감할 수 있는 목적"],
    drain: "가치에 동의하지 못해도 정해진 말만 해야 하는 일",
    accent: "#5e7192", soft: "#e8edf5", sprite: 5,
  },
  ENFJ: {
    name: "길 잃은 일행을 이끄는 숲속 안내자",
    tagline: "다 같이 도착해야 진짜 모험이 끝난 거니까요.",
    description: "사람의 성장과 공동의 목표가 연결될 때 성과가 커져요. 각자의 장점을 알아보고, 모두가 움직일 수 있는 말과 분위기를 만드는 데 능해요.",
    keywords: ["성장 촉진", "조율", "공동 목표"],
    conditions: ["사람의 변화를 가까이에서 볼 수 있는 일", "솔직한 피드백과 따뜻한 협업", "방향을 제안하고 사람을 연결할 기회"],
    drain: "관계의 갈등을 방치한 채 숫자만 요구하는 환경",
    accent: "#718652", soft: "#edf2e5", sprite: 6,
  },
  ENFP: {
    name: "토끼굴에 먼저 뛰어드는 탐험가",
    tagline: "어디로 가는지는 내려가면서 생각해 볼게요.",
    description: "새로운 사람과 가능성을 만날 때 아이디어가 폭발해요. 흥미로운 시작을 만들고 서로 다른 사람을 연결해 예상 밖의 기회를 찾는 타입이에요.",
    keywords: ["새로운 시작", "연결", "가능성"],
    conditions: ["다양한 사람과 주제를 만나는 환경", "아이디어를 빠르게 행동으로 옮길 여지", "개성과 유머를 숨기지 않아도 되는 문화"],
    drain: "변화 없이 세부 절차만 반복하는 긴 업무",
    accent: "#6f9ab7", soft: "#e7f1f6", sprite: 7,
  },
  ISTJ: {
    name: "벽돌집을 끝까지 완성한 셋째 돼지",
    tagline: "바람이 불기 전에 벽돌 수량부터 확인했습니다.",
    description: "기준과 책임이 분명할수록 안정적으로 강한 결과를 만들어요. 작은 약속을 놓치지 않고, 검증된 방법으로 끝까지 완성하는 신뢰형이에요.",
    keywords: ["정확성", "책임", "꾸준한 완성"],
    conditions: ["역할과 마감 기준이 구체적인 환경", "집중해서 순서대로 끝낼 수 있는 업무", "약속과 전문성을 존중하는 동료"],
    drain: "준비 없이 시작하고 뒷수습을 당연하게 맡기는 일",
    accent: "#b96f55", soft: "#f7e9e1", sprite: 8,
  },
  ISFJ: {
    name: "일곱 친구의 아침을 챙기는 숲속 살림꾼",
    tagline: "누가 딸기잼 싫어했는지까지 기억하고 있어요.",
    description: "도움이 필요한 사람이 분명하고 일의 흐름이 안정적일 때 꼼꼼함이 빛나요. 작은 불편을 먼저 발견해 모두가 편안히 일하도록 만드는 타입이에요.",
    keywords: ["세심함", "지원", "안정"],
    conditions: ["기여한 만큼 누군가의 변화가 보이는 일", "예측 가능한 리듬과 협력적인 동료", "세심한 품질을 알아주는 문화"],
    drain: "배려를 당연하게 여기며 갑작스러운 요구를 쏟는 환경",
    accent: "#7f9667", soft: "#edf3e8", sprite: 9,
  },
  ESTJ: {
    name: "자정 전에 호박마차를 출발시키는 총감독",
    tagline: "드레스는 나중이고, 출발 시간부터 맞춥시다.",
    description: "목표와 권한이 명확한 현장에서 빠르게 질서를 만들어요. 해야 할 일을 나누고 진행 상황을 챙겨 약속한 결과를 제시간에 내는 타입이에요.",
    keywords: ["운영", "실행 관리", "명확한 기준"],
    conditions: ["결과와 일정이 분명한 프로젝트", "빠르게 결정하고 바로 실행하는 팀", "성과와 책임을 공정하게 평가하는 문화"],
    drain: "기준은 없는데 모두의 기분만 살펴야 하는 회의",
    accent: "#cf8c3b", soft: "#fbefd9", sprite: 10,
  },
  ESFJ: {
    name: "동물 친구들과 잔치를 여는 숲속 주인공",
    tagline: "자리는 충분하죠? 혼자 먹는 당근은 맛이 없어요.",
    description: "사람들의 반응을 가까이 느끼고 함께 완성할 때 힘이 나요. 필요한 것을 빠르게 챙기며 모두가 참여할 수 있는 분위기를 만드는 데 강해요.",
    keywords: ["관계", "현장 감각", "협력"],
    conditions: ["고객이나 동료와 직접 만나는 환경", "감사와 피드백이 자연스럽게 오가는 팀", "실용적인 도움을 즉시 제공할 수 있는 일"],
    drain: "사람과 단절된 채 결과만 전달받는 긴 독립 업무",
    accent: "#c76f8b", soft: "#f8e8ee", sprite: 11,
  },
  ISTP: {
    name: "나무인형을 뚝딱 고치는 오두막 장인",
    tagline: "설명서는 됐고요. 어디가 고장 났는지 보여주세요.",
    description: "손에 잡히는 문제와 자유로운 해결 권한이 있을 때 놀라운 집중력을 보여요. 군더더기 없이 원인을 찾아 실제로 작동하게 만드는 타입이에요.",
    keywords: ["문제 해결", "손기술", "자율 실행"],
    conditions: ["결과가 눈앞에서 확인되는 실무", "간섭 없이 방법을 선택할 수 있는 환경", "위기에서 빠르게 판단할 수 있는 권한"],
    drain: "실제 문제보다 보고 형식과 말솜씨를 중시하는 문화",
    accent: "#588b8a", soft: "#e4f1ef", sprite: 12,
  },
  ISFP: {
    name: "파도 위에서 자기 노래를 찾는 인어",
    tagline: "남들이 정한 항로보다 내 마음이 움직이는 쪽으로요.",
    description: "감각과 가치관을 자연스럽게 표현할 수 있을 때 좋은 결과가 나와요. 주변의 미묘한 분위기를 읽고, 자신만의 손길로 경험을 아름답게 다듬어요.",
    keywords: ["감각", "자유", "진정성"],
    conditions: ["취향과 손끝의 차이가 결과에 반영되는 일", "경쟁보다 존중이 우선인 조용한 팀", "현재의 감각에 집중할 수 있는 유연성"],
    drain: "개성을 지우고 빠른 자기 홍보만 요구하는 환경",
    accent: "#62a5ae", soft: "#e2f4f4", sprite: 13,
  },
  ESTP: {
    name: "장화를 신고 판을 뒤집는 모험가",
    tagline: "문이 잠겼으면 창문으로 들어가면 되잖아요.",
    description: "즉시 반응이 오는 현장과 도전적인 목표에서 순발력이 살아나요. 상황을 빠르게 읽고 사람과 자원을 활용해 실질적인 결과를 만드는 타입이에요.",
    keywords: ["순발력", "현장", "승부 감각"],
    conditions: ["결정과 결과 사이가 짧은 업무", "예상 밖의 변수가 있는 생생한 현장", "성과에 따라 보상이 분명한 환경"],
    drain: "실행 없이 가정만 반복하는 긴 검토 과정",
    accent: "#477a61", soft: "#e4f0e9", sprite: 14,
  },
  ESFP: {
    name: "유리구두 무도회를 접수한 파티 주인공",
    tagline: "자정 전까지라면 일단 제일 재밌게 해볼게요.",
    description: "사람들의 반응이 바로 돌아오고 분위기를 움직일 수 있을 때 빛나요. 감각적인 표현과 친근한 에너지로 평범한 순간을 기억에 남게 만들어요.",
    keywords: ["표현", "현장 에너지", "즐거운 경험"],
    conditions: ["사람과 직접 반응을 주고받는 무대", "다양한 시도를 환영하는 밝은 팀", "감각과 개성을 성과로 연결할 수 있는 일"],
    drain: "혼자 오래 앉아 미세한 규칙만 확인하는 업무",
    accent: "#d87882", soft: "#fae8ea", sprite: 15,
  },
};

const soulmate = {
  ISTJ: "ESTP", ESTP: "ISTJ", ISFJ: "ESFP", ESFP: "ISFJ",
  INFJ: "ENFP", ENFP: "INFJ", INTJ: "ENTP", ENTP: "INTJ",
  ISTP: "ESTJ", ESTJ: "ISTP", ISFP: "ESFJ", ESFJ: "ISFP",
  INFP: "ENFJ", ENFJ: "INFP", INTP: "ENTJ", ENTJ: "INTP",
};

const friendOnly = {
  ISTJ: "ENFP", ENFP: "ISTJ", ISFJ: "ENTP", ENTP: "ISFJ",
  INFJ: "ESTP", ESTP: "INFJ", INTJ: "ESFP", ESFP: "INTJ",
  ISTP: "ENFJ", ENFJ: "ISTP", ISFP: "ENTJ", ENTJ: "ISFP",
  INFP: "ESTJ", ESTJ: "INFP", INTP: "ESFJ", ESFJ: "INTP",
};

const state = { step: 0, answers: {}, code: null, locked: false };

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

function trackEvent(name, parameters = {}) {
  if (!analyticsEnabled || typeof window.gtag !== "function") return;
  window.gtag("event", name, { test_id: "work_fairy_tale", ...parameters });
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

function spriteStyle(index) {
  const column = index % 4;
  const row = Math.floor(index / 4);
  return `--sprite-x:${(column / 3) * 100}%;--sprite-y:${(row / 3) * 100}%`;
}

function renderIntro() {
  app.innerHTML = `
    <section class="screen hero world-hero" aria-labelledby="intro-title">
      <p class="eyebrow">MY WORK FAIRY TALE</p>
      <div class="world-cast" aria-hidden="true">
        <span class="sprite-character" style="${spriteStyle(13)}"></span>
        <span class="sprite-character" style="${spriteStyle(6)}"></span>
        <span class="sprite-character" style="${spriteStyle(0)}"></span>
      </div>
      <div class="hero-heading">
        <h1 id="intro-title"><span>내가 성과 내는</span><span>세계관 테스트</span></h1>
        <p class="hero-copy">나는 어떤 일과 환경에서 진짜 실력이 나올까?<br />동화 속 주인공에게 슬쩍 물어봤어요.</p>
      </div>
      <div class="meta-pills" aria-label="테스트 정보">
        <span class="pill">12문항</span><span class="pill">약 2분</span><span class="pill">16가지 결과</span>
      </div>
      <button class="primary-button" type="button" id="start-button">내 세계관 입장하기</button>
      <a class="other-test-link" href="index.html">먼저 ‘나의 다음 직업 찾기’ 해보기 →</a>
      <p class="disclaimer world-disclaimer">재미를 위한 자체 업무환경 테스트예요. 공식 MBTI 검사나 과학적 궁합 진단이 아니에요.</p>
    </section>`;
  document.querySelector("#start-button").addEventListener("click", () => {
    trackEvent("world_test_start", { question_count: questions.length });
    state.step = 0;
    renderQuestion();
  });
  focusMain();
}

function renderQuestion() {
  state.locked = false;
  const question = questions[state.step];
  const selected = state.answers[question.id];
  const progress = Math.round(((state.step + 1) / questions.length) * 100);
  app.innerHTML = `
    <section class="screen question-screen world-question" aria-labelledby="question-title">
      <div class="topbar">
        <div class="progress-label"><span>내 세계관 찾는 중</span><span>${state.step + 1} / ${questions.length}</span></div>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><div class="progress-fill" style="width:${progress}%"></div></div>
      </div>
      <article class="question-card">
        <p class="question-kicker">장면 ${state.step + 1}</p>
        <h2 id="question-title" tabindex="-1">${escapeHtml(question.prompt)}</h2>
      </article>
      <div class="options" role="group" aria-labelledby="question-title">
        ${question.options.map((option, index) => `<button class="option-button" type="button" data-option="${index}" aria-pressed="${selected === index}">${escapeHtml(option.label)}</button>`).join("")}
      </div>
      <p class="question-hint">📖 더 멋져 보이는 답 말고, 평소의 나에 가까운 쪽을 골라요</p>
      <div class="question-actions"><button class="text-button" type="button" id="back-button">← ${state.step === 0 ? "처음으로" : "이전 장면"}</button></div>
    </section>`;
  document.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => chooseOption(question, Number(button.dataset.option)));
  });
  document.querySelector("#back-button").addEventListener("click", () => {
    if (state.step === 0) renderIntro();
    else { state.step -= 1; renderQuestion(); }
  });
  focusMain();
  document.querySelector("#question-title").focus({ preventScroll: true });
}

function chooseOption(question, index) {
  if (state.locked) return;
  state.locked = true;
  state.answers[question.id] = index;
  trackEvent("world_question_answer", { question_id: question.id, question_number: state.step + 1 });
  document.querySelectorAll("[data-option]").forEach((button) => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.option) === index));
    button.disabled = true;
  });
  window.setTimeout(() => {
    if (state.step < questions.length - 1) { state.step += 1; renderQuestion(); }
    else renderCalculating();
  }, 130);
}

function calculateCode() {
  const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  questions.forEach((question) => {
    const answer = state.answers[question.id];
    counts[question.options[answer].letter] += 1;
  });
  return `${counts.E > counts.I ? "E" : "I"}${counts.S > counts.N ? "S" : "N"}${counts.T > counts.F ? "T" : "F"}${counts.J > counts.P ? "J" : "P"}`;
}

function renderCalculating() {
  app.innerHTML = `<section class="screen loading-card" aria-labelledby="loading-title"><p class="eyebrow">OPENING YOUR STORY</p><h2 id="loading-title">동화책이 당신의 업무 장면을 넘겨보는 중…</h2><div class="loading-dots" aria-hidden="true"><span></span><span></span><span></span></div></section>`;
  focusMain();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => { state.code = calculateCode(); persistResult(); renderResult(); }, reduced ? 50 : 850);
}

function toggleEnergy(code) {
  return `${code[0] === "E" ? "I" : "E"}${code.slice(1)}`;
}

function persistResult() {
  const url = new URL(window.location.href);
  url.hash = `world=${state.code}`;
  window.history.replaceState(null, "", url);
}

function restoreResult() {
  const code = new URLSearchParams(window.location.hash.slice(1)).get("world");
  if (!code || !results[code]) return false;
  state.code = code;
  renderResult({ trackCompletion: false });
  trackEvent("world_result_restore");
  return true;
}

function relationCard(label, code) {
  const item = results[code];
  return `<div class="compatibility-card">
    <span class="sprite-character compatibility-character sprite-${item.sprite}" style="${spriteStyle(item.sprite)}" role="img" aria-label="${escapeHtml(item.name)} 캐릭터"></span>
    <div class="compatibility-copy"><span class="compatibility-label">${label}</span><strong>${escapeHtml(item.name)}</strong></div>
  </div>`;
}

function renderResult({ trackCompletion = true } = {}) {
  const item = results[state.code];
  const fit = toggleEnergy(state.code);
  if (trackCompletion) trackEvent("world_test_complete", { result_key: state.code });
  app.innerHTML = `
    <section class="screen result-screen world-result" style="--world-accent:${item.accent};--world-soft:${item.soft};--result-accent:${item.accent};--result-soft:${item.soft}" aria-labelledby="result-title">
      <header class="result-hero">
        <p class="eyebrow">당신이 성과 내는 세계관은</p>
        <span class="sprite-character world-result-character sprite-${item.sprite}" style="${spriteStyle(item.sprite)}" role="img" aria-label="${escapeHtml(item.name)} 캐릭터"></span>
        <h1 class="result-name" id="result-title" tabindex="-1">${escapeHtml(item.name)}</h1>
        <p class="catchphrase">“${escapeHtml(item.tagline)}”</p>
        <div class="world-keywords">${item.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}</div>
      </header>
      <article class="result-section"><h3>이 세계에서 나는</h3><p>${escapeHtml(item.description)}</p></article>
      <article class="result-section"><h3>실력이 나오는 조건</h3><ul class="condition-list">${item.conditions.map((condition) => `<li>${escapeHtml(condition)}</li>`).join("")}</ul></article>
      <article class="result-section"><h3>마법이 풀리는 순간</h3><p>${escapeHtml(item.drain)}</p></article>
      <article class="result-section"><h3>나와 만날 세 가지 인연</h3><div class="compatibility-grid">
        ${relationCard("나랑 찰떡인 유형", fit)}
        ${relationCard("나의 소울메이트", soulmate[state.code])}
        ${relationCard("친구로만 지내요 우리", friendOnly[state.code])}
      </div></article>
      <div class="result-actions"><button class="primary-button" type="button" id="save-card">결과 이미지 저장</button><button class="text-button restart-button" type="button" id="restart">↻ 다시 해보기</button></div>
      <a class="back-test-link" href="index.html">‘나의 다음 직업 찾기’도 해보기 →</a>
      <p class="disclaimer world-disclaimer">재미를 위한 자체 업무환경 테스트예요. 공식 MBTI 검사나 과학적 궁합 진단이 아니에요.</p>
    </section>`;
  document.querySelector("#save-card").addEventListener("click", downloadResultCard);
  document.querySelector("#restart").addEventListener("click", restart);
  focusMain();
  document.querySelector("#result-title").focus({ preventScroll: true });
}

function restart() {
  trackEvent("world_test_restart", { result_key: state.code || "none" });
  state.step = 0; state.answers = {}; state.code = null;
  const url = new URL(window.location.href); url.hash = ""; window.history.replaceState(null, "", url);
  renderIntro();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url;
  });
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath(); context.roundRect(x, y, width, height, radius); context.fill();
}

function wrapCenteredText(context, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const characters = [...text];
  const lines = []; let line = "";
  characters.forEach((character) => {
    const candidate = line + character;
    if (context.measureText(candidate).width > maxWidth && line) { lines.push(line); line = character; }
    else line = candidate;
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((value, index) => context.fillText(value, x, y + index * lineHeight));
  return Math.min(lines.length, maxLines);
}

function drawSpriteCell(context, image, index, x, y, size) {
  const sourceWidth = image.width / 4;
  const sourceHeight = image.height / 4;
  const column = index % 4;
  const row = Math.floor(index / 4);
  context.drawImage(
    image,
    column * sourceWidth,
    row * sourceHeight,
    sourceWidth,
    sourceHeight,
    x,
    y,
    size,
    size,
  );
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("이미지를 만들지 못했습니다.")), "image/png"));
}

function isMobileDevice() {
  return navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isKakaoInAppBrowser() { return /KAKAOTALK/i.test(navigator.userAgent); }

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.hidden = true;
  document.body.append(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  showToast("결과 이미지를 저장했어요.");
}

function showImageSavePreview(blob, item) {
  const url = URL.createObjectURL(blob);
  const kakao = isKakaoInAppBrowser();
  const dialog = document.createElement("div");
  dialog.className = "image-save-dialog"; dialog.setAttribute("role", "dialog"); dialog.setAttribute("aria-modal", "true");
  dialog.innerHTML = `<div class="image-save-panel"><div class="image-save-heading"><div><h2>${kakao ? "카카오톡에서는 다른 브라우저로 열어주세요" : "이미지를 길게 눌러 저장하세요"}</h2><p>${kakao ? "우측 하단의 ⋮ 버튼을 누르고 ‘다른 브라우저로 열기’를 선택하세요. 현재 결과가 그대로 이어집니다." : "메뉴가 나타나면 ‘사진에 저장’ 또는 ‘이미지 저장’을 선택하세요."}</p></div><button class="image-save-close" type="button" aria-label="닫기">×</button></div><img src="${url}" alt="${escapeHtml(item.name)} 결과 카드 저장용 이미지" /></div>`;
  document.body.append(dialog);
  const close = () => { dialog.remove(); URL.revokeObjectURL(url); document.querySelector("#save-card")?.focus(); };
  dialog.querySelector(".image-save-close").addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  dialog.querySelector(".image-save-close").focus();
}

async function saveResultImage(blob, item) {
  const filename = `${state.code}.png`;
  let file = null;
  try { file = new File([blob], filename, { type: "image/png" }); } catch (error) { /* Older browser */ }
  if (isMobileDevice() && file && typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: item.name }); return; }
    catch (error) { if (error.name === "AbortError") return; }
  }
  if (isMobileDevice()) showImageSavePreview(blob, item);
  else downloadBlob(blob, filename);
}

async function downloadResultCard() {
  const item = results[state.code];
  trackEvent("world_result_image_save", { result_key: state.code });
  const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1350;
  const context = canvas.getContext("2d");
  try {
    await document.fonts.ready;
    const image = await loadImage(spritePath);
    context.fillStyle = "#fffaf0"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = item.soft; roundedRect(context, 70, 64, 940, 1222, 72);
    context.textAlign = "center"; context.fillStyle = item.accent;
    context.font = '700 28px "Hakgyoansim Dunggeunmiso Web", system-ui, sans-serif';
    context.fillText("내가 성과 내는 세계관", 540, 128);
    drawSpriteCell(context, image, item.sprite, 280, 155, 520);
    context.fillStyle = "#292725";
    context.font = '700 60px "Hakgyoansim Dunggeunmiso Web", system-ui, sans-serif';
    const titleLines = wrapCenteredText(context, item.name, 540, 700, 850, 72, 2);
    const taglineY = 700 + titleLines * 72 + 25;
    context.font = "700 27px system-ui, sans-serif";
    wrapCenteredText(context, `“${item.tagline}”`, 540, taglineY, 800, 40, 2);
    const relationY = 900;
    const relationItems = [
      ["나랑 찰떡인 유형", toggleEnergy(state.code)],
      ["나의 소울메이트", soulmate[state.code]],
      ["친구로만 지내요 우리", friendOnly[state.code]],
    ];
    relationItems.forEach(([label, code], index) => {
      const x = 104 + index * 294;
      const related = results[code];
      context.fillStyle = index === 1 ? "#fff4dc" : "#ffffff"; roundedRect(context, x, relationY, 272, 230, 28);
      drawSpriteCell(context, image, related.sprite, x + 96, relationY + 14, 80);
      context.fillStyle = "#6f6962"; context.font = "800 19px system-ui, sans-serif"; context.fillText(label, x + 136, relationY + 114);
      context.fillStyle = "#292725"; context.font = '700 23px "Hakgyoansim Dunggeunmiso Web", system-ui, sans-serif';
      wrapCenteredText(context, related.name, x + 136, relationY + 153, 230, 29, 3);
    });
    context.fillStyle = "#777068"; context.font = "500 20px system-ui, sans-serif";
    context.fillText("재미를 위한 자체 업무환경 테스트예요. 공식 성격 검사가 아니에요.", 540, 1234);
    const blob = await canvasToBlob(canvas);
    await saveResultImage(blob, item);
  } catch (error) {
    showToast("이미지 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
  }
}

if (!restoreResult()) renderIntro();
