// 작가 도감: B팀 보물상자에서 만나는 성북의 작가 네 분.
// 작품 문장은 현장 보물상자 카드에서 직접 만나도록 여기에는 넣지 않아요.
export type Writer = {
	id: string;
	name: string;
	years: string;
	role: string;
	who: string;
	seongbuk: string;
	works: string[];
	clue: { label: string; img: string; note: string };
	face: string;
};

export const WRITERS: Writer[] = [
	{
		id: 'yuksa', name: '이육사', years: '1904–1944', role: '시인 · 독립운동가', face: '/hidden/item1.jpg',
		who: '본명은 이원록이에요. 독립운동을 하다 감옥에 갇혔을 때 받은 수인 번호에서 ‘육사’라는 이름을 지었어요.',
		seongbuk: '1939년부터 3년쯤 성북구 종암동에 살면서 시 「청포도」와 「절정」을 썼어요. 지금 종암동에는 ‘문화공간 이육사’가 있어요.',
		works: ['「청포도」', '「광야」', '「절정」'],
		clue: { label: '청포도', img: '/hidden/item5.jpg', note: '종암동 집에서 쓴 시 「청포도」' }
	},
	{
		id: 'manhae', name: '한용운', years: '1879–1944', role: '시인 · 스님 · 독립운동가', face: '/hidden/item2.jpg',
		who: '호는 만해예요. 1919년 3·1 운동 때 독립선언서에 이름을 올린 민족대표 33인 중 한 사람이에요.',
		seongbuk: '성북동 ‘심우장’에서 살았어요. 조선총독부 건물을 보기 싫어서 집을 북쪽으로 앉혔대요. 심우장은 ‘소를 찾는 집’이라는 뜻이에요.',
		works: ['『님의 침묵』'],
		clue: { label: '소', img: '/hidden/item6.jpg', note: '‘소를 찾는 집’ 심우장' }
	},
	{
		id: 'wanseo', name: '박완서', years: '1931–2011', role: '소설가', face: '/hidden/item3.jpg',
		who: '마흔 살 무렵 첫 소설 『나목』으로 작가가 되었어요. 어린이를 위한 동화 『옥상의 민들레꽃』도 썼어요.',
		seongbuk: '마지막 장편소설 『그 남자네 집』은 성북구 돈암동 안감천 변이 배경이에요.',
		works: ['『그 많던 싱아는 누가 다 먹었을까』', '『그 남자네 집』', '『옥상의 민들레꽃』'],
		clue: { label: '민들레', img: '/hidden/item7.jpg', note: '동화 『옥상의 민들레꽃』' }
	},
	{
		id: 'kyungrim', name: '신경림', years: '1936–2024', role: '시인', face: '/hidden/item4.jpg',
		who: '1956년 시 「갈대」로 시인이 되었어요. 시장 사람들, 농사짓는 사람들처럼 평범한 이웃의 삶을 시로 썼어요.',
		seongbuk: '성북구 정릉동에서 30년 동안 살았어요. 「가난한 사랑 노래」도 정릉에서 쓴 시예요.',
		works: ['「갈대」', '「농무」', '「가난한 사랑 노래」'],
		clue: { label: '갈대', img: '/hidden/item8.jpg', note: '시인이 된 첫 시 「갈대」' }
	}
];
