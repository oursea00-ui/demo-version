// 임시 목업 데이터. 실제 데이터 스키마가 정해지면 교체한다.

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

export type Prediction = {
  notice: Notice;
  /** 모델별 예측 예가율 (%) */
  modelRates: number[];
  /** 실제 개찰 여부 */
  opened: boolean;
  /** 실제 예가율 (%) — 개찰 전이면 null */
  actualRate: number | null;
  /** 테스트 날짜 (YYYY-MM-DD) */
  testedAt: string;
};

// 서버/클라이언트 렌더 결과가 같도록 고정 시드 난수 사용
function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

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

function buildNotices(count: number): Notice[] {
  const rand = createRandom(20260916);
  return Array.from({ length: count }, (_, i) => {
    const region1 = pick(rand, Object.keys(REGIONS));
    const agency = pick(rand, AGENCIES);
    return {
      id: `n${i + 1}`,
      no: `R26BK${String(1000000 + Math.floor(rand() * 8999999)).padStart(8, "0")}`,
      title: `2026년 ${agency} ${pick(rand, SUBJECTS)}`,
      category: pick(rand, CATEGORIES),
      agency,
      industry1: pick(rand, INDUSTRY1),
      industry2: pick(rand, INDUSTRY2),
      region1,
      region2: pick(rand, REGIONS[region1]),
      basePrice: Math.round((20_000_000 + rand() * 880_000_000) / 1000) * 1000,
      openDate: addDays("2026-09-17", Math.floor(rand() * 28)),
    };
  });
}

function buildPredictions(notices: Notice[]): Prediction[] {
  const rand = createRandom(7);
  return notices.map((notice) => {
    const center = 99 + rand() * 2.5;
    const opened = rand() > 0.35;
    return {
      notice,
      modelRates: MODELS.map(() => round2(center + (rand() - 0.5) * 1.2)),
      opened,
      actualRate: opened ? round2(center + (rand() - 0.5) * 1.6) : null,
      testedAt: addDays("2026-08-01", Math.floor(rand() * 45)),
    };
  });
}

export const notices = buildNotices(100);
export const predictions = buildPredictions(notices);

export function formatWon(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function formatRate(n: number | null) {
  return n === null ? "-" : `${n.toFixed(2)}%`;
}
