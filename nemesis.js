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
  window.gtag("config", GA_MEASUREMENT_ID, { page_title: document.title, page_path: window.location.pathname });
} else {
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
}

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

const questions = [
  { id: "q01_chat", prompt: "단체 채팅방이 조용하다.\n약속 장소를 정해야 한다면?", options: [
    { label: "일단 후보를 던지고 사람들을 불러낸다", letter: "E" },
    { label: "생각을 정리한 뒤 필요한 말만 남긴다", letter: "I" },
  ]},
  { id: "q02_trip", prompt: "친구들과 여행을 왔는데 계획이 비었다.\n내가 먼저 찾는 것은?", options: [
    { label: "지금 갈 수 있는 장소와 운영 시간", letter: "S" },
    { label: "오늘을 특별하게 만들 새로운 가능성", letter: "N" },
  ]},
  { id: "q03_upset", prompt: "친구가 속상한 일을 털어놓는다.\n내 반응에 가까운 것은?", options: [
    { label: "무엇이 문제였는지 함께 정리한다", letter: "T" },
    { label: "지금 어떤 마음인지 충분히 들어준다", letter: "F" },
  ]},
  { id: "q04_change", prompt: "만나기 한 시간 전, 약속이 바뀌었다.\n머릿속 첫 반응은?", options: [
    { label: "새 시간과 장소부터 확실히 정한다", letter: "J" },
    { label: "좋아, 바뀐 상황에서 재밌는 걸 찾는다", letter: "P" },
  ]},
  { id: "q05_conflict", prompt: "가까운 사람과 묘하게 어색해졌다.\n나는 보통 어떻게 할까?", options: [
    { label: "분위기가 더 이상해지기 전에 말을 꺼낸다", letter: "E" },
    { label: "혼자 마음을 정리한 뒤 대화할 때를 고른다", letter: "I" },
  ]},
  { id: "q06_repeat", prompt: "같은 갈등이 세 번째 반복됐다.\n내 눈에 먼저 보이는 것은?", options: [
    { label: "매번 실제로 벌어진 행동과 약속", letter: "S" },
    { label: "반복을 만드는 관계의 숨은 패턴", letter: "N" },
  ]},
  { id: "q07_advice", prompt: "누군가 고민 상담 뒤 조언을 구한다.\n나는 어느 쪽에 가까울까?", options: [
    { label: "현실적으로 가장 나은 선택을 말한다", letter: "T" },
    { label: "그 사람이 감당할 수 있는 선택을 찾는다", letter: "F" },
  ]},
  { id: "q08_group", prompt: "여럿이 모였는데 정하는 것마다 흐지부지된다.\n나는 어떻게 움직일까?", options: [
    { label: "선택지를 줄이고 결론을 낸다", letter: "J" },
    { label: "조금 더 두고 자연스럽게 흘러가 본다", letter: "P" },
  ]},
  { id: "q09_party", prompt: "아는 사람이 거의 없는 모임에 왔다.\n나에게 편한 시작은?", options: [
    { label: "먼저 말을 걸며 분위기에 들어간다", letter: "E" },
    { label: "한두 사람을 천천히 살펴보다 가까워진다", letter: "I" },
  ]},
  { id: "q10_gift", prompt: "가까운 사람에게 깜짝 선물을 준비한다.\n내 선택 기준은?", options: [
    { label: "평소 필요해 보였던 실용적인 물건", letter: "S" },
    { label: "둘만의 의미가 생길 뜻밖의 물건", letter: "N" },
  ]},
  { id: "q11_apology", prompt: "상대가 사과했지만 변명도 길다.\n내가 중요하게 보는 것은?", options: [
    { label: "무엇을 잘못했고 어떻게 바꿀지", letter: "T" },
    { label: "진심으로 내 마음을 이해했는지", letter: "F" },
  ]},
  { id: "q12_weekend", prompt: "모처럼 모두의 주말이 비었다.\n더 마음에 드는 제안은?", options: [
    { label: "시간과 동선을 미리 정한 확실한 계획", letter: "J" },
    { label: "그날 기분에 따라 정하는 열린 계획", letter: "P" },
  ]},
];

const types = {
  INTJ: { name: "탑 꼭대기에서 왕국을 설계하는 마법사", sprite: 0, accent: "#8f78ad", soft: "#f1ebf7" },
  INTP: { name: "시계탑의 수수께끼를 푸는 연구가", sprite: 1, accent: "#70839a", soft: "#eaf0f5" },
  ENTJ: { name: "잠든 왕국을 깨우는 원정대장", sprite: 2, accent: "#b96855", soft: "#f8e9e4" },
  ENTP: { name: "램프의 세 가지 소원을 흥정하는 꾀쟁이", sprite: 3, accent: "#c39135", soft: "#fbf0d8" },
  INFJ: { name: "저주받은 성의 마음을 읽는 예언가", sprite: 4, accent: "#8b719b", soft: "#f1eaf4" },
  INFP: { name: "별빛을 모아 이야기를 쓰는 몽상가", sprite: 5, accent: "#5e7192", soft: "#e8edf5" },
  ENFJ: { name: "길 잃은 일행을 이끄는 숲속 안내자", sprite: 6, accent: "#718652", soft: "#edf2e5" },
  ENFP: { name: "토끼굴에 먼저 뛰어드는 탐험가", sprite: 7, accent: "#6f9ab7", soft: "#e7f1f6" },
  ISTJ: { name: "벽돌집을 끝까지 완성한 셋째 돼지", sprite: 8, accent: "#b96f55", soft: "#f7e9e1" },
  ISFJ: { name: "일곱 친구의 아침을 챙기는 숲속 살림꾼", sprite: 9, accent: "#7f9667", soft: "#edf3e8" },
  ESTJ: { name: "자정 전에 호박마차를 출발시키는 총감독", sprite: 10, accent: "#cf8c3b", soft: "#fbefd9" },
  ESFJ: { name: "동물 친구들과 잔치를 여는 숲속 주인공", sprite: 11, accent: "#c76f8b", soft: "#f8e8ee" },
  ISTP: { name: "나무인형을 뚝딱 고치는 오두막 장인", sprite: 12, accent: "#588b8a", soft: "#e4f1ef" },
  ISFP: { name: "파도 위에서 자기 노래를 찾는 인어", sprite: 13, accent: "#62a5ae", soft: "#e2f4f4" },
  ESTP: { name: "장화를 신고 판을 뒤집는 모험가", sprite: 14, accent: "#477a61", soft: "#e4f0e9" },
  ESFP: { name: "유리구두 무도회를 접수한 파티 주인공", sprite: 15, accent: "#d87882", soft: "#fae8ea" },
};

const profiles = {
  INTJ: { title: "혼자 결론 내리고 통보하는 탑 위의 설계자", tagline: "이미 세 수 앞까지 봤는데, 왜 처음부터 설명해야 하죠?", mode: "함께 헤매는 시간을 줄이려 혼자 충분히 검토한 결론부터 꺼내요. 설명과 의논이 빠지면 상대는 함께 정할 일을 통보받았다고 느껴요.", drains: "ESFP", drainsReason: "즉흥적인 감정과 현장 분위기로 계획이 계속 바뀌면 통제력을 잃은 기분이 들어요.", drainedBy: "ENFP", drainedReason: "가능성을 꺼내는 족족 현실성부터 검증해 ENFP의 신나는 출발을 얼어붙게 만들 수 있어요.", collision: "“일단 해보자!”와 “왜 해야 하죠?”가 같은 방에 들어왔습니다." },
  INTP: { title: "모든 대화를 반박 가능한 가설로 만드는 연구가", tagline: "그 말도 맞을 수는 있는데, 정확히는 아니에요.", mode: "감정보다 논리의 빈틈이 먼저 보여 대화가 끝나기 전에 토론을 다시 시작해요.", drains: "ESFJ", drainsReason: "모두의 기분과 참여를 계속 확인하는 분위기가 생각할 틈을 빼앗는 것처럼 느껴져요.", drainedBy: "ESTJ", drainedReason: "결정을 앞두고 예외와 가능성을 계속 추가해 빠른 결론을 원하는 ESTJ를 지치게 해요.", collision: "한쪽은 답을 기다리고, 다른 쪽은 질문을 하나 더 만들고 있습니다." },
  ENTJ: { title: "사람까지 일정표에 넣는 돌격 원정대장", tagline: "속상한 건 알겠고요. 그래서 다음 행동은 뭔가요?", mode: "관계를 빠르게 개선하려다 상대의 속도와 감정까지 목표처럼 관리해요.", drains: "ISFP", drainsReason: "기준을 설명하기보다 조용히 거리를 두고 자기 방식대로 움직이면 협조하지 않는 것처럼 느끼기 쉬워요.", drainedBy: "INFP", drainedReason: "직설적인 압박과 빠른 결론이 INFP에게는 의견이 아니라 관계 전체의 위협처럼 남을 수 있어요.", collision: "ENTJ는 답과 행동을 재촉하고, ISFP는 자기 마음까지 승인받는 기분이 듭니다." },
  ENTP: { title: "끝난 얘기도 다시 여는 소원 협상가", tagline: "싸우자는 건 아니고, 반대편도 재밌잖아요?", mode: "재미있는 논점을 발견하면 상대가 이미 지쳤다는 신호도 토론의 일부로 받아들여요.", drains: "ISFJ", drainsReason: "익숙한 방식과 관계의 안정을 우선하면 가능성을 막는 벽처럼 느껴져요.", drainedBy: "INFJ", drainedReason: "민감한 가치와 속마음까지 논쟁거리로 바꾸면 INFJ가 안전하지 않다고 느낄 수 있어요.", collision: "ENTP는 아이디어를 던졌고, INFJ는 마음이 던져졌다고 느낍니다." },
  INFJ: { title: "말하지 않은 속뜻까지 판결하는 예언가", tagline: "괜찮다고 했지만, 정말 괜찮은 건 아니잖아요.", mode: "관계를 깊이 이해하려다 내 해석을 상대의 진짜 속마음으로 확신해요. 상대가 아니라고 설명해도 숨기는 이유부터 찾으면, 이해받기보다 판결받는 기분을 줄 수 있어요.", drains: "ESTP", drainsReason: "생각보다 행동이 앞서고 감정을 가볍게 넘기면 관계가 거칠게 소모되는 느낌을 받아요.", drainedBy: "ENTP", drainedReason: "평범한 말에서도 의미와 의도를 찾아내 ENTP에게 끝없는 심층 면담처럼 느껴질 수 있어요.", collision: "한쪽은 그냥 한 말이고, 다른 쪽은 그 말의 3막까지 해석했습니다." },
  INFP: { title: "상처받으면 이야기 밖으로 사라지는 몽상가", tagline: "괜찮아요. 정말로요. 이제 조금 멀리 있을게요.", mode: "소중한 마음을 더 다치게 하고 싶지 않아 혼자 정리할 시간을 가져요. 그런데 무엇이 아팠는지, 언제 돌아올지 말하지 않으면 상대는 해명할 기회도 없이 관계가 닫혔다고 느껴요.", drains: "ENTJ", drainsReason: "정답과 실행을 앞세운 압박이 감정을 무시당했다는 상처로 오래 남기 쉬워요.", drainedBy: "ESTJ", drainedReason: "속마음을 말하지 않은 채 멀어지면 ESTJ는 해결 기준을 찾지 못해 답답해져요.", collision: "ENTJ는 왜 대답이 없는지 모르고, INFP는 이미 너무 많은 대답을 들었습니다." },
  ENFJ: { title: "너를 위해서라며 끝까지 설득하는 숲속 안내자", tagline: "강요는 아니야. 네가 잘됐으면 해서 한 번만 더 말할게.", mode: "내가 옳고 이게 상대를 위한 길이라고 확신할 때, 거절도 아직 설득이 부족하다는 뜻으로 받아들여요. 도와주고 싶은 마음이 커질수록 상대가 다른 길을 고를 여지는 줄어들어요.", drains: "ISTP", drainsReason: "함께 풀어보려는 제안을 짧게 끊고 혼자 처리하면, 내 진심을 밀어내는 것처럼 느껴 설득을 더 이어가고 싶어져요.", drainedBy: "INTP", drainedReason: "INTP가 스스로 따져보고 다른 결론을 내렸는데도 좋은 뜻이라며 설득을 이어가면, 동의할 때까지 대화가 끝나지 않는 기분을 줄 수 있어요.", collision: "ENFJ는 좋은 길을 알려줬다고 생각하고, INTP는 다른 길로 갈 자유를 찾습니다." },
  ENFP: { title: "새 길을 열고 뒷정리는 잊는 토끼굴 탐험가", tagline: "계획은 바뀌었지만 더 재밌어졌잖아!", mode: "새로운 가능성에 들뜨면 이미 합의한 일정과 상대의 에너지 잔량을 잊어요.", drains: "ISTJ", drainsReason: "정해진 방식과 계획을 지키라는 요구가 관계의 숨통을 막는 것처럼 느껴져요.", drainedBy: "ISFJ", drainedReason: "계획 변경과 감정의 파도가 반복되면 ISFJ가 뒤처리를 혼자 맡은 기분이 들어요.", collision: "ENFP는 모험을 시작했고, ISFJ는 모두의 충전기를 챙기고 있습니다." },
  ISTJ: { title: "규정집으로 성문을 잠그는 셋째 돼지", tagline: "지난번에도 이렇게 하기로 했습니다.", mode: "약속과 사실을 지키려다 상황이 바뀌어도 예외를 허용하지 않는 사람처럼 보여요.", drains: "ENFP", drainsReason: "그때그때 달라지는 약속과 즉흥적인 선택이 신뢰를 흔드는 일처럼 느껴져요.", drainedBy: "ENTP", drainedReason: "이미 합의한 기준을 반복해서 확인하면 ENTP는 가능성이 봉쇄됐다고 느껴요.", collision: "ISTJ는 약속을 기억하고, ENTP는 그 약속을 업데이트하려 합니다." },
  ISFJ: { title: "괜찮다 해놓고 조용히 장부에 적는 살림꾼", tagline: "아니에요, 괜찮아요. 다만 기억은 할게요.", mode: "사이를 어색하게 만들기 싫어 불편함을 참으면서도, 내가 챙긴 만큼 알아주길 바라요. 말하지 않은 기대가 서운함으로 쌓이면 상대는 괜찮다던 일로 뒤늦게 청구서를 받은 기분이 들어요.", drains: "ENTP", drainsReason: "예측하기 어려운 논쟁과 변화가 관계의 안전선을 계속 흔들어요.", drainedBy: "ESTP", drainedReason: "직접 말하지 않은 기대가 쌓이면 ESTP는 갑자기 벌점을 받은 기분이 들어요.", collision: "ISFJ는 세 번 참았고, ESTP는 첫 번째 경고도 못 들었습니다." },
  ESTJ: { title: "감정에도 마감 시간을 거는 호박마차 총감독", tagline: "서운한 건 알겠는데, 오늘 안에 풀 수 있죠?", mode: "관계의 혼란을 빨리 정리하려다 상대의 감정 회복 속도까지 재촉해요.", drains: "INFP", drainsReason: "속마음을 바로 말하지 않고 결정을 미루면 해결 의지가 없는 것처럼 보여요.", drainedBy: "ISFP", drainedReason: "기준과 결론을 강하게 요구하면 ISFP가 취향과 감정을 심사받는 기분이 들어요.", collision: "ESTJ는 해결 일정을 잡고, ISFP는 마음의 문을 잠급니다." },
  ESFJ: { title: "모두의 참여를 의무로 만드는 잔치 주인공", tagline: "우리 사이인데 이 정도는 같이 해야 하는 거 아니야?", mode: "함께하고 싶은 마음이 커질수록 연락과 반응을 애정의 증거처럼 확인해요.", drains: "INTP", drainsReason: "감정 표현과 연락이 적으면 관계에 관심이 없는 것처럼 느끼기 쉬워요.", drainedBy: "ISTP", drainedReason: "반응과 설명을 자주 요구하면 ISTP는 혼자 숨 돌릴 공간이 없다고 느껴요.", collision: "ESFJ는 답장을 기다리고, ISTP는 답장을 생각하지 않고 있습니다." },
  ISTP: { title: "설명 없이 고치고 대화도 종료하는 오두막 장인", tagline: "문제는 해결됐는데, 더 얘기해야 하나요?", mode: "말보다 행동으로 도와주는 게 낫다고 생각해 문제를 처리하고 대화를 끝내요. 상대가 원한 게 해결보다 이해였을 때는, 일은 끝났어도 마음은 그대로 남아요.", drains: "ENFJ", drainsReason: "나를 위한 일이라며 거절한 제안을 계속 설득하면, 내 선택을 존중받지 못하고 붙잡힌 기분이 들어요.", drainedBy: "ESFJ", drainedReason: "짧은 반응과 혼자만의 시간이 ESFJ에게는 무관심과 거리두기로 읽힐 수 있어요.", collision: "ISTP는 수리를 끝냈고, ESFJ는 아직 대화를 시작하지도 못했습니다." },
  ISFP: { title: "싫다는 말 대신 파도 아래 숨는 인어", tagline: "아무거나 좋아. 나는 조금 조용히 있을게.", mode: "내 취향과 선택을 지키고 싶지만 거칠게 부딪히기는 싫어서, 일단 맞장구친 뒤 혼자 다른 길로 가요. 상대는 합의했다고 믿었다가 뒤늦게 거절을 알아차려요.", drains: "ENTJ", drainsReason: "강한 말과 빠른 결론이 내 마음을 밀어내는 힘처럼 느껴져요.", drainedBy: "ESTJ", drainedReason: "기준을 말하지 않고 거리를 두면 ESTJ는 무엇을 고쳐야 할지 몰라 초조해져요.", collision: "ENTJ는 대답을 재촉하고, ISFP는 더 깊은 물속으로 들어갑니다." },
  ESTP: { title: "일단 저지르고 모두를 현장에 끌어들이는 모험가", tagline: "여기까지 왔는데 그냥 해보면 되잖아!", mode: "지금의 재미와 해결에 집중해 상대가 준비할 시간과 감정의 여운을 건너뛰어요.", drains: "INFJ", drainsReason: "행동마다 의미와 감정을 오래 확인하면 발이 묶인 듯 답답해져요.", drainedBy: "ISFJ", drainedReason: "갑작스러운 변경과 강한 농담이 ISFJ의 안전감과 신뢰를 소모시켜요.", collision: "ESTP는 이미 출발했고, ISFJ는 출발한다는 말을 방금 들었습니다." },
  ESFP: { title: "분위기로 모든 결정을 덮는 무도회 주인공", tagline: "일단 즐겁게 놀고, 심각한 얘기는 나중에 하자!", mode: "불편한 순간을 재미로 넘기려다 진지한 대화가 필요한 상대를 혼자 남겨요.", drains: "INTJ", drainsReason: "반응이 적고 계획만 따지는 태도에서 차갑고 평가받는 느낌을 받아요.", drainedBy: "INFJ", drainedReason: "무거운 감정을 빠르게 환기하려 하면 INFJ는 진심이 가볍게 취급됐다고 느껴요.", collision: "ESFP는 분위기를 살렸고, INFJ는 대화가 사라졌다고 느낍니다." },
};

const state = { step: 0, answers: {}, code: null, locked: false };
const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

function trackEvent(name, parameters = {}) {
  if (!analyticsEnabled || typeof window.gtag !== "function") return;
  window.gtag("event", name, { test_id: "relationship_villain", ...parameters });
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

function characterImage(code, className, label = profiles[code].title) {
  return `<img class="nemesis-character-image ${className}" src="assets/nemesis/${code}.png?v=20261106-villains1" alt="${escapeHtml(label)} 캐릭터" draggable="false" />`;
}

function renderIntro() {
  app.innerHTML = `
    <section class="screen hero nemesis-hero" aria-labelledby="intro-title">
      <p class="eyebrow">RELATIONSHIP VILLAIN TEST</p>
      <img class="villain-intro-art" src="assets/nemesis_intro_group.png?v=20261106-intro1" alt="문 뒤에 숨는 몽상가와 원정대장, 맑은 눈의 안내자가 모인 빌런들" draggable="false" />
      <div class="hero-heading">
        <h1 id="intro-title"><span>내 인간관계의</span><span>빌런 찾기</span></h1>
        <p class="hero-copy">나를 유독 지치게 하는 사람은 누구일까?<br />그리고 나는 누구 앞에서 빌런이 될까?</p>
      </div>
      <div class="meta-pills" aria-label="테스트 정보"><span class="pill">12문항</span><span class="pill">약 2분</span><span class="pill">16가지 빌런 모드</span></div>
      <button class="primary-button" type="button" id="start-button">빌런 관계도 열어보기</button>
      <a class="series-link" href="world.html">‘내가 성과 내는 세계관’도 보기 →</a>
      <p class="disclaimer nemesis-disclaimer">재미를 위한 자체 인간관계 테스트예요.<br />공식 MBTI 검사나 과학적 궁합 진단이 아니에요.</p>
    </section>`;
  document.querySelector("#start-button").addEventListener("click", () => {
    trackEvent("nemesis_test_start", { question_count: questions.length });
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
    <section class="screen question-screen nemesis-question" aria-labelledby="question-title">
      <div class="topbar"><div class="progress-label"><span>관계 속 빌런 추적 중</span><span>${state.step + 1} / ${questions.length}</span></div><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><div class="progress-fill" style="width:${progress}%"></div></div></div>
      <article class="question-card"><p class="question-kicker">관계 장면 ${state.step + 1}</p><h2 id="question-title" tabindex="-1">${escapeHtml(question.prompt)}</h2></article>
      <div class="options" role="group" aria-labelledby="question-title">${question.options.map((option, index) => `<button class="option-button" type="button" data-option="${index}" aria-pressed="${selected === index}">${escapeHtml(option.label)}</button>`).join("")}</div>
      <p class="question-hint">😈 착한 사람처럼 보이는 답 말고, 실제 내 반응에 가까운 쪽을 골라요</p>
      <div class="question-actions"><button class="text-button" type="button" id="back-button">← ${state.step === 0 ? "처음으로" : "이전 장면"}</button></div>
    </section>`;
  document.querySelectorAll("[data-option]").forEach((button) => button.addEventListener("click", () => chooseOption(question, Number(button.dataset.option))));
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
  trackEvent("nemesis_question_answer", { question_id: question.id, question_number: state.step + 1 });
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
  questions.forEach((question) => { counts[question.options[state.answers[question.id]].letter] += 1; });
  return `${counts.E > counts.I ? "E" : "I"}${counts.S > counts.N ? "S" : "N"}${counts.T > counts.F ? "T" : "F"}${counts.J > counts.P ? "J" : "P"}`;
}

function renderCalculating() {
  app.innerHTML = `<section class="screen loading-card" aria-labelledby="loading-title"><p class="eyebrow">VILLAIN MATCHING</p><h2 id="loading-title">관계 서랍에서 빌런 기록을 찾는 중…</h2><div class="loading-dots" aria-hidden="true"><span></span><span></span><span></span></div></section>`;
  focusMain();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => { state.code = calculateCode(); persistResult(); renderResult(); }, reduced ? 50 : 750);
}

function persistResult() {
  const url = new URL(window.location.href);
  url.hash = `villain=${state.code}`;
  window.history.replaceState(null, "", url);
}

function restoreResult() {
  const code = new URLSearchParams(window.location.hash.slice(1)).get("villain");
  if (!code || !types[code]) return false;
  state.code = code;
  renderResult({ trackCompletion: false });
  trackEvent("nemesis_result_restore", { result_key: code });
  return true;
}

function villainCard(label, code, reason) {
  const profile = profiles[code];
  return `<div class="villain-card">${characterImage(code, "villain-character")}<div><small>${label}</small><strong>${escapeHtml(profile.title)}</strong><p>${escapeHtml(reason)}</p></div></div>`;
}

function renderResult({ trackCompletion = true } = {}) {
  const type = types[state.code];
  const profile = profiles[state.code];
  if (trackCompletion) trackEvent("nemesis_test_complete", { result_key: state.code });
  app.innerHTML = `
    <section class="screen result-screen nemesis-result" style="--result-accent:${type.accent};--result-soft:${type.soft}" aria-labelledby="result-title">
      <header class="result-hero">
        <p class="eyebrow">내 안의 빌런 모드는</p>
        <span class="nemesis-result-character-frame">${characterImage(state.code, "nemesis-result-character")}</span>
        <h1 class="result-name" id="result-title" tabindex="-1">${escapeHtml(profile.title)}</h1>
        <p class="catchphrase">“${escapeHtml(profile.tagline)}”</p>
      </header>
      <article class="result-section villain-section"><h3>내가 빌런이 되는 순간</h3><p>${escapeHtml(profile.mode)}</p></article>
      <article class="result-section villain-section"><h3>엇갈린 빌런 관계도</h3><div class="villain-pair">${villainCard("내 멘탈을 흔드는 빌런", profile.drains, profile.drainsReason)}${villainCard("내가 빌런이 되는 상대", profile.drainedBy, profile.drainedReason)}</div></article>
      <article class="result-section collision-card"><h3>둘이 만나면 벌어지는 장면</h3><p>“${escapeHtml(profile.collision)}”</p></article>
      <div class="nemesis-actions"><button class="primary-button" type="button" id="share-result">결과 링크 공유하기</button><button class="text-button restart-button" type="button" id="restart">↻ 다시 해보기</button></div>
      <a class="series-link" href="world.html">‘내가 성과 내는 세계관’도 보기 →</a>
      <p class="disclaimer nemesis-disclaimer">관계에서 나타나는 경향을 장난스럽게 표현한 결과예요.<br />사람의 가치나 실제 관계를 단정하지 않아요.</p>
    </section>`;
  document.querySelector("#share-result").addEventListener("click", shareResult);
  document.querySelector("#restart").addEventListener("click", restart);
  focusMain();
  document.querySelector("#result-title").focus({ preventScroll: true });
}

async function shareResult() {
  const profile = profiles[state.code];
  const shareUrl = new URL(window.location.href);
  shareUrl.search = "";
  shareUrl.hash = `villain=${state.code}`;
  const data = { title: "내 인간관계의 빌런 찾기", text: `내 빌런 모드는 ‘${profile.title}’`, url: shareUrl.href };
  trackEvent("nemesis_result_share", { result_key: state.code });
  try {
    if (navigator.share) { await navigator.share(data); return; }
    await navigator.clipboard.writeText(`${data.text}\n${data.url}`);
    showToast("결과 링크를 복사했어요.");
  } catch (error) {
    if (error && error.name === "AbortError") return;
    showToast("주소창의 링크를 복사해주세요.");
  }
}

function restart() {
  trackEvent("nemesis_test_restart", { result_key: state.code || "none" });
  state.step = 0; state.answers = {}; state.code = null;
  const url = new URL(window.location.href); url.hash = ""; window.history.replaceState(null, "", url);
  renderIntro();
}

if (!restoreResult()) renderIntro();
