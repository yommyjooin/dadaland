import art from './art.json';

function svgPath(svg: string) {
	const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
	const d = /d="([^"]+)"/.exec(svg);
	return { w: Number(vb?.[1] ?? 100), h: Number(vb?.[2] ?? 100), path: new Path2D(d?.[1] ?? '') };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
	// 어절(띄어쓰기) 단위로 줄바꿈해서 단어가 중간에 끊기지 않게 해요.
	const lines: string[] = [];
	let cur = '';
	for (const w of text.split(' ')) {
		const t = cur ? `${cur} ${w}` : w;
		if (ctx.measureText(t).width > maxW && cur) {
			lines.push(cur);
			cur = w;
		} else cur = t;
	}
	if (cur) lines.push(cur);
	return lines;
}

/** 1080×1350 신입 탐정 임명장을 그려요. */
export async function drawCertificate(canvas: HTMLCanvasElement, name: string, no: number | null) {
	await Promise.all([
		document.fonts.load('100px Hanna11'),
		document.fonts.load('40px Barunpen'),
		document.fonts.load('bold 40px Barunpen')
	]);
	const W = 1080, H = 1350;
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext('2d')!;
	const ink = '#3a2318', brown = '#6b3f22', gold = '#b8862b';

	// 종이
	const g = ctx.createRadialGradient(W / 2, H * 0.42, 100, W / 2, H / 2, H * 0.75);
	g.addColorStop(0, '#fbf3df');
	g.addColorStop(1, '#e6cf9f');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, W, H);
	let seed = name.length * 97 + (no ?? 7);
	const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
	for (let i = 0; i < 2600; i++) {
		ctx.fillStyle = `rgba(110,72,30,${rnd() * 0.08})`;
		ctx.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2.5, 1 + rnd() * 2.5);
	}
	// 테두리
	ctx.strokeStyle = brown;
	ctx.lineWidth = 10;
	ctx.strokeRect(40, 40, W - 80, H - 80);
	ctx.lineWidth = 2;
	ctx.setLineDash([10, 8]);
	ctx.strokeRect(64, 64, W - 128, H - 128);
	ctx.setLineDash([]);

	ctx.textAlign = 'center';
	ctx.fillStyle = brown;
	ctx.font = 'bold 34px Barunpen';
	ctx.fillText('다다탐정사무소 장위지부  ★', W / 2, 150);

	// 돋보기
	ctx.save();
	ctx.translate(W / 2 - 24, 232);
	ctx.fillStyle = 'rgba(190,222,235,0.7)';
	ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fill();
	ctx.strokeStyle = brown; ctx.lineWidth = 13; ctx.stroke();
	ctx.rotate(Math.PI / 4);
	ctx.fillStyle = gold; ctx.fillRect(52, -10, 18, 20);
	ctx.fillStyle = brown; ctx.beginPath(); ctx.roundRect(68, -12, 58, 24, 10); ctx.fill();
	ctx.restore();

	ctx.fillStyle = ink;
	ctx.font = '128px Hanna11';
	ctx.fillText('임 명 장', W / 2, 452);

	ctx.fillStyle = gold;
	ctx.font = 'bold 44px Barunpen';
	ctx.fillText(no ? `신입 탐정 제 ${no}호` : '신입 탐정', W / 2, 536);

	ctx.fillStyle = ink;
	ctx.font = '104px Hanna11';
	ctx.fillText(name, W / 2, 676);
	const nw = Math.max(320, ctx.measureText(name).width + 80);
	ctx.strokeStyle = ink; ctx.lineWidth = 3;
	ctx.beginPath(); ctx.moveTo(W / 2 - nw / 2, 704); ctx.lineTo(W / 2 + nw / 2, 704); ctx.stroke();

	ctx.font = '40px Barunpen';
	const body = '위 탐정은 다다랜드에서 사라진 마을 이름과 작가들의 잃어버린 보물을 찾는 두 가지 사건을 훌륭하게 해결하였기에, 다다탐정사무소 장위지부의 신입 탐정으로 임명합니다.';
	wrap(ctx, body, 800).forEach((l, i) => ctx.fillText(l, W / 2, 790 + i * 58));

	ctx.font = 'bold 38px Barunpen';
	ctx.fillText('2026년 10월 31일', W / 2, 1040);
	ctx.font = 'bold 42px Barunpen';
	ctx.fillText('다다탐정사무소 장위지부장', W / 2 - 40, 1150);

	// 직인
	ctx.save();
	ctx.translate(W / 2 + 250, 1136);
	ctx.rotate(-0.2);
	ctx.strokeStyle = 'rgba(179,38,30,0.85)'; ctx.lineWidth = 6;
	ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.stroke();
	ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.stroke();
	ctx.fillStyle = 'rgba(179,38,30,0.85)';
	ctx.font = '34px Hanna11';
	ctx.fillText('다다', 0, -4);
	ctx.fillText('탐정', 0, 32);
	ctx.restore();

	// 탐정 캐릭터 (수첩 그림을 벡터로 딴 것)
	const det = svgPath((art as Record<string, string>).det);
	const s = 200 / det.w;
	ctx.save();
	ctx.translate(96, H - 96 - det.h * s);
	ctx.scale(s, s);
	ctx.fillStyle = ink;
	ctx.fill(det.path, 'evenodd');
	ctx.restore();
}
