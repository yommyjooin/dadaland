import type { Status } from './live.svelte';

/** 참여자에게 보여줄 부스 순서와 설명 (운영용 대본과 분리) */
export const PUBLIC_BOOTHS: { key: string; title: string; desc: string }[] = [
	{ key: '가', title: '신입 탐정 접수처', desc: '탐정수첩을 받는 곳' },
	{ key: '나', title: '탐정 사진 찍기', desc: '영수증 사진기로 찰칵' },
	{ key: '다', title: '탐정수첩 꾸미기', desc: '이름 쓰고 사진 붙이기' },
	{ key: '라', title: '사라진 성북구의 지명', desc: 'A팀 · 지도와 단서로 찾기' },
	{ key: '마', title: '사라진 마을 이름', desc: 'A팀 · 세 명이 함께 추리' },
	{ key: '바', title: '작가들의 편지', desc: 'B팀 · 주사위로 장소 정하기' },
	{ key: '사', title: '스쿱마켓', desc: 'B팀 · 국자로 열쇠 찾기' },
	{ key: '아', title: '볼풀마당', desc: 'B팀 · 공 바다에서 열쇠 찾기' },
	{ key: '자', title: '보물상자', desc: 'B팀 · 열쇠로 상자 열기' },
	{ key: '차', title: '비즈 책갈피', desc: 'B팀 · 나만의 보물 만들기' },
	{ key: '카', title: '탐정 임명식', desc: '두 사건을 해결하면 여기로!' }
];

export const PUBLIC_STATUS: Record<Status, { label: string; tone: 'ok' | 'busy' }> = {
	ok: { label: '바로 할 수 있어요', tone: 'ok' },
	busy: { label: '조금 기다려요', tone: 'busy' },
	help: { label: '조금 기다려요', tone: 'busy' }
};

export const MISSION = [
	{ id: 'join', label: '신입 탐정 접수하고 탐정수첩 받기', where: '가' },
	{ id: 'photo', label: '영수증 사진기로 탐정 사진 찍기', where: '나' },
	{ id: 'book', label: '탐정수첩에 이름 쓰고 사진 붙이기', where: '다' },
	{ id: 'a1', label: 'A팀 · 사라진 성북구의 지명 찾기', where: '라' },
	{ id: 'a2', label: 'A팀 · 사라진 마을 이름 추리하기', where: '마' },
	{ id: 'b1', label: 'B팀 · 작가들의 편지 읽고 주사위 굴리기', where: '바' },
	{ id: 'b2', label: 'B팀 · 열쇠 찾기 (스쿱마켓 또는 볼풀마당)', where: '사' },
	{ id: 'b3', label: 'B팀 · 보물상자 열고 비즈 책갈피 만들기', where: '자' },
	{ id: 'end', label: '탐정 임명식에서 신입 탐정 되기', where: '카' }
] as const;

export type Q = { q: string; options: string[]; answer: number; why: string };
export const QUIZ: Q[] = [
	{ q: '탐정이 작은 단서를 크게 보려고 쓰는 도구는?', options: ['국자', '돋보기', '주사위', '볼풀공'], answer: 1, why: '돋보기로 보면 작은 글씨와 흔적도 잘 보여요.' },
	{ q: '신입 탐정 수칙 첫 번째는 무엇일까요?', options: ['빨리 뛰기', '큰 소리 내기', '천천히 움직이기', '혼자 다니기'], answer: 2, why: '탐정은 뛰지 않아요! 주변을 살피며 안전하게 움직여요.' },
	{ q: '다다랜드가 열리는 이곳은 서울의 어느 구일까요?', options: ['마포구', '성북구', '강남구', '송파구'], answer: 1, why: '다다랜드는 서울 성북구에서 열려요.' },
	{ q: '셜록 홈즈가 쓴 것으로 유명한, 앞뒤로 챙이 달린 체크무늬 모자는?', options: ['사냥 모자', '야구 모자', '왕관', '헬멧'], answer: 0, why: '앞뒤로 챙이 있는 사냥 모자(디어스토커)예요. 오늘 탐정 그림에도 나와요!' },
	{ q: '다른 탐정이 활동하고 있을 때 신입 탐정은 어떻게 할까요?', options: ['새치기한다', '차례를 기다린다', '도구를 가져간다', '대신 풀어 준다'], answer: 1, why: '수칙 둘! 동료 탐정을 배려하고 차례를 지켜요.' },
	{ q: '작가들의 보물상자를 열려면 무엇이 필요할까요?', options: ['열쇠', '연필', '지도', '스티커'], answer: 0, why: '스쿱마켓이나 볼풀마당에서 열쇠를 찾아 보물상자를 열어요.' },
	{ q: '탐정이 사건을 풀 때 가장 중요한 것은?', options: ['단서를 꼼꼼히 살피기', '아무거나 고르기', '먼저 끝내기', '포기하기'], answer: 0, why: '단서를 꼼꼼히 보고, 왜 그렇게 생각했는지 말할 수 있어야 해요.' },
	{ q: '어려운 일이 생기면 신입 탐정은 누구를 부를까요?', options: ['아무도 안 부른다', '운영요원', '볼풀공', '주사위'], answer: 1, why: '수칙 넷! 도움이 필요하면 운영요원을 불러요.' }
];
