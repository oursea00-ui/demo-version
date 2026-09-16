// 임시 목업 데이터. 크롤링/모델 데이터 스키마가 정해지면 교체한다.

export type Notice = {
  id: string;
  /** 공고번호 */
  no: string;
  /** 용역명 */
  title: string;
  /** 용역 구분 */
  category: string;
  /** 발주처 */
  agency: string;
  /** 업종 */
  industry1: string;
  /** 업종2 */
  industry2: string;
  /** 지역1 */
  region1: string;
  /** 지역2 */
  region2: string;
  /** 기초금액 (원) */
  basePrice: number;
  /** 개찰일 (YYYY-MM-DD) */
  openDate: string;
};

export const MODELS = ["모델 1", "모델 2", "모델 3", "모델 4"] as const;

/** 실제 예가율에 영향을 준 항목 */
export type Factor = {
  label: string;
  /** 항목 설명 */
  detail: string;
  /** 기준(100%) 대비 기여도 (%p) */
  impact: number;
};

export type NoticeResult = {
  notice: Notice;
  /** 모델별 예측 예가율 (%) — MODELS 순서 */
  modelRates: number[];
  /** 실제 예가율 (%) — 개찰 전이면 null */
  actualRate: number | null;
  /** 실제 예가율 항목별 분석 — 개찰 전이면 null */
  factors: Factor[] | null;
};

// 서버/클라이언트 렌더 결과가 같도록 고정 시드 난수 사용
function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const TODAY = "2026-09-16";
const CATEGORIES = ["일반용역", "기술용역", "학술연구용역", "정보화사업"];
const AGENCIES = ["조달청", "서울특별시", "한국도로공사", "경기도교육청", "한국토지주택공사", "국방부"];
const INDUSTRY1 = ["엔지니어링", "소프트웨어", "시설관리", "건축설계", "청소", "경비"];
const INDUSTRY2 = ["토목", "전기", "통신", "기계", "조경"];
const REGIONS: Record<string, string[]> = {
  서울: ["강남구", "종로구", "마포구"],
  경기: ["수원시", "성남시", "고양시"],
  부산: ["해안구", "부산진구", "동래구"],
  대전: ["유성구", "서구", "중구"],
  광주: ["북구", "광산구", "남구"],
  강원: ["춘천시", "원주시", "강릉시"],
};
const SUBJECTS = [
  "청사 시설물 유지관리 용역",
  "정보시스템 고도화 사업",
  "도로 안전점검 용역",
  "공공건축물 설계 용역",
  "환경미화 위탁 용역",
  "통합 경비 용역",
  "노후 관로 정밀조사 용역",
  "홈페이지 운영 유지보수",
];

function pick<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)];
}

function addDays(base: string, days: number) {
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function buildFactors(rand: () => number, notice: Notice, actualRate: number): Factor[] {
  const factors: Factor[] = [
    { label: "발주처 이력", detail: `${notice.agency} 최근 동일 유형 공고의 평균 예가율`, impact: 0 },
    { label: "업종 특성", detail: `${notice.industry1} · ${notice.industry2} 업종 평균 대비 편차`, impact: 0 },
    { label: "지역 경쟁도", detail: `${notice.region1} ${notice.region2} 지역 참여 업체 수 기준`, impact: 0 },
    { label: "기초금액 구간", detail: `${formatWon(notice.basePrice)} 구간의 예가율 분포`, impact: 0 },
    { label: "복수예비가격 추첨", detail: "추첨된 예비가격 4개의 분포에 따른 편차", impact: 0 },
  ];
  // 항목별 기여도의 합이 (실제 예가율 - 100)이 되도록 맞춘다
  let rest = actualRate - 100;
  factors.forEach((f, i) => {
    f.impact = i === factors.length - 1 ? round2(rest) : round2((rand() - 0.5) * 1.2);
    rest -= f.impact;
  });
  return factors;
}

function buildResults(count: number): NoticeResult[] {
  const rand = createRandom(20260916);
  return Array.from({ length: count }, (_, i) => {
    const region1 = pick(rand, Object.keys(REGIONS));
    const agency = pick(rand, AGENCIES);
    const opened = rand() > 0.35;
    const notice: Notice = {
      id: `n${i + 1}`,
      no: `R26BK${String(Math.floor(rand() * 99999999)).padStart(8, "0")}`,
      title: `2026년 ${agency} ${pick(rand, SUBJECTS)}`,
      category: pick(rand, CATEGORIES),
      agency,
      industry1: pick(rand, INDUSTRY1),
      industry2: pick(rand, INDUSTRY2),
      region1,
      region2: pick(rand, REGIONS[region1]),
      basePrice: Math.round((20_000_000 + rand() * 880_000_000) / 1000) * 1000,
      // 개찰 완료 공고는 과거, 미개찰 공고는 미래 개찰일
      openDate: opened
        ? addDays(TODAY, -1 - Math.floor(rand() * 45))
        : addDays(TODAY, 1 + Math.floor(rand() * 28)),
    };
    const center = 99 + rand() * 2.5;
    const modelRates = MODELS.map(() => round2(center + (rand() - 0.5) * 1.2));
    const actualRate = opened ? round2(center + (rand() - 0.5) * 1.6) : null;
    return {
      notice,
      modelRates,
      actualRate,
      factors: actualRate === null ? null : buildFactors(rand, notice, actualRate),
    };
  }).sort((a, b) => b.notice.openDate.localeCompare(a.notice.openDate));
}

export const results = buildResults(100);

/** 실제 예가율과 가장 가까운 모델의 인덱스 — 개찰 전이면 null */
export function closestModelIndex({ modelRates, actualRate }: NoticeResult) {
  if (actualRate === null) return null;
  let best = 0;
  modelRates.forEach((rate, i) => {
    if (Math.abs(rate - actualRate) < Math.abs(modelRates[best] - actualRate)) best = i;
  });
  return best;
}

/** 오차(%p)를 0~100 유사도 점수로 환산 — 오차 2%p 이상이면 0 */
export function similarityScore(modelRate: number, actualRate: number) {
  return Math.max(0, Math.round(100 - (Math.abs(modelRate - actualRate) / 2) * 100));
}

export function formatWon(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function formatRate(n: number | null) {
  return n === null ? "-" : `${n.toFixed(2)}%`;
}

export function formatDiff(n: number) {
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%p`;
}
